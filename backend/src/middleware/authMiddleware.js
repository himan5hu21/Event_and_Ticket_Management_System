import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.error("Not authorized, token missing", 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.error("Not authorized, token invalid", 401);
  }
};

export default protect;
