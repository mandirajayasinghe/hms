const { z } = require("zod");

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const createPatientSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(150),
  dateOfBirth: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date of birth")
    .refine((v) => !v || new Date(v) <= new Date(), "Date of birth cannot be in the future")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
    .or(z.literal("")),
  emergencyContact: z.string().max(150).optional().or(z.literal("")),
});

const updatePatientSchema = createPatientSchema.partial();

module.exports = { createPatientSchema, updatePatientSchema };