const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token missing"));
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};