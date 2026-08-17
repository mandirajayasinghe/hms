const router = require("express").Router();
const ctrl = require("./usersController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require("../../validators/userValidators");


router.use(authenticate, rbac("admin"));

router.get("/", ctrl.list);
router.post("/", validate(createUserSchema), ctrl.create);
router.put("/:id", validate(updateUserSchema), ctrl.update);
router.post("/:id/reset-password", validate(resetPasswordSchema), ctrl.resetPassword);
router.delete("/:id", ctrl.remove);

module.exports = router;