const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

function generatePatientCode() {
  return `PT-${Date.now().toString(36).toUpperCase()}`;
}

exports.list = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let query = "SELECT * FROM patients WHERE 1=1";

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (full_name ILIKE $${params.length} OR patient_code ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }
  query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT * FROM patients WHERE id = $1", [req.params.id]);
  if (!rows[0]) throw new ApiError(404, "Patient not found");
  res.json({ success: true, data: rows[0] });
});

exports.create = asyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContact } =
    req.body;
  if (!fullName) throw new ApiError(400, "Full name is required");

  const { rows } = await db.query(
    `INSERT INTO patients
      (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      generatePatientCode(),
      fullName,
      dateOfBirth || null,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      emergencyContact,
      req.user.id,
    ]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.update = asyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContact } =
    req.body;
  const { rows } = await db.query(
    `UPDATE patients SET
       full_name = COALESCE($1, full_name),
       date_of_birth = COALESCE($2, date_of_birth),
       gender = COALESCE($3, gender),
       phone = COALESCE($4, phone),
       email = COALESCE($5, email),
       address = COALESCE($6, address),
       blood_group = COALESCE($7, blood_group),
       emergency_contact = COALESCE($8, emergency_contact),
       updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [fullName, dateOfBirth, gender, phone, email, address, bloodGroup, emergencyContact, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Patient not found");
  res.json({ success: true, data: rows[0] });
});

exports.remove = asyncHandler(async (req, res) => {
  await db.query("DELETE FROM patients WHERE id = $1", [req.params.id]);
  res.json({ success: true, message: "Patient removed" });
});

exports.medicalHistory = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT mr.*, u.full_name AS doctor_name FROM medical_records mr
     LEFT JOIN doctors d ON d.id = mr.doctor_id
     LEFT JOIN users u ON u.id = d.user_id
     WHERE mr.patient_id = $1 ORDER BY mr.record_date DESC`,
    [req.params.id]
  );
  res.json({ success: true, data: rows });
});

// ---- Document uploads ----
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  const { rows } = await db.query(
    `INSERT INTO patient_documents (patient_id, file_name, file_path, file_type, uploaded_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.params.id, req.file.originalname, req.file.path, req.file.mimetype, req.user.id]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.listDocuments = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM patient_documents WHERE patient_id = $1 ORDER BY uploaded_at DESC",
    [req.params.id]
  );
  res.json({ success: true, data: rows });
});