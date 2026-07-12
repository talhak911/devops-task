const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /api/v1/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/cart/items
exports.addItem = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId || !variantId) {
      return res.status(400).json({ success: false, message: "productId and variantId are required" });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) {
      return res.status(404).json({ success: false, message: "Variant not found or inactive" });
    }
    if (variant.stockQuantity < quantity) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
        error: { code: "INSUFFICIENT_STOCK", details: { available: variant.stockQuantity } },
      });
    }

    const unitPrice = product.basePrice + variant.priceDelta;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existing = cart.items.find(
      (i) => i.productId.toString() === productId && i.variantId.toString() === variantId
    );

    if (existing) {
      existing.quantity += quantity;
      existing.lineTotal = existing.unitPrice * existing.quantity;
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
        productTitle: product.title,
        variantLabel: variant.label,
        productImage: product.images[0] || "",
      });
    }

    cart.recalculate();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/cart/items/:itemId
exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Validate stock
    const product = await Product.findById(item.productId);
    const variant = product?.variants.id(item.variantId);
    if (variant && variant.stockQuantity < quantity) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
        error: { code: "INSUFFICIENT_STOCK", details: { available: variant.stockQuantity } },
      });
    }

    item.quantity = quantity;
    item.lineTotal = item.unitPrice * quantity;
    cart.recalculate();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/cart/items/:itemId
exports.removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items.pull({ _id: req.params.itemId });
    cart.recalculate();
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
