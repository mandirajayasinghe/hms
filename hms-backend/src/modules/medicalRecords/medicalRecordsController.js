const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentId, diagnosis, treatment, notes } = req.body;
  if (!patientId || !doctorId) throw new ApiError(400, "patientId and doctorId are required");

  const { rows } = await db.query(
    `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [patientId, doctorId, appointmentId || null, diagnosis, treatment, notes]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT * FROM medical_records WHERE id = $1", [req.params.id]);
  if (!rows[0]) throw new ApiError(404, "Record not found");
  res.json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { diagnosis, treatment, notes } = req.body;
  const { rows } = await db.query(
    `UPDATE medical_records SET
       diagnosis = COALESCE($1, diagnosis),
       treatment = COALESCE($2, treatment),
       notes = COALESCE($3, notes)
     WHERE id = $4 RETURNING *`,
    [diagnosis, treatment, notes, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Record not found");
  res.json({ success: true, data: rows[0] });
});

// ---- Prescriptions ----
exports.addPrescription = asyncHandler(async (req, res) => {
  const { patientId, doctorId, items } = req.body; // items: [{medicineId, dosage, frequency, duration, instructions}]
  if (!patientId || !doctorId || !Array.isArray(items) || items.length === 0)
    throw new ApiError(400, "patientId, doctorId, and items[] required");

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const presc = await client.query(
      `INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id)
       VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, patientId, doctorId]
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, instructions)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [presc.rows[0].id, item.medicineId, item.dosage, item.frequency, item.duration, item.instructions]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ success: true, data: presc.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

exports.getPrescriptions = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, json_agg(pi.*) AS items
     FROM prescriptions p
     LEFT JOIN prescription_items pi ON pi.prescription_id = p.id
     WHERE p.patient_id = $1
     GROUP BY p.id ORDER BY p.created_at DESC`,
    [req.params.patientId]
  );
  res.json({ success: true, data: rows });
});