import React, { useMemo, useState } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { downloadPayslipPdf } from '../../utils/pdfGenerator';
import {
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiFileText,
  FiPlay,
  FiUsers,
  FiX,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiLayers,
} from 'react-icons/fi';
import './HRPayroll.css';

interface EmployeeRaw {
  id: string;
  name: string;
  department: string;
  initials: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  avatarBg?: string;
}

const EMPLOYEES: EmployeeRaw[] = [
  {
    id: 'EMP1001',
    name: 'Rahul Kumar',
    department: 'Engineering',
    initials: 'RK',
    basic: 35000,
    hra: 14000,
    allowances: 8000,
    deductions: 6500,
    avatarBg: '#2F6FED',
  },
  {
    id: 'EMP1002',
    name: 'Priya Sharma',
    department: 'HR',
    initials: 'PS',
    basic: 28000,
    hra: 11200,
    allowances: 6000,
    deductions: 5160,
    avatarBg: '#D946EF',
  },
  {
    id: 'EMP1003',
    name: 'Arjun Reddy',
    department: 'Engineering',
    initials: 'AR',
    basic: 55000,
    hra: 22000,
    allowances: 12000,
    deductions: 12100,
    avatarBg: '#F59E0B',
  },
  {
    id: 'EMP1004',
    name: 'Sneha Rao',
    department: 'HR',
    initials: 'SR',
    basic: 40000,
    hra: 16000,
    allowances: 9000,
    deductions: 8000,
    avatarBg: '#10B981',
  },
  {
    id: 'EMP1005',
    name: 'Vikram Singh',
    department: 'Operations',
    initials: 'VS',
    basic: 80000,
    hra: 32000,
    allowances: 18000,
    deductions: 19400,
    avatarBg: '#8B5CF6',
  },
];

const PROCESS_STEPS = [
  'Select Month',
  'Fetch Attendance',
  'Calculate Salary',
  'Review',
  'Approve',
  'Process',
  'Generate Payslip',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getCurrentPayrollMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

function monthToKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function formatMonth(year: number, month: number) {
  return `${MONTH_NAMES[month]} ${year}`;
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function calculateEmployee(employee: EmployeeRaw, year: number, month: number) {
  const monthDays = getMonthDays(year, month);

  const workingDays = Math.max(20, Math.min(23, monthDays - 8));
  const paidDays = monthDays >= 31 ? 30 : monthDays - 1;

  const proratedBasic = Math.round((employee.basic / 30) * Math.min(paidDays, 30));
  const proratedHra = Math.round((employee.hra / 30) * Math.min(paidDays, 30));
  const proratedAllowances = Math.round((employee.allowances / 30) * Math.min(paidDays, 30));

  const gross = proratedBasic + proratedHra + proratedAllowances;
  const deductions = Math.round(employee.deductions * (Math.min(paidDays, 30) / 30));
  const net = gross - deductions;

  return {
    ...employee,
    monthDays,
    workingDays,
    paidDays,
    basicPay: proratedBasic,
    hraPay: proratedHra,
    allowancePay: proratedAllowances,
    gross,
    deductions,
    net,
  };
}

function formatINR(value: number, compact = false) {
  if (compact) {
    if (Math.abs(value) >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    }
    if (Math.abs(value) >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function escapeCsv(value: any) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: any[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const HRPayroll: React.FC = () => {
  const currentMonth = getCurrentPayrollMonth();

  const [selectedYear, setSelectedYear] = useState(currentMonth.year);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.month);
  const [activeTab, setActiveTab] = useState<'employees' | 'processing' | 'analytics'>('employees');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP1001');
  const [processedEmployees, setProcessedEmployees] = useState<Record<string, boolean>>({});
  const [processStep, setProcessStep] = useState(0);
  const [modal, setModal] = useState<'payslip' | 'monthPicker' | null>(null);

  // Search in employees
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const payrollMonth = formatMonth(selectedYear, selectedMonth);
  const payrollKey = monthToKey(selectedYear, selectedMonth);

  const employeePayroll = useMemo(
    () => EMPLOYEES.map((employee) => calculateEmployee(employee, selectedYear, selectedMonth)),
    [selectedYear, selectedMonth]
  );

  const filteredEmployees = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return employeePayroll;
    return employeePayroll.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.id.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term)
    );
  }, [employeePayroll, searchQuery]);

  const selectedEmployee = employeePayroll.find((employee) => employee.id === selectedEmployeeId);

  const monthTotalGross = employeePayroll.reduce((sum, employee) => sum + employee.gross, 0);
  const monthTotalDeductions = employeePayroll.reduce((sum, employee) => sum + employee.deductions, 0);
  const monthTotalNet = employeePayroll.reduce((sum, employee) => sum + employee.net, 0);

  const monthProcessedCount = employeePayroll.filter(
    (employee) => processedEmployees[`${payrollKey}-${employee.id}`]
  ).length;

  const previousMonths = useMemo(() => {
    const values = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      values.push({
        label: MONTH_NAMES[date.getMonth()].slice(0, 3),
        year: date.getFullYear(),
        month: date.getMonth(),
        value: calculateEmployee(EMPLOYEES[0], date.getFullYear(), date.getMonth()).gross,
      });
    }
    return values;
  }, [selectedYear, selectedMonth]);

  const closeModal = () => setModal(null);

  const changeMonth = (direction: number) => {
    const date = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedYear(date.getFullYear());
    setSelectedMonth(date.getMonth());
    setProcessStep(0);
    showToast(`Switched to ${formatMonth(date.getFullYear(), date.getMonth())}`, 'info');
  };

  const selectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const runPayroll = () => {
    if (!selectedEmployee) {
      showToast('Please select an employee before running payroll.', 'error');
      return;
    }

    setProcessedEmployees((current) => ({
      ...current,
      [`${payrollKey}-${selectedEmployee.id}`]: true,
    }));

    setProcessStep((current) => Math.max(current, 2));
    setActiveTab('processing');
    showToast(`Payroll started for ${selectedEmployee.name}`, 'success');
  };

  const moveProcessStep = (direction: number) => {
    if (!selectedEmployee) {
      showToast('Please select an employee first.', 'error');
      return;
    }

    setProcessStep((current) => Math.max(0, Math.min(PROCESS_STEPS.length - 1, current + direction)));
  };

  const generatePayslip = () => {
    if (!selectedEmployee) {
      showToast('Select an employee first.', 'error');
      return;
    }

    setProcessedEmployees((current) => ({
      ...current,
      [`${payrollKey}-${selectedEmployee.id}`]: true,
    }));

    setProcessStep(PROCESS_STEPS.length - 1);
    setModal('payslip');
    showToast(`Payslip generated for ${selectedEmployee.name}`, 'success');
  };

  const exportMonthSummary = () => {
    const headers = [
      'Employee ID',
      'Employee',
      'Department',
      'Payroll Month',
      'Basic',
      'HRA',
      'Allowances',
      'Gross',
      'Deductions',
      'Net Salary',
      'Status',
    ];

    const rows = employeePayroll.map((employee) => [
      employee.id,
      employee.name,
      employee.department,
      payrollMonth,
      formatINR(employee.basicPay),
      formatINR(employee.hraPay),
      formatINR(employee.allowancePay),
      formatINR(employee.gross),
      formatINR(employee.deductions),
      formatINR(employee.net),
      processedEmployees[`${payrollKey}-${employee.id}`] ? 'Processed' : 'Pending',
    ]);

    const filename = `payroll-${MONTH_NAMES[selectedMonth].toLowerCase()}-${selectedYear}.csv`;
    downloadCsv(filename, headers, rows);
    showToast(`Downloaded ${filename}`, 'success');
  };

  const exportSelectedPayslip = () => {
    if (!selectedEmployee) {
      showToast('Please select an employee first.', 'error');
      return;
    }

    try {
      const slip = {
        month: payrollMonth,
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.id,
        designation: selectedEmployee.department ? `${selectedEmployee.department} Specialist` : 'Software Engineer',
        grossSalary: formatINR(selectedEmployee.gross),
        deductions: formatINR(selectedEmployee.deductions),
        netSalary: formatINR(selectedEmployee.net),
        payPeriod: MONTH_NAMES[selectedMonth],
        payDate: `05/${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`,
        paidDays: selectedEmployee.paidDays || 30,
      };

      downloadPayslipPdf(slip, selectedEmployee);
      showToast(`Payslip PDF downloaded for ${selectedEmployee.name}`, 'success');
    } catch (err) {
      showToast('Unable to download payslip. Please try again.', 'error');
    }
  };

  const processSelectedEmployee = () => {
    if (!selectedEmployee) {
      showToast('Select an employee before processing payroll.', 'error');
      return;
    }

    setProcessedEmployees((current) => ({
      ...current,
      [`${payrollKey}-${selectedEmployee.id}`]: true,
    }));
    setProcessStep(PROCESS_STEPS.length - 2);
    showToast(`Payroll processed for ${selectedEmployee.name}`, 'success');
  };

  return (
    <div className="bel-payroll-page-container">
      {/* Top Application Header */}
      <AppHeader title="Payroll & Compensation" showBack={false} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`bel-payroll-toast bel-payroll-toast--${toastType}`} role="alert">
          {toastType === 'success' && <FiCheckCircle className="bel-payroll-toast-icon" />}
          {toastType === 'error' && <FiAlertCircle className="bel-payroll-toast-icon" />}
          {toastType === 'info' && <FiCalendar className="bel-payroll-toast-icon" />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bel-payroll-scroll-content">
        {/* Mobile Header Banner */}
        <div className="bel-payroll-hero-header">
          <div className="bel-payroll-hero-text">
            <h1 className="bel-payroll-title">Payroll Management</h1>
            <p className="bel-payroll-subtitle">{payrollMonth} payroll cycle</p>
          </div>

          <div className="bel-payroll-header-actions">
            <button
              type="button"
              className="bel-payroll-btn-export"
              onClick={exportMonthSummary}
              aria-label="Export monthly summary CSV"
              title="Export CSV"
            >
              <FiDownload />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="bel-payroll-btn-run"
              onClick={runPayroll}
              aria-label="Run Payroll"
            >
              <FiPlay />
              <span>Run Payroll</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="bel-payroll-month-bar">
          <button
            type="button"
            className="bel-payroll-month-nav"
            onClick={() => changeMonth(-1)}
            aria-label="Previous Month"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className="bel-payroll-month-selector"
            onClick={() => setModal('monthPicker')}
            aria-label="Select Payroll Month"
          >
            <FiCalendar />
            <span>{payrollMonth}</span>
          </button>

          <button
            type="button"
            className="bel-payroll-month-nav"
            onClick={() => changeMonth(1)}
            aria-label="Next Month"
          >
            <FiChevronRight />
          </button>
        </div>

        {/* Dynamic Payroll KPI Stats */}
        <section className="bel-payroll-stats-grid" aria-label="Payroll Summary Metrics">
          <div className="bel-payroll-stat-card bel-payroll-stat-card--gross">
            <span className="bel-payroll-stat-label">Total Gross</span>
            <strong className="bel-payroll-stat-value">{formatINR(monthTotalGross, true)}</strong>
            <div className="bel-payroll-stat-bar bel-payroll-stat-bar--gross" />
          </div>

          <div className="bel-payroll-stat-card bel-payroll-stat-card--deductions">
            <span className="bel-payroll-stat-label">Deductions</span>
            <strong className="bel-payroll-stat-value">{formatINR(monthTotalDeductions, true)}</strong>
            <div className="bel-payroll-stat-bar bel-payroll-stat-bar--deductions" />
          </div>

          <div className="bel-payroll-stat-card bel-payroll-stat-card--net">
            <span className="bel-payroll-stat-label">Net Payroll</span>
            <strong className="bel-payroll-stat-value">{formatINR(monthTotalNet, true)}</strong>
            <div className="bel-payroll-stat-bar bel-payroll-stat-bar--net" />
          </div>

          <div className="bel-payroll-stat-card bel-payroll-stat-card--paid">
            <span className="bel-payroll-stat-label">Employees Paid</span>
            <strong className="bel-payroll-stat-value">{monthProcessedCount} / {EMPLOYEES.length}</strong>
            <div className="bel-payroll-stat-bar bel-payroll-stat-bar--paid" />
          </div>
        </section>

        {/* Mobile Segmented Navigation */}
        <div className="bel-payroll-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'employees'}
            className={`bel-payroll-tab-btn ${activeTab === 'employees' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <span>Employees</span>
            <span className="bel-payroll-tab-count">{EMPLOYEES.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'processing'}
            className={`bel-payroll-tab-btn ${activeTab === 'processing' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('processing')}
          >
            <span>Processing</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analytics'}
            className={`bel-payroll-tab-btn ${activeTab === 'analytics' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span>Analytics</span>
          </button>
        </div>

        {/* =========================================================
            TAB 1: EMPLOYEE PAYROLL CARDS
            ========================================================= */}
        {activeTab === 'employees' && (
          <section className="bel-payroll-employees-section">
            {/* Search Input */}
            <div className="bel-payroll-search-wrap">
              <input
                type="search"
                className="bel-payroll-search-input"
                placeholder="Search employee, ID or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search employees"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="bel-payroll-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Employee Cards List */}
            {filteredEmployees.length === 0 ? (
              <div className="bel-payroll-empty-box">
                <FiAlertCircle />
                <h3>No employees found</h3>
                <p>Try searching with another name or ID.</p>
              </div>
            ) : (
              <div className="bel-payroll-cards-list">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.id;
                  const isProcessed = processedEmployees[`${payrollKey}-${emp.id}`];

                  return (
                    <article
                      key={emp.id}
                      className={`bel-payroll-emp-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => selectEmployee(emp.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      {/* Card Header */}
                      <div className="bel-payroll-card-header">
                        <div className="bel-payroll-card-emp-info">
                          <span
                            className="bel-payroll-card-avatar"
                            style={{ backgroundColor: emp.avatarBg || '#2F6FED' }}
                          >
                            {emp.initials}
                          </span>
                          <div>
                            <strong className="bel-payroll-emp-name">{emp.name}</strong>
                            <span className="bel-payroll-emp-dept">
                              {emp.department} · {emp.id}
                            </span>
                          </div>
                        </div>

                        <div className="bel-payroll-card-status-wrap">
                          <span
                            className={`bel-payroll-status-pill ${
                              isProcessed
                                ? 'bel-payroll-status-pill--processed'
                                : 'bel-payroll-status-pill--pending'
                            }`}
                          >
                            {isProcessed ? <FiCheckCircle /> : <span className="bel-payroll-dot" />}
                            {isProcessed ? 'Processed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Salary Breakdown 2x2 Grid */}
                      <div className="bel-payroll-breakdown-grid">
                        <div className="bel-payroll-breakdown-cell">
                          <small>Basic Pay</small>
                          <strong>{formatINR(emp.basicPay)}</strong>
                        </div>
                        <div className="bel-payroll-breakdown-cell">
                          <small>HRA</small>
                          <strong>{formatINR(emp.hraPay)}</strong>
                        </div>
                        <div className="bel-payroll-breakdown-cell">
                          <small>Allowances</small>
                          <strong>{formatINR(emp.allowancePay)}</strong>
                        </div>
                        <div className="bel-payroll-breakdown-cell bel-payroll-cell--gross">
                          <small>Gross Salary</small>
                          <strong>{formatINR(emp.gross)}</strong>
                        </div>
                      </div>

                      {/* Net Salary Summary Line */}
                      <div className="bel-payroll-net-row">
                        <div className="bel-payroll-deduction-meta">
                          <span>Deductions:</span>
                          <strong className="bel-payroll-deduction-val">-{formatINR(emp.deductions)}</strong>
                        </div>
                        <div className="bel-payroll-net-meta">
                          <span>Net Salary:</span>
                          <strong className="bel-payroll-net-val">{formatINR(emp.net)}</strong>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="bel-payroll-card-actions">
                        <button
                          type="button"
                          className="bel-payroll-btn-view-slip"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectEmployee(emp.id);
                            setModal('payslip');
                          }}
                          aria-label={`View payslip for ${emp.name}`}
                        >
                          <FiEye />
                          <span>View Payslip</span>
                        </button>

                        <button
                          type="button"
                          className={`bel-payroll-btn-select-card ${isSelected ? 'is-active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectEmployee(emp.id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <FiCheck />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select</span>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Sticky Selected Employee Action Panel */}
            {selectedEmployee && (
              <div className="bel-payroll-floating-panel">
                <div className="bel-payroll-panel-meta">
                  <FiUsers className="bel-payroll-panel-icon" />
                  <div>
                    <small>Selected Employee</small>
                    <strong>{selectedEmployee.name} ({selectedEmployee.id})</strong>
                  </div>
                </div>

                <div className="bel-payroll-panel-actions">
                  <button
                    type="button"
                    className="bel-payroll-btn-panel-secondary"
                    onClick={processSelectedEmployee}
                  >
                    <FiCheck />
                    <span>Process</span>
                  </button>

                  <button
                    type="button"
                    className="bel-payroll-btn-panel-primary"
                    onClick={generatePayslip}
                  >
                    <FiFileText />
                    <span>Payslip</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            TAB 2: PROCESSING STEPS (MOBILE TIMELINE)
            ========================================================= */}
        {activeTab === 'processing' && (
          <section className="bel-payroll-processing-section">
            <div className="bel-payroll-section-header">
              <h2>Payroll Processing Workflow</h2>
              <p>
                {selectedEmployee
                  ? `Active for ${selectedEmployee.name} (${selectedEmployee.id}) · ${payrollMonth}`
                  : 'Select an employee to proceed through the payroll processing cycle.'}
              </p>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="bel-payroll-vertical-stepper">
              {PROCESS_STEPS.map((step, index) => {
                const isCompleted = index < processStep;
                const isCurrent = index === processStep;

                return (
                  <div
                    key={step}
                    className={`bel-payroll-step-row ${
                      isCompleted ? 'is-completed' : ''
                    } ${isCurrent ? 'is-current' : ''}`}
                  >
                    <div className="bel-payroll-step-indicator-col">
                      <div className="bel-payroll-step-circle">
                        {isCompleted ? <FiCheck /> : index + 1}
                      </div>
                      {index < PROCESS_STEPS.length - 1 && (
                        <div className="bel-payroll-step-connector" />
                      )}
                    </div>

                    <div className="bel-payroll-step-content-col">
                      <strong>{step}</strong>
                      <span className="bel-payroll-step-status">
                        {isCompleted
                          ? 'Completed'
                          : isCurrent
                          ? 'In Progress'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Processing Navigation Buttons */}
            <div className="bel-payroll-step-actions">
              <button
                type="button"
                className="bel-payroll-btn-step-prev"
                disabled={!selectedEmployee || processStep === 0}
                onClick={() => moveProcessStep(-1)}
              >
                ← Previous
              </button>

              <button
                type="button"
                className="bel-payroll-btn-step-next"
                disabled={!selectedEmployee}
                onClick={() => {
                  if (processStep >= PROCESS_STEPS.length - 1) {
                    generatePayslip();
                  } else {
                    moveProcessStep(1);
                  }
                }}
              >
                {processStep >= PROCESS_STEPS.length - 1 ? (
                  <>
                    <FiFileText />
                    <span>Generate Payslip</span>
                  </>
                ) : (
                  <span>Next Step →</span>
                )}
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 3: ANALYTICS (6-MONTH INTERACTIVE TREND)
            ========================================================= */}
        {activeTab === 'analytics' && (
          <section className="bel-payroll-analytics-section">
            <div className="bel-payroll-section-header">
              <h2>Payroll Trend — Last 6 Months</h2>
              <p>Tap on any month column to jump to its payroll cycle</p>
            </div>

            <div className="bel-payroll-chart-card">
              <div className="bel-payroll-chart-legend-top">
                <span>Monthly Gross Benchmark</span>
                <strong>{formatINR(monthTotalGross, true)}</strong>
              </div>

              <div className="bel-payroll-chart-container">
                <div className="bel-payroll-chart-bars-row">
                  {previousMonths.map((item) => {
                    const maxValue = Math.max(...previousMonths.map((m) => m.value));
                    const heightPercent = Math.max(25, Math.min(100, (item.value / maxValue) * 85));
                    const isCurrent = item.month === selectedMonth && item.year === selectedYear;

                    return (
                      <button
                        type="button"
                        key={`${item.year}-${item.month}`}
                        className={`bel-payroll-chart-bar-btn ${isCurrent ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedYear(item.year);
                          setSelectedMonth(item.month);
                          showToast(`Switched to ${formatMonth(item.year, item.month)}`, 'info');
                        }}
                      >
                        <div className="bel-payroll-bar-pillar-wrap">
                          <div
                            className="bel-payroll-bar-pillar"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="bel-payroll-bar-label">{item.label}</span>
                        <small className="bel-payroll-bar-val">{formatINR(item.value, true)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          BOTTOM SHEET: PAYSLIP PREVIEW & DOWNLOAD
          ========================================================= */}
      {modal === 'payslip' && selectedEmployee && (
        <div
          className="bel-payroll-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-payroll-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="payslip-title">
            <div className="bel-payroll-sheet-drag-handle" />

            <div className="bel-payroll-sheet-header">
              <div>
                <h2 id="payslip-title">Official Payslip</h2>
                <p>{payrollMonth} · {selectedEmployee.id}</p>
              </div>
              <button type="button" className="bel-payroll-sheet-close" onClick={closeModal} aria-label="Close payslip">
                <FiX />
              </button>
            </div>

            <div className="bel-payroll-sheet-body">
              {/* Employee Header */}
              <div className="bel-payroll-payslip-emp-hero">
                <span
                  className="bel-payroll-card-avatar"
                  style={{ backgroundColor: selectedEmployee.avatarBg || '#2F6FED' }}
                >
                  {selectedEmployee.initials}
                </span>
                <div>
                  <h3>{selectedEmployee.name}</h3>
                  <p>{selectedEmployee.department} · {selectedEmployee.id}</p>
                </div>
                <span
                  className={`bel-payroll-status-pill ${
                    processedEmployees[`${payrollKey}-${selectedEmployee.id}`]
                      ? 'bel-payroll-status-pill--processed'
                      : 'bel-payroll-status-pill--pending'
                  }`}
                >
                  {processedEmployees[`${payrollKey}-${selectedEmployee.id}`] ? (
                    <>
                      <FiCheckCircle />
                      <span>Processed</span>
                    </>
                  ) : (
                    <>
                      <span className="bel-payroll-dot" />
                      <span>Pending</span>
                    </>
                  )}
                </span>
              </div>

              {/* Earnings & Allowances Grid */}
              <div className="bel-payroll-payslip-data-grid">
                <div className="bel-payroll-payslip-data-cell">
                  <span>Basic Salary</span>
                  <strong>{formatINR(selectedEmployee.basicPay)}</strong>
                </div>
                <div className="bel-payroll-payslip-data-cell">
                  <span>HRA</span>
                  <strong>{formatINR(selectedEmployee.hraPay)}</strong>
                </div>
                <div className="bel-payroll-payslip-data-cell">
                  <span>Special Allowances</span>
                  <strong>{formatINR(selectedEmployee.allowancePay)}</strong>
                </div>
                <div className="bel-payroll-payslip-data-cell">
                  <span>Paid Days</span>
                  <strong>{selectedEmployee.paidDays} Days</strong>
                </div>
                <div className="bel-payroll-payslip-data-cell">
                  <span>Gross Earnings</span>
                  <strong className="bel-payroll-color-green">{formatINR(selectedEmployee.gross)}</strong>
                </div>
                <div className="bel-payroll-payslip-data-cell">
                  <span>Total Deductions</span>
                  <strong className="bel-payroll-color-red">-{formatINR(selectedEmployee.deductions)}</strong>
                </div>
              </div>

              {/* Net Salary Highlight Box */}
              <div className="bel-payroll-payslip-net-box">
                <div>
                  <span>Take-Home Net Salary</span>
                  <p>Disbursed directly via automated payroll</p>
                </div>
                <strong>{formatINR(selectedEmployee.net)}</strong>
              </div>
            </div>

            <div className="bel-payroll-sheet-footer">
              <button type="button" className="bel-payroll-btn-sheet-secondary" onClick={closeModal}>
                Close
              </button>
              <button
                type="button"
                className="bel-payroll-btn-sheet-primary"
                onClick={exportSelectedPayslip}
              >
                <FiDownload />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: MONTH PICKER
          ========================================================= */}
      {modal === 'monthPicker' && (
        <div
          className="bel-payroll-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bel-payroll-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="month-picker-title">
            <div className="bel-payroll-sheet-drag-handle" />

            <div className="bel-payroll-sheet-header">
              <div>
                <h2 id="month-picker-title">Select Payroll Cycle</h2>
                <p>Choose the month to review or disburse</p>
              </div>
              <button type="button" className="bel-payroll-sheet-close" onClick={closeModal} aria-label="Close month picker">
                <FiX />
              </button>
            </div>

            <div className="bel-payroll-sheet-body">
              <div className="bel-payroll-month-options-grid">
                {Array.from({ length: 12 }).map((_, index) => {
                  const date = new Date(currentMonth.year, currentMonth.month - 6 + index, 1);
                  const isSelected = date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;

                  return (
                    <button
                      type="button"
                      key={`${date.getFullYear()}-${date.getMonth()}`}
                      className={`bel-payroll-month-option-btn ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth());
                        setProcessStep(0);
                        closeModal();
                        showToast(`Switched to ${formatMonth(date.getFullYear(), date.getMonth())}`, 'info');
                      }}
                    >
                      <span>{MONTH_NAMES[date.getMonth()]}</span>
                      <small>{date.getFullYear()}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent HR Admin Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
