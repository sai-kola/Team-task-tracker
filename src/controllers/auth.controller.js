import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import jwt from "jsonwebtoken";

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
            secure:
                process.env.NODE_ENV ===
                "production",
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
        secure:
            process.env.NODE_ENV ===
            "production",
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

export const refreshToken =
  async (req, res) => {
    try {
      const refreshToken =
        req.cookies.refreshToken;

      // No token
      if (!refreshToken) {
        return res.status(401).json({
          status: 401,
          code: "UNAUTHORIZED",
          message:
            "Refresh token missing",
        });
      }

      // Find token in DB
      const existingToken =
        await RefreshToken.findOne({
          token: refreshToken,
        });

      if (!existingToken) {
        return res.status(401).json({
          status: 401,
          code: "INVALID_TOKEN",
          message:
            "Invalid refresh token",
        });
      }

      // Verify token
      const decoded =
        jwt.verify(
          refreshToken,
          process.env
            .JWT_REFRESH_SECRET
        );

      // Remove old token
      await RefreshToken.deleteOne({
        token: refreshToken,
      });

      // New payload
      const payload = {
        userId:
          decoded.userId,
        role: decoded.role,
        organizationId:
          decoded.organizationId,
      };

      // Generate new tokens
      const newAccessToken =
        generateAccessToken(
          payload
        );

      const newRefreshToken =
        generateRefreshToken(
          payload
        );

      // Save new refresh token
      await RefreshToken.create({
        userId:
          decoded.userId,
        token:
          newRefreshToken,
        expiresAt: new Date(
          Date.now() +
            7 *
              24 *
              60 *
              60 *
              1000
        ),
      });

      // Update cookie
      res.cookie(
        "refreshToken",
        newRefreshToken,
        {
          httpOnly: true,
          secure:
            process.env
              .NODE_ENV ===
            "production",
          sameSite:
            "strict",
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Token refreshed successfully",
        accessToken:
          newAccessToken,
      });
    } catch (error) {
      console.error(error);

      return res.status(401).json({
        status: 401,
        code: "INVALID_TOKEN",
        message:
          "Invalid or expired token",
      });
    }
  };

export const logout = async (
  req,
  res
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    // No token
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully",
      });
    }

    // Remove token from DB
    await RefreshToken.deleteOne({
      token: refreshToken,
    });

    // Clear cookie
    res.clearCookie(
      "refreshToken"
    );

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
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