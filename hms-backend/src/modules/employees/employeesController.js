const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const bcrypt = require("bcryptjs");

exports.list = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT e.*, u.full_name, u.email, dep.name AS department
     FROM employees e JOIN users u ON u.id = e.user_id
     LEFT JOIN departments dep ON dep.id = e.department_id
     ORDER BY u.full_name`
  );
  res.json({ success: true, data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const { userId, departmentId, designation, dateJoined, salary } = req.body;
  if (!userId) throw new ApiError(400, "userId is required (create user account first)");
  const { rows } = await db.query(
    `INSERT INTO employees (user_id, department_id, designation, date_joined, salary)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, departmentId, designation, dateJoined || null, salary || null]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { departmentId, designation, salary } = req.body;
  const { rows } = await db.query(
    `UPDATE employees SET
       department_id = COALESCE($1, department_id),
       designation = COALESCE($2, designation),
       salary = COALESCE($3, salary)
     WHERE id = $4 RETURNING *`,
    [departmentId, designation, salary, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Employee not found");
  res.json({ success: true, data: rows[0] });
});

// ---- Attendance ----
exports.markAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, status, checkIn, checkOut } = req.body;
  const { rows } = await db.query(
    `INSERT INTO attendance (employee_id, date, status, check_in, check_out)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (employee_id, date) DO UPDATE SET
       status = EXCLUDED.status, check_in = EXCLUDED.check_in, check_out = EXCLUDED.check_out
     RETURNING *`,
    [employeeId, date, status || "present", checkIn || null, checkOut || null]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getAttendance = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM attendance WHERE employee_id = $1 ORDER BY date DESC",
    [req.params.id]
  );
  res.json({ success: true, data: rows });
});

// ---- Leave records ----
exports.requestLeave = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;
  const { rows } = await db.query(
    `INSERT INTO leave_records (employee_id, start_date, end_date, reason)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [employeeId, startDate, endDate, reason]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.decideLeave = asyncHandler(async (req, res) => {
  const { status } = req.body; // approved | rejected
  const { rows } = await db.query(
    "UPDATE leave_records SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Leave record not found");
  res.json({ success: true, data: rows[0] });
});

exports.listLeaves = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT lr.*, u.full_name FROM leave_records lr
     JOIN employees e ON e.id = lr.employee_id
     JOIN users u ON u.id = e.user_id
     ORDER BY lr.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

exports.registerEmployee = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role, departmentId, designation, dateJoined, salary } = req.body;
  if (!fullName || !email || !username || !password || !role) {
    throw new ApiError(400, "fullName, email, username, password, and role are required");
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const roleRes = await client.query("SELECT id FROM roles WHERE name = $1", [role]);
    if (!roleRes.rows[0]) throw new ApiError(400, "Invalid role");

    const hash = await bcrypt.hash(password, 12);
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, username, password_hash, role_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, username`,
      [fullName, email, username, hash, roleRes.rows[0].id]
    );

    const empRes = await client.query(
      `INSERT INTO employees (user_id, department_id, designation, date_joined, salary)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userRes.rows[0].id, departmentId || null, designation, dateJoined || null, salary || null]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      data: { ...empRes.rows[0], full_name: userRes.rows[0].full_name, email: userRes.rows[0].email },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});