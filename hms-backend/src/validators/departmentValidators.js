const { z } = require("zod");

const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
});

const updateDepartmentSchema = createDepartmentSchema.partial();

module.exports = { createDepartmentSchema, updateDepartmentSchema };