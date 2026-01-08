import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const YELLOW = "#FFD700";
const BLUE = "#193A7C";
const WHITE = "#FFFFFF";
const DARK_GREY = "#333333";
const LIGHT_GREY = "#F5F5F5";

export const generateInvoicePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        items, lead, invoiceNumber, currency, taxRate,
        discount, discountType, notes, terms, status,
        dueDate, paymentTerms, paymentMethod, paymentReference,
        paidAmount, balanceDue, bankDetails, gstin, pan, signature
      } = data;

      const pdfDir = "uploads/pdfs";
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const filename = `invoice-${invoiceNumber}.pdf`;
      const filePath = path.join(pdfDir, filename);
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const formatCurrency = (amount) => {
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
      };

      // -------- HEADER -----------
      doc.rect(0, 0, 612, 140).fill(BLUE);

      const logoPath = path.join(process.cwd(), "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 20, { height: 80 });
      }

      doc.fillColor(YELLOW).fontSize(30).text("TAX INVOICE", 200, 35, { align: 'right' });
      doc.fillColor(WHITE).fontSize(10);
      doc.text(`Invoice #: ${invoiceNumber}`, 200, 75, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 200, 90, { align: 'right' });
      if (dueDate) {
        doc.text(`Due Date: ${new Date(dueDate).toLocaleDateString('en-GB')}`, 200, 105, { align: 'right' });
      }

      // -------- SELLER / BUYER INFO -----------
      doc.moveDown(4);
      const startY = 160;

      // Seller Details
      doc.fillColor(BLUE).fontSize(12).text("FROM:", 40, startY, { underline: true });
      doc.fillColor(DARK_GREY).fontSize(10).font("Helvetica-Bold").text("Pancka T-Shirts Pvt Ltd", 40, startY + 20);
      doc.font("Helvetica").text("GSTIN: " + (process.env.COMPANY_GST || "Pending"), 40, startY + 35);
      doc.text("PAN: " + (process.env.COMPANY_PAN || "Pending"), 40, startY + 50);
      doc.text("Registered Address: " + (process.env.COMPANY_ADDRESS || "Pancka HQ, India"), 40, startY + 65, { width: 220 });

      // Buyer Details - Use lead instead of customer
      const clientName = lead?.companyName || lead?.name || "N/A";
      const clientAddress = lead?.billingAddress || lead?.address || "N/A";
      const clientPhone = lead?.phone || "N/A";
      const clientEmail = lead?.email || "N/A";

      doc.fillColor(BLUE).fontSize(12).text("BILL TO:", 320, startY, { underline: true });
      doc.fillColor(DARK_GREY).fontSize(10).font("Helvetica-Bold").text(clientName, 320, startY + 20);
      doc.font("Helvetica").text(clientAddress, 320, startY + 35, { width: 220 });
      doc.text(`Contact: ${clientPhone}`, 320, startY + 65);
      doc.text(`Email: ${clientEmail}`, 320, startY + 80);

      // -------- ITEM TABLE -----------
      const tableTop = 280;
      const col1 = 40;  // Item Details
      const col2 = 300; // Qty
      const col3 = 360; // Unit Price
      const col4 = 440; // Charges
      const col5 = 520; // Total

      doc.rect(col1, tableTop, 532, 25).fill(BLUE);
      doc.fillColor(YELLOW).fontSize(10).font("Helvetica-Bold");
      doc.text("Item Details (T-Shirt Specifications)", col1 + 5, tableTop + 7);
      doc.text("Qty", col2, tableTop + 7);
      doc.text("Price", col3, tableTop + 7);
      doc.text("Extras", col4, tableTop + 7);
      doc.text("Total", col5, tableTop + 7);

      let currentY = tableTop + 25;
      doc.fillColor(DARK_GREY).font("Helvetica");

      items.forEach((item, index) => {
        const itemSubtotal = item.quantity * item.price;
        const extraCharges = item.charge_amounts ? item.charge_amounts.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
        const itemTotal = itemSubtotal + extraCharges;

        // Calculate height based on specs
        const specs = [];
        if (item.design_name) specs.push(`Design: ${item.design_name}`);
        if (item.size) specs.push(`Size: ${item.size}`);
        if (item.color) specs.push(`Color: ${item.color}`);
        if (item.fabric) specs.push(`Fabric: ${item.fabric}`);
        if (item.print_type) specs.push(`Print: ${item.print_type}`);

        const specString = specs.join(" | ");
        const rowHeight = specString ? 40 : 25;

        // Striped Background
        if (index % 2 === 1) {
          doc.rect(col1, currentY, 532, rowHeight).fill(LIGHT_GREY);
        }
        doc.rect(col1, currentY, 532, rowHeight).stroke(BLUE);

        doc.fillColor(DARK_GREY).font("Helvetica-Bold").text(item.name, col1 + 5, currentY + 5);
        if (specString) {
          doc.font("Helvetica").fontSize(8).text(specString, col1 + 5, currentY + 18, { width: 250 });
        }

        doc.fontSize(10).font("Helvetica");
        doc.text(item.quantity.toString(), col2, currentY + 10);
        doc.text(formatCurrency(item.price), col3, currentY + 10);
        doc.text(formatCurrency(extraCharges), col4, currentY + 10);
        doc.text(formatCurrency(itemTotal), col5, currentY + 10);

        currentY += rowHeight;
      });

      // ---------- TOTALS SUMMARY ------------
      const subtotal = items.reduce((acc, item) => {
        const itemSubtotal = (item.quantity * item.price);
        const extraCharges = item.charge_amounts ? item.charge_amounts.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
        return acc + itemSubtotal + extraCharges;
      }, 0);

      let total = subtotal;
      const discountVal = parseFloat(discount || 0);
      if (discountType === 'percentage') {
        total -= (subtotal * discountVal / 100);
      } else {
        total -= discountVal;
      }
      const taxAmount = (total * parseFloat(taxRate || 0) / 100);
      total += taxAmount;

      const summaryX = 380;
      doc.fontSize(10).text("Subtotal:", summaryX, currentY + 20);
      doc.text(formatCurrency(subtotal), 510, currentY + 20);

      doc.text(`Tax (${taxRate}%):`, summaryX, currentY + 35);
      doc.text(formatCurrency(taxAmount), 510, currentY + 35);

      if (discountVal > 0) {
        doc.text(`Discount:`, summaryX, currentY + 50);
        doc.text(`-${formatCurrency(discountType === 'percentage' ? (subtotal * discountVal / 100) : discountVal)}`, 510, currentY + 50);
        currentY += 15;
      }

      doc.rect(summaryX - 10, currentY + 70, 210, 30).fill(BLUE);
      doc.fillColor(YELLOW).fontSize(14).font("Helvetica-Bold").text("GRAND TOTAL:", summaryX, currentY + 78);
      doc.text(formatCurrency(total), 500, currentY + 78);

      // -------- PAYMENT & FOOTER --------
      const footerY = 620;
      doc.fillColor(BLUE).fontSize(10).font("Helvetica-Bold").text("BANK DETAILS FOR PAYMENT:", 40, footerY);
      doc.fillColor(DARK_GREY).font("Helvetica").fontSize(9);
      doc.text("Account Name: Pancka T-Shirts Pvt Ltd", 40, footerY + 15);
      doc.text("Account Number: 1234567890", 40, footerY + 27);
      doc.text("IFSC Code: BANK0001234", 40, footerY + 39);
      doc.text("Bank Name: HDFC Bank", 40, footerY + 51);

      if (paymentMethod) {
        doc.fillColor(BLUE).font("Helvetica-Bold").text("PAYMENT INFO:", 320, footerY);
        doc.fillColor(DARK_GREY).font("Helvetica");
        doc.text(`Method: ${paymentMethod}`, 320, footerY + 15);
        doc.text(`Ref ID: ${paymentReference || "N/A"}`, 320, footerY + 27);
        doc.text(`Status: ${status?.toUpperCase() || "UNPAID"}`, 320, footerY + 39);
      }

      doc.fontSize(8).text("Notes/Terms:", 40, footerY + 80);
      const allNotes = [...(notes || []), ...(terms || [])];
      allNotes.slice(0, 4).forEach((note, i) => doc.text(`• ${note}`, 45, footerY + 92 + (i * 10)));

      // Signature area
      if (signature && fs.existsSync(signature)) {
        doc.image(signature, 400, footerY + 70, { width: 120 });
      }
      doc.fillColor(DARK_GREY).font("Helvetica-Bold").fontSize(10).text("Authorized Signature", 400, footerY + 105, { align: 'center' });
      doc.moveTo(380, footerY + 100).lineTo(550, footerY + 100).stroke();

      // Bottom bar
      doc.rect(0, 780, 612, 12).fill(BLUE);
      doc.fillColor(WHITE).fontSize(8).text("Thank you for your business! Visit again at Pancka Creations.", 0, 782, { align: 'center' });

      doc.end();
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
};
