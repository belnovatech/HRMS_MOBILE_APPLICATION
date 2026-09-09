import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiSend,
  FiShield,
  FiX,
} from "react-icons/fi";
import "./EmployeeHelp.css";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: "Leave",
    question: "How do I apply for leave?",
    answer:
      "Open My Leave from the employee portal and select Apply Leave. Choose the leave type, dates, and reason, then submit the request for manager approval.",
  },
  {
    id: 2,
    category: "Payroll",
    question: "Where can I download my payslip?",
    answer:
      "Open My Payslips and select the required month. You can view the salary statement and use the PDF/download action to save your payslip.",
  },
  {
    id: 3,
    category: "Attendance",
    question: "How do I regularize missed attendance?",
    answer:
      "Open My Attendance and use Request Correction. Provide the correct check-in or check-out details and submit the request for review.",
  },
  {
    id: 4,
    category: "Profile",
    question: "How can I update my profile?",
    answer:
      "Open My Profile to review your employee information. Fields controlled by HR may require an HR request before they can be changed.",
  },
  {
    id: 5,
    category: "Documents",
    question: "How do I upload an employee document?",
    answer:
      "Open Documents, select Upload Document, choose the appropriate category, provide the document details, and submit the file for verification.",
  },
  {
    id: 6,
    category: "Requests",
    question: "How can I track a request I submitted?",
    answer:
      "Open My Requests to view submitted requests, their reference IDs, submitted dates, and the latest processing status.",
  },
];

const SUPPORT_CATEGORIES = [
  "Attendance",
  "Leave",
  "Payroll",
  "Profile",
  "Documents",
  "IT Support",
  "Other",
];

export const EmployeeHelp: React.FC = () => {
  const { user, helpTickets = [], addHelpTicket } = useAuth();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Attendance");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [successTicket, setSuccessTicket] = useState<any>(null);

  const empId = user?.employeeId || "EMP001";

  const submittedTickets = useMemo(() => {
    return helpTickets.filter(
      (t) => t.employeeId === empId || t.employeeName === user?.name
    );
  }, [helpTickets, empId, user]);

  const filteredFaqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return FAQS;
    }

    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if (!trimmedSubject || !trimmedDescription) {
      return;
    }

    const ticket = addHelpTicket({
      category,
      subject: trimmedSubject,
      description: trimmedDescription,
    });

    setSuccessTicket(ticket);
    setSubject("");
    setDescription("");
  };

  const closeSuccess = () => {
    setSuccessTicket(null);
  };

  return (
    <div className="app-container">
      <AppHeader title="Help & Support" showBack />

      <main className="page-content">
        <div className="emp-help-page">
          {/* PAGE HEADER */}
          <section className="emp-help-header">
            <div className="emp-help-header-copy">
              <span className="emp-help-eyebrow">EMPLOYEE SUPPORT CENTER</span>
              <h1>Help &amp; Support</h1>
              <p>
                Find answers, raise support requests, and get assistance with
                your employee services.
              </p>
            </div>

            <div className="emp-help-header-badge">
              <span className="emp-help-online-dot" />
              Support available
            </div>
          </section>

          {/* QUICK SUPPORT CARDS */}
          <section className="emp-help-quick-grid">
            <article className="emp-help-quick-card">
              <div className="emp-help-quick-icon emp-help-blue">
                <FiMessageCircle />
              </div>
              <div className="emp-help-quick-content">
                <span>SUPPORT TICKETS</span>
                <strong>Raise a Request</strong>
                <p>Report an issue to the support team.</p>
              </div>
              <FiArrowRight className="emp-help-quick-arrow" />
            </article>

            <article className="emp-help-quick-card">
              <div className="emp-help-quick-icon emp-help-purple">
                <FiHelpCircle />
              </div>
              <div className="emp-help-quick-content">
                <span>KNOWLEDGE BASE</span>
                <strong>Frequently Asked</strong>
                <p>Find quick answers to common questions.</p>
              </div>
              <FiArrowRight className="emp-help-quick-arrow" />
            </article>

            <article className="emp-help-quick-card">
              <div className="emp-help-quick-icon emp-help-green">
                <FiShield />
              </div>
              <div className="emp-help-quick-content">
                <span>HR ASSISTANCE</span>
                <strong>HR Support</strong>
                <p>Contact HR for employee-related help.</p>
              </div>
              <FiArrowRight className="emp-help-quick-arrow" />
            </article>
          </section>

          {/* MAIN CONTENT */}
          <section className="emp-help-layout">
            {/* FAQ */}
            <div className="emp-help-faq-panel">
              <div className="emp-help-section-heading">
                <div>
                  <span>KNOWLEDGE BASE</span>
                  <h2>Frequently Asked Questions</h2>
                  <p>
                    Search our most common employee support questions.
                  </p>
                </div>

                <div className="emp-help-faq-count">
                  {filteredFaqs.length} articles
                </div>
              </div>

              <div className="emp-help-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="emp-help-faq-list">
                {filteredFaqs.map((faq) => {
                  const isOpen = activeFaq === faq.id;

                  return (
                    <article
                      className={`emp-help-faq-item ${
                        isOpen ? "emp-help-faq-open" : ""
                      }`}
                      key={faq.id}
                    >
                      <button
                        type="button"
                        className="emp-help-faq-question"
                        onClick={() =>
                          setActiveFaq(isOpen ? null : faq.id)
                        }
                        aria-expanded={isOpen}
                      >
                        <span className="emp-help-faq-question-text">
                          <span className="emp-help-faq-number">
                            {String(faq.id).padStart(2, "0")}
                          </span>
                          <span>{faq.question}</span>
                        </span>

                        <span className="emp-help-faq-toggle">
                          <FiChevronDown />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="emp-help-faq-answer">
                          <p>{faq.answer}</p>
                          <span>{faq.category}</span>
                        </div>
                      )}

                      {!isOpen && (
                        <div className="emp-help-faq-category">
                          {faq.category}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="emp-help-empty">
                  <FiSearch />
                  <strong>No matching articles</strong>
                  <p>Try another keyword or clear the search.</p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

            {/* SUPPORT FORM */}
            <aside className="emp-help-ticket-panel">
              <div className="emp-help-ticket-heading">
                <div className="emp-help-ticket-icon">
                  <FiMessageCircle />
                </div>

                <div>
                  <span>GET ASSISTANCE</span>
                  <h2>Raise a Support Request</h2>
                  <p>
                    Our support team will review your request.
                  </p>
                </div>
              </div>

              {successTicket && (
                <div className="emp-help-success">
                  <div className="emp-help-success-icon">
                    <FiCheckCircle />
                  </div>

                  <div>
                    <strong>Request submitted successfully</strong>
                    <p>
                      Reference ID: <b>{successTicket.id}</b>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeSuccess}
                    aria-label="Close notification"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              <form
                className="emp-help-ticket-form"
                onSubmit={handleSubmit}
              >
                <div className="emp-help-field">
                  <label htmlFor="emp-help-category">Category</label>

                  <div className="emp-help-select-wrap">
                    <select
                      id="emp-help-category"
                      value={category}
                      onChange={(event) =>
                        setCategory(event.target.value)
                      }
                    >
                      {SUPPORT_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown />
                  </div>
                </div>

                <div className="emp-help-field">
                  <label htmlFor="emp-help-subject">Subject</label>

                  <input
                    id="emp-help-subject"
                    type="text"
                    placeholder="Briefly describe your issue"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="emp-help-field">
                  <label htmlFor="emp-help-description">
                    Description
                  </label>

                  <textarea
                    id="emp-help-description"
                    rows={6}
                    placeholder="Describe your issue in detail. Include relevant dates, request IDs, or error messages if applicable."
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    required
                  />

                  <span className="emp-help-field-hint">
                    Avoid sharing passwords or other confidential credentials.
                  </span>
                </div>

                <button
                  className="emp-help-submit-btn"
                  type="submit"
                >
                  <FiSend />
                  Submit Support Request
                </button>
              </form>

              <div className="emp-help-support-note">
                <FiClock />
                <span>
                  Typical response time: <strong>1 business day</strong>
                </span>
              </div>
            </aside>
          </section>

          {/* SUBMITTED REQUESTS */}
          {submittedTickets.length > 0 && (
            <section className="emp-help-ticket-history">
              <div className="emp-help-history-heading">
                <div>
                  <span>RECENT ACTIVITY</span>
                  <h2>My Support Requests</h2>
                </div>

                <span>
                  {submittedTickets.length} submitted
                </span>
              </div>

              <div className="emp-help-history-list">
                {submittedTickets.map((ticket) => (
                  <article
                    className="emp-help-history-item"
                    key={ticket.id}
                  >
                    <div className="emp-help-history-file">
                      <FiFileText />
                    </div>

                    <div className="emp-help-history-main">
                      <strong>{ticket.subject}</strong>
                      <p>
                        {ticket.id} · {ticket.category}
                      </p>
                    </div>

                    <span className="emp-help-history-status">
                      {ticket.status}
                    </span>

                    <span className="emp-help-history-date">
                      {ticket.date}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* CONTACT STRIP */}
          <section className="emp-help-contact-panel">
            <div className="emp-help-contact-copy">
              <span>NEED MORE HELP?</span>
              <h2>Contact the HR Support Team</h2>
              <p>
                For sensitive employee matters or requests that require
                HR assistance, use the support channels below.
              </p>
            </div>

            <div className="emp-help-contact-actions">
              <div className="emp-help-contact-item">
                <div>
                  <FiMail />
                </div>
                <span>
                  <small>Email Support</small>
                  <strong>hr@belnova.tech</strong>
                </span>
              </div>

              <div className="emp-help-contact-item">
                <div>
                  <FiPhone />
                </div>
                <span>
                  <small>HR Helpdesk</small>
                  <strong>Business Hours</strong>
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EmployeeHelp;
