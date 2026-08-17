const router = require("express").Router();
const ctrl = require("./appointmentsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
} = require("../../validators/appointmentValidators");

router.use(authenticate);
router.get("/", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.list);
router.post("/", rbac("admin", "receptionist"), validate(createAppointmentSchema), ctrl.create);
router.put("/:id", rbac("admin", "receptionist", "doctor"), validate(updateAppointmentSchema), ctrl.update);
router.patch("/:id/reschedule", rbac("admin", "receptionist"), validate(rescheduleAppointmentSchema), ctrl.reschedule);
router.patch("/:id/cancel", rbac("admin", "receptionist"), ctrl.cancel);

module.exports = router;