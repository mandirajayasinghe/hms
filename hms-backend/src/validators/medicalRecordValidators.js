const { z } = require("zod");

const uuid = z.string().uuid("Invalid ID format");

const createMedicalRecordSchema = z.object({
  patientId: uuid,
  doctorId: uuid,
  appointmentId: uuid.optional().nullable(),
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(1000),
  treatment: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(1000).optional(),
  treatment: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const prescriptionItemSchema = z.object({
  medicineId: uuid.optional().nullable(),
  dosage: z.string().max(100).optional().or(z.literal("")),
  frequency: z.string().max(100).optional().or(z.literal("")),
  duration: z.string().max(100).optional().or(z.literal("")),
  instructions: z.string().max(500).optional().or(z.literal("")),
});

const addPrescriptionSchema = z.object({
  patientId: uuid,
  doctorId: uuid,
  items: z.array(prescriptionItemSchema).min(1, "At least one prescription item is required"),
});

module.exports = {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  addPrescriptionSchema,
};