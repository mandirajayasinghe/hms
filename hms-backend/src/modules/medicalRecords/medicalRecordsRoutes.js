const router = require("express").Router();
const ctrl = require("./medicalRecordsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  addPrescriptionSchema,
} = require("../../validators/medicalRecordValidators");


router.use(authenticate);
router.post("/", rbac("admin", "doctor"), validate(createMedicalRecordSchema), ctrl.create);
router.get("/:id", rbac("admin", "doctor", "nurse"), ctrl.getById);
router.put("/:id", rbac("admin", "doctor"), validate(updateMedicalRecordSchema), ctrl.update);

router.post("/:id/prescriptions", rbac("admin", "doctor"), validate(addPrescriptionSchema), ctrl.addPrescription);
router.get("/patient/:patientId/prescriptions", rbac("admin", "doctor", "pharmacist", "nurse"), ctrl.getPrescriptions);

module.exports = router;