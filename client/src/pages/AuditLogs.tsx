import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AuditLog } from '../types';
import { formatDate } from '../utils/dateUtils';

export const AuditLogs: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'super_admin') {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await API.get('/audit');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'super_admin') {
        return <div className="p-4 text-center">Access Denied. Super Admin only.</div>;
    }

    return (
        <div className="crud-page">
            <div className="flex-between mb-4">
                <h2>System Audit Logs</h2>
                <button className="btn btn-secondary" onClick={fetchLogs}>
                    ↻ Refresh
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center p-4">Loading logs...</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Timestamp (DP:MM:YYYY)</th>
                                    <th>Action</th>
                                    <th>Performed By</th>
                                    <th>Entity</th>
                                    <th>Details (Old &rarr; New)</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="text-sm">{formatDate(log.timestamp)}</td>
                                        <td className="font-medium">{log.action}</td>
                                        <td>{log.performedBy || 'System'}</td>
                                        <td>{log.affectedEntity}</td>
                                        <td className="text-sm">
                                            {log.oldValue && (
                                                <div className="text-muted line-through">
                                                    {JSON.stringify(log.oldValue)}
                                                </div>
                                            )}
                                            {log.newValue && (
                                                <div className="text-success">
                                                    {JSON.stringify(log.newValue)}
                                                </div>
                                            )}
                                            {!log.oldValue && !log.newValue && '-'}
                                        </td>
                                        <td className="text-sm text-muted">{log.ipAddress || '-'}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4">No audit logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
