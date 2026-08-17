const router = require("express").Router();
const ctrl = require("./doctorsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { registerDoctorSchema } = require("../../validators/staffValidators");

router.use(authenticate);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/register", rbac("admin"), validate(registerDoctorSchema), ctrl.registerDoctor);
router.post("/", rbac("admin"), ctrl.create);
router.put("/:id", rbac("admin"), ctrl.update);
router.delete("/:id", rbac("admin"), ctrl.remove);

router.get("/:id/schedule", ctrl.getSchedule);
router.post("/:id/schedule", rbac("admin", "doctor"), ctrl.setSchedule);

module.exports = router;