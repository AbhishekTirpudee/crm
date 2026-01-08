import express from "express";
import { createQuotation, downloadQuotation, uploadSignQuo, getQuotations, deleteQuotation } from "../controllers/quotation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Standard CRUD
router.get("/", protect, getQuotations);
router.post("/", protect, uploadSignQuo.single("signature"), createQuotation);
router.delete("/:id", protect, deleteQuotation);

// PDF
router.get("/pdf/:quotationNo", protect, downloadQuotation);

export default router;

// import express from "express";
// import {
//   getQuotations,
//   createQuotation,
//   deleteQuotation,
//   downloadQuotation
// } from "../controllers/quotation.controller.js";
// import { protect } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// /* ================= CRUD ================= */

// // Get all quotations
// router.get("/", protect, getQuotations);

// // Create quotation
// router.post("/", protect, createQuotation);

// // Delete quotation
// router.delete("/:id", protect, deleteQuotation);

// /* ================= PDF ================= */

// // Download quotation PDF
// router.get("/pdf/:quotationNo", protect, downloadQuotation);

// export default router;
