const { z } = require("zod");

const invoiceItemSchema = z.object({
  category: z.enum(["consultation", "laboratory", "pharmacy", "admission"]),
  description: z.string().trim().min(1, "Description is required").max(255),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  referenceId: z.string().uuid().optional().nullable(),
});

const createInvoiceSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  method: z.enum(["cash", "card", "insurance"]).optional(),
});

module.exports = { createInvoiceSchema, recordPaymentSchema };