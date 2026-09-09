import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  Users,
  Clock,
  Calendar,
  CheckSquare,
  User as UserIcon,
  MoreHorizontal,
} from 'lucide-react';
import './BottomNavigation.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const BottomNavigation: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!role) return null;

  let items: NavItem[] = [];

  if (role === 'hr') {
    items = [
      { id: 'home', label: 'Home', path: '/hr/dashboard', icon: <Home size={20} /> },
      { id: 'employees', label: 'Employees', path: '/hr/employees', icon: <Users size={20} /> },
      { id: 'attendance', label: 'Attendance', path: '/hr/attendance', icon: <Clock size={20} /> },
      { id: 'leave', label: 'Leaves', path: '/hr/leave-management', icon: <Calendar size={20} /> },
      { id: 'more', label: 'More', path: '/shared/more', icon: <MoreHorizontal size={20} /> },
    ];
  } else if (role === 'manager') {
    items = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/manager/dashboard',
        icon: <LayoutDashboard size={20} />,
      },
      {
        id: 'team',
        label: 'My Team',
        path: '/manager/team',
        icon: <Users size={20} />,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        path: '/manager/attendance',
        icon: <Clock size={20} />,
      },
      {
        id: 'approvals',
        label: 'Approvals',
        path: '/manager/leave-approvals',
        icon: <CheckSquare size={20} />,
      },
      {
        id: 'more',
        label: 'More',
        path: '/shared/more',
        icon: <MoreHorizontal size={20} />,
      },
    ];
  } else {
    items = [
      { id: 'home', label: 'Home', path: '/employee/dashboard', icon: <Home size={20} /> },
      { id: 'attendance', label: 'Attendance', path: '/employee/attendance', icon: <Clock size={20} /> },
      { id: 'leave', label: 'Leave', path: '/employee/leave', icon: <Calendar size={20} /> },
      { id: 'profile', label: 'Profile', path: '/employee/profile', icon: <UserIcon size={20} /> },
      { id: 'more', label: 'More', path: '/shared/more', icon: <MoreHorizontal size={20} /> },
    ];
  }

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
