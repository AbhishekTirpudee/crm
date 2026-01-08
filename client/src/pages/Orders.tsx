import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { Order } from '../types';
import { formatDate } from '../utils/dateUtils';
import '../styles/CRUDPages.css';

export const Orders: React.FC = () => {
  const { orders, leads, addOrder, updateOrder, deleteOrder } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({
    leadId: '',
    orderNumber: `ORD-${Date.now()}`,
    totalAmount: 0,
    status: 'pending',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalAmount' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadId || !formData.totalAmount) {
      alert('Please fill in required fields (Lead and Total Amount)');
      return;
    }

    if (editingId) {
      updateOrder(editingId, formData as Order);
      setEditingId(null);
    } else {
      addOrder(formData as Order);
    }

    setFormData({
      leadId: '',
      orderNumber: `ORD-${Date.now()}`,
      totalAmount: 0,
      status: 'pending',
    });
    setShowForm(false);
  };

  const handleEdit = (order: Order) => {
    setFormData(order);
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      leadId: '',
      orderNumber: `ORD-${Date.now()}`,
      totalAmount: 0,
      status: 'pending',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  // Get lead name for display
  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? (lead.companyName || lead.name) : 'Unknown';
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Order'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Edit Order' : 'Add New Order'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="orderNumber">Order #</label>
                <input
                  id="orderNumber"
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="leadId">Lead (Customer) *</label>
                <select
                  id="leadId"
                  name="leadId"
                  value={formData.leadId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a lead</option>
                  {leads.filter(l => l.status === 'qualified' || l.status === 'won').map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.companyName || lead.name} - {lead.email}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#64748b' }}>Orders must be created from qualified/won leads</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalAmount">Total Amount (₹) *</label>
                <input
                  id="totalAmount"
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Order' : 'Add Order'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        {orders.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order #</th>
                <th>Lead (Customer)</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td>{order.orderNumber}</td>
                  <td>{getLeadName(order.leadId)}</td>
                  <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(order)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No orders yet. Create your first order from a lead!</p>
          </div>
        )}
      </div>
    </div>
  );
};
