import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiLifeBuoy,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSearch,
  FiSend,
  FiShield,
  FiTool,
  FiUserPlus,
  FiX,
  FiAlertCircle,
  FiAlertTriangle,
  FiExternalLink,
  FiInfo,
  FiArrowRight,
  FiHeadphones,
  FiActivity,
  FiHelpCircle,
} from 'react-icons/fi';
import './HRHelpSupport.css';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  count: number;
}

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  icon: React.ElementType;
  sections: { title: string; content: string }[];
}

const BEL_HR_HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Core HRMS administration, configuration and setup.',
    icon: FiBookOpen,
    count: 8,
  },
  {
    id: 'employees',
    title: 'Employee Management',
    description: 'Employee records, onboarding, profiles and lifecycle actions.',
    icon: FiUserPlus,
    count: 12,
  },
  {
    id: 'attendance',
    title: 'Attendance & Biometric',
    description: 'Devices, attendance rules, shift policies and regularization.',
    icon: FiClock,
    count: 10,
  },
  {
    id: 'leave',
    title: 'Leave & Approvals',
    description: 'Leave policies, annual allocations and approval workflows.',
    icon: FiFileText,
    count: 9,
  },
  {
    id: 'payroll',
    title: 'Payroll & Payslips',
    description: 'Salary processing, tax deductions, EPF/ESIC and payslip issues.',
    icon: FiShield,
    count: 11,
  },
  {
    id: 'security',
    title: 'Security & Access',
    description: 'Roles, RBAC permissions, MFA authentication and audit logs.',
    icon: FiTool,
    count: 7,
  },
];

const BEL_HR_FAQS: FaqItem[] = [
  {
    id: 1,
    category: 'employees',
    question: 'How do I add a new employee?',
    answer:
      'Open Employees from the HR Admin navigation, select "Add Employee", complete the mandatory personal, employment, and statutory details, upload required KYC documents, and save the employee profile.',
  },
  {
    id: 2,
    category: 'employees',
    question: "How can I update an employee's department or designation?",
    answer:
      'Open the employee directory, select the employee profile, tap "Edit Employment Details", update the department, designation, or reporting manager, and save. The update is recorded in the system audit log.',
  },
  {
    id: 3,
    category: 'attendance',
    question: 'How do I sync biometric attendance?',
    answer:
      'Go to the Biometric Sync module from the HR Admin dashboard. You can trigger an individual device sync or tap "Sync All Devices" to pull the latest punch records. Real-time logs will show sync status.',
  },
  {
    id: 4,
    category: 'attendance',
    question: 'What should I do when a biometric device is offline?',
    answer:
      'Open Biometric Control Center, inspect the device IP/Port and network heartbeat, and use "Test Connection". If unreachable, verify the device physical ethernet/Wi-Fi connection or raise a priority support ticket.',
  },
  {
    id: 5,
    category: 'leave',
    question: 'How do I approve or reject a leave request?',
    answer:
      'Open Leave Management from the HR Admin menu, navigate to "Pending Approvals", review the employee leave duration and balance, and tap "Approve" or "Reject". Rejections require a clear reason for the employee.',
  },
  {
    id: 6,
    category: 'payroll',
    question: 'How is monthly payroll processed?',
    answer:
      'Select the target payroll cycle under Payroll, review verified attendance logs, verify statutory EPF/ESIC deductions and overtime, click "Run Payroll Calculation", approve the summary, and generate payslips.',
  },
  {
    id: 7,
    category: 'payroll',
    question: 'How can I download an employee payslip?',
    answer:
      'Open the Payroll module, tap "Employee Payslips", select the employee and pay period, then tap "Download PDF Payslip" to download an official stamped PDF copy.',
  },
  {
    id: 8,
    category: 'security',
    question: 'How do I change role permissions?',
    answer:
      'Open Roles & Permissions under System Settings, choose the target role (e.g. HR Admin, Manager, Employee), review granular module permissions (View, Create, Edit, Delete, Approve, Export), and save.',
  },
  {
    id: 9,
    category: 'getting-started',
    question: 'Where can I configure company settings?',
    answer:
      'Open Settings from the HR Admin portal. You can manage Company Profile, Branches, Departments, Designations, Shift Policies, Leave Rules, Payroll Cut-offs, Notifications, and Audit Logs.',
  },
  {
    id: 10,
    category: 'security',
    question: 'Where can I review administrator activity?',
    answer:
      'Navigate to Settings > Audit Logs. You can inspect all recent administrative actions, timestamped events, affected modules, executing user, and download the full audit history as a CSV file.',
  },
];

const BEL_HR_ARTICLES: ArticleItem[] = [
  {
    id: 'article-employee',
    title: 'HR Admin Employee Management Guide',
    description: 'Comprehensive guide to onboarding, updating, role assignment, and lifecycle records.',
    category: 'Employee Management',
    time: '6 min read',
    icon: FiUserPlus,
    sections: [
      {
        title: '1. Adding New Employees',
        content:
          'When onboarding a new employee, ensure all mandatory fields (Full Name, Official Email, Department, Designation, and Joining Date) are filled accurately. Once created, an automated welcome email with login credentials is sent to the employee.',
      },
      {
        title: '2. Role & Reporting Assignment',
        content:
          'Assign the correct Reporting Manager so that leave applications and attendance regularization requests flow through the appropriate approval hierarchy.',
      },
      {
        title: '3. Document Verification',
        content:
          'Upload and verify identity documents (Aadhaar, PAN, Passport) in the Document Vault. Verified documents become part of the employee master file.',
      },
    ],
  },
  {
    id: 'article-payroll',
    title: 'Monthly Payroll Processing Guide',
    description: 'Understand salary calculations, statutory deductions, tax compliance, and distribution.',
    category: 'Payroll',
    time: '8 min read',
    icon: FiShield,
    sections: [
      {
        title: '1. Pre-Payroll Attendance Lock',
        content:
          'Ensure all monthly attendance regularizations and approved leaves are finalized before the payroll cut-off day (28th of each month).',
      },
      {
        title: '2. Statutory Deductions Calculation',
        content:
          'The payroll engine automatically computes EPF (12%), ESIC (0.75%), State Professional Tax, and Income Tax TDS based on declared regimes.',
      },
      {
        title: '3. Final Approval & Payslip Generation',
        content:
          'Review the payroll batch summary. Once authorized by the HR Director, digital payslips are immediately available for download in employee mobile portals.',
      },
    ],
  },
  {
    id: 'article-biometric',
    title: 'Biometric & Attendance Troubleshooting',
    description: 'Resolve hardware connection issues, device sync discrepancies, and offline alerts.',
    category: 'Attendance',
    time: '5 min read',
    icon: FiTool,
    sections: [
      {
        title: '1. Verifying Terminal Connectivity',
        content:
          'Check that biometric device IP addresses are reachable on port 4370. The Biometric Sync dashboard displays real-time heartbeat indicators for all connected devices.',
      },
      {
        title: '2. Handling Offline Devices',
        content:
          'If a device displays "Offline", verify the gateway router and power cycle the terminal. Use "Test Connection" to re-establish the cryptographic handshake.',
      },
      {
        title: '3. Manual Punch Reconciliation',
        content:
          'Employees can submit attendance regularizations with reason explanations if a hardware outage prevents punch registration.',
      },
    ],
  },
  {
    id: 'article-security',
    title: 'Roles, Permissions & Security',
    description: 'Configure RBAC privilege boundaries, two-factor authentication, and security governance.',
    category: 'Security',
    time: '7 min read',
    icon: FiShield,
    sections: [
      {
        title: '1. Role-Based Access Control (RBAC)',
        content:
          'Limit Super Admin privileges strictly to authorized HR Directors. Standard HR staff should be granted scoped module permissions without user-deletion rights.',
      },
      {
        title: '2. Multi-Factor Authentication (MFA)',
        content:
          'MFA is enforced by default for all administrative logins. In emergency access scenarios, use the break-glass review procedure in Settings.',
      },
      {
        title: '3. Audit Trail Review',
        content:
          'Review audit logs weekly to identify unauthorized permission escalations, failed login spikes, or policy changes.',
      },
    ],
  },
];

export const HRHelpSupport: React.FC = () => {
  const { helpTickets = [], updateHelpTicketStatus, addHelpTicket } = useAuth();
  const faqSectionRef = useRef<HTMLDivElement>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  // Modals & Bottom Sheets
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<any | null>(null);
  const [resolveTicketTarget, setResolveTicketTarget] = useState<any | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  // Forms
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Technical Issue',
    priority: 'Normal',
    description: '',
  });
  const [ticketFormErrors, setTicketFormErrors] = useState<Record<string, string>>({});
  const [ticketSuccessInfo, setTicketSuccessInfo] = useState<{ id: string; subject: string } | null>(null);

  const [contactEmailForm, setContactEmailForm] = useState({
    subject: '',
    message: '',
  });

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return BEL_HR_FAQS.filter((item) => {
      const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
      const searchMatch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchTerm]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'All') return helpTickets;
    return helpTickets.filter((t) => t.status === ticketFilter);
  }, [helpTickets, ticketFilter]);

  const ticketStats = useMemo(() => {
    return {
      total: helpTickets.length,
      open: helpTickets.filter((t) => t.status === 'Open').length,
      inProgress: helpTickets.filter((t) => t.status === 'In Progress').length,
      resolved: helpTickets.filter((t) => t.status === 'Resolved').length,
    };
  }, [helpTickets]);

  const scrollToFaqs = () => {
    faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle Ticket Creation
  const handleRaiseTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!ticketForm.subject.trim()) errors.subject = 'Issue subject is required.';
    if (!ticketForm.description.trim()) errors.description = 'Please describe the issue in detail.';

    if (Object.keys(errors).length > 0) {
      setTicketFormErrors(errors);
      return;
    }

    if (addHelpTicket) {
      const created = addHelpTicket({
        category: ticketForm.category,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
      });
      setTicketSuccessInfo({ id: created.id, subject: created.subject });
    } else {
      setTicketSuccessInfo({ id: `TKT-${Date.now().toString().slice(-4)}`, subject: ticketForm.subject });
    }

    showToast('Support ticket raised successfully.', 'success');
  };

  const closeRaiseTicketModal = () => {
    setShowRaiseTicketModal(false);
    setTicketSuccessInfo(null);
    setTicketForm({
      subject: '',
      category: 'Technical Issue',
      priority: 'Normal',
      description: '',
    });
    setTicketFormErrors({});
  };

  // Handle Ticket Resolution (replaces browser prompt)
  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTicketTarget) return;

    const note = resolutionNote.trim() || 'Issue verified and resolved by HR Support Desk.';
    updateHelpTicketStatus(resolveTicketTarget.id, 'Resolved', note);

    if (selectedTicketDetail && selectedTicketDetail.id === resolveTicketTarget.id) {
      setSelectedTicketDetail({ ...selectedTicketDetail, status: 'Resolved', responseNote: note });
    }

    setResolveTicketTarget(null);
    setResolutionNote('');
    showToast(`Ticket #${resolveTicketTarget.id} marked as Resolved.`, 'success');
  };

  // Handle Moving to In Progress
  const handleMarkInProgress = (ticket: any) => {
    updateHelpTicketStatus(ticket.id, 'In Progress', ticket.responseNote || 'Investigating issue');
    if (selectedTicketDetail && selectedTicketDetail.id === ticket.id) {
      setSelectedTicketDetail({ ...selectedTicketDetail, status: 'In Progress' });
    }
    showToast(`Ticket #${ticket.id} moved to In Progress.`, 'info');
  };

  // Handle Email Draft Send
  const handleSendEmailSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmailForm.message.trim()) {
      showToast('Please enter your message for support desk.', 'error');
      return;
    }

    const subject = encodeURIComponent(contactEmailForm.subject || 'BELNOVA HRMS Support Request');
    const body = encodeURIComponent(contactEmailForm.message);
    window.location.href = `mailto:support@belnova.com?subject=${subject}&body=${body}`;

    setShowEmailModal(false);
    setContactEmailForm({ subject: '', message: '' });
    showToast('Opening your default email application...', 'info');
  };

  return (
    <div className="app-container bel-help-app-shell">
      <AppHeader title="Help & Support" showBack />

      <main className="page-content bel-help-main-content">
        {/* HERO SEARCH & WELCOME BANNER */}
        <section className="bel-help-welcome-card">
          <div className="bel-welcome-badge">
            <span className="bel-status-dot pulse" />
            <span>BELNOVA HRMS SERVICE DESK</span>
          </div>

          <h1>Hi, how can we help?</h1>
          <p>Find instant answers, browse administrator guides, or contact technical support.</p>

          <div className="bel-help-search-wrapper">
            <FiSearch className="bel-search-icon" />
            <input
              type="search"
              placeholder="Search employees, payroll, attendance, settings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveCategory('all');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') scrollToFaqs();
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="bel-search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
            <button
              type="button"
              className="bel-search-action-btn"
              onClick={scrollToFaqs}
            >
              Search
            </button>
          </div>

          {/* Popular Keywords Bar */}
          <div className="bel-popular-topics-row">
            <span>Popular:</span>
            {[
              ['Payroll', 'payroll'],
              ['Biometric', 'attendance'],
              ['Leave', 'leave'],
              ['Permissions', 'security'],
              ['Onboarding', 'employees'],
            ].map(([label, catKey]) => (
              <button
                key={catKey}
                type="button"
                className="bel-topic-chip"
                onClick={() => {
                  setActiveCategory(catKey);
                  setSearchTerm('');
                  scrollToFaqs();
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* QUICK ACTION TILES */}
        <section className="bel-help-quick-actions">
          <button
            type="button"
            className="bel-quick-tile"
            onClick={() => setShowRaiseTicketModal(true)}
          >
            <div className="bel-quick-icon-box ticket">
              <FiSend />
            </div>
            <div className="bel-quick-tile-copy">
              <strong>Raise Ticket</strong>
              <span>Submit a support request</span>
            </div>
          </button>

          <button
            type="button"
            className="bel-quick-tile"
            onClick={() => setShowEmailModal(true)}
          >
            <div className="bel-quick-icon-box email">
              <FiMail />
            </div>
            <div className="bel-quick-tile-copy">
              <strong>Email Support</strong>
              <span>support@belnova.com</span>
            </div>
          </button>

          <button
            type="button"
            className="bel-quick-tile"
            onClick={() => setShowStatusModal(true)}
          >
            <div className="bel-quick-icon-box status">
              <FiActivity />
            </div>
            <div className="bel-quick-tile-copy">
              <strong>System Status</strong>
              <span>100% All Systems Live</span>
            </div>
          </button>

          <button
            type="button"
            className="bel-quick-tile"
            onClick={scrollToFaqs}
          >
            <div className="bel-quick-icon-box faq">
              <FiHelpCircle />
            </div>
            <div className="bel-quick-tile-copy">
              <strong>Browse FAQs</strong>
              <span>{BEL_HR_FAQS.length} Quick Answers</span>
            </div>
          </button>
        </section>

        {/* BROWSE BY HRMS AREA / KNOWLEDGE BASE CATEGORIES */}
        <section className="bel-help-section">
          <div className="bel-section-header">
            <div>
              <span className="bel-eyebrow">KNOWLEDGE BASE</span>
              <h2>Browse Help Topics</h2>
            </div>
            <span className="bel-topic-count">6 Core Areas</span>
          </div>

          <div className="bel-category-cards-grid">
            {BEL_HR_HELP_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`bel-category-card ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchTerm('');
                    scrollToFaqs();
                  }}
                >
                  <div className="bel-cat-card-icon">
                    <IconComp />
                  </div>
                  <div className="bel-cat-card-content">
                    <h4>{cat.title}</h4>
                    <p>{cat.description}</p>
                  </div>
                  <div className="bel-cat-card-meta">
                    <span className="bel-cat-article-pill">{cat.count} articles</span>
                    <FiChevronRight className="bel-cat-arrow" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* EMPLOYEE SUPPORT REQUESTS (HR ADMIN MANAGEMENT) */}
        <section className="bel-help-section">
          <div className="bel-section-header">
            <div>
              <span className="bel-eyebrow">EMPLOYEE DESK</span>
              <h2>Support Requests ({ticketStats.total})</h2>
            </div>
            <button
              type="button"
              className="bel-raise-action-btn"
              onClick={() => setShowRaiseTicketModal(true)}
            >
              <FiSend /> New Request
            </button>
          </div>

          {/* Ticket Filter Pills */}
          <div className="bel-ticket-filter-bar">
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((filter) => {
              const count =
                filter === 'All'
                  ? ticketStats.total
                  : filter === 'Open'
                  ? ticketStats.open
                  : filter === 'In Progress'
                  ? ticketStats.inProgress
                  : ticketStats.resolved;

              return (
                <button
                  key={filter}
                  type="button"
                  className={`bel-ticket-filter-chip ${ticketFilter === filter ? 'active' : ''}`}
                  onClick={() => setTicketFilter(filter)}
                >
                  {filter} <span>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Ticket Mobile Cards */}
          <div className="bel-tickets-container">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bel-ticket-card">
                <div className="bel-ticket-card-header">
                  <div className="bel-ticket-id-tag">
                    <strong>#{ticket.id}</strong>
                    <span className="bel-ticket-cat-badge">{ticket.category}</span>
                  </div>
                  <span
                    className={`bel-ticket-status-pill ${
                      ticket.status === 'Resolved'
                        ? 'resolved'
                        : ticket.status === 'In Progress'
                        ? 'in-progress'
                        : 'open'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <h4 className="bel-ticket-subject">{ticket.subject}</h4>
                <p className="bel-ticket-description">{ticket.description}</p>

                <div className="bel-ticket-meta-info">
                  <span>
                    <FiUserPlus /> {ticket.employeeName} ({ticket.employeeId})
                  </span>
                  <span>
                    <FiClock /> {ticket.date}
                  </span>
                </div>

                {ticket.responseNote && (
                  <div className="bel-ticket-response-preview">
                    <FiCheckCircle />
                    <div>
                      <strong>HR Note:</strong> {ticket.responseNote}
                    </div>
                  </div>
                )}

                <div className="bel-ticket-action-bar">
                  <button
                    type="button"
                    className="bel-ticket-btn outline"
                    onClick={() => setSelectedTicketDetail(ticket)}
                  >
                    <FiInfo /> View Details
                  </button>

                  {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && (
                    <button
                      type="button"
                      className="bel-ticket-btn progress-btn"
                      onClick={() => handleMarkInProgress(ticket)}
                    >
                      In Progress
                    </button>
                  )}

                  {ticket.status !== 'Resolved' && (
                    <button
                      type="button"
                      className="bel-ticket-btn resolve-btn"
                      onClick={() => {
                        setResolveTicketTarget(ticket);
                        setResolutionNote('');
                      }}
                    >
                      <FiCheck /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="bel-empty-tickets-card">
                <FiCheckCircle />
                <h4>No tickets in "{ticketFilter}" status</h4>
                <p>All employee support requests are currently up to date.</p>
              </div>
            )}
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        <section ref={faqSectionRef} className="bel-help-section" id="bel-faq-section">
          <div className="bel-section-header">
            <div>
              <span className="bel-eyebrow">QUICK SOLUTIONS</span>
              <h2>Frequently Asked Questions</h2>
            </div>
            <span className="bel-faq-results-badge">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="bel-faq-category-pills">
            <button
              type="button"
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              All Topics
            </button>
            {BEL_HR_HELP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={activeCategory === cat.id ? 'active' : ''}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="bel-faq-accordion-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className={`bel-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="bel-faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <FiChevronDown className="bel-faq-chevron" />
                  </button>
                  {isOpen && (
                    <div className="bel-faq-answer-panel">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="bel-faq-empty-state">
                <FiSearch />
                <h3>No matching help questions</h3>
                <p>Try searching for a different keyword or clear your filters.</p>
                <button
                  type="button"
                  className="bel-btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RECOMMENDED ADMIN GUIDES */}
        <section className="bel-help-section">
          <div className="bel-section-header">
            <div>
              <span className="bel-eyebrow">DOCUMENTATION</span>
              <h2>Recommended Guides</h2>
            </div>
          </div>

          <div className="bel-articles-grid">
            {BEL_HR_ARTICLES.map((article) => {
              const IconComp = article.icon;
              return (
                <div
                  key={article.id}
                  className="bel-article-card"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="bel-article-icon-box">
                    <IconComp />
                  </div>
                  <div className="bel-article-card-body">
                    <span className="bel-article-category">{article.category}</span>
                    <h4>{article.title}</h4>
                    <p>{article.description}</p>
                  </div>
                  <div className="bel-article-footer">
                    <span>
                      <FiClock /> {article.time}
                    </span>
                    <span className="bel-read-guide-link">
                      Read Guide <FiChevronRight />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* DIRECT SUPPORT CONTACT & EMERGENCY OUTAGE BANNER */}
        <section className="bel-emergency-outage-card">
          <div className="bel-emergency-top">
            <div className="bel-emergency-icon">
              <FiAlertTriangle />
            </div>
            <div className="bel-emergency-copy">
              <span className="bel-emergency-badge">CRITICAL INCIDENT HOTLINE</span>
              <h3>Facing a Production or Payroll Outage?</h3>
              <p>For urgent system-level issues, connect directly with our dedicated enterprise support team.</p>
            </div>
          </div>

          <div className="bel-emergency-actions">
            <a href="tel:18001234567" className="bel-emergency-call-btn">
              <FiPhone /> Call 1800-123-4567
            </a>
            <button
              type="button"
              className="bel-emergency-ticket-btn"
              onClick={() => {
                setTicketForm({
                  subject: 'CRITICAL SYSTEM OUTAGE',
                  category: 'Technical Issue',
                  priority: 'Critical',
                  description: 'URGENT: Production system or payroll outage requiring immediate escalation.',
                });
                setShowRaiseTicketModal(true);
              }}
            >
              <FiSend /> Escalate Ticket
            </button>
          </div>
        </section>

        {/* SUPPORT DESK INFO FOOTER */}
        <section className="bel-support-desk-card">
          <div className="bel-desk-info-row">
            <div className="bel-desk-info-item">
              <FiMail />
              <div>
                <strong>Support Email</strong>
                <a href="mailto:support@belnova.com">support@belnova.com</a>
              </div>
            </div>
            <div className="bel-desk-info-item">
              <FiPhone />
              <div>
                <strong>Toll-Free Hotline</strong>
                <a href="tel:18001234567">1800-123-4567</a>
              </div>
            </div>
            <div className="bel-desk-info-item">
              <FiClock />
              <div>
                <strong>Working Hours</strong>
                <span>Mon - Fri · 9:00 AM - 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          MODALS & BOTTOM SHEETS
         ========================================================================= */}

      {/* 1. Raise Support Ticket Modal */}
      {showRaiseTicketModal && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeRaiseTicketModal()}
        >
          <div className="bel-help-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Raise a Support Ticket</h3>
                <p>Provide details for technical or administrative assistance</p>
              </div>
              <button type="button" className="bel-modal-close-btn" onClick={closeRaiseTicketModal}>
                <FiX />
              </button>
            </div>

            {!ticketSuccessInfo ? (
              <form onSubmit={handleRaiseTicketSubmit} className="bel-modal-form">
                <div className="bel-form-group">
                  <label>Issue Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g. Biometric device not syncing morning punches"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  />
                  {ticketFormErrors.subject && (
                    <span className="bel-field-error">{ticketFormErrors.subject}</span>
                  )}
                </div>

                <div className="bel-form-row-2">
                  <div className="bel-form-group">
                    <label>Category *</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Employee Management">Employee Management</option>
                      <option value="Attendance & Biometric">Attendance & Biometric</option>
                      <option value="Leave & Approvals">Leave & Approvals</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Security & Access">Security & Access</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="bel-form-group">
                    <label>Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="bel-form-group">
                  <label>Issue Description *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what happened, error codes observed, affected employees or devices..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  />
                  {ticketFormErrors.description && (
                    <span className="bel-field-error">{ticketFormErrors.description}</span>
                  )}
                </div>

                <div className="bel-modal-info-note">
                  <FiShield />
                  <span>Security Reminder: Do not include sensitive employee passwords or confidential banking PINs.</span>
                </div>

                <div className="bel-modal-actions">
                  <button type="button" className="bel-btn-secondary" onClick={closeRaiseTicketModal}>
                    Cancel
                  </button>
                  <button type="submit" className="bel-btn-primary">
                    <FiSend /> Submit Ticket
                  </button>
                </div>
              </form>
            ) : (
              <div className="bel-ticket-success-view">
                <div className="bel-success-icon-circle">
                  <FiCheck />
                </div>
                <h3>Support Request Submitted!</h3>
                <p>
                  Your ticket <strong>#{ticketSuccessInfo.id}</strong> has been logged in the HR support queue. Our technical operations desk will investigate immediately.
                </p>
                <div className="bel-modal-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
                  <button type="button" className="bel-btn-primary" onClick={closeRaiseTicketModal}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Resolve Ticket Modal (replaces browser prompt) */}
      {resolveTicketTarget && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setResolveTicketTarget(null)}
        >
          <div className="bel-help-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Resolve Ticket #{resolveTicketTarget.id}</h3>
                <p>Add resolution explanation for {resolveTicketTarget.employeeName}</p>
              </div>
              <button
                type="button"
                className="bel-modal-close-btn"
                onClick={() => setResolveTicketTarget(null)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleConfirmResolution} className="bel-modal-form">
              <div className="bel-ticket-summary-box">
                <strong>Subject: {resolveTicketTarget.subject}</strong>
                <p>{resolveTicketTarget.description}</p>
              </div>

              <div className="bel-form-group">
                <label>HR Resolution Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain how the issue was resolved (e.g. Biometric device rebooted and punch sync completed successfully)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              <div className="bel-modal-actions">
                <button
                  type="button"
                  className="bel-btn-secondary"
                  onClick={() => setResolveTicketTarget(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="bel-btn-primary success-btn">
                  <FiCheck /> Complete & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Ticket Detail Bottom Sheet */}
      {selectedTicketDetail && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setSelectedTicketDetail(null)}
        >
          <div className="bel-help-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Ticket Details #{selectedTicketDetail.id}</h3>
                <span className="bel-ticket-cat-badge">{selectedTicketDetail.category}</span>
              </div>
              <button
                type="button"
                className="bel-modal-close-btn"
                onClick={() => setSelectedTicketDetail(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="bel-ticket-detail-body">
              <div className="bel-ticket-detail-status-row">
                <span className="bel-detail-label">Current Status</span>
                <span
                  className={`bel-ticket-status-pill ${
                    selectedTicketDetail.status === 'Resolved'
                      ? 'resolved'
                      : selectedTicketDetail.status === 'In Progress'
                      ? 'in-progress'
                      : 'open'
                  }`}
                >
                  {selectedTicketDetail.status}
                </span>
              </div>

              <div className="bel-detail-info-block">
                <h4>{selectedTicketDetail.subject}</h4>
                <p>{selectedTicketDetail.description}</p>
              </div>

              <div className="bel-detail-grid">
                <div>
                  <span>Submitted By</span>
                  <strong>{selectedTicketDetail.employeeName} ({selectedTicketDetail.employeeId})</strong>
                </div>
                <div>
                  <span>Submission Date</span>
                  <strong>{selectedTicketDetail.date}</strong>
                </div>
              </div>

              {selectedTicketDetail.responseNote && (
                <div className="bel-detail-response-box">
                  <strong>Resolution Response:</strong>
                  <p>{selectedTicketDetail.responseNote}</p>
                </div>
              )}
            </div>

            <div className="bel-modal-actions">
              {selectedTicketDetail.status !== 'In Progress' && selectedTicketDetail.status !== 'Resolved' && (
                <button
                  type="button"
                  className="bel-btn-secondary"
                  onClick={() => handleMarkInProgress(selectedTicketDetail)}
                >
                  Mark In Progress
                </button>
              )}
              {selectedTicketDetail.status !== 'Resolved' && (
                <button
                  type="button"
                  className="bel-btn-primary"
                  onClick={() => {
                    setResolveTicketTarget(selectedTicketDetail);
                    setResolutionNote('');
                  }}
                >
                  <FiCheck /> Resolve Ticket
                </button>
              )}
              <button
                type="button"
                className="bel-btn-secondary"
                onClick={() => setSelectedTicketDetail(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. In-App Article Reader Modal */}
      {selectedArticle && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setSelectedArticle(null)}
        >
          <div className="bel-help-modal-card article-reader-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <span className="bel-article-category">{selectedArticle.category}</span>
                <h3>{selectedArticle.title}</h3>
                <p><FiClock /> {selectedArticle.time} read time</p>
              </div>
              <button
                type="button"
                className="bel-modal-close-btn"
                onClick={() => setSelectedArticle(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="bel-article-reader-content">
              {selectedArticle.sections.map((sec, idx) => (
                <div key={idx} className="bel-article-section-block">
                  <h4>{sec.title}</h4>
                  <p>{sec.content}</p>
                </div>
              ))}

              <div className="bel-article-help-box">
                <FiHelpCircle />
                <div>
                  <strong>Still have questions?</strong>
                  <p>Our HR Operations team is available to help resolve any specific edge cases.</p>
                </div>
              </div>
            </div>

            <div className="bel-modal-actions">
              <button
                type="button"
                className="bel-btn-primary"
                onClick={() => setSelectedArticle(null)}
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Email Support Modal */}
      {showEmailModal && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowEmailModal(false)}
        >
          <div className="bel-help-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Email Support Desk</h3>
                <p>Send a message directly to support@belnova.com</p>
              </div>
              <button
                type="button"
                className="bel-modal-close-btn"
                onClick={() => setShowEmailModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSendEmailSupport} className="bel-modal-form">
              <div className="bel-desk-contact-pill">
                <FiMail />
                <div>
                  <strong>support@belnova.com</strong>
                  <span>Mon - Fri · 9:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div className="bel-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding September Tax Reports"
                  value={contactEmailForm.subject}
                  onChange={(e) => setContactEmailForm({ ...contactEmailForm, subject: e.target.value })}
                />
              </div>

              <div className="bel-form-group">
                <label>Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message for the support engineering desk..."
                  value={contactEmailForm.message}
                  onChange={(e) => setContactEmailForm({ ...contactEmailForm, message: e.target.value })}
                />
              </div>

              <div className="bel-modal-actions">
                <button
                  type="button"
                  className="bel-btn-secondary"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bel-btn-primary">
                  <FiExternalLink /> Open Email Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. System Status Modal */}
      {showStatusModal && (
        <div
          className="bel-help-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowStatusModal(false)}
        >
          <div className="bel-help-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>HRMS Platform Status</h3>
                <p>Real-time infrastructure and service health check</p>
              </div>
              <button
                type="button"
                className="bel-modal-close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="bel-system-status-body">
              <div className="bel-status-overall-banner">
                <div className="bel-status-dot pulse" />
                <div>
                  <strong>All Systems Operational</strong>
                  <span>99.98% platform uptime over the last 90 days</span>
                </div>
              </div>

              <div className="bel-service-status-list">
                {[
                  { name: 'Core HRMS API & Database', status: 'Operational', latency: '42ms' },
                  { name: 'Biometric Attendance Sync Gateway', status: 'Operational', latency: '68ms' },
                  { name: 'Payroll Computation Engine', status: 'Operational', latency: '54ms' },
                  { name: 'Document Storage Vault', status: 'Operational', latency: '35ms' },
                  { name: 'Email & Push Notification Service', status: 'Operational', latency: '40ms' },
                ].map((svc, i) => (
                  <div key={i} className="bel-service-status-row">
                    <div>
                      <strong>{svc.name}</strong>
                      <span>Response time: {svc.latency}</span>
                    </div>
                    <span className="bel-status-badge-live">
                      <FiCheckCircle /> {svc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bel-modal-actions">
              <button
                type="button"
                className="bel-btn-primary"
                onClick={() => setShowStatusModal(false)}
              >
                Close Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`bel-help-toast ${toast.type}`}>
          {toast.type === 'success' && <FiCheckCircle />}
          {toast.type === 'error' && <FiAlertCircle />}
          {toast.type === 'info' && <FiInfo />}
          <span>{toast.message}</span>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
