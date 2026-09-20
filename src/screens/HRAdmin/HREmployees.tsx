import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Search, X, Briefcase, Mail, Calendar, Eye, Edit2 } from 'lucide-react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import { getEmployees, EmployeeRecord } from '../../data/employeeStore';
import './HREmployees.css';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Design',
  'Human Resources',
];

export const HREmployees: React.FC = () => {
  const navigate = useNavigate();
  const { teamMembers = [] } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialDept = searchParams.get('dept') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState(initialDept);

  const rawEmployees: EmployeeRecord[] = getEmployees();

  const employees: EmployeeRecord[] = useMemo(() => {
    const list: EmployeeRecord[] = [];
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();

    // 1. Add employees from persistent store first (newly created or modified)
    rawEmployees.forEach((emp) => {
      list.push(emp);
      seenIds.add(emp.id.toLowerCase());
      if (emp.email) seenEmails.add(emp.email.toLowerCase());
    });

    // 2. Add team members from backend API that are not yet in store
    if (teamMembers && teamMembers.length > 0) {
      teamMembers.forEach((m) => {
        const idLower = (m.id || m.employeeId || '').toLowerCase();
        const emailLower = (m.email || '').toLowerCase();
        if (!seenIds.has(idLower) && (!emailLower || !seenEmails.has(emailLower))) {
          const names = (m.name || '').split(' ');
          list.push({
            id: m.id || m.employeeId || 'EMP',
            name: m.name || 'Employee',
            firstName: names[0] || (m as any).firstName || 'Employee',
            lastName: names.slice(1).join(' ') || (m as any).lastName || '',
            email: m.email || '',
            phone: m.phone || '—',
            department: (m as any).department || (m.role === 'hr' ? 'Human Resources' : 'Engineering'),
            role: m.designation || m.role || 'Staff',
            status: (m.status as any) || 'Active',
            joinDate: '2024-01-01',
            avatarBg: m.color || '#2F6FED',
          });
          seenIds.add(idLower);
          if (emailLower) seenEmails.add(emailLower);
        }
      });
    }

    return list;
  }, [teamMembers, rawEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        emp.name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.id.toLowerCase().includes(search) ||
        emp.role.toLowerCase().includes(search);

      const matchesDept =
        selectedDept === 'All' ||
        emp.department.toLowerCase().includes(selectedDept.toLowerCase()) ||
        (selectedDept === 'Product & Design' && emp.department.includes('Product')) ||
        (selectedDept === 'HR & Operations' && emp.department.includes('HR')) ||
        (selectedDept === 'Sales & Marketing' && emp.department.includes('Sales')) ||
        (selectedDept === 'Finance & Legal' && emp.department.includes('Finance'));

      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept, employees]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="app-container hr-emp-mobile-app">
      <AppHeader title="Employee Directory" showBack />

      <main className="page-content hr-emp-page-content">
        {/* Top Header Card */}
        <section className="hr-emp-header-card">
          <div className="hr-emp-header-left">
            <h2 className="hr-emp-main-title">Employee Directory</h2>
            <p className="hr-emp-sub-title">Manage your workforce, records & assignments</p>
          </div>

          <button
            type="button"
            className="hr-emp-add-btn"
            onClick={() => navigate('/hr/employees/add')}
            aria-label="Add New Employee"
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </section>

        {/* Mobile Search Bar */}
        <section className="hr-emp-search-section">
          <div className="hr-emp-search-bar">
            <Search className="hr-emp-search-icon" size={17} />
            <input
              type="text"
              className="hr-emp-search-input"
              placeholder="Search by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="hr-emp-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Department Filter Chips */}
          <div className="hr-emp-filter-chips-scroll">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                className={`hr-emp-filter-chip ${selectedDept === dept ? 'active' : ''}`}
                onClick={() => setSelectedDept(dept)}
              >
                {dept === 'All' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        </section>

        {/* Counter Header */}
        <div className="hr-emp-list-meta-row">
          <span className="hr-emp-count-text">
            Showing <strong>{filteredEmployees.length}</strong> of {employees.length} Employees
          </span>
          {selectedDept !== 'All' && (
            <span className="hr-emp-active-filter-badge">
              Filter: {selectedDept}
            </span>
          )}
        </div>

        {/* Mobile Employee Cards List */}
        <div className="hr-emp-cards-list">
          {filteredEmployees.length === 0 ? (
            <div className="hr-emp-empty-state">
              <div className="hr-emp-empty-icon-wrap">
                <Briefcase size={28} />
              </div>
              <h4>No employees found</h4>
              <p>Try adjusting your search criteria or resetting the department filter.</p>
              <button
                type="button"
                className="hr-emp-reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const initials = emp.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const statusClass = emp.status.toLowerCase().replace(/\s+/g, '-');

              return (
                <div key={emp.id} className="hr-emp-card">
                  {/* Top Profile Row */}
                  <div className="hr-emp-card-header">
                    <div
                      className="hr-emp-avatar"
                      style={{ backgroundColor: emp.avatarBg || '#2F6FED' }}
                    >
                      {initials}
                    </div>

                    <div className="hr-emp-header-info">
                      <div className="hr-emp-name-row">
                        <strong
                          className="hr-emp-name"
                          onClick={() => navigate(`/hr/employees/${emp.id}`)}
                        >
                          {emp.name}
                        </strong>
                        <span className={`hr-emp-status-badge status-${statusClass}`}>
                          {emp.status}
                        </span>
                      </div>
                      <span className="hr-emp-id-tag">{emp.id}</span>
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="hr-emp-role-dept-box">
                    <div className="hr-emp-info-pill">
                      <Briefcase size={13} />
                      <span>{emp.role}</span>
                    </div>
                    <span className="hr-emp-dept-text">{emp.department}</span>
                  </div>

                  {/* Email & Joined Date Meta */}
                  <div className="hr-emp-meta-details">
                    <div className="hr-emp-meta-item">
                      <Mail size={13} />
                      <span>{emp.email}</span>
                    </div>
                    <div className="hr-emp-meta-item">
                      <Calendar size={13} />
                      <span>Joined {formatDate(emp.joinDate)}</span>
                    </div>
                  </div>

                  {/* Touch Action Buttons */}
                  <div className="hr-emp-card-actions">
                    <button
                      type="button"
                      className="hr-emp-action-btn btn-view"
                      onClick={() => navigate(`/hr/employees/${emp.id}`)}
                    >
                      <Eye size={15} />
                      <span>View Profile</span>
                    </button>

                    <button
                      type="button"
                      className="hr-emp-action-btn btn-edit"
                      onClick={() => navigate(`/hr/employees/${emp.id}/edit`)}
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HREmployees;
