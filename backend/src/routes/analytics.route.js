import express from "express";
import { getDashboardStats } from "../controllers/analytics.controller.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/dashboard", protect, getDashboardStats);

export default router;
