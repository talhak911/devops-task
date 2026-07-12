const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true }, // e.g. "50 g bag"
  weightGrams: { type: Number, default: 0 },
  priceDelta: { type: Number, default: 0 }, // added to basePrice for final price
  stockQuantity: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    basePrice: { type: Number, required: true, min: 0 },
    origin: { type: String, default: "" },
    isOrganic: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    flavor: { type: String, default: "" },
    qualities: { type: String, default: "" },
    caffeine: { type: String, default: "" }, // e.g. "Medium"
    allergens: [{ type: String }],
    ingredients: [{ type: String }],
    tags: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    minPrice: { type: Number, index: true }, // Cached basePrice + variants[0].priceDelta
    isActive: { type: Boolean, default: true },
    variants: [variantSchema],
  },
  { timestamps: true }
);

// Pre-save hook to calculate minPrice (displayed price)
productSchema.pre("save", function () {
  const base = this.basePrice || 0;
  const delta = (this.variants && this.variants[0]) ? (this.variants[0].priceDelta || 0) : 0;
  this.minPrice = base + delta;
});

// Computed: any variant has stock?
productSchema.virtual("inStock").get(function () {
  return this.variants.some((v) => v.isActive && v.stockQuantity > 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
