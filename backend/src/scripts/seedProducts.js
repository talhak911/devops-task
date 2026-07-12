require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");

const categories = [
  { name: "Chai Tea", slug: "chai", imageUrl: "" },
  { name: "Green Tea", slug: "green-tea", imageUrl: "" },
  { name: "Herbal Tea", slug: "herbal", imageUrl: "" },
  { name: "Black Tea", slug: "black-tea", imageUrl: "" },
];

const products = (catMap) => [
  {
    title: "Ceylon Ginger Cinnamon Chai Tea",
    slug: "ceylon-ginger-cinnamon-chai-tea",
    description: "A warming blend of Ceylon tea with fresh ginger and fragrant cinnamon. Perfect for cold mornings.",
    categoryId: catMap["chai"],
    basePrice: 3.90,
    origin: "Sri Lanka",
    isOrganic: true,
    isVegan: true,
    flavor: "Spicy & Warm",
    qualities: "Energizing, Digestive",
    caffeine: "Medium",
    allergens: "None",
    ingredients: "Ceylon tea, ginger, cinnamon, cardamom",
    tags: ["spicy", "warming", "chai"],
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1594631252845-29fc4586d51c?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "CGCC-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 50 },
      { sku: "CGCC-100G", label: "100 g bag", weightGrams: 100, priceDelta: 2.50, stockQuantity: 30 },
      { sku: "CGCC-200G", label: "200 g bag", weightGrams: 200, priceDelta: 5.00, stockQuantity: 15 },
    ],
  },
  {
    title: "Masala Chai Classic Blend",
    slug: "masala-chai-classic-blend",
    description: "Authentic Indian masala chai with a bold mix of spices including cardamom, cloves, and black pepper.",
    categoryId: catMap["chai"],
    basePrice: 4.20,
    origin: "India",
    isOrganic: false,
    isVegan: true,
    flavor: "Bold & Spicy",
    qualities: "Invigorating",
    caffeine: "High",
    allergens: "None",
    ingredients: "Assam tea, cardamom, cloves, cinnamon, black pepper, ginger",
    tags: ["spicy", "bold", "chai", "indian"],
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "MCC-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 40 },
      { sku: "MCC-100G", label: "100 g bag", weightGrams: 100, priceDelta: 2.80, stockQuantity: 25 },
    ],
  },
  {
    title: "Sencha Japanese Green Tea",
    slug: "sencha-japanese-green-tea",
    description: "Premium Japanese Sencha with a fresh, grassy flavor and natural sweetness.",
    categoryId: catMap["green-tea"],
    basePrice: 5.50,
    origin: "Japan",
    isOrganic: true,
    isVegan: true,
    flavor: "Fresh & Grassy",
    qualities: "Antioxidant-rich, Calming",
    caffeine: "Low",
    allergens: "None",
    ingredients: "Sencha green tea leaves",
    tags: ["japanese", "green", "fresh"],
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "SJG-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 60 },
      { sku: "SJG-100G", label: "100 g bag", weightGrams: 100, priceDelta: 3.50, stockQuantity: 35 },
    ],
  },
  {
    title: "Moroccan Mint Green Tea",
    slug: "moroccan-mint-green-tea",
    description: "Refreshing blend of Chinese gunpowder green tea with spearmint.",
    categoryId: catMap["green-tea"],
    basePrice: 4.75,
    origin: "Morocco",
    isOrganic: true,
    isVegan: true,
    flavor: "Minty & Cool",
    qualities: "Refreshing, Digestive",
    caffeine: "Low",
    allergens: "None",
    ingredients: "Gunpowder green tea, spearmint",
    tags: ["mint", "moroccan", "refreshing"],
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "MMG-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 45 },
      { sku: "MMG-100G", label: "100 g bag", weightGrams: 100, priceDelta: 3.00, stockQuantity: 20 },
    ],
  },
  {
    title: "Chamomile & Lavender Herbal Tea",
    slug: "chamomile-lavender-herbal-tea",
    description: "A calming blend of chamomile flowers and lavender for deep relaxation.",
    categoryId: catMap["herbal"],
    basePrice: 4.50,
    origin: "Netherlands",
    isOrganic: true,
    isVegan: true,
    flavor: "Floral & Calming",
    qualities: "Sleep-promoting, Anti-anxiety",
    caffeine: "None",
    allergens: "None",
    ingredients: "Chamomile flowers, lavender, lemon balm",
    tags: ["floral", "calming", "sleep"],
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1436076863939-06870fe779c2?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "CLH-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 70 },
      { sku: "CLH-100G", label: "100 g bag", weightGrams: 100, priceDelta: 2.50, stockQuantity: 40 },
      { sku: "CLH-200G", label: "200 g bag", weightGrams: 200, priceDelta: 5.50, stockQuantity: 3 }, // Low stock
    ],
  },
  {
    title: "Darjeeling First Flush Black Tea",
    slug: "darjeeling-first-flush-black-tea",
    description: "Exquisite first flush Darjeeling with muscatel notes and a golden cup.",
    categoryId: catMap["black-tea"],
    basePrice: 6.90,
    origin: "India (Darjeeling)",
    isOrganic: false,
    isVegan: true,
    flavor: "Muscatel & Light",
    qualities: "Premium, Energizing",
    caffeine: "High",
    allergens: "None",
    ingredients: "Darjeeling first flush tea",
    tags: ["premium", "darjeeling", "black"],
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "DFF-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 25 },
      { sku: "DFF-100G", label: "100 g bag", weightGrams: 100, priceDelta: 4.00, stockQuantity: 15 },
    ],
  },
  {
    title: "Rooibos Vanilla Dream",
    slug: "rooibos-vanilla-dream",
    description: "South African rooibos naturally sweetened with vanilla. Caffeine-free and rich.",
    categoryId: catMap["herbal"],
    basePrice: 4.20,
    origin: "South Africa",
    isOrganic: true,
    isVegan: true,
    flavor: "Sweet & Vanilla",
    qualities: "Antioxidant, Caffeine-free",
    caffeine: "None",
    allergens: "None",
    ingredients: "Rooibos, vanilla pieces",
    tags: ["vanilla", "sweet", "caffeine-free"],
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "RVD-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 55 },
      { sku: "RVD-100G", label: "100 g bag", weightGrams: 100, priceDelta: 2.00, stockQuantity: 30 },
    ],
  },
  {
    title: "Earl Grey Blue Flower",
    slug: "earl-grey-blue-flower",
    description: "Classic Earl Grey elevated with blue cornflower petals and bergamot.",
    categoryId: catMap["black-tea"],
    basePrice: 5.20,
    origin: "China & Sri Lanka blend",
    isOrganic: false,
    isVegan: true,
    flavor: "Citrus & Floral",
    qualities: "Classic, Focus-enhancing",
    caffeine: "Medium",
    allergens: "None",
    ingredients: "Black tea, bergamot, cornflower petals",
    tags: ["earl-grey", "floral", "classic"],
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=600&auto=format&fit=crop"],
    variants: [
      { sku: "EGB-50G", label: "50 g bag", weightGrams: 50, priceDelta: 0, stockQuantity: 35 },
      { sku: "EGB-100G", label: "100 g bag", weightGrams: 100, priceDelta: 3.20, stockQuantity: 20 },
      { sku: "EGB-250G", label: "250 g jar", weightGrams: 250, priceDelta: 8.00, stockQuantity: 10 },
    ],
  },
];

async function seed() {
  await connectDB();
  console.log("🌱 Starting seed...");

  // Clear existing
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("🗑  Cleared existing categories and products.");

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  const catMap = {};
  createdCategories.forEach((c) => { catMap[c.slug] = c._id; });
  console.log(`✅ Created ${createdCategories.length} categories.`);

  // Create products
  const productData = products(catMap);
  const createdProducts = await Product.insertMany(productData);
  console.log(`✅ Created ${createdProducts.length} products.`);

  // Create/update superadmin
  const existing = await User.findOne({ email: "superadmin@teashop.com" });
  if (!existing) {
    await User.create({ name: "Super Admin", email: "superadmin@teashop.com", password: "Admin123", role: "superadmin" });
    console.log("✅ Superadmin created: superadmin@teashop.com / Admin123");
  } else {
    console.log("ℹ️  Superadmin already exists.");
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
