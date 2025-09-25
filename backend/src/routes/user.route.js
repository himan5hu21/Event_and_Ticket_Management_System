import express from "express";
import protect from "../middleware/authMiddleware.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import {
    getAllUsers,
    singleUser,
    verifyUser,
    userProfile,
    updateUser, 
    updateProfile,
    deleteUser,
    unverifyUser
} from "../controllers/user.controller.js";

const router = express.Router();

// Admin protected routes
router.get("/", protect, checkAdmin, getAllUsers); // Get all users (Admin only)
router.get("/:userId", protect, checkAdmin, singleUser); // Get single user (Admin only)
router.put("/:userId", protect, checkAdmin, updateUser); // Update user (Admin only)
router.delete("/:userId", protect, checkAdmin, deleteUser); // Delete user (Admin only)

/**
 * @route   PATCH /api/users/verify/:userId
 * @desc    Verify an event manager (Admin only)
 * @access  Private/Admin
 * @params  {string} userId - ID of the user to verify
 * @returns {Object} Returns success/error message with user data
 */
router.patch("/:userId/verify", protect, checkAdmin, verifyUser);

/**
 * @route   PATCH /api/users/unverify/:userId
 * @desc    Unverify an event manager (Admin only)
 * @access  Private/Admin
 * @params  {string} userId - ID of the user to unverify
 * @returns {Object} Returns success/error message with user data
 */
router.patch("/:userId/unverify", protect, checkAdmin, unverifyUser);

// User profile routes
router.get("/profile", protect, userProfile); // Get current user's profile
router.put("/profile/update", protect, updateProfile); // Update current user's profile

export default router;
