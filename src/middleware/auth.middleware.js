import jwt from "jsonwebtoken";

const authenticate = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // Check token
    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        status: 401,
        code: "UNAUTHORIZED",
        message:
          "Access token missing",
      });
    }

    // Extract token
    const token =
      authHeader.split(" ")[1];

    // Verify JWT
    const decoded =
      jwt.verify(
        token,
        process.env
          .JWT_ACCESS_SECRET
      );

    // Attach user
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      code: "INVALID_TOKEN",
      message:
        "Invalid or expired token",
    });
  }
};

export default authenticate;