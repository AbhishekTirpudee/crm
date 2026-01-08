import React, { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/Modal.css';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isLocked: boolean;
    loginAttempts: number;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await API.get('/auth/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleLock = async (user: User) => {
        try {
            const endpoint = user.isLocked ? `/auth/users/${user.id}/unlock` : `/auth/users/${user.id}/lock`;
            await API.post(endpoint);
            fetchUsers();
        } catch (error) {
            alert("Action failed");
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'sales' });
    const [newPassword, setNewPassword] = useState('');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', newUser);
            setShowCreateModal(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'sales' });
            fetchUsers();
            alert("User created successfully");
        } catch (error: any) {
            console.error("Create failed", error);
            alert(error.response?.data?.message || "Failed to create user. Please check if email already exists.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;
        try {
            await API.post(`/auth/users/${selectedUserId}/reset-password`, { newPassword });
            setShowResetModal(false);
            setNewPassword('');
            setSelectedUserId(null);
            alert("Password reset successfully");
        } catch (error) {
            alert("Reset failed");
        }
    };

    const openResetModal = (userId: string) => {
        setSelectedUserId(userId);
        setShowResetModal(true);
    };

    return (
        <div>
            <div className="user-management-header">
                <h2>User Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create User
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td><span className="badge badge-secondary">{user.role}</span></td>
                                <td>
                                    <span className={`user-status ${user.isLocked ? 'locked' : 'active'}`}>
                                        {user.isLocked ? 'Locked' : 'Active'}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => toggleLock(user)}
                                        className={`btn-sm ${user.isLocked ? 'btn-unlock' : 'btn-lock'}`}
                                        disabled={user.role === 'super_admin' || user.email === 'tirpudeabhishek212@gmail.com'}
                                        style={(user.role === 'super_admin' || user.email === 'tirpudeabhishek212@gmail.com') ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        {user.isLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                    <button
                                        onClick={() => openResetModal(user.id)}
                                        className="btn-sm btn-reset"
                                    >
                                        Reset Pass
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create New User</h3>
                            <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="user-profile-details">
                            <div className="form-group">
                                <label className="profile-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newUser.firstName}
                                    onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newUser.lastName}
                                    onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Role</label>
                                <select
                                    className="form-input"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="sales">Sales</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary mt-2">Create User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Reset Password</h3>
                            <button className="btn-close" onClick={() => setShowResetModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleResetPassword} className="user-profile-details">
                            <div className="form-group">
                                <label className="profile-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary mt-2">Reset Password</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
