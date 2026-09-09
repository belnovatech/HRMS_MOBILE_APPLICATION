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
  totalEmployees = 1248,
  presentToday = 1086,
  absentToday = 72,
  onLeave = 91,
  pendingApprovals = 2,
  monthlyPayroll = '₹48.7L',
}) => {
  const navigate = useNavigate();

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
          <span className="hr-kpi-badge hr-badge-green">+12 this month</span>
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
          <span className="hr-kpi-badge hr-badge-green">↗ 87.0%</span>
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
          <span className="hr-kpi-badge hr-badge-red">↘ -5 vs avg</span>
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
          <span className="hr-kpi-badge hr-badge-gray">Active</span>
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
          <span className="hr-kpi-badge hr-badge-pink">↑ Action needed</span>
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
          <span className="hr-kpi-badge hr-badge-white-translucent">↗ +4.2%</span>
        </div>
        <div className="hr-kpi-body">
          <h2 className="hr-kpi-value hr-val-white">{monthlyPayroll}</h2>
          <span className="hr-kpi-label hr-lbl-white">Monthly Payroll</span>
        </div>
      </div>
    </div>
  );
};
