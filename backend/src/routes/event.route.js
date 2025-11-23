import express from "express";
import checkEventPermission from "../middleware/checkEventPermission.js";
import {
  cancelEvent,
  createEvent,
  deleteEvent,
  getAllEvents,
  getOwnedEvent,
  rejectEvent,
  singleEvent,
  updateEvent,
  verifyEvent,
} from "../controllers/event.controller.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import optionalAuth from "../middleware/optionalAuth.js";
import upload from "../utils/multer.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("Event Router hit:", req.method, req.url);
  next();
});

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

router.patch("/list/:eventId/cancel", protect, cancelEvent);

// Admin
router.patch("/verify/:eventId", protect, checkAdmin, verifyEvent);
router.patch("/reject/:eventId", protect, checkAdmin, rejectEvent);

// Admin: Mark/unmark event as featured
router.put("/feature/:eventId", protect, checkAdmin, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { featured } = req.body;
    const event = await (await import("../models/event.model.js")).default.findByIdAndUpdate(
      eventId,
      { featured: !!featured },
      { new: true }
    );
    if (!event) return res.notFound("Event not found");
    res.success(event, `Event ${featured ? "marked as" : "removed from"} featured`);
  } catch (err) {
    next(err);
  }
});

export default router;
