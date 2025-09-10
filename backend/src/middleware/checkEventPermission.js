import User from "../models/user.model.js";

const checkEventPermission = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.unauthorized("User not found");
    }

    if (user.role !== "event-manager" && user.role !== "admin") {
      return res.forbidden(
        "Only organizers or admins can create, update and delete events"
      );
    }

    if (user.role === "event-manager" && !user.verified) {
      return res.forbidden("organizer account not verified by admin");
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkEventPermission;
