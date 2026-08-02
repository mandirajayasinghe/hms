const router = require("express").Router();
const ctrl = require("./labController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);

router.get("/catalog", ctrl.listCatalog);
router.post("/catalog", rbac("admin", "lab_staff"), ctrl.createCatalogItem);

router.get("/", rbac("admin", "doctor", "lab_staff", "nurse"), ctrl.list);
router.post("/", rbac("admin", "doctor"), ctrl.requestTest);
router.patch("/:id/collect-sample", rbac("admin", "lab_staff"), ctrl.collectSample);
router.patch("/:id/result", rbac("admin", "lab_staff"), ctrl.enterResult);
router.patch("/:id/report-ready", rbac("admin", "lab_staff"), ctrl.markReportReady);

module.exports = router;