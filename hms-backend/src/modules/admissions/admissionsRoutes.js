const router = require("express").Router();
const ctrl = require("./admissionsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");

router.use(authenticate);

router.get("/", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.list);
router.post("/", rbac("admin", "receptionist", "nurse"), ctrl.create);
router.patch("/:id/discharge", rbac("admin", "doctor", "nurse"), ctrl.discharge);

router.get("/wards", ctrl.listWards);
router.post("/wards", rbac("admin"), ctrl.createWard);
router.get("/beds", ctrl.listBeds);
router.post("/beds", rbac("admin"), ctrl.createBed);

module.exports = router;