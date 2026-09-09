import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { downloadReport } from '../../services/downloadService';
import {
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  X,
  Play,
  Square,
  Download,
  Loader2,
} from 'lucide-react';
import './EmployeeAttendance.css';

const HR_NOTIFICATION_STORAGE_KEY = 'hrNotifications';

const formatTime = (value?: string) => value || '—';

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTableDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const getMonthLabel = (monthValue: string) => {
  if (!monthValue) return '';
  const [year, month] = monthValue.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const getDaysInSelectedMonth = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

const getWeekdayName = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
  });

const getWorkingDaysInMonth = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  const days = new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) {
      count += 1;
    }
  }
  return count;
};

const getDateRangeForMonth = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  const totalDays = getDaysInSelectedMonth(monthValue);
  const today = new Date();
  const currentMonthValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const lastAllowedDay = monthValue === currentMonthValue ? today.getDate() : totalDays;
  const dates: Date[] = [];

  for (let day = lastAllowedDay; day >= 1; day -= 1) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) {
      dates.push(date);
    }
    if (dates.length === 6) break;
  }
  return dates;
};

const buildDynamicAttendance = (monthValue: string, todayAttendance: any) => {
  const dates = getDateRangeForMonth(monthValue);

  return dates.map((date, index) => {
    const dateKey = getDateKey(date);
    const todayKey = getDateKey(new Date());

    if (dateKey === todayKey) {
      return {
        date: dateKey,
        day: getWeekdayName(date),
        checkIn: formatTime(todayAttendance?.checkInTime),
        checkOut: formatTime(todayAttendance?.checkOutTime),
        hours: formatTime(todayAttendance?.workingHours),
        status: todayAttendance?.status || 'Present',
      };
    }

    const fallbackRows = [
      { checkIn: '09:30 AM', checkOut: '06:30 PM', hours: '9h 00m', status: 'Present' },
      { checkIn: '10:15 AM', checkOut: '06:45 PM', hours: '8h 30m', status: 'Late' },
      { checkIn: '—', checkOut: '—', hours: '—', status: 'Leave' },
      { checkIn: '09:38 AM', checkOut: '06:40 PM', hours: '9h 02m', status: 'Present' },
      { checkIn: '09:50 AM', checkOut: '06:35 PM', hours: '8h 45m', status: 'Present' },
    ];

    const fallback = fallbackRows[(index - 1 + fallbackRows.length) % fallbackRows.length];

    return {
      date: dateKey,
      day: getWeekdayName(date),
      ...fallback,
    };
  });
};

export const EmployeeAttendance: React.FC = () => {
  const { user, todayAttendance, toggleCheckInOut } = useAuth();

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionDate, setCorrectionDate] = useState(getDateKey(new Date()));
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  const attendanceHistory = useMemo(
    () => buildDynamicAttendance(selectedMonth, todayAttendance),
    [selectedMonth, todayAttendance]
  );

  const summary = useMemo(() => {
    const workingDays = getWorkingDaysInMonth(selectedMonth);
    const present = attendanceHistory.filter((item) => item.status?.toLowerCase() === 'present').length;
    const absent = attendanceHistory.filter((item) => item.status?.toLowerCase() === 'absent').length;
    const late = attendanceHistory.filter((item) => item.status?.toLowerCase() === 'late').length;
    const leave = attendanceHistory.filter((item) => item.status?.toLowerCase() === 'leave').length;

    return { workingDays, present, absent, late, leave };
  }, [attendanceHistory, selectedMonth]);

  const openCorrectionRequest = () => {
    setCorrectionDate(getDateKey(new Date()));
    setCorrectionReason('');
    setCorrectionSubmitted(false);
    setShowCorrectionModal(true);
  };

  const closeCorrectionRequest = () => {
    setShowCorrectionModal(false);
    setCorrectionReason('');
    setCorrectionSubmitted(false);
  };

  const submitCorrectionRequest = (event: React.FormEvent) => {
    event.preventDefault();

    const employeeName = user?.name || 'Employee';
    const employeeId = user?.employeeId || user?.id || 'EMP001';

    const notification = {
      id: `ATT-CORR-${Date.now()}`,
      type: 'attendance_correction',
      title: 'Attendance Correction Request',
      message: `${employeeName} (${employeeId}) requested an attendance correction for ${correctionDate}.`,
      reason: correctionReason.trim(),
      employeeId,
      employeeName,
      requestedDate: correctionDate,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      audience: 'HR',
      read: false,
    };

    try {
      const existingNotifications = JSON.parse(localStorage.getItem(HR_NOTIFICATION_STORAGE_KEY) || '[]');
      localStorage.setItem(HR_NOTIFICATION_STORAGE_KEY, JSON.stringify([notification, ...existingNotifications]));
      window.dispatchEvent(new CustomEvent('hr-notification-created', { detail: notification }));
    } catch (error) {
      console.error('Unable to create HR notification:', error);
    }

    setCorrectionSubmitted(true);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportAttendancePdf = async () => {
    setIsExporting(true);
    try {
      const headers = ['Date & Day', 'Check In / Out', 'Status & Hours'];
      const rows = attendanceHistory.map((item) => [
        `${item.date} (${item.day})`,
        `${item.checkIn || '—'} to ${item.checkOut || '—'}`,
        `${item.status || 'Present'} (${(item as any).workingHours || item.hours || '8h 00m'})`,
      ]);

      await downloadReport(
        'ATTENDANCE LOG STATEMENT',
        `Period: ${getMonthLabel(selectedMonth)}`,
        headers,
        rows,
        `Attendance_Report_${selectedMonth}.pdf`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="My Attendance" showBack />

      <main className="page-content">
        <section className="emp-attendance-header">
          <div>
            <h1>My Attendance Log</h1>
            <p>{getMonthLabel(selectedMonth)}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="emp-attendance-correction-btn"
              disabled={isExporting}
              onClick={handleExportAttendancePdf}
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
            >
              {isExporting ? <Loader2 size={15} className="spin-icon" /> : <Download size={15} />}
              <span>{isExporting ? 'Exporting...' : 'Export Log PDF'}</span>
            </button>

            <button
              type="button"
              className="emp-attendance-correction-btn"
              onClick={openCorrectionRequest}
            >
              <AlertCircle size={16} /> Request Correction
            </button>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="emp-attendance-summary-grid">
          <div className="emp-attendance-summary-card">
            <strong className="emp-attendance-summary-blue">{summary.workingDays}</strong>
            <span>Working Days</span>
          </div>
          <div className="emp-attendance-summary-card">
            <strong className="emp-attendance-summary-green">{summary.present}</strong>
            <span>Present</span>
          </div>
          <div className="emp-attendance-summary-card">
            <strong className="emp-attendance-summary-red">{summary.absent}</strong>
            <span>Absent</span>
          </div>
          <div className="emp-attendance-summary-card">
            <strong className="emp-attendance-summary-orange">{summary.late}</strong>
            <span>Late</span>
          </div>
          <div className="emp-attendance-summary-card">
            <strong className="emp-attendance-summary-purple">{summary.leave}</strong>
            <span>Leave</span>
          </div>
        </section>

        {/* Attendance Log Table / Cards */}
        <section className="emp-attendance-table-card">
          <div className="emp-attendance-table-header">
            <h2>Attendance Log</h2>
            <div className="emp-attendance-month-control">
              <Calendar size={14} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                aria-label="Select month"
              />
            </div>
          </div>

          <div className="emp-attendance-table-scroll">
            <table className="emp-attendance-table">
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
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((item) => (
                    <tr key={item.date}>
                      <td><strong>{formatTableDate(new Date(`${item.date}T00:00:00`))}</strong></td>
                      <td className="emp-attendance-checkin">{item.checkIn}</td>
                      <td className="emp-attendance-checkout">{item.checkOut}</td>
                      <td className="emp-attendance-hours">{item.hours}</td>
                      <td>
                        <span className={`emp-attendance-status emp-attendance-status-${String(item.status || 'unknown').toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="emp-attendance-empty">
                      No attendance records found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Today's Punch Action Card */}
        <section className="emp-attendance-today-card">
          <div className="emp-attendance-today-info">
            <div className="emp-attendance-today-icon">
              <Clock size={20} />
            </div>
            <div>
              <h2>Today's Punch Status</h2>
              <p>
                Status: <strong>{todayAttendance?.status || 'Present'}</strong> • <span>{todayAttendance?.workingHours || '—'}</span>
              </p>
            </div>
          </div>

          <button type="button" className="emp-attendance-check-btn" onClick={toggleCheckInOut}>
            <Clock size={16} />
            {todayAttendance?.checkedIn && todayAttendance?.checkOutTime === '—'
              ? 'Mark Check Out'
              : 'Mark Check In'}
          </button>
        </section>
      </main>

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div className="emp-attendance-modal-overlay" onClick={closeCorrectionRequest}>
          <div className="emp-attendance-modal" onClick={(e) => e.stopPropagation()}>
            {!correctionSubmitted ? (
              <>
                <div className="emp-attendance-modal-header">
                  <div>
                    <span className="emp-attendance-modal-kicker">HR NOTIFICATION</span>
                    <h2>Request Attendance Correction</h2>
                    <p>Submit a correction request for HR review.</p>
                  </div>
                  <button type="button" className="emp-attendance-modal-close" onClick={closeCorrectionRequest}>
                    <X size={20} />
                  </button>
                </div>

                <form className="emp-attendance-correction-form" onSubmit={submitCorrectionRequest}>
                  <div className="form-group">
                    <label className="form-label">Attendance Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={correctionDate}
                      onChange={(e) => setCorrectionDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Correction</label>
                    <textarea
                      className="form-textarea"
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      placeholder="Explain what needs to be corrected..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="emp-attendance-modal-actions">
                    <button type="button" className="btn-secondary flex-1" onClick={closeCorrectionRequest}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      Send to HR
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="emp-attendance-success-state">
                <CheckCircle2 size={44} color="var(--status-success)" />
                <h2>Request Sent</h2>
                <p>Your attendance correction request has been dispatched to HR for review.</p>
                <button type="button" className="btn-primary" onClick={closeCorrectionRequest}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
