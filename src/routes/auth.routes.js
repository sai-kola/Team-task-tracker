import express from "express";
import validate from "../middleware/validate.middleware.js";

import { registerSchema, loginSchema, } from "../validations/auth.validation.js";

import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/register",
  validate(
    registerSchema
  ),
  register
);

router.post(
  "/login",
  validate(
    loginSchema
  ),
  login
);

router.post(
  "/refresh",
  refreshToken
);

router.post(
  "/logout",
  logout
);

export default router;