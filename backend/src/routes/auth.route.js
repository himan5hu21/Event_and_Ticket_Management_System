import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-in", loginUser);
router.post("/sign-up", registerUser);

router.get("/logout", logoutUser);

export default router;
