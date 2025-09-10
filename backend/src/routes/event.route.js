import express from "express";
import protect from "../middleware/authMiddleware.js";
import checkEventPermission from "../middleware/checkEventPermission.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getOwnedEvent,
  singleEvent,
  updateEvent,
  verifyEvent,
} from "../controllers/event.controller.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import optionalAuth from "../middleware/optionalAuth.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkEventPermission,
  upload.single("image"),
  createEvent
);

router.put(
  "/update/:eventId",
  protect,
  checkEventPermission,
  upload.single("image"),
  updateEvent
);

router.delete("/delete/:eventId", protect, checkEventPermission, deleteEvent);
router.get("/list", optionalAuth, getAllEvents);
router.get("/list/:eventId", singleEvent);
router.get("/owner/", protect, checkEventPermission, getOwnedEvent);

// Admin
router.put("/verify/:eventId", protect, checkAdmin, verifyEvent);

export default router;
