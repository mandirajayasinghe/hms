const router = require("express").Router();
const ctrl = require("./admissionsController");
const authenticate = require("../../middleware/auth");
const rbac = require("../../middleware/rbac");
const validate = require("../../middleware/validate");
const { createWardSchema, createBedSchema, createAdmissionSchema } = require("../../validators/admissionValidators");

router.use(authenticate);

router.get("/", rbac("admin", "doctor", "nurse", "receptionist"), ctrl.list);
router.patch("/:id/discharge", rbac("admin", "doctor", "nurse"), ctrl.discharge);

router.get("/wards", ctrl.listWards);
router.get("/beds", ctrl.listBeds);

router.post("/", rbac("admin", "receptionist", "nurse"), validate(createAdmissionSchema), ctrl.create);

router.post("/wards", rbac("admin"), validate(createWardSchema), ctrl.createWard);
router.post("/beds", rbac("admin"), validate(createBedSchema), ctrl.createBed);


module.exports = router;