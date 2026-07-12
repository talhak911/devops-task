const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * @desc  Protect – verify JWT access token from Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Not authorized, user not found or inactive",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Not authorized, token is invalid or expired",
    });
  }
};

/**
 * @desc  Authorize – restrict to company role only
 */
const companyOnly = (req, res, next) => {
  if (req.user.role !== "company") {
    return res.status(403).json({
      success: false,
      data: null,
      message: "Only company accounts can perform this action",
    });
  }
  next();
};

module.exports = { protect, companyOnly };
