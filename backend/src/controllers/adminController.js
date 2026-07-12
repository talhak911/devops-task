const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Cart = require("../models/Cart");

// ─── Analytics ───────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const range = req.query.range || "30d";
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, totalUsers, revenue, topProducts] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: "shipped" }),
        Order.countDocuments({ status: "delivered" }),
        User.countDocuments({ role: "user" }),
        Order.aggregate([
          { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.productId", title: { $first: "$items.productTitle" }, totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
        ]),
      ]);

    // Low stock count
    const lowStockProducts = await Product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.isActive": true, "variants.stockQuantity": { $lte: 5 } } },
      { $count: "count" },
    ]);

    // Daily series for the period
    const dailySeries = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalUsers,
        revenue: revenue[0]?.total || 0,
        lowStockCount: lowStockProducts[0]?.count || 0,
        topProducts,
        dailySeries,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin Orders ──────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.userId = req.query.userId;

    const [data, total] = await Promise.all([
      Order.find(filter).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.status = status;
    order.statusHistory.push({ status, note, changedBy: req.user.id });
    await order.save();
    await AuditLog.create({ adminId: req.user.id, action: "UPDATE_ORDER_STATUS", entity: "Order", entityId: order._id, before: { status: order.status }, after: { status }, note });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order with status: ${order.status}` });
    }
    // Release stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stockQuantity": item.quantity } }
      );
    }
    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: reason, changedBy: req.user.id });
    await order.save();
    await AuditLog.create({ adminId: req.user.id, action: "CANCEL_ORDER", entity: "Order", entityId: order._id, note: reason });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Inventory ────────────────────────────────────────────────────────────────
exports.getInventory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.q) filter.title = { $regex: req.query.q, $options: "i" };

    const products = await Product.find(filter, "title variants").skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    const inventory = products.flatMap((p) =>
      p.variants.map((v) => ({
        productId: p._id,
        productTitle: p.title,
        variantId: v._id,
        sku: v.sku,
        label: v.label,
        stockQuantity: v.stockQuantity,
        reserved: v.reserved,
        isLowStock: v.stockQuantity <= 5,
        isActive: v.isActive,
      }))
    );

    res.json({ success: true, data: inventory, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { productId, variantId, delta, reason } = req.body;
    if (!productId || !variantId || delta === undefined) {
      return res.status(400).json({ success: false, message: "productId, variantId, and delta are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    const newQty = variant.stockQuantity + delta;
    if (newQty < 0) {
      return res.status(409).json({ success: false, message: "Adjustment would result in negative stock", error: { code: "NEGATIVE_STOCK" } });
    }

    const before = { stockQuantity: variant.stockQuantity };
    variant.stockQuantity = newQty;
    await product.save();

    await AuditLog.create({ adminId: req.user.id, action: "ADJUST_STOCK", entity: "Product", entityId: product._id, before, after: { stockQuantity: newQty }, note: reason || "" });
    res.json({ success: true, data: { sku: variant.sku, stockQuantity: newQty } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = { role: "user" };
    if (req.query.q) filter.$or = [{ name: { $regex: req.query.q, $options: "i" } }, { email: { $regex: req.query.q, $options: "i" } }];

    const [data, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { user, orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: blocked }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await AuditLog.create({ adminId: req.user.id, action: blocked ? "BLOCK_USER" : "UNBLOCK_USER", entity: "User", entityId: user._id });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin Accounts (superadmin only) ─────────────────────────────────────────
exports.getAdmins = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find({ role: { $in: ["admin", "superadmin"] } }).select("-password").skip(skip).limit(limit),
      User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await User.create({ name, email, password, role: "admin" });
    await AuditLog.create({ adminId: req.user.id, action: "CREATE_ADMIN", entity: "User", entityId: admin._id, after: { email, role: "admin" } });
    res.status(201).json({ success: true, data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { role, isBlocked } = req.body;
    if (req.params.id === req.user.id && isBlocked) {
      return res.status(400).json({ success: false, message: "You cannot block your own account" });
    }
    const before = await User.findById(req.params.id).select("role isBlocked");
    const admin = await User.findByIdAndUpdate(req.params.id, { role, isBlocked }, { new: true }).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    await AuditLog.create({ adminId: req.user.id, action: "UPDATE_ADMIN", entity: "User", entityId: admin._id, before, after: { role, isBlocked } });
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }
    const admin = await User.findOneAndDelete({ _id: req.params.id, role: { $in: ["admin", "superadmin"] } });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    await AuditLog.create({ adminId: req.user.id, action: "DELETE_ADMIN", entity: "User", entityId: admin._id });
    res.json({ success: true, message: "Admin removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Audit Log ────────────────────────────────────────────────────────────────
exports.getAuditLog = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.entityId) filter.entityId = req.query.entityId;

    const [data, total] = await Promise.all([
      AuditLog.find(filter).populate("adminId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
