import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckSquare,
  BarChart2,
  Bell,
  HelpCircle,
  X,
  LogOut,
} from 'lucide-react';
import belnovaIcon from '../../assets/belnova-icon.png';
import './ManagerDrawer.css';

interface ManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ManagerNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const MANAGER_NAV_ITEMS: ManagerNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'team', label: 'My Team', path: '/manager/team', icon: <Users size={20} /> },
  { id: 'attendance', label: 'Team Attendance', path: '/manager/attendance', icon: <Clock size={20} /> },
  { id: 'leave-approvals', label: 'Leave Approvals', path: '/manager/leave-approvals', icon: <CheckSquare size={20} /> },
  { id: 'reports', label: 'Team Reports', path: '/manager/reports', icon: <BarChart2 size={20} /> },
  { id: 'notifications', label: 'Notifications', path: '/manager/notifications', icon: <Bell size={20} /> },
  { id: 'help', label: 'Help & Support', path: '/manager/help', icon: <HelpCircle size={20} /> },
];

export const ManagerDrawer: React.FC<ManagerDrawerProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, notificationsList } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notificationsList.filter(
    (n) => n.unread && (n.audience === 'All' || n.audience.toLowerCase() === role)
  ).length;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="manager-drawer-overlay" onClick={onClose}>
      <div
        className="manager-drawer-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Manager Navigation Menu"
      >
        {/* Brand & Close */}
        <div className="drawer-top-bar">
          <div className="drawer-brand">
            <img src={belnovaIcon} alt="BELNOVA" className="drawer-logo-img" />
            <div className="drawer-brand-text">
              <span className="brand-name">BELNOVA</span>
              <span className="brand-sub">HRMS Platform</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Manager User Profile Header */}
        {user && (
          <div className="drawer-profile-card">
            <div
              className="drawer-avatar"
              style={{ backgroundColor: user.avatarBg || 'var(--manager-color, #7c3aed)' }}
            >
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="drawer-profile-info">
              <div className="drawer-profile-name">{user.name}</div>
              <div className="drawer-profile-role">Team Manager</div>
              <div className="drawer-profile-dept">{user.department}</div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="drawer-section-title">WORKSPACE</div>

        {/* Menu Navigation Items */}
        <nav className="drawer-nav-list">
          {MANAGER_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isNotifications = item.id === 'notifications';

            return (
              <button
                key={item.id}
                className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="drawer-nav-icon">{item.icon}</span>
                <span className="drawer-nav-label">{item.label}</span>
                {isNotifications && unreadCount > 0 && (
                  <span className="drawer-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
                {isActive && <span className="drawer-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="drawer-footer">
          <button className="drawer-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
