const router = require("express").Router();
const ctrl = require("./employeesController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { registerEmployeeSchema } = require("../../validators/staffValidators");

router.use(authenticate, rbac("admin"));

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

router.post("/attendance", ctrl.markAttendance);
router.get("/:id/attendance", ctrl.getAttendance);

router.post("/leaves", ctrl.requestLeave);
router.patch("/leaves/:id", ctrl.decideLeave);
router.get("/leaves", ctrl.listLeaves);

router.post("/register", validate(registerEmployeeSchema), ctrl.registerEmployee);

module.exports = router;