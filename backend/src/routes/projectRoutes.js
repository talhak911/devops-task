const express = require("express");
const { body } = require("express-validator");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignMember,
  removeMember,
  getProjectStats,
} = require("../controllers/projectController");
const { protect, companyOnly } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// All routes require authentication
router.use(protect);

const projectValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 }),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 }),
  body("status")
    .optional()
    .isIn(["planning", "active", "on_hold", "completed"]),
  body("priority").optional().isIn(["low", "medium", "high", "critical"]),
  body("progress").optional().isInt({ min: 0, max: 100 }),
];

// Stats (company only)
router.get("/stats", companyOnly, getProjectStats);

// CRUD
router
  .route("/")
  .get(getProjects)
  .post(companyOnly, projectValidation, validateRequest, createProject);

router
  .route("/:id")
  .get(getProject)
  .put(updateProject)
  .delete(companyOnly, deleteProject);

// Assign / remove team members (company only)
router.post(
  "/:id/assign",
  companyOnly,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("permission")
      .isIn(["edit", "view"])
      .withMessage("permission must be 'edit' or 'view'"),
  ],
  validateRequest,
  assignMember,
);

router.delete("/:id/assign/:userId", companyOnly, removeMember);

module.exports = router;
