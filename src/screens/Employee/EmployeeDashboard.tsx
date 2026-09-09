import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { downloadPayslip } from '../../services/downloadService';
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Upload,
  ArrowRight,
  ChevronRight,
  Play,
  Square,
  X,
  Megaphone,
  Loader2,
} from 'lucide-react';
import './EmployeeDashboard.css';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    todayAttendance,
    toggleCheckInOut,
    leaveBalances,
    holidays,
    payslips,
  } = useAuth();

  const [showPayslipModal, setShowPayslipModal] = useState(false);

  const latestPayslip = payslips?.[0] || {
    month: 'August 2026',
    grossSalary: '₹60,000',
    deductions: '₹11,500',
    netSalary: '₹48,500',
  };

  const [isDownloadingPayslip, setIsDownloadingPayslip] = useState(false);

  const handleDownloadPayslipFromDashboard = async () => {
    setIsDownloadingPayslip(true);
    try {
      await downloadPayslip(latestPayslip, user);
    } finally {
      setIsDownloadingPayslip(false);
    }
  };

  const safeLeaveBalances = leaveBalances || {
    casual: { available: 6, used: 6, total: 12 },
    sick: { available: 4, used: 8, total: 12 },
    earned: { available: 12, used: 6, total: 18 },
  };

  const safeAttendance = todayAttendance || {
    checkedIn: true,
    checkInTime: '09:42 AM',
    checkOutTime: '—',
    workingHours: '04h 32m',
    status: 'Present',
  };

  const safeHolidays = holidays || [
    { id: 1, date: '2026-09-07', name: 'Ganesh Chaturthi', day: 'Monday', type: 'Holiday' },
    { id: 2, date: '2026-10-02', name: 'Gandhi Jayanti', day: 'Friday', type: 'Holiday' },
    { id: 3, date: '2026-10-20', name: 'Diwali', day: 'Tuesday', type: 'Holiday' },
  ];

  const recentAttendance = [
    { date: 'Sep 1', checkIn: '09:42 AM', checkOut: '06:38 PM', hours: '8h 56m', status: 'Present' },
    { date: 'Aug 31', checkIn: '09:30 AM', checkOut: '06:30 PM', hours: '9h 00m', status: 'Present' },
    { date: 'Aug 30', checkIn: '10:15 AM', checkOut: '06:45 PM', hours: '8h 30m', status: 'Late' },
    { date: 'Aug 29', checkIn: '—', checkOut: '—', hours: '—', status: 'Leave' },
    { date: 'Aug 28', checkIn: '09:38 AM', checkOut: '06:40 PM', hours: '9h 02m', status: 'Present' },
  ];

  const announcementsList = [
    { title: 'September Holiday Schedule', category: 'HR', time: '1h ago' },
    { title: 'New Work From Home Policy', category: 'Policy', time: '2d ago' },
    { title: 'Payroll Processed — August 2026', category: 'Payroll', time: '1d ago' },
    { title: 'Company Anniversary Celebration', category: 'Events', time: '3d ago' },
  ];

  const getMonth = (dateString: string) => {
    try {
      return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return 'SEP';
    }
  };

  const getDay = (dateString: string) => {
    try {
      return new Date(`${dateString}T00:00:00`).getDate();
    } catch {
      return 15;
    }
  };

  const leaveItems = [
    { key: 'casual', label: 'Casual Leave', data: safeLeaveBalances.casual, tone: 'blue' },
    { key: 'sick', label: 'Sick Leave', data: safeLeaveBalances.sick, tone: 'purple' },
    { key: 'earned', label: 'Earned Leave', data: safeLeaveBalances.earned, tone: 'green' },
  ];

  return (
    <div className="app-container">
      <AppHeader title="Employee Portal" />

      <main className="page-content">
        {/* Profile & Today's Attendance Header Section */}
        <section className="hrms-dashboard-header">
          <div className="hrms-profile-card">
            <div
              className="hrms-profile-avatar"
              style={{ background: user?.avatarBg || '#10b981' }}
            >
              {user?.avatar || 'RK'}
            </div>

            <div className="hrms-profile-copy">
              <div className="hrms-profile-name-row">
                <h1>{user?.name || 'Rahul Kumar'}</h1>
                <button
                  type="button"
                  className="hrms-profile-link"
                  onClick={() => navigate('/employee/profile')}
                >
                  Profile <ChevronRight size={16} />
                </button>
              </div>

              <p className="hrms-profile-role">{user?.designation || 'Senior Software Engineer'}</p>
              <p className="hrms-profile-department">
                {user?.department || 'Engineering'} • {user?.employeeId || user?.id || 'EMP001'}
              </p>
              <p className="hrms-profile-reports">
                Reports to: <strong>{user?.reportsTo || 'Arjun Reddy'}</strong>
              </p>
            </div>
          </div>

          <div className="hrms-attendance-card">
            <div className="hrms-attendance-top">
              <h2>Today's Attendance</h2>
              <span
                className={`hrms-status-pill ${
                  safeAttendance.status?.toLowerCase() === 'present'
                    ? 'hrms-status-present'
                    : 'hrms-status-neutral'
                }`}
              >
                {safeAttendance.status}
              </span>
            </div>

            <div className="hrms-attendance-stats">
              <div className="hrms-attendance-stat">
                <strong className="hrms-time-green">{safeAttendance.checkInTime}</strong>
                <span>Check In</span>
              </div>
              <div className="hrms-attendance-stat">
                <strong className="hrms-time-red">{safeAttendance.checkOutTime}</strong>
                <span>Check Out</span>
              </div>
              <div className="hrms-attendance-stat">
                <strong className="hrms-time-purple">{safeAttendance.workingHours}</strong>
                <span>Working Hours</span>
              </div>
            </div>

            <p className="hrms-attendance-sync">
              Synced from biometric device • Last update: 2 min ago
            </p>

            <button type="button" className="hrms-check-toggle" onClick={toggleCheckInOut}>
              {safeAttendance.checkedIn && safeAttendance.checkOutTime === '—'
                ? 'Mark Check Out'
                : 'Mark Check In'}
            </button>
          </div>
        </section>

        {/* Leave Balance Section */}
        <section className="hrms-panel hrms-leave-panel">
          <div className="hrms-section-heading">
            <h2>Leave Balance</h2>
            <button
              type="button"
              className="hrms-text-action"
              onClick={() => navigate('/employee/leave')}
            >
              Apply Leave <ChevronRight size={16} />
            </button>
          </div>

          <div className="hrms-leave-grid">
            {leaveItems.map(({ key, label, data, tone }) => {
              const total = Number(data?.total) || 0;
              const available = Number(data?.available) || 0;
              const used = Number(data?.used) || 0;
              const percentage =
                total > 0 ? Math.min(100, Math.max(0, (available / total) * 100)) : 0;

              return (
                <div className="hrms-leave-item" key={key}>
                  <div className="hrms-leave-title-row">
                    <span>{label}</span>
                    <strong>{available} days</strong>
                  </div>

                  <div className="hrms-progress-track">
                    <div
                      className={`hrms-progress-fill hrms-progress-${tone}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="hrms-leave-meta">
                    <span>{used} used of {total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Three Widgets Section: Payslip, Holidays, Quick Actions */}
        <section className="hrms-widget-grid">
          {/* Payslip Card */}
          <article className="hrms-panel hrms-payslip-card">
            <div className="hrms-card-heading">
              <h2>{latestPayslip.month} Payslip</h2>
              <span className="hrms-status-pill hrms-status-present">Processed</span>
            </div>

            <div className="hrms-salary-list">
              <div className="hrms-salary-row">
                <span>Gross Salary</span>
                <strong className="hrms-money-green">{latestPayslip.grossSalary}</strong>
              </div>
              <div className="hrms-salary-row">
                <span>Deductions</span>
                <strong className="hrms-money-red">{latestPayslip.deductions}</strong>
              </div>
              <div className="hrms-salary-row">
                <span>Net Salary</span>
                <strong className="hrms-money-blue">{latestPayslip.netSalary}</strong>
              </div>
            </div>

            <button
              type="button"
              className="hrms-outline-button"
              onClick={() => setShowPayslipModal(true)}
            >
              View Payslip
            </button>
          </article>

          {/* Holidays Card */}
          <article className="hrms-panel hrms-holidays-card">
            <div className="hrms-card-heading">
              <h2>Upcoming Holidays</h2>
              <button
                type="button"
                className="see-all-btn"
                onClick={() => navigate('/employee/holidays')}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="hrms-holiday-list">
              {safeHolidays.slice(0, 3).map((item) => (
                <div className="hrms-holiday-item" key={item.id}>
                  <div className="hrms-holiday-date">
                    <strong>{getMonth(item.date)}</strong>
                    <span>{getDay(item.date)}</span>
                  </div>

                  <div className="hrms-holiday-copy">
                    <strong>{item.name}</strong>
                    <span>{item.day}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Quick Actions Card */}
          <article className="hrms-panel hrms-quick-actions-card">
            <div className="hrms-card-heading">
              <h2>Quick Actions</h2>
            </div>

            <div className="hrms-action-list">
              <button
                type="button"
                className="hrms-action-item"
                onClick={() => navigate('/employee/leave')}
              >
                <span className="hrms-action-icon hrms-action-blue"><Calendar size={18} /></span>
                <span>Apply Leave</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="hrms-action-item"
                onClick={() => navigate('/employee/attendance')}
              >
                <span className="hrms-action-icon hrms-action-purple"><Clock size={18} /></span>
                <span>View Attendance</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="hrms-action-item"
                onClick={() => navigate('/employee/payslips')}
              >
                <span className="hrms-action-icon hrms-action-green"><Download size={18} /></span>
                <span>Download Payslip</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="hrms-action-item"
                onClick={() => navigate('/employee/documents')}
              >
                <span className="hrms-action-icon hrms-action-orange"><Upload size={18} /></span>
                <span>Upload Document</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="hrms-action-item"
                onClick={() => navigate('/employee/requests')}
              >
                <span className="hrms-action-icon hrms-action-pink"><FileText size={18} /></span>
                <span>Raise Request</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </article>
        </section>

        {/* Recent Attendance Section */}
        <section className="hrms-panel hrms-table-panel">
          <div className="hrms-section-heading">
            <h2>Recent Attendance</h2>
            <button
              type="button"
              className="hrms-text-action"
              onClick={() => navigate('/employee/attendance')}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="hrms-table-scroll">
            <table className="hrms-attendance-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>CHECK IN</th>
                  <th>CHECK OUT</th>
                  <th>HOURS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((row) => (
                  <tr key={`${row.date}-${row.status}`}>
                    <td>{row.date}</td>
                    <td className="hrms-table-green">{row.checkIn}</td>
                    <td className="hrms-table-red">{row.checkOut}</td>
                    <td>{row.hours}</td>
                    <td>
                      <span className={`hrms-table-status hrms-table-status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="hrms-panel hrms-announcements-panel">
          <div className="hrms-section-heading">
            <h2>Announcements</h2>
            <button
              type="button"
              className="hrms-text-action"
              onClick={() => navigate('/employee/announcements')}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="hrms-announcement-list">
            {announcementsList.map((item) => (
              <button
                type="button"
                className="hrms-announcement-item"
                key={item.title}
                onClick={() => navigate('/employee/announcements')}
              >
                <span className="hrms-announcement-dot" />
                <span className="hrms-announcement-content">
                  <strong>{item.title}</strong>
                  <span>
                    <em>{item.category}</em> • {item.time}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Payslip Modal */}
      {showPayslipModal && (
        <div className="hrms-modal-overlay" onClick={() => setShowPayslipModal(false)}>
          <div className="hrms-modal" onClick={(event) => event.stopPropagation()}>
            <div className="hrms-modal-header">
              <div>
                <span className="hrms-modal-kicker">PAYROLL STATEMENT</span>
                <h3>Salary Slip Breakdown</h3>
                <p>{latestPayslip.month}</p>
              </div>

              <button
                type="button"
                className="hrms-modal-close"
                onClick={() => setShowPayslipModal(false)}
                aria-label="Close payslip"
              >
                <X size={20} />
              </button>
            </div>

            <div className="hrms-modal-body">
              <div className="hrms-modal-employee">
                <p>
                  <span>Employee Name</span>
                  <strong>{user?.name || 'Rahul Kumar'}</strong>
                </p>
                <p>
                  <span>Employee ID</span>
                  <strong>{user?.employeeId || user?.id || 'EMP001'}</strong>
                </p>
              </div>

              <div className="hrms-modal-breakdown">
                <div className="hrms-modal-row">
                  <span>Basic Salary</span>
                  <strong>₹50,000</strong>
                </div>
                <div className="hrms-modal-row">
                  <span>House Rent Allowance (HRA)</span>
                  <strong>₹25,000</strong>
                </div>
                <div className="hrms-modal-row">
                  <span>Special Allowances</span>
                  <strong>₹20,000</strong>
                </div>
                <div className="hrms-modal-row">
                  <span>PF Deduction</span>
                  <strong className="hrms-money-red">- ₹6,000</strong>
                </div>
                <div className="hrms-modal-row">
                  <span>Income Tax (TDS)</span>
                  <strong className="hrms-money-red">- ₹6,500</strong>
                </div>
                <div className="hrms-modal-total">
                  <span>Net Transferrable Salary</span>
                  <strong>{latestPayslip.netSalary}</strong>
                </div>
              </div>
            </div>

            <div className="hrms-modal-footer">
              <button
                type="button"
                className="hrms-download-button"
                disabled={isDownloadingPayslip}
                onClick={handleDownloadPayslipFromDashboard}
              >
                {isDownloadingPayslip ? (
                  <>
                    <Loader2 size={16} className="spin-icon" /> Downloading Payslip PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Official PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
