import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  User as UserIcon,
  Briefcase,
  CreditCard,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
} from 'lucide-react';
import './EmployeeProfile.css';

export const EmployeeProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'bank'>('personal');
  const [copiedField, setCopiedField] = useState('');

  const profile = useMemo(
    () => ({
      name: user?.name || 'Employee',
      avatar: user?.avatar || 'EM',
      avatarBg: user?.avatarBg || '#10b981',

      employeeId: user?.employeeId || user?.id || 'Not available',
      designation: user?.designation || 'Not available',
      department: user?.department || 'Not available',
      reportsTo: user?.reportsTo || 'Not available',

      email: user?.email || 'Not available',
      phone: user?.phone || 'Not available',
      address: user?.address || 'Not available',

      branch: (user as any)?.branch || (user as any)?.location || 'Bengaluru HQ',
      workMode: (user as any)?.workMode || 'Hybrid / On-site',

      joiningDate:
        user?.joiningDate ||
        (user as any)?.dateOfJoining ||
        'Jan 15, 2023',

      status: (user as any)?.status || 'Active',

      bankAccount:
        (user as any)?.bankAccount ||
        (user as any)?.bankAccountNumber ||
        'XXXX-XXXX-4829',

      bankName: (user as any)?.bankName || 'HDFC Bank Ltd',
      ifsc: (user as any)?.ifsc || 'HDFC0001234',

      pan: (user as any)?.pan || 'ABCDE1234F',
      pfUan: (user as any)?.pfUan || '100987654321',

      emergencyContact: (user as any)?.emergencyContact || '+91 98765 00000',
      emergencyName: (user as any)?.emergencyName || 'Kavita Mehta',
      emergencyRelation: (user as any)?.emergencyRelation || 'Spouse / Relative',
    }),
    [user]
  );

  const copyToClipboard = async (value: string, fieldName: string) => {
    if (!value || value === 'Not available') return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 1800);
    } catch (err) {
      console.error('Unable to copy:', err);
    }
  };

  const renderCopyButton = (value: string, fieldName: string) => {
    if (!value || value === 'Not available') return null;
    const isCopied = copiedField === fieldName;
    return (
      <button
        type="button"
        className={`emp-profile-copy-btn ${isCopied ? 'emp-profile-copy-success' : ''}`}
        onClick={() => copyToClipboard(value, fieldName)}
        title={isCopied ? 'Copied' : 'Copy'}
      >
        {isCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    );
  };

  const formatJoiningDate = (dateValue: string) => {
    if (!dateValue || dateValue === 'Not available') return 'Not available';
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="app-container">
      <AppHeader title="My Profile" showBack />

      <main className="page-content">
        {/* Profile Summary Card */}
        <section className="emp-profile-summary-card">
          <div className="emp-profile-summary-top">
            <div className="emp-profile-avatar" style={{ background: profile.avatarBg }}>
              {profile.avatar}
            </div>

            <div className="emp-profile-main-info">
              <div className="emp-profile-name-row">
                <h2>{profile.name}</h2>
                <span className="emp-profile-active-badge">{profile.status}</span>
              </div>

              <p className="emp-profile-designation">
                {profile.designation} <span className="emp-profile-separator">•</span> {profile.department}
              </p>

              <p className="emp-profile-id-line">
                {profile.employeeId}
                {profile.joiningDate !== 'Not available' && (
                  <>
                    <span className="emp-profile-separator">•</span> Joined {formatJoiningDate(profile.joiningDate)}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="emp-profile-summary-details">
            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><Mail size={14} /> Email</span>
              <div className="emp-profile-summary-value-row">
                <span>{profile.email}</span>
                {renderCopyButton(profile.email, 'email')}
              </div>
            </div>

            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><Phone size={14} /> Phone</span>
              <div className="emp-profile-summary-value-row">
                <span>{profile.phone}</span>
                {renderCopyButton(profile.phone, 'phone')}
              </div>
            </div>

            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><Briefcase size={14} /> Department</span>
              <span className="emp-profile-summary-value">{profile.department}</span>
            </div>

            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><UserIcon size={14} /> Manager</span>
              <span className="emp-profile-summary-value">{profile.reportsTo}</span>
            </div>

            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><MapPin size={14} /> Branch</span>
              <span className="emp-profile-summary-value">{profile.branch}</span>
            </div>

            <div className="emp-profile-summary-item">
              <span className="emp-profile-summary-label"><Calendar size={14} /> Work Mode</span>
              <span className="emp-profile-summary-value">{profile.workMode}</span>
            </div>
          </div>

          <div className="emp-profile-hr-note">
            Some information can only be updated by HR. Contact HR for official changes.
          </div>
        </section>

        {/* Detailed Tabs Section */}
        <section className="emp-profile-details-section">
          <div className="emp-profile-tabs">
            <button
              type="button"
              className={`emp-profile-tab ${activeTab === 'personal' ? 'emp-profile-tab-active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <UserIcon size={16} /> <span>Personal Info</span>
            </button>
            <button
              type="button"
              className={`emp-profile-tab ${activeTab === 'job' ? 'emp-profile-tab-active' : ''}`}
              onClick={() => setActiveTab('job')}
            >
              <Briefcase size={16} /> <span>Job Details</span>
            </button>
            <button
              type="button"
              className={`emp-profile-tab ${activeTab === 'bank' ? 'emp-profile-tab-active' : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              <CreditCard size={16} /> <span>Bank & Statutory</span>
            </button>
          </div>

          {activeTab === 'personal' && (
            <div className="emp-profile-tab-content">
              <div className="emp-profile-detail-grid">
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Full Name</span>
                  <div className="emp-profile-detail-value">{profile.name}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Email Address</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.email}</span>
                    {renderCopyButton(profile.email, 'detail-email')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Phone Number</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.phone}</span>
                    {renderCopyButton(profile.phone, 'detail-phone')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Residential Address</span>
                  <div className="emp-profile-detail-value">{profile.address}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Emergency Contact Name</span>
                  <div className="emp-profile-detail-value">{profile.emergencyName}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Emergency Contact Phone</span>
                  <div className="emp-profile-detail-value">{profile.emergencyContact}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Relationship</span>
                  <div className="emp-profile-detail-value">{profile.emergencyRelation}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'job' && (
            <div className="emp-profile-tab-content">
              <div className="emp-profile-detail-grid">
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Employee ID</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.employeeId}</span>
                    {renderCopyButton(profile.employeeId, 'employee-id')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Designation</span>
                  <div className="emp-profile-detail-value">{profile.designation}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Department</span>
                  <div className="emp-profile-detail-value">{profile.department}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Reporting Manager</span>
                  <div className="emp-profile-detail-value">{profile.reportsTo}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Branch / Office Location</span>
                  <div className="emp-profile-detail-value">{profile.branch}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Work Mode</span>
                  <div className="emp-profile-detail-value">{profile.workMode}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Date of Joining</span>
                  <div className="emp-profile-detail-value">{formatJoiningDate(profile.joiningDate)}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Employment Status</span>
                  <div className="emp-profile-detail-value">{profile.status}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="emp-profile-tab-content">
              <div className="emp-profile-detail-grid">
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Bank Account Number</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.bankAccount}</span>
                    {renderCopyButton(profile.bankAccount, 'bank-account')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">Bank Name</span>
                  <div className="emp-profile-detail-value">{profile.bankName}</div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">IFSC Code</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.ifsc}</span>
                    {renderCopyButton(profile.ifsc, 'ifsc')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">PAN Number</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.pan}</span>
                    {renderCopyButton(profile.pan, 'pan')}
                  </div>
                </div>
                <div className="emp-profile-detail-item">
                  <span className="emp-profile-detail-label">PF UAN Number</span>
                  <div className="emp-profile-detail-value emp-profile-copy-value">
                    <span>{profile.pfUan}</span>
                    {renderCopyButton(profile.pfUan, 'pf-uan')}
                  </div>
                </div>
              </div>

              <div className="emp-profile-sensitive-note">
                Bank and statutory information is displayed based on the authenticated employee profile.
              </div>
            </div>
          )}
        </section>

        <button className="btn-secondary profile-logout-btn" onClick={logout}>
          <LogOut size={18} /> Sign Out
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
};
