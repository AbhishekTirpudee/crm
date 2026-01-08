import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// AUTH
app.use("/api/auth", authRoutes);

// CRM
app.use("/api/leads", leadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/audit", auditRoutes);

export default app;

