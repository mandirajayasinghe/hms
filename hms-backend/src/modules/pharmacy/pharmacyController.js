const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.listMedicines = asyncHandler(async (req, res) => {
  const { search, lowStock, expiringSoon } = req.query;
  const params = [];
  let query = "SELECT * FROM medicines WHERE 1=1";
  if (search) { params.push(`%${search}%`); query += ` AND name ILIKE $${params.length}`; }
  if (lowStock === "true") query += " AND stock_quantity <= reorder_level";
  if (expiringSoon === "true") query += " AND expiry_date <= NOW() + INTERVAL '30 days'";
  query += " ORDER BY name";

  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.createMedicine = asyncHandler(async (req, res) => {
  const { name, manufacturer, unitPrice, stockQuantity, reorderLevel, expiryDate } = req.body;
  if (!name) throw new ApiError(400, "Medicine name is required");
  const { rows } = await db.query(
    `INSERT INTO medicines (name, manufacturer, unit_price, stock_quantity, reorder_level, expiry_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, manufacturer, unitPrice || 0, stockQuantity || 0, reorderLevel || 10, expiryDate || null]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.updateMedicine = asyncHandler(async (req, res) => {
  const { name, manufacturer, unitPrice, reorderLevel, expiryDate } = req.body;
  const { rows } = await db.query(
    `UPDATE medicines SET
       name = COALESCE($1, name), manufacturer = COALESCE($2, manufacturer),
       unit_price = COALESCE($3, unit_price), reorder_level = COALESCE($4, reorder_level),
       expiry_date = COALESCE($5, expiry_date), updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [name, manufacturer, unitPrice, reorderLevel, expiryDate, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Medicine not found");
  res.json({ success: true, data: rows[0] });
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const { changeQty, reason } = req.body;
  if (!changeQty) throw new ApiError(400, "changeQty is required");

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const med = await client.query("SELECT * FROM medicines WHERE id = $1 FOR UPDATE", [req.params.id]);
    if (!med.rows[0]) throw new ApiError(404, "Medicine not found");

    const newQty = med.rows[0].stock_quantity + Number(changeQty);
    if (newQty < 0) throw new ApiError(400, "Insufficient stock");

    await client.query("UPDATE medicines SET stock_quantity = $1, updated_at = NOW() WHERE id = $2", [
      newQty,
      req.params.id,
    ]);
    await client.query(
      `INSERT INTO stock_transactions (medicine_id, change_qty, reason, performed_by)
       VALUES ($1,$2,$3,$4)`,
      [req.params.id, changeQty, reason, req.user.id]
    );
    await client.query("COMMIT");
    res.json({ success: true, message: "Stock updated", newQuantity: newQty });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// ---- Prescription processing / dispensing ----
exports.processPrescription = asyncHandler(async (req, res) => {
  const { id } = req.params; // prescription id
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const items = await client.query(
      "SELECT * FROM prescription_items WHERE prescription_id = $1",
      [id]
    );
    for (const item of items.rows) {
      if (!item.medicine_id) continue;
      const med = await client.query("SELECT * FROM medicines WHERE id = $1 FOR UPDATE", [
        item.medicine_id,
      ]);
      if (med.rows[0] && med.rows[0].stock_quantity > 0) {
        await client.query(
          "UPDATE medicines SET stock_quantity = stock_quantity - 1 WHERE id = $1",
          [item.medicine_id]
        );
        await client.query(
          `INSERT INTO stock_transactions (medicine_id, change_qty, reason, performed_by)
           VALUES ($1, -1, 'Dispensed for prescription', $2)`,
          [item.medicine_id, req.user.id]
        );
      }
    }
    await client.query(
      "UPDATE prescriptions SET status = 'dispensed' WHERE id = $1",
      [id]
    );
    await client.query("COMMIT");
    res.json({ success: true, message: "Prescription processed and dispensed" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});