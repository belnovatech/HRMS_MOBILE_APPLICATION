import React from 'react';
import { LeaveRequest } from '../../types';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './LeaveCard.css';

interface LeaveCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export const LeaveCard: React.FC<LeaveCardProps> = ({
  request,
  onApprove,
  onReject,
  showActions = false,
}) => {
  return (
    <div className="leave-card">
      <div className="leave-card-top">
        <div className="leave-user">
          <div className="leave-avatar" style={{ backgroundColor: request.avatarBg || '#10b981' }}>
            {request.initials || request.employeeName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="leave-emp-name">{request.employeeName}</h4>
            <span className="leave-type-badge">{request.leaveType}</span>
          </div>
        </div>

        <span
          className={`badge ${
            request.status === 'Approved'
              ? 'badge-success'
              : request.status === 'Rejected'
              ? 'badge-danger'
              : 'badge-warning'
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="leave-dates">
        <span className="date-range">
          <Calendar size={14} /> {request.startDate} to {request.endDate}
        </span>
        <span className="duration-tag">{request.duration}</span>
      </div>

      <p className="leave-reason">"{request.reason}"</p>

      {request.rejectReason && (
        <div className="reject-note">
          <strong>Reason for rejection:</strong> {request.rejectReason}
        </div>
      )}

      {showActions && request.status === 'Pending' && (
        <div className="leave-actions">
          {onApprove && (
            <button className="btn-approve" onClick={() => onApprove(request.id)}>
              <CheckCircle2 size={16} /> Approve
            </button>
          )}
          {onReject && (
            <button className="btn-reject" onClick={() => onReject(request.id)}>
              <XCircle size={16} /> Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};
