const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const bcrypt = require("bcryptjs");

exports.list = asyncHandler(async (req, res) => {
  const { department, search } = req.query;
  const conditions = [];
  const params = [];

  let query = `
    SELECT d.id, u.full_name, u.email, d.specialization, d.qualification,
           d.consultation_fee, dep.name AS department
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    LEFT JOIN departments dep ON dep.id = d.department_id
    WHERE 1=1`;

  if (department) {
    params.push(department);
    query += ` AND dep.id = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND u.full_name ILIKE $${params.length}`;
  }
  query += " ORDER BY u.full_name";

  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT d.*, u.full_name, u.email, dep.name AS department
     FROM doctors d JOIN users u ON u.id = d.user_id
     LEFT JOIN departments dep ON dep.id = d.department_id
     WHERE d.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Doctor not found");
  res.json({ success: true, data: rows[0] });
});

exports.create = asyncHandler(async (req, res) => {
  const { userId, departmentId, specialization, qualification, consultationFee } = req.body;
  if (!userId) throw new ApiError(400, "userId is required (create user account first)");
  const { rows } = await db.query(
    `INSERT INTO doctors (user_id, department_id, specialization, qualification, consultation_fee)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, departmentId, specialization, qualification, consultationFee || 0]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { departmentId, specialization, qualification, consultationFee } = req.body;
  const { rows } = await db.query(
    `UPDATE doctors SET
       department_id = COALESCE($1, department_id),
       specialization = COALESCE($2, specialization),
       qualification = COALESCE($3, qualification),
       consultation_fee = COALESCE($4, consultation_fee)
     WHERE id = $5 RETURNING *`,
    [departmentId, specialization, qualification, consultationFee, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Doctor not found");
  res.json({ success: true, data: rows[0] });
});

exports.remove = asyncHandler(async (req, res) => {
  await db.query("DELETE FROM doctors WHERE id = $1", [req.params.id]);
  res.json({ success: true, message: "Doctor removed" });
});

// ---- Schedule management ----
exports.setSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime, slotMinutes } = req.body;
  const { rows } = await db.query(
    `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, dayOfWeek, startTime, endTime, slotMinutes || 15]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getSchedule = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM doctor_schedules WHERE doctor_id = $1 ORDER BY day_of_week",
    [req.params.id]
  );
  res.json({ success: true, data: rows });
});

exports.registerDoctor = asyncHandler(async (req, res) => {
  const {
    fullName, email, username, password,
    departmentId, specialization, qualification, consultationFee,
  } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "fullName, email, username, and password are required");
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const roleRes = await client.query("SELECT id FROM roles WHERE name = 'doctor'");
    if (!roleRes.rows[0]) throw new ApiError(500, "Doctor role not seeded");

    const hash = await bcrypt.hash(password, 12);
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, username, password_hash, role_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, username`,
      [fullName, email, username, hash, roleRes.rows[0].id]
    );

    const doctorRes = await client.query(
      `INSERT INTO doctors (user_id, department_id, specialization, qualification, consultation_fee)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userRes.rows[0].id, departmentId || null, specialization, qualification, consultationFee || 0]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      data: { ...doctorRes.rows[0], full_name: userRes.rows[0].full_name, email: userRes.rows[0].email },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});