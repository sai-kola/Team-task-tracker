import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // MongoDB Connection
    await connectDB();

    // Redis Connection
    await connectRedis();

    // Start Server
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );
  }
};

startServer();