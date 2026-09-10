import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  CheckSquare,
  DollarSign,
  Briefcase,
  Shield,
  BarChart2,
  FileText,
  Wifi,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { COMPANY_BRANDING } from '../../../constants/branding';
import './HRSidebar.css';

interface HRSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const HRSidebar: React.FC<HRSidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const workspaceNav = [
    { label: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={19} /> },
  ];

  const managementNav = [
    { label: 'Organization', path: '/hr/organization', icon: <Building2 size={19} /> },
    { label: 'Employees', path: '/hr/employees', icon: <Users size={19} /> },
    { label: 'Attendance', path: '/hr/attendance', icon: <Clock size={19} /> },
    { label: 'Leave', path: '/hr/leave-management', icon: <CheckSquare size={19} /> },
    { label: 'Payroll', path: '/hr/payroll', icon: <DollarSign size={19} /> },
    { label: 'Recruitment', path: '/hr/recruitment', icon: <Briefcase size={19} /> },
  ];

  const systemNav = [
    { label: 'Roles & Permissions', path: '/hr/roles-permissions', icon: <Shield size={19} /> },
    { label: 'Reports', path: '/hr/reports', icon: <BarChart2 size={19} /> },
    { label: 'Documents', path: '/hr/documents', icon: <FileText size={19} /> },
    { label: 'Biometric', path: '/hr/biometric-sync', icon: <Wifi size={19} /> },
    { label: 'Notifications', path: '/hr/notifications', icon: <Bell size={19} /> },
    { label: 'Settings', path: '/hr/settings', icon: <Settings size={19} /> },
    { label: 'Help & Support', path: '/hr/help', icon: <HelpCircle size={19} /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    if (onMobileClose) onMobileClose();
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="hr-sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside className={`hr-sidebar ${isMobileOpen ? 'hr-sidebar-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="hr-sidebar-header">
          <div className="hr-brand-container">
            <div className="hr-logo-icon">
              <img src={COMPANY_BRANDING.logoUrl} alt={COMPANY_BRANDING.appName} className="hr-sidebar-brand-img" />
            </div>
            <div className="hr-brand-text">
              <span className="hr-brand-title">BELNOVA</span>
              <span className="hr-brand-subtitle">HRMS Platform</span>
            </div>
          </div>

          {onMobileClose && (
            <button className="hr-sidebar-close-btn" onClick={onMobileClose} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="hr-sidebar-scroll">
          {/* WORKSPACE */}
          <div className="hr-nav-group">
            <span className="hr-group-title">WORKSPACE</span>
            <div className="hr-nav-list">
              {workspaceNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`hr-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <span className="hr-nav-icon">{item.icon}</span>
                    <span className="hr-nav-label">{item.label}</span>
                    {isActive && <span className="hr-active-bar" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MANAGEMENT */}
          <div className="hr-nav-group">
            <span className="hr-group-title">MANAGEMENT</span>
            <div className="hr-nav-list">
              {managementNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`hr-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <span className="hr-nav-icon">{item.icon}</span>
                    <span className="hr-nav-label">{item.label}</span>
                    {isActive && <span className="hr-active-bar" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SYSTEM */}
          <div className="hr-nav-group">
            <span className="hr-group-title">SYSTEM</span>
            <div className="hr-nav-list">
              {systemNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`hr-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <span className="hr-nav-icon">{item.icon}</span>
                    <span className="hr-nav-label">{item.label}</span>
                    {isActive && <span className="hr-active-bar" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Profile & Logout Footer */}
        <div className="hr-sidebar-footer">
          <div className="hr-sidebar-user">
            <div className="hr-user-avatar">
              {user?.avatar || 'PS'}
            </div>
            <div className="hr-user-info">
              <span className="hr-user-name">{user?.name || 'Priya Sharma'}</span>
              <span className="hr-user-role">{user?.designation || 'HR Director'}</span>
            </div>
          </div>

          <button className="hr-sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
