import React, { useMemo, useState, useEffect } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import {
  FiCheck,
  FiChevronDown,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
  FiDownload,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiCheckCircle,
  FiLayers,
  FiSliders,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import './HRRolesPermissions.css';

interface RolePermissionsMap {
  [module: string]: string[];
}

interface RoleItem {
  id: string;
  role: string;
  description: string;
  users: number;
  status: 'Active' | 'Inactive';
  scope: string;
  permissions: RolePermissionsMap;
}

const MODULES = [
  'Employees',
  'Attendance',
  'Leave',
  'Payroll',
  'Documents',
  'Reports',
  'Recruitment',
  'Settings',
  'Biometric',
  'Audit Logs',
];

const PERMISSION_KEYS = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const PERMISSION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
};

const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'ROLE-001',
    role: 'Super Admin',
    description: 'Full platform administration and security control',
    users: 0,
    status: 'Active',
    scope: 'Organization-wide',
    permissions: {
      Employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Leave: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Payroll: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Documents: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Reports: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Recruitment: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Settings: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      Biometric: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      'Audit Logs': ['view', 'export'],
    },
  },
  {
    id: 'ROLE-002',
    role: 'HR Administrator',
    description: 'Manage employees, HR operations and approvals',
    users: 0,
    status: 'Active',
    scope: 'All HR modules',
    permissions: {
      Employees: ['view', 'create', 'edit', 'delete', 'export'],
      Attendance: ['view', 'create', 'edit', 'approve', 'export'],
      Leave: ['view', 'create', 'edit', 'approve', 'export'],
      Payroll: ['view', 'create', 'edit', 'approve', 'export'],
      Documents: ['view', 'create', 'edit', 'delete', 'export'],
      Reports: ['view', 'export'],
      Recruitment: ['view', 'create', 'edit', 'approve', 'export'],
      Settings: ['view'],
      Biometric: ['view', 'edit'],
      'Audit Logs': ['view', 'export'],
    },
  },
  {
    id: 'ROLE-003',
    role: 'HR Executive',
    description: 'Day-to-day HR operations and employee services',
    users: 0,
    status: 'Active',
    scope: 'HR operations',
    permissions: {
      Employees: ['view', 'create', 'edit', 'export'],
      Attendance: ['view', 'edit', 'export'],
      Leave: ['view', 'create', 'edit', 'approve', 'export'],
      Payroll: ['view', 'export'],
      Documents: ['view', 'create', 'edit', 'export'],
      Reports: ['view', 'export'],
      Recruitment: ['view', 'create', 'edit'],
      Settings: [],
      Biometric: ['view'],
      'Audit Logs': ['view'],
    },
  },
  {
    id: 'ROLE-004',
    role: 'Department Manager',
    description: 'Team-level management, approvals and reporting',
    users: 0,
    status: 'Active',
    scope: 'Assigned department',
    permissions: {
      Employees: ['view'],
      Attendance: ['view', 'approve', 'export'],
      Leave: ['view', 'approve', 'export'],
      Payroll: ['view'],
      Documents: ['view', 'create', 'edit'],
      Reports: ['view', 'export'],
      Recruitment: ['view', 'approve'],
      Settings: [],
      Biometric: [],
      'Audit Logs': [],
    },
  },
  {
    id: 'ROLE-005',
    role: 'Finance Manager',
    description: 'Payroll, financial reports and compensation access',
    users: 0,
    status: 'Active',
    scope: 'Finance & payroll',
    permissions: {
      Employees: ['view', 'export'],
      Attendance: ['view', 'export'],
      Leave: ['view', 'export'],
      Payroll: ['view', 'create', 'edit', 'approve', 'export'],
      Documents: ['view', 'export'],
      Reports: ['view', 'export'],
      Recruitment: [],
      Settings: [],
      Biometric: [],
      'Audit Logs': ['view', 'export'],
    },
  },
  {
    id: 'ROLE-006',
    role: 'Employee',
    description: 'Self-service access for individual employee data',
    users: 0,
    status: 'Active',
    scope: 'Own records',
    permissions: {
      Employees: ['view'],
      Attendance: ['view', 'create'],
      Leave: ['view', 'create'],
      Payroll: ['view'],
      Documents: ['view', 'create'],
      Reports: [],
      Recruitment: [],
      Settings: ['view'],
      Biometric: [],
      'Audit Logs': [],
    },
  },
];

const ROLE_COLORS = ['purple', 'blue', 'indigo', 'green', 'orange', 'cyan'];

function clonePermissions(permissions: RolePermissionsMap): RolePermissionsMap {
  return Object.fromEntries(
    Object.entries(permissions).map(([module, actions]) => [module, [...actions]])
  );
}

function emptyPermissions(): RolePermissionsMap {
  return Object.fromEntries(MODULES.map((module) => [module, []]));
}

function countPermissions(permissions: RolePermissionsMap): number {
  return Object.values(permissions).reduce((total, actions) => total + actions.length, 0);
}

export const HRRolesPermissions: React.FC = () => {
  const { teamMembers } = useAuth();
  const [roles, setRoles] = useState<RoleItem[]>(() => {
    const saved = localStorage.getItem('belnova_roles_permissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((r) => r.users === 1248 || r.users === 24)) {
          localStorage.removeItem('belnova_roles_permissions');
          return INITIAL_ROLES;
        }
        return parsed;
      } catch {
        return INITIAL_ROLES;
      }
    }
    return INITIAL_ROLES;
  });

  useEffect(() => {
    setRoles((current) =>
      current.map((role) => {
        let count = 0;
        if (role.role === 'Super Admin') {
          count = 1;
        } else if (role.role === 'HR Administrator' || role.role === 'HR Executive') {
          count = teamMembers.filter((m) => m.role === 'hr_admin' || m.department === 'Human Resources').length;
        } else if (role.role === 'Department Manager') {
          count = teamMembers.filter((m) => m.role === 'manager' || m.designation?.toLowerCase().includes('manager')).length;
        } else if (role.role === 'Finance Manager') {
          count = teamMembers.filter((m) => m.department === 'Finance').length;
        } else if (role.role === 'Employee') {
          count = teamMembers.length;
        }
        return { ...role, users: count };
      })
    );
  }, [teamMembers]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(INITIAL_ROLES[0].id);
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionsMap>(
    clonePermissions(INITIAL_ROLES[0].permissions)
  );

  // View switch: 'matrix' (permissions) or 'roles' (roles list)
  const [activeTab, setActiveTab] = useState<'matrix' | 'roles'>('matrix');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals & Bottom Sheets
  const [modal, setModal] = useState<'addRole' | 'editRole' | 'filter' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [dirty, setDirty] = useState(false);

  // Role Form State
  const [roleForm, setRoleForm] = useState({
    role: '',
    description: '',
    users: '0',
    scope: 'Organization-wide',
  });

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.role.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query);

      const matchesFilter = roleFilter === 'All' || role.status === roleFilter;

      return matchesSearch && matchesFilter;
    });
  }, [roles, search, roleFilter]);

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);
  const activeRoles = roles.filter((role) => role.status === 'Active').length;

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const selectRole = (role: RoleItem) => {
    if (dirty) {
      const shouldContinue = window.confirm(
        'You have unsaved permission changes. Discard them and switch roles?'
      );
      if (!shouldContinue) return;
    }

    setSelectedRoleId(role.id);
    setDraftPermissions(clonePermissions(role.permissions));
    setDirty(false);
    setActiveTab('matrix');
    showToast(`Loaded ${role.role} permissions.`, 'info');
  };

  const isPermissionEnabled = (module: string, permission: string) =>
    draftPermissions[module]?.includes(permission);

  const togglePermission = (module: string, permission: string) => {
    if (selectedRole.role === 'Super Admin') {
      showToast('Super Admin permissions cannot be restricted.', 'error');
      return;
    }

    setDraftPermissions((current) => {
      const existing = current[module] || [];
      const next = existing.includes(permission)
        ? existing.filter((item) => item !== permission)
        : [...existing, permission];

      return {
        ...current,
        [module]: next,
      };
    });

    setDirty(true);
  };

  const toggleModule = (module: string, enabled: boolean) => {
    if (selectedRole.role === 'Super Admin') {
      showToast('Super Admin permissions cannot be restricted.', 'error');
      return;
    }

    setDraftPermissions((current) => ({
      ...current,
      [module]: enabled ? [...PERMISSION_KEYS] : [],
    }));

    setDirty(true);
  };

  const toggleAllPermission = (permission: string, enabled: boolean) => {
    if (selectedRole.role === 'Super Admin') {
      showToast('Super Admin permissions cannot be restricted.', 'error');
      return;
    }

    setDraftPermissions((current) => {
      const next = { ...current };

      MODULES.forEach((module) => {
        const existing = next[module] || [];
        next[module] = enabled
          ? Array.from(new Set([...existing, permission]))
          : existing.filter((item) => item !== permission);
      });

      return next;
    });

    setDirty(true);
  };

  const toggleGlobalSelectAll = () => {
    if (selectedRole.role === 'Super Admin') {
      showToast('Super Admin permissions are always enabled.', 'error');
      return;
    }

    const enableAll = !MODULES.every((module) =>
      PERMISSION_KEYS.every((permission) => draftPermissions[module]?.includes(permission))
    );

    setDraftPermissions(
      enableAll
        ? Object.fromEntries(MODULES.map((module) => [module, [...PERMISSION_KEYS]]))
        : emptyPermissions()
    );
    setDirty(true);
    showToast(enableAll ? 'All permissions enabled for this role.' : 'All permissions cleared.', 'info');
  };

  const saveChanges = () => {
    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              permissions: clonePermissions(draftPermissions),
            }
          : role
      )
    );

    setDirty(false);
    showToast(`${selectedRole.role} permissions saved successfully!`, 'success');
  };

  const resetChanges = () => {
    setDraftPermissions(clonePermissions(selectedRole.permissions));
    setDirty(false);
    showToast('Unsaved permission changes were discarded.', 'info');
  };

  const openEditRole = () => {
    setRoleForm({
      role: selectedRole.role,
      description: selectedRole.description,
      users: String(selectedRole.users),
      scope: selectedRole.scope,
    });
    setModal('editRole');
  };

  const openAddRole = () => {
    setRoleForm({
      role: '',
      description: '',
      users: '0',
      scope: 'Organization-wide',
    });
    setModal('addRole');
  };

  const submitRole = (event: React.FormEvent) => {
    event.preventDefault();

    const roleName = roleForm.role.trim();
    if (!roleName) {
      showToast('Role name is required.', 'error');
      return;
    }

    if (modal === 'editRole') {
      setRoles((current) =>
        current.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                role: roleName,
                description: roleForm.description.trim() || 'Custom HRMS role',
                users: Number(roleForm.users) || 0,
                scope: roleForm.scope,
              }
            : role
        )
      );
      setModal(null);
      showToast('Role details updated successfully.', 'success');
      return;
    }

    const newRole: RoleItem = {
      id: `ROLE-${String(roles.length + 1).padStart(3, '0')}`,
      role: roleName,
      description: roleForm.description.trim() || 'Custom HRMS role',
      users: Number(roleForm.users) || 0,
      status: 'Active',
      scope: roleForm.scope,
      permissions: emptyPermissions(),
    };

    setRoles((current) => [...current, newRole]);
    setSelectedRoleId(newRole.id);
    setDraftPermissions(emptyPermissions());
    setDirty(false);
    setModal(null);
    setActiveTab('matrix');
    showToast(`New role "${newRole.role}" created successfully!`, 'success');
  };

  const deleteRole = () => {
    if (selectedRole.role === 'Super Admin') {
      showToast('The Super Admin role cannot be deleted.', 'error');
      return;
    }

    if (selectedRole.users > 0) {
      showToast('Reassign users before deleting this role.', 'error');
      return;
    }

    const shouldDelete = window.confirm(
      `Delete the ${selectedRole.role} role? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    const remainingRoles = roles.filter((role) => role.id !== selectedRole.id);
    const nextRole = remainingRoles[0];

    setRoles(remainingRoles);
    setSelectedRoleId(nextRole.id);
    setDraftPermissions(clonePermissions(nextRole.permissions));
    setDirty(false);
    showToast(`Role "${selectedRole.role}" deleted.`, 'info');
  };

  const exportRoles = () => {
    const rows = roles.flatMap((role) =>
      MODULES.flatMap((module) =>
        PERMISSION_KEYS.map((permission) => [
          role.role,
          role.status,
          role.users,
          role.scope,
          module,
          permission,
          role.permissions[module]?.includes(permission) ? 'Allowed' : 'Denied',
        ])
      )
    );

    const escape = (value: any) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [
      ['Role', 'Status', 'Assigned Users', 'Scope', 'Module', 'Permission', 'Access'],
      ...rows,
    ]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'roles-and-permissions.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    showToast('Roles and permissions exported successfully.', 'success');
  };

  const hasAnyPermission = (module: string) => (draftPermissions[module] || []).length > 0;

  return (
    <div className="bel-rbac-page-container">
      {/* App Header */}
      <AppHeader title="Roles & Permissions" showBack={false} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`bel-rbac-toast bel-rbac-toast--${toast.type}`} role="alert">
          {toast.type === 'success' && <FiCheckCircle className="bel-rbac-toast-icon" />}
          {toast.type === 'error' && <FiAlertCircle className="bel-rbac-toast-icon" />}
          {toast.type === 'info' && <FiShield className="bel-rbac-toast-icon" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bel-rbac-scroll-content">
        {/* Mobile Header Hero */}
        <div className="bel-rbac-hero-header">
          <div className="bel-rbac-hero-text">
            <h1 className="bel-rbac-title">Roles & Access Control</h1>
            <p className="bel-rbac-subtitle">Configure granular security rules and permissions</p>
          </div>

          <div className="bel-rbac-header-actions">
            <button
              type="button"
              className="bel-rbac-btn-export"
              onClick={exportRoles}
              aria-label="Export RBAC CSV"
              title="Export CSV"
            >
              <FiDownload />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="bel-rbac-btn-add"
              onClick={openAddRole}
              aria-label="Create Custom Role"
            >
              <FiPlus />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {/* Dynamic RBAC KPI 2x2 Summary Cards */}
        <section className="bel-rbac-summary-grid" aria-label="Security Metrics Summary">
          <div className="bel-rbac-stat-card bel-rbac-stat-card--roles">
            <div className="bel-rbac-stat-icon-wrap">
              <FiShield />
            </div>
            <div className="bel-rbac-stat-data">
              <strong className="bel-rbac-stat-number">{roles.length}</strong>
              <span className="bel-rbac-stat-label">Total Roles</span>
            </div>
          </div>

          <div className="bel-rbac-stat-card bel-rbac-stat-card--users">
            <div className="bel-rbac-stat-icon-wrap">
              <FiUsers />
            </div>
            <div className="bel-rbac-stat-data">
              <strong className="bel-rbac-stat-number">{totalUsers.toLocaleString()}</strong>
              <span className="bel-rbac-stat-label">Assigned Users</span>
            </div>
          </div>

          <div className="bel-rbac-stat-card bel-rbac-stat-card--active">
            <div className="bel-rbac-stat-icon-wrap">
              <FiCheck />
            </div>
            <div className="bel-rbac-stat-data">
              <strong className="bel-rbac-stat-number">{activeRoles}</strong>
              <span className="bel-rbac-stat-label">Active Roles</span>
            </div>
          </div>

          <div className="bel-rbac-stat-card bel-rbac-stat-card--perms">
            <div className="bel-rbac-stat-icon-wrap">
              <FiSliders />
            </div>
            <div className="bel-rbac-stat-data">
              <strong className="bel-rbac-stat-number">{countPermissions(draftPermissions)}</strong>
              <span className="bel-rbac-stat-label">Role Permissions</span>
            </div>
          </div>
        </section>

        {/* Mobile Segmented Navigation */}
        <div className="bel-rbac-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'matrix'}
            className={`bel-rbac-tab-btn ${activeTab === 'matrix' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            <FiSliders />
            <span>Permissions ({selectedRole.role})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'roles'}
            className={`bel-rbac-tab-btn ${activeTab === 'roles' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <FiShield />
            <span>Role Directory ({roles.length})</span>
          </button>
        </div>

        {/* =========================================================
            TAB 1: PERMISSION MATRIX & SELECTED ROLE PROFILE
            ========================================================= */}
        {activeTab === 'matrix' && (
          <section className="bel-rbac-matrix-section">
            {/* Selected Role Profile Hero Card */}
            <article className="bel-rbac-role-hero-card">
              <div className="bel-rbac-hero-top-row">
                <div className="bel-rbac-hero-title-group">
                  <div className="bel-rbac-role-avatar-shield">
                    <FiShield />
                  </div>
                  <div>
                    <div className="bel-rbac-role-name-row">
                      <h2>{selectedRole.role}</h2>
                      <span className={`bel-rbac-status-pill bel-rbac-status-pill--${selectedRole.status.toLowerCase()}`}>
                        {selectedRole.status}
                      </span>
                    </div>
                    <p className="bel-rbac-hero-desc">{selectedRole.description}</p>
                  </div>
                </div>

                <div className="bel-rbac-hero-actions">
                  <button
                    type="button"
                    className="bel-rbac-btn-edit-role"
                    onClick={openEditRole}
                    aria-label="Edit Role Details"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>

                  {selectedRole.role !== 'Super Admin' && (
                    <button
                      type="button"
                      className="bel-rbac-btn-delete-role"
                      onClick={deleteRole}
                      aria-label="Delete Role"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Metadata Row */}
              <div className="bel-rbac-role-meta-row">
                <div className="bel-rbac-meta-cell">
                  <small>Assigned</small>
                  <strong>{selectedRole.users.toLocaleString()} Users</strong>
                </div>
                <div className="bel-rbac-meta-cell">
                  <small>Scope</small>
                  <strong>{selectedRole.scope}</strong>
                </div>
                <div className="bel-rbac-meta-cell">
                  <small>Active Perms</small>
                  <strong className="bel-rbac-color-primary">{countPermissions(draftPermissions)} Enabled</strong>
                </div>
                <div className="bel-rbac-meta-cell">
                  <small>Role ID</small>
                  <code>{selectedRole.id}</code>
                </div>
              </div>

              {/* Super Admin Notice Banner */}
              {selectedRole.role === 'Super Admin' && (
                <div className="bel-rbac-superadmin-banner">
                  <FiLock />
                  <span>Super Admin possesses unrestricted, enterprise-wide access that cannot be modified.</span>
                </div>
              )}
            </article>

            {/* Permissions Toolbar */}
            <div className="bel-rbac-perm-toolbar">
              <div className="bel-rbac-perm-toolbar-text">
                <h3>Module Access Matrix</h3>
                <p>Toggle permissions for each module below</p>
              </div>

              {selectedRole.role !== 'Super Admin' && (
                <div className="bel-rbac-perm-toolbar-btns">
                  <button
                    type="button"
                    className="bel-rbac-btn-toolbar"
                    onClick={toggleGlobalSelectAll}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="bel-rbac-btn-toolbar"
                    onClick={resetChanges}
                    disabled={!dirty}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Expandable Module Permissions Cards */}
            <div className="bel-rbac-module-cards-list">
              {MODULES.map((module) => {
                const activeCount = draftPermissions[module]?.length || 0;
                const hasAll = activeCount === PERMISSION_KEYS.length;

                return (
                  <div key={module} className="bel-rbac-module-perm-card">
                    <div className="bel-rbac-module-header">
                      <div className="bel-rbac-module-title-wrap">
                        <span className="bel-rbac-module-indicator-dot" />
                        <strong>{module}</strong>
                        <span className="bel-rbac-module-count-badge">
                          {activeCount} / {PERMISSION_KEYS.length}
                        </span>
                      </div>

                      {selectedRole.role !== 'Super Admin' && (
                        <button
                          type="button"
                          className="bel-rbac-btn-module-toggle"
                          onClick={() => toggleModule(module, !hasAll)}
                        >
                          {hasAll ? 'Clear' : 'Enable All'}
                        </button>
                      )}
                    </div>

                    {/* 6 Permission Chips Grid */}
                    <div className="bel-rbac-chips-grid">
                      {PERMISSION_KEYS.map((permKey) => {
                        const isEnabled = isPermissionEnabled(module, permKey);
                        const isSuperAdmin = selectedRole.role === 'Super Admin';

                        return (
                          <button
                            type="button"
                            key={permKey}
                            className={`bel-rbac-perm-chip ${isEnabled ? 'is-enabled' : ''} ${isSuperAdmin ? 'is-disabled' : ''}`}
                            onClick={() => togglePermission(module, permKey)}
                            disabled={isSuperAdmin}
                            aria-pressed={isEnabled}
                          >
                            <span className="bel-rbac-chip-check-icon">
                              {isEnabled ? <FiCheck /> : null}
                            </span>
                            <span>{PERMISSION_LABELS[permKey]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Unsaved Changes Action Panel */}
            <div className={`bel-rbac-sticky-save-panel ${dirty ? 'is-dirty' : ''}`}>
              <div className="bel-rbac-save-panel-text">
                <strong>{dirty ? 'Unsaved Permission Changes' : 'Permissions Up to Date'}</strong>
                <span>
                  {selectedRole.role === 'Super Admin'
                    ? 'Super Admin permissions are locked.'
                    : dirty
                    ? 'Tap save to apply changes to this role.'
                    : 'All access rules are saved.'}
                </span>
              </div>

              {dirty && (
                <div className="bel-rbac-save-panel-actions">
                  <button
                    type="button"
                    className="bel-rbac-btn-discard"
                    onClick={resetChanges}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="bel-rbac-btn-save"
                    onClick={saveChanges}
                  >
                    <FiCheck />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 2: ROLE DIRECTORY LIST
            ========================================================= */}
        {activeTab === 'roles' && (
          <section className="bel-rbac-roles-section">
            {/* Search and Filter Row */}
            <div className="bel-rbac-roles-search-row">
              <div className="bel-rbac-search-box">
                <FiSearch className="bel-rbac-search-icon" />
                <input
                  type="search"
                  className="bel-rbac-search-input"
                  placeholder="Search roles by title or scope..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search roles"
                />
                {search && (
                  <button
                    type="button"
                    className="bel-rbac-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div className="bel-rbac-filter-status-chips">
                {(['All', 'Active', 'Inactive'] as const).map((filterOpt) => (
                  <button
                    type="button"
                    key={filterOpt}
                    className={`bel-rbac-status-filter-chip ${roleFilter === filterOpt ? 'is-active' : ''}`}
                    onClick={() => setRoleFilter(filterOpt)}
                  >
                    {filterOpt}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles List */}
            {filteredRoles.length === 0 ? (
              <div className="bel-rbac-empty-box">
                <FiShield />
                <h3>No roles found</h3>
                <p>Try searching with another keyword or resetting the filter.</p>
              </div>
            ) : (
              <div className="bel-rbac-roles-cards-list">
                {filteredRoles.map((r, index) => {
                  const isSelected = r.id === selectedRole.id;
                  const permCount = countPermissions(r.permissions);
                  const colorClass = ROLE_COLORS[index % ROLE_COLORS.length];

                  return (
                    <article
                      key={r.id}
                      className={`bel-rbac-role-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => selectRole(r)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="bel-rbac-role-card-top">
                        <div className="bel-rbac-role-card-info">
                          <span className={`bel-rbac-role-shield-icon bel-rbac-shield--${colorClass}`}>
                            <FiShield />
                          </span>
                          <div>
                            <div className="bel-rbac-card-title-row">
                              <strong className="bel-rbac-card-role-title">{r.role}</strong>
                              <span className={`bel-rbac-status-pill bel-rbac-status-pill--${r.status.toLowerCase()}`}>
                                {r.status}
                              </span>
                            </div>
                            <span className="bel-rbac-card-scope">{r.scope} · {r.id}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="bel-rbac-active-role-tag">
                            <FiCheck />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <p className="bel-rbac-card-desc">{r.description}</p>

                      <div className="bel-rbac-card-footer">
                        <div className="bel-rbac-card-user-meta">
                          <FiUsers />
                          <span>{r.users.toLocaleString()} {r.users === 1 ? 'User' : 'Users'}</span>
                        </div>

                        <div className="bel-rbac-card-perm-meta">
                          <FiSliders />
                          <span>{permCount} Permissions</span>
                        </div>

                        <div className="bel-rbac-card-arrow">
                          <FiArrowRight />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* =========================================================
          BOTTOM SHEET: ADD / EDIT ROLE FORM
          ========================================================= */}
      {modal && (modal === 'addRole' || modal === 'editRole') && (
        <div
          className="bel-rbac-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bel-rbac-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
            <div className="bel-rbac-sheet-drag-handle" />

            <div className="bel-rbac-sheet-header">
              <div>
                <h2 id="role-form-title">{modal === 'editRole' ? 'Edit Role Details' : 'Create Custom Role'}</h2>
                <p>
                  {modal === 'editRole'
                    ? 'Update role information and assignment scope'
                    : 'Create a new role and configure its module permissions'}
                </p>
              </div>
              <button type="button" className="bel-rbac-sheet-close" onClick={() => setModal(null)} aria-label="Close form">
                <FiX />
              </button>
            </div>

            <form onSubmit={submitRole}>
              <div className="bel-rbac-sheet-body">
                <div className="bel-rbac-form-group">
                  <label className="bel-rbac-form-label">Role Title / Designation</label>
                  <input
                    type="text"
                    className="bel-rbac-form-input"
                    placeholder="e.g. Payroll Specialist"
                    value={roleForm.role}
                    onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                    required
                  />
                </div>

                <div className="bel-rbac-form-group">
                  <label className="bel-rbac-form-label">Role Description</label>
                  <textarea
                    className="bel-rbac-form-textarea"
                    placeholder="Describe the functional scope and responsibilities of this role..."
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="bel-rbac-form-grid-2">
                  <div className="bel-rbac-form-group">
                    <label className="bel-rbac-form-label">Initial Assigned Users</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      className="bel-rbac-form-input"
                      value={roleForm.users}
                      onChange={(e) => setRoleForm({ ...roleForm, users: e.target.value })}
                    />
                  </div>

                  <div className="bel-rbac-form-group">
                    <label className="bel-rbac-form-label">Access Scope</label>
                    <select
                      className="bel-rbac-form-select"
                      value={roleForm.scope}
                      onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })}
                    >
                      <option>Organization-wide</option>
                      <option>All HR modules</option>
                      <option>Assigned department</option>
                      <option>Finance & payroll</option>
                      <option>Own records</option>
                      <option>Custom scope</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bel-rbac-sheet-footer">
                <button type="button" className="bel-rbac-btn-sheet-secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="bel-rbac-btn-sheet-primary">
                  {modal === 'editRole' ? <FiCheck /> : <FiPlus />}
                  <span>{modal === 'editRole' ? 'Save Role' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent HR Admin Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
