import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/DashboardLayout.css';
import '../styles/Modal.css';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Leads', path: '/leads', icon: '👥' },
    { label: 'Products', path: '/products', icon: '👕' },
    { label: 'Orders', path: '/orders', icon: '📦' },
    { label: 'Quotations', path: '/quotations', icon: '📄' },
    { label: 'Invoices', path: '/invoices', icon: '💰' },
    { label: 'Inventory', path: '/inventory', icon: '🏭' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} flex flex-col`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className={sidebarOpen ? '' : 'hidden'}>
            <h1 className="logo-title">Pancka CRM</h1>
            <p className="logo-subtitle">T-Shirt Sales</p>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
          {/* Audit Logs for Super Admin */}
          {user?.role === 'super_admin' && (
            <Link
              to="/audit"
              className={`nav-item ${isActive('/audit') ? 'active' : ''}`}
            >
              <span className="nav-icon">🛡️</span>
              {sidebarOpen && <span className="nav-label">Audit Logs</span>}
            </Link>
          )}
        </nav>

        {/* User Profile (Bottom Left) */}
        {sidebarOpen && user && (
          <div
            className="p-4 border-t border-gray-700 bg-gray-800 cursor-pointer hover:bg-gray-700 transition"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            🚪
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <h2 className="header-title">
            {navItems.find(i => isActive(i.path))?.label || "Dashboard"}
          </h2>

          <div className="header-right">
            {/* Settings Link (Top Right) */}
            <Link to="/settings" className="settings-link">
              ⚙️ Settings
            </Link>

            <div className="divider"></div>

            <div className="user-info-header cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* User Profile Modal */}
      {showProfileModal && user && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Profile</h2>
              <button className="btn-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="user-profile-details">
              <div className="profile-avatar-large">
                {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="profile-field">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'N/A'}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Role</span>
                <span className="profile-value capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

