import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { TASK_TRANSITIONS,} from "../utils/constants.js";
import redisClient from "../config/redis.js";

export const createTask =
  async (req, res) => {
    try {
      const {
        title,
        description,
        priority,
        assignee,
        dueDate,
        projectId,
      } = req.body;

      // Validate project
      const project =
        await Project.findOne({
          _id: projectId,
          organizationId:
            req.user
              .organizationId,
        });

      if (!project) {
        return res.status(404).json({
          status: 404,
          code:
            "PROJECT_NOT_FOUND",
          message:
            "Project not found",
        });
      }

      // Validate assignee
      const assignedUser =
        await User.findOne({
          _id: assignee,
          organizationId:
            req.user
              .organizationId,
        });

      if (!assignedUser) {
        return res.status(404).json({
          status: 404,
          code:
            "USER_NOT_FOUND",
          message:
            "Assignee not found",
        });
      }

      const task =
        await Task.create({
          title,
          description,
          priority,
          assignee,
          dueDate,
          projectId,
          organizationId:
            req.user
              .organizationId,
          createdBy:
            req.user.userId,
        });
        await redisClient.del(
            `tasks:${assignee}:page=1:limit=10:status=all:priority=all:assignee=all`
        );
      return res.status(201).json({
        success: true,
        message:
          "Task created successfully",
        data: task,
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

export const getTasks =
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        assignee,
      } = req.query;

        const cacheKey = `tasks:${req.user.userId
            }:page=${page}:limit=${limit}:status=${status || "all"
            }:priority=${priority || "all"
            }:assignee=${assignee || "all"
            }`;

      // Base query
      const query = {
        organizationId:
          req.user.organizationId,
      };

      // MEMBER can only view assigned tasks
      if (
        req.user.role ===
        "MEMBER"
      ) {
        query.assignee =
          req.user.userId;
      }

      // Filters
      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority =
          priority;
      }

      // Admin/Manager can filter assignee
      if (
        assignee &&
        req.user.role !==
          "MEMBER"
      ) {
        query.assignee =
          assignee;
      }
        const cachedTasks =
            await redisClient.get(
                cacheKey
            );

        if (cachedTasks) {
            return res.status(200).json({
                success: true,
                source: "cache",
                ...JSON.parse(
                    cachedTasks
                ),
            });
        }
      const tasks =
        await Task.find(query)
          .populate(
            "assignee",
            "name email role"
          )
          .populate(
            "projectId",
            "name"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (page - 1) * limit
          )
          .limit(Number(limit));

      const total =
        await Task.countDocuments(
          query
        );

        const response = {
            currentPage:
                Number(page),

            totalPages:
                Math.ceil(
                    total / limit
                ),

            totalTasks: total,

            count:
                tasks.length,

            data: tasks,
        };

        // Cache for 5 minutes
        await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(response)
        );

        return res.status(200).json({
            success: true,
            source: "database",
            ...response,
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

export const getTaskById =
  async (req, res) => {
    try {
      const { id } = req.params;

      const query = {
        _id: id,
        organizationId:
          req.user.organizationId,
      };

      // MEMBER restriction
      if (
        req.user.role ===
        "MEMBER"
      ) {
        query.assignee =
          req.user.userId;
      }

      const task =
        await Task.findOne(query)
          .populate(
            "assignee",
            "name email role"
          )
          .populate(
            "projectId",
            "name"
          )
          .populate(
            "createdBy",
            "name email"
          );

      if (!task) {
        return res.status(404).json({
          status: 404,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
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

export const updateTask =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        description,
        priority,
        assignee,
        dueDate,
        projectId,
      } = req.body;

      const task =
        await Task.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        });

      // Task not found
      if (!task) {
        return res.status(404).json({
          status: 404,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task not found",
        });
      }

      // Validate assignee
      if (assignee) {
        const user =
          await User.findOne({
            _id: assignee,
            organizationId:
              req.user
                .organizationId,
          });

        if (!user) {
          return res.status(404).json({
            status: 404,
            code:
              "USER_NOT_FOUND",
            message:
              "Assignee not found",
          });
        }

        task.assignee =
          assignee;
      }

      // Validate project
      if (projectId) {
        const project =
          await Project.findOne({
            _id: projectId,
            organizationId:
              req.user
                .organizationId,
          });

        if (!project) {
          return res.status(404).json({
            status: 404,
            code:
              "PROJECT_NOT_FOUND",
            message:
              "Project not found",
          });
        }

        task.projectId =
          projectId;
      }

      // Partial updates
      if (title !== undefined) {
        task.title = title;
      }

      if (
        description !==
        undefined
      ) {
        task.description =
          description;
      }

      if (
        priority !==
        undefined
      ) {
        task.priority =
          priority;
      }

      if (
        dueDate !==
        undefined
      ) {
        task.dueDate =
          dueDate;
      }

        await task.save();
        await redisClient.del(
            `tasks:${task.assignee}:page=1:limit=10:status=all:priority=all:assignee=all`
        );
      return res.status(200).json({
        success: true,
        message:
          "Task updated successfully",
        data: task,
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

export const deleteTask =
  async (req, res) => {
    try {
      const { id } = req.params;

      const task =
        await Task.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        });

      // Task not found
      if (!task) {
        return res.status(404).json({
          status: 404,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task not found",
        });
      }

      await task.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Task deleted successfully",
      });
    } catch (error) {
      console.error(error);
        await redisClient.del(
            `tasks:${task.assignee}:page=1:limit=10:status=all:priority=all:assignee=all`
        );
      return res.status(500).json({
        status: 500,
        code: "SERVER_ERROR",
        message:
          "Something went wrong",
      });
    }
  };

export const updateTaskStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { status } =
        req.body;

      const task =
        await Task.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        });

      // Task not found
      if (!task) {
        return res.status(404).json({
          status: 404,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task not found",
        });
      }

      // Permission check
      const isManager =
        req.user.role ===
        "MANAGER";

      const isAssignee =
        task.assignee.toString() ===
        req.user.userId;

      if (
        !isManager &&
        !isAssignee
      ) {
        return res.status(403).json({
          status: 403,
          code:
            "FORBIDDEN",
          message:
            "Only assignee or manager can update task status",
        });
      }

      // Validate transition
      const allowedTransitions =
        TASK_TRANSITIONS[
          task.status
        ];

      if (
        !allowedTransitions.includes(
          status
        )
      ) {
        return res.status(400).json({
          status: 400,
          code:
            "INVALID_STATUS_TRANSITION",
          message: `Cannot move task from ${task.status} to ${status}`,
        });
      }

      // Update status
      task.status = status;

      // Completion timestamp
      if (
        status === "DONE"
      ) {
        task.completedAt =
          new Date();
      }

        await task.save();
        await redisClient.del(
            `tasks:${task.assignee}:page=1:limit=10:status=all:priority=all:assignee=all`
        );
      return res.status(200).json({
        success: true,
        message:
          "Task status updated successfully",
        data: task,
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