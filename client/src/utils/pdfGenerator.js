import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= QUOTATION PDF ================= */

export const generateQuotationPDF = (quotation) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("QUOTATION", pageWidth / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Pancka CRM - T-Shirt E-Commerce", 20, y);
  y += 5;
  doc.text("Email: info@pancka-crm.com", 20, y);
  y += 5;
  doc.text("Phone: +1-800-123-4567", 20, y);

  y += 10;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Quotation ID: ${quotation._id}`, 20, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 5;
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 20, y);

  y += 10;
  doc.text("Bill To:", 20, y);
  y += 5;
  doc.text(quotation.customerName || "Customer", 20, y);

  autoTable(doc, {
    startY: y + 10,
    head: [["Product", "Qty", "Price", "Total"]],
    body:
      quotation.items?.length > 0
        ? quotation.items.map((i) => [
            i.productName,
            i.quantity,
            `$${i.price}`,
            `$${i.quantity * i.price}`,
          ])
        : [["-", "-", "-", "-"]],
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(
    `Total Amount: $${quotation.totalAmount.toFixed(2)}`,
    pageWidth - 20,
    y,
    { align: "right" }
  );

  doc.save(`Quotation-${quotation._id}.pdf`);
};

/* ================= INVOICE PDF ================= */

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(22, 163, 74);
  doc.text("INVOICE", pageWidth / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Pancka CRM - T-Shirt E-Commerce", 20, y);
  y += 5;
  doc.text("Email: info@pancka-crm.com", 20, y);
  y += 5;
  doc.text("Phone: +1-800-123-4567", 20, y);

  y += 10;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Invoice ID: ${invoice._id}`, 20, y);
  y += 5;
  doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 20, y);
  y += 5;
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, y);

  y += 10;
  doc.text("Bill To:", 20, y);
  y += 5;
  doc.text(invoice.customerName || "Customer", 20, y);

  autoTable(doc, {
    startY: y + 10,
    head: [["Product", "Qty", "Price", "Total"]],
    body:
      invoice.items?.length > 0
        ? invoice.items.map((i) => [
            i.productName,
            i.quantity,
            `$${i.price}`,
            `$${i.quantity * i.price}`,
          ])
        : [["-", "-", "-", "-"]],
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(
    `Total Amount: $${invoice.totalAmount.toFixed(2)}`,
    pageWidth - 20,
    y,
    { align: "right" }
  );

  doc.save(`Invoice-${invoice._id}.pdf`);
};
