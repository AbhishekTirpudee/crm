import React, { useState } from "react";
import { useCRM } from "../contexts/CRMContext";
import API from "../services/api";
import { Invoice, Item } from "../types";
import { formatDate } from "../utils/dateUtils";
import "../styles/CRUDPages.css";

export const Invoices: React.FC = () => {
  const { invoices, leads, addInvoice, deleteInvoice } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<Invoice>>({
    leadId: "",
    invoiceNumber: `INV-${Date.now()}`,
    items: [],
    taxRate: 0,
    discount: 0,
    discountType: "flat",
    currency: "INR",
    notes: [],
    terms: [],
  });

  const [newItem, setNewItem] = useState<Item>({
    name: "",
    quantity: 1,
    price: 0,
    chargeTypes: [],
    chargeAmounts: [],
  });

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0) {
      setFormData({
        ...formData,
        items: [...(formData.items || []), newItem],
      });
      setNewItem({
        name: "",
        quantity: 1,
        price: 0,
        chargeTypes: [],
        chargeAmounts: [],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signatureFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(formData));
      formDataToSend.append("signature", signatureFile);
      await addInvoice(formDataToSend);
    } else {
      await addInvoice(formData);
    }
    setShowForm(false);
    setSignatureFile(null);
    setFormData({
      leadId: "",
      invoiceNumber: `INV-${Date.now()}`,
      items: [],
      taxRate: 0,
      discount: 0,
      discountType: "flat",
      currency: "INR",
      notes: [],
      terms: [],
    });
  };

  const handleDownloadPDF = async (invoiceNumber: string) => {
    try {
      const response = await API.get(`/invoices/pdf/${invoiceNumber}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error("Download failed:", err);
      alert("Failed to download PDF");
    }
  };

  // Get lead name for display
  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? (lead.companyName || lead.name) : 'N/A';
  };

  return (
    <div className="crud-page page-invoice">
      <div className="page-header">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Invoice"}
        </button>
      </div>

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lead (Customer)</label>
            <select
              name="leadId"
              value={formData.leadId}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              required
            >
              <option value="">Select Lead</option>
              {leads.filter(l => l.status === 'qualified' || l.status === 'won').map(l => (
                <option key={l.id} value={l.id}>
                  {l.companyName || l.name} - {l.email}
                </option>
              ))}
            </select>
            <small style={{ color: '#64748b' }}>Only qualified/won leads are shown</small>
          </div>

          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              required
            />
          </div>

          <div className="items-section">
            <h3>Items</h3>
            <div className="item-row">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              />
              <button type="button" className="btn btn-add-item" onClick={handleAddItem}>+ Add</button>
            </div>
            <ul>
              {formData.items?.map((item, idx) => (
                <li key={idx}>{item.name} - {item.quantity} x ₹{item.price}</li>
              ))}
            </ul>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Discount</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: '1rem 0' }}>
            <label>Authorized Signature (Image File)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignatureFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button type="submit" className="btn btn-save-invoice">Save Invoice</button>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice #</th>
            <th>Lead (Customer)</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(i => (
            <tr key={i.id}>
              <td className="text-sm text-gray-500">{formatDate(i.createdAt)}</td>
              <td>{i.invoiceNumber}</td>
              <td>{getLeadName(i.leadId)}</td>
              <td>{i.currency}</td>
              <td>
                <span className={`badge ${i.status}`}>{i.status}</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDownloadPDF(i.invoiceNumber)}
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteInvoice(i.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
