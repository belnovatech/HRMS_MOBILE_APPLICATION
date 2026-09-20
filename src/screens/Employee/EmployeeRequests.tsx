import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { downloadReport } from "../../services/downloadService";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiFileText,
  FiCalendar,
  FiChevronDown,
  FiSend,
  FiDownload,
} from "react-icons/fi";
import "./EmployeeRequests.css";

import { attendanceApi } from "../../api";

interface RequestItem {
  id: string;
  type: string;
  details: string;
  date: string;
  status: string;
  employeeId?: string;
}

const formatRequestDate = (value: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRequestStatusClass = (status: string) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (normalized === "approved" || normalized === "resolved") {
    return "emp-request-status-success";
  }

  if (normalized === "pending" || normalized === "open") {
    return "emp-request-status-pending";
  }

  if (normalized === "rejected" || normalized === "cancelled") {
    return "emp-request-status-danger";
  }

  return "emp-request-status-progress";
};

export const EmployeeRequests: React.FC = () => {
  const { leaveRequests = [], helpTickets = [], user, requestAttendanceCorrection, addHelpTicket } = useAuth();

  const [createdRequests, setCreatedRequests] = useState<RequestItem[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [attendanceCorrections, setAttendanceCorrections] = useState<RequestItem[]>([]);

  const [requestType, setRequestType] = useState("Attendance Correction");
  const [requestDetails, setRequestDetails] = useState("");

  React.useEffect(() => {
    attendanceApi.getCorrections()
      .then((records) => {
        if (Array.isArray(records)) {
          const empId = user?.id || user?.employeeId;
          const userRecords = empId ? records.filter(r => r.employeeId === empId) : records;
          setAttendanceCorrections(userRecords.map((r, idx) => ({
            id: r.id || `ATT-CORR-${idx + 1}`,
            type: "Attendance Correction",
            details: r.reason || `Correction for ${r.date}`,
            date: r.date,
            status: r.status || "Pending",
            employeeId: r.employeeId,
          })));
        }
      })
      .catch(() => {});
  }, [user?.id, user?.employeeId]);

  const leaveBasedRequests = useMemo(
    () =>
      leaveRequests.map((leave, index) => ({
        id: leave.id || `REQ-LEAVE-${index + 1}`,
        type: "Leave Request",
        details:
          leave.reason ||
          `${leave.leaveType || "Leave"} (${leave.startDate || "—"} to ${
            leave.endDate || "—"
          })`,
        date: leave.appliedOn || leave.startDate || "",
        status: leave.status || "Pending",
        employeeId: leave.employeeId,
      })),
    [leaveRequests]
  );

  const ticketBasedRequests = useMemo(
    () =>
      helpTickets.map((ticket) => ({
        id: ticket.id,
        type: ticket.category || "Support Ticket",
        details: `${ticket.subject}: ${ticket.description}`,
        date: ticket.date || "",
        status: ticket.status || "Open",
        employeeId: ticket.employeeId,
      })),
    [helpTickets]
  );

  const allRequests = useMemo(() => {
    const combined: RequestItem[] = [
      ...createdRequests,
      ...leaveBasedRequests,
      ...attendanceCorrections,
      ...ticketBasedRequests,
    ];

    const uniqueRequests: RequestItem[] = [];
    const seen = new Set<string>();

    combined.forEach((request) => {
      if (!seen.has(request.id)) {
        seen.add(request.id);
        uniqueRequests.push(request);
      }
    });

    return uniqueRequests;
  }, [createdRequests, leaveBasedRequests, attendanceCorrections, ticketBasedRequests]);

  const requestTypes = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(allRequests.map((request) => request.type))),
    ];
  }, [allRequests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allRequests.filter((request) => {
      const matchesSearch =
        !query ||
        request.id.toLowerCase().includes(query) ||
        request.type.toLowerCase().includes(query) ||
        request.details.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query);

      const matchesType =
        selectedType === "All" ||
        request.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [allRequests, searchTerm, selectedType]);

  const pendingCount = allRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = allRequests.filter(
    (request) =>
      request.status === "Approved" ||
      request.status === "Resolved"
  ).length;

  const handleOpenRequest = () => {
    setRequestType("Attendance Correction");
    setRequestDetails("");
    setShowRequestModal(true);
  };

  const handleCloseRequest = () => {
    setShowRequestModal(false);
    setRequestDetails("");
  };

  const handleSubmitRequest = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedDetails = requestDetails.trim();
    if (!trimmedDetails) {
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const newRequest: RequestItem = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      type: requestType,
      details: trimmedDetails,
      date: todayStr,
      status: "Pending",
      employeeId: user?.employeeId || user?.id || "EMP001",
    };

    setCreatedRequests((previous) => [
      newRequest,
      ...previous,
    ]);

    if (requestType === "Attendance Correction") {
      try {
        await requestAttendanceCorrection({
          date: todayStr,
          checkIn: "09:00:00",
          checkOut: "18:00:00",
          reason: trimmedDetails,
        });
      } catch (e) {
        console.warn("Attendance correction API warning:", e);
      }
    } else {
      try {
        addHelpTicket({
          category: requestType,
          subject: requestType,
          description: trimmedDetails,
        });
      } catch (e) {
        console.warn("Create ticket warning:", e);
      }
    }

    handleCloseRequest();
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportRequestsPdf = async () => {
    setIsExporting(true);
    try {
      const headers = ['Request ID & Type', 'Details / Status'];
      const rows = filteredRequests.map((req) => [
        `${req.id} — ${req.type}`,
        `${req.details} (${formatRequestDate(req.date)}) — Status: ${req.status}`,
      ]);

      await downloadReport(
        'EMPLOYEE REQUEST HISTORY REPORT',
        `Employee: ${user?.name || 'Employee'} (${user?.employeeId || user?.id || 'N/A'})`,
        headers,
        rows,
        `Requests_History_Report_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="My Requests" showBack />

      <main className="page-content">
        <div className="emp-requests-page">
          {/* PAGE HEADER */}
          <section className="emp-requests-header">
            <div className="emp-requests-header-copy">
              <span className="emp-requests-eyebrow">
                EMPLOYEE SERVICES
              </span>

              <h1>My Requests</h1>

              <p>
                Submit requests and track their progress from
                one place.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="emp-requests-new-btn"
                disabled={isExporting}
                onClick={handleExportRequestsPdf}
                style={{ background: '#2563eb' }}
              >
                <FiDownload />
                <span>{isExporting ? 'Exporting...' : 'Export Log PDF'}</span>
              </button>

              <button
                type="button"
                className="emp-requests-new-btn"
                onClick={handleOpenRequest}
              >
                <FiPlus />
                <span>New Request</span>
              </button>
            </div>
          </section>

          {/* SUMMARY */}
          <section className="emp-requests-summary">
            <div className="emp-requests-summary-card">
              <div className="emp-requests-summary-icon emp-requests-icon-blue">
                <FiFileText />
              </div>
              <div>
                <span>Total Requests</span>
                <strong>{allRequests.length}</strong>
              </div>
            </div>

            <div className="emp-requests-summary-card">
              <div className="emp-requests-summary-icon emp-requests-icon-yellow">
                <FiCalendar />
              </div>
              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="emp-requests-summary-card">
              <div className="emp-requests-summary-icon emp-requests-icon-green">
                <FiSend />
              </div>
              <div>
                <span>Completed</span>
                <strong>{approvedCount}</strong>
              </div>
            </div>
          </section>

          {/* REQUEST HISTORY */}
          <section className="emp-requests-panel">
            <div className="emp-requests-panel-header">
              <div>
                <span className="emp-requests-section-label">
                  REQUEST TRACKER
                </span>
                <h2>Request History</h2>
                <p>
                  Review all requests submitted through the
                  employee portal.
                </p>
              </div>

              <span className="emp-requests-count">
                {filteredRequests.length} requests
              </span>
            </div>

            {/* SEARCH / FILTER */}
            <div className="emp-requests-toolbar">
              <div className="emp-requests-search">
                <FiSearch />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search by ID, type, details or status..."
                />
              </div>

              <div className="emp-requests-filter">
                <select
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(event.target.value)
                  }
                >
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "All"
                        ? "All Request Types"
                        : type}
                    </option>
                  ))}
                </select>
                <FiChevronDown />
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="emp-requests-table-wrapper">
              <table className="emp-requests-table">
                <thead>
                  <tr>
                    <th>REQUEST ID</th>
                    <th>REQUEST TYPE</th>
                    <th>DETAILS / SUMMARY</th>
                    <th>SUBMITTED DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <span className="emp-requests-id">
                          {request.id}
                        </span>
                      </td>

                      <td>
                        <span className="emp-requests-type">
                          {request.type}
                        </span>
                      </td>

                      <td>
                        <span className="emp-requests-details">
                          {request.details}
                        </span>
                      </td>

                      <td>
                        <span className="emp-requests-date">
                          {formatRequestDate(request.date)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`emp-requests-status ${getRequestStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE REQUEST CARDS */}
            <div className="emp-requests-mobile-list">
              {filteredRequests.map((request) => (
                <article
                  className="emp-requests-mobile-card"
                  key={`mobile-${request.id}`}
                >
                  <div className="emp-requests-mobile-top">
                    <span className="emp-requests-id">
                      {request.id}
                    </span>

                    <span
                      className={`emp-requests-status ${getRequestStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <h3>{request.type}</h3>

                  <p>{request.details}</p>

                  <div className="emp-requests-mobile-date">
                    <FiCalendar />
                    {formatRequestDate(request.date)}
                  </div>
                </article>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="emp-requests-empty">
                <div className="emp-requests-empty-icon">
                  <FiSearch />
                </div>

                <h3>No requests found</h3>

                <p>
                  Try changing your search or filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("All");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>

        {/* NEW REQUEST MODAL */}
        {showRequestModal && (
          <div
            className="emp-requests-modal-overlay"
            onClick={handleCloseRequest}
          >
            <div
              className="emp-requests-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="emp-requests-modal-header">
                <div>
                  <span>EMPLOYEE SERVICES</span>
                  <h2>Create New Request</h2>
                  <p>
                    Submit a request to HR or your manager.
                  </p>
                </div>

                <button
                  type="button"
                  className="emp-requests-modal-close"
                  onClick={handleCloseRequest}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest}>
                <div className="emp-requests-modal-body">
                  <div className="emp-requests-form-group">
                    <label htmlFor="employee-request-type">
                      Request Type
                    </label>

                    <div className="emp-requests-select-wrap">
                      <select
                        id="employee-request-type"
                        value={requestType}
                        onChange={(event) =>
                          setRequestType(event.target.value)
                        }
                      >
                        <option>
                          Attendance Correction
                        </option>
                        <option>Leave Request</option>
                        <option>Profile Update</option>
                        <option>Document Verification</option>
                        <option>Payroll Query</option>
                        <option>Other Request</option>
                      </select>
                      <FiChevronDown />
                    </div>
                  </div>

                  <div className="emp-requests-form-group">
                    <label htmlFor="employee-request-details">
                      Request Details
                    </label>

                    <textarea
                      id="employee-request-details"
                      rows={5}
                      value={requestDetails}
                      onChange={(event) =>
                        setRequestDetails(event.target.value)
                      }
                      placeholder="Describe your request clearly..."
                      required
                    />

                    <small>
                      Please provide enough information for HR or
                      your manager to process the request.
                    </small>
                  </div>
                </div>

                <div className="emp-requests-modal-footer">
                  <button
                    type="button"
                    className="emp-requests-cancel-btn"
                    onClick={handleCloseRequest}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="emp-requests-submit-btn"
                  >
                    <FiSend />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EmployeeRequests;
