import React, { useState } from "react";
import { useCRM } from "../contexts/CRMContext";
import API from "../services/api";
import { Quotation, Item } from "../types";
import "../styles/CRUDPages.css";

export const Quotations: React.FC = () => {
  const { quotations, customers, addQuotation, deleteQuotation } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<Quotation>>({
    customerId: "",
    quotationNumber: `QUO-${Date.now()}`,
    items: [],
    taxRate: 0,
    discount: 0,
    discountType: "flat",
    currency: "USD",
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
      await addQuotation(formDataToSend);
    } else {
      await addQuotation(formData);
    }
    setShowForm(false);
    setSignatureFile(null);
    setFormData({
      customerId: "",
      quotationNumber: `QUO-${Date.now()}`,
      items: [],
      taxRate: 0,
      discount: 0,
      discountType: "flat",
      currency: "USD",
      notes: [],
      terms: [],
    });
  };

  const handleDownloadPDF = async (quotationNumber: string) => {
    try {
      const response = await API.get(`/quotations/pdf/${quotationNumber}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${quotationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error("Download failed:", err);
      alert("Failed to download PDF");
    }
  };

  return (
    <div className="crud-page page-quotation">
      <div className="page-header">
        <h1>Quotations</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Quotation"}
        </button>
      </div>

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quotation Number</label>
            <input
              type="text"
              value={formData.quotationNumber}
              onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
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
                <li key={idx}>{item.name} - {item.quantity} x ${item.price}</li>
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

          <button type="submit" className="btn btn-save-invoice">Save Quotation</button>
        </form >
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Quotation #</th>
            <th>Customer</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map(q => (
            <tr key={q.id}>
              <td>{q.quotationNumber}</td>
              <td>{customers.find(c => c.id === q.customerId)?.name || 'N/A'}</td>
              <td>{q.currency}</td>
              <td>
                <span className={`badge ${q.status}`}>{q.status}</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDownloadPDF(q.quotationNumber)}
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteQuotation(q.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div >
  );
};
