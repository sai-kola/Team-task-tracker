import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import authenticate from "./middleware/auth.middleware.js";
import authorize from "./middleware/role.middleware.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

import swaggerUi from "swagger-ui-express";

import swaggerDocument from "./docs/swagger.js";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  "/api-docs",

  swaggerUi.serve,

  swaggerUi.setup(
    swaggerDocument
  )
);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Team Task Tracker API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.get(
  "/api/protected",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message:
        "Protected route accessed",
      user: req.user,
    });
  }
);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

export default app;