import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiBriefcase,
  FiUsers,
  FiLayers,
  FiCheckCircle,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiUserPlus,
  FiTrendingUp,
  FiDollarSign,
  FiGrid,
  FiBarChart2,
  FiMoreHorizontal,
  FiX,
  FiArrowRight,
} from 'react-icons/fi';
import './HROrganization.css';

interface Employee {
  name: string;
  role: string;
  initials: string;
}

interface Department {
  id: string;
  name: string;
  shortName: string;
  head: string;
  role: string;
  initials: string;
  total: number;
  budget: string;
  openPositions: number;
  growth: string;
  status: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'orange' | 'green' | 'cyan';
  employees: Employee[];
}

const INITIAL_DEPARTMENTS: Department[] = [];

export const HROrganization: React.FC = () => {
  const navigate = useNavigate();
  const { teamMembers = [] } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({});
  const [activeMenuDept, setActiveMenuDept] = useState<Department | null>(null);

  const ceoMember = useMemo(() => {
    return teamMembers.find(
      (m) =>
        m.designation?.toLowerCase().includes('ceo') ||
        m.designation?.toLowerCase().includes('chief executive') ||
        m.designation?.toLowerCase().includes('director') ||
        m.role === 'admin'
    );
  }, [teamMembers]);

  const departments: Department[] = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) return [];

    const groups: Record<string, any[]> = {};
    teamMembers.forEach((m) => {
      const dept = (m as any).department || (m.role === 'hr' ? 'HR & Operations' : 'Engineering');
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(m);
    });

    const colors: ('blue' | 'purple' | 'orange' | 'green' | 'cyan')[] = ['blue', 'purple', 'green', 'orange', 'cyan'];

    return Object.entries(groups).map(([deptName, members], idx) => {
      const head = members[0];
      const initials = (head?.name || deptName).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      return {
        id: deptName.toLowerCase().replace(/\s+/g, '-'),
        name: deptName,
        shortName: deptName,
        head: head?.name || 'Lead',
        role: head?.designation || head?.role || 'Manager',
        initials,
        total: members.length,
        budget: `₹${(members.length * 8).toFixed(1)}L`,
        openPositions: 0,
        growth: 'Stable',
        status: 'Active',
        icon: <FiLayers />,
        color: colors[idx % colors.length],
        employees: members.map((m) => ({
          name: m.name,
          role: m.designation || m.role || 'Staff',
          initials: (m.name || 'EM').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        })),
      };
    });
  }, [teamMembers]);

  const totalEmployees = departments.reduce((sum, department) => sum + department.total, 0);
  const totalOpenPositions = departments.reduce((sum, department) => sum + department.openPositions, 0);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesDepartment =
        selectedDepartment === 'All' || department.shortName === selectedDepartment;

      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        department.name.toLowerCase().includes(searchValue) ||
        department.head.toLowerCase().includes(searchValue) ||
        department.role.toLowerCase().includes(searchValue) ||
        department.employees.some(
          (employee) =>
            employee.name.toLowerCase().includes(searchValue) ||
            employee.role.toLowerCase().includes(searchValue)
        );

      return matchesDepartment && matchesSearch;
    });
  }, [searchTerm, selectedDepartment, departments]);

  const toggleDepartment = (shortName: string) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [shortName]: !prev[shortName],
    }));
  };

  const handleNavigateMore = (shortName: string) => {
    navigate(`/hr/employees?dept=${encodeURIComponent(shortName)}`);
  };

  return (
    <div className="app-container hr-org-mobile-container">
      <AppHeader title="Organization Structure" showBack />

      <main className="page-content hr-org-page-content">
        {/* Mobile Header Banner & Add Action */}
        <section className="hr-org-header-card">
          <div className="hr-org-eyebrow">
            <span className="hr-org-eyebrow-dot" />
            <span>Workforce Management</span>
          </div>

          <h2 className="hr-org-title">Organization Structure</h2>
          <p className="hr-org-desc">
            Manage departments, reporting structures, workforce distribution, and organizational insights.
          </p>

          <button
            type="button"
            className="hr-org-add-btn"
            onClick={() => navigate('/hr/employees/add')}
          >
            <FiUserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </section>

        {/* Overview Stats (2-Column Mobile Grid) */}
        <section className="hr-org-stats-grid">
          <div className="hr-org-stat-card">
            <div className="hr-org-stat-icon blue">
              <FiUsers size={20} />
            </div>
            <div className="hr-org-stat-content">
              <span className="hr-org-stat-label">Total Employees</span>
              <strong className="hr-org-stat-val">{totalEmployees}</strong>
              <small className="hr-org-stat-sub text-green">
                <FiTrendingUp /> +9.4% this year
              </small>
            </div>
          </div>

          <div className="hr-org-stat-card">
            <div className="hr-org-stat-icon purple">
              <FiGrid size={20} />
            </div>
            <div className="hr-org-stat-content">
              <span className="hr-org-stat-label">Departments</span>
              <strong className="hr-org-stat-val">{departments.length}</strong>
              <small className="hr-org-stat-sub">All active</small>
            </div>
          </div>

          <div className="hr-org-stat-card">
            <div className="hr-org-stat-icon orange">
              <FiUserPlus size={20} />
            </div>
            <div className="hr-org-stat-content">
              <span className="hr-org-stat-label">Open Positions</span>
              <strong className="hr-org-stat-val">{totalOpenPositions}</strong>
              <small className="hr-org-stat-sub">Across all depts</small>
            </div>
          </div>

          <div className="hr-org-stat-card">
            <div className="hr-org-stat-icon green">
              <FiBarChart2 size={20} />
            </div>
            <div className="hr-org-stat-content">
              <span className="hr-org-stat-label">Workforce Growth</span>
              <strong className="hr-org-stat-val">9.4%</strong>
              <small className="hr-org-stat-sub text-green">
                <FiTrendingUp /> Positive trend
              </small>
            </div>
          </div>
        </section>

        {/* Search & Department Filter Toolbar */}
        <section className="hr-org-toolbar-section">
          <div className="hr-org-search-box">
            <FiSearch className="hr-org-search-icon" size={17} />
            <input
              type="text"
              className="hr-org-search-input"
              placeholder="Search departments, managers or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="hr-org-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear Search"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          <div className="hr-org-filter-pills-scroll">
            {['All', 'Engineering', 'Product', 'Sales', 'HR', 'Finance'].map((d) => (
              <button
                key={d}
                type="button"
                className={`hr-org-filter-pill ${selectedDepartment === d ? 'active' : ''}`}
                onClick={() => setSelectedDepartment(d)}
              >
                {d === 'All' ? 'All Departments' : d}
              </button>
            ))}
          </div>
        </section>

        {/* Department Cards Section */}
        <section className="hr-org-departments-section">
          <div className="hr-org-section-header">
            <div>
              <h3 className="hr-org-section-heading">Departments</h3>
              <p className="hr-org-section-sub">Overview of teams and departmental performance.</p>
            </div>
            <span className="hr-org-result-badge">{filteredDepartments.length} Depts</span>
          </div>

          <div className="hr-org-department-cards-list">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="hr-org-dept-card">
                {/* Top: Icon, Status, More */}
                <div className="hr-org-dept-top">
                  <div className={`hr-org-dept-icon ${department.color}`}>
                    {department.icon}
                  </div>

                  <div className="hr-org-dept-top-right">
                    <span className={`hr-org-status-badge ${department.color}`}>
                      {department.status}
                    </span>
                    <button
                      type="button"
                      className="hr-org-more-btn"
                      onClick={() => setActiveMenuDept(department)}
                      aria-label="Department Options"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="hr-org-dept-name">{department.name}</h4>

                {/* Manager / Lead Row */}
                <div
                  className="hr-org-dept-manager-row"
                  onClick={() => handleNavigateMore(department.shortName)}
                >
                  <div className="hr-org-lead-avatar">{department.initials}</div>
                  <div className="hr-org-lead-info">
                    <span className="hr-org-lead-tag">Department Lead</span>
                    <strong className="hr-org-lead-name">{department.head}</strong>
                    <span className="hr-org-lead-role">{department.role}</span>
                  </div>
                  <FiChevronRight className="hr-org-lead-chevron" size={16} />
                </div>

                {/* 3-Column Metrics */}
                <div className="hr-org-metrics-row">
                  <div className="hr-org-metric-col">
                    <span className="hr-org-metric-label">Team Size</span>
                    <strong className="hr-org-metric-value">{department.total}</strong>
                  </div>
                  <div className="hr-org-metric-col">
                    <span className="hr-org-metric-label">Open Roles</span>
                    <strong className="hr-org-metric-value">{department.openPositions}</strong>
                  </div>
                  <div className="hr-org-metric-col">
                    <span className="hr-org-metric-label">Growth</span>
                    <strong className="hr-org-metric-value text-green">{department.growth}</strong>
                  </div>
                </div>

                {/* Annual Budget Row */}
                <div className="hr-org-budget-row">
                  <div>
                    <span className="hr-org-budget-label">Annual Budget</span>
                    <strong className="hr-org-budget-value">{department.budget}</strong>
                  </div>
                  <div className="hr-org-budget-icon-wrap">
                    <FiDollarSign size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Organization Chart Section */}
        <section className="hr-org-chart-section">
          <div className="hr-org-section-header">
            <div>
              <h3 className="hr-org-section-heading">Organization Chart</h3>
              <p className="hr-org-section-sub">View reporting relationships and team hierarchy.</p>
            </div>
          </div>

          <div className="hr-org-mobile-tree-card">
            {/* CEO Card */}
            <div className="hr-org-tree-ceo-box">
              <div className="hr-org-person-card ceo-card">
                <div className="hr-org-person-avatar ceo-avatar">
                  {ceoMember ? ceoMember.name.slice(0, 2).toUpperCase() : 'EX'}
                </div>
                <div className="hr-org-person-info">
                  <strong>{ceoMember ? ceoMember.name : 'Executive Leadership'}</strong>
                  <span>{ceoMember?.designation || 'Chief Executive Officer'}</span>
                </div>
              </div>
              <div className="hr-org-tree-stem-line" />
            </div>

            {/* Department Managers & Teams */}
            <div className="hr-org-tree-branches">
              {filteredDepartments.map((department) => {
                const isExpanded = !!expandedDepartments[department.shortName];
                const moreCount = Math.max(
                  department.total - department.employees.length - 1,
                  0
                );

                return (
                  <div key={department.id} className="hr-org-tree-node">
                    {/* Manager Card */}
                    <div className="hr-org-person-card manager-card">
                      <div className={`hr-org-person-avatar ${department.color}`}>
                        {department.initials}
                      </div>

                      <div className="hr-org-person-info">
                        <strong>{department.head}</strong>
                        <span>{department.role} · {department.shortName}</span>
                      </div>

                      <button
                        type="button"
                        className="hr-org-tree-expand-btn"
                        onClick={() => toggleDepartment(department.shortName)}
                        aria-label={`Toggle ${department.name}`}
                      >
                        {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                      </button>
                    </div>

                    {/* Reporting Employees List (when expanded) */}
                    {isExpanded && (
                      <div className="hr-org-tree-sublist">
                        {department.employees.map((employee) => (
                          <div
                            key={employee.name}
                            className="hr-org-person-card employee-card"
                            onClick={() => navigate(`/hr/employees?search=${encodeURIComponent(employee.name)}`)}
                          >
                            <div className="hr-org-person-avatar emp-avatar">
                              {employee.initials}
                            </div>
                            <div className="hr-org-person-info">
                              <strong>{employee.name}</strong>
                              <span>{employee.role}</span>
                            </div>
                          </div>
                        ))}

                        {moreCount > 0 && (
                          <div
                            className="hr-org-tree-more-link"
                            onClick={() => handleNavigateMore(department.shortName)}
                            role="button"
                            tabIndex={0}
                          >
                            <span>+{moreCount} more team members</span>
                            <FiArrowRight size={13} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workforce Insights Section */}
        <section className="hr-org-insights-section">
          <div className="hr-org-section-header">
            <div>
              <h3 className="hr-org-section-heading">Workforce Insights</h3>
              <p className="hr-org-section-sub">Quick organizational metrics for HR decision making.</p>
            </div>
          </div>

          <div className="hr-org-insights-list">
            <div className="hr-org-insight-item">
              <div className="hr-org-insight-icon-wrap icon-orange">
                <FiTrendingUp size={20} />
              </div>
              <div className="hr-org-insight-body">
                <span className="hr-org-insight-label">Fastest Growing Team</span>
                <strong className="hr-org-insight-val">Sales & Growth</strong>
                <small className="hr-org-insight-sub">15% workforce growth</small>
              </div>
            </div>

            <div className="hr-org-insight-item">
              <div className="hr-org-insight-icon-wrap icon-blue">
                <FiUsers size={20} />
              </div>
              <div className="hr-org-insight-body">
                <span className="hr-org-insight-label">Largest Department</span>
                <strong className="hr-org-insight-val">Engineering & Tech</strong>
                <small className="hr-org-insight-sub">45 employees</small>
              </div>
            </div>

            <div className="hr-org-insight-item">
              <div className="hr-org-insight-icon-wrap icon-purple">
                <FiUserPlus size={20} />
              </div>
              <div className="hr-org-insight-body">
                <span className="hr-org-insight-label">Hiring Priority</span>
                <strong className="hr-org-insight-val">Engineering</strong>
                <small className="hr-org-insight-sub">6 open positions</small>
              </div>
            </div>

            <div className="hr-org-insight-item">
              <div className="hr-org-insight-icon-wrap icon-green">
                <FiBarChart2 size={20} />
              </div>
              <div className="hr-org-insight-body">
                <span className="hr-org-insight-label">Organization Health</span>
                <strong className="hr-org-insight-val">Healthy</strong>
                <small className="hr-org-insight-sub text-green">Positive workforce trend</small>
              </div>
            </div>
          </div>
        </section>

        {/* Department Options Bottom Action Sheet Modal */}
        {activeMenuDept && (
          <div className="hr-org-modal-overlay" onClick={() => setActiveMenuDept(null)}>
            <div className="hr-org-bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="hr-org-sheet-header">
                <div className="hr-org-sheet-title-row">
                  <div className={`hr-org-dept-icon ${activeMenuDept.color} small`}>
                    {activeMenuDept.icon}
                  </div>
                  <div>
                    <h4>{activeMenuDept.name}</h4>
                    <p>{activeMenuDept.total} Employees • {activeMenuDept.budget}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="hr-org-sheet-close"
                  onClick={() => setActiveMenuDept(null)}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="hr-org-sheet-actions">
                <button
                  type="button"
                  className="hr-org-sheet-action-btn"
                  onClick={() => {
                    const dept = activeMenuDept.shortName;
                    setActiveMenuDept(null);
                    navigate(`/hr/employees?dept=${encodeURIComponent(dept)}`);
                  }}
                >
                  <FiUsers size={18} />
                  <span>View All {activeMenuDept.shortName} Employees</span>
                </button>

                <button
                  type="button"
                  className="hr-org-sheet-action-btn"
                  onClick={() => {
                    setActiveMenuDept(null);
                    navigate('/hr/employees/add');
                  }}
                >
                  <FiUserPlus size={18} />
                  <span>Add Member to {activeMenuDept.shortName}</span>
                </button>

                <button
                  type="button"
                  className="hr-org-sheet-action-btn"
                  onClick={() => {
                    setActiveMenuDept(null);
                    navigate('/hr/reports');
                  }}
                >
                  <FiBarChart2 size={18} />
                  <span>View Department Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HROrganization;
