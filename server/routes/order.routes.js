import express from "express";
import {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.post("/", protect, createOrder);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router;
