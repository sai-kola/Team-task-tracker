const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Team Task Tracker API",
    version: "1.0.0",
    description:
      "SDE II Take Home Assignment - Team Task Tracker API",
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],

  tags: [
    {
      name: "Auth",
      description: "Authentication APIs",
    },
    {
      name: "Projects",
      description: "Project Management APIs",
    },
    {
      name: "Tasks",
      description: "Task Management APIs",
    },
  ],

  paths: {
    // =========================
    // AUTH
    // =========================

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",

                example: {
                  name: "Admin User",
                  email:
                    "admin@gmail.com",
                  password:
                    "123456",
                  role: "ADMIN",
                },
              },
            },
          },
        },

        responses: {
          201: {
            description:
              "User registered successfully",
          },

          400: {
            description:
              "Validation error",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                example: {
                  email:
                    "admin@gmail.com",
                  password:
                    "123456",
                },
              },
            },
          },
        },

        responses: {
          200: {
            description:
              "Login successful",
          },

          401: {
            description:
              "Invalid credentials",
          },
        },
      },
    },

    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary:
          "Refresh access token",

        responses: {
          200: {
            description:
              "Token refreshed successfully",
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",

        responses: {
          200: {
            description:
              "Logout successful",
          },
        },
      },
    },

    "/api/protected": {
      get: {
        tags: ["Auth"],
        summary:
          "Protected route test",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description:
              "Protected route success",
          },

          401: {
            description:
              "Unauthorized",
          },
        },
      },
    },

    // =========================
    // PROJECTS
    // =========================

    "/api/projects": {
      post: {
        tags: ["Projects"],
        summary:
          "Create Project",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                example: {
                  name:
                    "Task Tracker Project",

                  description:
                    "Build backend API for task tracker",
                },
              },
            },
          },
        },

        responses: {
          201: {
            description:
              "Project created successfully",
          },

          403: {
            description:
              "Forbidden",
          },
        },
      },

      get: {
        tags: ["Projects"],
        summary:
          "Get all projects",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description:
              "Projects fetched successfully",
          },
        },
      },
    },

    "/api/projects/{id}": {
      put: {
        tags: ["Projects"],
        summary:
          "Update project",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          content: {
            "application/json": {
              schema: {
                example: {
                  name:
                    "Updated Project",
                  description:
                    "Updated Description",
                },
              },
            },
          },
        },

        responses: {
          200: {
            description:
              "Project updated successfully",
          },
        },
      },

      delete: {
        tags: ["Projects"],
        summary:
          "Delete project",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description:
              "Project deleted successfully",
          },
        },
      },
    },

    // =========================
    // TASKS
    // =========================

    "/api/tasks": {
      post: {
        tags: ["Tasks"],
        summary:
          "Create task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                example: {
                  title:
                    "Implement JWT",

                  description:
                    "Build authentication flow",

                  priority:
                    "HIGH",

                  assignee:
                    "USER_ID",

                  dueDate:
                    "2026-06-30",

                  projectId:
                    "PROJECT_ID",
                },
              },
            },
          },
        },

        responses: {
          201: {
            description:
              "Task created successfully",
          },
        },
      },

      get: {
        tags: ["Tasks"],
        summary:
          "Get tasks with pagination and filtering",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "number",
            },
            example: 1,
          },

          {
            name: "limit",
            in: "query",
            schema: {
              type: "number",
            },
            example: 10,
          },

          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "TODO",
                "IN_PROGRESS",
                "IN_REVIEW",
                "DONE",
                "BLOCKED",
              ],
            },
          },

          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "LOW",
                "MEDIUM",
                "HIGH",
              ],
            },
          },

          {
            name: "assignee",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description:
              "Tasks fetched successfully",
          },
        },
      },
    },

    "/api/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary:
          "Update task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          content: {
            "application/json": {
              schema: {
                example: {
                  title:
                    "Updated Task",
                  priority:
                    "HIGH",
                },
              },
            },
          },
        },

        responses: {
          200: {
            description:
              "Task updated successfully",
          },
        },
      },

      delete: {
        tags: ["Tasks"],
        summary:
          "Delete task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description:
              "Task deleted successfully",
          },
        },
      },
    },

    "/api/tasks/{id}/status":
      {
        patch: {
          tags: ["Tasks"],
          summary:
            "Update task status",

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type:
                  "string",
              },
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json":
                {
                  schema: {
                    example:
                      {
                        status:
                          "IN_PROGRESS",
                      },
                  },
                },
            },
          },

          responses: {
            200: {
              description:
                "Task status updated successfully",
            },

            400: {
              description:
                "Invalid status transition",
            },
          },
        },
      },
  },
};

export default swaggerDocument;