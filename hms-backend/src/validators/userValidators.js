const { z } = require("zod");

const roles = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"];

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, dots, dashes, underscores"),
  password: strongPassword,
  role: z.enum(roles, { errorMap: () => ({ message: "Select a valid role" }) }),
});

const updateUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(150).optional(),
  email: z.string().trim().email("Enter a valid email address").optional(),
  isActive: z.boolean().optional(),
  role: z.enum(roles).optional(),
});

const resetPasswordSchema = z.object({
  newPassword: strongPassword,
});

module.exports = { createUserSchema, updateUserSchema, resetPasswordSchema };