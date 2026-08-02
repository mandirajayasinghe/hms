const router = require("express").Router();
const ctrl = require("./departmentsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);
router.get("/", ctrl.list);
router.post("/", rbac("admin"), ctrl.create);
router.put("/:id", rbac("admin"), ctrl.update);
router.delete("/:id", rbac("admin"), ctrl.remove);

module.exports = router;