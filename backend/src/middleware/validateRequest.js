const { validationResult } = require("express-validator");

/**
 * Middleware that checks express-validator results.
 * If there are errors it responds immediately with 422 and a list of messages.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    return res.status(422).json({
      success: false,
      data: null,
      message: errorArray[0].msg, // Send the first specific error message
      errors: errorArray.map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validateRequest };
