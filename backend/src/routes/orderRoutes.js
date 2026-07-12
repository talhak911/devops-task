const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Place an order (Checkout)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed
 *   get:
 *     summary: Get user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.post("/", ctrl.checkout);
router.get("/", ctrl.getUserOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order data
 */
router.get("/:id", ctrl.getOrder);

module.exports = router;
