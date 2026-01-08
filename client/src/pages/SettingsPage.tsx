import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { LeadTransfer } from './LeadTransfer';
import { SalesConfig } from './SalesConfig';
import '../styles/Settings.css';

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'user' | 'transfer' | 'sales'>('user');

    // Strict check for super admin (assuming role 'super-admin' or 'admin')
    // For now, we'll allow 'admin' or just check if user exists, but in prod enforce 'super_admin'
    if (user?.role !== 'super_admin') {
        return (
            <div className="access-denied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>System Settings</h1>
            </div>

            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user')}
                >
                    User Management
                </button>
                <button
                    className={`settings-tab ${activeTab === 'transfer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transfer')}
                >
                    Lead Transfer
                </button>
                <button
                    className={`settings-tab ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    Sales Settings
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'user' && <UserManagement />}
                {activeTab === 'transfer' && <LeadTransfer />}
                {activeTab === 'sales' && <SalesConfig />}
            </div>
        </div>
    );
};
