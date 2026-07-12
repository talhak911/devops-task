const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  // Snapshot for display
  productTitle: { type: String },
  variantLabel: { type: String },
  productImage: { type: String },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    delivery: { type: Number, default: 3.95 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Recalculate totals
cartSchema.methods.recalculate = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.delivery = this.items.length > 0 ? 3.95 : 0;
  this.total = this.subtotal + this.delivery;
  return this;
};

module.exports = mongoose.model("Cart", cartSchema);
