const { z } = require("zod");

const uuid = z.string().uuid("Invalid ID format");

const createAppointmentSchema = z.object({
  patientId: uuid,
  doctorId: uuid,
  scheduledAt: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid date/time")
    .refine((v) => new Date(v) > new Date(), "Appointment must be scheduled in the future"),
  reason: z.string().max(500).optional().or(z.literal("")),
});

const rescheduleAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid date/time")
    .refine((v) => new Date(v) > new Date(), "New time must be in the future"),
});

const updateAppointmentSchema = z.object({
  scheduledAt: z.string().optional(),
  reason: z.string().max(500).optional(),
  status: z
    .enum(["scheduled", "completed", "cancelled", "rescheduled", "no_show"])
    .optional(),
});

module.exports = {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
};