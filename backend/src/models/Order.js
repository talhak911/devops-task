const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  productTitle: { type: String },
  variantLabel: { type: String },
  productImage: { type: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: "" },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  changedAt: { type: Date, default: Date.now },
});

const shippingAddressSchema = new mongoose.Schema({
  name: String,
  street: String,
  city: String,
  postalCode: String,
  country: { type: String, default: "Netherlands" },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    delivery: { type: Number, default: 3.95 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "paid", // COD: auto-paid on creation
    },
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: { type: String, default: "pending" },
    shippingAddress: shippingAddressSchema,
    idempotencyKey: { type: String, unique: true, sparse: true },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
