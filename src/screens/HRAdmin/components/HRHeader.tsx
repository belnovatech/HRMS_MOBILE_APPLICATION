import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Search,
  HelpCircle,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import './HRHeader.css';

interface HRHeaderProps {
  onMenuClick?: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HRHeader: React.FC<HRHeaderProps> = ({
  onMenuClick,
  searchTerm,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <header className="hr-exec-header">
      {/* Left Column: Breadcrumb & Title */}
      <div className="hr-header-left">
        {onMenuClick && (
          <button
            className="hr-mobile-menu-btn"
            onClick={onMenuClick}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
        )}

        <div className="hr-header-titles">
          <div className="hr-breadcrumb">
            <span className="hr-bc-brand">BELNOVA HRMS</span>
            <span className="hr-bc-separator">&gt;</span>
            <span className="hr-bc-current">Dashboard</span>
          </div>
          <h1 className="hr-main-title">Executive Dashboard</h1>
        </div>
      </div>

      {/* Right Column: Search, Actions, Profile */}
      <div className="hr-header-right">
        {/* Search Input Box */}
        <div className="hr-search-box">
          <Search size={16} className="hr-search-icon" />
          <input
            type="text"
            placeholder="Search employees, modules..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="hr-search-input"
          />
        </div>

        {/* Circular Action Icons */}
        <div className="hr-action-buttons">
          <button
            type="button"
            className="hr-circle-btn"
            onClick={() => navigate('/hr/help')}
            title="Help & Support"
            aria-label="Help"
          >
            <HelpCircle size={18} />
          </button>

          <button
            type="button"
            className="hr-circle-btn"
            onClick={toggleTheme}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className="hr-circle-btn hr-notif-btn"
            onClick={() => navigate('/hr/notifications')}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="hr-header-badge">2</span>
          </button>
        </div>

        {/* User Profile Area */}
        <div className="hr-profile-wrapper">
          <div
            className="hr-profile-trigger"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div className="hr-header-avatar">
              {user?.avatar || 'PS'}
            </div>
            <div className="hr-header-user-meta">
              <span className="hr-user-fullname">{user?.name || 'Priya Sharma'}</span>
              <span className="hr-user-designation">{user?.designation || 'HR Director'}</span>
            </div>
            <ChevronDown size={15} className={`hr-chevron ${showProfileMenu ? 'open' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="hr-profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="hr-dropdown-header">
                <strong>{user?.name || 'Priya Sharma'}</strong>
                <span>{user?.email || 'priya.sharma@belnova.com'}</span>
              </div>
              <div className="hr-dropdown-divider" />
              <button
                className="hr-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/hr/settings');
                }}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </button>
              <button
                className="hr-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/hr/help');
                }}
              >
                <HelpCircle size={16} />
                <span>Help Desk</span>
              </button>
              <div className="hr-dropdown-divider" />
              <button
                className="hr-dropdown-item hr-logout-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
