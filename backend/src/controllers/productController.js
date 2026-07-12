const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Build filter query from req.query
const buildFilter = async (query) => {
  const filter = query._adminView ? {} : { isActive: true };
  if (query.category) {
    const categories = Array.isArray(query.category)
      ? query.category
      : String(query.category).split(",");
    const ids = [];
    const slugs = [];
    categories.forEach((c) => {
      if (mongoose.Types.ObjectId.isValid(c)) ids.push(c);
      else slugs.push(c);
    });

    if (ids.length > 0 && slugs.length > 0) {
      const catDocs = await Category.find({ slug: { $in: slugs } });
      const foundIds = catDocs.map(d => d._id);
      filter.categoryId = { $in: [...ids, ...foundIds] };
    } else if (ids.length > 0) {
      filter.categoryId = { $in: ids };
    } else if (slugs.length > 0) {
      const catDocs = await Category.find({ slug: { $in: slugs } });
      filter.categoryId = { $in: catDocs.map(d => d._id) };
    }
  }
  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { slug: { $regex: query.q, $options: "i" } }
    ];
  }
  if (query.flavor) {
    const values = Array.isArray(query.flavor) ? query.flavor : query.flavor.split(",");
    filter.flavor = { $in: values.map(v => new RegExp(v, "i")) };
  }
  if (query.origin) {
    const values = Array.isArray(query.origin) ? query.origin : query.origin.split(",");
    filter.origin = { $in: values.map(v => new RegExp(v, "i")) };
  }
  if (query.caffeine) {
    const values = Array.isArray(query.caffeine) ? query.caffeine : query.caffeine.split(",");
    filter.caffeine = { $in: values };
  }
  if (query.isOrganic === "true" || query.isOrganic === true) filter.isOrganic = true;
  if (query.isVegan === "true" || query.isVegan === true) filter.isVegan = true;
  if (query.rating) filter.rating = { $gte: Number(query.rating) };
  if (query.allergens) {
    const allergens = Array.isArray(query.allergens) ? query.allergens : [query.allergens];
    filter.allergens = { $all: allergens };
  }
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    filter.minPrice = {};
    if (query.priceMin !== undefined) filter.minPrice.$gte = Number(query.priceMin);
    if (query.priceMax !== undefined) filter.minPrice.$lte = Number(query.priceMax);
  }
  if (query.inStock === "true") filter["variants.stockQuantity"] = { $gt: 0 };
  if (query.tags) {
    const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    filter.tags = { $in: tags };
  }
  return filter;
};

const buildSort = (sortParam) => {
  const sorts = {
    "price:asc": { minPrice: 1 },
    "price:desc": { minPrice: -1 },
    "rating:desc": { rating: -1 },
    newest: { createdAt: -1 },
  };
  return sorts[sortParam] || { createdAt: -1 };
};

// GET /api/v1/products
exports.getAll = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(48, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const filter = await buildFilter(req.query);
    const sort = buildSort(req.query.sort);

    const [data, total] = await Promise.all([
      Product.find(filter).populate("categoryId", "name slug").sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/products/:id
exports.getOne = async (req, res) => {
  try {
    const isId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };
    const product = await Product.findOne({ ...query, isActive: true }).populate("categoryId", "name slug");
    
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/products
exports.create = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Parse variants if sent as JSON string (common with FormData)
    if (typeof data.variants === 'string') {
      try { data.variants = JSON.parse(data.variants); } catch (e) {}
    }
    if (typeof data.tags === 'string') {
      try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = data.tags.split(',').map(t => t.trim()); }
    }
    if (typeof data.ingredients === 'string') {
      try { data.ingredients = JSON.parse(data.ingredients); } catch (e) { data.ingredients = data.ingredients.split(',').map(t => t.trim()).filter(Boolean); }
    }
    if (typeof data.allergens === 'string') {
      try { data.allergens = JSON.parse(data.allergens); } catch (e) { data.allergens = data.allergens.split(',').map(t => t.trim()).filter(Boolean); }
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(file => file.path);
    }

    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/products/:id
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Parse JSON fields if necessary
    ["variants", "tags", "ingredients", "brewing", "allergens"].forEach(field => {
       if (typeof data[field] === 'string') {
         try { data[field] = JSON.parse(data[field]); } catch (e) {}
       }
    });

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      // Decide if we replace or append. Let's append if no images in body, or replace if images explicitly sent
      if (data.images) {
         if (typeof data.images === 'string') data.images = [data.images];
         data.images = [...data.images, ...newImages];
      } else {
         data.images = newImages;
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/products/:id  (soft delete)
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/products/:id/variants
exports.addVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.variants.push(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/products/:id/variants/:vid
exports.updateVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const variant = product.variants.id(req.params.vid);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });
    Object.assign(variant, req.body);
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/products/:id/variants/:vid
exports.removeVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.variants.pull({ _id: req.params.vid });
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
