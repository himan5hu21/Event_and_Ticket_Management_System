import jwt from "jsonwebtoken";
import env from "../config/env.js";

const generateToken = (userId, userRole) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
