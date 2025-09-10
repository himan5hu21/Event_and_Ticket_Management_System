import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

export default optionalAuth;
