import express from "express";

import authenticate
from "../middleware/auth.middleware.js";

import authorize
from "../middleware/role.middleware.js";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";

const router =
  express.Router();

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  createTask
);

router.get(
  "/",
  authenticate,
  getTasks
);

router.get(
  "/:id",
  authenticate,
  getTaskById
);

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  updateTask
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "MANAGER"
  ),
  deleteTask
);

router.patch(
  "/:id/status",
  authenticate,
  updateTaskStatus
);

export default router;