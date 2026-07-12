const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Token = require("../models/Token");

// Helper – generate signed JWT Access Token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m", // Short-lived access token
  });

// Helper – Hash raw token using sha256
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Helper – build consistent auth response and handle Refresh Token logic
const sendTokenResponse = async (user, statusCode, req, res, message) => {
  // 1. Generate Access Token (JWT)
  const accessToken = signToken(user._id);

  // 2. Generate secure random string for Refresh Token
  const rawRefreshToken = crypto.randomBytes(40).toString("hex");

  // 3. Hash Refresh Token internally
  const hashedRefreshToken = hashToken(rawRefreshToken);

  // 4. Save to DB with TTL defined in implementation plan (default 7 days)
  const tokenExpiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + tokenExpiryDays);

  await Token.create({
    userId: user._id,
    token: hashedRefreshToken,
    expiresAt,
  });

  // 5. Send raw token securely via HttpOnly cookie
  const isLocalStorageOrLocalDev = !req.get("origin") || req.get("origin").includes("localhost");
  const isProduction = process.env.NODE_ENV === "production" || !isLocalStorageOrLocalDev;

  const cookieOptions = {
    expires: expiresAt,
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite: none
    sameSite: isProduction ? "none" : "lax", // 'none' for cross-domain Vercel/Render, 'lax' for local
  };

  res
    .status(statusCode)
    .cookie("refresh_token", rawRefreshToken, cookieOptions)
    .json({
      success: true,
      data: {
        token: accessToken, // Short-lived access token for the client
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
      message,
    });
};

/**
 * @desc   Register a new user
 * @route  POST /api/users/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "An account with this email already exists.",
      });
    }

    // Registration creates a customer account by default
    const user = await User.create({ name, email, password, role: "user" });
    await sendTokenResponse(user, 201, req, res, "Account created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Login user and return JWT
 * @route  POST /api/users/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your account is inactive. Please contact support.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    await sendTokenResponse(user, 200, req, res, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current logged-in user profile
 * @route  GET /api/users/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          createdAt: req.user.createdAt,
        },
      },
      message: "User profile fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Exchange Refresh Token for new Access Token
 * @route  POST /api/users/refresh
 * @access Public
 */
const refreshTokens = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refresh_token;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Not authorized, no refresh token provided",
      });
    }

    // Hash the incoming token to query the DB
    const hashedIncomingToken = hashToken(incomingToken);

    // Find the token in DB
    const tokenDoc = await Token.findOne({ token: hashedIncomingToken });

    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid or expired refresh token",
      });
    }

    // Find the user associated with this token
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Your account is blocked or inactive. Please contact support.",
      });
    }

    // Refresh Token Rotation: Delete old token, issue entirely fresh tokens
    await Token.findByIdAndDelete(tokenDoc._id);
    await sendTokenResponse(user, 200, req, res, "Tokens refreshed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Logout User (clear cookies & wipe refresh token)
 * @route  POST /api/users/logout
 * @access Public
 */
const logout = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refresh_token;

    if (incomingToken) {
      const hashedIncomingToken = hashToken(incomingToken);
      // Remove token from database securely
      await Token.findOneAndDelete({ token: hashedIncomingToken });
    }

    const isLocalStorageOrLocalDev = !req.get("origin") || req.get("origin").includes("localhost");
    const isProduction = process.env.NODE_ENV === "production" || !isLocalStorageOrLocalDev;

    // Clear client-side cookie
    res.cookie("refresh_token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      data: {},
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, refreshTokens, logout };
