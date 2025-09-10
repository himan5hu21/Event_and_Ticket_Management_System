import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getOrderDetails,
  getAllOrders,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/verify", protect, verifyPayment);
router.post("/:eventId", protect, createOrder);
router.get("/:orderId", protect, getOrderDetails);


router.get("/", protect, getAllOrders);

export default router;
