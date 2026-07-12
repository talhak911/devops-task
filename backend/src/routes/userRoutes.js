const express = require("express");
const { body } = require("express-validator");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { protect, companyOnly } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// All routes: protected + company only
router.use(protect, companyOnly);

const createUserValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 }),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 }),
  body("department").optional().trim(),
];

router.get("/stats", getUserStats);

router
  .route("/")
  .get(getUsers)
  .post(createUserValidation, validateRequest, createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
