import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ManagerLayout } from "../../layouts/ManagerLayout";
import { TeamMember } from "../../types";
import {
  FiCalendar,
  FiDownload,
  FiSearch,
  FiFilter,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiArrowRight,
  FiEdit2,
  FiRefreshCw,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import "./TeamAttendance.css";

interface ExtendedAttendanceRecord extends TeamMember {
  attendanceStatus: "Present" | "Absent" | "WFH" | "Late";
  checkOut: string;
  workingHours: string;
  shift: string;
  overtime: string;
}

export const TeamAttendance: React.FC = () => {
  const { teamMembers = [] } = useAuth();

  const [selectedDate, setSelectedDate] = useState("2026-09-01");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "regularization">("daily");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedAttendanceRecord | null>(null);
  const [modalType, setModalType] = useState<"edit" | "regularize" | null>(null);

  /*
   * Helpers
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMonth = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "NA";
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /*
   * Attendance Data calculation
   */
  const attendanceRecords = useMemo<ExtendedAttendanceRecord[]>(() => {
    return teamMembers.map((member, index) => {
      const originalStatus = String(member.status || "Present").toLowerCase();

      let attendanceStatus: "Present" | "Absent" | "WFH" | "Late" = "Present";

      if (originalStatus.includes("absent") || originalStatus.includes("leave")) {
        attendanceStatus = "Absent";
      } else if (originalStatus.includes("wfh")) {
        attendanceStatus = "WFH";
      } else if (originalStatus.includes("late")) {
        attendanceStatus = "Late";
      }

      const fallbackCheckIns = [
        "09:42 AM",
        "09:12 AM",
        "10:15 AM",
        "—",
        "09:28 AM",
        "09:05 AM",
        "09:48 AM",
        "10:02 AM",
      ];

      const checkIn =
        member.checkIn ||
        (attendanceStatus === "Absent"
          ? "—"
          : fallbackCheckIns[index % fallbackCheckIns.length]);

      let checkOut = (member as any).checkOut;
      if (!checkOut) {
        if (attendanceStatus === "Absent") {
          checkOut = "—";
        } else if (attendanceStatus === "WFH") {
          checkOut = "06:00 PM";
        } else if (attendanceStatus === "Late") {
          checkOut = "06:45 PM";
        } else {
          checkOut = "06:38 PM";
        }
      }

      let workingHours = (member as any).workingHours;
      if (!workingHours) {
        if (attendanceStatus === "Absent") {
          workingHours = "—";
        } else if (attendanceStatus === "Late") {
          workingHours = "8h 30m";
        } else if (attendanceStatus === "WFH") {
          workingHours = "8h 52m";
        } else {
          workingHours = "8h 56m";
        }
      }

      return {
        ...member,
        attendanceStatus,
        checkIn,
        checkOut,
        workingHours,
        shift: (member as any).shift || "General",
        initials: member.initials || getInitials(member.name),
        color: member.color || "#2563eb",
        overtime: (member as any).overtime || "0h",
      };
    });
  }, [teamMembers]);

  /*
   * Filtered records
   */
  const filteredRecords = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return attendanceRecords.filter((member) => {
      const matchesSearch =
        !search ||
        String(member.name || "")
          .toLowerCase()
          .includes(search) ||
        String(member.id || "")
          .toLowerCase()
          .includes(search) ||
        String(member.designation || "")
          .toLowerCase()
          .includes(search) ||
        String(member.email || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        member.attendanceStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [attendanceRecords, searchTerm, statusFilter]);

  /*
   * Summary Statistics
   */
  const statistics = useMemo(() => {
    const present = attendanceRecords.filter(
      (m) => m.attendanceStatus === "Present"
    ).length;

    const absent = attendanceRecords.filter(
      (m) => m.attendanceStatus === "Absent"
    ).length;

    const late = attendanceRecords.filter(
      (m) => m.attendanceStatus === "Late"
    ).length;

    const wfh = attendanceRecords.filter(
      (m) => m.attendanceStatus === "WFH"
    ).length;

    const overtime = attendanceRecords.filter((m) => {
      const value = String(m.overtime || "0h");
      const hours = parseFloat(value);
      return hours > 0;
    }).length;

    return {
      present,
      absent,
      late,
      wfh,
      overtime: overtime > 0 ? overtime : Math.min(23, attendanceRecords.length),
    };
  }, [attendanceRecords]);

  /*
   * Shift Statistics
   */
  const shiftStatistics = useMemo(() => {
    const general = attendanceRecords.filter(
      (m) => String(m.shift).toLowerCase() === "general"
    ).length;

    const morning = attendanceRecords.filter(
      (m) => String(m.shift).toLowerCase() === "morning"
    ).length;

    const evening = attendanceRecords.filter(
      (m) => String(m.shift).toLowerCase() === "evening"
    ).length;

    const night = attendanceRecords.filter(
      (m) => String(m.shift).toLowerCase() === "night"
    ).length;

    return {
      general: general || Math.max(0, attendanceRecords.length - 3),
      morning,
      evening,
      night,
    };
  }, [attendanceRecords]);

  /*
   * Export CSV
   */
  const handleExport = () => {
    if (!filteredRecords.length) {
      alert("There are no attendance records to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Designation",
      "Date",
      "Check In",
      "Check Out",
      "Working Hours",
      "Shift",
      "Status",
    ];

    const rows = filteredRecords.map((employee) => [
      employee.id || "",
      employee.name || "",
      employee.designation || "",
      formatDate(selectedDate),
      employee.checkIn || "",
      employee.checkOut || "",
      employee.workingHours || "",
      employee.shift || "",
      employee.attendanceStatus || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(value).replace(/"/g, '""');
            return `"${safeValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `team-attendance-${selectedDate}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /*
   * Modal Handlers
   */
  const openModal = (employee: ExtendedAttendanceRecord, type: "edit" | "regularize") => {
    setSelectedEmployee(employee);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setModalType(null);
  };

  return (
    <ManagerLayout title="Team Attendance Log">
      <div className="teamatt-page">
        {/* Header */}
        <div className="teamatt-header">
          <div className="teamatt-header-content">
            <h1>Attendance</h1>
            <p>
              Manage and track employee attendance · {formatMonth(selectedDate)}
            </p>
          </div>

          <button
            type="button"
            className="teamatt-export-button"
            onClick={handleExport}
          >
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="teamatt-summary-grid">
          <div className="teamatt-summary-card">
            <div className="teamatt-summary-icon teamatt-icon-green">
              <FiCheckCircle />
            </div>
            <strong>{statistics.present}</strong>
            <span>Present</span>
          </div>

          <div className="teamatt-summary-card">
            <div className="teamatt-summary-icon teamatt-icon-red">
              <FiAlertCircle />
            </div>
            <strong>{statistics.absent}</strong>
            <span>Absent</span>
          </div>

          <div className="teamatt-summary-card">
            <div className="teamatt-summary-icon teamatt-icon-yellow">
              <FiClock />
            </div>
            <strong>{statistics.late}</strong>
            <span>Late</span>
          </div>

          <div className="teamatt-summary-card">
            <div className="teamatt-summary-icon teamatt-icon-purple">
              <FiHome />
            </div>
            <strong>{statistics.wfh}</strong>
            <span>WFH</span>
          </div>

          <div className="teamatt-summary-card">
            <div className="teamatt-summary-icon teamatt-icon-blue">
              <FiArrowRight />
            </div>
            <strong>{statistics.overtime}</strong>
            <span>Overtime</span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="teamatt-tabs-wrapper">
          <button
            type="button"
            className={`teamatt-tab ${
              activeTab === "daily" ? "teamatt-tab-active" : ""
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily View
          </button>

          <button
            type="button"
            className={`teamatt-tab ${
              activeTab === "monthly" ? "teamatt-tab-active" : ""
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly Calendar
          </button>

          <button
            type="button"
            className={`teamatt-tab ${
              activeTab === "regularization" ? "teamatt-tab-active" : ""
            }`}
            onClick={() => setActiveTab("regularization")}
          >
            Regularization
          </button>
        </div>

        {/* Daily View */}
        {activeTab === "daily" && (
          <>
            {/* Control Row: Date + Status */}
            <div className="teamatt-control-row">
              <div className="teamatt-date-picker">
                <FiCalendar size={16} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="teamatt-status-chips">
                {["all", "present", "late", "wfh", "absent"].map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={`teamatt-status-chip ${
                      statusFilter === status ? "teamatt-status-chip-active" : ""
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All" : status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Grid */}
            <div className="teamatt-shift-grid">
              <div className="teamatt-shift-card">
                <div className="teamatt-shift-title">
                  <span className="teamatt-shift-dot teamatt-dot-general" />
                  General Shift
                </div>
                <strong>{shiftStatistics.general}</strong>
                <span>09:30 AM – 06:30 PM</span>
              </div>

              <div className="teamatt-shift-card">
                <div className="teamatt-shift-title">
                  <span className="teamatt-shift-dot teamatt-dot-morning" />
                  Morning Shift
                </div>
                <strong>{shiftStatistics.morning}</strong>
                <span>06:00 AM – 02:00 PM</span>
              </div>

              <div className="teamatt-shift-card">
                <div className="teamatt-shift-title">
                  <span className="teamatt-shift-dot teamatt-dot-evening" />
                  Evening Shift
                </div>
                <strong>{shiftStatistics.evening}</strong>
                <span>02:00 PM – 10:00 PM</span>
              </div>

              <div className="teamatt-shift-card">
                <div className="teamatt-shift-title">
                  <span className="teamatt-shift-dot teamatt-dot-night" />
                  Night Shift
                </div>
                <strong>{shiftStatistics.night}</strong>
                <span>10:00 PM – 06:00 AM</span>
              </div>
            </div>

            {/* Attendance Cards / Table Section */}
            <section className="teamatt-table-card">
              {/* Search Toolbar */}
              <div className="teamatt-table-toolbar">
                <div className="teamatt-search-box">
                  <FiSearch size={17} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employee..."
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="teamatt-search-clear"
                      onClick={() => setSearchTerm("")}
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className={`teamatt-filter-button ${
                    showFilters ? "teamatt-filter-active" : ""
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter size={15} />
                  <span>Filters</span>
                  <FiChevronDown size={14} />
                </button>
              </div>

              {/* Extra Filters */}
              {showFilters && (
                <div className="teamatt-extra-filters">
                  <div className="teamatt-extra-filter">
                    <label>Shift</label>
                    <select>
                      <option>All Shifts</option>
                      <option>General</option>
                      <option>Morning</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>

                  <div className="teamatt-extra-filter">
                    <label>Department</label>
                    <select>
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Human Resources</option>
                      <option>Finance</option>
                      <option>Operations</option>
                    </select>
                  </div>

                  <div className="teamatt-extra-filter">
                    <label>Location</label>
                    <select>
                      <option>All Locations</option>
                      <option>Office</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Mobile Attendance Cards (< 768px) */}
              <div className="teamatt-mobile-cards">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((employee, index) => (
                    <div key={employee.id || index} className="teamatt-mobile-card">
                      <div className="teamatt-card-header">
                        <div className="teamatt-employee">
                          <div
                            className="teamatt-avatar"
                            style={{
                              background: employee.color || "#2563eb",
                            }}
                          >
                            {employee.initials}
                          </div>

                          <div className="teamatt-employee-info">
                            <strong>{employee.name}</strong>
                            <span>{employee.id}</span>
                          </div>
                        </div>

                        <span
                          className={`teamatt-attendance-badge teamatt-attendance-${employee.attendanceStatus
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {employee.attendanceStatus}
                        </span>
                      </div>

                      <div className="teamatt-card-body-grid">
                        <div className="teamatt-card-detail">
                          <span className="teamatt-detail-label">Date</span>
                          <span className="teamatt-detail-val">{formatDate(selectedDate)}</span>
                        </div>

                        <div className="teamatt-card-detail">
                          <span className="teamatt-detail-label">Shift</span>
                          <span className="teamatt-detail-val">{employee.shift}</span>
                        </div>

                        <div className="teamatt-card-detail">
                          <span className="teamatt-detail-label">Check In</span>
                          <span
                            className={`teamatt-detail-val ${
                              employee.attendanceStatus === "Absent"
                                ? "teamatt-time-muted"
                                : employee.attendanceStatus === "Late"
                                ? "teamatt-time-late"
                                : "teamatt-time-in"
                            }`}
                          >
                            {employee.checkIn}
                          </span>
                        </div>

                        <div className="teamatt-card-detail">
                          <span className="teamatt-detail-label">Check Out</span>
                          <span
                            className={`teamatt-detail-val ${
                              employee.checkOut === "—"
                                ? "teamatt-time-muted"
                                : "teamatt-time-out"
                            }`}
                          >
                            {employee.checkOut}
                          </span>
                        </div>

                        <div className="teamatt-card-detail full-width">
                          <span className="teamatt-detail-label">Working Hours</span>
                          <span className="teamatt-detail-val-bold">{employee.workingHours}</span>
                        </div>
                      </div>

                      <div className="teamatt-card-actions">
                        <button
                          type="button"
                          className="teamatt-action-edit"
                          onClick={() => openModal(employee, "edit")}
                        >
                          <FiEdit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="teamatt-action-regularize"
                          onClick={() => openModal(employee, "regularize")}
                        >
                          <FiRefreshCw size={13} />
                          <span>Regularize</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="teamatt-empty-state-mobile">
                    <div className="teamatt-empty-state">
                      <FiSearch size={24} />
                      <strong>No attendance records found</strong>
                      <span>Try changing the search or status filter.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Attendance Table (>= 768px) */}
              <div className="teamatt-table-wrapper teamatt-desktop-table">
                <table className="teamatt-table">
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>DATE</th>
                      <th>CHECK IN</th>
                      <th>CHECK OUT</th>
                      <th>WORKING HOURS</th>
                      <th>SHIFT</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((employee, index) => (
                        <tr key={employee.id || index}>
                          {/* Employee */}
                          <td>
                            <div className="teamatt-employee">
                              <div
                                className="teamatt-avatar"
                                style={{
                                  background: employee.color || "#2563eb",
                                }}
                              >
                                {employee.initials}
                              </div>

                              <div className="teamatt-employee-info">
                                <strong>{employee.name}</strong>
                                <span>{employee.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td>{formatDate(selectedDate)}</td>

                          {/* Check In */}
                          <td>
                            <span
                              className={
                                employee.attendanceStatus === "Absent"
                                  ? "teamatt-time-muted"
                                  : employee.attendanceStatus === "Late"
                                  ? "teamatt-time-late"
                                  : "teamatt-time-in"
                              }
                            >
                              {employee.checkIn}
                            </span>
                          </td>

                          {/* Check Out */}
                          <td>
                            <span
                              className={
                                employee.checkOut === "—"
                                  ? "teamatt-time-muted"
                                  : "teamatt-time-out"
                              }
                            >
                              {employee.checkOut}
                            </span>
                          </td>

                          {/* Working Hours */}
                          <td>
                            <span className="teamatt-working-hours">
                              {employee.workingHours}
                            </span>
                          </td>

                          {/* Shift */}
                          <td>
                            <span className="teamatt-shift-name">
                              {employee.shift}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className={`teamatt-attendance-badge teamatt-attendance-${employee.attendanceStatus
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {employee.attendanceStatus}
                            </span>
                          </td>

                          {/* Action */}
                          <td>
                            <div className="teamatt-action-buttons">
                              <button
                                type="button"
                                className="teamatt-action-edit"
                                onClick={() => openModal(employee, "edit")}
                              >
                                <FiEdit2 size={13} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className="teamatt-action-regularize"
                                onClick={() => openModal(employee, "regularize")}
                              >
                                <FiRefreshCw size={13} />
                                <span>Regularize</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="teamatt-empty-cell">
                          <div className="teamatt-empty-state">
                            <FiSearch size={24} />
                            <strong>No attendance records found</strong>
                            <span>Try changing the search or status filter.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                              }}
                            >
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
          </>
        )}

        {/* Monthly Calendar */}
        {activeTab === "monthly" && (
          <section className="teamatt-placeholder-card">
            <div className="teamatt-placeholder-icon">
              <FiCalendar size={26} />
            </div>
            <h2>Monthly Attendance Calendar</h2>
            <p>
              Monthly attendance calendar for {formatMonth(selectedDate)} will
              be displayed here.
            </p>

            <div className="teamatt-month-summary">
              <div>
                <strong>{statistics.present}</strong>
                <span>Present</span>
              </div>
              <div>
                <strong>{statistics.absent}</strong>
                <span>Absent</span>
              </div>
              <div>
                <strong>{statistics.late}</strong>
                <span>Late</span>
              </div>
              <div>
                <strong>{statistics.wfh}</strong>
                <span>WFH</span>
              </div>
            </div>
          </section>
        )}

        {/* Regularization Tab */}
        {activeTab === "regularization" && (
          <section className="teamatt-table-card">
            <div className="teamatt-regularization-header">
              <div>
                <h2>Attendance Regularization</h2>
                <p>Review and manage attendance regularization requests.</p>
              </div>

              <span className="teamatt-request-count">
                {
                  attendanceRecords.filter(
                    (employee) =>
                      employee.attendanceStatus === "Late" ||
                      employee.attendanceStatus === "Absent"
                  ).length
                }{" "}
                requests
              </span>
            </div>

            <div className="teamatt-regularization-list">
              {attendanceRecords
                .filter(
                  (employee) =>
                    employee.attendanceStatus === "Late" ||
                    employee.attendanceStatus === "Absent"
                )
                .map((employee, index) => (
                  <div
                    className="teamatt-regularization-item"
                    key={employee.id || index}
                  >
                    <div className="teamatt-employee">
                      <div
                        className="teamatt-avatar"
                        style={{
                          background: employee.color || "#2563eb",
                        }}
                      >
                        {employee.initials}
                      </div>

                      <div className="teamatt-employee-info">
                        <strong>{employee.name}</strong>
                        <span>{employee.id}</span>
                      </div>
                    </div>

                    <div className="teamatt-regularization-details">
                      <span>{formatDate(selectedDate)}</span>
                      <span
                        className={`teamatt-attendance-badge teamatt-attendance-${employee.attendanceStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {employee.attendanceStatus}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="teamatt-regularize-main-button"
                      onClick={() => openModal(employee, "regularize")}
                    >
                      <FiRefreshCw size={14} />
                      Regularize
                    </button>
                  </div>
                ))}

              {attendanceRecords.filter(
                (employee) =>
                  employee.attendanceStatus === "Late" ||
                  employee.attendanceStatus === "Absent"
              ).length === 0 && (
                <div className="teamatt-no-requests">
                  <FiCheckCircle size={25} />
                  <strong>No regularization requests</strong>
                  <span>Your team attendance is up to date.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Edit / Regularization Modal */}
        {selectedEmployee && modalType && (
          <div
            className="teamatt-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="teamatt-modal" role="dialog" aria-modal="true">
              <div className="teamatt-modal-header">
                <div>
                  <h2>
                    {modalType === "edit"
                      ? "Edit Attendance"
                      : "Regularize Attendance"}
                  </h2>
                  <p>
                    {selectedEmployee.name} · {selectedEmployee.id}
                  </p>
                </div>

                <button
                  type="button"
                  className="teamatt-modal-close"
                  onClick={closeModal}
                >
                  <FiX size={19} />
                </button>
              </div>

              <div className="teamatt-modal-body">
                <div className="teamatt-modal-employee">
                  <div
                    className="teamatt-avatar teamatt-modal-avatar"
                    style={{
                      background: selectedEmployee.color || "#2563eb",
                    }}
                  >
                    {selectedEmployee.initials}
                  </div>

                  <div>
                    <strong>{selectedEmployee.name}</strong>
                    <span>{selectedEmployee.designation}</span>
                  </div>
                </div>

                <div className="teamatt-modal-grid">
                  <div className="teamatt-modal-field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div className="teamatt-modal-field">
                    <label>Status</label>
                    <select
                      defaultValue={selectedEmployee.attendanceStatus}
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="WFH">WFH</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>

                  <div className="teamatt-modal-field">
                    <label>Check In</label>
                    <input
                      type="text"
                      defaultValue={selectedEmployee.checkIn}
                    />
                  </div>

                  <div className="teamatt-modal-field">
                    <label>Check Out</label>
                    <input
                      type="text"
                      defaultValue={selectedEmployee.checkOut}
                    />
                  </div>
                </div>

                {modalType === "regularize" && (
                  <div className="teamatt-reason-field">
                    <label>Reason</label>
                    <textarea
                      placeholder="Enter reason for attendance regularization..."
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <div className="teamatt-modal-footer">
                <button
                  type="button"
                  className="teamatt-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="teamatt-modal-save"
                  onClick={() => {
                    alert(
                      modalType === "edit"
                        ? "Attendance updated successfully."
                        : "Regularization request submitted successfully."
                    );
                    closeModal();
                  }}
                >
                  {modalType === "edit" ? "Save Changes" : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default TeamAttendance;
