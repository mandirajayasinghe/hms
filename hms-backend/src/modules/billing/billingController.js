const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

function generateInvoiceNumber() {
  return `INV-${Date.now().toString(36).toUpperCase()}`;
}

exports.createInvoice = asyncHandler(async (req, res) => {
  const { patientId, items } = req.body; // items: [{category, description, amount, referenceId}]
  if (!patientId || !Array.isArray(items) || items.length === 0)
    throw new ApiError(400, "patientId and items[] required");

  const total = items.reduce((sum, i) => sum + Number(i.amount), 0);

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const inv = await client.query(
      `INSERT INTO invoices (invoice_number, patient_id, total_amount, created_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [generateInvoiceNumber(), patientId, total, req.user.id]
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, category, description, amount, reference_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [inv.rows[0].id, item.category, item.description, item.amount, item.referenceId || null]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ success: true, data: inv.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

exports.getInvoice = asyncHandler(async (req, res) => {
  const inv = await db.query("SELECT * FROM invoices WHERE id = $1", [req.params.id]);
  if (!inv.rows[0]) throw new ApiError(404, "Invoice not found");
  const items = await db.query("SELECT * FROM invoice_items WHERE invoice_id = $1", [req.params.id]);
  const payments = await db.query("SELECT * FROM payments WHERE invoice_id = $1 ORDER BY paid_at", [
    req.params.id,
  ]);
  res.json({ success: true, data: { ...inv.rows[0], items: items.rows, payments: payments.rows } });
});

exports.listInvoices = asyncHandler(async (req, res) => {
  const { patientId, status } = req.query;
  const params = [];
  let query = "SELECT * FROM invoices WHERE 1=1";
  if (patientId) { params.push(patientId); query += ` AND patient_id = $${params.length}`; }
  if (status) { params.push(status); query += ` AND status = $${params.length}`; }
  query += " ORDER BY created_at DESC";
  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;
  if (!amount) throw new ApiError(400, "amount is required");

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const inv = await client.query("SELECT * FROM invoices WHERE id = $1 FOR UPDATE", [req.params.id]);
    if (!inv.rows[0]) throw new ApiError(404, "Invoice not found");

    const newPaid = Number(inv.rows[0].paid_amount) + Number(amount);
    const status =
      newPaid >= Number(inv.rows[0].total_amount) ? "paid" : newPaid > 0 ? "partial" : "unpaid";

    await client.query(
      `INSERT INTO payments (invoice_id, amount, method, received_by) VALUES ($1,$2,$3,$4)`,
      [req.params.id, amount, method || "cash", req.user.id]
    );
    await client.query("UPDATE invoices SET paid_amount = $1, status = $2 WHERE id = $3", [
      newPaid,
      status,
      req.params.id,
    ]);
    await client.query("COMMIT");
    res.json({ success: true, message: "Payment recorded", status, paidAmount: newPaid });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});