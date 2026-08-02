const bcrypt = require("bcryptjs");
const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new ApiError(400, "Username and password required");

  const { rows } = await db.query(
    `SELECT u.*, r.name AS role_name FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE (u.username = $1 OR u.email = $1) AND u.is_active = TRUE`,
    [username]
  );
  const user = rows[0];
  if (!user) throw new ApiError(401, "Invalid credentials");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const payload = { id: user.id, role: user.role_name, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user.id });

  await db.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);
  await db.query(
    `INSERT INTO audit_logs (user_id, action, entity, details, ip_address)
     VALUES ($1, 'LOGIN', 'users', $2, $3)`,
    [user.id, JSON.stringify({ username }), req.ip]
  );

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      username: user.username,
      role: user.role_name,
    },
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { rows } = await db.query(
    `SELECT u.*, r.name AS role_name FROM users u
     JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [decoded.id]
  );
  const user = rows[0];
  if (!user) throw new ApiError(401, "User not found");

  const accessToken = signAccessToken({ id: user.id, role: user.role_name, email: user.email });
  res.json({ success: true, accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  await db.query(
    `INSERT INTO audit_logs (user_id, action, entity, ip_address) VALUES ($1, 'LOGOUT', 'users', $2)`,
    [req.user.id, req.ip]
  );
  res.json({ success: true, message: "Logged out" });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, "Both passwords required");

  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  const user = rows[0];
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new ApiError(401, "Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, 12);
  await db.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
    hash,
    req.user.id,
  ]);
  res.json({ success: true, message: "Password updated" });
});

exports.me = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.full_name, u.email, u.username, r.name AS role
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [req.user.id]
  );
  res.json({ success: true, data: rows[0] });
});