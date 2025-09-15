import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getMe,
} from "../controllers/auth.controller.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sign-in", loginUser);
router.post("/sign-up", registerUser);

router.get("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
