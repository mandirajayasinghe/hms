const router = require("express").Router();
const ctrl = require("./doctorsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", rbac("admin"), ctrl.create);
router.put("/:id", rbac("admin"), ctrl.update);
router.delete("/:id", rbac("admin"), ctrl.remove);

router.get("/:id/schedule", ctrl.getSchedule);
router.post("/:id/schedule", rbac("admin", "doctor"), ctrl.setSchedule);

module.exports = router;