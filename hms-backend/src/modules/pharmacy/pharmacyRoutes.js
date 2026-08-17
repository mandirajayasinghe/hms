const router = require("express").Router();
const ctrl = require("./pharmacyController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { createMedicineSchema, adjustStockSchema } = require("../../validators/pharmacyValidators");

router.use(authenticate);

router.get("/medicines", rbac("admin", "pharmacist", "doctor"), ctrl.listMedicines);
router.post("/medicines", rbac("admin", "pharmacist"), validate(createMedicineSchema), ctrl.createMedicine);
router.put("/medicines/:id", rbac("admin", "pharmacist"), ctrl.updateMedicine);
router.patch("/medicines/:id/stock", rbac("admin", "pharmacist"), validate(adjustStockSchema), ctrl.adjustStock);

router.post("/prescriptions/:id/process", rbac("admin", "pharmacist"), ctrl.processPrescription);

module.exports = router;