import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { HRKPICards } from './components/HRKPICards';
import { HRAttendanceTrend } from './components/HRAttendanceTrend';
import { HRDepartmentDistribution } from './components/HRDepartmentDistribution';
import { HRPendingApprovals } from './components/HRPendingApprovals';
import { HRBirthdays } from './components/HRBirthdays';
import { HRRecentActivity } from './components/HRRecentActivity';
import { HRHolidays } from './components/HRHolidays';
import { HRQuickActions } from './components/HRQuickActions';
import './HRDashboard.css';

export const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Format today's date dynamically
  const todayDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/hr/employees?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="hr-mobile-app-layout">
      {/* 1. Unified Enterprise App Header */}
      <AppHeader title="BELNOVA HRMS" subtitle="HR Admin Portal" />

      {/* Main Vertically Scrollable Content Area */}
      <main className="hr-mobile-main-scroll">
        {/* Header Greeting Section */}
        <section className="hr-mobile-greeting-card">
          <div className="hr-greeting-left">
            <h1 className="hr-mobile-greeting-title">
              Good Morning, {user?.name?.split(' ')[0] || 'Admin'} <span className="hr-wave-hand">👋</span>
            </h1>
            <p className="hr-mobile-greeting-sub">
              Here's what's happening across your organization today
            </p>
            <span className="hr-mobile-date-chip">📅 {todayDateFormatted}</span>
          </div>
        </section>

        {/* Mobile Search Field */}
        <form className="hr-mobile-search-form" onSubmit={handleSearchSubmit}>
          <div className="hr-mobile-search-wrap">
            <Search size={18} className="hr-mobile-search-icon" />
            <input
              type="text"
              placeholder="Search employees, modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hr-mobile-search-input"
            />
          </div>
        </form>

        {/* 1. KPI SUMMARY */}
        <section className="hr-dashboard-section">
          <HRKPICards
            totalEmployees={1248}
            presentToday={1086}
            absentToday={72}
            onLeave={91}
            pendingApprovals={2}
            monthlyPayroll="₹48.7L"
          />
        </section>

        {/* 2. ATTENDANCE TREND */}
        <section className="hr-dashboard-section">
          <HRAttendanceTrend />
        </section>

        {/* 3. DEPARTMENT DISTRIBUTION */}
        <section className="hr-dashboard-section">
          <HRDepartmentDistribution />
        </section>

        {/* 4. PENDING APPROVALS */}
        <section className="hr-dashboard-section">
          <HRPendingApprovals />
        </section>

        {/* 5. BIRTHDAYS */}
        <section className="hr-dashboard-section">
          <HRBirthdays />
        </section>

        {/* 6. RECENT ACTIVITY */}
        <section className="hr-dashboard-section">
          <HRRecentActivity />
        </section>

        {/* 7. UPCOMING HOLIDAYS */}
        <section className="hr-dashboard-section">
          <HRHolidays />
        </section>

        {/* 8. QUICK ACTIONS */}
        <section className="hr-dashboard-section">
          <HRQuickActions />
        </section>
      </main>

      {/* Global Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HRDashboard;
