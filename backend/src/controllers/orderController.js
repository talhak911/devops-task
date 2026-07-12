const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/v1/orders  (COD checkout)
exports.checkout = async (req, res) => {
  try {
    const { shippingAddress, idempotencyKey } = req.body;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return res.status(200).json({ success: true, data: existing });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate stock and build order items atomically
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(409).json({
          success: false,
          message: `Product ${item.productTitle} is no longer available`,
          error: { code: "PRODUCT_UNAVAILABLE" },
        });
      }
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        return res.status(409).json({
          success: false,
          message: `Variant ${item.variantLabel} is no longer available`,
          error: { code: "VARIANT_UNAVAILABLE" },
        });
      }
      if (variant.stockQuantity < item.quantity) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${item.productTitle} - ${item.variantLabel}`,
          error: { code: "INSUFFICIENT_STOCK", details: { available: variant.stockQuantity, requested: item.quantity } },
        });
      }
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        productTitle: item.productTitle,
        variantLabel: item.variantLabel,
        productImage: item.productImage,
      });
    }

    // Decrement stock atomically
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stockQuantity": -item.quantity } }
      );
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      subtotal: cart.subtotal,
      delivery: cart.delivery,
      total: cart.total,
      shippingAddress,
      idempotencyKey,
      statusHistory: [{ status: "paid", note: "Order placed (COD)", changedBy: req.user.id }],
    });

    // Clear cart
    cart.items = [];
    cart.recalculate();
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/orders
exports.getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId: req.user.id }),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
