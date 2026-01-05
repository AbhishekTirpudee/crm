import { db } from "../db/index.js";
import { invoices, invoiceItems, customers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateInvoicePDF } from "../services/pdf/invoicePdf.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "signatures/"),
  filename: (req, file, cb) => cb(null, `sign-${Date.now()}${path.extname(file.originalname)}`)
});
export const uploadSign = multer({ storage });

export const createInvoice = async (req, res) => {
  try {
    const data = req.file ? JSON.parse(req.body.data) : req.body;
    const {
      customerId, invoiceNumber, taxRate, discount, discountType,
      currency, notes, terms, items, dueDate, paymentTerms, paymentMethod,
      paymentReference, paidAmount, balanceDue, bankDetails, gstin, pan
    } = data;

    const signaturePath = req.file ? req.file.path : null;

    const [invoice] = await db.insert(invoices).values({
      customerId,
      invoiceNumber,
      taxRate,
      discount,
      discountType,
      currency,
      notes,
      terms,
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentTerms,
      paymentMethod,
      paymentReference,
      paidAmount,
      balanceDue,
      bankDetails,
      gstin,
      pan,
      signature: signaturePath
    }).returning();

    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        invoiceId: invoice.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        chargeTypes: item.charge_types || item.chargeTypes, // Handle both
        chargeAmounts: item.charge_amounts || item.chargeAmounts,
        designName: item.designName,
        size: item.size,
        color: item.color,
        fabric: item.fabric,
        printType: item.printType
      }));
      await db.insert(invoiceItems).values(itemsToInsert);
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
    const fullInvoice = { ...invoice, items, customer };
    const pdfPath = await generateInvoicePDF(fullInvoice);

    res.json({ message: "Invoice created", invoice, pdfPath });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const data = await db.select().from(invoices);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  const filePath = `uploads/pdfs/invoice-${req.params.invoiceNo}.pdf`;
  res.download(filePath);
};
