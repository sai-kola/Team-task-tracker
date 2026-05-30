import express from "express";

import authenticate
from "../middleware/auth.middleware.js";

import authorize
from "../middleware/role.middleware.js";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const router =
  express.Router();

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  createProject
);

router.get(
  "/",
  authenticate,
  getProjects
);

router.get(
  "/:id",
  authenticate,
  getProjectById
);

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  updateProject
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  deleteProject
);

export default router;