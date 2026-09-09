import React, { useMemo, useState } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiEdit2,
  FiFilter,
  FiHome,
  FiPlus,
  FiSearch,
  FiX,
  FiArrowRight,
  FiAlertCircle,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import './HRAttendance.css';

interface AttendanceLog {
  id: string;
  name: string;
  initials: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  shift: string;
  status: 'Present' | 'Absent' | 'Late' | 'WFH' | 'Leave';
  avatarBg?: string;
}

interface RegularizationRequest {
  id: number;
  employee: string;
  empId: string;
  initials: string;
  date: string;
  requestedIn: string;
  requestedOut: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  avatarBg?: string;
}

const INITIAL_LOGS: AttendanceLog[] = [
  {
    id: 'EMP1001',
    name: 'Rahul Kumar',
    initials: 'RK',
    date: 'Sep 1, 2026',
    checkIn: '09:42 AM',
    checkOut: '06:38 PM',
    hours: '8h 56m',
    shift: 'General',
    status: 'Present',
    avatarBg: '#2F6FED',
  },
  {
    id: 'EMP1002',
    name: 'Priya Sharma',
    initials: 'PS',
    date: 'Sep 1, 2026',
    checkIn: '09:12 AM',
    checkOut: '06:15 PM',
    hours: '9h 03m',
    shift: 'General',
    status: 'Present',
    avatarBg: '#D946EF',
  },
  {
    id: 'EMP1003',
    name: 'Arjun Reddy',
    initials: 'AR',
    date: 'Sep 1, 2026',
    checkIn: '10:15 AM',
    checkOut: '06:45 PM',
    hours: '8h 30m',
    shift: 'General',
    status: 'Late',
    avatarBg: '#F59E0B',
  },
  {
    id: 'EMP1004',
    name: 'Sneha Rao',
    initials: 'SR',
    date: 'Sep 1, 2026',
    checkIn: '06:05 AM',
    checkOut: '02:10 PM',
    hours: '8h 05m',
    shift: 'Morning',
    status: 'Present',
    avatarBg: '#10B981',
  },
  {
    id: 'EMP1005',
    name: 'Vikram Singh',
    initials: 'VS',
    date: 'Sep 1, 2026',
    checkIn: '02:18 PM',
    checkOut: '10:06 PM',
    hours: '7h 48m',
    shift: 'Evening',
    status: 'Late',
    avatarBg: '#635BEB',
  },
  {
    id: 'EMP1006',
    name: 'Ananya Patel',
    initials: 'AP',
    date: 'Sep 1, 2026',
    checkIn: '-',
    checkOut: '-',
    hours: '0h',
    shift: 'General',
    status: 'Absent',
    avatarBg: '#EF4444',
  },
  {
    id: 'EMP1007',
    name: 'Rohan Das',
    initials: 'RD',
    date: 'Sep 1, 2026',
    checkIn: '09:05 AM',
    checkOut: '06:30 PM',
    hours: '9h 25m',
    shift: 'General',
    status: 'WFH',
    avatarBg: '#06B6D4',
  },
];

const INITIAL_REQUESTS: RegularizationRequest[] = [
  {
    id: 1,
    employee: 'Rohan Das',
    empId: 'EMP1007',
    initials: 'RD',
    date: 'Aug 28, 2026',
    requestedIn: '09:45 AM',
    requestedOut: '07:00 PM',
    reason: 'Biometric device failure',
    status: 'Pending',
    avatarBg: '#06B6D4',
  },
  {
    id: 2,
    employee: 'Deepika Iyer',
    empId: 'EMP1012',
    initials: 'DI',
    date: 'Aug 26, 2026',
    requestedIn: '09:30 AM',
    requestedOut: '06:30 PM',
    reason: 'Forgot to punch out',
    status: 'Approved',
    avatarBg: '#2F6FED',
  },
  {
    id: 3,
    employee: 'Kiran Reddy',
    empId: 'EMP1011',
    initials: 'KR',
    date: 'Aug 25, 2026',
    requestedIn: '10:00 AM',
    requestedOut: '06:45 PM',
    reason: 'Missed biometric punch',
    status: 'Rejected',
    avatarBg: '#F59E0B',
  },
];

const STATUS_OPTIONS = ['All', 'Present', 'Absent', 'Late', 'WFH', 'Leave'];

const CALENDAR_STATUS: Record<number, string> = {
  1: 'Present',
  2: 'Present',
  3: 'Present',
  4: 'Absent',
  5: 'Late',
  6: 'Off',
  7: 'Off',
  8: 'Present',
  9: 'Present',
  10: 'Present',
  11: 'Present',
  12: 'Absent',
  13: 'Late',
  14: 'Off',
  15: 'Off',
  16: 'Present',
  17: 'Present',
  18: 'Present',
  19: 'Present',
  20: 'Absent',
  21: 'Late',
  22: 'Off',
  23: 'Off',
  24: 'Present',
  25: 'Present',
  26: 'Present',
  27: 'Present',
  28: 'Absent',
  29: 'Late',
  30: 'Present',
};

const STATUS_META: Record<string, { className: string; short: string }> = {
  Present: { className: 'present', short: 'Pre' },
  Absent: { className: 'absent', short: 'Abs' },
  Late: { className: 'late', short: 'Lat' },
  Leave: { className: 'leave', short: 'Lea' },
  WFH: { className: 'wfh', short: 'WFH' },
  Off: { className: 'off', short: 'Off' },
  Holiday: { className: 'holiday', short: 'Hol' },
  Weekend: { className: 'weekend', short: 'Off' },
};

export const HRAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'regularization'>('daily');
  const [selectedDate, setSelectedDate] = useState('2026-09-01');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);
  const [requests, setRequests] = useState<RegularizationRequest[]>(INITIAL_REQUESTS);
  const [modal, setModal] = useState<'edit' | 'regularize' | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !term ||
        log.name.toLowerCase().includes(term) ||
        log.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All' || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [logs, search, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const openEdit = (log: AttendanceLog) => {
    setEditForm({ ...log });
    setModal('edit');
  };

  const openRegularize = (log: AttendanceLog) => {
    setEditForm({
      ...log,
      requestedIn: log.checkIn === '-' ? '09:00 AM' : log.checkIn,
      requestedOut: log.checkOut === '-' ? '06:00 PM' : log.checkOut,
      reason: '',
    });
    setModal('regularize');
  };

  const closeModal = () => {
    setModal(null);
    setEditForm(null);
  };

  const saveAttendance = (event: React.FormEvent) => {
    event.preventDefault();

    setLogs((current) =>
      current.map((item) =>
        item.id === editForm.id
          ? {
              ...item,
              checkIn: editForm.checkIn,
              checkOut: editForm.checkOut,
              hours: editForm.hours || item.hours,
              status: editForm.status,
              shift: editForm.shift,
            }
          : item
      )
    );

    showToast(`Attendance updated for ${editForm.name}`);
    closeModal();
  };

  const submitRegularization = (event: React.FormEvent) => {
    event.preventDefault();

    setRequests((current) => [
      {
        id: Date.now(),
        employee: editForm.name,
        empId: editForm.id,
        initials: editForm.initials,
        date: editForm.date,
        requestedIn: editForm.requestedIn,
        requestedOut: editForm.requestedOut,
        reason: editForm.reason || 'Attendance correction requested',
        status: 'Pending',
        avatarBg: editForm.avatarBg || '#2F6FED',
      },
      ...current,
    ]);

    setActiveTab('regularization');
    showToast(`Regularization submitted for ${editForm.name}`);
    closeModal();
  };

  const updateRequestStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
    showToast(`Request marked as ${status}`);
  };

  const exportAttendance = () => {
    const header = [
      'Employee ID',
      'Employee Name',
      'Date',
      'Clock In',
      'Clock Out',
      'Working Hours',
      'Shift',
      'Status',
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      log.name,
      log.date,
      log.checkIn,
      log.checkOut,
      log.hours,
      log.shift,
      log.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-september-2026.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported attendance-september-2026.csv');
  };

  const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);
  const leadingEmptyDays = 2; // September 1, 2026 is Tuesday.

  return (
    <div className="app-container hr-att-mobile-app">
      <AppHeader title="Attendance Monitor" showBack />

      {toastMessage && (
        <div className="hr-att-toast">
          <FiCheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="page-content hr-att-page-content">
        {/* Top Header Card */}
        <section className="hr-att-header-card">
          <div className="hr-att-header-left">
            <h2 className="hr-att-main-title">Workforce Attendance</h2>
            <p className="hr-att-sub-title">Manage and track daily employee attendance · Sep 2026</p>
          </div>

          <button
            type="button"
            className="hr-att-export-btn"
            onClick={exportAttendance}
            aria-label="Export Attendance"
          >
            <FiDownload size={16} />
            <span>Export CSV</span>
          </button>
        </section>

        {/* 5 KPI Stat Cards (2-Col Mobile Grid) */}
        <section className="hr-att-stats-grid">
          <div className="hr-att-stat-box stat-present">
            <div className="hr-att-stat-icon-wrap icon-present">
              <FiCheckCircle size={18} />
            </div>
            <div className="hr-att-stat-data">
              <strong className="hr-att-stat-val">1,086</strong>
              <span className="hr-att-stat-lbl">Present Today</span>
            </div>
          </div>

          <div className="hr-att-stat-box stat-absent">
            <div className="hr-att-stat-icon-wrap icon-absent">
              <FiAlertCircle size={18} />
            </div>
            <div className="hr-att-stat-data">
              <strong className="hr-att-stat-val">72</strong>
              <span className="hr-att-stat-lbl">Absent</span>
            </div>
          </div>

          <div className="hr-att-stat-box stat-late">
            <div className="hr-att-stat-icon-wrap icon-late">
              <FiClock size={18} />
            </div>
            <div className="hr-att-stat-data">
              <strong className="hr-att-stat-val">45</strong>
              <span className="hr-att-stat-lbl">Late Punch</span>
            </div>
          </div>

          <div className="hr-att-stat-box stat-wfh">
            <div className="hr-att-stat-icon-wrap icon-wfh">
              <FiHome size={18} />
            </div>
            <div className="hr-att-stat-data">
              <strong className="hr-att-stat-val">38</strong>
              <span className="hr-att-stat-lbl">Working Remote</span>
            </div>
          </div>

          <div className="hr-att-stat-box stat-ot">
            <div className="hr-att-stat-icon-wrap icon-ot">
              <FiArrowRight size={18} />
            </div>
            <div className="hr-att-stat-data">
              <strong className="hr-att-stat-val">23</strong>
              <span className="hr-att-stat-lbl">Overtime</span>
            </div>
          </div>
        </section>

        {/* Segmented Main Navigation Tabs */}
        <div className="hr-att-tabs-nav" role="tablist">
          <button
            type="button"
            className={`hr-att-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily View
          </button>
          <button
            type="button"
            className={`hr-att-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            Monthly Calendar
          </button>
          <button
            type="button"
            className={`hr-att-tab-btn ${activeTab === 'regularization' ? 'active' : ''}`}
            onClick={() => setActiveTab('regularization')}
          >
            Regularization ({requests.filter((r) => r.status === 'Pending').length})
          </button>
        </div>

        {/* TAB 1: DAILY VIEW */}
        {activeTab === 'daily' && (
          <div className="hr-att-tab-body">
            {/* Shift Overview Cards (Horizontal Scroll) */}
            <div className="hr-att-shifts-section">
              <span className="hr-att-section-micro-title">Active Shifts Overview</span>
              <div className="hr-att-shifts-scroll">
                <div className="hr-att-shift-card">
                  <div className="shift-dot-title">
                    <span className="shift-dot" style={{ backgroundColor: '#2F6FED' }} />
                    <strong>General Shift</strong>
                  </div>
                  <span className="shift-count">890 staff</span>
                  <small className="shift-time">09:30 AM – 06:30 PM</small>
                </div>

                <div className="hr-att-shift-card">
                  <div className="shift-dot-title">
                    <span className="shift-dot" style={{ backgroundColor: '#06B6D4' }} />
                    <strong>Morning Shift</strong>
                  </div>
                  <span className="shift-count">96 staff</span>
                  <small className="shift-time">06:00 AM – 02:00 PM</small>
                </div>

                <div className="hr-att-shift-card">
                  <div className="shift-dot-title">
                    <span className="shift-dot" style={{ backgroundColor: '#635BEB' }} />
                    <strong>Evening Shift</strong>
                  </div>
                  <span className="shift-count">72 staff</span>
                  <small className="shift-time">02:00 PM – 10:00 PM</small>
                </div>

                <div className="hr-att-shift-card">
                  <div className="shift-dot-title">
                    <span className="shift-dot" style={{ backgroundColor: '#D946EF' }} />
                    <strong>Night Shift</strong>
                  </div>
                  <span className="shift-count">28 staff</span>
                  <small className="shift-time">10:00 PM – 06:00 AM</small>
                </div>
              </div>
            </div>

            {/* Date & Search Toolbar */}
            <div className="hr-att-toolbar-card">
              <div className="hr-att-search-row">
                <div className="hr-att-search-box">
                  <FiSearch className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Search employee name / ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type="button" className="clear-btn" onClick={() => setSearch('')}>
                      <FiX size={15} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className={`hr-att-filter-trigger-btn ${statusFilter !== 'All' ? 'has-filter' : ''}`}
                  onClick={() => setShowFilterModal(true)}
                  aria-label="Filter status"
                >
                  <FiFilter size={16} />
                  <span>{statusFilter === 'All' ? 'Filter' : statusFilter}</span>
                </button>
              </div>

              {/* Date Selector Row */}
              <div className="hr-att-date-picker-row">
                <FiCalendar className="cal-icon" size={16} />
                <span className="date-lbl">Log Date:</span>
                <input
                  type="date"
                  className="hr-att-date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Active Status Filter Chips */}
            <div className="hr-att-status-chips-scroll">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`hr-att-chip ${statusFilter === opt ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="hr-att-count-banner">
              <span>
                Showing <strong>{filteredLogs.length}</strong> of {logs.length} employee records
              </span>
            </div>

            {/* Employee Attendance Cards */}
            <div className="hr-att-cards-list">
              {filteredLogs.length === 0 ? (
                <div className="hr-att-empty-card">
                  <FiClock size={28} color="#94a3b8" />
                  <h4>No attendance records found</h4>
                  <p>Try clearing your search query or choosing another status filter.</p>
                  <button
                    type="button"
                    className="hr-att-reset-filter-btn"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('All');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const meta = STATUS_META[log.status] || STATUS_META.Present;

                  return (
                    <div key={log.id} className="hr-att-record-card">
                      {/* Top: Avatar, Name, Status */}
                      <div className="hr-att-record-top">
                        <div
                          className="hr-att-user-avatar"
                          style={{ backgroundColor: log.avatarBg || '#2F6FED' }}
                        >
                          {log.initials}
                        </div>

                        <div className="hr-att-user-info">
                          <strong className="hr-att-user-name">{log.name}</strong>
                          <span className="hr-att-user-id">{log.id} • {log.shift} Shift</span>
                        </div>

                        <span className={`hr-att-status-pill status-${meta.className}`}>
                          <span className="status-dot" />
                          {log.status}
                        </span>
                      </div>

                      {/* Middle: Timing & Hours Grid */}
                      <div className="hr-att-times-box">
                        <div className="time-item">
                          <span className="t-lbl">Check In</span>
                          <strong className="t-val t-in">{log.checkIn}</strong>
                        </div>
                        <div className="time-item">
                          <span className="t-lbl">Check Out</span>
                          <strong className="t-val t-out">{log.checkOut}</strong>
                        </div>
                        <div className="time-item">
                          <span className="t-lbl">Total Hours</span>
                          <strong className="t-val">{log.hours}</strong>
                        </div>
                      </div>

                      {/* Actions: Edit & Regularize */}
                      <div className="hr-att-record-actions">
                        <button
                          type="button"
                          className="hr-att-act-btn btn-edit"
                          onClick={() => openEdit(log)}
                        >
                          <FiEdit2 size={14} />
                          <span>Edit Attendance</span>
                        </button>
                        <button
                          type="button"
                          className="hr-att-act-btn btn-regularize"
                          onClick={() => openRegularize(log)}
                        >
                          <span>Regularize</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MONTHLY CALENDAR */}
        {activeTab === 'monthly' && (
          <div className="hr-att-calendar-card">
            <div className="hr-att-cal-header">
              <div className="cal-title-wrap">
                <h3>September 2026</h3>
                <span className="cal-sub">Organization-wide attendance heat calendar</span>
              </div>

              {/* Selected date feedback */}
              <div className="hr-att-selected-date-badge">
                <span>Selected: {selectedDate}</span>
              </div>
            </div>

            {/* Calendar Legend Chips */}
            <div className="hr-att-cal-legend-chips">
              {['Present', 'Absent', 'Late', 'Leave', 'Holiday', 'Weekend'].map((item) => (
                <span key={item} className="legend-chip">
                  <i className={`legend-dot dot-${STATUS_META[item].className}`} />
                  {item}
                </span>
              ))}
            </div>

            {/* Weekdays */}
            <div className="hr-att-cal-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="hr-att-cal-grid">
              {Array.from({ length: leadingEmptyDays }).map((_, idx) => (
                <div key={`empty-${idx}`} className="cal-cell empty-cell" />
              ))}

              {calendarDays.map((day) => {
                const status = CALENDAR_STATUS[day] || 'Present';
                const meta = STATUS_META[status] || STATUS_META.Present;
                const formattedDay = `2026-09-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === formattedDay;

                return (
                  <button
                    key={day}
                    type="button"
                    className={`cal-cell cell-${meta.className} ${isSelected ? 'selected-cell' : ''}`}
                    onClick={() => {
                      setSelectedDate(formattedDay);
                      showToast(`Selected Sep ${day}, 2026 (${status})`);
                    }}
                  >
                    <strong className="cell-day">{day}</strong>
                    <small className="cell-status-tag">{meta.short}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: REGULARIZATION */}
        {activeTab === 'regularization' && (
          <div className="hr-att-regularization-card">
            <div className="hr-att-reg-header">
              <h3>Regularization Requests</h3>
              <p>Review and action employee biometric correction requests</p>
            </div>

            <div className="hr-att-reg-list">
              {requests.map((req) => (
                <div key={req.id} className="hr-att-reg-item">
                  <div className="hr-att-reg-top">
                    <div className="hr-att-reg-user">
                      <div
                        className="hr-att-reg-avatar"
                        style={{ backgroundColor: req.avatarBg || '#2F6FED' }}
                      >
                        {req.initials}
                      </div>
                      <div className="hr-att-reg-info">
                        <strong>{req.employee}</strong>
                        <small>{req.empId} • {req.date}</small>
                      </div>
                    </div>

                    <span className={`hr-att-reg-status-pill reg-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Requested Timings */}
                  <div className="hr-att-reg-times-row">
                    <div className="reg-time-block">
                      <span>Requested In:</span>
                      <strong>{req.requestedIn}</strong>
                    </div>
                    <div className="reg-time-block">
                      <span>Requested Out:</span>
                      <strong>{req.requestedOut}</strong>
                    </div>
                  </div>

                  <p className="hr-att-reg-reason">"{req.reason}"</p>

                  {req.status === 'Pending' && (
                    <div className="hr-att-reg-actions">
                      <button
                        type="button"
                        className="hr-att-btn-approve"
                        onClick={() => updateRequestStatus(req.id, 'Approved')}
                      >
                        <FiCheck size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        className="hr-att-btn-reject"
                        onClick={() => updateRequestStatus(req.id, 'Rejected')}
                      >
                        <FiX size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bottom Sheet Modal */}
        {showFilterModal && (
          <div className="hr-att-sheet-overlay" onClick={() => setShowFilterModal(false)}>
            <div className="hr-att-bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <h4>Filter Attendance Status</h4>
                <button type="button" onClick={() => setShowFilterModal(false)}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="sheet-options-list">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`sheet-option-item ${statusFilter === opt ? 'selected' : ''}`}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowFilterModal(false);
                    }}
                  >
                    <span>{opt}</span>
                    {statusFilter === opt && <FiCheck size={16} color="#2F6FED" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Attendance / Regularize Bottom Sheet */}
        {modal && editForm && (
          <div className="hr-att-sheet-overlay" onClick={closeModal}>
            <div className="hr-att-bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <div>
                  <h4>{modal === 'edit' ? 'Edit Attendance' : 'Regularize Attendance'}</h4>
                  <p>{editForm.name} • {editForm.id}</p>
                </div>
                <button type="button" onClick={closeModal}>
                  <FiX size={20} />
                </button>
              </div>

              {modal === 'edit' ? (
                <form onSubmit={saveAttendance} className="sheet-form-body">
                  <div className="sheet-fields-grid">
                    <div className="sheet-field">
                      <label>Date</label>
                      <input type="text" value={editForm.date} disabled className="input-disabled" />
                    </div>

                    <div className="sheet-field">
                      <label>Shift</label>
                      <select
                        value={editForm.shift}
                        onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                        className="sheet-select"
                      >
                        <option value="General">General</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>

                    <div className="sheet-field">
                      <label>Check In</label>
                      <input
                        type="text"
                        value={editForm.checkIn}
                        onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                        className="sheet-input"
                        placeholder="09:00 AM"
                      />
                    </div>

                    <div className="sheet-field">
                      <label>Check Out</label>
                      <input
                        type="text"
                        value={editForm.checkOut}
                        onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                        className="sheet-input"
                        placeholder="06:00 PM"
                      />
                    </div>

                    <div className="sheet-field">
                      <label>Working Hours</label>
                      <input
                        type="text"
                        value={editForm.hours}
                        onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                        className="sheet-input"
                        placeholder="8h 30m"
                      />
                    </div>

                    <div className="sheet-field">
                      <label>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="sheet-select"
                      >
                        {STATUS_OPTIONS.filter((o) => o !== 'All').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sheet-action-footer">
                    <button type="button" className="sheet-btn-cancel" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="sheet-btn-save">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitRegularization} className="sheet-form-body">
                  <div className="sheet-fields-grid">
                    <div className="sheet-field">
                      <label>Date</label>
                      <input type="text" value={editForm.date} disabled className="input-disabled" />
                    </div>

                    <div className="sheet-field">
                      <label>Employee Name</label>
                      <input type="text" value={editForm.name} disabled className="input-disabled" />
                    </div>

                    <div className="sheet-field">
                      <label>Requested Check In</label>
                      <input
                        type="text"
                        value={editForm.requestedIn}
                        onChange={(e) => setEditForm({ ...editForm, requestedIn: e.target.value })}
                        className="sheet-input"
                        required
                      />
                    </div>

                    <div className="sheet-field">
                      <label>Requested Check Out</label>
                      <input
                        type="text"
                        value={editForm.requestedOut}
                        onChange={(e) => setEditForm({ ...editForm, requestedOut: e.target.value })}
                        className="sheet-input"
                        required
                      />
                    </div>

                    <div className="sheet-field full-width">
                      <label>Reason for Correction *</label>
                      <textarea
                        rows={3}
                        value={editForm.reason}
                        onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                        placeholder="e.g. Biometric device timed out or client on-site visit..."
                        className="sheet-textarea"
                        required
                      />
                    </div>
                  </div>

                  <div className="sheet-action-footer">
                    <button type="button" className="sheet-btn-cancel" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="sheet-btn-save">
                      <FiPlus size={15} />
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HRAttendance;
