import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckSquare,
  DollarSign,
  RefreshCw,
  UploadCloud,
  BarChart2,
} from 'lucide-react';
import './HRQuickActions.css';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
  bg: string;
}

export const HRQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'add-emp',
      title: 'Add Employee',
      subtitle: 'Onboard new staff',
      path: '/hr/employees/add',
      icon: <UserPlus size={20} color="#2F6FED" />,
      bg: '#EFF6FF',
    },
    {
      id: 'approve-leave',
      title: 'Approve Leave',
      subtitle: '2 pending requests',
      path: '/hr/leave-management',
      icon: <CheckSquare size={20} color="#10B981" />,
      bg: '#ECFDF5',
    },
    {
      id: 'run-payroll',
      title: 'Run Payroll',
      subtitle: 'Disburse Sep 2026',
      path: '/hr/payroll',
      icon: <DollarSign size={20} color="#635BEB" />,
      bg: '#F5F3FF',
    },
    {
      id: 'sync-biometric',
      title: 'Sync Biometric',
      subtitle: '4 devices online',
      path: '/hr/biometric-sync',
      icon: <RefreshCw size={20} color="#F59E0B" />,
      bg: '#FFFBEB',
    },
    {
      id: 'upload-doc',
      title: 'Upload Document',
      subtitle: 'Policies & forms',
      path: '/hr/documents',
      icon: <UploadCloud size={20} color="#06B6D4" />,
      bg: '#ECFEFF',
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      subtitle: 'Analytics & logs',
      path: '/hr/reports',
      icon: <BarChart2 size={20} color="#D946EF" />,
      bg: '#FDF4FF',
    },
  ];

  return (
    <div className="hr-section-card hr-quick-actions-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">Quick Actions</h3>
          <span className="hr-section-subtitle">Frequently accessed HR administrator tools</span>
        </div>
      </div>

      <div className="hr-quick-actions-grid">
        {actions.map((act) => (
          <div
            key={act.id}
            className="hr-quick-action-item"
            onClick={() => navigate(act.path)}
            role="button"
            tabIndex={0}
          >
            <div className="hr-qa-icon-wrap" style={{ backgroundColor: act.bg }}>
              {act.icon}
            </div>
            <div className="hr-qa-text">
              <strong className="hr-qa-title">{act.title}</strong>
              <span className="hr-qa-sub">{act.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
