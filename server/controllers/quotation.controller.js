import { db } from "../db/index.js";
import { quotations, invoiceItems, leads } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateQuotationPDF } from "../services/pdf/quotationPdf.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "signatures/"),
  filename: (req, file, cb) => cb(null, `sign-quo-${Date.now()}${path.extname(file.originalname)}`)
});
export const uploadSignQuo = multer({ storage });

export const createQuotation = async (req, res) => {
  try {
    const data = req.file ? JSON.parse(req.body.data) : req.body;
    const {
      leadId, quotationNumber, taxRate, discount, discountType,
      currency, notes, terms, items, validUntil, salesPersonId, shippingAddress
    } = data;

    const signaturePath = req.file ? req.file.path : null;

    // Validate lead exists
    if (leadId) {
      const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
      if (!lead) {
        return res.status(400).json({ message: "Lead not found" });
      }
    }

    const [quotation] = await db.insert(quotations).values({
      leadId,
      quotationNumber,
      taxRate,
      discount,
      discountType,
      currency,
      notes,
      terms,
      validUntil: validUntil ? new Date(validUntil) : null,
      salesPersonId,
      shippingAddress,
      signature: signaturePath
    }).returning();

    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        quotationId: quotation.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        chargeTypes: item.charge_types || item.chargeTypes,
        chargeAmounts: item.charge_amounts || item.chargeAmounts,
        designName: item.designName,
        size: item.size,
        color: item.color,
        fabric: item.fabric,
        printType: item.printType
      }));
      await db.insert(invoiceItems).values(itemsToInsert);
    }

    // Get lead data for PDF generation
    const [lead] = leadId ? await db.select().from(leads).where(eq(leads.id, leadId)) : [null];
    const fullQuo = { ...quotation, items, lead };
    const pdfPath = await generateQuotationPDF(fullQuo);

    res.json({ message: "Quotation created", quotation, pdfPath });
  } catch (error) {
    console.error("Create Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const data = await db.select().from(quotations).where(eq(quotations.isActive, true));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadQuotation = async (req, res) => {
  const filePath = `uploads/pdfs/quotation-${req.params.quotationNo}.pdf`;
  res.download(filePath);
};

// Soft delete quotation
export const deleteQuotation = async (req, res) => {
  try {
    const [data] = await db.update(quotations)
      .set({ isActive: false })
      .where(eq(quotations.id, req.params.id))
      .returning();
    res.json({ message: "Quotation deleted", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
