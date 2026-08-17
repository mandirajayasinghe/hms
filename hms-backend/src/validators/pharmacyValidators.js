const { z } = require("zod");

const createMedicineSchema = z.object({
  name: z.string().trim().min(2, "Medicine name is required").max(150),
  manufacturer: z.string().max(150).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative").optional(),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  expiryDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid expiry date")
    .optional()
    .or(z.literal("")),
});

const adjustStockSchema = z.object({
  changeQty: z.coerce.number().int().refine((v) => v !== 0, "Change quantity cannot be zero"),
  reason: z.string().trim().min(1, "Reason is required").max(255),
});

module.exports = { createMedicineSchema, adjustStockSchema };