import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFilter,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiUser,
  FiBriefcase,
  FiChevronRight,
  FiInfo,
} from 'react-icons/fi';
import './HRLeaveManagement.css';

interface LeavePolicy {
  id: string;
  name: string;
  annual: number;
  used: number;
  remaining: number;
  carryForward: string;
  encashment: string;
  approval: string;
  colorTone?: 'blue' | 'purple' | 'green' | 'orange';
}

interface LeaveBalance {
  id: string;
  employee: string;
  initials: string;
  casual: number;
  sick: number;
  earned: number;
  optional: number;
  avatarBg?: string;
}

const INITIAL_POLICIES: LeavePolicy[] = [
  {
    id: 'casual',
    name: 'Casual Leave',
    annual: 12,
    used: 4,
    remaining: 8,
    carryForward: 'Yes (max 5 days)',
    encashment: 'Enabled',
    approval: 'Manager → HR',
    colorTone: 'blue',
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    annual: 12,
    used: 3,
    remaining: 9,
    carryForward: 'Yes (max 5 days)',
    encashment: 'Enabled',
    approval: 'Manager → HR',
    colorTone: 'purple',
  },
  {
    id: 'earned',
    name: 'Earned Leave',
    annual: 18,
    used: 6,
    remaining: 12,
    carryForward: 'Yes (max 5 days)',
    encashment: 'Enabled',
    approval: 'Manager → HR',
    colorTone: 'green',
  },
  {
    id: 'optional',
    name: 'Optional Leave',
    annual: 3,
    used: 1,
    remaining: 2,
    carryForward: 'Yes (max 5 days)',
    encashment: 'Enabled',
    approval: 'Manager → HR',
    colorTone: 'orange',
  },
];

const INITIAL_BALANCES: LeaveBalance[] = [];

const FILTER_STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];

const FILTER_TYPE_OPTIONS = [
  'All Leave Types',
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'Optional Leave',
];

export const HRLeaveManagement: React.FC = () => {
  const { teamMembers = [], leaveRequests = [], handleApproveLeave, handleRejectLeave } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'policies' | 'balance'>('requests');
  const [policies, setPolicies] = useState<LeavePolicy[]>(INITIAL_POLICIES);

  const balances: LeaveBalance[] = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) return [];
    return teamMembers.map((m) => {
      const initials = (m.name || 'EM')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      return {
        id: m.id || m.employeeId || 'EMP',
        employee: m.name || 'Employee',
        initials,
        casual: 12,
        sick: 12,
        earned: 18,
        optional: 3,
        avatarBg: m.color || '#2F6FED',
      };
    });
  }, [teamMembers]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Leave Types');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState('All');
  const [tempType, setTempType] = useState('All Leave Types');

  // Modal / Sheets State
  const [modalType, setModalType] = useState<'view' | 'policy' | 'approveConfirm' | 'rejectConfirm' | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);

  // Policy Form Local State
  const [policyForm, setPolicyForm] = useState({
    annual: 12,
    used: 4,
    carryForward: 'Yes (max 5 days)',
    encashment: 'Enabled',
    approval: 'Manager → HR',
  });

  // Export Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Normalized Requests
  const normalizedRequests = useMemo(() => {
    return leaveRequests.map((req) => ({
      id: req.id,
      employeeId: req.employeeId || 'EMP001',
      employee: req.employeeName || req.employeeId || 'Employee',
      department: (req as any).department || 'Engineering',
      initials: (req as any).initials || (req.employeeName ? req.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'EM'),
      type: req.leaveType || 'Casual Leave',
      from: req.startDate || '—',
      to: req.endDate || '—',
      days: typeof req.duration === 'string' ? parseInt(req.duration, 10) || 1 : (req.duration || 1),
      reason: req.reason || '—',
      applied: (req as any).appliedOn || 'Today',
      status: req.status || 'Pending',
      avatarBg: (req as any).avatarBg || '#2F6FED',
    }));
  }, [leaveRequests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return normalizedRequests.filter((request) => {
      const matchesSearch =
        !term ||
        request.employee.toLowerCase().includes(term) ||
        request.employeeId.toLowerCase().includes(term) ||
        request.id.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesType = typeFilter === 'All Leave Types' || request.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [normalizedRequests, search, statusFilter, typeFilter]);

  // Dynamic counts
  const pendingCount = normalizedRequests.filter((item) => item.status === 'Pending').length;
  const approvedCount = normalizedRequests.filter((item) => item.status === 'Approved').length;
  const rejectedCount = normalizedRequests.filter((item) => item.status === 'Rejected').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const onLeaveTodayCount = normalizedRequests.filter((item) => {
    return item.status === 'Approved' && (!item.from || item.from <= todayStr) && (!item.to || item.to >= todayStr);
  }).length;

  // Close modals
  const closeModal = () => {
    setModalType(null);
    setSelectedRequest(null);
    setSelectedPolicy(null);
  };

  // Approve & Reject Handlers
  const confirmApprove = (req: any) => {
    setSelectedRequest(req);
    setModalType('approveConfirm');
  };

  const confirmReject = (req: any) => {
    setSelectedRequest(req);
    setModalType('rejectConfirm');
  };

  const handleExecuteApprove = async () => {
    if (selectedRequest) {
      await handleApproveLeave(selectedRequest.id);
      showToast(`Leave request for ${selectedRequest.employee} approved.`);
      closeModal();
    }
  };

  const handleExecuteReject = async () => {
    if (selectedRequest) {
      await handleRejectLeave(selectedRequest.id, 'Rejected by HR');
      showToast(`Leave request for ${selectedRequest.employee} rejected.`);
      closeModal();
    }
  };

  // Export functions
  const exportRequests = () => {
    const header = [
      'Request ID',
      'Employee ID',
      'Employee',
      'Department',
      'Leave Type',
      'From',
      'To',
      'Days',
      'Reason',
      'Applied',
      'Status',
    ];

    const rows = filteredRequests.map((request) => [
      request.id,
      request.employeeId,
      request.employee,
      request.department,
      request.type,
      request.from,
      request.to,
      request.days,
      request.reason,
      request.applied,
      request.status,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leave-requests.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded leave-requests.csv');
  };

  const exportBalances = () => {
    const header = [
      'Employee ID',
      'Employee',
      'Casual Leave',
      'Sick Leave',
      'Earned Leave',
      'Optional Leave',
      'Total Available',
    ];

    const rows = balances.map((employee) => {
      const total = employee.casual + employee.sick + employee.earned + employee.optional;
      return [
        employee.id,
        employee.employee,
        `${employee.casual} days`,
        `${employee.sick} days`,
        `${employee.earned} days`,
        `${employee.optional} days`,
        `${total} days`,
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leave-balances.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded leave-balances.csv');
  };

  const handleExport = () => {
    if (activeTab === 'balance') {
      exportBalances();
    } else {
      exportRequests();
    }
  };

  // Open Policy Editor
  const openPolicyEditor = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      annual: policy.annual,
      used: policy.used,
      carryForward: policy.carryForward,
      encashment: policy.encashment,
      approval: policy.approval,
    });
    setModalType('policy');
  };

  // Save Policy
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    const annual = Number(policyForm.annual) || 0;
    const used = Number(policyForm.used) || 0;
    const remaining = Math.max(annual - used, 0);

    setPolicies((current) =>
      current.map((p) =>
        p.id === selectedPolicy.id
          ? {
              ...p,
              annual,
              used,
              remaining,
              carryForward: policyForm.carryForward,
              encashment: policyForm.encashment,
              approval: policyForm.approval,
            }
          : p
      )
    );

    showToast(`${selectedPolicy.name} policy updated successfully.`);
    closeModal();
  };

  // View Request Details
  const openRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setModalType('view');
  };

  // Filter sheet handling
  const openFilterSheet = () => {
    setTempStatus(statusFilter);
    setTempType(typeFilter);
    setIsFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(tempStatus);
    setTypeFilter(tempType);
    setIsFilterSheetOpen(false);
  };

  const resetFilters = () => {
    setTempStatus('All');
    setTempType('All Leave Types');
    setStatusFilter('All');
    setTypeFilter('All Leave Types');
    setIsFilterSheetOpen(false);
  };

  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (typeFilter !== 'All Leave Types' ? 1 : 0);

  return (
    <div className="bel-leave-page-container">
      {/* App Header */}
      <AppHeader title="Leave Management" showBack={false} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bel-leave-toast" role="alert">
          <FiCheckCircle className="bel-leave-toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bel-leave-scroll-content">
        {/* Mobile Header Banner */}
        <div className="bel-leave-hero-header">
          <div className="bel-leave-hero-text">
            <h1 className="bel-leave-title">Leave Management</h1>
            <p className="bel-leave-subtitle">Manage employee leave requests, policies and balances</p>
          </div>
          <button
            type="button"
            className="bel-leave-export-btn"
            onClick={handleExport}
            aria-label="Export data as CSV"
            title="Export data as CSV"
          >
            <FiDownload />
            <span>Export</span>
          </button>
        </div>

        {/* Dynamic Statistics Cards */}
        <section className="bel-leave-stats-scroll" aria-label="Leave KPI Statistics">
          <div className="bel-leave-stat-card bel-leave-stat-card--pending">
            <div className="bel-leave-stat-icon-wrap">
              <FiClock />
            </div>
            <div className="bel-leave-stat-data">
              <strong className="bel-leave-stat-number">{pendingCount}</strong>
              <span className="bel-leave-stat-label">Pending</span>
            </div>
          </div>

          <div className="bel-leave-stat-card bel-leave-stat-card--approved">
            <div className="bel-leave-stat-icon-wrap">
              <FiCheckCircle />
            </div>
            <div className="bel-leave-stat-data">
              <strong className="bel-leave-stat-number">{approvedCount}</strong>
              <span className="bel-leave-stat-label">Approved</span>
            </div>
          </div>

          <div className="bel-leave-stat-card bel-leave-stat-card--rejected">
            <div className="bel-leave-stat-icon-wrap">
              <FiXCircle />
            </div>
            <div className="bel-leave-stat-data">
              <strong className="bel-leave-stat-number">{rejectedCount}</strong>
              <span className="bel-leave-stat-label">Rejected</span>
            </div>
          </div>

          <div className="bel-leave-stat-card bel-leave-stat-card--today">
            <div className="bel-leave-stat-icon-wrap">
              <FiCalendar />
            </div>
            <div className="bel-leave-stat-data">
              <strong className="bel-leave-stat-number">{onLeaveTodayCount}</strong>
              <span className="bel-leave-stat-label">On Leave Today</span>
            </div>
          </div>
        </section>

        {/* Mobile Segmented Control Navigation */}
        <div className="bel-leave-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'requests'}
            className={`bel-leave-tab-btn ${activeTab === 'requests' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span>Requests</span>
            {pendingCount > 0 && <span className="bel-leave-badge-count">{pendingCount}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'policies'}
            className={`bel-leave-tab-btn ${activeTab === 'policies' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            <span>Policies</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'balance'}
            className={`bel-leave-tab-btn ${activeTab === 'balance' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('balance')}
          >
            <span>Balance</span>
          </button>
        </div>

        {/* =========================================================
            TAB 1: LEAVE REQUESTS (MOBILE CARDS)
            ========================================================= */}
        {activeTab === 'requests' && (
          <section className="bel-leave-requests-section">
            {/* Search & Filter Bar */}
            <div className="bel-leave-filter-bar">
              <div className="bel-leave-search-box">
                <FiSearch className="bel-leave-search-icon" />
                <input
                  type="search"
                  className="bel-leave-search-input"
                  placeholder="Search employee or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search employee or leave request"
                />
                {search && (
                  <button
                    type="button"
                    className="bel-leave-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`bel-leave-filter-trigger ${activeFiltersCount > 0 ? 'is-filtering' : ''}`}
                onClick={openFilterSheet}
                aria-label="Filter leave requests"
              >
                <FiFilter />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bel-leave-filter-indicator">{activeFiltersCount}</span>
                )}
              </button>
            </div>

            {/* Active Filters Tag Pills */}
            {(statusFilter !== 'All' || typeFilter !== 'All Leave Types') && (
              <div className="bel-leave-active-pills-row">
                {statusFilter !== 'All' && (
                  <span className="bel-leave-active-pill">
                    Status: {statusFilter}
                    <button type="button" onClick={() => setStatusFilter('All')} aria-label="Remove status filter">
                      <FiX />
                    </button>
                  </span>
                )}
                {typeFilter !== 'All Leave Types' && (
                  <span className="bel-leave-active-pill">
                    Type: {typeFilter}
                    <button type="button" onClick={() => setTypeFilter('All Leave Types')} aria-label="Remove type filter">
                      <FiX />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="bel-leave-reset-link"
                  onClick={resetFilters}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Request Cards List */}
            {filteredRequests.length === 0 ? (
              <div className="bel-leave-empty-box">
                <div className="bel-leave-empty-icon-wrap">
                  <FiAlertCircle />
                </div>
                <h3>No leave requests found</h3>
                <p>Try searching with another keyword or adjusting the status/type filters.</p>
                {(search || statusFilter !== 'All' || typeFilter !== 'All Leave Types') && (
                  <button type="button" className="bel-leave-empty-action" onClick={resetFilters}>
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bel-leave-cards-list">
                {filteredRequests.map((req) => (
                  <article key={req.id} className="bel-leave-card">
                    {/* Card Header */}
                    <div className="bel-leave-card-top">
                      <div className="bel-leave-card-employee">
                        <span
                          className="bel-leave-card-avatar"
                          style={{ backgroundColor: req.avatarBg }}
                        >
                          {req.initials}
                        </span>
                        <div className="bel-leave-card-emp-info">
                          <strong className="bel-leave-emp-name">{req.employee}</strong>
                          <div className="bel-leave-emp-meta">
                            <span>{req.employeeId}</span>
                            <span className="bel-leave-meta-dot" />
                            <span>{req.department}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`bel-leave-status-pill bel-leave-status-pill--${req.status.toLowerCase()}`}
                      >
                        <span className="bel-leave-status-dot" />
                        {req.status}
                      </span>
                    </div>

                    {/* Card Body: Leave Type & Dates */}
                    <div className="bel-leave-card-body">
                      <div className="bel-leave-type-tag">
                        <FiLayers className="bel-leave-tag-icon" />
                        <span>{req.type}</span>
                        <span className="bel-leave-days-count">{req.days} {req.days === 1 ? 'day' : 'days'}</span>
                      </div>

                      <div className="bel-leave-date-interval">
                        <div className="bel-leave-date-point">
                          <small>From</small>
                          <strong>{req.from}</strong>
                        </div>
                        <div className="bel-leave-date-arrow">→</div>
                        <div className="bel-leave-date-point">
                          <small>To</small>
                          <strong>{req.to}</strong>
                        </div>
                      </div>

                      {req.reason && req.reason !== '—' && (
                        <p className="bel-leave-card-reason">
                          <span className="bel-leave-reason-label">Reason:</span> "{req.reason}"
                        </p>
                      )}

                      <div className="bel-leave-card-footer-meta">
                        <span>Applied on: <strong>{req.applied}</strong></span>
                        <span>ID: <code>{req.id}</code></span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="bel-leave-card-actions">
                      <button
                        type="button"
                        className="bel-leave-btn-view"
                        onClick={() => openRequestDetails(req)}
                        aria-label={`View details for ${req.employee}`}
                      >
                        <FiEye />
                        <span>Details</span>
                      </button>

                      {req.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="bel-leave-btn-reject"
                            onClick={() => confirmReject(req)}
                            aria-label={`Reject leave for ${req.employee}`}
                          >
                            <FiX />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            className="bel-leave-btn-approve"
                            onClick={() => confirmApprove(req)}
                            aria-label={`Approve leave for ${req.employee}`}
                          >
                            <FiCheck />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            TAB 2: LEAVE POLICIES (MOBILE CARDS)
            ========================================================= */}
        {activeTab === 'policies' && (
          <section className="bel-leave-policies-section">
            <div className="bel-leave-section-headline">
              <h2>Company Leave Policies</h2>
              <p>Configure yearly allocations, carry forward limits, and approval workflows</p>
            </div>

            <div className="bel-leave-policy-cards-grid">
              {policies.map((policy) => {
                const utilization =
                  policy.annual > 0
                    ? Math.round((policy.used / policy.annual) * 100)
                    : 0;

                return (
                  <article key={policy.id} className={`bel-leave-policy-card bel-leave-policy-card--${policy.colorTone || 'blue'}`}>
                    <div className="bel-leave-policy-card-header">
                      <div className="bel-leave-policy-title-wrap">
                        <h3>{policy.name}</h3>
                        <span className="bel-leave-policy-badge">{policy.annual} Days/Yr</span>
                      </div>
                      <button
                        type="button"
                        className="bel-leave-policy-edit-btn"
                        onClick={() => openPolicyEditor(policy)}
                        aria-label={`Edit ${policy.name} policy`}
                      >
                        <FiEdit2 />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Policy Metrics */}
                    <div className="bel-leave-policy-kpis">
                      <div className="bel-leave-kpi-box">
                        <strong>{policy.annual}</strong>
                        <span>Annual</span>
                      </div>
                      <div className="bel-leave-kpi-box">
                        <strong className="bel-leave-kpi-used">{policy.used}</strong>
                        <span>Used</span>
                      </div>
                      <div className="bel-leave-kpi-box">
                        <strong className="bel-leave-kpi-remaining">{policy.remaining}</strong>
                        <span>Remaining</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bel-leave-utilization-wrap">
                      <div className="bel-leave-utilization-bar">
                        <div
                          className="bel-leave-utilization-fill"
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <div className="bel-leave-utilization-meta">
                        <span>Used: {policy.used} days</span>
                        <strong>{utilization}% utilized</strong>
                      </div>
                    </div>

                    {/* Policy Rules Meta */}
                    <div className="bel-leave-policy-rules">
                      <div className="bel-leave-rule-item">
                        <span className="bel-leave-rule-label">Carry Forward:</span>
                        <strong className="bel-leave-rule-val">{policy.carryForward}</strong>
                      </div>
                      <div className="bel-leave-rule-item">
                        <span className="bel-leave-rule-label">Encashment:</span>
                        <strong className="bel-leave-rule-val">{policy.encashment}</strong>
                      </div>
                      <div className="bel-leave-rule-item">
                        <span className="bel-leave-rule-label">Approval Flow:</span>
                        <strong className="bel-leave-rule-val">{policy.approval}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 3: LEAVE BALANCE (MOBILE CARDS)
            ========================================================= */}
        {activeTab === 'balance' && (
          <section className="bel-leave-balance-section">
            <div className="bel-leave-section-headline">
              <h2>Employee Leave Balances</h2>
              <p>Real-time leave balance breakdown across Casual, Sick, Earned and Optional leaves</p>
            </div>

            <div className="bel-leave-balance-cards-list">
              {balances.map((emp) => {
                const total = emp.casual + emp.sick + emp.earned + emp.optional;

                return (
                  <article key={emp.id} className="bel-leave-balance-card">
                    <div className="bel-leave-balance-card-header">
                      <div className="bel-leave-card-employee">
                        <span
                          className="bel-leave-card-avatar"
                          style={{ backgroundColor: emp.avatarBg }}
                        >
                          {emp.initials}
                        </span>
                        <div>
                          <strong className="bel-leave-emp-name">{emp.employee}</strong>
                          <span className="bel-leave-emp-id">{emp.id}</span>
                        </div>
                      </div>

                      <div className="bel-leave-total-available-badge">
                        <small>Total Available</small>
                        <strong>{total} Days</strong>
                      </div>
                    </div>

                    {/* 2x2 Breakdown Grid */}
                    <div className="bel-leave-breakdown-grid">
                      <div className="bel-leave-breakdown-item">
                        <span className="bel-leave-breakdown-type">Casual Leave</span>
                        <strong>{emp.casual} <small>days</small></strong>
                      </div>
                      <div className="bel-leave-breakdown-item">
                        <span className="bel-leave-breakdown-type">Sick Leave</span>
                        <strong>{emp.sick} <small>days</small></strong>
                      </div>
                      <div className="bel-leave-breakdown-item">
                        <span className="bel-leave-breakdown-type">Earned Leave</span>
                        <strong>{emp.earned} <small>days</small></strong>
                      </div>
                      <div className="bel-leave-breakdown-item">
                        <span className="bel-leave-breakdown-type">Optional Leave</span>
                        <strong>{emp.optional} <small>days</small></strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          BOTTOM SHEET: FILTER LEAVE REQUESTS
          ========================================================= */}
      {isFilterSheetOpen && (
        <div
          className="bel-leave-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsFilterSheetOpen(false);
          }}
        >
          <div className="bel-leave-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title">
            <div className="bel-leave-sheet-drag-handle" />

            <div className="bel-leave-sheet-header">
              <div>
                <h2 id="filter-sheet-title">Filter Requests</h2>
                <p>Filter by status and leave type</p>
              </div>
              <button
                type="button"
                className="bel-leave-sheet-close"
                onClick={() => setIsFilterSheetOpen(false)}
                aria-label="Close filters"
              >
                <FiX />
              </button>
            </div>

            <div className="bel-leave-sheet-body">
              {/* Status Section */}
              <div className="bel-leave-filter-group">
                <label className="bel-leave-filter-group-title">Attendance / Leave Status</label>
                <div className="bel-leave-filter-chips">
                  {FILTER_STATUS_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      className={`bel-leave-filter-chip ${tempStatus === opt ? 'is-selected' : ''}`}
                      onClick={() => setTempStatus(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Section */}
              <div className="bel-leave-filter-group">
                <label className="bel-leave-filter-group-title">Leave Type</label>
                <div className="bel-leave-filter-chips">
                  {FILTER_TYPE_OPTIONS.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={`bel-leave-filter-chip ${tempType === type ? 'is-selected' : ''}`}
                      onClick={() => setTempType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bel-leave-sheet-footer">
              <button
                type="button"
                className="bel-leave-btn-secondary"
                onClick={resetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="bel-leave-btn-primary"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: VIEW LEAVE REQUEST DETAILS
          ========================================================= */}
      {modalType === 'view' && selectedRequest && (
        <div
          className="bel-leave-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-leave-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="view-sheet-title">
            <div className="bel-leave-sheet-drag-handle" />

            <div className="bel-leave-sheet-header">
              <div>
                <h2 id="view-sheet-title">Leave Request Details</h2>
                <p>Request ID: {selectedRequest.id}</p>
              </div>
              <button type="button" className="bel-leave-sheet-close" onClick={closeModal} aria-label="Close details">
                <FiX />
              </button>
            </div>

            <div className="bel-leave-sheet-body">
              {/* Employee Header Chip */}
              <div className="bel-leave-detail-employee-hero">
                <span
                  className="bel-leave-card-avatar"
                  style={{ backgroundColor: selectedRequest.avatarBg }}
                >
                  {selectedRequest.initials}
                </span>
                <div>
                  <h3>{selectedRequest.employee}</h3>
                  <p>{selectedRequest.employeeId} · {selectedRequest.department}</p>
                </div>
                <span
                  className={`bel-leave-status-pill bel-leave-status-pill--${selectedRequest.status.toLowerCase()}`}
                >
                  {selectedRequest.status}
                </span>
              </div>

              {/* Data Grid */}
              <div className="bel-leave-detail-grid">
                <div className="bel-leave-detail-item">
                  <span className="bel-leave-detail-label">Leave Type</span>
                  <strong className="bel-leave-detail-value">{selectedRequest.type}</strong>
                </div>

                <div className="bel-leave-detail-item">
                  <span className="bel-leave-detail-label">Duration</span>
                  <strong className="bel-leave-detail-value">{selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}</strong>
                </div>

                <div className="bel-leave-detail-item">
                  <span className="bel-leave-detail-label">From Date</span>
                  <strong className="bel-leave-detail-value">{selectedRequest.from}</strong>
                </div>

                <div className="bel-leave-detail-item">
                  <span className="bel-leave-detail-label">To Date</span>
                  <strong className="bel-leave-detail-value">{selectedRequest.to}</strong>
                </div>

                <div className="bel-leave-detail-item bel-leave-detail-full">
                  <span className="bel-leave-detail-label">Reason for Leave</span>
                  <p className="bel-leave-detail-reason">"{selectedRequest.reason}"</p>
                </div>

                <div className="bel-leave-detail-item bel-leave-detail-full">
                  <span className="bel-leave-detail-label">Applied On</span>
                  <span className="bel-leave-detail-applied">{selectedRequest.applied}</span>
                </div>
              </div>
            </div>

            <div className="bel-leave-sheet-footer">
              <button type="button" className="bel-leave-btn-secondary" onClick={closeModal}>
                Close
              </button>

              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    className="bel-leave-btn-reject"
                    onClick={() => {
                      closeModal();
                      confirmReject(selectedRequest);
                    }}
                  >
                    <FiX />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    className="bel-leave-btn-approve"
                    onClick={() => {
                      closeModal();
                      confirmApprove(selectedRequest);
                    }}
                  >
                    <FiCheck />
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: EDIT LEAVE POLICY FORM
          ========================================================= */}
      {modalType === 'policy' && selectedPolicy && (
        <div
          className="bel-leave-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-leave-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="policy-sheet-title">
            <div className="bel-leave-sheet-drag-handle" />

            <div className="bel-leave-sheet-header">
              <div>
                <h2 id="policy-sheet-title">Edit Leave Policy</h2>
                <p>{selectedPolicy.name}</p>
              </div>
              <button type="button" className="bel-leave-sheet-close" onClick={closeModal} aria-label="Close editor">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSavePolicy}>
              <div className="bel-leave-sheet-body">
                <div className="bel-leave-form-grid">
                  <label className="bel-leave-form-field">
                    <span>Annual Allocation (Days)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={policyForm.annual}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, annual: Number(e.target.value) })
                      }
                      required
                    />
                  </label>

                  <label className="bel-leave-form-field">
                    <span>Used Days (Benchmark)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={policyForm.used}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, used: Number(e.target.value) })
                      }
                      required
                    />
                  </label>

                  <label className="bel-leave-form-field">
                    <span>Carry Forward Policy</span>
                    <select
                      value={policyForm.carryForward}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, carryForward: e.target.value })
                      }
                    >
                      <option>Yes (max 5 days)</option>
                      <option>Yes (max 10 days)</option>
                      <option>No</option>
                    </select>
                  </label>

                  <label className="bel-leave-form-field">
                    <span>Encashment</span>
                    <select
                      value={policyForm.encashment}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, encashment: e.target.value })
                      }
                    >
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </label>

                  <label className="bel-leave-form-field bel-leave-form-full">
                    <span>Approval Flow</span>
                    <select
                      value={policyForm.approval}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, approval: e.target.value })
                      }
                    >
                      <option>Manager → HR</option>
                      <option>Manager only</option>
                      <option>HR only</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="bel-leave-sheet-footer">
                <button type="button" className="bel-leave-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="bel-leave-btn-primary">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: APPROVE CONFIRMATION
          ========================================================= */}
      {modalType === 'approveConfirm' && selectedRequest && (
        <div
          className="bel-leave-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-leave-bottom-sheet bel-leave-confirm-sheet" role="dialog" aria-modal="true">
            <div className="bel-leave-sheet-drag-handle" />

            <div className="bel-leave-confirm-header bel-leave-confirm-header--approve">
              <div className="bel-leave-confirm-icon-wrap bel-leave-confirm-icon-wrap--approve">
                <FiCheck />
              </div>
              <h3>Approve Leave Request?</h3>
              <p>
                Confirm approval for <strong>{selectedRequest.employee}</strong> ({selectedRequest.type} for{' '}
                {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}).
              </p>
            </div>

            <div className="bel-leave-confirm-summary">
              <div className="bel-leave-confirm-row">
                <span>Dates:</span>
                <strong>{selectedRequest.from} → {selectedRequest.to}</strong>
              </div>
              <div className="bel-leave-confirm-row">
                <span>Reason:</span>
                <span>"{selectedRequest.reason}"</span>
              </div>
            </div>

            <div className="bel-leave-sheet-footer">
              <button type="button" className="bel-leave-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="bel-leave-btn-approve-solid"
                onClick={handleExecuteApprove}
              >
                <FiCheck />
                <span>Confirm Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: REJECT CONFIRMATION
          ========================================================= */}
      {modalType === 'rejectConfirm' && selectedRequest && (
        <div
          className="bel-leave-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-leave-bottom-sheet bel-leave-confirm-sheet" role="dialog" aria-modal="true">
            <div className="bel-leave-sheet-drag-handle" />

            <div className="bel-leave-confirm-header bel-leave-confirm-header--reject">
              <div className="bel-leave-confirm-icon-wrap bel-leave-confirm-icon-wrap--reject">
                <FiX />
              </div>
              <h3>Reject Leave Request?</h3>
              <p>
                Are you sure you want to reject the leave request for{' '}
                <strong>{selectedRequest.employee}</strong>?
              </p>
            </div>

            <div className="bel-leave-confirm-summary">
              <div className="bel-leave-confirm-row">
                <span>Leave Type:</span>
                <strong>{selectedRequest.type} ({selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'})</strong>
              </div>
              <div className="bel-leave-confirm-row">
                <span>Rejection Note:</span>
                <span>"Rejected by HR"</span>
              </div>
            </div>

            <div className="bel-leave-sheet-footer">
              <button type="button" className="bel-leave-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="bel-leave-btn-reject-solid"
                onClick={handleExecuteReject}
              >
                <FiX />
                <span>Confirm Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
