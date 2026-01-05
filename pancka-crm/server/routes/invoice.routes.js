import express from "express";
import { createInvoice, getInvoices, downloadInvoice, uploadSign } from "../controllers/invoice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, uploadSign.single("signature"), createInvoice);
router.get("/pdf/:invoiceNo", protect, downloadInvoice);

export default router;

// import express from "express";
// import {
//   getInvoices,
//   createInvoice,
//   deleteInvoice,
//   downloadInvoice
// } from "../controllers/invoice.controller.js";
// import { protect } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// /* ================= CRUD ================= */

// // Get all invoices
// router.get("/", protect, getInvoices);

// // Create invoice
// router.post("/", protect, createInvoice);

// // Delete invoice
// router.delete("/:id", protect, deleteInvoice);

// /* ================= PDF ================= */

// // Download invoice PDF
// router.get("/pdf/:invoiceNo", protect, downloadInvoice);

// export default router;
