const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");
const { upload } = require("../config/cloudinary");

const adminOnly = [protect, requireRole("admin", "superadmin")];
const productUpload = upload("products").array("images", 5);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */
 
 /**
  * @swagger
  * /api/v1/products:
  *   get:
  *     summary: Get all products
  *     tags: [Products]
  *     parameters:
  *       - in: query
  *         name: category
  *         schema: { type: string }
  *       - in: query
  *         name: limit
  *         schema: { type: integer }
  *     responses:
  *       200:
  *         description: List of products
  *   post:
  *     summary: Create a product (Admin)
  *     tags: [Products]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       201:
  *         description: Product created
  */
router.get("/", ctrl.getAll);
 
 /**
  * @swagger
  * /api/v1/products/{id}:
  *   get:
  *     summary: Get product by ID or slug
  *     tags: [Products]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema: { type: string }
  *     responses:
  *       200:
  *         description: Product data
  *   put:
  *     summary: Update product (Admin)
  *     tags: [Products]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Product updated
  *   delete:
  *     summary: Delete product (Admin)
  *     tags: [Products]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Product deleted
  */
router.get("/:id", ctrl.getOne);
 
router.post("/", ...adminOnly, productUpload, ctrl.create);
router.put("/:id", ...adminOnly, productUpload, ctrl.update);
router.delete("/:id", ...adminOnly, ctrl.remove);
 
 /**
  * @swagger
  * /api/v1/products/{id}/variants:
  *   post:
  *     summary: Add variant to product (Admin)
  *     tags: [Products]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       201:
  *         description: Variant added
  */
router.post("/:id/variants", ...adminOnly, ctrl.addVariant);
router.put("/:id/variants/:vid", ...adminOnly, ctrl.updateVariant);
router.delete("/:id/variants/:vid", ...adminOnly, ctrl.removeVariant);

module.exports = router;
