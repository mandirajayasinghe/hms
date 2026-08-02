const router = require("express").Router();
const ctrl = require("./reportsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate, rbac("admin", "accountant"));

router.get("/dashboard", ctrl.dashboard);
router.get("/patients", ctrl.patientReport);
router.get("/appointments", ctrl.appointmentReport);
router.get("/revenue", ctrl.revenueReport);
router.get("/pharmacy", ctrl.pharmacyReport);
router.get("/laboratory", ctrl.laboratoryReport);
router.get("/staff", ctrl.staffReport);

module.exports = router;