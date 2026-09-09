import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ManagerLayout } from "../../layouts/ManagerLayout";
import { TeamMember, LeaveRequest } from "../../types";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCheck,
  FiX,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
  FiEye,
  FiBarChart2,
  FiEdit3,
  FiChevronRight,
} from "react-icons/fi";
import "./ManagerDashboard.css";

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    teamMembers = [],
    leaveRequests = [],
    handleApproveLeave,
    handleRejectLeave,
  } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  /* =========================
     DASHBOARD CALCULATIONS
  ========================= */

  const pendingLeaves = leaveRequests.filter(
    (request) => request.status === "Pending"
  );

  const presentCount = teamMembers.filter(
    (member) => member.status === "Present"
  ).length;

  const wfhCount = teamMembers.filter(
    (member) => member.status === "WFH"
  ).length;

  const absentCount = teamMembers.filter(
    (member) => member.status === "Absent"
  ).length;

  const filteredTeam = teamMembers.filter((member) => {
    if (filterStatus === "all") return true;

    return (
      member.status?.toLowerCase() === filterStatus.toLowerCase()
    );
  });

  /* =========================
     NAVIGATION HANDLERS
  ========================= */

  const goToAttendance = () => {
    navigate("/manager/attendance");
  };

  const goToLeaveApprovals = () => {
    navigate("/manager/leave-approvals");
  };

  const goToReports = () => {
    navigate("/manager/reports");
  };

  const goToAttendanceCorrections = () => {
    navigate("/manager/attendance-corrections");
  };

  const goToLeaveCalendar = () => {
    navigate("/manager/leave-calendar");
  };

  const goToMyTeam = () => {
    navigate("/manager/my-team");
  };

  /* =========================
     LEAVE ACTIONS
  ========================= */

  const approveLeave = (leaveId: string) => {
    handleApproveLeave(leaveId);
    setSelectedLeave(null);
  };

  const rejectLeave = (leaveId: string) => {
    handleRejectLeave(leaveId);
    setSelectedLeave(null);
  };

  return (
    <ManagerLayout title="Manager Portal">
      <div className="mgr-dashboard-page">

        {/* =========================================
            KPI SUMMARY CARDS
        ========================================= */}

        <section className="mgr-dashboard-stats-grid">

          <div className="mgr-dashboard-kpi-card" onClick={goToMyTeam} role="button" tabIndex={0}>
            <div className="mgr-kpi-content">
              <span className="mgr-kpi-label">MY TEAM</span>
              <h2>{teamMembers.length}</h2>
              <span className="mgr-kpi-sub">
                Direct Reports
              </span>
            </div>

            <div className="mgr-kpi-icon-wrapper blue">
              <FiUsers />
            </div>
          </div>

          <div className="mgr-dashboard-kpi-card" onClick={goToAttendance} role="button" tabIndex={0}>
            <div className="mgr-kpi-content">
              <span className="mgr-kpi-label">
                PRESENT TODAY
              </span>

              <h2>{presentCount}</h2>

              <span className="mgr-kpi-sub">
                In Office
              </span>
            </div>

            <div className="mgr-kpi-icon-wrapper green">
              <FiCheckCircle />
            </div>
          </div>

          <div className="mgr-dashboard-kpi-card" onClick={goToAttendance} role="button" tabIndex={0}>
            <div className="mgr-kpi-content">
              <span className="mgr-kpi-label">WFH</span>

              <h2>{wfhCount}</h2>

              <span className="mgr-kpi-sub">
                Working Remotely
              </span>
            </div>

            <div className="mgr-kpi-icon-wrapper cyan">
              <FiClock />
            </div>
          </div>

          <div className="mgr-dashboard-kpi-card" onClick={goToAttendance} role="button" tabIndex={0}>
            <div className="mgr-kpi-content">
              <span className="mgr-kpi-label">ABSENT</span>

              <h2>{absentCount}</h2>

              <span className="mgr-kpi-sub">
                On Leave / Uninformed
              </span>
            </div>

            <div className="mgr-kpi-icon-wrapper red">
              <FiXCircle />
            </div>
          </div>

          <div className="mgr-dashboard-kpi-card" onClick={goToLeaveApprovals} role="button" tabIndex={0}>
            <div className="mgr-kpi-content">
              <span className="mgr-kpi-label">
                LEAVE APPROVALS
              </span>

              <h2>{pendingLeaves.length}</h2>

              <span className="mgr-kpi-sub">
                Pending Action
              </span>
            </div>

            <div className="mgr-kpi-icon-wrapper orange">
              <FiCalendar />
            </div>
          </div>

        </section>

        {/* =========================================
            MAIN DASHBOARD GRID
        ========================================= */}

        <section className="mgr-dashboard-main-grid">

          {/* =====================================
              TEAM ATTENDANCE
          ===================================== */}

          <div className="mgr-enterprise-card mgr-attendance-widget">

            <div className="mgr-card-header-flex">

              <div>
                <h3>Team Attendance — Today</h3>
                <p>
                  Real-time status of your direct reports
                </p>
              </div>

              <div className="mgr-filter-chips">

                <button
                  type="button"
                  className={`mgr-chip ${
                    filterStatus === "all"
                      ? "mgr-chip-active"
                      : ""
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  All ({teamMembers.length})
                </button>

                <button
                  type="button"
                  className={`mgr-chip ${
                    filterStatus === "present"
                      ? "mgr-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilterStatus("present")
                  }
                >
                  Present ({presentCount})
                </button>

                <button
                  type="button"
                  className={`mgr-chip ${
                    filterStatus === "wfh"
                      ? "mgr-chip-active"
                      : ""
                  }`}
                  onClick={() => setFilterStatus("wfh")}
                >
                  WFH ({wfhCount})
                </button>

                <button
                  type="button"
                  className={`mgr-chip ${
                    filterStatus === "absent"
                      ? "mgr-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilterStatus("absent")
                  }
                >
                  Absent ({absentCount})
                </button>

              </div>
            </div>

            {/* Mobile Employee Cards View */}
            <div className="mgr-mobile-team-cards">
              {filteredTeam.length === 0 ? (
                <div className="mgr-empty-mobile-card">
                  <FiAlertCircle size={24} />
                  <p>No employee matching "{filterStatus}" status.</p>
                </div>
              ) : (
                filteredTeam.map((member: TeamMember) => (
                  <div key={member.id} className="mgr-employee-card-item">
                    <div className="mgr-emp-card-header">
                      <div className="mgr-employee-cell">
                        <div
                          className="mgr-member-avatar"
                          style={{
                            background: member.color || "#2563eb",
                          }}
                        >
                          {member.initials}
                        </div>
                        <div className="mgr-emp-info">
                          <strong>{member.name}</strong>
                          <small>{member.email}</small>
                        </div>
                      </div>
                      <span
                        className={`mgr-status-badge mgr-status-${member.status?.toLowerCase().replace(/\s+/g, "")}`}
                      >
                        {member.status}
                      </span>
                    </div>

                    <div className="mgr-emp-card-row">
                      <span className="mgr-card-label">Designation:</span>
                      <span className="mgr-card-val">{member.designation}</span>
                    </div>

                    <div className="mgr-emp-card-footer-meta">
                      <div className="mgr-meta-col">
                        <span className="mgr-card-label">Check-In</span>
                        <span className="mgr-card-val-bold">{member.checkIn || "-"}</span>
                      </div>
                      <div className="mgr-meta-col text-right">
                        <span className="mgr-card-label">Performance</span>
                        <strong className="mgr-perf-score">{member.performance || "-"}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="mgr-table-responsive-wrapper mgr-desktop-table-container">

              <table className="mgr-enterprise-table">

                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>DESIGNATION</th>
                    <th>CHECK-IN TIME</th>
                    <th>STATUS</th>
                    <th>PERFORMANCE</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTeam.length === 0 ? (

                    <tr>
                      <td
                        colSpan={5}
                        className="mgr-empty-table-cell"
                      >
                        No employee matching "{filterStatus}" status.
                      </td>
                    </tr>

                  ) : (

                    filteredTeam.map((member: TeamMember) => (

                      <tr key={member.id}>

                        <td>
                          <div className="mgr-employee-cell">

                            <div
                              className="mgr-member-avatar"
                              style={{
                                background:
                                  member.color ||
                                  "#2563eb",
                              }}
                            >
                              {member.initials}
                            </div>

                            <div className="mgr-emp-info">
                              <strong>
                                {member.name}
                              </strong>

                              <small>
                                {member.email}
                              </small>
                            </div>

                          </div>
                        </td>

                        <td>
                          {member.designation}
                        </td>

                        <td>
                          {member.checkIn || "-"}
                        </td>

                        <td>
                          <span
                            className={`mgr-status-badge mgr-status-${member.status?.toLowerCase().replace(/\s+/g, "")}`}
                          >
                            {member.status}
                          </span>
                        </td>

                        <td>
                          <strong className="mgr-perf-score">
                            {member.performance || "-"}
                          </strong>
                        </td>

                      </tr>

                    ))
                  )}

                </tbody>
              </table>

            </div>

            <div className="mgr-card-footer-action">

              <button
                type="button"
                className="mgr-text-btn"
                onClick={goToAttendance}
              >
                View Full Team Attendance Log
                <FiArrowRight />
              </button>

            </div>

          </div>

          {/* =====================================
              PENDING LEAVE APPROVALS
          ===================================== */}

          <div className="mgr-enterprise-card mgr-approvals-widget">

            <div className="mgr-card-header-flex">

              <div>
                <h3>Pending Leave Approvals</h3>

                <p>
                  Requests requiring your sign-off
                </p>
              </div>

              <span className="mgr-pending-badge">
                {pendingLeaves.length} Pending
              </span>

            </div>

            <div className="mgr-approvals-list">

              {pendingLeaves.length === 0 ? (

                <div className="mgr-empty-approvals">
                  <FiAlertCircle size={32} />

                  <p>
                    No pending leave requests right now.
                  </p>
                </div>

              ) : (

                pendingLeaves.map((item: LeaveRequest) => (

                  <div
                    key={item.id}
                    className="mgr-approval-card-item"
                  >

                    <div className="mgr-approval-user-info">

                      <div
                        className="mgr-member-avatar"
                        style={{
                          background:
                            item.avatarBg ||
                            "#7c3aed",
                        }}
                      >
                        {item.initials}
                      </div>

                      <div className="mgr-user-details">

                        <h4>
                          {item.employeeName}
                        </h4>

                        <span className="mgr-leave-type-tag">
                          {item.leaveType}
                        </span>

                        <p className="mgr-leave-dates">
                          📅 {item.startDate} to{" "}
                          {item.endDate}{" "}
                          ({item.duration})
                        </p>

                        <p className="mgr-leave-reason">
                          "{item.reason}"
                        </p>

                      </div>

                    </div>

                    <div className="mgr-approval-action-btns">

                      <button
                        type="button"
                        className="mgr-btn-approve"
                        onClick={() =>
                          approveLeave(item.id)
                        }
                        title="Approve Leave"
                      >
                        <FiCheck />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        className="mgr-btn-reject"
                        onClick={() =>
                          rejectLeave(item.id)
                        }
                        title="Reject Leave"
                      >
                        <FiX />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        className="mgr-btn-view"
                        onClick={() =>
                          setSelectedLeave(item)
                        }
                        title="View Details"
                      >
                        <FiEye />
                        <span>View</span>
                      </button>

                    </div>

                  </div>

                ))
              )}

            </div>

            <div className="mgr-card-footer-action">

              <button
                type="button"
                className="mgr-text-btn"
                onClick={goToLeaveApprovals}
              >
                Manage All Leave Requests
                <FiArrowRight />
              </button>

            </div>

          </div>

        </section>

        {/* =========================================
            QUICK NAVIGATION CARDS
        ========================================= */}

        <section className="mgr-dashboard-quick-grid">

          <button
            type="button"
            className="mgr-quick-card"
            onClick={goToReports}
          >
            <div className="mgr-quick-icon mgr-quick-blue">
              <FiBarChart2 />
            </div>

            <div className="mgr-quick-content">
              <h4>Team Reports</h4>
              <p>Performance & metrics</p>
            </div>

            <FiChevronRight className="mgr-quick-arrow" />
          </button>

          <button
            type="button"
            className="mgr-quick-card"
            onClick={goToAttendanceCorrections}
          >
            <div className="mgr-quick-icon mgr-quick-purple">
              <FiEdit3 />
            </div>

            <div className="mgr-quick-content">
              <h4>Attendance Corrections</h4>
              <p>4 pending requests</p>
            </div>

            <FiChevronRight className="mgr-quick-arrow" />
          </button>

          <button
            type="button"
            className="mgr-quick-card"
            onClick={goToLeaveCalendar}
          >
            <div className="mgr-quick-icon mgr-quick-green">
              <FiCalendar />
            </div>

            <div className="mgr-quick-content">
              <h4>Leave Calendar</h4>
              <p>Team schedule</p>
            </div>

            <FiChevronRight className="mgr-quick-arrow" />
          </button>

          <button
            type="button"
            className="mgr-quick-card"
            onClick={goToMyTeam}
          >
            <div className="mgr-quick-icon mgr-quick-pink">
              <FiUsers />
            </div>

            <div className="mgr-quick-content">
              <h4>My Team</h4>
              <p>{teamMembers.length} members</p>
            </div>

            <FiChevronRight className="mgr-quick-arrow" />
          </button>

        </section>

        {/* =========================================
            LEAVE DETAILS MODAL
        ========================================= */}

        {selectedLeave && (

          <div
            className="mgr-modal-backdrop"
            onClick={() => setSelectedLeave(null)}
          >

            <div
              className="mgr-modal-content"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="mgr-modal-header">

                <div>
                  <h3>Leave Request Details</h3>
                  <p>Review employee leave request</p>
                </div>

                <button
                  type="button"
                  className="mgr-modal-close"
                  onClick={() =>
                    setSelectedLeave(null)
                  }
                  aria-label="Close"
                >
                  <FiX />
                </button>

              </div>

              <div className="mgr-modal-body">

                <div className="mgr-modal-user">

                  <div
                    className="mgr-member-avatar"
                    style={{
                      background:
                        selectedLeave.avatarBg ||
                        "#7c3aed",
                    }}
                  >
                    {selectedLeave.initials}
                  </div>

                  <div>
                    <h4>
                      {selectedLeave.employeeName}
                    </h4>

                    <p>
                      Employee ID:{" "}
                      {selectedLeave.employeeId}
                    </p>
                  </div>

                </div>

                <div className="mgr-modal-divider" />

                <div className="mgr-modal-detail-row">
                  <span>Leave Type</span>
                  <strong>
                    {selectedLeave.leaveType}
                  </strong>
                </div>

                <div className="mgr-modal-detail-row">
                  <span>Dates</span>
                  <strong>
                    {selectedLeave.startDate} to{" "}
                    {selectedLeave.endDate}{" "}
                    ({selectedLeave.duration})
                  </strong>
                </div>

                <div className="mgr-modal-detail-row">
                  <span>Applied On</span>
                  <strong>
                    {selectedLeave.appliedOn}
                  </strong>
                </div>

                <div className="mgr-modal-detail-row mgr-modal-reason-row">
                  <span>Reason</span>

                  <p className="mgr-modal-reason">
                    "{selectedLeave.reason}"
                  </p>
                </div>

              </div>

              <div className="mgr-modal-footer">

                <button
                  type="button"
                  className="mgr-btn-approve mgr-modal-action"
                  onClick={() =>
                    approveLeave(selectedLeave.id)
                  }
                >
                  <FiCheck />
                  Approve Request
                </button>

                <button
                  type="button"
                  className="mgr-btn-reject mgr-modal-action"
                  onClick={() =>
                    rejectLeave(selectedLeave.id)
                  }
                >
                  <FiX />
                  Reject Request
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </ManagerLayout>
  );
};

export default ManagerDashboard;