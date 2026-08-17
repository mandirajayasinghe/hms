const router = require("express").Router();
const ctrl = require("./departmentsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { createDepartmentSchema, updateDepartmentSchema } = require("../../validators/departmentValidators");

router.use(authenticate);
router.get("/", ctrl.list);
router.post("/", rbac("admin"), validate(createDepartmentSchema), ctrl.create);
router.put("/:id", rbac("admin"), validate(updateDepartmentSchema), ctrl.update);
router.delete("/:id", rbac("admin"), ctrl.remove);

module.exports = router;



