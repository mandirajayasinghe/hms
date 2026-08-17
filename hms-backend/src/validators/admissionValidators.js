const { z } = require("zod");

const createWardSchema = z.object({
  name: z.string().trim().min(2, "Ward name is required").max(100),
  capacity: z.coerce.number().int().min(0, "Capacity cannot be negative").optional(),
});

const createBedSchema = z.object({
  wardId: z.coerce.number().int().positive("Ward is required"),
  bedNumber: z.string().trim().min(1, "Bed number is required").max(20),
});

const createAdmissionSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid().optional().nullable(),
  bedId: z.coerce.number().int().optional().nullable(),
  admissionType: z.enum(["inpatient", "outpatient"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

module.exports = { createWardSchema, createBedSchema, createAdmissionSchema };