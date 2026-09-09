import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import './HRPendingApprovals.css';

interface PendingApproval {
  id: string;
  name: string;
  initials: string;
  request: string;
  tag: string;
  avatarBg: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const HRPendingApprovals: React.FC = () => {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState<PendingApproval[]>([
    {
      id: 'app-1',
      name: 'Arjun Mehta',
      initials: 'AM',
      request: 'Casual Leave · 2 Days',
      tag: 'Leave',
      avatarBg: '#2F6FED',
      status: 'Pending',
    },
    {
      id: 'app-2',
      name: 'Kavya Nair',
      initials: 'KN',
      request: 'Sick Leave · 1 Day',
      tag: 'Leave',
      avatarBg: '#D946EF',
      status: 'Pending',
    },
  ]);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    item: PendingApproval | null;
  }>({
    isOpen: false,
    type: 'approve',
    item: null,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;

  const handleOpenDialog = (type: 'approve' | 'reject', item: PendingApproval) => {
    setDialogState({ isOpen: true, type, item });
  };

  const handleConfirmAction = () => {
    if (!dialogState.item) return;

    const newStatus = dialogState.type === 'approve' ? 'Approved' : 'Rejected';
    setApprovals((prev) =>
      prev.map((a) => (a.id === dialogState.item?.id ? { ...a, status: newStatus } : a))
    );

    const message =
      dialogState.type === 'approve'
        ? `Approved leave request for ${dialogState.item.name}`
        : `Rejected leave request for ${dialogState.item.name}`;

    setToastMessage(message);
    setDialogState({ isOpen: false, type: 'approve', item: null });

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="hr-section-card hr-approvals-card">
      {/* Toast notification */}
      {toastMessage && (
        <div className="hr-approval-toast">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {dialogState.isOpen && dialogState.item && (
        <div className="hr-dialog-overlay" onClick={() => setDialogState({ isOpen: false, type: 'approve', item: null })}>
          <div className="hr-dialog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-dialog-header">
              {dialogState.type === 'approve' ? (
                <div className="hr-dialog-icon-wrap icon-green">
                  <CheckCircle size={24} />
                </div>
              ) : (
                <div className="hr-dialog-icon-wrap icon-red">
                  <AlertTriangle size={24} />
                </div>
              )}
              <h4>{dialogState.type === 'approve' ? 'Approve Request' : 'Reject Request'}</h4>
            </div>

            <p className="hr-dialog-body">
              Are you sure you want to {dialogState.type} the leave request for{' '}
              <strong>{dialogState.item.name}</strong> ({dialogState.item.request})?
            </p>

            <div className="hr-dialog-footer">
              <button
                type="button"
                className="hr-dialog-btn-cancel"
                onClick={() => setDialogState({ isOpen: false, type: 'approve', item: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`hr-dialog-btn-confirm ${dialogState.type === 'approve' ? 'btn-confirm-green' : 'btn-confirm-red'}`}
                onClick={handleConfirmAction}
              >
                {dialogState.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">Pending Approvals</h3>
          <span className="hr-section-subtitle">
            {pendingCount === 0
              ? 'All requests have been addressed'
              : `${pendingCount} request${pendingCount === 1 ? '' : 's'} require your action`}
          </span>
        </div>

        <button
          type="button"
          className="hr-view-all-link"
          onClick={() => navigate('/hr/leave-management')}
        >
          View all →
        </button>
      </div>

      {/* Approvals List */}
      <div className="hr-approvals-list">
        {approvals.map((item) => (
          <div key={item.id} className="hr-approval-item">
            <div className="hr-app-left">
              <div className="hr-app-avatar" style={{ backgroundColor: item.avatarBg }}>
                {item.initials}
              </div>

              <div className="hr-app-info">
                <div className="hr-app-name-row">
                  <strong className="hr-app-name">{item.name}</strong>
                  <span className="hr-app-tag">{item.tag}</span>
                </div>
                <span className="hr-app-req">{item.request}</span>
              </div>
            </div>

            <div className="hr-app-actions">
              {item.status === 'Pending' ? (
                <>
                  <button
                    type="button"
                    className="hr-btn-approve-mobile"
                    onClick={() => handleOpenDialog('approve', item)}
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    className="hr-btn-reject-mobile"
                    onClick={() => handleOpenDialog('reject', item)}
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <span className={`hr-app-status-badge badge-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
