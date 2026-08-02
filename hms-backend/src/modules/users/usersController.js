const bcrypt = require("bcryptjs");
const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.full_name, u.email, u.username, u.is_active, r.name AS role, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role } = req.body;
  if (!fullName || !email || !username || !password || !role)
    throw new ApiError(400, "All fields are required");

  const roleRes = await db.query("SELECT id FROM roles WHERE name = $1", [role]);
  if (!roleRes.rows[0]) throw new ApiError(400, "Invalid role");

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await db.query(
    `INSERT INTO users (full_name, email, username, password_hash, role_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, username`,
    [fullName, email, username, hash, roleRes.rows[0].id]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, isActive, role } = req.body;

  let roleId = null;
  if (role) {
    const r = await db.query("SELECT id FROM roles WHERE name = $1", [role]);
    if (!r.rows[0]) throw new ApiError(400, "Invalid role");
    roleId = r.rows[0].id;
  }

  const { rows } = await db.query(
    `UPDATE users SET
       full_name = COALESCE($1, full_name),
       email = COALESCE($2, email),
       is_active = COALESCE($3, is_active),
       role_id = COALESCE($4, role_id),
       updated_at = NOW()
     WHERE id = $5 RETURNING id, full_name, email, is_active`,
    [fullName, email, isActive, roleId, id]
  );
  if (!rows[0]) throw new ApiError(404, "User not found");
  res.json({ success: true, data: rows[0] });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) throw new ApiError(400, "New password required");
  const hash = await bcrypt.hash(newPassword, 12);
  await db.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
    hash,
    id,
  ]);
  res.json({ success: true, message: "Password reset" });
});

exports.remove = asyncHandler(async (req, res) => {
  await db.query("UPDATE users SET is_active = FALSE WHERE id = $1", [req.params.id]);
  res.json({ success: true, message: "User deactivated" });
});