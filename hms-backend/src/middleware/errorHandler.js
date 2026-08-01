const ApiError = require("../utils/ApiError");

module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
  }

  // Postgres unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry - resource already exists",
    });
  }

  // Postgres FK violation
  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference to related resource",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};