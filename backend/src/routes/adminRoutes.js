const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const productCtrl = require("../controllers/productController");
const categoryCtrl = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

const isAdmin = [protect, requireRole("admin", "superadmin")];
const isSuperAdmin = [protect, requireRole("superadmin")];

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for products, orders, users and analytics
 */

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get business analytics (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics report
 */
router.get("/analytics", ...isSuperAdmin, ctrl.getAnalytics);

// Products (admin view - includes inactive)
router.get("/products", ...isAdmin, async (req, res) => {
  // Remove isActive filter for admin
  req.query._adminView = true;
  productCtrl.getAll(req, res);
});
router.post("/products", ...isAdmin, productCtrl.create);
router.put("/products/:id", ...isAdmin, productCtrl.update);
router.delete("/products/:id", ...isAdmin, productCtrl.remove);
router.post("/products/:id/variants", ...isAdmin, productCtrl.addVariant);
router.put("/products/:id/variants/:vid", ...isAdmin, productCtrl.updateVariant);
router.delete("/products/:id/variants/:vid", ...isAdmin, productCtrl.removeVariant);

// Categories
router.get("/categories", ...isAdmin, categoryCtrl.getAll);
router.post("/categories", ...isAdmin, categoryCtrl.create);
router.put("/categories/:id", ...isAdmin, categoryCtrl.update);
router.delete("/categories/:id", ...isAdmin, categoryCtrl.remove);

// Inventory
/**
 * @swagger
 * /api/admin/inventory:
 *   get:
 *     summary: Get inventory status (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory list
 */
router.get("/inventory", ...isAdmin, ctrl.getInventory);
router.post("/inventory/adjust", ...isAdmin, ctrl.adjustStock);

// Orders
router.get("/orders", ...isAdmin, ctrl.getOrders);
router.get("/orders/:id", ...isAdmin, ctrl.getOrderDetail);
router.patch("/orders/:id/status", ...isAdmin, ctrl.updateOrderStatus);
router.post("/orders/:id/cancel", ...isAdmin, ctrl.cancelOrder);

// Users / Customers
router.get("/users", ...isSuperAdmin, ctrl.getUsers);
router.get("/users/:id", ...isSuperAdmin, ctrl.getUserDetail);
router.patch("/users/:id/block", ...isSuperAdmin, ctrl.blockUser);

// Admin accounts (superadmin only)
router.get("/accounts", ...isSuperAdmin, ctrl.getAdmins);
router.post("/accounts", ...isSuperAdmin, ctrl.createAdmin);
router.patch("/accounts/:id", ...isSuperAdmin, ctrl.updateAdmin);
router.delete("/accounts/:id", ...isSuperAdmin, ctrl.deleteAdmin);

// Audit log
/**
 * @swagger
 * /api/admin/audit:
 *   get:
 *     summary: Get system audit logs (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log list
 */
router.get("/audit", ...isSuperAdmin, ctrl.getAuditLog);

module.exports = router;
