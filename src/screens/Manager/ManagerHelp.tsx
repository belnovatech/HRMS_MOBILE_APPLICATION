import React, { useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FiSend,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiHelpCircle,
  FiClock,
  FiChevronDown,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiMessageSquare,
} from "react-icons/fi";
import "./ManagerHelp.css";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function ManagerHelp() {
  const { addHelpTicket } = useAuth();

  /* =====================================================
     FORM STATE
     ===================================================== */
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketMessage, setTicketMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* =====================================================
     FAQ DATA
     ===================================================== */
  const faqs: FaqItem[] = [
    {
      id: 1,
      question: "How can I approve a team member's leave?",
      answer:
        "Open Leave Approvals from the manager navigation. Review the request details and use the Approve or Reject action available for pending requests.",
    },
    {
      id: 2,
      question: "How can I regularize attendance?",
      answer:
        "Open Team Attendance and locate the employee's attendance record. Use the Regularize option to review and process the attendance correction.",
    },
    {
      id: 3,
      question: "Where can I view my team's performance?",
      answer:
        "Open Team Reports to view attendance rate, working hours, leave statistics, performance scores, and monthly team summaries.",
    },
    {
      id: 4,
      question: "How long does HR support take to respond?",
      answer:
        "Standard support requests are generally reviewed during HR helpdesk working hours. High-priority issues should be clearly marked as urgent when submitting the ticket.",
    },
  ];

  /* =====================================================
     GENERATE TICKET ID
     ===================================================== */
  const generateTicketId = () => {
    return `MGR-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  /* =====================================================
     SUBMIT TICKET
     ===================================================== */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !ticketSubject.trim() ||
      !ticketCategory ||
      !ticketMessage.trim()
    ) {
      return;
    }

    const generatedId = generateTicketId();
    setTicketId(generatedId);
    setSubmitted(true);

    if (addHelpTicket) {
      addHelpTicket({
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketMessage,
      });
    }

    setTicketSubject("");
    setTicketCategory("");
    setTicketPriority("Medium");
    setTicketMessage("");
  };

  /* =====================================================
     CLOSE SUCCESS MESSAGE
     ===================================================== */
  const closeSuccessMessage = () => {
    setSubmitted(false);
  };

  /* =====================================================
     FAQ TOGGLE
     ===================================================== */
  const toggleFaq = (id: number) => {
    setOpenFaq((current) => (current === id ? null : id));
  };

  return (
    <ManagerLayout title="Help & Support" breadcrumb="Help & Support">
      <div className="mgrhelp-page">
        {/* =================================================
            PAGE HEADER
        ================================================= */}
        <header className="mgrhelp-header">
          <div className="mgrhelp-header-icon">
            <FiMessageSquare size={22} />
          </div>

          <div className="mgrhelp-header-content">
            <h1>Manager Support Desk</h1>
            <p>
              Get help with HR policies, team administration, payroll queries,
              attendance, and other HRMS issues.
            </p>
          </div>
        </header>

        {/* =================================================
            MAIN GRID
        ================================================= */}
        <div className="mgrhelp-layout">
          {/* =================================================
              LEFT - SUPPORT TICKET
          ================================================= */}
          <section className="mgrhelp-ticket-card">
            <div className="mgrhelp-card-header">
              <div className="mgrhelp-card-icon">
                <FiFileText size={17} />
              </div>

              <div>
                <h2>Raise a Support Ticket</h2>
                <p>
                  Describe your issue and our HR administration team will review
                  your request.
                </p>
              </div>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}
            {submitted && (
              <div className="mgrhelp-success">
                <div className="mgrhelp-success-icon">
                  <FiCheckCircle size={19} />
                </div>

                <div className="mgrhelp-success-content">
                  <strong>Support ticket submitted successfully</strong>
                  <span>
                    Your ticket reference is <b>{ticketId}</b>. HR support will
                    review your request.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeSuccessMessage}
                  className="mgrhelp-success-close"
                  aria-label="Close success message"
                >
                  ×
                </button>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}
            <form className="mgrhelp-form" onSubmit={handleSubmit}>
              {/* SUBJECT */}
              <div className="mgrhelp-form-group">
                <label htmlFor="mgrhelp-subject">
                  Subject
                  <span>*</span>
                </label>

                <input
                  id="mgrhelp-subject"
                  className="mgrhelp-input"
                  type="text"
                  placeholder="e.g. Leave quota correction for team member"
                  value={ticketSubject}
                  onChange={(event) => setTicketSubject(event.target.value)}
                  required
                />
              </div>

              {/* CATEGORY + PRIORITY */}
              <div className="mgrhelp-form-row">
                <div className="mgrhelp-form-group">
                  <label htmlFor="mgrhelp-category">
                    Category
                    <span>*</span>
                  </label>

                  <div className="mgrhelp-select-wrapper">
                    <select
                      id="mgrhelp-category"
                      className="mgrhelp-select"
                      value={ticketCategory}
                      onChange={(event) =>
                        setTicketCategory(event.target.value)
                      }
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Leave">Leave & Approvals</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Employee">Employee Management</option>
                      <option value="Reports">Reports & Analytics</option>
                      <option value="Technical">Technical Issue</option>
                      <option value="Other">Other</option>
                    </select>

                    <FiChevronDown
                      className="mgrhelp-select-icon"
                      size={15}
                    />
                  </div>
                </div>

                <div className="mgrhelp-form-group">
                  <label htmlFor="mgrhelp-priority">Priority</label>

                  <div className="mgrhelp-select-wrapper">
                    <select
                      id="mgrhelp-priority"
                      className="mgrhelp-select"
                      value={ticketPriority}
                      onChange={(event) =>
                        setTicketPriority(event.target.value)
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>

                    <FiChevronDown
                      className="mgrhelp-select-icon"
                      size={15}
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mgrhelp-form-group">
                <div className="mgrhelp-label-row">
                  <label htmlFor="mgrhelp-description">
                    Details / Description
                    <span>*</span>
                  </label>

                  <small>{ticketMessage.length}/1000</small>
                </div>

                <textarea
                  id="mgrhelp-description"
                  className="mgrhelp-textarea"
                  rows={7}
                  maxLength={1000}
                  placeholder="Explain your query or issue in detail. Include employee ID, dates, or relevant information where applicable..."
                  value={ticketMessage}
                  onChange={(event) => setTicketMessage(event.target.value)}
                  required
                />
              </div>

              {/* INFO */}
              <div className="mgrhelp-form-info">
                <FiAlertCircle size={14} />
                <span>
                  Do not include passwords, authentication codes, or other
                  confidential credentials in your support request.
                </span>
              </div>

              {/* SUBMIT */}
              <div className="mgrhelp-submit-row">
                <button type="submit" className="mgrhelp-submit-button">
                  <FiSend size={15} />
                  <span>Submit Ticket</span>
                </button>

                <span className="mgrhelp-required-note">* Required fields</span>
              </div>
            </form>
          </section>

          {/* =================================================
              RIGHT - SUPPORT INFORMATION
          ================================================= */}
          <aside className="mgrhelp-sidebar">
            {/* HR CONTACT */}
            <div className="mgrhelp-info-card">
              <div className="mgrhelp-info-header">
                <div className="mgrhelp-info-icon mgrhelp-info-blue">
                  <FiMail size={17} />
                </div>

                <div>
                  <h3>HR Helpdesk</h3>
                  <p>Contact HR administration</p>
                </div>
              </div>

              <a
                href="mailto:hr.helpdesk@belnova.com"
                className="mgrhelp-contact-link"
              >
                hr.helpdesk@belnova.com
              </a>

              <span className="mgrhelp-contact-note">
                Response within business hours
              </span>
            </div>

            {/* PHONE */}
            <div className="mgrhelp-info-card">
              <div className="mgrhelp-info-header">
                <div className="mgrhelp-info-icon mgrhelp-info-green">
                  <FiPhone size={17} />
                </div>

                <div>
                  <h3>Emergency Helpline</h3>
                  <p>Urgent HR administration issues</p>
                </div>
              </div>

              <a
                href="tel:+918045678900"
                className="mgrhelp-contact-link mgrhelp-phone-link"
              >
                +91 80 4567 8900
              </a>

              <span className="mgrhelp-contact-note">Extension 404</span>
            </div>

            {/* SUPPORT HOURS */}
            <div className="mgrhelp-info-card">
              <div className="mgrhelp-info-header">
                <div className="mgrhelp-info-icon mgrhelp-info-purple">
                  <FiClock size={17} />
                </div>

                <div>
                  <h3>Support Hours</h3>
                  <p>HR Helpdesk availability</p>
                </div>
              </div>

              <div className="mgrhelp-hours">
                <div>
                  <span>Monday – Friday</span>
                  <strong>9:00 AM – 6:00 PM</strong>
                </div>

                <div>
                  <span>Saturday</span>
                  <strong>9:00 AM – 1:00 PM</strong>
                </div>
              </div>
            </div>

            {/* MANAGER GUIDE */}
            <div className="mgrhelp-guide-card">
              <div className="mgrhelp-guide-icon">
                <FiBookOpen size={18} />
              </div>

              <div className="mgrhelp-guide-content">
                <h3>Manager Guidebook</h3>

                <p>
                  Access policies, approval guidelines, attendance procedures,
                  and manager workflows.
                </p>

                <button
                  type="button"
                  className="mgrhelp-guide-button"
                  onClick={() =>
                    alert("Opening Manager Policy Handbook PDF...")
                  }
                >
                  <FiBookOpen size={13} />
                  <span>Download Policy PDF</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* =================================================
            FAQ SECTION
        ================================================= */}
        <section className="mgrhelp-faq-card">
          <div className="mgrhelp-faq-header">
            <div className="mgrhelp-faq-title-icon">
              <FiHelpCircle size={18} />
            </div>

            <div>
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common manager questions.</p>
            </div>
          </div>

          <div className="mgrhelp-faq-list">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`mgrhelp-faq-item ${
                  openFaq === faq.id ? "mgrhelp-faq-open" : ""
                }`}
              >
                <button
                  type="button"
                  className="mgrhelp-faq-question"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>

                  <FiChevronDown
                    className="mgrhelp-faq-chevron"
                    size={16}
                  />
                </button>

                {openFaq === faq.id && (
                  <div className="mgrhelp-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ManagerLayout>
  );
}

export { ManagerHelp };
