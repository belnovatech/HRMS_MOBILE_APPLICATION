import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';
import './HRKPICards.css';

export interface HRKPICardsProps {
  totalEmployees?: number;
  presentToday?: number;
  absentToday?: number;
  onLeave?: number;
  pendingApprovals?: number;
  monthlyPayroll?: string;
}

export const HRKPICards: React.FC<HRKPICardsProps> = ({
  totalEmployees = 0,
  presentToday = 0,
  absentToday = 0,
  onLeave = 0,
  pendingApprovals = 0,
  monthlyPayroll = '₹0.0L',
}) => {
  const navigate = useNavigate();
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return (
    <div className="hr-kpi-grid">
      {/* 1. Total Employees */}
      <div
        className="hr-kpi-card"
        onClick={() => navigate('/hr/employees')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-blue">
            <Users size={18} />
          </div>
          <span className="hr-kpi-badge hr-badge-green">Active</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value">{totalEmployees.toLocaleString()}</h2>
          <span className="hr-kpi-label">Total Employees</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div
        className="hr-kpi-card"
        onClick={() => navigate('/hr/attendance')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-green">
            <Clock size={18} />
          </div>
          <span className="hr-kpi-badge hr-badge-green">↗ {attendanceRate}%</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value">{presentToday.toLocaleString()}</h2>
          <span className="hr-kpi-label">Present Today</span>
        </div>
      </div>

      {/* 3. Absent Today */}
      <div
        className="hr-kpi-card"
        onClick={() => navigate('/hr/attendance')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-red">
            <AlertCircle size={18} />
          </div>
          <span className="hr-kpi-badge hr-badge-red">Today</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value">{absentToday.toLocaleString()}</h2>
          <span className="hr-kpi-label">Absent Today</span>
        </div>
      </div>

      {/* 4. On Leave */}
      <div
        className="hr-kpi-card"
        onClick={() => navigate('/hr/leave-management')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-amber">
            <Calendar size={18} />
          </div>
          <span className="hr-kpi-badge hr-badge-gray">On Leave</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value">{onLeave.toLocaleString()}</h2>
          <span className="hr-kpi-label">On Leave</span>
        </div>
      </div>

      {/* 5. Pending Approvals */}
      <div
        className="hr-kpi-card"
        onClick={() => navigate('/hr/leave-management')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-purple">
            <AlertCircle size={18} />
          </div>
          <span className={`hr-kpi-badge ${pendingApprovals > 0 ? 'hr-badge-pink' : 'hr-badge-green'}`}>
            {pendingApprovals > 0 ? '↑ Action needed' : 'All clear'}
          </span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value">{pendingApprovals}</h2>
          <span className="hr-kpi-label">Pending Approvals</span>
        </div>
      </div>

      {/* 6. Monthly Payroll (Gradient Card) */}
      <div
        className="hr-kpi-card hr-kpi-card-gradient"
        onClick={() => navigate('/hr/payroll')}
        role="button"
        tabIndex={0}
      >
        <div className="hr-kpi-top">
          <div className="hr-kpi-icon-wrap hr-icon-white-translucent">
            <DollarSign size={18} />
          </div>
          <span className="hr-kpi-badge hr-badge-white-translucent">Current</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value hr-val-white">{monthlyPayroll}</h2>
          <span className="hr-kpi-label hr-lbl-white">Monthly Payroll</span>
        </div>
      </div>
    </div>
  );
};
