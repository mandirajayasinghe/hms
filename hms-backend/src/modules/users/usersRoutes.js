const router = require("express").Router();
const ctrl = require("./usersController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate, rbac("admin"));

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.post("/:id/reset-password", ctrl.resetPassword);
router.delete("/:id", ctrl.remove);

module.exports = router;