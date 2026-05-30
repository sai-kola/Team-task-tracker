const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    try {
      const userRole =
        req.user.role;

      if (
        !allowedRoles.includes(
          userRole
        )
      ) {
        return res.status(403).json({
          status: 403,
          code: "FORBIDDEN",
          message:
            "Access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 500,
        code: "SERVER_ERROR",
        message:
          "Something went wrong",
      });
    }
  };

export default authorize;