import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Shield
} from 'lucide-react';
import { ManagerDrawer } from '../ManagerDrawer/ManagerDrawer';
import { COMPANY_BRANDING } from '../../constants/branding';
import './AppHeader.css';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotifications = true,
  onBack,
}) => {
  const navigate = useNavigate();
  const { user, role, logout, notificationsList } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationsList.filter(
    (n) => n.unread && (n.audience === 'All' || n.audience.toLowerCase() === role)
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    if (role === 'hr') navigate('/hr/notifications');
    else if (role === 'manager') navigate('/manager/notifications');
    else navigate('/employee/announcements');
  };

  const handleNavigate = (path: string) => {
    setIsProfileDropdownOpen(false);
    navigate(path);
  };

  const roleLabel = role === 'hr' ? 'HR Admin' : role === 'manager' ? 'Manager' : 'Employee';

  return (
    <>
      <header className={`app-header role-${role || 'employee'}`}>
        <div className="header-left">
          {showBack ? (
            <button
              className="icon-btn back-btn"
              onClick={onBack || (() => navigate(-1))}
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <div className="header-brand-wrap" onClick={() => navigate(role === 'hr' ? '/hr/dashboard' : role === 'manager' ? '/manager/dashboard' : '/employee/dashboard')}>
              <img
                src={COMPANY_BRANDING.logoUrl}
                alt={COMPANY_BRANDING.appName}
                className="header-brand-icon"
              />
            </div>
          )}

          {role === 'manager' && !showBack && (
            <button
              className="icon-btn menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Manager Navigation Menu"
              title="Open Navigation Drawer"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="header-title-block">
            <h1 className="header-main-title">{title}</h1>
            {subtitle ? (
              <span className="header-sub-title">{subtitle}</span>
            ) : (
              <span className="header-brand-caption">BELNOVA HRMS</span>
            )}
          </div>
        </div>

        <div className="header-right">
          <span className={`header-role-chip role-chip-${role || 'employee'}`}>
            {roleLabel}
          </span>

          {showNotifications && (
            <button
              className="icon-btn notif-btn"
              onClick={handleNotificationClick}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          )}

          {user && (
            <div className="header-user-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="header-profile-btn"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                aria-expanded={isProfileDropdownOpen}
                aria-label="User profile menu"
              >
                <div
                  className="user-avatar-circle"
                  style={{ backgroundColor: user.avatarBg || '#2563eb' }}
                >
                  {user.avatar || user.name?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <ChevronDown size={14} className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div
                      className="dropdown-avatar-large"
                      style={{ backgroundColor: user.avatarBg || '#2563eb' }}
                    >
                      {user.avatar || user.name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="dropdown-user-details">
                      <strong className="dropdown-user-name">{user.name}</strong>
                      <span className="dropdown-user-role">{user.designation || roleLabel}</span>
                      <span className="dropdown-user-email">{user.email}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-links-list">
                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => handleNavigate(role === 'employee' ? '/employee/profile' : '/hr/employees/EMP001')}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => handleNavigate(role === 'hr' ? '/hr/settings' : '/shared/more')}
                    >
                      <Settings size={16} />
                      <span>System Settings</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => handleNavigate(role === 'hr' ? '/hr/help' : role === 'manager' ? '/manager/help' : '/employee/help')}
                    >
                      <HelpCircle size={16} />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item-btn dropdown-logout-btn"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {role === 'manager' && (
        <ManagerDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      )}
    </>
  );
};
