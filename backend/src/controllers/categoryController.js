const mongoose = require("mongoose");
const Category = require("../models/Category");
const AuditLog = require("../models/AuditLog");

// GET /api/v1/categories
exports.getAll = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";
    const filter = isAdmin ? {} : { isActive: true };
    const categories = await Category.find(filter).sort("name");
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/categories/:id
exports.getOne = async (req, res) => {
  try {
    const isId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };
    const category = await Category.findOne(query);
    
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/categories
exports.create = async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    let imageUrl = req.body.imageUrl;
    
    // If file uploaded via multer/cloudinary
    if (req.file) {
      imageUrl = req.file.path;
    }

    const category = await Category.create({ 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'), 
      imageUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    await AuditLog.create({
      adminId: req.user.id,
      action: "CREATE_CATEGORY",
      entity: "Category",
      entityId: category._id,
      after: category
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/categories/:id
exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const before = await Category.findById(req.params.id);
    if (!before) return res.status(404).json({ success: false, message: "Category not found" });

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    await AuditLog.create({
      adminId: req.user.id,
      action: "UPDATE_CATEGORY",
      entity: "Category",
      entityId: category._id,
      before,
      after: category
    });

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/categories/:id
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await AuditLog.create({
      adminId: req.user.id,
      action: "DELETE_CATEGORY",
      entity: "Category",
      entityId: category._id,
      before: category
    });

    res.json({ success: true, message: "Category removed permanently" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
