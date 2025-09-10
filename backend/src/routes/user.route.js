import express from "express";
import protect from "../middleware/authMiddleware.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import {
    getAllUsers,
    singleUser,
    verifyUser,
    userProfile,
    updateUser, updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, checkAdmin, getAllUsers);
router.put("/verify/:userId", protect, checkAdmin, verifyUser);
router.get("/profile", protect, userProfile);
router.put("/profile/update", protect, updateProfile);
router.get("/:userId", protect, checkAdmin, singleUser);
router.put("/:userId", protect, checkAdmin, updateUser);

export default router;
