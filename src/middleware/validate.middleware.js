const validate =
  (schema) =>
  (req, res, next) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      return res.status(400).json({
        status: 400,
        code:
          "VALIDATION_ERROR",
        message:
          error.issues?.[0]
            ?.message ||
          "Validation failed",
      });
    }
  };

export default validate;