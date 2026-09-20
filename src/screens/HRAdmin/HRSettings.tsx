import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import {
  FiActivity,
  FiAlertTriangle,
  FiArchive,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiGrid,
  FiLock,
  FiMail,
  FiMapPin,
  FiPlus,
  FiSave,
  FiSearch,
  FiServer,
  FiShield,
  FiSliders,
  FiTrash2,
  FiUsers,
  FiX,
  FiArrowLeft,
  FiUpload,
  FiRefreshCw,
  FiEye,
  FiAlertCircle,
  FiInfo,
  FiCheckSquare,
} from 'react-icons/fi';
import './HRSettings.css';

// Types & Data Structures
export interface CompanyData {
  name: string;
  cin: string;
  gst: string;
  pan: string;
  headquarters: string;
  industry: string;
  website: string;
  founded: string;
  supportEmail: string;
  phone: string;
  timezone: string;
  currency: string;
  financialYear: string;
  logoUrl?: string;
}

export interface BranchItem {
  id: number;
  name: string;
  city: string;
  employees: number;
  status: 'Active' | 'Inactive';
}

export interface DepartmentItem {
  id: number;
  name: string;
  code: string;
  head: string;
  employees: number;
}

export interface DesignationItem {
  id: number;
  title: string;
  department: string;
  level: string;
  employees: number;
}

export interface ShiftItem {
  id: number;
  name: string;
  start: string;
  end: string;
  grace: number;
  break: number;
  overnight: boolean;
}

export interface LeavePolicyItem {
  id: string;
  name: string;
  annual: number;
  used: number;
  remaining: number;
  carryForward: string;
  encashment: boolean;
}

export interface EmailTemplateItem {
  id: number;
  name: string;
  event: string;
  channel: string;
  status: 'Active' | 'Draft';
  subject?: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  user: string;
  module: string;
  time: string;
  result: 'Success' | 'Blocked' | 'Warning';
}

const INITIAL_COMPANY: CompanyData = {
  name: 'BELNOVA TECH PRIVATE LIMITED',
  cin: 'U72200MH2015PTC123456',
  gst: '27AABCB1234A1Z5',
  pan: 'AABCB1234A',
  headquarters: 'Mumbai, Maharashtra',
  industry: 'Information Technology',
  website: 'www.belnova.tech',
  founded: '2015',
  supportEmail: 'hr.support@belnova.tech',
  phone: '+91 22 4567 8900',
  timezone: 'Asia/Kolkata',
  currency: 'INR (₹)',
  financialYear: 'April - March',
};

const INITIAL_BRANCHES: BranchItem[] = [
  { id: 1, name: 'Main Office', city: 'Corporate HQ', employees: 0, status: 'Active' },
];

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  { id: 1, name: 'Engineering', code: 'ENG', head: 'Engineering Lead', employees: 0 },
  { id: 2, name: 'Human Resources', code: 'HR', head: 'HR Lead', employees: 0 },
  { id: 3, name: 'Finance', code: 'FIN', head: 'Finance Lead', employees: 0 },
  { id: 4, name: 'Product', code: 'PROD', head: 'Product Lead', employees: 0 },
  { id: 5, name: 'Sales & Marketing', code: 'SM', head: 'Marketing Lead', employees: 0 },
];

const INITIAL_DESIGNATIONS: DesignationItem[] = [
  { id: 1, title: 'Software Engineer', department: 'Engineering', level: 'L2', employees: 0 },
  { id: 2, title: 'Senior Software Engineer', department: 'Engineering', level: 'L3', employees: 0 },
  { id: 3, title: 'Engineering Manager', department: 'Engineering', level: 'L5', employees: 0 },
  { id: 4, title: 'HR Executive', department: 'Human Resources', level: 'L2', employees: 0 },
  { id: 5, title: 'Product Manager', department: 'Product', level: 'L4', employees: 0 },
];

const INITIAL_SHIFTS: ShiftItem[] = [
  { id: 1, name: 'General Shift', start: '09:00', end: '18:00', grace: 15, break: 60, overnight: false },
  { id: 2, name: 'Morning Shift', start: '06:00', end: '14:00', grace: 10, break: 45, overnight: false },
  { id: 3, name: 'Evening Shift', start: '14:00', end: '22:00', grace: 10, break: 45, overnight: false },
  { id: 4, name: 'Night Shift', start: '22:00', end: '06:00', grace: 15, break: 60, overnight: true },
];

const INITIAL_LEAVE_POLICIES: LeavePolicyItem[] = [
  { id: 'casual', name: 'Casual Leave', annual: 12, used: 0, remaining: 12, carryForward: 'Yes (max 5 days)', encashment: true },
  { id: 'sick', name: 'Sick Leave', annual: 12, used: 0, remaining: 12, carryForward: 'Yes (max 5 days)', encashment: false },
  { id: 'earned', name: 'Earned Leave', annual: 18, used: 0, remaining: 18, carryForward: 'Yes (max 5 days)', encashment: true },
  { id: 'optional', name: 'Optional Leave', annual: 3, used: 0, remaining: 3, carryForward: 'No', encashment: false },
];

const INITIAL_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  { id: 1, name: 'Welcome New Employee', event: 'Employee Onboarding', channel: 'Email', status: 'Active', subject: 'Welcome to BELNOVA Technologies!' },
  { id: 2, name: 'Leave Request Submitted', event: 'Leave Workflow', channel: 'Email', status: 'Active', subject: 'Leave Request Submitted for Approval' },
  { id: 3, name: 'Payslip Available', event: 'Payroll Completion', channel: 'Email', status: 'Active', subject: 'Your Monthly Payslip is Ready for Download' },
  { id: 4, name: 'Attendance Regularization', event: 'Attendance', channel: 'Email', status: 'Active', subject: 'Action Required: Attendance Regularization' },
];

const INITIAL_AUDIT: AuditLogItem[] = [];

interface SettingCategory {
  id: string;
  group: 'organization' | 'workforce' | 'payroll' | 'communication' | 'security';
  groupLabel: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  statusText: string;
}

const SETTINGS_AREAS: SettingCategory[] = [
  // Organization
  { id: 'company', group: 'organization', groupLabel: 'ORGANIZATION', label: 'Company Profile', description: 'Legal entity details, registration & regional defaults', icon: FiBriefcase, statusText: 'Verified' },
  { id: 'branches', group: 'organization', groupLabel: 'ORGANIZATION', label: 'Branches & Locations', description: 'Office locations & regional branch centers', icon: FiMapPin, statusText: 'Active' },
  { id: 'departments', group: 'organization', groupLabel: 'ORGANIZATION', label: 'Departments', description: 'Business units & departmental leadership', icon: FiUsers, statusText: 'Configured' },
  { id: 'designations', group: 'organization', groupLabel: 'ORGANIZATION', label: 'Designations & Levels', description: 'Job titles, organizational bands & grade hierarchy', icon: FiGrid, statusText: 'Configured' },

  // Workforce
  { id: 'shifts', group: 'workforce', groupLabel: 'WORKFORCE & POLICIES', label: 'Shift Policies', description: 'Work timings, grace limits, breaks & overnight shifts', icon: FiClock, statusText: '4 Shifts' },
  { id: 'leave', group: 'workforce', groupLabel: 'WORKFORCE & POLICIES', label: 'Leave Policies', description: 'Annual allocations, approval routing & encashment', icon: FiCalendar, statusText: 'Configured' },

  // Payroll & Compliance
  { id: 'payroll', group: 'payroll', groupLabel: 'PAYROLL & COMPLIANCE', label: 'Payroll Configuration', description: 'Pay cycles, cut-off dates, working days & statutory rules', icon: FiDollarSign, statusText: 'Monthly · Day 28' },
  { id: 'tax', group: 'payroll', groupLabel: 'PAYROLL & COMPLIANCE', label: 'Tax & Statutory Setup', description: 'Tax regime, PF/ESI rates & state PT/TDS deduction', icon: FiFileText, statusText: 'New Regime' },

  // Communication
  { id: 'notifications', group: 'communication', groupLabel: 'COMMUNICATION & ALERTS', label: 'Notification Preferences', description: 'In-app channels, alerts & daily HR digest schedule', icon: FiBell, statusText: 'Enabled' },
  { id: 'email', group: 'communication', groupLabel: 'COMMUNICATION & ALERTS', label: 'Email Templates', description: 'Automated onboarding, leave & payroll emails', icon: FiMail, statusText: '4 Active' },

  // Security
  { id: 'security', group: 'security', groupLabel: 'SECURITY & ADMINISTRATION', label: 'Security & Access', description: 'MFA, session timeout, password policy & emergency access', icon: FiShield, statusText: 'Strong (85/100)' },
  { id: 'audit', group: 'security', groupLabel: 'SECURITY & ADMINISTRATION', label: 'Audit & Compliance Logs', description: 'Administrative actions, security events & exports', icon: FiActivity, statusText: 'Logging Active' },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`bel-settings-toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export const HRSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active View State: 'hub' for Main Settings Landing or section ID ('company', 'branches', etc.)
  const [activeSection, setActiveSection] = useState<string>('hub');
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data States with LocalStorage Hydration
  const [company, setCompany] = useState<CompanyData>(() => {
    const saved = localStorage.getItem('belnova_settings_company');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY;
  });

  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_branches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((b) => b.employees === 482)) {
          localStorage.removeItem('belnova_settings_branches');
          return INITIAL_BRANCHES;
        }
        return parsed;
      } catch {
        return INITIAL_BRANCHES;
      }
    }
    return INITIAL_BRANCHES;
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_departments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((d) => d.head === 'Arjun Reddy')) {
          localStorage.removeItem('belnova_settings_departments');
          return INITIAL_DEPARTMENTS;
        }
        return parsed;
      } catch {
        return INITIAL_DEPARTMENTS;
      }
    }
    return INITIAL_DEPARTMENTS;
  });

  const [designations, setDesignations] = useState<DesignationItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_designations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((d) => d.employees === 142)) {
          localStorage.removeItem('belnova_settings_designations');
          return INITIAL_DESIGNATIONS;
        }
        return parsed;
      } catch {
        return INITIAL_DESIGNATIONS;
      }
    }
    return INITIAL_DESIGNATIONS;
  });

  const [shifts, setShifts] = useState<ShiftItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_leave_policies');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_POLICIES;
  });

  const [leaveConfig, setLeaveConfig] = useState(() => {
    const saved = localStorage.getItem('belnova_settings_leave_config');
    return saved
      ? JSON.parse(saved)
      : {
          approval: 'Manager → HR',
          carryForward: true,
          carryForwardLimit: 5,
          encashment: true,
          negativeBalance: false,
          halfDay: true,
          attachmentRequired: true,
          maxAdvanceDays: 60,
        };
  });

  const [payrollConfig, setPayrollConfig] = useState(() => {
    const saved = localStorage.getItem('belnova_settings_payroll');
    return saved
      ? JSON.parse(saved)
      : {
          payCycle: 'Monthly',
          payrollDay: '28',
          salaryDay: '1',
          workingDays: '26',
          overtime: true,
          pf: true,
          esi: true,
          professionalTax: true,
          tds: true,
        };
  });

  const [taxConfig, setTaxConfig] = useState(() => {
    const saved = localStorage.getItem('belnova_settings_tax');
    return saved
      ? JSON.parse(saved)
      : {
          regime: 'New Tax Regime',
          pfEmployee: '12',
          pfEmployer: '12',
          esiEmployee: '0.75',
          esiEmployer: '3.25',
          ptEnabled: true,
          tdsEnabled: true,
        };
  });

  const [notificationConfig, setNotificationConfig] = useState(() => {
    const saved = localStorage.getItem('belnova_settings_notifs');
    return saved
      ? JSON.parse(saved)
      : {
          email: true,
          inApp: true,
          payroll: true,
          attendance: true,
          leave: true,
          security: true,
          digest: false,
          digestTime: '18:00',
        };
  });

  const [securityConfig, setSecurityConfig] = useState(() => {
    const saved = localStorage.getItem('belnova_settings_security');
    return saved
      ? JSON.parse(saved)
      : {
          mfa: true,
          sessionTimeout: '30',
          passwordExpiry: '90',
          loginAttempts: '5',
          ipRestriction: false,
          auditLogging: true,
          biometricVerification: true,
        };
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_emails');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('belnova_settings_audits');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((l) => l.user === 'Sneha Rao' || l.user.includes('Priya Sharma'))) {
          localStorage.removeItem('belnova_settings_audits');
          return [];
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modals & Bottom Sheets State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalForm, setModalForm] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Specific Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: string; id: number | string; name: string } | null>(null);
  const [showLeaveEditor, setShowLeaveEditor] = useState<LeavePolicyItem | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState<EmailTemplateItem | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Unsaved State Tracking & Discard Modal
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Add audit record automatically
  const addAuditEntry = (action: string, module: string, result: 'Success' | 'Blocked' | 'Warning' = 'Success') => {
    const newLog: AuditLogItem = {
      id: Date.now(),
      action,
      user: user?.name ? `${user.name} (${user.role === 'hr' ? 'HR Admin' : user.role})` : 'HR Admin',
      module,
      time: 'Just now',
      result,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('belnova_settings_audits', JSON.stringify(updated));
  };

  // Calculate dynamic security score
  const dynamicSecurityScore = useMemo(() => {
    let score = 40;
    if (securityConfig.mfa) score += 20;
    if (securityConfig.auditLogging) score += 15;
    if (securityConfig.biometricVerification) score += 15;
    if (securityConfig.ipRestriction) score += 10;
    return Math.min(score, 100);
  }, [securityConfig]);

  // Company Initials
  const companyInitials = useMemo(() => {
    return company.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('');
  }, [company.name]);

  // Safe navigation with unsaved changes check
  const handleNavigateSection = (sectionId: string) => {
    if (hasUnsavedChanges && sectionId !== activeSection) {
      setPendingNavigation(sectionId);
      return;
    }
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDiscardNavigation = () => {
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      setActiveSection(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Save Section Changes
  const handleSaveSection = (sectionName: string) => {
    if (activeSection === 'company') {
      localStorage.setItem('belnova_settings_company', JSON.stringify(company));
    } else if (activeSection === 'leave') {
      localStorage.setItem('belnova_settings_leave_config', JSON.stringify(leaveConfig));
      localStorage.setItem('belnova_settings_leave_policies', JSON.stringify(leavePolicies));
    } else if (activeSection === 'payroll') {
      localStorage.setItem('belnova_settings_payroll', JSON.stringify(payrollConfig));
    } else if (activeSection === 'tax') {
      localStorage.setItem('belnova_settings_tax', JSON.stringify(taxConfig));
    } else if (activeSection === 'notifications') {
      localStorage.setItem('belnova_settings_notifs', JSON.stringify(notificationConfig));
    } else if (activeSection === 'security') {
      localStorage.setItem('belnova_settings_security', JSON.stringify(securityConfig));
    }

    addAuditEntry(`${sectionName} updated`, sectionName, 'Success');
    setHasUnsavedChanges(false);
    showToast(`${sectionName} saved successfully.`, 'success');
  };

  // Real Company Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size must be under 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setCompany((prev) => ({ ...prev, logoUrl }));
        setHasUnsavedChanges(true);
        showToast('Company logo updated. Save to persist.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD Modal Handlers
  const openAddModal = (type: string, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormErrors({});

    if (type === 'branch') {
      setModalForm(item || { name: '', city: '', employees: '', status: 'Active' });
    } else if (type === 'department') {
      setModalForm(item || { name: '', code: '', head: '', employees: '' });
    } else if (type === 'designation') {
      setModalForm(item || { title: '', department: 'Engineering', level: 'L2', employees: '' });
    } else if (type === 'shift') {
      setModalForm(item || { name: '', start: '09:00', end: '18:00', grace: '15', break: '60', overnight: false });
    } else if (type === 'email') {
      setModalForm(item || { name: '', event: '', channel: 'Email', status: 'Active', subject: '' });
    }
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setModalType('');
    setEditingItem(null);
    setModalForm({});
    setFormErrors({});
  };

  // Modal Save Validation & Submit
  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (modalType === 'branch') {
      if (!modalForm.name?.trim()) errors.name = 'Branch name is required.';
      if (!modalForm.city?.trim()) errors.city = 'City is required.';
      if (modalForm.employees && isNaN(Number(modalForm.employees))) errors.employees = 'Must be a valid number.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const id = editingItem?.id || Date.now();
      const updatedItem: BranchItem = {
        id,
        name: modalForm.name.trim(),
        city: modalForm.city.trim(),
        employees: Number(modalForm.employees || 0),
        status: modalForm.status || 'Active',
      };

      const updated = editingItem
        ? branches.map((b) => (b.id === id ? updatedItem : b))
        : [...branches, updatedItem];

      setBranches(updated);
      localStorage.setItem('belnova_settings_branches', JSON.stringify(updated));
      addAuditEntry(editingItem ? `Branch updated: ${updatedItem.name}` : `New branch created: ${updatedItem.name}`, 'Branches');
      showToast(editingItem ? 'Branch details updated.' : 'New branch added successfully.', 'success');
    }

    if (modalType === 'department') {
      if (!modalForm.name?.trim()) errors.name = 'Department name is required.';
      if (!modalForm.code?.trim()) errors.code = 'Department code is required.';
      if (!modalForm.head?.trim()) errors.head = 'Department head is required.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const id = editingItem?.id || Date.now();
      const updatedItem: DepartmentItem = {
        id,
        name: modalForm.name.trim(),
        code: modalForm.code.trim().toUpperCase(),
        head: modalForm.head.trim(),
        employees: Number(modalForm.employees || 0),
      };

      const updated = editingItem
        ? departments.map((d) => (d.id === id ? updatedItem : d))
        : [...departments, updatedItem];

      setDepartments(updated);
      localStorage.setItem('belnova_settings_departments', JSON.stringify(updated));
      addAuditEntry(editingItem ? `Department updated: ${updatedItem.name}` : `New department added: ${updatedItem.name}`, 'Departments');
      showToast(editingItem ? 'Department updated.' : 'New department added successfully.', 'success');
    }

    if (modalType === 'designation') {
      if (!modalForm.title?.trim()) errors.title = 'Designation title is required.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const id = editingItem?.id || Date.now();
      const updatedItem: DesignationItem = {
        id,
        title: modalForm.title.trim(),
        department: modalForm.department || 'Engineering',
        level: modalForm.level || 'L2',
        employees: Number(modalForm.employees || 0),
      };

      const updated = editingItem
        ? designations.map((d) => (d.id === id ? updatedItem : d))
        : [...designations, updatedItem];

      setDesignations(updated);
      localStorage.setItem('belnova_settings_designations', JSON.stringify(updated));
      addAuditEntry(editingItem ? `Designation updated: ${updatedItem.title}` : `New designation created: ${updatedItem.title}`, 'Designations');
      showToast(editingItem ? 'Designation updated.' : 'New designation added.', 'success');
    }

    if (modalType === 'shift') {
      if (!modalForm.name?.trim()) errors.name = 'Shift name is required.';
      if (!modalForm.start) errors.start = 'Start time is required.';
      if (!modalForm.end) errors.end = 'End time is required.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const id = editingItem?.id || Date.now();
      const updatedItem: ShiftItem = {
        id,
        name: modalForm.name.trim(),
        start: modalForm.start,
        end: modalForm.end,
        grace: Number(modalForm.grace || 15),
        break: Number(modalForm.break || 60),
        overnight: Boolean(modalForm.overnight),
      };

      const updated = editingItem
        ? shifts.map((s) => (s.id === id ? updatedItem : s))
        : [...shifts, updatedItem];

      setShifts(updated);
      localStorage.setItem('belnova_settings_shifts', JSON.stringify(updated));
      addAuditEntry(editingItem ? `Shift modified: ${updatedItem.name}` : `New shift policy created: ${updatedItem.name}`, 'Shift Policies');
      showToast(editingItem ? 'Shift policy updated.' : 'Shift policy added.', 'success');
    }

    if (modalType === 'email') {
      if (!modalForm.name?.trim()) errors.name = 'Template name is required.';
      if (!modalForm.event?.trim()) errors.event = 'Trigger event is required.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const id = editingItem?.id || Date.now();
      const updatedItem: EmailTemplateItem = {
        id,
        name: modalForm.name.trim(),
        event: modalForm.event.trim(),
        channel: modalForm.channel || 'Email',
        status: modalForm.status || 'Active',
        subject: modalForm.subject?.trim() || modalForm.name.trim(),
      };

      const updated = editingItem
        ? emailTemplates.map((e) => (e.id === id ? updatedItem : e))
        : [...emailTemplates, updatedItem];

      setEmailTemplates(updated);
      localStorage.setItem('belnova_settings_emails', JSON.stringify(updated));
      addAuditEntry(editingItem ? `Email template updated: ${updatedItem.name}` : `New email template added: ${updatedItem.name}`, 'Email Templates');
      showToast(editingItem ? 'Email template updated.' : 'Email template added.', 'success');
    }

    closeModal();
  };

  // Safe Confirmed Deletions
  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;
    const { type, id, name } = showDeleteConfirm;

    if (type === 'branch') {
      const updated = branches.filter((b) => b.id !== id);
      setBranches(updated);
      localStorage.setItem('belnova_settings_branches', JSON.stringify(updated));
      addAuditEntry(`Branch deleted: ${name}`, 'Branches', 'Warning');
      showToast(`Branch "${name}" removed.`, 'info');
    } else if (type === 'department') {
      const updated = departments.filter((d) => d.id !== id);
      setDepartments(updated);
      localStorage.setItem('belnova_settings_departments', JSON.stringify(updated));
      addAuditEntry(`Department removed: ${name}`, 'Departments', 'Warning');
      showToast(`Department "${name}" removed.`, 'info');
    } else if (type === 'designation') {
      const updated = designations.filter((d) => d.id !== id);
      setDesignations(updated);
      localStorage.setItem('belnova_settings_designations', JSON.stringify(updated));
      addAuditEntry(`Designation removed: ${name}`, 'Designations', 'Warning');
      showToast(`Designation "${name}" removed.`, 'info');
    } else if (type === 'shift') {
      const updated = shifts.filter((s) => s.id !== id);
      setShifts(updated);
      localStorage.setItem('belnova_settings_shifts', JSON.stringify(updated));
      addAuditEntry(`Shift policy deleted: ${name}`, 'Shift Policies', 'Warning');
      showToast(`Shift policy "${name}" removed.`, 'info');
    } else if (type === 'email') {
      const updated = emailTemplates.filter((e) => e.id !== id);
      setEmailTemplates(updated);
      localStorage.setItem('belnova_settings_emails', JSON.stringify(updated));
      addAuditEntry(`Email template deleted: ${name}`, 'Email Templates', 'Warning');
      showToast(`Email template "${name}" removed.`, 'info');
    }

    setShowDeleteConfirm(null);
  };

  // Real Leave Policy Save
  const handleSaveLeavePolicy = (updatedPolicy: LeavePolicyItem) => {
    const updated = leavePolicies.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p));
    setLeavePolicies(updated);
    localStorage.setItem('belnova_settings_leave_policies', JSON.stringify(updated));
    addAuditEntry(`Leave policy updated: ${updatedPolicy.name}`, 'Leave Policies');
    setShowLeaveEditor(null);
    showToast(`${updatedPolicy.name} policy saved.`, 'success');
  };

  // Real CSV Export for Audit Logs
  const handleExportAuditLogs = () => {
    const headers = ['ID,Event,User,Module,Timestamp,Result'];
    const rows = auditLogs.map((log) =>
      `"${log.id}","${log.action}","${log.user}","${log.module}","${log.time}","${log.result}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BELNOVA-HRMS-Audit-Logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditEntry('Audit logs CSV exported', 'Audit Logs', 'Success');
    showToast('Audit logs exported successfully as CSV.', 'success');
  };

  // Search Filtered Categories for Hub
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_AREAS;
    const q = searchQuery.toLowerCase();
    return SETTINGS_AREAS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.groupLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group filtered categories
  const groupedSections = useMemo(() => {
    const groups: { [key: string]: { label: string; items: SettingCategory[] } } = {
      organization: { label: 'ORGANIZATION', items: [] },
      workforce: { label: 'WORKFORCE & POLICIES', items: [] },
      payroll: { label: 'PAYROLL & COMPLIANCE', items: [] },
      communication: { label: 'COMMUNICATION & ALERTS', items: [] },
      security: { label: 'SECURITY & ADMINISTRATION', items: [] },
    };

    filteredCategories.forEach((item) => {
      if (groups[item.group]) {
        groups[item.group].items.push(item);
      }
    });

    return Object.values(groups).filter((g) => g.items.length > 0);
  }, [filteredCategories]);

  // Total workforce summary
  const totalEmployeesInBranches = useMemo(() => {
    return branches.reduce((acc, b) => acc + Number(b.employees || 0), 0);
  }, [branches]);

  // Active section metadata
  const currentSectionMeta = SETTINGS_AREAS.find((s) => s.id === activeSection);

  /* ==========================================================================
     RENDERERS FOR SETTING SECTIONS
     ========================================================================== */

  // 1. Company Profile
  const renderCompanyProfile = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-company-banner">
        <div className="bel-settings-company-avatar">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="Company Logo" className="bel-settings-company-img" />
          ) : (
            <span>{companyInitials || 'BT'}</span>
          )}
        </div>
        <div className="bel-settings-company-info">
          <h3>{company.name}</h3>
          <p>{company.industry} · {totalEmployeesInBranches.toLocaleString()} employees · Founded {company.founded}</p>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleLogoUpload}
          />
          <button
            type="button"
            className="bel-settings-change-logo-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload /> Change Logo
          </button>
        </div>
        <div className="bel-settings-company-badge">
          <span className="bel-status-pill success"><FiCheck /> Active</span>
          <small>Verified Entity</small>
        </div>
      </div>

      <div className="bel-settings-group-header">
        <FiBriefcase />
        <h4>Company Identity & Legal Registration</h4>
      </div>

      <div className="bel-settings-form-grid">
        <div className="bel-form-field">
          <label>Company Legal Name *</label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => {
              setCompany({ ...company, name: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>CIN / Registration Number *</label>
          <input
            type="text"
            value={company.cin}
            onChange={(e) => {
              setCompany({ ...company, cin: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>GST Number</label>
          <input
            type="text"
            value={company.gst}
            onChange={(e) => {
              setCompany({ ...company, gst: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>PAN (Permanent Account Number)</label>
          <input
            type="text"
            value={company.pan}
            onChange={(e) => {
              setCompany({ ...company, pan: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Corporate Headquarters</label>
          <input
            type="text"
            value={company.headquarters}
            onChange={(e) => {
              setCompany({ ...company, headquarters: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Industry</label>
          <input
            type="text"
            value={company.industry}
            onChange={(e) => {
              setCompany({ ...company, industry: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Official Website</label>
          <input
            type="text"
            value={company.website}
            onChange={(e) => {
              setCompany({ ...company, website: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Year Founded</label>
          <input
            type="text"
            value={company.founded}
            onChange={(e) => {
              setCompany({ ...company, founded: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-group-header" style={{ marginTop: '20px' }}>
        <FiMail />
        <h4>Communication & Regional Defaults</h4>
      </div>

      <div className="bel-settings-form-grid">
        <div className="bel-form-field">
          <label>HR Support Email</label>
          <input
            type="email"
            value={company.supportEmail}
            onChange={(e) => {
              setCompany({ ...company, supportEmail: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Corporate Phone Number</label>
          <input
            type="text"
            value={company.phone}
            onChange={(e) => {
              setCompany({ ...company, phone: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Time Zone</label>
          <select
            value={company.timezone}
            onChange={(e) => {
              setCompany({ ...company, timezone: e.target.value });
              setHasUnsavedChanges(true);
            }}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST)</option>
          </select>
        </div>

        <div className="bel-form-field">
          <label>Primary Currency</label>
          <select
            value={company.currency}
            onChange={(e) => {
              setCompany({ ...company, currency: e.target.value });
              setHasUnsavedChanges(true);
            }}
          >
            <option value="INR (₹)">INR (₹) - Indian Rupee</option>
            <option value="USD ($)">USD ($) - US Dollar</option>
            <option value="EUR (€)">EUR (€) - Euro</option>
            <option value="GBP (£)">GBP (£) - British Pound</option>
          </select>
        </div>

        <div className="bel-form-field">
          <label>Financial Year Cycle</label>
          <select
            value={company.financialYear}
            onChange={(e) => {
              setCompany({ ...company, financialYear: e.target.value });
              setHasUnsavedChanges(true);
            }}
          >
            <option value="April - March">April - March (India Standard)</option>
            <option value="January - December">January - December (Calendar Year)</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 2. Branches
  const renderBranches = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Branch Locations ({branches.length})</h3>
          <p>Manage office locations, geographical presence and branch headcounts</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={() => openAddModal('branch')}
        >
          <FiPlus /> Add Branch
        </button>
      </div>

      <div className="bel-settings-kpi-summary">
        <div className="bel-kpi-box">
          <strong>{branches.length}</strong>
          <span>Total Locations</span>
        </div>
        <div className="bel-kpi-box">
          <strong>{totalEmployeesInBranches.toLocaleString()}</strong>
          <span>Total Employees</span>
        </div>
        <div className="bel-kpi-box">
          <strong>{branches.filter((b) => b.status === 'Active').length}</strong>
          <span>Active Hubs</span>
        </div>
      </div>

      <div className="bel-settings-card-list">
        {branches.map((branch) => (
          <div key={branch.id} className="bel-settings-item-card">
            <div className="bel-item-card-header">
              <div className="bel-item-icon-box branch">
                <FiMapPin />
              </div>
              <div className="bel-item-card-main">
                <h4>{branch.name}</h4>
                <p>{branch.city} · {branch.employees} Employees</p>
              </div>
              <span className={`bel-status-pill ${branch.status === 'Active' ? 'success' : 'muted'}`}>
                {branch.status}
              </span>
            </div>

            <div className="bel-item-card-actions">
              <button
                type="button"
                className="bel-card-action-btn edit"
                onClick={() => openAddModal('branch', branch)}
              >
                <FiEdit3 /> Edit
              </button>
              <button
                type="button"
                className="bel-card-action-btn delete"
                onClick={() => setShowDeleteConfirm({ type: 'branch', id: branch.id, name: branch.name })}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="bel-settings-empty-card">
            <FiMapPin />
            <h4>No branch locations configured</h4>
            <p>Add your primary corporate office and regional branches.</p>
            <button
              type="button"
              className="bel-btn-primary"
              onClick={() => openAddModal('branch')}
            >
              <FiPlus /> Add Branch
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Departments
  const renderDepartments = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Departments ({departments.length})</h3>
          <p>Organize organizational units, business functions and leadership</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={() => openAddModal('department')}
        >
          <FiPlus /> Add Department
        </button>
      </div>

      <div className="bel-settings-card-list">
        {departments.map((dept) => (
          <div key={dept.id} className="bel-settings-item-card">
            <div className="bel-item-card-header">
              <div className="bel-item-icon-box department">
                <FiUsers />
              </div>
              <div className="bel-item-card-main">
                <div className="bel-item-title-row">
                  <h4>{dept.name}</h4>
                  <span className="bel-code-badge">{dept.code}</span>
                </div>
                <p>Head: <strong>{dept.head}</strong> · {dept.employees} Employees</p>
              </div>
            </div>

            <div className="bel-item-card-actions">
              <button
                type="button"
                className="bel-card-action-btn edit"
                onClick={() => openAddModal('department', dept)}
              >
                <FiEdit3 /> Edit
              </button>
              <button
                type="button"
                className="bel-card-action-btn delete"
                onClick={() => setShowDeleteConfirm({ type: 'department', id: dept.id, name: dept.name })}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. Designations
  const renderDesignations = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Designations & Job Levels ({designations.length})</h3>
          <p>Configure job roles, hierarchy bands and structural grading</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={() => openAddModal('designation')}
        >
          <FiPlus /> Add Designation
        </button>
      </div>

      <div className="bel-settings-card-list">
        {designations.map((desig) => (
          <div key={desig.id} className="bel-settings-item-card">
            <div className="bel-item-card-header">
              <div className="bel-item-icon-box designation">
                <FiGrid />
              </div>
              <div className="bel-item-card-main">
                <div className="bel-item-title-row">
                  <h4>{desig.title}</h4>
                  <span className="bel-level-badge">{desig.level}</span>
                </div>
                <p>{desig.department} · {desig.employees} Employees Assigned</p>
              </div>
            </div>

            <div className="bel-item-card-actions">
              <button
                type="button"
                className="bel-card-action-btn edit"
                onClick={() => openAddModal('designation', desig)}
              >
                <FiEdit3 /> Edit
              </button>
              <button
                type="button"
                className="bel-card-action-btn delete"
                onClick={() => setShowDeleteConfirm({ type: 'designation', id: desig.id, name: desig.title })}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 5. Shift Policies
  const renderShifts = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Shift Policies ({shifts.length})</h3>
          <p>Define standard work hours, grace buffers, break periods and overnight shifts</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={() => openAddModal('shift')}
        >
          <FiPlus /> Add Shift
        </button>
      </div>

      <div className="bel-settings-card-list">
        {shifts.map((shift) => (
          <div key={shift.id} className="bel-settings-item-card shift-card">
            <div className="bel-item-card-header">
              <div className="bel-item-icon-box shift">
                <FiClock />
              </div>
              <div className="bel-item-card-main">
                <div className="bel-item-title-row">
                  <h4>{shift.name}</h4>
                  {shift.overnight && <span className="bel-tag-badge warning">Cross-day</span>}
                </div>
                <p className="bel-shift-timing">{shift.start} → {shift.end}</p>
              </div>
              <span className="bel-status-pill success">Active</span>
            </div>

            <div className="bel-shift-mini-kpis">
              <div className="bel-mini-kpi">
                <span>Grace Period</span>
                <strong>{shift.grace} mins</strong>
              </div>
              <div className="bel-mini-kpi">
                <span>Break Time</span>
                <strong>{shift.break} mins</strong>
              </div>
              <div className="bel-mini-kpi">
                <span>Shift Type</span>
                <strong>{shift.overnight ? 'Overnight' : 'Regular'}</strong>
              </div>
            </div>

            <div className="bel-item-card-actions">
              <button
                type="button"
                className="bel-card-action-btn edit"
                onClick={() => openAddModal('shift', shift)}
              >
                <FiEdit3 /> Edit
              </button>
              <button
                type="button"
                className="bel-card-action-btn delete"
                onClick={() => setShowDeleteConfirm({ type: 'shift', id: shift.id, name: shift.name })}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. Leave Policies
  const renderLeavePolicies = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Leave Quotas & Rules</h3>
          <p>Annual entitlement quotas, carry-forward limits and approval workflows</p>
        </div>
      </div>

      <div className="bel-settings-leave-grid">
        {leavePolicies.map((policy) => {
          const utilPct = Math.round((policy.used / policy.annual) * 100);
          return (
            <div key={policy.id} className="bel-leave-policy-card">
              <div className="bel-leave-card-top">
                <div>
                  <h4>{policy.name}</h4>
                  <span>Annual Allocation: <strong>{policy.annual} days</strong></span>
                </div>
                <button
                  type="button"
                  className="bel-policy-edit-icon"
                  onClick={() => setShowLeaveEditor(policy)}
                  title="Configure Policy"
                >
                  <FiEdit3 />
                </button>
              </div>

              <div className="bel-leave-card-numbers">
                <div><span>Used</span><strong>{policy.used}d</strong></div>
                <div><span>Remaining</span><strong>{policy.remaining}d</strong></div>
                <div><span>Utilization</span><strong>{utilPct}%</strong></div>
              </div>

              <div className="bel-progress-bar">
                <div className="bel-progress-fill" style={{ width: `${utilPct}%` }} />
              </div>

              <div className="bel-leave-card-meta">
                <span>Carry Forward: <strong>{policy.carryForward}</strong></span>
                <span>Encashment: <strong>{policy.encashment ? 'Enabled' : 'Disabled'}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bel-settings-group-header" style={{ marginTop: '24px' }}>
        <FiSliders />
        <h4>Global Leave Governance Rules</h4>
      </div>

      <div className="bel-settings-toggle-list">
        <div className="bel-toggle-row">
          <div>
            <strong>Manager → HR Two-Level Approval</strong>
            <span>Route leave submissions through reporting manager first, then HR desk</span>
          </div>
          <Toggle
            label="Manager to HR Approval"
            checked={leaveConfig.approval === 'Manager → HR'}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, approval: val ? 'Manager → HR' : 'HR Only' });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Annual Carry Forward</strong>
            <span>Allow unused eligible leave balance to roll into the subsequent financial year</span>
          </div>
          <Toggle
            label="Carry Forward"
            checked={leaveConfig.carryForward}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, carryForward: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Leave Encashment at Year-End</strong>
            <span>Allow eligible earned leave balances to be encashed during payroll cycle</span>
          </div>
          <Toggle
            label="Leave Encashment"
            checked={leaveConfig.encashment}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, encashment: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Half-Day Leave Applications</strong>
            <span>Allow employees to apply for morning or afternoon half-day leaves</span>
          </div>
          <Toggle
            label="Half-Day Requests"
            checked={leaveConfig.halfDay}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, halfDay: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Mandatory Medical/Proof Attachments</strong>
            <span>Require supporting document upload for sick leaves exceeding 2 consecutive days</span>
          </div>
          <Toggle
            label="Attachments Required"
            checked={leaveConfig.attachmentRequired}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, attachmentRequired: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Allow Negative Leave Balance</strong>
            <span>Permit employees to take advance leave exceeding accrued balance</span>
          </div>
          <Toggle
            label="Negative Balance"
            checked={leaveConfig.negativeBalance}
            onChange={(val) => {
              setLeaveConfig({ ...leaveConfig, negativeBalance: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>
    </div>
  );

  // 7. Payroll Configuration
  const renderPayroll = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-group-header">
        <FiDollarSign />
        <h4>Payroll Cycle & Processing Timeline</h4>
      </div>

      <div className="bel-settings-form-grid">
        <div className="bel-form-field">
          <label>Pay Cycle Frequency</label>
          <select
            value={payrollConfig.payCycle}
            onChange={(e) => {
              setPayrollConfig({ ...payrollConfig, payCycle: e.target.value });
              setHasUnsavedChanges(true);
            }}
          >
            <option value="Monthly">Monthly</option>
            <option value="Bi-weekly">Bi-weekly</option>
          </select>
        </div>

        <div className="bel-form-field">
          <label>Payroll Cut-Off Day (of Month)</label>
          <input
            type="number"
            min="1"
            max="31"
            value={payrollConfig.payrollDay}
            onChange={(e) => {
              setPayrollConfig({ ...payrollConfig, payrollDay: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Salary Disbursement / Credit Day</label>
          <input
            type="number"
            min="1"
            max="31"
            value={payrollConfig.salaryDay}
            onChange={(e) => {
              setPayrollConfig({ ...payrollConfig, salaryDay: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Standard Monthly Working Days</label>
          <input
            type="number"
            min="20"
            max="31"
            value={payrollConfig.workingDays}
            onChange={(e) => {
              setPayrollConfig({ ...payrollConfig, workingDays: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-group-header" style={{ marginTop: '24px' }}>
        <FiCheckSquare />
        <h4>Statutory Deductions & Automated Computations</h4>
      </div>

      <div className="bel-settings-toggle-list">
        <div className="bel-toggle-row">
          <div>
            <strong>Approved Overtime Calculation</strong>
            <span>Include verified biometric overtime hours in salary disbursement</span>
          </div>
          <Toggle
            label="Overtime"
            checked={payrollConfig.overtime}
            onChange={(val) => {
              setPayrollConfig({ ...payrollConfig, overtime: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Employees' Provident Fund (EPF)</strong>
            <span>Calculate statutory employee (12%) and employer (12%) PF contributions</span>
          </div>
          <Toggle
            label="PF"
            checked={payrollConfig.pf}
            onChange={(val) => {
              setPayrollConfig({ ...payrollConfig, pf: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Employees' State Insurance (ESIC)</strong>
            <span>Apply statutory ESIC deduction for eligible wage ceilings (0.75% / 3.25%)</span>
          </div>
          <Toggle
            label="ESI"
            checked={payrollConfig.esi}
            onChange={(val) => {
              setPayrollConfig({ ...payrollConfig, esi: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>State Professional Tax (PT)</strong>
            <span>Deduct state-specific progressive PT rates from gross monthly wages</span>
          </div>
          <Toggle
            label="Professional Tax"
            checked={payrollConfig.professionalTax}
            onChange={(val) => {
              setPayrollConfig({ ...payrollConfig, professionalTax: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Tax Deducted at Source (TDS / Income Tax)</strong>
            <span>Withhold monthly income tax as per chosen tax regime declaration</span>
          </div>
          <Toggle
            label="TDS"
            checked={payrollConfig.tds}
            onChange={(val) => {
              setPayrollConfig({ ...payrollConfig, tds: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-info-alert">
        <FiAlertTriangle />
        <div>
          <strong>Payroll Freeze Lock Period</strong>
          <p>Once monthly payroll is approved and finalized by HR Director, salary structures and attendance logs for that cycle become read-only.</p>
        </div>
      </div>
    </div>
  );

  // 8. Tax Configuration
  const renderTax = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-group-header">
        <FiFileText />
        <h4>Statutory Tax Regime & Contribution Percentages</h4>
      </div>

      <div className="bel-settings-form-grid">
        <div className="bel-form-field">
          <label>Default Income Tax Regime</label>
          <select
            value={taxConfig.regime}
            onChange={(e) => {
              setTaxConfig({ ...taxConfig, regime: e.target.value });
              setHasUnsavedChanges(true);
            }}
          >
            <option value="New Tax Regime">New Tax Regime (Sec 115BAC)</option>
            <option value="Old Tax Regime">Old Tax Regime (With Deductions)</option>
          </select>
        </div>

        <div className="bel-form-field">
          <label>Employee EPF Rate (%)</label>
          <input
            type="text"
            value={taxConfig.pfEmployee}
            onChange={(e) => {
              setTaxConfig({ ...taxConfig, pfEmployee: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Employer EPF Rate (%)</label>
          <input
            type="text"
            value={taxConfig.pfEmployer}
            onChange={(e) => {
              setTaxConfig({ ...taxConfig, pfEmployer: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Employee ESIC Rate (%)</label>
          <input
            type="text"
            value={taxConfig.esiEmployee}
            onChange={(e) => {
              setTaxConfig({ ...taxConfig, esiEmployee: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Employer ESIC Rate (%)</label>
          <input
            type="text"
            value={taxConfig.esiEmployer}
            onChange={(e) => {
              setTaxConfig({ ...taxConfig, esiEmployer: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-toggle-list" style={{ marginTop: '20px' }}>
        <div className="bel-toggle-row">
          <div>
            <strong>State Professional Tax Automation</strong>
            <span>Apply state-specific slabs automatically based on employee work location</span>
          </div>
          <Toggle
            label="PT"
            checked={taxConfig.ptEnabled}
            onChange={(val) => {
              setTaxConfig({ ...taxConfig, ptEnabled: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Automated TDS Withholding</strong>
            <span>Calculate monthly income tax deduction based on verified 80C/80D declarations</span>
          </div>
          <Toggle
            label="TDS"
            checked={taxConfig.tdsEnabled}
            onChange={(val) => {
              setTaxConfig({ ...taxConfig, tdsEnabled: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-info-alert compliance">
        <FiShield />
        <div>
          <strong>Statutory Compliance Verified</strong>
          <p>Contribution rates are aligned with EPFO & ESIC guidelines for FY 2026-27. Last reviewed on August 2026.</p>
        </div>
      </div>
    </div>
  );

  // 9. Notifications
  const renderNotifications = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-group-header">
        <FiBell />
        <h4>Communication Channels & Delivery</h4>
      </div>

      <div className="bel-settings-toggle-list">
        <div className="bel-toggle-row">
          <div>
            <strong>Email Notifications</strong>
            <span>Send transactional emails for leave, payroll release and onboarding</span>
          </div>
          <Toggle
            label="Email Notifications"
            checked={notificationConfig.email}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, email: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>In-App Communication Center Alerts</strong>
            <span>Show live push alerts and badge badges inside the BELNOVA mobile app</span>
          </div>
          <Toggle
            label="In-App Alerts"
            checked={notificationConfig.inApp}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, inApp: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Daily HR Digest Email</strong>
            <span>Consolidate attendance anomalies and leave pending approvals into a single daily summary</span>
          </div>
          <Toggle
            label="Daily Digest"
            checked={notificationConfig.digest}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, digest: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        {notificationConfig.digest && (
          <div className="bel-conditional-field">
            <label>Daily Digest Dispatch Time</label>
            <input
              type="time"
              value={notificationConfig.digestTime}
              onChange={(e) => {
                setNotificationConfig({ ...notificationConfig, digestTime: e.target.value });
                setHasUnsavedChanges(true);
              }}
            />
          </div>
        )}
      </div>

      <div className="bel-settings-group-header" style={{ marginTop: '24px' }}>
        <FiAlertTriangle />
        <h4>Category Alert Subscriptions</h4>
      </div>

      <div className="bel-settings-toggle-list">
        <div className="bel-toggle-row">
          <div>
            <strong>Payroll & Compensation Alerts</strong>
            <span>Salary credit notifications, payslip availability & tax deduction alerts</span>
          </div>
          <Toggle
            label="Payroll Alerts"
            checked={notificationConfig.payroll}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, payroll: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Attendance & Biometric Sync Events</strong>
            <span>Device sync anomalies, late check-in warnings & regularization alerts</span>
          </div>
          <Toggle
            label="Attendance Alerts"
            checked={notificationConfig.attendance}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, attendance: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Leave Requests & Approvals</strong>
            <span>New employee leave requests, manager approvals & policy reminders</span>
          </div>
          <Toggle
            label="Leave Alerts"
            checked={notificationConfig.leave}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, leave: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Security & System Audit Alerts</strong>
            <span>Privileged logins, blocked attempts and system configuration changes</span>
          </div>
          <Toggle
            label="Security Alerts"
            checked={notificationConfig.security}
            onChange={(val) => {
              setNotificationConfig({ ...notificationConfig, security: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>
    </div>
  );

  // 10. Email Templates
  const renderEmailTemplates = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>Transactional Email Templates ({emailTemplates.length})</h3>
          <p>Standardized automated notification templates sent to employees and managers</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={() => openAddModal('email')}
        >
          <FiPlus /> New Template
        </button>
      </div>

      <div className="bel-settings-card-list">
        {emailTemplates.map((template) => (
          <div key={template.id} className="bel-settings-item-card">
            <div className="bel-item-card-header">
              <div className="bel-item-icon-box email">
                <FiMail />
              </div>
              <div className="bel-item-card-main">
                <div className="bel-item-title-row">
                  <h4>{template.name}</h4>
                  <span className={`bel-status-pill ${template.status === 'Active' ? 'success' : 'muted'}`}>
                    {template.status}
                  </span>
                </div>
                <p>Trigger Event: <strong>{template.event}</strong> · Channel: {template.channel}</p>
              </div>
            </div>

            <div className="bel-item-card-actions">
              <button
                type="button"
                className="bel-card-action-btn preview"
                onClick={() => setShowEmailPreview(template)}
              >
                <FiEye /> Preview
              </button>
              <button
                type="button"
                className="bel-card-action-btn edit"
                onClick={() => openAddModal('email', template)}
              >
                <FiEdit3 /> Edit
              </button>
              <button
                type="button"
                className="bel-card-action-btn delete"
                onClick={() => setShowDeleteConfirm({ type: 'email', id: template.id, name: template.name })}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 11. Security & Access
  const renderSecurity = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-security-hero">
        <div className="bel-security-hero-left">
          <div className="bel-security-icon-large">
            <FiShield />
          </div>
          <div>
            <h3>Security Posture: {dynamicSecurityScore >= 80 ? 'Strong' : 'Moderate'}</h3>
            <p>Enterprise multi-factor authentication, session limits and access controls are actively enforced.</p>
          </div>
        </div>
        <div className="bel-security-score-badge">
          <strong>{dynamicSecurityScore}</strong>
          <span>/ 100</span>
        </div>
      </div>

      <div className="bel-settings-group-header">
        <FiLock />
        <h4>Authentication & Privilege Controls</h4>
      </div>

      <div className="bel-settings-toggle-list">
        <div className="bel-toggle-row">
          <div>
            <strong>Multi-Factor Authentication (MFA / 2FA)</strong>
            <span>Require authenticator OTP verification for all HR Administrator logins</span>
          </div>
          <Toggle
            label="MFA"
            checked={securityConfig.mfa}
            onChange={(val) => {
              setSecurityConfig({ ...securityConfig, mfa: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Corporate IP Address Restriction</strong>
            <span>Restrict HR Admin portal access strictly to whitelisted corporate VPN IPs</span>
          </div>
          <Toggle
            label="IP Restriction"
            checked={securityConfig.ipRestriction}
            onChange={(val) => {
              setSecurityConfig({ ...securityConfig, ipRestriction: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Security Audit Logging</strong>
            <span>Record immutable audit logs for every privilege modification & permission change</span>
          </div>
          <Toggle
            label="Audit Logging"
            checked={securityConfig.auditLogging}
            onChange={(val) => {
              setSecurityConfig({ ...securityConfig, auditLogging: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-toggle-row">
          <div>
            <strong>Biometric Device Hardware Verification</strong>
            <span>Verify cryptographic handshake on all ZKTeco attendance biometric terminals</span>
          </div>
          <Toggle
            label="Biometric Verification"
            checked={securityConfig.biometricVerification}
            onChange={(val) => {
              setSecurityConfig({ ...securityConfig, biometricVerification: val });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-group-header" style={{ marginTop: '24px' }}>
        <FiClock />
        <h4>Session Timeouts & Password Governance</h4>
      </div>

      <div className="bel-settings-form-grid">
        <div className="bel-form-field">
          <label>Inactivity Session Timeout (Minutes)</label>
          <input
            type="number"
            value={securityConfig.sessionTimeout}
            onChange={(e) => {
              setSecurityConfig({ ...securityConfig, sessionTimeout: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Password Expiry Cycle (Days)</label>
          <input
            type="number"
            value={securityConfig.passwordExpiry}
            onChange={(e) => {
              setSecurityConfig({ ...securityConfig, passwordExpiry: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="bel-form-field">
          <label>Max Consecutive Failed Login Attempts</label>
          <input
            type="number"
            value={securityConfig.loginAttempts}
            onChange={(e) => {
              setSecurityConfig({ ...securityConfig, loginAttempts: e.target.value });
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      </div>

      <div className="bel-settings-danger-box">
        <div>
          <strong>Emergency Break-Glass Access Controls</strong>
          <p>Review authorized super-admin emergency fallback credentials and audit bypass logs.</p>
        </div>
        <button
          type="button"
          className="bel-btn-danger-outline"
          onClick={() => setShowEmergencyModal(true)}
        >
          <FiLock /> Review Access
        </button>
      </div>
    </div>
  );

  // 12. Audit Logs
  const renderAudit = () => (
    <div className="bel-settings-section-card">
      <div className="bel-settings-subhead-row">
        <div>
          <h3>System Audit Trail ({auditLogs.length} Events)</h3>
          <p>Immutable history of configuration changes, security events and policy adjustments</p>
        </div>
        <button
          type="button"
          className="bel-btn-primary"
          onClick={handleExportAuditLogs}
        >
          <FiArchive /> Export CSV
        </button>
      </div>

      <div className="bel-settings-kpi-summary">
        <div className="bel-kpi-box">
          <strong>{auditLogs.length}</strong>
          <span>Recorded Events</span>
        </div>
        <div className="bel-kpi-box">
          <strong>{auditLogs.filter((l) => l.result === 'Success').length}</strong>
          <span>Successful</span>
        </div>
        <div className="bel-kpi-box">
          <strong style={{ color: '#dc2626' }}>{auditLogs.filter((l) => l.result === 'Blocked').length}</strong>
          <span>Blocked Attempts</span>
        </div>
      </div>

      <div className="bel-audit-timeline">
        {auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <FiActivity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 6px', color: '#1e293b' }}>No Audit Events</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>System configuration actions will be logged here.</p>
          </div>
        ) : (
          auditLogs.map((log) => (
          <div key={log.id} className="bel-audit-card">
            <div className="bel-audit-card-top">
              <span className={`bel-audit-badge ${log.result.toLowerCase()}`}>
                {log.result === 'Success' ? <FiCheck /> : <FiAlertCircle />} {log.result}
              </span>
              <span className="bel-audit-time">{log.time}</span>
            </div>
            <h4>{log.action}</h4>
            <div className="bel-audit-meta">
              <span>Initiated By: <strong>{log.user}</strong></span>
              <span>Module: <strong>{log.module}</strong></span>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );

  // Section Selector Dispatcher
  const renderActiveSectionContent = () => {
    switch (activeSection) {
      case 'company': return renderCompanyProfile();
      case 'branches': return renderBranches();
      case 'departments': return renderDepartments();
      case 'designations': return renderDesignations();
      case 'shifts': return renderShifts();
      case 'leave': return renderLeavePolicies();
      case 'payroll': return renderPayroll();
      case 'tax': return renderTax();
      case 'notifications': return renderNotifications();
      case 'email': return renderEmailTemplates();
      case 'security': return renderSecurity();
      case 'audit': return renderAudit();
      default: return null;
    }
  };

  /* ==========================================================================
     MAIN SETTINGS HUB (LANDING SCREEN)
     ========================================================================== */
  const renderSettingsHub = () => (
    <div className="bel-settings-hub">
      {/* Search Bar */}
      <div className="bel-settings-search-bar">
        <FiSearch />
        <input
          type="search"
          placeholder="Search system settings, policies, payroll..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
            <FiX />
          </button>
        )}
      </div>

      {/* Configuration Health Summary Banner */}
      <div className="bel-settings-health-hero">
        <div className="bel-health-hero-main">
          <div className="bel-health-icon">
            <FiServer />
          </div>
          <div>
            <h3>BELNOVA HRMS Configuration Center</h3>
            <p>System Version 2.6.0 · Production Environment</p>
          </div>
        </div>

        <div className="bel-health-metrics-row">
          <div className="bel-health-metric-chip">
            <FiCheckCircle className="icon-success" />
            <span>Organization Active</span>
          </div>
          <div className="bel-health-metric-chip">
            <FiCheckCircle className="icon-success" />
            <span>Payroll Configured</span>
          </div>
          <div className="bel-health-metric-chip">
            <FiCheckCircle className="icon-success" />
            <span>Security Protected (85/100)</span>
          </div>
        </div>
      </div>

      {/* Grouped Category Navigation Cards */}
      <div className="bel-settings-groups-container">
        {groupedSections.map((group) => (
          <div key={group.label} className="bel-settings-group-block">
            <div className="bel-group-title">
              <span>{group.label}</span>
            </div>

            <div className="bel-settings-nav-cards">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="bel-settings-nav-card"
                    onClick={() => handleNavigateSection(item.id)}
                  >
                    <div className="bel-nav-card-icon-box">
                      <IconComponent />
                    </div>
                    <div className="bel-nav-card-body">
                      <div className="bel-nav-card-title-line">
                        <h4>{item.label}</h4>
                        <span className="bel-nav-card-status">{item.statusText}</span>
                      </div>
                      <p>{item.description}</p>
                    </div>
                    <FiChevronRight className="bel-nav-card-arrow" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {groupedSections.length === 0 && (
          <div className="bel-settings-empty-card">
            <FiSearch />
            <h4>No configuration area found</h4>
            <p>No settings matched your query "{searchQuery}".</p>
            <button
              type="button"
              className="bel-btn-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container bel-settings-app-container">
      {/* App Header with Dynamic Title & Back Navigation */}
      <AppHeader
        title={activeSection === 'hub' ? 'HRMS Settings' : (currentSectionMeta?.label || 'System Settings')}
        showBack={activeSection !== 'hub'}
        onBack={() => handleNavigateSection('hub')}
      />

      <main className="page-content bel-settings-page-content">
        {activeSection === 'hub' ? (
          renderSettingsHub()
        ) : (
          <div className="bel-settings-detail-screen">
            {/* Breadcrumb Navigation on Detail Screen */}
            <div className="bel-settings-detail-top-nav">
              <button
                type="button"
                className="bel-settings-back-pill"
                onClick={() => handleNavigateSection('hub')}
              >
                <FiArrowLeft /> Settings Hub
              </button>
              <span className="bel-settings-section-badge">
                {currentSectionMeta?.groupLabel}
              </span>
            </div>

            {/* Section Heading */}
            <div className="bel-settings-detail-header">
              <h2>{currentSectionMeta?.label}</h2>
              <p>{currentSectionMeta?.description}</p>
            </div>

            {/* Active Section Content */}
            {renderActiveSectionContent()}
          </div>
        )}
      </main>

      {/* Sticky Bottom Save Bar when Unsaved Changes exist */}
      {hasUnsavedChanges && activeSection !== 'hub' && (
        <div className="bel-settings-sticky-save-bar">
          <div className="bel-sticky-save-content">
            <div className="bel-sticky-save-info">
              <FiInfo />
              <span>You have unsaved changes in {currentSectionMeta?.label}</span>
            </div>
            <div className="bel-sticky-save-actions">
              <button
                type="button"
                className="bel-btn-secondary"
                onClick={() => setHasUnsavedChanges(false)}
              >
                Discard
              </button>
              <button
                type="button"
                className="bel-btn-primary"
                onClick={() => handleSaveSection(currentSectionMeta?.label || 'Settings')}
              >
                <FiSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit General Modal */}
      {showAddModal && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bel-settings-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>{editingItem ? 'Edit' : 'Add'} {modalType === 'email' ? 'Email Template' : modalType === 'shift' ? 'Shift Policy' : modalType}</h3>
                <p>Provide the details below to update system configuration</p>
              </div>
              <button type="button" className="bel-modal-close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="bel-modal-form">
              {modalType === 'branch' && (
                <>
                  <div className="bel-form-field">
                    <label>Branch Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune Technology Center"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                    {formErrors.name && <span className="bel-field-error">{formErrors.name}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={modalForm.city || ''}
                      onChange={(e) => setModalForm({ ...modalForm, city: e.target.value })}
                    />
                    {formErrors.city && <span className="bel-field-error">{formErrors.city}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Employees</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={modalForm.employees || ''}
                      onChange={(e) => setModalForm({ ...modalForm, employees: e.target.value })}
                    />
                  </div>
                  <div className="bel-form-field">
                    <label>Status</label>
                    <select
                      value={modalForm.status || 'Active'}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'department' && (
                <>
                  <div className="bel-form-field">
                    <label>Department Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Quality Assurance"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                    {formErrors.name && <span className="bel-field-error">{formErrors.name}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Department Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. QA"
                      value={modalForm.code || ''}
                      onChange={(e) => setModalForm({ ...modalForm, code: e.target.value.toUpperCase() })}
                    />
                    {formErrors.code && <span className="bel-field-error">{formErrors.code}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Department Head *</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Singh"
                      value={modalForm.head || ''}
                      onChange={(e) => setModalForm({ ...modalForm, head: e.target.value })}
                    />
                    {formErrors.head && <span className="bel-field-error">{formErrors.head}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Headcount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={modalForm.employees || ''}
                      onChange={(e) => setModalForm({ ...modalForm, employees: e.target.value })}
                    />
                  </div>
                </>
              )}

              {modalType === 'designation' && (
                <>
                  <div className="bel-form-field">
                    <label>Designation Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Frontend Architect"
                      value={modalForm.title || ''}
                      onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    />
                    {formErrors.title && <span className="bel-field-error">{formErrors.title}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Department</label>
                    <select
                      value={modalForm.department || 'Engineering'}
                      onChange={(e) => setModalForm({ ...modalForm, department: e.target.value })}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bel-form-field">
                    <label>Job Band / Level</label>
                    <select
                      value={modalForm.level || 'L2'}
                      onChange={(e) => setModalForm({ ...modalForm, level: e.target.value })}
                    >
                      <option value="L1">L1 - Entry Level</option>
                      <option value="L2">L2 - Associate</option>
                      <option value="L3">L3 - Senior</option>
                      <option value="L4">L4 - Lead / Staff</option>
                      <option value="L5">L5 - Principal / Manager</option>
                      <option value="L6">L6 - Director / Executive</option>
                    </select>
                  </div>
                  <div className="bel-form-field">
                    <label>Employees Assigned</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={modalForm.employees || ''}
                      onChange={(e) => setModalForm({ ...modalForm, employees: e.target.value })}
                    />
                  </div>
                </>
              )}

              {modalType === 'shift' && (
                <>
                  <div className="bel-form-field">
                    <label>Shift Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Afternoon Support Shift"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                    {formErrors.name && <span className="bel-field-error">{formErrors.name}</span>}
                  </div>
                  <div className="bel-modal-two-col">
                    <div className="bel-form-field">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={modalForm.start || '09:00'}
                        onChange={(e) => setModalForm({ ...modalForm, start: e.target.value })}
                      />
                    </div>
                    <div className="bel-form-field">
                      <label>End Time *</label>
                      <input
                        type="time"
                        value={modalForm.end || '18:00'}
                        onChange={(e) => setModalForm({ ...modalForm, end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="bel-modal-two-col">
                    <div className="bel-form-field">
                      <label>Grace Period (Mins)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={modalForm.grace || ''}
                        onChange={(e) => setModalForm({ ...modalForm, grace: e.target.value })}
                      />
                    </div>
                    <div className="bel-form-field">
                      <label>Break Duration (Mins)</label>
                      <input
                        type="number"
                        placeholder="60"
                        value={modalForm.break || ''}
                        onChange={(e) => setModalForm({ ...modalForm, break: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="bel-toggle-row">
                    <div>
                      <strong>Overnight / Cross-Day Shift</strong>
                      <span>Shift timings extend past midnight into the next day</span>
                    </div>
                    <Toggle
                      label="Overnight"
                      checked={Boolean(modalForm.overnight)}
                      onChange={(val) => setModalForm({ ...modalForm, overnight: val })}
                    />
                  </div>
                </>
              )}

              {modalType === 'email' && (
                <>
                  <div className="bel-form-field">
                    <label>Template Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Appraisal Letter Published"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                    {formErrors.name && <span className="bel-field-error">{formErrors.name}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Trigger Event *</label>
                    <input
                      type="text"
                      placeholder="e.g. Performance Review Completion"
                      value={modalForm.event || ''}
                      onChange={(e) => setModalForm({ ...modalForm, event: e.target.value })}
                    />
                    {formErrors.event && <span className="bel-field-error">{formErrors.event}</span>}
                  </div>
                  <div className="bel-form-field">
                    <label>Subject Line</label>
                    <input
                      type="text"
                      placeholder="e.g. Your Annual Appraisal Letter is Available"
                      value={modalForm.subject || ''}
                      onChange={(e) => setModalForm({ ...modalForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="bel-modal-two-col">
                    <div className="bel-form-field">
                      <label>Channel</label>
                      <select
                        value={modalForm.channel || 'Email'}
                        onChange={(e) => setModalForm({ ...modalForm, channel: e.target.value })}
                      >
                        <option value="Email">Email</option>
                        <option value="Email + Push">Email + Push</option>
                      </select>
                    </div>
                    <div className="bel-form-field">
                      <label>Status</label>
                      <select
                        value={modalForm.status || 'Active'}
                        onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="bel-modal-actions">
                <button type="button" className="bel-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="bel-btn-primary">
                  <FiSave /> {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowDeleteConfirm(null)}
        >
          <div className="bel-settings-modal-card confirm-delete">
            <div className="bel-delete-icon-box">
              <FiAlertTriangle />
            </div>
            <h3>Delete {showDeleteConfirm.type}?</h3>
            <p>Are you sure you want to remove <strong>"{showDeleteConfirm.name}"</strong>? This configuration will be permanently purged.</p>
            <div className="bel-modal-actions">
              <button
                type="button"
                className="bel-btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bel-btn-danger"
                onClick={handleConfirmDelete}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Policy Config Modal */}
      {showLeaveEditor && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowLeaveEditor(null)}
        >
          <div className="bel-settings-modal-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Configure {showLeaveEditor.name}</h3>
                <p>Adjust annual quotas, carry-forward limits and rules</p>
              </div>
              <button type="button" className="bel-modal-close-btn" onClick={() => setShowLeaveEditor(null)}>
                <FiX />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveLeavePolicy(showLeaveEditor);
              }}
              className="bel-modal-form"
            >
              <div className="bel-form-field">
                <label>Annual Quota (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={showLeaveEditor.annual}
                  onChange={(e) =>
                    setShowLeaveEditor({
                      ...showLeaveEditor,
                      annual: Number(e.target.value),
                      remaining: Number(e.target.value) - showLeaveEditor.used,
                    })
                  }
                />
              </div>

              <div className="bel-form-field">
                <label>Carry-Forward Rule</label>
                <select
                  value={showLeaveEditor.carryForward}
                  onChange={(e) => setShowLeaveEditor({ ...showLeaveEditor, carryForward: e.target.value })}
                >
                  <option value="Yes (max 5 days)">Yes (max 5 days)</option>
                  <option value="Yes (max 10 days)">Yes (max 10 days)</option>
                  <option value="Full Roll-over">Full Roll-over</option>
                  <option value="No">No Carry-Forward</option>
                </select>
              </div>

              <div className="bel-toggle-row">
                <div>
                  <strong>Enable Encashment</strong>
                  <span>Allow unused balance to be encashed during year-end payroll</span>
                </div>
                <Toggle
                  label="Encashment"
                  checked={showLeaveEditor.encashment}
                  onChange={(val) => setShowLeaveEditor({ ...showLeaveEditor, encashment: val })}
                />
              </div>

              <div className="bel-modal-actions">
                <button type="button" className="bel-btn-secondary" onClick={() => setShowLeaveEditor(null)}>
                  Cancel
                </button>
                <button type="submit" className="bel-btn-primary">
                  <FiSave /> Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Template Preview Modal */}
      {showEmailPreview && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowEmailPreview(null)}
        >
          <div className="bel-settings-modal-card email-preview-card">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Template Preview: {showEmailPreview.name}</h3>
                <p>Triggered on: {showEmailPreview.event}</p>
              </div>
              <button type="button" className="bel-modal-close-btn" onClick={() => setShowEmailPreview(null)}>
                <FiX />
              </button>
            </div>

            <div className="bel-email-preview-body">
              <div className="bel-preview-header">
                <div><span>From:</span> <strong>BELNOVA HRMS &lt;hr.support@belnova.tech&gt;</strong></div>
                <div><span>Subject:</span> <strong>{showEmailPreview.subject || showEmailPreview.name}</strong></div>
              </div>

              <div className="bel-preview-content">
                <p>Dear <strong>{'{Employee Name}'}</strong>,</p>
                <p>This is an automated notification from BELNOVA Technologies regarding your <strong>{showEmailPreview.event}</strong>.</p>
                <div className="bel-preview-highlight-box">
                  <p><strong>Event:</strong> {showEmailPreview.event}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p><strong>Reference ID:</strong> BEL-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
                <p>Please log in to your BELNOVA Mobile HRMS app to review and take any necessary actions.</p>
                <p>Best regards,<br /><strong>HR Operations Team</strong><br />BELNOVA Technologies</p>
              </div>
            </div>

            <div className="bel-modal-actions">
              <button type="button" className="bel-btn-primary" onClick={() => setShowEmailPreview(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Break-Glass Access Modal */}
      {showEmergencyModal && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowEmergencyModal(false)}
        >
          <div className="bel-settings-modal-card emergency-modal">
            <div className="bel-modal-header">
              <div className="bel-modal-header-copy">
                <h3>Emergency Break-Glass Access</h3>
                <p>Authorized Super-Admin fallback credentials and security logs</p>
              </div>
              <button type="button" className="bel-modal-close-btn" onClick={() => setShowEmergencyModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="bel-emergency-body">
              <div className="bel-emergency-status-box">
                <FiShield />
                <div>
                  <strong>Zero Active Emergency Sessions</strong>
                  <p>All administrative sessions are currently verified through standard SAML / MFA protocols.</p>
                </div>
              </div>

              <h4>Authorized Emergency Custodians</h4>
              <div className="bel-custodian-list">
                <div className="bel-custodian-row">
                  <div>
                    <strong>{user?.name || 'Primary Administrator'}</strong>
                    <span>HR Administrator · Primary Admin</span>
                  </div>
                  <span className="bel-status-pill success">Verified</span>
                </div>
                <div className="bel-custodian-row">
                  <div>
                    <strong>Technical Custodian</strong>
                    <span>IT Security Lead · Technical Custodian</span>
                  </div>
                  <span className="bel-status-pill success">Verified</span>
                </div>
              </div>
            </div>

            <div className="bel-modal-actions">
              <button type="button" className="bel-btn-primary" onClick={() => setShowEmergencyModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Unsaved Changes Navigation Modal */}
      {pendingNavigation && (
        <div
          className="bel-settings-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setPendingNavigation(null)}
        >
          <div className="bel-settings-modal-card confirm-discard">
            <div className="bel-delete-icon-box warning">
              <FiAlertTriangle />
            </div>
            <h3>Unsaved Changes</h3>
            <p>You have modified settings that haven't been saved yet. Do you want to discard your changes and continue?</p>
            <div className="bel-modal-actions">
              <button
                type="button"
                className="bel-btn-secondary"
                onClick={() => setPendingNavigation(null)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="bel-btn-danger"
                onClick={confirmDiscardNavigation}
              >
                Discard & Navigate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`bel-settings-toast ${toast.type}`}>
          {toast.type === 'success' && <FiCheckCircle />}
          {toast.type === 'error' && <FiAlertCircle />}
          {toast.type === 'warning' && <FiAlertTriangle />}
          {toast.type === 'info' && <FiInfo />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Bottom Navigation for HR Admin */}
      <BottomNavigation />
    </div>
  );
};
