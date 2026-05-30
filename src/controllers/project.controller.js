import Project from "../models/Project.js";

export const createProject =
  async (req, res) => {
    try {
      const {
        name,
        description,
      } = req.body;

      const project =
        await Project.create({
          name,
          description,
          organizationId:
            req.user
              .organizationId,
          createdBy:
            req.user.userId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Project created successfully",
        data: project,
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

export const getProjects =
  async (req, res) => {
    try {
      const projects =
        await Project.find({
          organizationId:
            req.user
              .organizationId,
        }).populate(
          "createdBy",
          "name email role"
        );

      return res.status(200).json({
        success: true,
        count:
          projects.length,
        data: projects,
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

export const getProjectById =
  async (req, res) => {
    try {
      const { id } = req.params;

      const project =
        await Project.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        }).populate(
          "createdBy",
          "name email role"
        );

      if (!project) {
        return res.status(404).json({
          status: 404,
          code: "PROJECT_NOT_FOUND",
          message:
            "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
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

export const updateProject =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        description,
      } = req.body;

      const project =
        await Project.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        });

      // Not found
      if (!project) {
        return res.status(404).json({
          status: 404,
          code: "PROJECT_NOT_FOUND",
          message:
            "Project not found",
        });
      }

      // Partial update
      if (name !== undefined) {
        project.name = name;
      }

      if (
        description !==
        undefined
      ) {
        project.description =
          description;
      }

      await project.save();

      return res.status(200).json({
        success: true,
        message:
          "Project updated successfully",
        data: project,
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

export const deleteProject =
  async (req, res) => {
    try {
      const { id } = req.params;

      const project =
        await Project.findOne({
          _id: id,
          organizationId:
            req.user
              .organizationId,
        });

      // Not found
      if (!project) {
        return res.status(404).json({
          status: 404,
          code: "PROJECT_NOT_FOUND",
          message:
            "Project not found",
        });
      }

      await project.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Project deleted successfully",
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