const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

exports.listCatalog = asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT * FROM lab_tests_catalog ORDER BY name");
  res.json({ success: true, data: rows });
});

exports.createCatalogItem = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await db.query(
    "INSERT INTO lab_tests_catalog (name, price) VALUES ($1,$2) RETURNING *",
    [name, price || 0]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.requestTest = asyncHandler(async (req, res) => {
  const { patientId, doctorId, testId } = req.body;
  if (!patientId || !testId) throw new ApiError(400, "patientId and testId required");
  const { rows } = await db.query(
    `INSERT INTO lab_test_requests (patient_id, doctor_id, test_id, requested_by)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [patientId, doctorId, testId, req.user.id]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

exports.list = asyncHandler(async (req, res) => {
  const { status, patientId } = req.query;
  const params = [];
  let query = `
    SELECT lr.*, p.full_name AS patient_name, t.name AS test_name, t.price
    FROM lab_test_requests lr
    JOIN patients p ON p.id = lr.patient_id
    JOIN lab_tests_catalog t ON t.id = lr.test_id
    WHERE 1=1`;
  if (status) { params.push(status); query += ` AND lr.status = $${params.length}`; }
  if (patientId) { params.push(patientId); query += ` AND lr.patient_id = $${params.length}`; }
  query += " ORDER BY lr.created_at DESC";

  const { rows } = await db.query(query, params);
  res.json({ success: true, data: rows });
});

exports.collectSample = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `UPDATE lab_test_requests SET status = 'sample_collected', sample_collected_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Request not found");
  res.json({ success: true, data: rows[0] });
});

exports.enterResult = asyncHandler(async (req, res) => {
  const { result, reportPath } = req.body;
  const { rows } = await db.query(
    `UPDATE lab_test_requests SET
       status = 'result_entered', result = $1, report_path = $2,
       result_entered_at = NOW(), processed_by = $3
     WHERE id = $4 RETURNING *`,
    [result, reportPath, req.user.id, req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Request not found");
  res.json({ success: true, data: rows[0] });
});

exports.markReportReady = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `UPDATE lab_test_requests SET status = 'report_ready' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw new ApiError(404, "Request not found");
  res.json({ success: true, data: rows[0] });
});