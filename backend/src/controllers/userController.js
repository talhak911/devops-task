const User = require("../models/User");

/**
 * @desc   Get all team members (company sees their own created members)
 * @route  GET /api/members
 * @access Private (company)
 */
const getUsers = async (req, res, next) => {
  try {
    // Company only sees team_members they created (createdBy themselves)
    const users = await User.find({
      role: "team_member",
      createdBy: req.user._id,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users, count: users.length },
      message: "Team members fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single user
 * @route  GET /api/members/:id
 * @access Private (company)
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).select("-__v");
    if (!user)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Team member not found" });

    res
      .status(200)
      .json({ success: true, data: { user }, message: "Team member fetched" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a team member (company creates them)
 * @route  POST /api/members
 * @access Private (company)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          data: null,
          message: "An account with this email already exists.",
        });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "team_member",
      department: department || "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      message: "Team member created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a team member's details
 * @route  PUT /api/members/:id
 * @access Private (company)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Team member not found" });

    const allowedFields = ["name", "department", "isActive"];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");

    res
      .status(200)
      .json({
        success: true,
        data: { user: updated },
        message: "Team member updated",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a team member
 *         Also removes them from all projects automatically via MongoDB
 * @route  DELETE /api/members/:id
 * @access Private (company)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Team member not found" });

    // Remove user from all projects they are assigned to
    const Project = require("../models/Project");
    await Project.updateMany(
      { owner: req.user._id, "teamMembers.user": user._id },
      { $pull: { teamMembers: { user: user._id } } },
    );

    await user.deleteOne();

    res
      .status(200)
      .json({ success: true, data: null, message: "Team member deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get team member stats for dashboard
 * @route  GET /api/members/stats
 * @access Private (company)
 */
const getUserStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments({
      role: "team_member",
      createdBy: req.user._id,
    });
    const active = await User.countDocuments({
      role: "team_member",
      createdBy: req.user._id,
      isActive: true,
    });
    res
      .status(200)
      .json({
        success: true,
        data: { stats: { total, active, inactive: total - active } },
        message: "Stats fetched",
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
