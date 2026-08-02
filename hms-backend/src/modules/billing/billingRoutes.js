const router = require("express").Router();
const ctrl = require("./billingController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);

router.get("/", rbac("admin", "accountant", "receptionist"), ctrl.listInvoices);
router.post("/", rbac("admin", "accountant", "receptionist"), ctrl.createInvoice);
router.get("/:id", rbac("admin", "accountant", "receptionist"), ctrl.getInvoice);
router.post("/:id/payments", rbac("admin", "accountant", "receptionist"), ctrl.recordPayment);

module.exports = router;