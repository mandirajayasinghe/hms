const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT * FROM departments ORDER BY name");
  res.json({ success: true, data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, "Department name required");
  const { rows } = await db.query(
    "INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING *",
    [name, description]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { rows } = await db.query(
    `UPDATE departments SET name = COALESCE($1,name), description = COALESCE($2,description)
     WHERE id = $3 RETURNING *`,
    [name, description, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Department not found");
  res.json({ success: true, data: rows[0] });
});

exports.remove = asyncHandler(async (req, res) => {
  await db.query("DELETE FROM departments WHERE id = $1", [req.params.id]);
  res.json({ success: true, message: "Department removed" });
});