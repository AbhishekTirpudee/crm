import React from 'react';
import { useCRM } from '../contexts/CRMContext';

export const DashboardCards: React.FC = () => {
    const { leads, orders, quotations, invoices, products } = useCRM();

    // Count won leads as "customers"
    const wonLeads = leads.filter(l => l.status === 'won').length;

    const stats = [
        {
            label: 'Total Leads',
            value: leads.length,
            icon: '👥',
            color: '#3b82f6',
        },
        {
            label: 'Won Leads',
            value: wonLeads,
            icon: '🏆',
            color: '#10b981',
        },
        {
            label: 'Total Orders',
            value: orders.length,
            icon: '📦',
            color: '#f59e0b',
        },
        {
            label: 'Total Revenue',
            value: `₹${(orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)).toFixed(2)}`,
            icon: '💰',
            color: '#8b5cf6',
        },
    ];

    const recentLeads = leads.slice(0, 5);
    const recentOrders = orders.slice(0, 5);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: '#3b82f6',
            contacted: '#f59e0b',
            qualified: '#8b5cf6',
            proposal: '#06b6d4',
            won: '#10b981',
            lost: '#ef4444',
            pending: '#f59e0b',
            processing: '#3b82f6',
            shipped: '#8b5cf6',
            delivered: '#10b981',
            cancelled: '#ef4444',
        };
        return colors[status] || '#64748b';
    };

    // Helper to get lead name for order display
    const getLeadName = (leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        return lead ? (lead.companyName || lead.name) : 'Unknown';
    };

    return (
        <div>
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h2>Recent Leads</h2>
                        <a href="/leads" className="link-view-all">View All →</a>
                    </div>
                    {recentLeads.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>{lead.companyName || lead.name}</td>
                                        <td>{lead.email}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-state">No leads yet</p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Recent Orders</h2>
                        <a href="/orders" className="link-view-all">View All →</a>
                    </div>
                    {recentOrders.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Lead</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id.slice(0, 8)}</td>
                                        <td>{getLeadName(order.leadId)}</td>
                                        <td>₹{parseFloat(order.totalAmount.toString()).toFixed(2)}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-state">No orders yet</p>
                    )}
                </div>
            </div>

            <div className="dashboard-grid mt-4">
                <div className="card">
                    <h3>Products</h3>
                    <p className="stat-value">{products.length}</p>
                    <p className="text-muted">Total products in catalog</p>
                </div>

                <div className="card">
                    <h3>Quotations</h3>
                    <p className="stat-value">{quotations.length}</p>
                    <p className="text-muted">Total quotations sent</p>
                </div>

                <div className="card">
                    <h3>Invoices</h3>
                    <p className="stat-value">{invoices.length}</p>
                    <p className="text-muted">Total invoices generated</p>
                </div>

                <div className="card">
                    <h3 style={{ color: '#3b82f6' }}>Conversion Rate</h3>
                    <p className="stat-value">
                        {leads.length > 0
                            ? ((wonLeads / leads.length) * 100).toFixed(1)
                            : 0}
                        %
                    </p>
                    <p className="text-muted">Lead to won conversion</p>
                </div>
            </div>
        </div>
    );
};
