import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { Lead } from '../types';
import { formatDate } from '../utils/dateUtils';
import '../styles/CRUDPages.css';

export const Leads: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    billingAddress: '',
    shippingAddress: '',
    country: 'India',
    state: '',
    city: '',
    pin: '',
    leadType: 'regular',
    status: 'new',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Strict number only for PIN
    if (name === 'pin') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate phone number per SRS Section 22.2
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate name per SRS Section 22.2 - Only alphabets
  const validateName = (name: string): boolean => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!validateName(formData.name)) {
      alert('Name must contain only alphabets');
      return;
    }

    if (!validatePhone(formData.phone)) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Validate PIN Code
    if (formData.pin && formData.pin.length !== 6) {
      alert('PIN Code must be exactly 6 digits');
      return;
    }

    if (editingId) {
      updateLead(editingId, formData as Lead);
      setEditingId(null);
    } else {
      addLead(formData as Lead);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      billingAddress: '',
      shippingAddress: '',
      country: 'India',
      state: '',
      city: '',
      pin: '',
      leadType: 'regular',
      status: 'new',
    });
  };

  const handleEdit = (lead: Lead) => {
    // Safely copy only editable fields to prevent ID/Timestamp pollution
    setFormData({
      name: lead.name,
      companyName: lead.companyName || '',
      contactPerson: lead.contactPerson || '',
      email: lead.email,
      phone: lead.phone,
      billingAddress: lead.billingAddress || '',
      shippingAddress: lead.shippingAddress || '',
      country: lead.country || 'India',
      state: lead.state || '',
      city: lead.city || '',
      pin: lead.pin || '',
      leadType: lead.leadType || 'regular',
      status: lead.status || 'new',
    });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: '#3b82f6',
      contacted: '#f59e0b',
      qualified: '#8b5cf6',
      won: '#10b981',
      lost: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getLeadTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      regular: 'Regular (0-5%)',
      bulk_buyer: 'Bulk Buyer (5-10%)',
      dealer: 'Dealer (10-15%)',
      special: 'Special',
    };
    return labels[type] || type;
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Lead'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem', color: '#475569' }}>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Customer/Company Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name (alphabets only)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  id="contactPerson"
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={handleInputChange}
                  placeholder="Enter contact person"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Mobile Number * (+91)</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="leadType">Lead Type (Discount Eligibility)</label>
                <select
                  id="leadType"
                  name="leadType"
                  value={formData.leadType || 'regular'}
                  onChange={handleInputChange}
                >
                  <option value="regular">Regular (0-5%)</option>
                  <option value="bulk_buyer">Bulk Buyer (5-10%)</option>
                  <option value="dealer">Dealer (10-15%)</option>
                  <option value="special">Special (Admin Controlled)</option>
                </select>
              </div>
            </div>

            {/* Address Information */}
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem', color: '#475569' }}>Address Information</h3>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="billingAddress">Billing Address *</label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress || ''}
                  onChange={handleInputChange}
                  placeholder="Enter billing address"
                  rows={2}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="shippingAddress">Shipping Address *</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shippingAddress === formData.billingAddress && !!formData.billingAddress}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, shippingAddress: prev.billingAddress }));
                        } else {
                          setFormData(prev => ({ ...prev, shippingAddress: '' }));
                        }
                      }}
                    />
                    Same as Billing Address
                  </label>
                </div>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress || ''}
                  onChange={handleInputChange}
                  placeholder="Enter shipping address"
                  rows={2}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pin">PIN Code</label>
                <input
                  id="pin"
                  type="text"
                  name="pin"
                  value={formData.pin || ''}
                  onChange={handleInputChange}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country || 'India'}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Status */}
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem', color: '#475569' }}>Lead Status</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-save">
                {editingId ? 'Update Lead' : 'Add Lead'}
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
        {leads.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Lead Type</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><span className="text-xs text-gray-500 font-mono">#{lead.id.slice(0, 8)}</span></td>
                  <td>{lead.name}</td>
                  <td>{lead.companyName || '-'}</td>
                  <td>{lead.email}</td>
                  <td>+91 {lead.phone}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                      {getLeadTypeLabel(lead.leadType || 'regular')}
                    </span>
                  </td>
                  <td>{lead.city || '-'}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${getStatusColor(lead.status)}20`,
                        color: getStatusColor(lead.status),
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(lead)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteLead(lead.id)}
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
            <p>No leads yet. Create your first lead to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
