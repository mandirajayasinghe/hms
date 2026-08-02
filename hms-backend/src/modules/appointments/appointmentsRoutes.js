const router = require("express").Router();
const ctrl = require("./appointmentsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);
router.get("/", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.list);
router.post("/", rbac("admin", "receptionist"), ctrl.create);
router.put("/:id", rbac("admin", "receptionist", "doctor"), ctrl.update);
router.patch("/:id/reschedule", rbac("admin", "receptionist"), ctrl.reschedule);
router.patch("/:id/cancel", rbac("admin", "receptionist"), ctrl.cancel);

module.exports = router;