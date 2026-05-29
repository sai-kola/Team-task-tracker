import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

export const register = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Check existing user
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: 400,
        code: "USER_ALREADY_EXISTS",
        message:
          "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      organizationId:
        "default-org",
    });

    // JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
      organizationId:
        user.organizationId,
    };

    // Generate tokens
    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
    });

    // Store in cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 500,
      code: "SERVER_ERROR",
      message:
        "Something went wrong",
    });
  }
};

export const login = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    // Find user with password
    const user = await User.findOne({
      email,
    }).select("+password");

    // User not found
    if (!user) {
      return res.status(401).json({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message:
          "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect =
      await user.comparePassword(
        password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message:
          "Invalid email or password",
      });
    }

    // JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
      organizationId:
        user.organizationId,
    };

    // Generate tokens
    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
    });

    // Set cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 500,
      code: "SERVER_ERROR",
      message:
        "Something went wrong",
    });
  }
};

export const refreshToken = async (
  req,
  res
) => {
  res.json({
    message: "Refresh API",
  });
};

export const logout = async (
  req,
  res
) => {
  res.json({
    message: "Logout API",
  });
};