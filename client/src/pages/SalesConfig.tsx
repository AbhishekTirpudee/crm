import React, { useState, useEffect } from 'react';
import API from '../services/api';

export const SalesConfig: React.FC = () => {
    const [statuses, setStatuses] = useState({
        lead: 'new,contacted,qualified,won,lost',
        order: 'pending,processing,shipped,delivered,cancelled',
        invoice: 'unpaid,paid,overdue',
        quotation: 'draft,sent,accepted,rejected'
    });
    const [loginLimit, setLoginLimit] = useState(5);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await API.get('/settings');
                const data = res.data;
                if (data) {
                    setStatuses({
                        lead: data.statuses?.lead || 'new,contacted,qualified,won,lost',
                        order: data.statuses?.order || 'pending,processing,shipped,delivered,cancelled',
                        invoice: data.statuses?.invoice || 'unpaid,paid,overdue',
                        quotation: data.statuses?.quotation || 'draft,sent,accepted,rejected'
                    });
                    if (data.login_limit) setLoginLimit(data.login_limit);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await API.post('/settings', {
                key: 'statuses',
                value: statuses
            });
            await API.post('/settings', {
                key: 'login_limit',
                value: loginLimit
            });
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Failed to save settings");
        }
    };

    return (
        <div className="sales-config-container">
            <div className="config-section">
                <h2 className="mb-3">Sales Configurations</h2>

                <div className="grid grid-2 gap-4">
                    <div className="form-group">
                        <label>Lead Statuses (comma separated)</label>
                        <textarea
                            rows={3}
                            value={statuses.lead}
                            onChange={(e) => setStatuses({ ...statuses, lead: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Order Statuses</label>
                        <textarea
                            rows={3}
                            value={statuses.order}
                            onChange={(e) => setStatuses({ ...statuses, order: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Invoice Statuses</label>
                        <textarea
                            rows={3}
                            value={statuses.invoice}
                            onChange={(e) => setStatuses({ ...statuses, invoice: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Quotation Statuses</label>
                        <textarea
                            rows={3}
                            value={statuses.quotation}
                            onChange={(e) => setStatuses({ ...statuses, quotation: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            <div className="config-section">
                <h3 className="mb-3">Security Settings</h3>
                <div className="form-group" style={{ maxWidth: '300px' }}>
                    <label>Max Login Attempts (before lock)</label>
                    <input
                        type="number"
                        value={loginLimit}
                        onChange={(e) => setLoginLimit(parseInt(e.target.value))}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="text-right">
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
