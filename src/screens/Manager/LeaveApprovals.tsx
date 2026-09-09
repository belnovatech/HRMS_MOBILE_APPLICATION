import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ManagerLayout } from "../../layouts/ManagerLayout";
import { LeaveRequest } from "../../types";
import {
  FiCheck,
  FiX,
  FiDownload,
  FiFilter,
  FiEye,
  FiSearch,
  FiCalendar,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import "./LeaveApprovals.css";

type ActiveTab = "all" | "pending" | "approved" | "rejected";
type ActiveSection = "requests" | "policies" | "balance";

interface ConfirmationState {
  request: LeaveRequest;
  action: "approve" | "reject";
}

export const LeaveApprovals: React.FC = () => {
  const {
    leaveRequests = [],
    leaveBalances,
    handleApproveLeave,
    handleRejectLeave,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>("requests");
  const [isProcessing, setIsProcessing] = useState(false);

  /* =========================================================
     STATUS COUNTS
  ========================================================= */
  const pendingCount = leaveRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = leaveRequests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const onLeaveTodayCount = leaveRequests.filter(
    (request) => request.status === "Approved"
  ).length;

  /* =========================================================
     LEAVE TYPES
  ========================================================= */
  const leaveTypes = useMemo(() => {
    const types = leaveRequests
      .map((request) => request.leaveType)
      .filter(Boolean);

    return [...new Set(types)];
  }, [leaveRequests]);

  /* =========================================================
     FILTER REQUESTS
  ========================================================= */
  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return leaveRequests.filter((request) => {
      const matchesTab =
        activeTab === "all" ||
        request.status?.toLowerCase() === activeTab;

      const matchesSearch =
        !search ||
        String(request.employeeName || "")
          .toLowerCase()
          .includes(search) ||
        String(request.employeeId || "")
          .toLowerCase()
          .includes(search) ||
        String(request.leaveType || "")
          .toLowerCase()
          .includes(search) ||
        String(request.reason || "")
          .toLowerCase()
          .includes(search) ||
        String(request.id || "")
          .toLowerCase()
          .includes(search);

      const matchesLeaveType =
        selectedLeaveType === "all" ||
        request.leaveType === selectedLeaveType;

      return matchesTab && matchesSearch && matchesLeaveType;
    });
  }, [leaveRequests, activeTab, searchTerm, selectedLeaveType]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */
  const formatDate = (dateValue: string | undefined | null) => {
    if (!dateValue) return "-";

    if (typeof dateValue === "string" && !dateValue.includes("-")) {
      return dateValue;
    }

    const cleanDate = dateValue.includes("T") ? dateValue : `${dateValue}T00:00:00`;
    const date = new Date(cleanDate);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */
  const handleExport = () => {
    if (!filteredRequests.length) {
      alert("There are no leave requests to export.");
      return;
    }

    const headers = [
      "Request ID",
      "Employee ID",
      "Employee Name",
      "Leave Type",
      "Start Date",
      "End Date",
      "Duration",
      "Reason",
      "Applied On",
      "Status",
    ];

    const rows = filteredRequests.map((request) => [
      request.id || "",
      request.employeeId || "",
      request.employeeName || "",
      request.leaveType || "",
      request.startDate || "",
      request.endDate || "",
      request.duration || "",
      request.reason || "",
      request.appliedOn || "",
      request.status || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(value).replace(/"/g, '""');
            return `"${safeValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leave-approvals.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* =========================================================
     APPROVE / REJECT
  ========================================================= */
  const openConfirmation = (request: LeaveRequest, action: "approve" | "reject") => {
    setConfirmation({ request, action });
  };

  const closeConfirmation = () => {
    setConfirmation(null);
  };

  const confirmAction = async () => {
    if (!confirmation || isProcessing) return;
    setIsProcessing(true);
    try {
      const { request, action } = confirmation;
      if (action === "approve") {
        handleApproveLeave(request.id);
      }
      if (action === "reject") {
        handleRejectLeave(request.id);
      }
    } finally {
      setIsProcessing(false);
      setConfirmation(null);
    }
  };

  /* =========================================================
     VIEW REQUEST
  ========================================================= */
  const openRequestDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLeaveType("all");
    setActiveTab("all");
  };

  /* =========================================================
     TAB COUNT
  ========================================================= */
  const getTabCount = (tab: string) => {
    if (tab === "all") {
      return leaveRequests.length;
    }

    return leaveRequests.filter(
      (request) => request.status?.toLowerCase() === tab
    ).length;
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <ManagerLayout title="Leave Management">
      <div className="leaveapp-page">
        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="leaveapp-header">
          <div className="leaveapp-header-content">
            <h1>Leave Management</h1>
            <p>Manage leave requests, policies and balances</p>
          </div>

          <button
            type="button"
            className="leaveapp-export-button"
            onClick={handleExport}
          >
            <FiDownload size={15} />
            <span>Export</span>
          </button>
        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}
        <div className="leaveapp-summary-grid">
          {/* Pending */}
          <div
            className={`leaveapp-summary-card ${activeTab === "pending" ? "leaveapp-summary-active" : ""}`}
            onClick={() => { setActiveSection("requests"); setActiveTab("pending"); }}
          >
            <strong>{pendingCount}</strong>
            <div className="leaveapp-summary-label">
              <span className="leaveapp-summary-dot leaveapp-dot-pending" />
              Pending
            </div>
          </div>

          {/* Approved */}
          <div
            className={`leaveapp-summary-card ${activeTab === "approved" ? "leaveapp-summary-active" : ""}`}
            onClick={() => { setActiveSection("requests"); setActiveTab("approved"); }}
          >
            <strong>{approvedCount}</strong>
            <div className="leaveapp-summary-label">
              <span className="leaveapp-summary-dot leaveapp-dot-approved" />
              Approved
            </div>
          </div>

          {/* Rejected */}
          <div
            className={`leaveapp-summary-card ${activeTab === "rejected" ? "leaveapp-summary-active" : ""}`}
            onClick={() => { setActiveSection("requests"); setActiveTab("rejected"); }}
          >
            <strong>{rejectedCount}</strong>
            <div className="leaveapp-summary-label">
              <span className="leaveapp-summary-dot leaveapp-dot-rejected" />
              Rejected
            </div>
          </div>

          {/* On Leave */}
          <div
            className="leaveapp-summary-card"
            onClick={() => { setActiveSection("requests"); setActiveTab("approved"); }}
          >
            <strong>{onLeaveTodayCount}</strong>
            <div className="leaveapp-summary-label">
              <span className="leaveapp-summary-dot leaveapp-dot-leave" />
              On Leave Today
            </div>
          </div>
        </div>

        {/* ==================================================
            SECTION TABS
        ================================================== */}
        <div className="leaveapp-section-tabs">
          <button
            type="button"
            className={`leaveapp-section-tab ${
              activeSection === "requests" ? "leaveapp-section-tab-active" : ""
            }`}
            onClick={() => setActiveSection("requests")}
          >
            Leave Requests
          </button>

          <button
            type="button"
            className={`leaveapp-section-tab ${
              activeSection === "policies" ? "leaveapp-section-tab-active" : ""
            }`}
            onClick={() => setActiveSection("policies")}
          >
            Leave Policies
          </button>

          <button
            type="button"
            className={`leaveapp-section-tab ${
              activeSection === "balance" ? "leaveapp-section-tab-active" : ""
            }`}
            onClick={() => setActiveSection("balance")}
          >
            Leave Balance
          </button>
        </div>

        {/* ==================================================
            LEAVE REQUESTS
        ================================================== */}
        {activeSection === "requests" && (
          <section className="leaveapp-request-card">
            {/* ==================================================
                REQUEST FILTER BAR
            ================================================== */}
            <div className="leaveapp-filter-bar">
              {/* Search */}
              <div className="leaveapp-search-box">
                <FiSearch size={16} className="leaveapp-search-icon" />
                <input
                  type="text"
                  placeholder="Search employee or request..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="leaveapp-search-clear"
                    onClick={() => setSearchTerm("")}
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Status tabs */}
              <div className="leaveapp-status-tabs">
                {(["all", "pending", "approved", "rejected"] as ActiveTab[]).map(
                  (tab) => (
                    <button
                      type="button"
                      key={tab}
                      className={`leaveapp-status-tab ${
                        activeTab === tab ? "leaveapp-status-tab-active" : ""
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <span>
                        {tab === "all"
                          ? "All"
                          : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                      <small>{getTabCount(tab)}</small>
                    </button>
                  )
                )}
              </div>

              {/* More Filters */}
              <button
                type="button"
                className={`leaveapp-more-filter ${
                  showFilters ? "leaveapp-more-filter-active" : ""
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter size={14} />
                <span>More Filters</span>
                <FiChevronDown size={13} />
              </button>
            </div>

            {/* ==================================================
                MORE FILTER PANEL
            ================================================== */}
            {showFilters && (
              <div className="leaveapp-filter-panel">
                <div className="leaveapp-filter-field">
                  <label>Leave Type</label>
                  <select
                    value={selectedLeaveType}
                    onChange={(event) => setSelectedLeaveType(event.target.value)}
                  >
                    <option value="all">All Leave Types</option>
                    {leaveTypes.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="leaveapp-clear-filter-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* ==================================================
                MOBILE LEAVE REQUEST CARDS
            ================================================== */}
            <div className="leaveapp-card-list">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <div key={request.id || index} className="leaveapp-card-item">
                    <div className="leaveapp-card-header">
                      <div className="leaveapp-employee">
                        <div
                          className="leaveapp-avatar"
                          style={{
                            backgroundColor: request.avatarBg || "#4f46e5",
                          }}
                        >
                          {request.initials ||
                            String(request.employeeName || "NA")
                              .substring(0, 2)
                              .toUpperCase()}
                        </div>
                        <div className="leaveapp-employee-details">
                          <strong>{request.employeeName}</strong>
                          <span>{request.employeeId}</span>
                        </div>
                      </div>

                      <span
                        className={`leaveapp-status-badge leaveapp-status-${String(
                          request.status || ""
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="leaveapp-card-body">
                      <div className="leaveapp-card-meta-row">
                        <span className="leaveapp-type-tag">{request.leaveType}</span>
                        <strong className="leaveapp-days">{request.duration || "-"}</strong>
                      </div>

                      <div className="leaveapp-card-dates">
                        <FiCalendar size={13} />
                        <span>
                          {formatDate(request.startDate)} → {formatDate(request.endDate)}
                        </span>
                      </div>

                      {request.reason && (
                        <div className="leaveapp-card-reason-box">
                          <span className="leaveapp-reason-label">Reason</span>
                          <p className="leaveapp-reason-text">{request.reason}</p>
                        </div>
                      )}

                      {request.rejectReason && (
                        <div className="leaveapp-card-reject-note">
                          <strong>Rejection reason:</strong> {request.rejectReason}
                        </div>
                      )}

                      <div className="leaveapp-card-applied">
                        <span>Applied on: {formatDate(request.appliedOn)}</span>
                      </div>
                    </div>

                    <div className="leaveapp-card-actions">
                      {request.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="leaveapp-approve-button leaveapp-card-action-btn"
                            title="Approve leave"
                            onClick={() => openConfirmation(request, "approve")}
                          >
                            <FiCheck size={14} />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            className="leaveapp-reject-button leaveapp-card-action-btn"
                            title="Reject leave"
                            onClick={() => openConfirmation(request, "reject")}
                          >
                            <FiX size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="leaveapp-view-button leaveapp-card-action-btn"
                        title="View request"
                        onClick={() => openRequestDetails(request)}
                      >
                        <FiEye size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="leaveapp-empty-state">
                  <div className="leaveapp-empty-icon">
                    <FiSearch size={22} />
                  </div>
                  <strong>No leave requests found</strong>
                  <span>Try changing your search or filters.</span>
                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}
            <div className="leaveapp-table-wrapper leaveapp-desktop-table">
              <table className="leaveapp-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>LEAVE TYPE</th>
                    <th>FROM</th>
                    <th>TO</th>
                    <th>DAYS</th>
                    <th>REASON</th>
                    <th>APPLIED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request, index) => (
                      <tr key={request.id || index}>
                        {/* Employee */}
                        <td>
                          <div className="leaveapp-employee">
                            <div
                              className="leaveapp-avatar"
                              style={{
                                backgroundColor: request.avatarBg || "#4f46e5",
                              }}
                            >
                              {request.initials ||
                                String(request.employeeName || "NA")
                                  .substring(0, 2)
                                  .toUpperCase()}
                            </div>
                            <div className="leaveapp-employee-details">
                              <strong>{request.employeeName}</strong>
                              <span>{request.employeeId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td>
                          <span className="leaveapp-type-tag">
                            {request.leaveType}
                          </span>
                        </td>

                        {/* From */}
                        <td>{formatDate(request.startDate)}</td>

                        {/* To */}
                        <td>{formatDate(request.endDate)}</td>

                        {/* Days */}
                        <td>
                          <strong className="leaveapp-days">
                            {request.duration || "-"}
                          </strong>
                        </td>

                        {/* Reason */}
                        <td>
                          <span
                            className="leaveapp-reason"
                            title={request.reason}
                          >
                            {request.reason || "—"}
                          </span>
                        </td>

                        {/* Applied */}
                        <td>{formatDate(request.appliedOn)}</td>

                        {/* Status */}
                        <td>
                          <span
                            className={`leaveapp-status-badge leaveapp-status-${String(
                              request.status || ""
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="leaveapp-actions">
                            {request.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="leaveapp-approve-button"
                                  title="Approve leave"
                                  onClick={() =>
                                    openConfirmation(request, "approve")
                                  }
                                >
                                  <FiCheck size={14} />
                                </button>

                                <button
                                  type="button"
                                  className="leaveapp-reject-button"
                                  title="Reject leave"
                                  onClick={() =>
                                    openConfirmation(request, "reject")
                                  }
                                >
                                  <FiX size={14} />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              className="leaveapp-view-button"
                              title="View request"
                              onClick={() => openRequestDetails(request)}
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="leaveapp-empty-cell">
                        <div className="leaveapp-empty-state">
                          <div className="leaveapp-empty-icon">
                            <FiSearch size={22} />
                          </div>
                          <strong>No leave requests found</strong>
                          <span>Try changing your search or filters.</span>
                          <button type="button" onClick={clearFilters}>
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================================================
            LEAVE POLICIES
        ================================================== */}
        {activeSection === "policies" && (
          <section className="leaveapp-secondary-card">
            <div className="leaveapp-secondary-icon">
              <FiCalendar size={24} />
            </div>
            <h2>Leave Policies</h2>
            <p>View and manage the leave policies applicable to your team.</p>

            <div className="leaveapp-policy-grid">
              <div className="leaveapp-policy-item">
                <strong>Casual Leave</strong>
                <span>12 days / year</span>
              </div>

              <div className="leaveapp-policy-item">
                <strong>Sick Leave</strong>
                <span>10 days / year</span>
              </div>

              <div className="leaveapp-policy-item">
                <strong>Earned Leave</strong>
                <span>18 days / year</span>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================
            LEAVE BALANCE
        ================================================== */}
        {activeSection === "balance" && (
          <section className="leaveapp-secondary-card">
            <div className="leaveapp-secondary-icon">
              <FiCalendar size={24} />
            </div>
            <h2>Leave Balance</h2>
            <p>Overview of available leave balances for your team members.</p>

            <div className="leaveapp-balance-grid">
              {leaveBalances ? (
                Object.entries(leaveBalances).map(([key, val]) => (
                  <div key={key} className="leaveapp-balance-item">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)} Leave</span>
                    <strong>{val.available}</strong>
                    <small>Available ({val.used} used of {val.total})</small>
                  </div>
                ))
              ) : (
                <>
                  <div className="leaveapp-balance-item">
                    <span>Casual Leave</span>
                    <strong>12</strong>
                    <small>Available</small>
                  </div>

                  <div className="leaveapp-balance-item">
                    <span>Sick Leave</span>
                    <strong>8</strong>
                    <small>Available</small>
                  </div>

                  <div className="leaveapp-balance-item">
                    <span>Earned Leave</span>
                    <strong>15</strong>
                    <small>Available</small>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ====================================================
          CONFIRMATION MODAL / BOTTOM SHEET
      ==================================================== */}
      {confirmation && (
        <div
          className="leaveapp-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeConfirmation();
            }
          }}
        >
          <div className="leaveapp-confirm-modal" role="dialog" aria-modal="true">
            <div
              className={`leaveapp-confirm-icon ${
                confirmation.action === "approve"
                  ? "leaveapp-confirm-success"
                  : "leaveapp-confirm-danger"
              }`}
            >
              {confirmation.action === "approve" ? (
                <FiCheck size={23} />
              ) : (
                <FiAlertCircle size={23} />
              )}
            </div>

            <h2>
              {confirmation.action === "approve"
                ? "Approve Leave Request?"
                : "Reject Leave Request?"}
            </h2>

            <p>
              {confirmation.action === "approve"
                ? `Are you sure you want to approve ${confirmation.request.employeeName}'s leave request?`
                : `Are you sure you want to reject ${confirmation.request.employeeName}'s leave request?`}
            </p>

            <div className="leaveapp-confirm-request">
              <strong>{confirmation.request.leaveType}</strong>
              <span>
                {formatDate(confirmation.request.startDate)} →{" "}
                {formatDate(confirmation.request.endDate)}
              </span>
            </div>

            <div className="leaveapp-confirm-actions">
              <button
                type="button"
                className="leaveapp-confirm-cancel"
                onClick={closeConfirmation}
                disabled={isProcessing}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmation.action === "approve"
                    ? "leaveapp-confirm-approve"
                    : "leaveapp-confirm-reject"
                }
                onClick={confirmAction}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : confirmation.action === "approve"
                  ? "Approve"
                  : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          REQUEST DETAILS MODAL / BOTTOM SHEET
      ==================================================== */}
      {selectedRequest && (
        <div
          className="leaveapp-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRequestDetails();
            }
          }}
        >
          <div className="leaveapp-details-modal" role="dialog" aria-modal="true">
            <div className="leaveapp-details-header">
              <div>
                <h2>Leave Request Details</h2>
                <span>Request #{selectedRequest.id}</span>
              </div>

              <button
                type="button"
                className="leaveapp-details-close"
                onClick={closeRequestDetails}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="leaveapp-details-body">
              <div className="leaveapp-details-employee">
                <div
                  className="leaveapp-avatar leaveapp-details-avatar"
                  style={{
                    backgroundColor: selectedRequest.avatarBg || "#4f46e5",
                  }}
                >
                  {selectedRequest.initials ||
                    String(selectedRequest.employeeName || "NA")
                      .substring(0, 2)
                      .toUpperCase()}
                </div>

                <div>
                  <strong>{selectedRequest.employeeName}</strong>
                  <span>{selectedRequest.employeeId}</span>
                </div>
              </div>

              <div className="leaveapp-details-grid">
                <div>
                  <label>Leave Type</label>
                  <strong>{selectedRequest.leaveType}</strong>
                </div>

                <div>
                  <label>Status</label>
                  <span
                    className={`leaveapp-status-badge leaveapp-status-${String(
                      selectedRequest.status || ""
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div>
                  <label>From</label>
                  <strong>{formatDate(selectedRequest.startDate)}</strong>
                </div>

                <div>
                  <label>To</label>
                  <strong>{formatDate(selectedRequest.endDate)}</strong>
                </div>

                <div>
                  <label>Duration</label>
                  <strong>{selectedRequest.duration || "-"}</strong>
                </div>

                <div>
                  <label>Applied On</label>
                  <strong>{formatDate(selectedRequest.appliedOn)}</strong>
                </div>
              </div>

              <div className="leaveapp-details-reason">
                <label>Reason</label>
                <p>{selectedRequest.reason || "No reason provided."}</p>
              </div>

              {selectedRequest.rejectReason && (
                <div className="leaveapp-details-reason leaveapp-details-reject-reason">
                  <label>Rejection Reason</label>
                  <p>{selectedRequest.rejectReason}</p>
                </div>
              )}
            </div>

            <div className="leaveapp-details-footer">
              {selectedRequest.status === "Pending" ? (
                <>
                  <button
                    type="button"
                    className="leaveapp-detail-reject"
                    onClick={() => {
                      closeRequestDetails();
                      openConfirmation(selectedRequest, "reject");
                    }}
                  >
                    <FiX size={14} />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="leaveapp-detail-approve"
                    onClick={() => {
                      closeRequestDetails();
                      openConfirmation(selectedRequest, "approve");
                    }}
                  >
                    <FiCheck size={14} />
                    Approve
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="leaveapp-detail-close-button"
                  onClick={closeRequestDetails}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
};

export default LeaveApprovals;
