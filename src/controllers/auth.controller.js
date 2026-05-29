export const register = async (
  req,
  res
) => {
  res.json({
    message: "Register API",
  });
};

export const login = async (
  req,
  res
) => {
  res.json({
    message: "Login API",
  });
};

export const refreshToken = async (
  req,
  res
) => {
  res.json({
    message: "Refresh API",
  });
};

export const logout = async (
  req,
  res
) => {
  res.json({
    message: "Logout API",
  });
};