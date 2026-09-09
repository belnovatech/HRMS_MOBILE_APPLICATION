import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AppHeader } from '../../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../../components/BottomNavigation/BottomNavigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Calendar,
  CheckSquare,
  BarChart2,
  DollarSign,
  Briefcase,
  Shield,
  FileText,
  Folder,
  Cpu,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  FileCheck,
  Megaphone,
  User as UserIcon,
} from 'lucide-react';
import './MoreScreen.css';

export const MoreScreen: React.FC = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const getMenuGrid = () => {
    if (role === 'hr') {
      return [
        { label: 'Organization', path: '/hr/organization', icon: <Building2 color="#2563eb" /> },
        { label: 'Employees Directory', path: '/hr/employees', icon: <Users color="#0284c7" /> },
        { label: 'Attendance Monitor', path: '/hr/attendance', icon: <Clock color="#059669" /> },
        { label: 'Leave Management', path: '/hr/leave-management', icon: <Calendar color="#d97706" /> },
        { label: 'Payroll & Compensation', path: '/hr/payroll', icon: <DollarSign color="#16a34a" /> },
        { label: 'Recruitment & Hiring', path: '/hr/recruitment', icon: <Briefcase color="#9333ea" /> },
        { label: 'Roles & Permissions', path: '/hr/roles-permissions', icon: <Shield color="#dc2626" /> },
        { label: 'Reports & Analytics', path: '/hr/reports', icon: <FileText color="#2563eb" /> },
        { label: 'Document Library', path: '/hr/documents', icon: <Folder color="#0891b2" /> },
        { label: 'Biometric Devices', path: '/hr/biometric-sync', icon: <Cpu color="#4f46e5" /> },
        { label: 'Notifications', path: '/hr/notifications', icon: <Bell color="#eab308" /> },
        { label: 'System Settings', path: '/hr/settings', icon: <Settings color="#64748b" /> },
        { label: 'Help & Support', path: '/hr/help', icon: <HelpCircle color="#0d9488" /> },
      ];
    } else if (role === 'manager') {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard color="#2563eb" /> },
        { label: 'My Team', path: '/manager/team', icon: <Users color="#7c3aed" /> },
        { label: 'Team Attendance', path: '/manager/attendance', icon: <Clock color="#059669" /> },
        { label: 'Leave Approvals', path: '/manager/leave-approvals', icon: <CheckSquare color="#d97706" /> },
        { label: 'Team Reports', path: '/manager/reports', icon: <BarChart2 color="#2563eb" /> },
        { label: 'Notifications', path: '/manager/notifications', icon: <Bell color="#eab308" /> },
        { label: 'Help & Support', path: '/manager/help', icon: <HelpCircle color="#0d9488" /> },
      ];
    } else {
      return [
        { label: 'My Profile', path: '/employee/profile', icon: <UserIcon color="#10b981" /> },
        { label: 'My Attendance', path: '/employee/attendance', icon: <Clock color="#059669" /> },
        { label: 'My Leave Requests', path: '/employee/leave', icon: <Calendar color="#d97706" /> },
        { label: 'My Payslips', path: '/employee/payslips', icon: <DollarSign color="#16a34a" /> },
        { label: 'My Documents', path: '/employee/documents', icon: <Folder color="#0891b2" /> },
        { label: 'Holidays Calendar', path: '/employee/holidays', icon: <Calendar color="#9333ea" /> },
        { label: 'Announcements', path: '/employee/announcements', icon: <Megaphone color="#dc2626" /> },
        { label: 'Requests & Claims', path: '/employee/requests', icon: <FileCheck color="#2563eb" /> },
        { label: 'Help & Support', path: '/employee/help', icon: <HelpCircle color="#0d9488" /> },
      ];
    }
  };

  const menuItems = getMenuGrid();

  return (
    <div className="app-container">
      <AppHeader
        title={role === 'manager' ? 'Manager Portal' : 'All Modules & Features'}
      />

      <main className="page-content">
        {user && (
          <div className="user-profile-banner">
            <div className="user-banner-avatar" style={{ backgroundColor: user.avatarBg || 'var(--primary-color)' }}>
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-banner-info">
              <h3>{user.name}</h3>
              <p>{user.designation || 'Team Manager'} • {user.department || 'Engineering'}</p>
              <span className="role-tag">{role === 'manager' ? 'TEAM MANAGER' : role?.toUpperCase()}</span>
            </div>
          </div>
        )}

        <h3 className="section-heading">
          {role === 'manager' ? 'Manager Portal Modules' : 'All Available Modules'}
        </h3>
        <div className="modules-grid">
          {menuItems.map((item) => (
            <div key={item.path} className="module-item-card" onClick={() => navigate(item.path)}>
              <div className="module-icon-wrap">{item.icon}</div>
              <span className="module-item-label">{item.label}</span>
            </div>
          ))}
        </div>

        <button className="btn-secondary logout-full-btn" onClick={logout}>
          <LogOut size={18} /> Sign Out of Application
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
};
