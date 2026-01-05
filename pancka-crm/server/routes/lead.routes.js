import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead
} from "../controllers/lead.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);

export default router;
