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

import { LeaveRequest, NotificationItem } from '../../../types';
import './HRRecentActivity.css';

export interface HRRecentActivityProps {
  leaveRequests?: LeaveRequest[];
  notificationsList?: NotificationItem[];
}

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

export const HRRecentActivity: React.FC<HRRecentActivityProps> = ({
  leaveRequests = [],
  notificationsList = [],
}) => {
  const activities: ActivityItem[] = React.useMemo(() => {
    const list: ActivityItem[] = [];

    (leaveRequests || []).slice(0, 3).forEach((l, idx) => {
      list.push({
        id: `leave-${l.id || idx}`,
        name: l.employeeName || 'Employee',
        initials: l.initials || (l.employeeName || 'EM').slice(0, 2).toUpperCase(),
        action: `applied for ${l.leaveType} (${l.status})`,
        time: l.appliedOn ? new Date(l.appliedOn).toLocaleDateString() : 'Recent',
        avatarBg: '#D946EF',
        icon: <Calendar size={13} color="#D946EF" />,
        iconBg: '#FDF4FF',
      });
    });

    (notificationsList || []).slice(0, 3).forEach((n, idx) => {
      list.push({
        id: `notif-${n.id || idx}`,
        name: n.title,
        initials: 'NT',
        action: n.message,
        time: n.time || 'Today',
        avatarBg: '#2F6FED',
        icon: <FileText size={13} color="#2F6FED" />,
        iconBg: '#EFF6FF',
      });
    });

    if (list.length === 0) {
      list.push({
        id: '1',
        name: 'Belnova HRMS',
        initials: 'BH',
        action: 'System synchronized with live cloud backend',
        time: 'Just now',
        avatarBg: '#10B981',
        icon: <UserCheck size={13} color="#10B981" />,
        iconBg: '#ECFDF5',
      });
    }

    return list;
  }, [leaveRequests, notificationsList]);

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
