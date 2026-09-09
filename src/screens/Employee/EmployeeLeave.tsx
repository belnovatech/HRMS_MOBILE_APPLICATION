import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { downloadReport } from '../../services/downloadService';
import {
  Plus,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Download,
  Loader2,
} from 'lucide-react';
import './EmployeeLeave.css';

const HR_NOTIFICATION_STORAGE_KEY = 'hrNotifications';

const calculateDuration = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }
  if (end < start) return 0;

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const formatShortDate = (dateValue?: string) => {
  if (!dateValue) return '—';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatAppliedDate = (dateValue?: string) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getLeaveData = (leaveBalances: any) => {
  const safeBalances = leaveBalances || {};
  return [
    {
      key: 'casual',
      label: 'Casual Leave',
      available: Number(safeBalances.casual?.available) || 0,
      total: Number(safeBalances.casual?.total) || 0,
      color: 'blue',
    },
    {
      key: 'sick',
      label: 'Sick Leave',
      available: Number(safeBalances.sick?.available) || 0,
      total: Number(safeBalances.sick?.total) || 0,
      color: 'purple',
    },
    {
      key: 'earned',
      label: 'Earned Leave',
      available: Number(safeBalances.earned?.available) || 0,
      total: Number(safeBalances.earned?.total) || 0,
      color: 'green',
    },
    {
      key: 'optional',
      label: 'Optional Leave',
      available: Number(safeBalances.optional?.available) || 0,
      total: Number(safeBalances.optional?.total) || 3,
      color: 'orange',
    },
  ];
};

export const EmployeeLeave: React.FC = () => {
  const {
    leaveBalances,
    leaveRequests = [],
    handleAddLeaveRequest,
    user,
  } = useAuth();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const employeeId = user?.employeeId || user?.id || 'EMP001';

  const leaveData = useMemo(
    () => getLeaveData(leaveBalances),
    [leaveBalances]
  );

  const myRequests = useMemo(
    () =>
      leaveRequests.filter(
        (request: any) => request.employeeId === employeeId
      ),
    [leaveRequests, employeeId]
  );

  const selectedLeave = useMemo(() => {
    const normalizedType = leaveType.toLowerCase();
    return leaveData.find((item) =>
      normalizedType.startsWith(item.label.toLowerCase().replace(' leave', ''))
    );
  }, [leaveData, leaveType]);

  const requestedDuration = useMemo(
    () => calculateDuration(startDate, endDate),
    [startDate, endDate]
  );

  const openApplyModal = () => {
    setShowApplyModal(true);
    setSubmitted(false);
    setFormError('');
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSubmitted(false);
    setFormError('');
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setLeaveType('Casual Leave');
    setFormError('');
  };

  const createHRNotification = (request: any) => {
    const notification = {
      id: `LEAVE-${Date.now()}`,
      type: 'leave_request',
      title: 'New Leave Request',
      message: `${user?.name || 'Employee'} (${employeeId}) submitted a ${request.leaveType} request.`,
      employeeId,
      employeeName: user?.name || 'Employee',
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      duration: request.duration,
      reason: request.reason,
      status: 'Pending',
      audience: 'HR',
      read: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingNotifications = JSON.parse(
        localStorage.getItem(HR_NOTIFICATION_STORAGE_KEY) || '[]'
      );
      localStorage.setItem(
        HR_NOTIFICATION_STORAGE_KEY,
        JSON.stringify([notification, ...existingNotifications])
      );
      window.dispatchEvent(
        new CustomEvent('hr-notification-created', { detail: notification })
      );
    } catch (error) {
      console.error('Unable to create HR notification:', error);
    }
  };

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    if (!startDate || !endDate || !reason.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (endDate < startDate) {
      setFormError('End date cannot be earlier than the start date.');
      return;
    }

    if (!requestedDuration) {
      setFormError('Please select valid leave dates.');
      return;
    }

    if (
      selectedLeave &&
      selectedLeave.total > 0 &&
      requestedDuration > selectedLeave.available
    ) {
      setFormError(
        `You only have ${selectedLeave.available} day(s) available for ${leaveType}.`
      );
      return;
    }

    const request = {
      leaveType,
      startDate,
      endDate,
      duration: requestedDuration,
      reason: reason.trim(),
      employeeId,
      employeeName: user?.name || 'Employee',
      status: 'Pending',
      appliedOn: new Date().toISOString(),
    };

    if (typeof handleAddLeaveRequest === 'function') {
      handleAddLeaveRequest(request);
    }

    createHRNotification(request);
    setSubmitted(true);
  };

  const handleDone = () => {
    setSubmitted(false);
    setShowApplyModal(false);
    resetForm();
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportLeaveReportPdf = async () => {
    setIsExporting(true);
    try {
      const headers = ['Leave Type & Dates', 'Duration & Status'];
      const rows = leaveRequests.map((req) => [
        `${req.leaveType} (${req.startDate} to ${req.endDate})`,
        `${req.duration} — Status: ${req.status}`,
      ]);

      await downloadReport(
        'EMPLOYEE LEAVE HISTORY REPORT',
        `Employee: ${user?.name || 'Arjun Mehta'} (${user?.employeeId || 'EMP001'})`,
        headers,
        rows,
        `Leave_History_Report_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="My Leave" showBack />

      <main className="page-content emp-leave-page">
        {/* Page Header */}
        <section className="emp-leave-header">
          <div>
            <h1>My Leave</h1>
            <p>Manage your leave requests and balances</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="emp-leave-apply-button"
              disabled={isExporting}
              onClick={handleExportLeaveReportPdf}
              style={{ background: '#2563eb', color: '#ffffff' }}
            >
              {isExporting ? <Loader2 size={14} className="spin-icon" /> : <Download size={14} />}
              <span>{isExporting ? 'Exporting...' : 'Export Report PDF'}</span>
            </button>

            <button
              type="button"
              className="emp-leave-apply-button"
              onClick={openApplyModal}
            >
              <Plus size={14} /> Apply Leave
            </button>
          </div>
        </section>

        {/* Leave Balance Cards */}
        <section className="emp-leave-balance-grid">
          {leaveData.map((leave) => {
            const percentage =
              leave.total > 0
                ? Math.min(100, Math.max(0, (leave.available / leave.total) * 100))
                : 0;

            return (
              <article className="emp-leave-balance-card" key={leave.key}>
                <strong
                  className={`emp-leave-balance-number emp-leave-number-${leave.color}`}
                >
                  {leave.available}
                </strong>

                <span className="emp-leave-balance-name">{leave.label}</span>

                <div className="emp-leave-progress-track">
                  <div
                    className={`emp-leave-progress-fill emp-leave-progress-${leave.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="emp-leave-balance-total">of {leave.total} days</span>
              </article>
            );
          })}
        </section>

        {/* Leave History */}
        <section className="emp-leave-history-card">
          <div className="emp-leave-history-header">
            <h2>Leave History</h2>
          </div>

          <div className="emp-leave-table-scroll">
            <table className="emp-leave-table">
              <thead>
                <tr>
                  <th>LEAVE TYPE</th>
                  <th>FROM</th>
                  <th>TO</th>
                  <th>DAYS</th>
                  <th>APPLIED ON</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {myRequests.length > 0 ? (
                  myRequests.map((request: any) => (
                    <tr key={request.id || `${request.startDate}-${request.leaveType}`}>
                      <td>
                        <strong>{request.leaveType}</strong>
                      </td>
                      <td>{formatShortDate(request.startDate)}</td>
                      <td>{formatShortDate(request.endDate)}</td>
                      <td className="emp-leave-duration">
                        {request.duration || 0}d
                      </td>
                      <td>
                        {formatAppliedDate(
                          request.appliedOn || request.createdAt
                        )}
                      </td>
                      <td>
                        <span
                          className={`emp-leave-status emp-leave-status-${String(
                            request.status || 'Pending'
                          )
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {request.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="emp-leave-empty">
                      No leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="emp-leave-modal-overlay" onClick={closeApplyModal}>
          <div
            className="emp-leave-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {!submitted ? (
              <>
                <div className="emp-leave-modal-header">
                  <div>
                    <span className="emp-leave-modal-kicker">
                      LEAVE APPLICATION
                    </span>
                    <h2>Apply for Leave</h2>
                    <p>Submit your leave request for HR approval.</p>
                  </div>

                  <button
                    type="button"
                    className="emp-leave-modal-close"
                    onClick={closeApplyModal}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form className="emp-leave-form" onSubmit={handleApply}>
                  <div className="emp-leave-form-field">
                    <label htmlFor="employee-leave-type">Leave Category</label>
                    <select
                      id="employee-leave-type"
                      value={leaveType}
                      onChange={(event) => setLeaveType(event.target.value)}
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Earned Leave">Earned Leave</option>
                      <option value="Optional Leave">Optional Leave</option>
                    </select>
                  </div>

                  <div className="emp-leave-date-grid">
                    <div className="emp-leave-form-field">
                      <label htmlFor="employee-leave-start">Start Date</label>
                      <div className="emp-leave-input-icon">
                        <Calendar size={14} />
                        <input
                          id="employee-leave-start"
                          type="date"
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="emp-leave-form-field">
                      <label htmlFor="employee-leave-end">End Date</label>
                      <div className="emp-leave-input-icon">
                        <Calendar size={14} />
                        <input
                          id="employee-leave-end"
                          type="date"
                          value={endDate}
                          min={startDate || undefined}
                          onChange={(event) => setEndDate(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {requestedDuration > 0 && (
                    <div className="emp-leave-duration-preview">
                      <span>Requested Duration</span>
                      <strong>
                        {requestedDuration}{' '}
                        {requestedDuration === 1 ? 'day' : 'days'}
                      </strong>
                    </div>
                  )}

                  <div className="emp-leave-form-field">
                    <label htmlFor="employee-leave-reason">Reason for Leave</label>
                    <textarea
                      id="employee-leave-reason"
                      rows={4}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="State the reason for your leave request..."
                      required
                    />
                  </div>

                  {formError && (
                    <div className="emp-leave-form-error">
                      <AlertCircle size={14} /> {formError}
                    </div>
                  )}

                  <div className="emp-leave-modal-actions">
                    <button
                      type="button"
                      className="emp-leave-cancel-button"
                      onClick={closeApplyModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="emp-leave-submit-button">
                      Submit Request
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="emp-leave-success">
                <div className="emp-leave-success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <h2>Leave Request Submitted</h2>
                <p>
                  Your leave request has been submitted successfully and HR has
                  been notified for review.
                </p>
                <button
                  type="button"
                  className="emp-leave-submit-button"
                  onClick={handleDone}
                >
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

