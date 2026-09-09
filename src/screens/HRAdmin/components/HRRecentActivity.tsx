import React from 'react';
import { UserPlus, Calendar, FileText, Clock, UserCheck } from 'lucide-react';
import './HRRecentActivity.css';

interface ActivityItem {
  id: string;
  name: string;
  initials: string;
  action: string;
  time: string;
  avatarBg: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const HRRecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      name: 'Rahul Kumar',
      initials: 'RK',
      action: 'joined Engineering',
      time: '2m ago',
      avatarBg: '#2F6FED',
      icon: <UserPlus size={13} color="#2F6FED" />,
      iconBg: '#EFF6FF',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      initials: 'PS',
      action: 'applied for Sick Leave',
      time: '14m ago',
      avatarBg: '#D946EF',
      icon: <Calendar size={13} color="#D946EF" />,
      iconBg: '#FDF4FF',
    },
    {
      id: '3',
      name: 'Arjun Reddy',
      initials: 'AR',
      action: 'payslip downloaded',
      time: '28m ago',
      avatarBg: '#10B981',
      icon: <FileText size={13} color="#10B981" />,
      iconBg: '#ECFDF5',
    },
    {
      id: '4',
      name: 'Sneha Rao',
      initials: 'SR',
      action: 'attendance regularized',
      time: '1h ago',
      avatarBg: '#F59E0B',
      icon: <Clock size={13} color="#F59E0B" />,
      iconBg: '#FFFBEB',
    },
    {
      id: '5',
      name: 'Vikram Singh',
      initials: 'VS',
      action: 'profile updated',
      time: '2h ago',
      avatarBg: '#635BEB',
      icon: <UserCheck size={13} color="#635BEB" />,
      iconBg: '#F5F3FF',
    },
  ];

  return (
    <div className="hr-section-card hr-activity-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">Recent Activity</h3>
          <span className="hr-section-subtitle">Real-time organizational events</span>
        </div>
        <div className="hr-live-status-pill">
          <span className="hr-live-dot" />
          <span>Live</span>
        </div>
      </div>

      <div className="hr-activity-timeline">
        {activities.map((item, idx) => (
          <div key={item.id} className="hr-timeline-item">
            {idx !== activities.length - 1 && <div className="hr-timeline-line" />}

            <div className="hr-timeline-avatar-wrap">
              <div className="hr-timeline-avatar" style={{ backgroundColor: item.avatarBg }}>
                {item.initials}
              </div>
              <div className="hr-timeline-subicon" style={{ backgroundColor: item.iconBg }}>
                {item.icon}
              </div>
            </div>

            <div className="hr-timeline-content">
              <p className="hr-timeline-text">
                <strong className="hr-timeline-user">{item.name}</strong>{' '}
                <span className="hr-timeline-action">{item.action}</span>
              </p>
              <span className="hr-timeline-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
