import React, { useMemo, useState } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { getCompanyPdfHeaderHtml } from '../../utils/pdfGenerator';
import { downloadReport as dlReportPdf, downloadReportExcel, downloadReportCsv } from '../../services/downloadService';
import { useAuth } from '../../context/AuthContext';
import {
  FiBarChart2,
  FiDownload,
  FiFilter,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiTrendingDown,
  FiDollarSign,
  FiClock,
  FiX,
  FiCheck,
  FiEye,
  FiLayers,
  FiInfo,
  FiActivity,
  FiCheckCircle,
  FiChevronRight,
  FiShare2,
} from 'react-icons/fi';
import './HRReports.css';

interface ReportConfig {
  id: string;
  title: string;
  icon: 'users' | 'attendance' | 'leave' | 'payroll' | 'salary' | 'overtime' | 'department' | 'attrition';
  description: string;
  period: string;
  formats: ('PDF' | 'Excel' | 'CSV')[];
  fileName: string;
  accentColor: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const REPORT_ICONS: Record<string, React.FC<any>> = {
  users: FiUsers,
  attendance: FiClock,
  leave: FiCalendar,
  payroll: FiDollarSign,
  salary: FiDollarSign,
  overtime: FiActivity,
  department: FiLayers,
  attrition: FiFileText,
};

const REPORT_DEFINITIONS = [
  {
    id: 'employee',
    title: 'Employee Report',
    icon: 'users' as const,
    description: 'Employee master data, department, designation and employment details.',
    fileName: 'employee-report',
    accentColor: '#7c3aed',
  },
  {
    id: 'attendance',
    title: 'Attendance Report',
    icon: 'attendance' as const,
    description: 'Attendance status, working hours, late arrivals, overtime and WFH records.',
    fileName: 'attendance-report',
    accentColor: '#e11d48',
  },
  {
    id: 'leave',
    title: 'Leave Report',
    icon: 'leave' as const,
    description: 'Leave requests, approvals, leave types, balances and utilization.',
    fileName: 'leave-report',
    accentColor: '#059669',
  },
  {
    id: 'payroll',
    title: 'Payroll Report',
    icon: 'payroll' as const,
    description: 'Gross pay, deductions, net salary, tax and payroll processing data.',
    fileName: 'payroll-report',
    accentColor: '#d97706',
  },
  {
    id: 'salary',
    title: 'Salary Report',
    icon: 'salary' as const,
    description: 'Salary structure, basic pay, allowances, deductions and compensation.',
    fileName: 'salary-report',
    accentColor: '#2563eb',
  },
  {
    id: 'overtime',
    title: 'Overtime Report',
    icon: 'overtime' as const,
    description: 'Overtime hours, employee-wise overtime and payable overtime amounts.',
    fileName: 'overtime-report',
    accentColor: '#ea580c',
  },
  {
    id: 'department',
    title: 'Department Report',
    icon: 'department' as const,
    description: 'Department headcount, staffing, attendance and workforce distribution.',
    fileName: 'department-report',
    accentColor: '#0284c7',
  },
  {
    id: 'attrition',
    title: 'Attrition Report',
    icon: 'attrition' as const,
    description: 'Employee exits, joining trends, retention and attrition analysis.',
    fileName: 'attrition-report',
    accentColor: '#db2777',
  },
];

const INITIAL_REPORTS: ReportConfig[] = REPORT_DEFINITIONS.map((def) => ({
  ...def,
  period: 'Live Data',
  formats: ['PDF', 'Excel', 'CSV'],
}));

function escapeCsv(value: any) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function makeCsv(rows: any[][]) {
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function downloadBlob(content: string, fileName: string, type = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function makeExcelHtml(title: string, rows: any[][]) {
  const body = rows
    .map(
      (row, index) =>
        `<tr>${row
          .map(
            (cell) =>
              `<${index === 0 ? 'th' : 'td'}>${String(cell ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</${index === 0 ? 'th' : 'td'}>`
          )
          .join('')}</tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { font-size: 20px; color: #2563eb; }
          table { border-collapse: collapse; width: 100%; margin-top: 16px; }
          th, td { border: 1px solid #d9dee7; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #eef3fb; font-weight: 700; color: #1e293b; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated from BELNOVA HRMS Executive Reporting System</p>
        <table>${body}</table>
      </body>
    </html>
  `;
}

function makePdfHtml(title: string, rows: any[][], period = '2026') {
  const body = rows
    .map(
      (row, index) =>
        `<tr>${row
          .map(
            (cell) =>
              `<${index === 0 ? 'th' : 'td'}>${String(cell ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</${index === 0 ? 'th' : 'td'}>`
          )
          .join('')}</tr>`
    )
    .join('');

  const headerHtml = getCompanyPdfHeaderHtml({
    documentTitle: title,
    period,
  });

  return `
    <!doctype html>
    <html>
      <head>
        <title>${title} - BELNOVA HRMS</title>
        <meta charset="UTF-8" />
        <style>
          @page { size: landscape; margin: 14mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#0f172a; background: #ffffff; padding: 10px; }
          table { width:100%; border-collapse:collapse; margin-top:16px; }
          th,td { border:1px solid #cbd5e1; padding:9px 12px; font-size:11px; text-align:left; }
          th { background:#f1f5f9; font-weight:700; color:#1e293b; text-transform:uppercase; font-size:10px; letter-spacing:0.4px; }
          tr:nth-child(even) td { background:#f8fafc; }
          .footer { margin-top:24px; font-size:9px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:8px; display:flex; justify-content:space-between; }
        </style>
      </head>
      <body>
        ${headerHtml}
        <table>${body}</table>
        <div class="footer">
          <span>Official Document &bull; Confirmed HR Executive Record</span>
          <span>BELNOVA HRMS Mobile Application</span>
        </div>
        <script>window.onload=function(){window.print();};</script>
      </body>
    </html>
  `;
}

export const HRReports: React.FC = () => {
  const { teamMembers, leaveRequests } = useAuth();
  const [activeMetric, setActiveMetric] = useState<'Headcount' | 'Attrition' | 'Leave' | 'Payroll'>('Headcount');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('All');
  const [department, setDepartment] = useState('All Departments');
  const [period, setPeriod] = useState('2026');
  const [format, setFormat] = useState('All Formats');
  const [toast, setToast] = useState('');
  const [previewReport, setPreviewReport] = useState<ReportConfig | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; value: number; x: number; y: number } | null>(null);

  const reportsList: ReportConfig[] = useMemo(() => [
    {
      ...REPORT_DEFINITIONS[0],
      period: `${teamMembers.length} records`,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[1],
      period: 'Live Records',
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[2],
      period: `${leaveRequests.length} requests`,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[3],
      period: `${teamMembers.length} records`,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[4],
      period: `${teamMembers.length} employees`,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[5],
      period: '0 records',
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[6],
      period: `${new Set(teamMembers.map((m) => m.department).filter(Boolean)).size || 1} departments`,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      ...REPORT_DEFINITIONS[7],
      period: 'YTD',
      formats: ['PDF', 'Excel', 'CSV'],
    },
  ], [teamMembers, leaveRequests]);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reportsList.filter((report) => {
      const typeMatches = selectedReport === 'All' || report.id === selectedReport;
      const formatMatches = format === 'All Formats' || report.formats.includes(format as any);
      return typeMatches && formatMatches;
    });
  }, [reportsList, selectedReport, format]);

  const reportData: Record<string, string[][]> = useMemo(() => {
    const empRows = teamMembers.length > 0
      ? teamMembers.map((m) => [
          m.employeeId || m.id,
          m.name,
          m.department || 'General',
          m.designation || 'Staff',
          m.status ? (m.status.charAt(0).toUpperCase() + m.status.slice(1)) : 'Active',
        ])
      : [['-', 'No employee records found', '-', '-', '-']];

    const attRows = teamMembers.length > 0
      ? teamMembers.map((m) => [
          m.employeeId || m.id,
          m.name,
          new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          '09:30 AM',
          '06:30 PM',
          '9h 00m',
          'Present',
        ])
      : [['-', 'No attendance records found', '-', '-', '-', '-', '-']];

    const lvRows = leaveRequests.length > 0
      ? leaveRequests.map((l) => [
          l.id,
          l.employeeName || 'Employee',
          l.leaveType || 'Leave',
          l.startDate || '-',
          l.endDate || '-',
          l.duration || '1 Day',
          l.reason || '-',
          l.status ? (l.status.charAt(0).toUpperCase() + l.status.slice(1)) : 'Pending',
        ])
      : [['-', 'No leave records found', '-', '-', '-', '-', '-', '-']];

    const payRows = teamMembers.length > 0
      ? teamMembers.map((m) => [
          m.employeeId || m.id,
          m.name,
          '₹0',
          '₹0',
          '₹0',
          '₹0',
          '₹0',
          '₹0',
        ])
      : [['-', 'No payroll records found', '-', '-', '-', '-', '-', '-']];

    const salRows = teamMembers.length > 0
      ? teamMembers.map((m) => [
          m.employeeId || m.id,
          m.name,
          m.department || 'General',
          '₹0',
          '₹0',
          '₹0',
        ])
      : [['-', 'No salary records found', '-', '-', '-', '-']];

    const otRows = [
      ['-', 'No overtime records logged', '-', '0h', '₹0/hr', '₹0'],
    ];

    const deptCounts: Record<string, number> = {};
    teamMembers.forEach((m) => {
      const d = m.department || 'General';
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });
    const deptRows = Object.keys(deptCounts).length > 0
      ? Object.entries(deptCounts).map(([d, c]) => [d, String(c), String(c), '0', '100%'])
      : [['General', String(teamMembers.length || 0), String(teamMembers.length || 0), '0', '100%']];

    const attrRows = [
      ['Current Period', String(teamMembers.length), '0', '0', String(teamMembers.length), '0%'],
    ];

    return {
      employee: [
        ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Employment Status'],
        ...empRows,
      ],
      attendance: [
        ['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'],
        ...attRows,
      ],
      leave: [
        ['Request ID', 'Employee', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status'],
        ...lvRows,
      ],
      payroll: [
        ['Employee ID', 'Employee', 'Basic', 'HRA', 'Allowances', 'Gross', 'Deductions', 'Net Salary'],
        ...payRows,
      ],
      salary: [
        ['Employee ID', 'Employee', 'Department', 'Basic Salary', 'Allowances', 'Gross Salary'],
        ...salRows,
      ],
      overtime: [
        ['Employee ID', 'Employee', 'Department', 'Overtime Hours', 'Rate', 'Payable Amount'],
        ...otRows,
      ],
      department: [
        ['Department', 'Headcount', 'Active', 'On Leave', 'Attendance Rate'],
        ...deptRows,
      ],
      attrition: [
        ['Month', 'Opening Headcount', 'New Joiners', 'Exits', 'Closing Headcount', 'Attrition Rate'],
        ...attrRows,
      ],
    };
  }, [teamMembers, leaveRequests]);

  const chartValues = useMemo(() => {
    const headcount = teamMembers.length;
    if (activeMetric === 'Headcount') {
      return [headcount, headcount, headcount, headcount, headcount, headcount, headcount, headcount];
    }
    if (activeMetric === 'Leave') {
      return [0, 0, 0, 0, 0, 0, 0, leaveRequests.length];
    }
    return [0, 0, 0, 0, 0, 0, 0, 0];
  }, [activeMetric, teamMembers.length, leaveRequests.length]);

  const chartMin = Math.min(...chartValues);
  const chartMax = Math.max(...chartValues, 1);
  const chartRange = chartMax - chartMin || 1;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const getRows = (reportId: string) => reportData[reportId] || [];

  const downloadReport = async (report: ReportConfig, outputFormat: 'PDF' | 'Excel' | 'CSV') => {
    const rows = getRows(report.id);
    const fileName = `${report.fileName}-${period}`;
    const headers = rows.length > 0 ? rows[0] : ['Field', 'Value'];
    const dataRows = rows.slice(1);

    if (outputFormat === 'CSV') {
      await downloadReportCsv(headers, dataRows, `${fileName}.csv`);
      return;
    }

    if (outputFormat === 'Excel') {
      await downloadReportExcel(report.title, headers, dataRows, `${fileName}.xlsx`);
      return;
    }

    // PDF Flow
    const pdfRows = dataRows.map((r) => [String(r[0] || ''), String(r[1] || '')]);
    await dlReportPdf(report.title, `Period: ${period}`, headers, pdfRows, `${fileName}.pdf`);
  };

  const exportAll = async () => {
    const headers = ['Report', 'Period', 'Metric', 'Value'];
    const rows = [
      ['Employee Report', period, 'Total Records', String(teamMembers.length)],
      ['Attendance Report', 'Sep 2026', 'Attendance Rate', teamMembers.length > 0 ? '100%' : '0%'],
      ['Leave Report', 'Sep 2026', 'Leave Requests', String(leaveRequests.length)],
      ['Payroll Report', 'Aug 2026', 'Total Records', String(teamMembers.length)],
      ['Salary Report', period, 'Employees', String(teamMembers.length)],
      ['Overtime Report', period, 'Employees with Overtime', '0'],
      ['Department Report', period, 'Departments', String(new Set(teamMembers.map((m) => m.department).filter(Boolean)).size || 1)],
      ['Attrition Report', 'YTD 2026', 'Attrition Rate', '0.0%'],
    ];

    await downloadReportExcel('All HR Reports Summary', headers, rows, `HRMS_All_Reports_${period}.xlsx`);
  };

  const downloadAnalytics = async (metric = activeMetric) => {
    const headers = ['Month', metric];
    const rows = MONTHS.map((month, index) => [month, String(chartValues[index] ?? 0)]);

    await downloadReportExcel(`${metric} Analytics`, headers, rows, `Analytics_${metric}_${period}.xlsx`);
  };

  const applyFilters = () => {
    setFiltersOpen(false);
    showToast(
      `Filters applied: ${department}, ${period}${format !== 'All Formats' ? `, ${format}` : ''}.`
    );
  };

  const clearFilters = () => {
    setSelectedReport('All');
    setDepartment('All Departments');
    setPeriod('2026');
    setFormat('All Formats');
    setFiltersOpen(false);
    showToast('Report filters cleared.');
  };

  const isFiltered = selectedReport !== 'All' || department !== 'All Departments' || period !== '2026' || format !== 'All Formats';

  const renderReportIcon = (iconName: ReportConfig['icon']) => {
    const IconComponent = REPORT_ICONS[iconName] || FiFileText;
    return <IconComponent />;
  };

  return (
    <div className="app-container bel-reports-mobile-layout">
      {/* 1. App Header */}
      <AppHeader title="Reports & Analytics" showBack />

      <main className="page-content bel-reports-main">
        {/* 2. Overview Hero Card */}
        <section className="bel-reports-hero-card">
          <div className="bel-hero-top">
            <div className="bel-hero-badge">
              <FiBarChart2 size={13} />
              <span>HR Executive Intelligence</span>
            </div>
            <div className="bel-hero-period-pill">
              <FiCalendar size={12} />
              <span>FY {period}</span>
            </div>
          </div>

          <div className="bel-hero-content">
            <h2>Data-Driven Organization Insights</h2>
            <p>Access master census, attendance audits, payroll statements, and talent analytics.</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bel-hero-stats-row">
            <div className="bel-hero-stat-col">
              <span className="stat-label">Available Reports</span>
              <strong className="stat-value">{INITIAL_REPORTS.length} Ready</strong>
            </div>
            <div className="bel-hero-stat-divider" />
            <div className="bel-hero-stat-col">
              <span className="stat-label">Supported Formats</span>
              <strong className="stat-value">PDF &bull; XLS &bull; CSV</strong>
            </div>
            <div className="bel-hero-stat-divider" />
            <div className="bel-hero-stat-col">
              <span className="stat-label">Department Scope</span>
              <strong className="stat-value">{department === 'All Departments' ? 'Org-Wide' : department}</strong>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="bel-hero-actions-row">
            <button
              type="button"
              className={`bel-btn-filter ${isFiltered ? 'is-active' : ''}`}
              onClick={() => setFiltersOpen(true)}
              aria-label="Open report filters"
            >
              <FiFilter size={15} />
              <span>{isFiltered ? 'Filters Active' : 'Filter Reports'}</span>
              {isFiltered && <span className="filter-dot" />}
            </button>

            <button
              type="button"
              className="bel-btn-export-all"
              onClick={exportAll}
              aria-label="Export all reports"
            >
              <FiDownload size={15} />
              <span>Export All (CSV)</span>
            </button>
          </div>
        </section>

        {/* 3. Filter Summary Bar (if filters active) */}
        {isFiltered && (
          <div className="bel-filter-active-bar">
            <div className="filter-summary-text">
              <FiInfo size={13} />
              <span>Filtered: <b>{selectedReport}</b> &bull; <b>{department}</b> &bull; <b>{format}</b></span>
            </div>
            <button type="button" className="btn-clear-inline" onClick={clearFilters}>
              Reset
            </button>
          </div>
        )}

        {/* 4. Section Title */}
        <div className="bel-section-header">
          <div className="section-title-wrap">
            <h3>Standard Reports</h3>
            <span className="section-count-badge">{filteredReports.length} Available</span>
          </div>
          <span className="section-subtext">Select any format to download or preview records</span>
        </div>

        {/* 5. Report Cards Grid */}
        <section className="bel-reports-grid">
          {filteredReports.map((report) => (
            <article className="bel-report-card" key={report.id}>
              {/* Card Top Row */}
              <div className="bel-card-top-row">
                <div
                  className={`bel-report-icon-box bel-icon-${report.icon}`}
                  style={{ '--accent-clr': report.accentColor } as React.CSSProperties}
                >
                  {renderReportIcon(report.icon)}
                </div>

                <div className="bel-card-actions-top">
                  <button
                    type="button"
                    className="bel-btn-quick-preview"
                    title={`Preview ${report.title} records`}
                    onClick={() => setPreviewReport(report)}
                  >
                    <FiEye size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    className="bel-btn-quick-csv"
                    title={`Quick download ${report.title} CSV`}
                    onClick={() => downloadReport(report, 'CSV')}
                  >
                    <FiDownload size={14} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="bel-report-body" onClick={() => setPreviewReport(report)}>
                <h4 className="bel-report-title">{report.title}</h4>
                <div className="bel-report-period-tag">
                  <FiClock size={11} />
                  <span>{report.period}</span>
                </div>
                <p className="bel-report-desc">{report.description}</p>
              </div>

              {/* Card Footer Format Buttons */}
              <div className="bel-report-card-footer">
                <div className="bel-format-group">
                  <span className="format-label">Formats:</span>
                  <div className="format-buttons">
                    {report.formats.map((fmt) => (
                      <button
                        type="button"
                        key={fmt}
                        className={`btn-fmt-pill fmt-${fmt.toLowerCase()}`}
                        onClick={() => downloadReport(report, fmt)}
                        title={`Download as ${fmt}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="bel-btn-card-main-dl"
                  onClick={() =>
                    downloadReport(
                      report,
                      format === 'All Formats' ? 'CSV' : (format as 'PDF' | 'Excel' | 'CSV')
                    )
                  }
                >
                  <FiDownload size={13} />
                  <span>Download</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="bel-reports-empty-state">
            <div className="empty-icon-circle">
              <FiFileText size={26} />
            </div>
            <h4>No reports match your filters</h4>
            <p>Try adjusting your search criteria or reset filters to view all standard organization reports.</p>
            <button type="button" className="btn-reset-filters" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* 6. Executive Analytics Section */}
        <section className="bel-analytics-section-card">
          <div className="bel-analytics-header">
            <div className="analytics-header-titles">
              <div className="analytics-badge">
                <FiActivity size={13} />
                <span>Executive Trends</span>
              </div>
              <h3>Analytics Overview</h3>
              <p>Performance &amp; Headcount Trajectory &bull; Jan &mdash; Aug {period}</p>
            </div>

            {/* Metric Segmented Tabs */}
            <div className="bel-analytics-metric-tabs">
              {(['Headcount', 'Attrition', 'Leave', 'Payroll'] as const).map((metric) => (
                <button
                  type="button"
                  key={metric}
                  className={`metric-tab-btn ${activeMetric === metric ? 'is-active' : ''}`}
                  onClick={() => setActiveMetric(metric)}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bel-analytics-chart-wrap">
            {/* Value display overlay */}
            <div className="bel-chart-current-stat">
              <span className="stat-metric-title">{activeMetric} Metric</span>
              <strong className="stat-metric-num">
                {activeMetric === 'Headcount' && `${chartValues[chartValues.length - 1]} Active`}
                {activeMetric === 'Attrition' && `${chartValues[chartValues.length - 1]}% Rate`}
                {activeMetric === 'Leave' && `${chartValues[chartValues.length - 1]}% Utilization`}
                {activeMetric === 'Payroll' && `₹${chartValues[chartValues.length - 1]} Lakhs`}
              </strong>
            </div>

            <div className="bel-chart-layout">
              {/* Y-Axis Labels */}
              <div className="bel-chart-ylabels">
                <span>{activeMetric === 'Attrition' ? chartMax.toFixed(1) : Math.round(chartMax)}</span>
                <span>{activeMetric === 'Attrition' ? (chartMin + chartRange * 0.66).toFixed(1) : Math.round(chartMin + chartRange * 0.66)}</span>
                <span>{activeMetric === 'Attrition' ? (chartMin + chartRange * 0.33).toFixed(1) : Math.round(chartMin + chartRange * 0.33)}</span>
                <span>{activeMetric === 'Attrition' ? chartMin.toFixed(1) : Math.round(chartMin)}</span>
              </div>

              {/* Chart Canvas */}
              <div className="bel-chart-canvas">
                {/* Horizontal Grid lines */}
                <div className="bel-chart-grid-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                {/* SVG Curves */}
                <svg
                  className="bel-chart-svg"
                  viewBox="0 0 800 240"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`${activeMetric} trends chart`}
                >
                  <defs>
                    <linearGradient id="belChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                      <stop offset="90%" stopColor="#2563eb" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Area Polygon */}
                  <polygon
                    points={`0,240 ${chartValues
                      .map((val, idx) => {
                        const x = (idx / (chartValues.length - 1)) * 800;
                        const y = 20 + ((chartMax - val) / chartRange) * 190;
                        return `${x},${y}`;
                      })
                      .join(' ')} 800,240`}
                    fill="url(#belChartGrad)"
                  />

                  {/* Line Polyline */}
                  <polyline
                    points={chartValues
                      .map((val, idx) => {
                        const x = (idx / (chartValues.length - 1)) * 800;
                        const y = 20 + ((chartMax - val) / chartRange) * 190;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Points */}
                  {chartValues.map((val, idx) => {
                    const x = (idx / (chartValues.length - 1)) * 800;
                    const y = 20 + ((chartMax - val) / chartRange) * 190;
                    return (
                      <g
                        key={`${activeMetric}-${idx}`}
                        className="chart-point-group"
                        onMouseEnter={() => setHoveredPoint({ month: MONTHS[idx], value: val, x, y })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onTouchStart={() => setHoveredPoint({ month: MONTHS[idx], value: val, x, y })}
                      >
                        <circle cx={x} cy={y} r="14" fill="transparent" />
                        <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                      </g>
                    );
                  })}
                </svg>

                {/* Point Hover Tooltip */}
                {hoveredPoint && (
                  <div
                    className="bel-chart-tooltip"
                    style={{
                      left: `${(hoveredPoint.x / 800) * 100}%`,
                    }}
                  >
                    <span className="tooltip-month">{hoveredPoint.month}</span>
                    <strong className="tooltip-value">
                      {hoveredPoint.value}
                      {activeMetric === 'Attrition' || activeMetric === 'Leave' ? '%' : ''}
                      {activeMetric === 'Payroll' ? 'L' : ''}
                    </strong>
                  </div>
                )}

                {/* Month Labels along X-Axis */}
                <div className="bel-chart-month-labels">
                  {MONTHS.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7. Key Performance Indicators Row */}
          <div className="bel-analytics-kpi-grid">
            <div className="bel-kpi-card">
              <span className="kpi-label">Attendance Rate</span>
              <strong className="kpi-val">{teamMembers.length > 0 ? '100%' : '0%'}</strong>
              <div className="kpi-badge positive">
                <span>Active</span>
              </div>
            </div>

            <div className="bel-kpi-card">
              <span className="kpi-label">Attrition Rate</span>
              <strong className="kpi-val">0.0%</strong>
              <div className="kpi-badge positive">
                <span>FY {period}</span>
              </div>
            </div>

            <div className="bel-kpi-card">
              <span className="kpi-label">Leave Requests</span>
              <strong className="kpi-val">{leaveRequests.length}</strong>
              <div className="kpi-badge warning">
                <span>Recorded</span>
              </div>
            </div>
          </div>

          {/* Download Analytics Action Button */}
          <div className="bel-analytics-bottom-action">
            <button
              type="button"
              className="bel-btn-dl-analytics"
              onClick={() => downloadAnalytics()}
            >
              <FiDownload size={14} />
              <span>Download {activeMetric} Analytics (.CSV)</span>
            </button>
          </div>
        </section>

        {/* 8. HR Compliance & Security Note */}
        <div className="bel-reports-compliance-banner">
          <div className="compliance-icon-box">
            <FiCheckCircle size={16} />
          </div>
          <div className="compliance-text">
            <strong>Enterprise Security &amp; Authorized Access</strong>
            <p>
              Reports contain HR-authorized organizational data. Payroll and salary exports should only be accessible
              to users with the appropriate HR/Finance permissions.
            </p>
          </div>
        </div>
      </main>

      {/* 9. Mobile Filter Bottom Sheet */}
      {filtersOpen && (
        <div className="bel-modal-backdrop" onClick={() => setFiltersOpen(false)}>
          <div
            className="bel-bottom-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiFilter size={18} />
                <div>
                  <h4>Filter Reports</h4>
                  <span>Customize your dataset scope and export target</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filter sheet"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="sheet-filter-group">
                <label>Report Type</label>
                <div className="sheet-select-wrap">
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                  >
                    <option value="All">All Reports (8 Modules)</option>
                    {reportsList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.period})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sheet-filter-group">
                <label>Department Scope</label>
                <div className="sheet-select-wrap">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Product</option>
                    <option>Operations</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                  </select>
                </div>
              </div>

              <div className="sheet-filter-group">
                <label>Coverage Period</label>
                <div className="sheet-select-wrap">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
              </div>

              <div className="sheet-filter-group">
                <label>Preferred Download Format</label>
                <div className="sheet-select-wrap">
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option>All Formats</option>
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button type="button" className="btn-sheet-clear" onClick={clearFilters}>
                Clear All
              </button>
              <button type="button" className="btn-sheet-apply" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Mobile Report Preview Sheet */}
      {previewReport && (
        <div className="bel-modal-backdrop" onClick={() => setPreviewReport(null)}>
          <div
            className="bel-bottom-sheet-panel preview-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <div
                  className="preview-badge-icon"
                  style={{ background: `${previewReport.accentColor}18`, color: previewReport.accentColor }}
                >
                  {renderReportIcon(previewReport.icon)}
                </div>
                <div>
                  <h4>{previewReport.title}</h4>
                  <span>{previewReport.period} &bull; Coverage FY {period}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setPreviewReport(null)}
                aria-label="Close preview"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <p className="preview-desc-text">{previewReport.description}</p>

              {/* Data Preview Table */}
              <div className="preview-data-table-container">
                <div className="table-header-indicator">
                  <span>Record Sample Preview ({getRows(previewReport.id).length ? getRows(previewReport.id).length - 1 : 0} rows shown)</span>
                </div>

                <div className="preview-table-scroll">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {getRows(previewReport.id)[0]?.map((header, idx) => (
                          <th key={idx}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getRows(previewReport.id).slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Format selection inside preview */}
              <div className="preview-export-options">
                <h5>Download Complete Report</h5>
                <div className="preview-export-buttons-grid">
                  {previewReport.formats.map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      className={`btn-preview-export export-${fmt.toLowerCase()}`}
                      onClick={() => {
                        downloadReport(previewReport, fmt);
                      }}
                    >
                      <FiDownload size={14} />
                      <span>{fmt} Format</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button
                type="button"
                className="btn-sheet-close-full"
                onClick={() => setPreviewReport(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Toast Feedback Notification */}
      {toast && (
        <div className="bel-reports-toast-banner" role="status" aria-live="polite">
          <FiCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* 12. Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HRReports;
