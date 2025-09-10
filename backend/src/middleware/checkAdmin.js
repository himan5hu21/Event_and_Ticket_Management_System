export const checkAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.error("Unauthorized: No user found");
    }

    if (req.user.role !== "admin") {
      return res.forbidden("You are not authorized to perform this action");
    }
    next();
  } catch (err) {
    next(err);
  }
};
