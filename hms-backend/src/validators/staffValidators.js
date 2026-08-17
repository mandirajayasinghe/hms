const { z } = require("zod");

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerDoctorSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, dots, dashes, underscores"),
  password: strongPassword,
  departmentId: z.union([z.string(), z.number()]).optional().nullable(),
  specialization: z.string().max(150).optional().or(z.literal("")),
  qualification: z.string().max(150).optional().or(z.literal("")),
  consultationFee: z.coerce.number().min(0, "Fee cannot be negative").optional(),
});

const registerEmployeeSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, dots, dashes, underscores"),
  password: strongPassword,
  role: z.enum(["nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]),
  departmentId: z.union([z.string(), z.number()]).optional().nullable(),
  designation: z.string().max(150).optional().or(z.literal("")),
  dateJoined: z.string().optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary cannot be negative").optional().nullable(),
});

module.exports = { registerDoctorSchema, registerEmployeeSchema };