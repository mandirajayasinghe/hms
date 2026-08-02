const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const params = [];
  let query = `
    SELECT ad.*, p.full_name AS patient_name, b.bed_number, w.name AS ward_name
    FROM admissions ad
    JOIN patients p ON p.id = ad.patient_id
    LEFT JOIN beds b ON b.id = ad.bed_id
    LEFT JOIN wards w ON w.id = b.ward_id
    WHERE 1=1`;
  if (status) { params.push(status); query += ` AND ad.status = $${params.length}`; }
  if (type) { params.push(type); query += ` AND ad.admission_type = $${params.length}`; }
  query += " ORDER BY ad.admitted_at DESC";

  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const { patientId, doctorId, bedId, admissionType, notes } = req.body;
  if (!patientId || !admissionType) throw new ApiError(400, "patientId and admissionType required");

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    if (bedId) {
      const bed = await client.query("SELECT is_occupied FROM beds WHERE id = $1 FOR UPDATE", [bedId]);
      if (!bed.rows[0]) throw new ApiError(404, "Bed not found");
      if (bed.rows[0].is_occupied) throw new ApiError(409, "Bed already occupied");
      await client.query("UPDATE beds SET is_occupied = TRUE WHERE id = $1", [bedId]);
    }
    const { rows } = await client.query(
      `INSERT INTO admissions (patient_id, doctor_id, bed_id, admission_type, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [patientId, doctorId, bedId, admissionType, notes]
    );
    await client.query("COMMIT");
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

exports.discharge = asyncHandler(async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE admissions SET status = 'discharged', discharged_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, "Admission not found");
    if (rows[0].bed_id) {
      await client.query("UPDATE beds SET is_occupied = FALSE WHERE id = $1", [rows[0].bed_id]);
    }
    await client.query("COMMIT");
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// ---- Wards & Beds ----
exports.listWards = asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT * FROM wards ORDER BY name");
  res.json({ success: true, data: rows });
});

exports.createWard = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  const { rows } = await db.query(
    "INSERT INTO wards (name, capacity) VALUES ($1,$2) RETURNING *",
    [name, capacity || 0]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.listBeds = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT b.*, w.name AS ward_name FROM beds b JOIN wards w ON w.id = b.ward_id ORDER BY w.name, b.bed_number`
  );
  res.json({ success: true, data: rows });
});

exports.createBed = asyncHandler(async (req, res) => {
  const { wardId, bedNumber } = req.body;
  const { rows } = await db.query(
    "INSERT INTO beds (ward_id, bed_number) VALUES ($1,$2) RETURNING *",
    [wardId, bedNumber]
  );
  res.status(201).json({ success: true, data: rows[0] });
});