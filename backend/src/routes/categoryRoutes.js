const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");
const { upload } = require("../config/cloudinary");

const categoryUpload = upload("categories").single("image");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */
 
 /**
  * @swagger
  * /api/v1/categories:
  *   get:
  *     summary: Get all categories
  *     tags: [Categories]
  *     responses:
  *       200:
  *         description: List of categories
  *   post:
  *     summary: Create a new category (Admin)
  *     tags: [Categories]
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       content:
  *         multipart/form-data:
  *           schema:
  *             type: object
  *             properties:
  *               name: { type: string }
  *               slug: { type: string }
  *               isActive: { type: boolean }
  *               image: { type: string, format: binary }
  *     responses:
  *       201:
  *         description: Category created
  */
router.get("/", ctrl.getAll);
 
 /**
  * @swagger
  * /api/v1/categories/{id}:
  *   get:
  *     summary: Get category by ID
  *     tags: [Categories]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema: { type: string }
  *     responses:
  *       200:
  *         description: Category data
  *   put:
  *     summary: Update category (Admin)
  *     tags: [Categories]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema: { type: string }
  *     requestBody:
  *       content:
  *         multipart/form-data:
  *           schema:
  *             type: object
  *             properties:
  *               name: { type: string }
  *               slug: { type: string }
  *               isActive: { type: boolean }
  *               image: { type: string, format: binary }
  *     responses:
  *       200:
  *         description: Category updated
  *   delete:
  *     summary: Delete category (Admin)
  *     tags: [Categories]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema: { type: string }
  *     responses:
  *       200:
  *         description: Category deleted
  */
router.get("/:id", ctrl.getOne);
 
router.post("/", protect, requireRole("admin", "superadmin"), categoryUpload, ctrl.create);
router.put("/:id", protect, requireRole("admin", "superadmin"), categoryUpload, ctrl.update);
router.delete("/:id", protect, requireRole("admin", "superadmin"), ctrl.remove);

module.exports = router;
