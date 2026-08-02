const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./modules/auth/authRoutes");
const usersRoutes = require("./modules/users/usersRoutes");
const departmentsRoutes = require("./modules/departments/departmentsRoutes");
const doctorsRoutes = require("./modules/doctors/doctorsRoutes");
const patientsRoutes = require("./modules/patients/patientsRoutes");
const appointmentsRoutes = require("./modules/appointments/appointmentsRoutes");
const admissionsRoutes = require("./modules/admissions/admissionsRoutes");
const medicalRecordsRoutes = require("./modules/medicalRecords/medicalRecordsRoutes");
const labRoutes = require("./modules/laboratory/labRoutes");
const pharmacyRoutes = require("./modules/pharmacy/pharmacyRoutes");
const billingRoutes = require("./modules/billing/billingRoutes");
const employeesRoutes = require("./modules/employees/employeesRoutes");
const reportsRoutes = require("./modules/reports/reportsRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(compression());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true })
);

app.use("/uploads", express.static(path.join(process.cwd(), env.uploadDir)));

app.get("/health", (req, res) => res.json({ success: true, status: "OK" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/admissions", admissionsRoutes);
app.use("/api/medical-records", medicalRecordsRoutes);
app.use("/api/laboratory", labRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/reports", reportsRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);

module.exports = app;