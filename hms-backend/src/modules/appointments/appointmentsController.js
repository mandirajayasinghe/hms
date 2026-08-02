const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const { doctorId, patientId, status, date } = req.query;
  const params = [];
  let query = `
    SELECT a.*, p.full_name AS patient_name, u.full_name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users u ON u.id = d.user_id
    WHERE 1=1`;

  if (doctorId) { params.push(doctorId); query += ` AND a.doctor_id = $${params.length}`; }
  if (patientId) { params.push(patientId); query += ` AND a.patient_id = $${params.length}`; }
  if (status) { params.push(status); query += ` AND a.status = $${params.length}`; }
  if (date) { params.push(date); query += ` AND a.scheduled_at::date = $${params.length}`; }

  query += " ORDER BY a.scheduled_at DESC";
  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const { patientId, doctorId, scheduledAt, reason } = req.body;
  if (!patientId || !doctorId || !scheduledAt)
    throw new ApiError(400, "patientId, doctorId, scheduledAt are required");

  // conflict check
  const conflict = await db.query(
    `SELECT id FROM appointments WHERE doctor_id = $1 AND scheduled_at = $2 AND status = 'scheduled'`,
    [doctorId, scheduledAt]
  );
  if (conflict.rows[0]) throw new ApiError(409, "Doctor already has an appointment at this time");

  const { rows } = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, reason, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [patientId, doctorId, scheduledAt, reason, req.user.id]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { scheduledAt, reason, status } = req.body;
  const { rows } = await db.query(
    `UPDATE appointments SET
       scheduled_at = COALESCE($1, scheduled_at),
       reason = COALESCE($2, reason),
       status = COALESCE($3, status),
       updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [scheduledAt, reason, status, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Appointment not found");
  res.json({ success: true, data: rows[0] });
});

exports.reschedule = asyncHandler(async (req, res) => {
  const { scheduledAt } = req.body;
  if (!scheduledAt) throw new ApiError(400, "New scheduledAt required");
  const { rows } = await db.query(
    `UPDATE appointments SET scheduled_at = $1, status = 'rescheduled', updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [scheduledAt, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Appointment not found");
  res.json({ success: true, data: rows[0] });
});

exports.cancel = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Appointment not found");
  res.json({ success: true, data: rows[0] });
});