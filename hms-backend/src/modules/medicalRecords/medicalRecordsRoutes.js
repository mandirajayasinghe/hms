const router = require("express").Router();
const ctrl = require("./medicalRecordsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);
router.post("/", rbac("admin", "doctor"), ctrl.create);
router.get("/:id", rbac("admin", "doctor", "nurse"), ctrl.getById);
router.put("/:id", rbac("admin", "doctor"), ctrl.update);

router.post("/:id/prescriptions", rbac("admin", "doctor"), ctrl.addPrescription);
router.get("/patient/:patientId/prescriptions", rbac("admin", "doctor", "pharmacist", "nurse"), ctrl.getPrescriptions);

module.exports = router;