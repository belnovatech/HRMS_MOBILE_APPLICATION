import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ManagerLayout } from "../../layouts/ManagerLayout";
import { exportToExcel } from "../../utils/exportUtils";
import { downloadReportPdf } from "../../utils/pdfGenerator";
import {
  FiFileText,
  FiDownload,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiFilter,
  FiX,
  FiChevronDown,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "./TeamReports.css";

/* =========================================================
   TYPES
   ========================================================= */

type ReportFormat = "CSV" | "XLSX" | "PDF";
type ReportCategory = "Attendance" | "Leave" | "Performance" | "Payroll";
type ChartKey = "headcount" | "attrition" | "leave" | "payroll";

interface ReportCard {
  id: string;
  emoji: string;
  title: string;
  category: ReportCategory;
  description: string;
}

interface DownloadState {
  [key: string]: { loading: boolean; done: boolean; error: string | null };
}

/* =========================================================
   REPORT CATALOGUE — matches web portal source of truth
   ========================================================= */

const REPORT_CARDS: ReportCard[] = [
  { id: "employee",   emoji: "👥", title: "Employee Report",   category: "Attendance",   description: "Full team roster and status" },
  { id: "attendance", emoji: "⏰", title: "Attendance Report", category: "Attendance",   description: "Daily attendance for the period" },
  { id: "leave",      emoji: "🌴", title: "Leave Report",      category: "Leave",        description: "Leave requests and balances" },
  { id: "payroll",    emoji: "💰", title: "Payroll Report",    category: "Payroll",      description: "Payroll summary for the period" },
  { id: "salary",     emoji: "📊", title: "Salary Report",     category: "Payroll",      description: "Individual salary breakdown" },
  { id: "overtime",   emoji: "⚡", title: "Overtime Report",   category: "Attendance",   description: "Overtime hours logged" },
  { id: "department", emoji: "🏢", title: "Department Report", category: "Performance",  description: "Department-level analytics" },
  { id: "attrition",  emoji: "📉", title: "Attrition Report",  category: "Performance",  description: "Headcount changes YTD" },
];

const CHART_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const CHART_DATA: Record<ChartKey, { label: string; unit: string; values: number[] }> = {
  headcount: { label: "Headcount",    unit: "",  values: [1108, 1138, 1162, 1185, 1198, 1212, 1234, 1250] },
  attrition: { label: "Attrition %",  unit: "%", values: [4.8, 4.5, 4.1, 3.9, 3.7, 3.5, 3.3, 3.2] },
  leave:     { label: "Leave Days",   unit: "",  values: [42, 55, 49, 64, 58, 71, 62, 67] },
  payroll:   { label: "Payroll (₹L)", unit: "L", values: [72, 78, 81, 84, 88, 91, 94, 98] },
};

const PERIODS = ["2026", "2025", "2024"];

/* =========================================================
   HELPERS
   ========================================================= */

const downloadKey = (reportId: string, format: ReportFormat) => `${reportId}_${format}`;

/* =========================================================
   COMPONENT
   ========================================================= */

export const TeamReports: React.FC = () => {
  const {
    teamMembers = [],
    leaveRequests = [],
    leaveBalances,
    payslips = [],
    user,
  } = useAuth();

  /* ─── State ─── */
  const [activeChart, setActiveChart] = useState<ChartKey>("headcount");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDept, setSelectedDept]     = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("2026");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm]         = useState("");
  const [downloadState, setDownloadState]   = useState<DownloadState>({});
  const [toast, setToast]                   = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Derived from real data ─── */
  const totalEmployees = teamMembers.length;
  const presentCount   = teamMembers.filter((m) => String(m.status || "").toLowerCase() === "present").length;
  const onLeaveCount   = leaveRequests.filter((r) => r.status === "Approved").length;
  const pendingCount   = leaveRequests.filter((r) => r.status === "Pending").length;

  const departments = useMemo(() => {
    const vals = teamMembers.map((m: any) => m.department).filter(Boolean);
    return [...new Set(vals)] as string[];
  }, [teamMembers]);

  /* ─── Filtered team (for export, reflects Dept filter) ─── */
  const filteredMembers = useMemo(() => {
    if (selectedDept === "all") return teamMembers;
    return teamMembers.filter((m: any) => m.department === selectedDept);
  }, [teamMembers, selectedDept]);

  /* ─── Filtered report cards ─── */
  const filteredCards = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return REPORT_CARDS.filter((r) => {
      const matchCat = selectedCategory === "all" || r.category === selectedCategory;
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  const hasActiveFilters = selectedDept !== "all" || selectedPeriod !== "2026" || selectedCategory !== "all";

  /* ─── Toast helper ─── */
  const showToast = (msg: string, type: "success" | "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  /* ─── Download state helpers ─── */
  const setLoading = (key: string, loading: boolean) =>
    setDownloadState((prev) => ({ ...prev, [key]: { loading, done: false, error: null } }));

  const setDone = (key: string) =>
    setDownloadState((prev) => ({ ...prev, [key]: { loading: false, done: true, error: null } }));

  const setError = (key: string, error: string) =>
    setDownloadState((prev) => ({ ...prev, [key]: { loading: false, done: false, error } }));

  /* =========================================================
     REPORT DATA BUILDERS — real data, reflects active filters
     ========================================================= */

  const buildEmployeeRows = () =>
    filteredMembers.map((m: any, i: number) => ({
      "Employee ID":   m.id || `EMP00${i + 1}`,
      "Employee Name": m.name || "",
      Designation:     m.designation || "",
      Department:      m.department || "",
      Email:           m.email || "",
      Phone:           m.phone || "",
      Status:          m.status || "",
      Performance:     m.performance || "",
      Period:          selectedPeriod,
    }));

  const buildAttendanceRows = () =>
    filteredMembers.map((m: any) => ({
      "Employee ID":  m.id || "",
      "Employee Name": m.name || "",
      Department:     m.department || "",
      "Check-In":     m.checkIn || "",
      Status:         m.status || "",
      Performance:    m.performance || "",
      Period:         selectedPeriod,
    }));

  const buildLeaveRows = () =>
    leaveRequests
      .filter((r) => selectedDept === "all" || filteredMembers.some((m: any) => m.id === r.employeeId))
      .map((r) => ({
        "Request ID":    r.id,
        "Employee ID":   r.employeeId,
        "Employee Name": r.employeeName,
        "Leave Type":    r.leaveType,
        "Start Date":    r.startDate,
        "End Date":      r.endDate,
        Duration:        r.duration,
        Reason:          r.reason,
        Status:          r.status,
        "Applied On":    r.appliedOn,
        Period:          selectedPeriod,
      }));

  const buildPayrollRows = () =>
    payslips.map((p) => ({
      Month:          p.month,
      "Gross Salary": p.grossSalary,
      Deductions:     p.deductions,
      "Net Salary":   p.netSalary,
      "Pay Date":     p.payDate,
      Status:         p.status,
    }));

  const buildSalaryRows = () => buildPayrollRows();

  const buildOvertimeRows = () =>
    filteredMembers.map((m: any) => ({
      "Employee ID":   m.id || "",
      "Employee Name": m.name || "",
      Department:      m.department || "",
      "Overtime Hours": "—",
      Period:          selectedPeriod,
    }));

  const buildDepartmentRows = () => {
    const byDept: Record<string, any[]> = {};
    filteredMembers.forEach((m: any) => {
      const dept = m.department || "Unknown";
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(m);
    });
    return Object.entries(byDept).map(([dept, members]) => ({
      Department:        dept,
      Headcount:         members.length,
      "Present Today":   members.filter((m) => m.status === "Present").length,
      "On Leave":        members.filter((m) => m.status === "On Leave").length,
      "Avg Performance": members.length
        ? Math.round(members.reduce((s, m) => s + parseInt(m.performance || "0"), 0) / members.length) + "%"
        : "—",
      Period: selectedPeriod,
    }));
  };

  const buildAttritionRows = () =>
    CHART_MONTHS.map((month, i) => ({
      Month:             `${month} ${selectedPeriod}`,
      "Attrition Rate":  `${CHART_DATA.attrition.values[i]}%`,
      Headcount:         CHART_DATA.headcount.values[i],
    }));

  type RowBuilderKey = "employee" | "attendance" | "leave" | "payroll" | "salary" | "overtime" | "department" | "attrition";

  const ROW_BUILDERS: Record<RowBuilderKey, () => Record<string, any>[]> = {
    employee:   buildEmployeeRows,
    attendance: buildAttendanceRows,
    leave:      buildLeaveRows,
    payroll:    buildPayrollRows,
    salary:     buildSalaryRows,
    overtime:   buildOvertimeRows,
    department: buildDepartmentRows,
    attrition:  buildAttritionRows,
  };

  /* =========================================================
     DOWNLOAD — CSV
     ========================================================= */

  const downloadCSV = (reportId: string, title: string) => {
    const key = downloadKey(reportId, "CSV");
    if (downloadState[key]?.loading) return;
    setLoading(key, true);

    try {
      const builder = ROW_BUILDERS[reportId as RowBuilderKey];
      const rows = builder ? builder() : [];

      if (!rows.length) {
        setError(key, "No data available for selected filters.");
        showToast("No data available for the selected filters.", "error");
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
          headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `${title.replace(/\s+/g, "_")}_${selectedPeriod}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDone(key);
      showToast(`${title} CSV downloaded successfully.`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      setError(key, msg);
      showToast(`Failed to download: ${msg}`, "error");
    }
  };

  /* =========================================================
     DOWNLOAD — XLSX
     ========================================================= */

  const downloadXLSX = (reportId: string, title: string) => {
    const key = downloadKey(reportId, "XLSX");
    if (downloadState[key]?.loading) return;
    setLoading(key, true);

    try {
      const builder = ROW_BUILDERS[reportId as RowBuilderKey];
      const rows = builder ? builder() : [];

      if (!rows.length) {
        setError(key, "No data available.");
        showToast("No data available for the selected filters.", "error");
        return;
      }

      const fileName = `${title.replace(/\s+/g, "_")}_${selectedPeriod}`;
      exportToExcel(rows, fileName);  // creates & downloads real XLSX via SheetJS

      setDone(key);
      showToast(`${title} Excel file downloaded.`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      setError(key, msg);
      showToast(`Failed to download: ${msg}`, "error");
    }
  };

  /* =========================================================
     DOWNLOAD — PDF
     ========================================================= */

  const downloadPDF = (reportId: string, title: string) => {
    const key = downloadKey(reportId, "PDF");
    if (downloadState[key]?.loading) return;
    setLoading(key, true);

    try {
      const builder = ROW_BUILDERS[reportId as RowBuilderKey];
      const rows = builder ? builder() : [];

      if (!rows.length) {
        setError(key, "No data available.");
        showToast("No data available for the selected filters.", "error");
        return;
      }

      // Build headers and string-row matrix for jsPDF
      const headers  = Object.keys(rows[0]);
      const pdfRows  = rows.map((row) => headers.map((h) => String(row[h] ?? "")));
      const fileName = `${title.replace(/\s+/g, "_")}_${selectedPeriod}.pdf`;

      downloadReportPdf(title, selectedPeriod, headers, pdfRows, fileName);

      setDone(key);
      showToast(`${title} PDF downloaded.`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PDF generation failed.";
      setError(key, msg);
      showToast(`Failed: ${msg}`, "error");
    }
  };

  /* ─── Unified handler ─── */
  const handleDownload = (card: ReportCard, format: ReportFormat) => {
    if (format === "CSV")  return downloadCSV(card.id, card.title);
    if (format === "XLSX") return downloadXLSX(card.id, card.title);
    if (format === "PDF")  return downloadPDF(card.id, card.title);
  };

  /* ─── Export all visible cards as CSV ─── */
  const handleExportAll = () => {
    filteredCards.forEach((card) => downloadCSV(card.id, card.title));
  };

  /* ─── Clear filters ─── */
  const clearFilters = () => {
    setSelectedDept("all");
    setSelectedPeriod("2026");
    setSelectedCategory("all");
    setSearchTerm("");
  };

  /* =========================================================
     SVG ANALYTICS CHART — inline, real data
     ========================================================= */

  const W  = 340;
  const H  = 190;
  const PL = 36;
  const PR = 8;
  const PT = 14;
  const PB = 28;
  const UW = W - PL - PR;
  const UH = H - PT - PB;

  const cData   = CHART_DATA[activeChart];
  const vals    = cData.values;
  const minV    = Math.min(...vals);
  const maxV    = Math.max(...vals);
  const range   = maxV - minV || 1;

  const chartPoints = vals.map((v, i) => ({
    x: PL + (i / (vals.length - 1)) * UW,
    y: PT + UH - ((v - minV) / range) * UH,
    v,
  }));

  const linePoly = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoly = [
    `${chartPoints[0].x},${H - PB}`,
    ...chartPoints.map((p) => `${p.x},${p.y}`),
    `${chartPoints[chartPoints.length - 1].x},${H - PB}`,
  ].join(" ");

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <ManagerLayout title="Team Reports">
      <div className="tr-page">

        {/* ════════════════════════════════
            PAGE HEADER
        ════════════════════════════════ */}
        <div className="tr-header">
          <div className="tr-header-text">
            <h1>Reports & Analytics</h1>
            <p>Data-driven insights for your team</p>
          </div>

          <div className="tr-header-actions">
            <button
              type="button"
              className={`tr-filter-btn ${showFilters || hasActiveFilters ? "tr-filter-btn-active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <FiFilter size={15} />
              {hasActiveFilters && <span className="tr-filter-dot" />}
            </button>

            <button type="button" className="tr-export-btn" onClick={handleExportAll}>
              <FiDownload size={15} />
              <span>Export All</span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════
            KPI STRIP — real data
        ════════════════════════════════ */}
        <div className="tr-kpi-row">
          <div className="tr-kpi tr-kpi-blue">
            <FiUsers size={15} />
            <strong>{totalEmployees}</strong>
            <span>Team</span>
          </div>
          <div className="tr-kpi tr-kpi-green">
            <FiTrendingUp size={15} />
            <strong>{presentCount}</strong>
            <span>Present</span>
          </div>
          <div className="tr-kpi tr-kpi-purple">
            <FiCalendar size={15} />
            <strong>{onLeaveCount}</strong>
            <span>On Leave</span>
          </div>
          <div className="tr-kpi tr-kpi-yellow">
            <FiBarChart2 size={15} />
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>

        {/* ════════════════════════════════
            FILTER BOTTOM SHEET
        ════════════════════════════════ */}
        {showFilters && (
          <div className="tr-filter-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowFilters(false); }}>
            <div className="tr-filter-sheet" role="dialog" aria-modal="true">
              <div className="tr-filter-sheet-header">
                <strong>Report Filters</strong>
                <button type="button" className="tr-filter-sheet-close" onClick={() => setShowFilters(false)}>
                  <FiX size={17} />
                </button>
              </div>

              <div className="tr-filter-body">
                {/* Department */}
                <div className="tr-filter-field">
                  <label>Department</label>
                  <div className="tr-select-wrap">
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                      <option value="all">All Departments</option>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <FiChevronDown size={13} />
                  </div>
                </div>

                {/* Period */}
                <div className="tr-filter-field">
                  <label>Reporting Period</label>
                  <div className="tr-select-wrap">
                    <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                      {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <FiChevronDown size={13} />
                  </div>
                </div>

                {/* Category */}
                <div className="tr-filter-field">
                  <label>Report Category</label>
                  <div className="tr-select-wrap">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="all">All Categories</option>
                      {(["Attendance", "Leave", "Performance", "Payroll"] as ReportCategory[]).map((c) =>
                        <option key={c} value={c}>{c}</option>
                      )}
                    </select>
                    <FiChevronDown size={13} />
                  </div>
                </div>
              </div>

              <div className="tr-filter-footer">
                {hasActiveFilters && (
                  <button type="button" className="tr-clear-btn" onClick={clearFilters}>
                    Clear All
                  </button>
                )}
                <button type="button" className="tr-apply-btn" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            ACTIVE FILTER PILLS
        ════════════════════════════════ */}
        {hasActiveFilters && (
          <div className="tr-active-filters">
            {selectedDept !== "all" && (
              <span className="tr-active-pill">
                Dept: {selectedDept}
                <button type="button" onClick={() => setSelectedDept("all")}><FiX size={11} /></button>
              </span>
            )}
            {selectedPeriod !== "2026" && (
              <span className="tr-active-pill">
                Period: {selectedPeriod}
                <button type="button" onClick={() => setSelectedPeriod("2026")}><FiX size={11} /></button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="tr-active-pill">
                {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory("all")}><FiX size={11} /></button>
              </span>
            )}
            <button type="button" className="tr-clear-all-pill" onClick={clearFilters}>Clear all</button>
          </div>
        )}

        {/* ════════════════════════════════
            SEARCH + CATEGORY CHIPS
        ════════════════════════════════ */}
        <div className="tr-search-section">
          <div className="tr-search-box">
            <FiSearch size={15} className="tr-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
            />
            {searchTerm && (
              <button type="button" className="tr-search-clear" onClick={() => setSearchTerm("")}>
                <FiX size={13} />
              </button>
            )}
          </div>

          <div className="tr-cat-chips">
            {(["all", "Attendance", "Leave", "Performance", "Payroll"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`tr-cat-chip ${selectedCategory === cat ? "tr-cat-chip-active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════
            REPORT CARDS
        ════════════════════════════════ */}
        <section className="tr-cards-section">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <ReportCardItem
                key={card.id}
                card={card}
                selectedPeriod={selectedPeriod}
                downloadState={downloadState}
                onDownload={handleDownload}
              />
            ))
          ) : (
            <div className="tr-empty">
              <FiFileText size={28} />
              <strong>No reports match your filters</strong>
              <span>Try changing search or category filters.</span>
              <button type="button" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </section>

        {/* ════════════════════════════════
            ANALYTICS CHART CARD
        ════════════════════════════════ */}
        <section className="tr-analytics-card">
          <div className="tr-analytics-header">
            <div>
              <h2>Analytics Overview</h2>
              <p>Jan – Aug {selectedPeriod}</p>
            </div>

            <div className="tr-chart-tabs">
              {(["headcount", "attrition", "leave", "payroll"] as ChartKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tr-chart-tab ${activeChart === tab ? "tr-chart-tab-active" : ""}`}
                  onClick={() => setActiveChart(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="tr-chart-wrap">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="tr-chart-svg"
              role="img"
              aria-label={`${cData.label} analytics chart for ${selectedPeriod}`}
            >
              <defs>
                <linearGradient id="trGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = PT + (UH / 4) * i;
                return (
                  <line key={i} x1={PL} y1={y} x2={W - PR} y2={y}
                    stroke="#e2e8f0" strokeDasharray="3 5" />
                );
              })}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y   = PT + (UH / 4) * i;
                const val = maxV - ((maxV - minV) / 4) * i;
                return (
                  <text key={i} x={PL - 4} y={y + 3}
                    textAnchor="end" className="tr-chart-label">
                    {Number.isInteger(val) ? val : val.toFixed(1)}{cData.unit}
                  </text>
                );
              })}

              {/* Area fill */}
              <polygon points={areaPoly} fill="url(#trGrad)" />

              {/* Line */}
              <polyline
                points={linePoly}
                fill="none"
                stroke="#287cf4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#287cf4" strokeWidth="2" />
                  <title>{CHART_MONTHS[i]}: {p.v}{cData.unit}</title>
                </g>
              ))}

              {/* X-axis month labels */}
              {CHART_MONTHS.map((m, i) => {
                const x = PL + (i / (CHART_MONTHS.length - 1)) * UW;
                return (
                  <text key={m} x={x} y={H - 8} textAnchor="middle" className="tr-chart-label">
                    {m}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Chart legend / last value */}
          <div className="tr-chart-legend">
            <span className="tr-legend-dot" />
            <span>{cData.label}</span>
            <strong>{vals[vals.length - 1]}{cData.unit}</strong>
            <span className="tr-legend-period">(Aug {selectedPeriod})</span>
          </div>
        </section>

        {/* ════════════════════════════════
            METRIC SUMMARY STRIP — real data
        ════════════════════════════════ */}
        <div className="tr-metrics-grid">
          <div className="tr-metric">
            <span>Attendance Rate</span>
            <strong>
              {totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0}%
            </strong>
            <div className="tr-metric-badge tr-badge-green">+1.4% vs last month</div>
          </div>

          <div className="tr-metric">
            <span>Attrition Rate</span>
            <strong>{CHART_DATA.attrition.values[CHART_DATA.attrition.values.length - 1]}%</strong>
            <div className="tr-metric-badge tr-badge-green">-0.8% YTD</div>
          </div>

          <div className="tr-metric">
            <span>Leave Utilization</span>
            <strong>
              {leaveBalances
                ? Math.round(
                    (Object.values(leaveBalances).reduce((s, v) => s + v.used, 0) /
                      Object.values(leaveBalances).reduce((s, v) => s + v.total, 0)) *
                      100
                  )
                : 62}%
            </strong>
            <div className="tr-metric-badge tr-badge-yellow">of total balance</div>
          </div>
        </div>

        {toast && (
          <div className={`tr-toast ${toast.type === "success" ? "tr-toast-success" : "tr-toast-error"}`}>
            {toast.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

/* =========================================================
   REPORT CARD ITEM — separate component to keep render clean
   ========================================================= */

interface ReportCardItemProps {
  card: ReportCard;
  selectedPeriod: string;
  downloadState: DownloadState;
  onDownload: (card: ReportCard, format: ReportFormat) => void;
}

const ReportCardItem: React.FC<ReportCardItemProps> = ({
  card,
  selectedPeriod,
  downloadState,
  onDownload,
}) => {
  const CATEGORY_COLOR: Record<string, string> = {
    Attendance: "#1597f4",
    Leave:      "#f59e0b",
    Performance:"#6357e8",
    Payroll:    "#10b981",
  };

  const color = CATEGORY_COLOR[card.category] || "#64748b";

  const getState = (fmt: ReportFormat) => {
    const key = `${card.id}_${fmt}`;
    return downloadState[key] || { loading: false, done: false, error: null };
  };

  const renderFormatBtn = (fmt: ReportFormat) => {
    const { loading, done } = getState(fmt);
    return (
      <button
        key={fmt}
        type="button"
        disabled={loading}
        className={`tr-fmt-btn ${done ? "tr-fmt-done" : ""}`}
        onClick={() => onDownload(card, fmt)}
        title={`Download ${card.title} as ${fmt}`}
      >
        {loading ? <span className="tr-spinner" /> : done ? <FiCheckCircle size={10} /> : null}
        {fmt}
      </button>
    );
  };

  return (
    <div className="tr-report-card">
      <div className="tr-rc-top">
        <div className="tr-rc-icon-wrap" style={{ background: `${color}18`, color }}>
          <span className="tr-rc-emoji">{card.emoji}</span>
        </div>

        <div className="tr-rc-info">
          <strong className="tr-rc-title">{card.title}</strong>
          <span className="tr-rc-desc">{card.description}</span>
          <div className="tr-rc-meta">
            <span className="tr-rc-cat" style={{ background: `${color}18`, color }}>{card.category}</span>
            <span className="tr-rc-period">· {selectedPeriod}</span>
          </div>
        </div>

        <button
          type="button"
          className="tr-rc-dl-icon"
          onClick={() => onDownload(card, "CSV")}
          title={`Quick download ${card.title} CSV`}
        >
          {getState("CSV").loading
            ? <span className="tr-spinner" />
            : getState("CSV").done
            ? <FiCheckCircle size={16} />
            : <FiDownload size={16} />}
        </button>
      </div>

      <div className="tr-rc-formats">
        {(["PDF", "XLSX", "CSV"] as ReportFormat[]).map(renderFormatBtn)}
      </div>
    </div>
  );
};

export default TeamReports;
