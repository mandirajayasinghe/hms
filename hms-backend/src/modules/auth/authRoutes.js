const router = require("express").Router();
const ctrl = require("./authController");
const authenticate = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { loginSchema, changePasswordSchema, refreshSchema } = require("../../validators/authValidators");

router.post("/login", validate(loginSchema), ctrl.login);
router.post("/refresh", validate(refreshSchema), ctrl.refresh);
router.post("/logout", authenticate, ctrl.logout);
router.post("/change-password", authenticate, validate(changePasswordSchema), ctrl.changePassword);
router.get("/me", authenticate, ctrl.me);

module.exports = router;