const ApiError = require("../utils/ApiError");

// usage: validate(zodSchema)
module.exports = function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Validation failed";
      return next(
        new ApiError(400, firstError, { fields: fieldErrors })
      );
    }
    req.body = result.data;
    next();
  };
};