import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader/AppHeader";
import { BottomNavigation } from "../components/BottomNavigation/BottomNavigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckSquare,
  BarChart2,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import belnovaIcon from "../assets/belnova-icon.png";
import "./ManagerLayout.css";

interface ManagerLayoutProps {
  title?: string;
  breadcrumb?: string;
  children: React.ReactNode;
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({
  title = "Manager Portal",
  children,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/manager/dashboard", icon: <LayoutDashboard size={19} /> },
    { id: "team", label: "My Team", path: "/manager/team", icon: <Users size={19} /> },
    { id: "attendance", label: "Team Attendance", path: "/manager/attendance", icon: <Clock size={19} /> },
    { id: "leave-approvals", label: "Leave Approvals", path: "/manager/leave-approvals", icon: <CheckSquare size={19} /> },
    { id: "reports", label: "Team Reports", path: "/manager/reports", icon: <BarChart2 size={19} /> },
    { id: "notifications", label: "Notifications", path: "/manager/notifications", icon: <Bell size={19} /> },
    { id: "help", label: "Help & Support", path: "/manager/help", icon: <HelpCircle size={19} /> },
  ];

  return (
    <div className="manager-layout-wrapper">
      {/* Desktop Sidebar — Hidden on mobile via CSS (@media max-width: 1023px) */}
      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-top">
          <img src={belnovaIcon} alt="BELNOVA" className="desktop-sidebar-logo-img" />
          <div className="desktop-sidebar-brand">
            <span className="desktop-brand-name">BELNOVA</span>
            <span className="desktop-brand-sub">HRMS Platform</span>
          </div>
        </div>

        {user && (
          <div className="desktop-sidebar-profile">
            <div
              className="desktop-sidebar-avatar"
              style={{ backgroundColor: user.avatarBg || "#7c3aed" }}
            >
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="desktop-sidebar-user-info">
              <span className="desktop-user-name">{user.name}</span>
              <span className="desktop-user-role">Team Manager</span>
            </div>
          </div>
        )}

        <div className="desktop-sidebar-section">WORKSPACE</div>

        <nav className="desktop-sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                type="button"
                className={`desktop-nav-link ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="desktop-sidebar-footer">
          <button
            type="button"
            className="desktop-logout-btn"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area — 100% width on Mobile, Margin-left on Desktop */}
      <div className="manager-layout-main">
        <div className="app-container">
          <AppHeader title={title} />
          <main className="page-content">{children}</main>
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout;
