import { db } from "../db/index.js";
import { quotations, invoiceItems, customers } from "../db/schema.js";
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
      customerId, quotationNumber, taxRate, discount, discountType,
      currency, notes, terms, items, validUntil, salesPersonId, shippingAddress
    } = data;

    const signaturePath = req.file ? req.file.path : null;

    const [quotation] = await db.insert(quotations).values({
      customerId,
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

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
    const fullQuo = { ...quotation, items, customer };
    const pdfPath = await generateQuotationPDF(fullQuo);

    res.json({ message: "Quotation created", quotation, pdfPath });
  } catch (error) {
    console.error("Create Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const data = await db.select().from(quotations);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadQuotation = async (req, res) => {
  const filePath = `uploads/pdfs/quotation-${req.params.quotationNo}.pdf`;
  res.download(filePath);
};
