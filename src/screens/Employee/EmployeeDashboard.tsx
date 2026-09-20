import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { downloadPayslip } from '../../services/downloadService';
import { attendanceApi, AttendanceRecordDto } from '../../api';
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
    announcements,
  } = useAuth();

  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const latestPayslip = payslips && payslips.length > 0 ? payslips[0] : null;

  const [isDownloadingPayslip, setIsDownloadingPayslip] = useState(false);

  const handleDownloadPayslipFromDashboard = async () => {
    if (!latestPayslip) return;
    setIsDownloadingPayslip(true);
    try {
      await downloadPayslip(latestPayslip, user);
    } finally {
      setIsDownloadingPayslip(false);
    }
  };

  const safeLeaveBalances = {
    casual: leaveBalances?.casual || { available: 0, used: 0, total: 0 },
    sick: leaveBalances?.sick || { available: 0, used: 0, total: 0 },
    earned: leaveBalances?.earned || { available: 0, used: 0, total: 0 },
  };

  const safeAttendance = todayAttendance || {
    checkedIn: false,
    checkInTime: '—',
    checkOutTime: '—',
    workingHours: '—',
    status: 'Not checked in',
  };

  const safeHolidays = holidays || [];

  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecordDto[]>([]);

  useEffect(() => {
    const empId = user?.id || user?.employeeId;
    if (empId) {
      attendanceApi.getAttendance(empId).then((records) => {
        if (Array.isArray(records)) {
          setRecentAttendance(records.slice(0, 5));
        }
      }).catch(() => {
        setRecentAttendance([]);
      });
    }
  }, [user?.id, user?.employeeId]);

  const getMonth = (dateString: string) => {
    try {
      return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return 'CAL';
    }
  };

  const getDay = (dateString: string) => {
    try {
      return new Date(`${dateString}T00:00:00`).getDate();
    } catch {
      return 1;
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
                <h1>{user?.name || 'Employee'}</h1>
                <button
                  type="button"
                  className="hrms-profile-link"
                  onClick={() => navigate('/employee/profile')}
                >
                  Profile <ChevronRight size={16} />
                </button>
              </div>

              <p className="hrms-profile-role">{user?.designation || (user?.role ? user.role.toUpperCase() : 'Staff')}</p>
              <p className="hrms-profile-department">
                {user?.department || 'General'} • {user?.employeeId || user?.id || '—'}
              </p>
              <p className="hrms-profile-reports">
                Reports to: <strong>{user?.reportsTo || 'Manager'}</strong>
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
            {latestPayslip ? (
              <>
                <div className="hrms-card-heading">
                  <h2>{latestPayslip.month} Payslip</h2>
                  <span className="hrms-status-pill hrms-status-present">{latestPayslip.status || 'Processed'}</span>
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
              </>
            ) : (
              <>
                <div className="hrms-card-heading">
                  <h2>Monthly Payslip</h2>
                  <span className="hrms-status-pill hrms-status-neutral">Pending</span>
                </div>
                <div className="hrms-salary-list" style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No payslip generated yet for this period.</p>
                </div>
                <button
                  type="button"
                  className="hrms-outline-button"
                  onClick={() => navigate('/employee/payslips')}
                >
                  View Payslips
                </button>
              </>
            )}
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
              {safeHolidays.length > 0 ? (
                safeHolidays.slice(0, 3).map((item) => (
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
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px', margin: '12px 0', textAlign: 'center' }}>
                  No upcoming holidays scheduled.
                </p>
              )}
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
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((row, idx) => (
                    <tr key={row.id || `${row.date}-${idx}`}>
                      <td>{row.date}</td>
                      <td className="hrms-table-green">{row.checkIn || '—'}</td>
                      <td className="hrms-table-red">{row.checkOut || '—'}</td>
                      <td>{row.workingHours || '—'}</td>
                      <td>
                        <span className={`hrms-table-status hrms-table-status-${(row.status || 'Present').toLowerCase()}`}>
                          {row.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No attendance records logged yet.
                    </td>
                  </tr>
                )}
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
            {announcements && announcements.length > 0 ? (
              announcements.slice(0, 4).map((item) => (
                <button
                  type="button"
                  className="hrms-announcement-item"
                  key={item.id || item.title}
                  onClick={() => navigate('/employee/announcements')}
                >
                  <span className="hrms-announcement-dot" />
                  <span className="hrms-announcement-content">
                    <strong>{item.title}</strong>
                    <span>
                      <em>{item.category || 'Company'}</em> • {item.date || 'Recent'}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No company announcements at this time.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Payslip Modal */}
      {showPayslipModal && latestPayslip && (
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
                  <strong>{user?.name || 'Employee'}</strong>
                </p>
                <p>
                  <span>Employee ID</span>
                  <strong>{user?.employeeId || user?.id || '—'}</strong>
                </p>
              </div>

              <div className="hrms-modal-breakdown">
                <div className="hrms-modal-row">
                  <span>Gross Salary</span>
                  <strong className="hrms-money-green">{latestPayslip.grossSalary}</strong>
                </div>
                <div className="hrms-modal-row">
                  <span>Total Deductions</span>
                  <strong className="hrms-money-red">- {latestPayslip.deductions}</strong>
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
