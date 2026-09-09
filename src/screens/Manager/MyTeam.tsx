import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ManagerLayout } from "../../layouts/ManagerLayout";
import { TeamMember } from "../../types";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiDownload,
  FiPlus,
  FiX,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import "./MyTeam.css";

export const MyTeam: React.FC = () => {
  const { teamMembers = [] } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Local additions for this page
  const [addedMembers, setAddedMembers] = useState<TeamMember[]>([]);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    status: "Present",
    performance: "90%",
  });

  /*
   * Combine members coming from AuthContext
   * with employees added from this page.
   */
  const allMembers = useMemo(() => {
    return [...teamMembers, ...addedMembers];
  }, [teamMembers, addedMembers]);

  /*
   * Search functionality
   */
  const filteredMembers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return allMembers;
    }

    return allMembers.filter((member) => {
      return (
        String(member.name || "")
          .toLowerCase()
          .includes(search) ||
        String(member.designation || "")
          .toLowerCase()
          .includes(search) ||
        String(member.email || "")
          .toLowerCase()
          .includes(search) ||
        String(member.phone || "")
          .toLowerCase()
          .includes(search) ||
        String(member.id || "")
          .toLowerCase()
          .includes(search) ||
        String(member.status || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [allMembers, searchTerm]);

  /*
   * Generate initials automatically
   */
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 0) {
      return "NA";
    }

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /*
   * Generate different avatar colors
   */
  const avatarColors = [
    "#10b981",
    "#f59e0b",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#ef4444",
    "#84cc16",
  ];

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length];
  };

  /*
   * Export employee details as CSV
   */
  const handleExport = () => {
    if (filteredMembers.length === 0) {
      alert("There are no employees to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Name",
      "Designation",
      "Email",
      "Phone Number",
      "Status",
      "Performance",
    ];

    const rows = filteredMembers.map((member) => [
      member.id || "",
      member.name || "",
      member.designation || "",
      member.email || "",
      member.phone || "",
      member.status || "",
      member.performance || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
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
    link.download = "my-team-employees.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * Add employee form input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewEmployee((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Add employee submission
   */
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newEmployee.name.trim() ||
      !newEmployee.designation.trim() ||
      !newEmployee.email.trim()
    ) {
      alert("Please enter name, designation and email.");
      return;
    }

    const employeeId = `EMP${String(allMembers.length + 1).padStart(3, "0")}`;

    const employee: TeamMember = {
      id: employeeId,
      name: newEmployee.name.trim(),
      designation: newEmployee.designation.trim(),
      email: newEmployee.email.trim(),
      phone: newEmployee.phone.trim() || "Not provided",
      status: newEmployee.status as any,
      performance: newEmployee.performance,
      initials: getInitials(newEmployee.name),
      color: getAvatarColor(allMembers.length),
      checkIn: "09:00 AM",
    };

    setAddedMembers((previous) => [...previous, employee]);

    setNewEmployee({
      name: "",
      designation: "",
      email: "",
      phone: "",
      status: "Present",
      performance: "90%",
    });

    setShowAddModal(false);
  };

  /*
   * Close modal and reset form
   */
  const handleCloseModal = () => {
    setShowAddModal(false);

    setNewEmployee({
      name: "",
      designation: "",
      email: "",
      phone: "",
      status: "Present",
      performance: "90%",
    });
  };

  return (
    <ManagerLayout title="My Team Roster">
      <div className="myteam-page">
        {/* Page Header */}
        <div className="myteam-page-header">
          <div>
            <h1>Direct Reports &amp; Team Roster</h1>
            <p>
              Overview of team members, roles, and real-time activity status.
            </p>
          </div>

          <div className="myteam-header-actions">
            <button
              type="button"
              className="myteam-export-btn"
              onClick={handleExport}
            >
              <FiDownload size={17} />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="myteam-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus size={18} />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <section className="myteam-main-card">
          {/* Search */}
          <div className="myteam-search-wrapper">
            <FiSearch className="myteam-search-icon" size={19} />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, employee ID, role, email..."
              aria-label="Search team members"
            />

            {searchTerm && (
              <button
                type="button"
                className="myteam-clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FiX size={17} />
              </button>
            )}
          </div>

          {/* Table Header Information */}
          <div className="myteam-table-heading">
            <div>
              <h3>Team Members</h3>
              <span>
                {searchTerm
                  ? `${filteredMembers.length} matching employees`
                  : `${allMembers.length} employees`}
              </span>
            </div>
          </div>

          {/* Mobile Employee Cards View (< 768px) */}
          <div className="myteam-mobile-cards">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => (
                <div key={member.id || index} className="myteam-mobile-card">
                  <div className="myteam-card-header">
                    <div className="myteam-member-info">
                      <div
                        className="myteam-avatar"
                        style={{
                          backgroundColor:
                            member.color || getAvatarColor(index),
                        }}
                      >
                        {member.initials || getInitials(member.name)}
                      </div>

                      <div className="myteam-member-details">
                        <strong>{member.name}</strong>
                        <span>ID: {member.id || "N/A"}</span>
                      </div>
                    </div>

                    <span
                      className={`myteam-status-badge ${String(
                        member.status || "Unknown"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <span className="myteam-status-dot"></span>
                      {member.status || "Unknown"}
                    </span>
                  </div>

                  <div className="myteam-card-body">
                    <div className="myteam-card-row">
                      <FiBriefcase size={14} className="myteam-row-icon" />
                      <span className="myteam-row-val">
                        {member.designation || "Not specified"}
                      </span>
                    </div>

                    <div className="myteam-card-row">
                      <a
                        href={`mailto:${member.email}`}
                        className="myteam-email-link"
                      >
                        <FiMail size={14} className="myteam-row-icon" />
                        <span>{member.email}</span>
                      </a>
                    </div>

                    <div className="myteam-card-row">
                      <a
                        href={
                          member.phone && member.phone !== "Not provided"
                            ? `tel:${member.phone}`
                            : undefined
                        }
                        className="myteam-phone-link"
                      >
                        <FiPhone size={14} className="myteam-row-icon" />
                        <span>{member.phone || "Not provided"}</span>
                      </a>
                    </div>
                  </div>

                  <div className="myteam-card-footer">
                    <span className="myteam-footer-label">Performance</span>
                    <strong className="myteam-perf-val">
                      {member.performance || "0%"}
                    </strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="myteam-empty-state-mobile">
                <div className="myteam-empty-content">
                  <div className="myteam-empty-icon">
                    <FiUser size={24} />
                  </div>
                  <h3>No team members found</h3>
                  <p>Try changing your search or add a new employee.</p>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="myteam-table-container myteam-desktop-table">
            <table className="myteam-table">
              <thead>
                <tr>
                  <th className="myteam-member-column">MEMBER</th>
                  <th className="myteam-designation-column">DESIGNATION</th>
                  <th className="myteam-email-column">CONTACT EMAIL</th>
                  <th className="myteam-phone-column">PHONE NUMBER</th>
                  <th className="myteam-status-column">STATUS TODAY</th>
                  <th className="myteam-performance-column">PERFORMANCE</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <tr key={member.id || index}>
                      {/* Member */}
                      <td>
                        <div className="myteam-member-info">
                          <div
                            className="myteam-avatar"
                            style={{
                              backgroundColor:
                                member.color || getAvatarColor(index),
                            }}
                          >
                            {member.initials || getInitials(member.name)}
                          </div>

                          <div className="myteam-member-details">
                            <strong>{member.name}</strong>
                            <span>ID: {member.id || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td>
                        <div className="myteam-designation">
                          <FiBriefcase size={15} />
                          <span>{member.designation || "Not specified"}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <a
                          href={`mailto:${member.email}`}
                          className="myteam-email-link"
                        >
                          <FiMail size={16} />
                          <span>{member.email}</span>
                        </a>
                      </td>

                      {/* Phone */}
                      <td>
                        <a
                          href={
                            member.phone && member.phone !== "Not provided"
                              ? `tel:${member.phone}`
                              : undefined
                          }
                          className="myteam-phone-link"
                        >
                          <FiPhone size={16} />
                          <span>{member.phone || "Not provided"}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`myteam-status-badge ${String(
                            member.status || "Unknown"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="myteam-status-dot"></span>
                          {member.status || "Unknown"}
                        </span>
                      </td>

                      {/* Performance */}
                      <td>
                        <div className="myteam-performance">
                          <strong>{member.performance || "0%"}</strong>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="myteam-empty-state">
                      <div className="myteam-empty-content">
                        <div className="myteam-empty-icon">
                          <FiUser size={24} />
                        </div>
                        <h3>No team members found</h3>
                        <p>
                          Try changing your search or add a new employee.
                        </p>
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div
            className="myteam-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div
              className="myteam-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-employee-title"
            >
              {/* Modal Header */}
              <div className="myteam-modal-header">
                <div>
                  <h2 id="add-employee-title">Add Employee</h2>
                  <p>Add a new member to your team roster.</p>
                </div>

                <button
                  type="button"
                  className="myteam-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <FiX size={21} />
                </button>
              </div>

              {/* Form */}
              <form
                className="myteam-employee-form"
                onSubmit={handleAddEmployee}
              >
                <div className="myteam-form-grid">
                  {/* Name */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-name">
                      Employee Name
                      <span>*</span>
                    </label>
                    <input
                      id="employee-name"
                      name="name"
                      type="text"
                      placeholder="Enter employee name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Designation */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-designation">
                      Designation
                      <span>*</span>
                    </label>
                    <input
                      id="employee-designation"
                      name="designation"
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={newEmployee.designation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-email">
                      Email
                      <span>*</span>
                    </label>
                    <input
                      id="employee-email"
                      name="email"
                      type="email"
                      placeholder="employee@company.com"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-phone">Phone Number</label>
                    <input
                      id="employee-phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Status */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-status">Status Today</label>
                    <select
                      id="employee-status"
                      name="status"
                      value={newEmployee.status}
                      onChange={handleInputChange}
                    >
                      <option value="Present">Present</option>
                      <option value="WFH">WFH</option>
                      <option value="Absent">Absent</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  {/* Performance */}
                  <div className="myteam-form-field">
                    <label htmlFor="employee-performance">Performance</label>
                    <input
                      id="employee-performance"
                      name="performance"
                      type="text"
                      placeholder="90%"
                      value={newEmployee.performance}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="myteam-form-actions">
                  <button
                    type="button"
                    className="myteam-cancel-btn"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="myteam-save-btn">
                    <FiPlus size={17} />
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default MyTeam;
