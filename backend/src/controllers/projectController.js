const Project = require("../models/Project");

/**
 * Helper: check if a user is assigned to a project and get their permission level
 */
const getMemberPermission = (project, userId) => {
  const member = project.teamMembers.find((m) =>
    m.user._id ? m.user._id.equals(userId) : m.user.equals(userId),
  );
  return member ? member.permission : null;
};

/**
 * @desc   Get all projects
 *         - Company: sees all projects they own
 *         - Team member: sees only projects where they are assigned
 * @route  GET /api/projects
 * @access Private
 */
const getProjects = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "company") {
      query = { owner: req.user._id };
    } else {
      query = { "teamMembers.user": req.user._id };
    }

    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("teamMembers.user", "name email department avatar")
      .sort({ createdAt: -1 });

    // For team members, attach their own permission to each project
    const result = projects.map((p) => {
      const obj = p.toObject();
      if (req.user.role === "team_member") {
        obj.myPermission = getMemberPermission(p, req.user._id);
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      data: { projects: result, count: result.length },
      message: "Projects fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single project
 * @route  GET /api/projects/:id
 * @access Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("teamMembers.user", "name email department avatar");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Project not found" });
    }

    // Company must own it; team member must be assigned
    if (req.user.role === "company" && !project.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, data: null, message: "Not authorized" });
    }

    const permission = getMemberPermission(project, req.user._id);
    if (req.user.role === "team_member" && !permission) {
      return res
        .status(403)
        .json({
          success: false,
          data: null,
          message: "You are not assigned to this project",
        });
    }

    const obj = project.toObject();
    if (req.user.role === "team_member") obj.myPermission = permission;

    res
      .status(200)
      .json({
        success: true,
        data: { project: obj },
        message: "Project fetched successfully",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a project (company only)
 * @route  POST /api/projects
 * @access Private (company)
 */
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      techStack,
      status,
      priority,
      startDate,
      endDate,
    } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack: techStack || [],
      status: status || "planning",
      priority: priority || "medium",
      owner: req.user._id,
      teamMembers: [],
      startDate,
      endDate,
    });

    const populated = await project.populate([
      { path: "owner", select: "name email" },
      { path: "teamMembers.user", select: "name email department avatar" },
    ]);

    res.status(201).json({
      success: true,
      data: { project: populated },
      message: "Project created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a project
 *         - Company: can update everything except teamMembers (use assign endpoint)
 *         - Team member with edit: can update progress, status only
 * @route  PUT /api/projects/:id
 * @access Private
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Project not found" });
    }

    if (req.user.role === "company") {
      if (!project.owner.equals(req.user._id)) {
        return res
          .status(403)
          .json({ success: false, data: null, message: "Not authorized" });
      }
      const allowedFields = [
        "title",
        "description",
        "techStack",
        "status",
        "priority",
        "startDate",
        "endDate",
        "progress",
      ];
      const updates = {};
      allowedFields.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });
      project = await Project.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
        .populate("owner", "name email")
        .populate("teamMembers.user", "name email department avatar");
    } else {
      // Team member needs edit permission
      const permission = getMemberPermission(project, req.user._id);
      if (!permission)
        return res
          .status(403)
          .json({
            success: false,
            data: null,
            message: "Not assigned to this project",
          });
      if (permission !== "edit")
        return res
          .status(403)
          .json({
            success: false,
            data: null,
            message: "You only have view permission on this project",
          });

      // Team member can only update progress and status
      const updates = {};
      if (req.body.progress !== undefined) updates.progress = req.body.progress;
      if (req.body.status !== undefined) updates.status = req.body.status;

      project = await Project.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
        .populate("owner", "name email")
        .populate("teamMembers.user", "name email department avatar");

      const obj = project.toObject();
      obj.myPermission = permission;
      return res
        .status(200)
        .json({
          success: true,
          data: { project: obj },
          message: "Project updated successfully",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        data: { project },
        message: "Project updated successfully",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a project (company only)
 *         Cascade: removing the project automatically cleans up all teamMember refs inside
 * @route  DELETE /api/projects/:id
 * @access Private (company)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Project not found" });
    }
    if (!project.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json({
          success: false,
          data: null,
          message: "Not authorized to delete this project",
        });
    }

    // Cascade: project's teamMembers sub-documents are embedded so they're deleted automatically
    await project.deleteOne();

    res
      .status(200)
      .json({
        success: true,
        data: null,
        message: "Project deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Assign / update a team member's permission on a project
 * @route  POST /api/projects/:id/assign
 * @access Private (company only)
 * @body   { userId, permission: 'edit' | 'view' }
 */
const assignMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Project not found" });
    if (!project.owner.equals(req.user._id))
      return res
        .status(403)
        .json({ success: false, data: null, message: "Not authorized" });

    const { userId, permission } = req.body;
    if (!userId || !["edit", "view"].includes(permission)) {
      return res
        .status(400)
        .json({
          success: false,
          data: null,
          message: "userId and permission ('edit' or 'view') are required",
        });
    }

    const User = require("../models/User");
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== "team_member") {
      return res
        .status(400)
        .json({
          success: false,
          data: null,
          message: "Target user not found or is not a team member",
        });
    }

    const existingIdx = project.teamMembers.findIndex((m) =>
      m.user.equals(userId),
    );
    if (existingIdx >= 0) {
      // Update existing permission
      project.teamMembers[existingIdx].permission = permission;
    } else {
      // Add new member
      project.teamMembers.push({ user: userId, permission });
    }

    await project.save();
    const populated = await project.populate([
      { path: "owner", select: "name email" },
      { path: "teamMembers.user", select: "name email department avatar" },
    ]);

    res
      .status(200)
      .json({
        success: true,
        data: { project: populated },
        message: "Member assigned successfully",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Remove a team member from a project
 * @route  DELETE /api/projects/:id/assign/:userId
 * @access Private (company only)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Project not found" });
    if (!project.owner.equals(req.user._id))
      return res
        .status(403)
        .json({ success: false, data: null, message: "Not authorized" });

    project.teamMembers = project.teamMembers.filter(
      (m) => !m.user.equals(req.params.userId),
    );
    await project.save();

    const populated = await project.populate([
      { path: "owner", select: "name email" },
      { path: "teamMembers.user", select: "name email department avatar" },
    ]);

    res
      .status(200)
      .json({
        success: true,
        data: { project: populated },
        message: "Member removed from project",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get project stats for the company dashboard
 * @route  GET /api/projects/stats
 * @access Private (company)
 */
const getProjectStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const totals = {
      total: 0,
      planning: 0,
      active: 0,
      on_hold: 0,
      completed: 0,
    };
    stats.forEach(({ _id, count }) => {
      totals[_id] = count;
      totals.total += count;
    });

    res
      .status(200)
      .json({
        success: true,
        data: { stats: totals },
        message: "Stats fetched",
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignMember,
  removeMember,
  getProjectStats,
};
