import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const YELLOW = "#FFD700";
const BLUE = "#193A7C";
const WHITE = "#FFFFFF";
const DARK_GREY = "#333333";
const LIGHT_GREY = "#F5F5F5";

export const generateQuotationPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        items, customer, quotationNumber, currency, taxRate,
        discount, discountType, notes, terms, status,
        validUntil, salesPersonId, shippingAddress, signature
      } = data;

      const pdfDir = "uploads/pdfs";
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const filename = `quotation-${quotationNumber}.pdf`;
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

      doc.fillColor(YELLOW).fontSize(30).text("OFFICIAL QUOTATION", 200, 35, { align: 'right' });
      doc.fillColor(WHITE).fontSize(10);
      doc.text(`Quotation #: ${quotationNumber}`, 200, 75, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 200, 90, { align: 'right' });
      if (validUntil) {
        doc.text(`Valid Until: ${new Date(validUntil).toLocaleDateString('en-GB')}`, 200, 105, { align: 'right' });
      }

      // -------- SELLER / CLIENT INFO -----------
      doc.moveDown(4);
      const startY = 160;

      // Seller Details
      doc.fillColor(BLUE).fontSize(12).text("PREPARED BY:", 40, startY, { underline: true });
      doc.fillColor(DARK_GREY).fontSize(10).font("Helvetica-Bold").text("Pancka T-Shirts Pvt Ltd", 40, startY + 20);
      doc.font("Helvetica").text("Phone: +91 7688929473", 40, startY + 35);
      doc.text("Email: info@pancka-creations.com", 40, startY + 50);
      doc.text("Address: Pancka HQ, India", 40, startY + 65, { width: 220 });

      // Client Details
      doc.fillColor(BLUE).fontSize(12).text("PREPARED FOR:", 320, startY, { underline: true });
      doc.fillColor(DARK_GREY).fontSize(10).font("Helvetica-Bold").text(customer.name || "N/A", 320, startY + 20);
      doc.font("Helvetica").text("Billing: " + (customer.address || "N/A"), 320, startY + 35, { width: 220 });
      if (shippingAddress) {
        doc.text("Shipping: " + shippingAddress, 320, startY + 65, { width: 220 });
      }
      doc.text(`Contact: ${customer.phone || "N/A"}`, 320, startY + 95);

      // -------- ITEM TABLE -----------
      const tableTop = 290;
      const col1 = 40;  // Item Details
      const col2 = 300; // Qty
      const col3 = 360; // Unit Price
      const col4 = 440; // Charges
      const col5 = 520; // Total

      doc.rect(col1, tableTop, 532, 25).fill(BLUE);
      doc.fillColor(YELLOW).fontSize(10).font("Helvetica-Bold");
      doc.text("T-Shirt Specifications & Design", col1 + 5, tableTop + 7);
      doc.text("Qty", col2, tableTop + 7);
      doc.text("Rate", col3, tableTop + 7);
      doc.text("Extras", col4, tableTop + 7);
      doc.text("Subtotal", col5, tableTop + 7);

      let currentY = tableTop + 25;
      doc.fillColor(DARK_GREY).font("Helvetica");

      items.forEach((item, index) => {
        const itemSubtotal = item.quantity * item.price;
        const extraCharges = item.charge_amounts ? item.charge_amounts.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
        const itemTotal = itemSubtotal + extraCharges;

        const specs = [];
        if (item.design_name) specs.push(`Design: ${item.design_name}`);
        if (item.size) specs.push(`Size: ${item.size}`);
        if (item.color) specs.push(`Color: ${item.color}`);
        if (item.fabric) specs.push(`Fabric: ${item.fabric}`);
        if (item.print_type) specs.push(`Print: ${item.print_type}`);

        const specString = specs.join(" | ");
        const rowHeight = specString ? 40 : 25;

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
      doc.fontSize(10).text("Estimation Subtotal:", summaryX, currentY + 20);
      doc.text(formatCurrency(subtotal), 510, currentY + 20);

      doc.text(`Estimated Tax (${taxRate}%):`, summaryX, currentY + 35);
      doc.text(formatCurrency(taxAmount), 510, currentY + 35);

      doc.rect(summaryX - 10, currentY + 60, 210, 30).fill(BLUE);
      doc.fillColor(YELLOW).fontSize(14).font("Helvetica-Bold").text("QUOTED TOTAL:", summaryX, currentY + 68);
      doc.text(formatCurrency(total), 500, currentY + 68);

      // -------- FOOTER --------
      const footerY = 620;
      doc.fillColor(BLUE).fontSize(10).font("Helvetica-Bold").text("QUOTATION TERMS:", 40, footerY);
      doc.fillColor(DARK_GREY).font("Helvetica").fontSize(9);
      doc.text("• This is a non-binding price offer.", 40, footerY + 15);
      doc.text("• Prices are subject to change based on final order volume.", 40, footerY + 27);
      doc.text("• Estimated delivery: 7-10 working days after confirmation.", 40, footerY + 39);

      doc.fontSize(8).text("Notes:", 40, footerY + 70);
      const allNotes = (notes || []).concat(terms || []);
      allNotes.slice(0, 3).forEach((note, i) => doc.text(`- ${note}`, 45, footerY + 82 + (i * 10)));

      // Signature area
      if (signature && fs.existsSync(signature)) {
        doc.image(signature, 400, footerY + 60, { width: 120 });
      }
      doc.fillColor(DARK_GREY).font("Helvetica-Bold").fontSize(10).text("Sales Representative Signature", 400, footerY + 95, { align: 'center' });
      doc.moveTo(380, footerY + 90).lineTo(550, footerY + 90).stroke();

      // Bottom bar
      doc.rect(0, 780, 612, 12).fill(BLUE);
      doc.fillColor(WHITE).fontSize(8).text("Pancka Creations - Delivering Excellence in Custom Apparel.", 0, 782, { align: 'center' });

      doc.end();
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
};
