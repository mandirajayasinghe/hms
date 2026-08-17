const { z } = require("zod");

const loginSchema = z.object({
  username: z.string().trim().min(3, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[0-9]/, "New password must contain at least one number"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

module.exports = { loginSchema, changePasswordSchema, refreshSchema };