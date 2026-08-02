const db = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.patientReport = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) AS total_patients,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_last_30_days
     FROM patients`
  );
  res.json({ success: true, data: rows[0] });
});

exports.appointmentReport = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT status, COUNT(*) AS count FROM appointments GROUP BY status`
  );
  res.json({ success: true, data: rows });
});

exports.revenueReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let query = `SELECT category, SUM(amount) AS total
               FROM invoice_items ii
               JOIN invoices i ON i.id = ii.invoice_id WHERE 1=1`;
  if (from) { params.push(from); query += ` AND i.created_at >= $${params.length}`; }
  if (to) { params.push(to); query += ` AND i.created_at <= $${params.length}`; }
  query += " GROUP BY category";

  const { rows } = await db.query(query, params);
  const totals = await db.query(
    `SELECT SUM(total_amount) AS total_billed, SUM(paid_amount) AS total_collected FROM invoices`
  );
  res.json({ success: true, data: { byCategory: rows, summary: totals.rows[0] } });
});

exports.pharmacyReport = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT name, stock_quantity, reorder_level, expiry_date FROM medicines
     WHERE stock_quantity <= reorder_level OR expiry_date <= NOW() + INTERVAL '30 days'
     ORDER BY stock_quantity ASC`
  );
  res.json({ success: true, data: rows });
});

exports.laboratoryReport = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT status, COUNT(*) AS count FROM lab_test_requests GROUP BY status`
  );
  res.json({ success: true, data: rows });
});

exports.staffReport = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT dep.name AS department, COUNT(e.id) AS employee_count
     FROM employees e LEFT JOIN departments dep ON dep.id = e.department_id
     GROUP BY dep.name`
  );
  res.json({ success: true, data: rows });
});

exports.dashboard = asyncHandler(async (req, res) => {
  const [patients, appointmentsToday, revenue, labPending, pharmacyAlerts] = await Promise.all([
    db.query("SELECT COUNT(*) FROM patients"),
    db.query("SELECT COUNT(*) FROM appointments WHERE scheduled_at::date = CURRENT_DATE"),
    db.query("SELECT COALESCE(SUM(paid_amount),0) AS collected FROM invoices WHERE created_at::date = CURRENT_DATE"),
    db.query("SELECT COUNT(*) FROM lab_test_requests WHERE status != 'report_ready'"),
    db.query("SELECT COUNT(*) FROM medicines WHERE stock_quantity <= reorder_level"),
  ]);
  res.json({
    success: true,
    data: {
      totalPatients: Number(patients.rows[0].count),
      todaysAppointments: Number(appointmentsToday.rows[0].count),
      revenueToday: Number(revenue.rows[0].collected),
      pendingLabRequests: Number(labPending.rows[0].count),
      pharmacyAlerts: Number(pharmacyAlerts.rows[0].count),
    },
  });
});