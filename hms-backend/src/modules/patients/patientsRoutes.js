const router = require("express").Router();
const ctrl = require("./patientsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const upload = require("../../middleware/upload");

router.use(authenticate);

router.get("/", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.list);
router.get("/:id", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.getById);
router.post("/", rbac("admin", "receptionist"), ctrl.create);
router.put("/:id", rbac("admin", "receptionist", "nurse"), ctrl.update);
router.delete("/:id", rbac("admin"), ctrl.remove);

router.get("/:id/history", rbac("admin", "doctor", "nurse"), ctrl.medicalHistory);

router.post(
  "/:id/documents",
  rbac("admin", "receptionist", "nurse"),
  upload.single("file"),
  ctrl.uploadDocument
);
router.get("/:id/documents", ctrl.listDocuments);

module.exports = router;