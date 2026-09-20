import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { getEmployeeById, EmployeeRecord } from '../../data/employeeStore';
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiFileText,
  FiShield,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiCheckCircle,
} from 'react-icons/fi';
import './HREmployeeDetails.css';

import { useAuth } from '../../context/AuthContext';

type DetailTab = 'overview' | 'employment' | 'compensation' | 'documents';

export const HREmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamMembers = [] } = useAuth();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showAccount, setShowAccount] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const matchedFromStore = id ? getEmployeeById(id) : undefined;
  const matchedFromTeam = id ? teamMembers.find((m) => m.id?.toLowerCase() === id.toLowerCase() || (m.email && m.email.toLowerCase() === id.toLowerCase())) : undefined;

  const employee: EmployeeRecord | null = matchedFromStore ? {
    ...matchedFromStore,
    department: matchedFromStore.department || (matchedFromTeam as any)?.department || 'Engineering',
    role: matchedFromStore.role || matchedFromTeam?.designation || 'Staff',
    status: matchedFromStore.status || (matchedFromTeam?.status as any) || 'Active',
  } : (matchedFromTeam ? {
    id: matchedFromTeam.id,
    name: matchedFromTeam.name,
    firstName: matchedFromTeam.name.split(' ')[0],
    lastName: matchedFromTeam.name.split(' ').slice(1).join(' '),
    email: matchedFromTeam.email,
    phone: matchedFromTeam.phone || '—',
    department: (matchedFromTeam as any).department || 'Engineering',
    role: matchedFromTeam.designation || matchedFromTeam.role || 'Staff',
    status: (matchedFromTeam.status as any) || 'Active',
    joinDate: '2024-01-01',
    avatarBg: matchedFromTeam.color || '#2F6FED',
  } : null);

  const initials = employee ? employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() : 'EM';

  const statusClass = employee ? employee.status.toLowerCase().replace(/\s+/g, '-') : 'active';

  const handleDownloadDoc = (docName: string) => {
    setDownloadToast(`Downloaded ${docName}`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 2500);
  };

  const maskAccount = (acc: string) => {
    if (!acc) return '•••• •••• ••••';
    if (showAccount) return acc;
    const last4 = acc.slice(-4);
    return `•••• •••• ${last4}`;
  };

  if (!employee) {
    return (
      <div className="app-container hr-emp-details-container">
        <AppHeader title="Employee Profile" showBack />
        <main className="page-content" style={{ padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '16px' }}>Employee record not found in system.</p>
          <button
            type="button"
            className="hr-emp-back-nav-btn"
            style={{ margin: '0 auto', display: 'inline-flex' }}
            onClick={() => navigate('/hr/employees')}
          >
            <FiArrowLeft size={16} />
            <span>Back to Employees</span>
          </button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="app-container hr-emp-details-container">
      <AppHeader title="Employee Profile" showBack />

      {downloadToast && (
        <div className="hr-emp-download-toast">
          <FiCheckCircle size={16} />
          <span>{downloadToast}</span>
        </div>
      )}

      <main className="page-content hr-emp-details-scroll">
        {/* Navigation Action Row */}
        <div className="hr-emp-details-nav-row">
          <button
            type="button"
            className="hr-emp-back-nav-btn"
            onClick={() => navigate('/hr/employees')}
          >
            <FiArrowLeft size={16} />
            <span>Back to Employees</span>
          </button>

          <button
            type="button"
            className="hr-emp-edit-profile-btn"
            onClick={() => navigate(`/hr/employees/${employee.id}/edit`)}
          >
            <FiEdit2 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Header Hero Card */}
        <section className="hr-emp-profile-hero">
          <div className="hr-emp-hero-avatar" style={{ backgroundColor: employee.avatarBg || '#2F6FED' }}>
            {initials}
          </div>

          <div className="hr-emp-hero-info">
            <div className="hr-emp-hero-title-row">
              <h2 className="hr-emp-hero-name">{employee.name}</h2>
              <span className={`hr-emp-status-badge status-${statusClass}`}>
                {employee.status}
              </span>
            </div>

            <p className="hr-emp-hero-role">
              {employee.role} • <strong>{employee.department}</strong>
            </p>
            <span className="hr-emp-hero-id">ID: {employee.id}</span>
          </div>

          {/* Quick Contact Buttons Row */}
          <div className="hr-emp-quick-contact-grid">
            <a
              href={`mailto:${employee.email}`}
              className="hr-emp-contact-chip"
              title="Send Email"
            >
              <div className="hr-emp-chip-icon email">
                <FiMail size={15} />
              </div>
              <div className="hr-emp-chip-text">
                <span className="chip-label">Email</span>
                <span className="chip-val">{employee.email}</span>
              </div>
            </a>

            <a
              href={`tel:${employee.phone}`}
              className="hr-emp-contact-chip"
              title="Call Employee"
            >
              <div className="hr-emp-chip-icon phone">
                <FiPhone size={15} />
              </div>
              <div className="hr-emp-chip-text">
                <span className="chip-label">Phone</span>
                <span className="chip-val">+91 {employee.phone}</span>
              </div>
            </a>

            <div className="hr-emp-contact-chip">
              <div className="hr-emp-chip-icon location">
                <FiMapPin size={15} />
              </div>
              <div className="hr-emp-chip-text">
                <span className="chip-label">Location</span>
                <span className="chip-val">{employee.location || employee.workLocation || 'Bangalore HQ'}</span>
              </div>
            </div>

            <div className="hr-emp-contact-chip">
              <div className="hr-emp-chip-icon calendar">
                <FiCalendar size={15} />
              </div>
              <div className="hr-emp-chip-text">
                <span className="chip-label">Joined</span>
                <span className="chip-val">{employee.joinDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Content Card */}
        <section className="hr-emp-tabbed-card">
          {/* Segmented Tab Navigation */}
          <div className="hr-emp-tabs-scroll">
            <button
              type="button"
              className={`hr-emp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiUser size={15} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`hr-emp-tab-btn ${activeTab === 'employment' ? 'active' : ''}`}
              onClick={() => setActiveTab('employment')}
            >
              <FiBriefcase size={15} />
              <span>Employment</span>
            </button>

            <button
              type="button"
              className={`hr-emp-tab-btn ${activeTab === 'compensation' ? 'active' : ''}`}
              onClick={() => setActiveTab('compensation')}
            >
              <FiDollarSign size={15} />
              <span>Compensation</span>
            </button>

            <button
              type="button"
              className={`hr-emp-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FiFileText size={15} />
              <span>Documents</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="hr-emp-tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="hr-emp-details-grid">
                <div className="hr-emp-detail-item">
                  <span className="detail-label">Full Name</span>
                  <strong className="detail-value">{employee.name}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <strong className="detail-value">{employee.dob || '1994-08-12'}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Gender</span>
                  <strong className="detail-value">{employee.gender || 'Male'}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Work Email</span>
                  <strong className="detail-value">{employee.email}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Mobile Number</span>
                  <strong className="detail-value">+91 {employee.phone}</strong>
                </div>

                {employee.aadhaarNumber && (
                  <div className="hr-emp-detail-item">
                    <span className="detail-label">Aadhaar Number</span>
                    <strong className="detail-value">
                      •••• •••• {employee.aadhaarNumber.slice(-4)}
                    </strong>
                  </div>
                )}

                {employee.panNumber && (
                  <div className="hr-emp-detail-item">
                    <span className="detail-label">PAN Number</span>
                    <strong className="detail-value">{employee.panNumber}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="hr-emp-details-grid">
                <div className="hr-emp-detail-item">
                  <span className="detail-label">Employee ID</span>
                  <strong className="detail-value">{employee.id}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Department</span>
                  <strong className="detail-value">{employee.department}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Designation / Role</span>
                  <strong className="detail-value">{employee.role}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Employment Type</span>
                  <strong className="detail-value">{employee.employmentType || 'Full-Time'}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Joining Date</span>
                  <strong className="detail-value">{employee.joinDate}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Work Location</span>
                  <strong className="detail-value">{employee.location || employee.workLocation || 'Bangalore HQ'}</strong>
                </div>
              </div>
            )}

            {/* Compensation Tab */}
            {activeTab === 'compensation' && (
              <div className="hr-emp-details-grid">
                <div className="hr-emp-detail-item">
                  <span className="detail-label">Annual Base CTC</span>
                  <strong className="detail-value text-primary">
                    {employee.ctc || `₹${Number(employee.baseCtc || 1850000).toLocaleString('en-IN')} / year`}
                  </strong>
                </div>

                <div className="hr-emp-detail-item">
                  <span className="detail-label">Bank Name</span>
                  <strong className="detail-value">{employee.bank || employee.bankName || 'HDFC Bank'}</strong>
                </div>

                <div className="hr-emp-detail-item">
                  <div className="label-with-toggle">
                    <span className="detail-label">Bank Account Number</span>
                    <button
                      type="button"
                      className="hr-emp-toggle-mask-btn"
                      onClick={() => setShowAccount(!showAccount)}
                    >
                      {showAccount ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      <span>{showAccount ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <strong className="detail-value">
                    {maskAccount(employee.account || employee.accountNumber || '50100098765432')}
                  </strong>
                </div>

                {employee.ifscCode && (
                  <div className="hr-emp-detail-item">
                    <span className="detail-label">IFSC Code</span>
                    <strong className="detail-value">{employee.ifscCode}</strong>
                  </div>
                )}

                {employee.pfNumber && (
                  <div className="hr-emp-detail-item">
                    <span className="detail-label">PF Account Number</span>
                    <strong className="detail-value">{employee.pfNumber}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="hr-emp-docs-list">
                <div className="hr-emp-doc-card">
                  <div className="hr-emp-doc-icon-wrap">
                    <FiFileText size={20} />
                  </div>
                  <div className="hr-emp-doc-info">
                    <strong>Employment Agreement.pdf</strong>
                    <small>Signed on {employee.joinDate} • 2.4 MB</small>
                  </div>
                  <button
                    type="button"
                    className="hr-emp-doc-action-btn"
                    onClick={() => handleDownloadDoc('Employment Agreement.pdf')}
                    title="Download Document"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>

                <div className="hr-emp-doc-card">
                  <div className="hr-emp-doc-icon-wrap icon-shield">
                    <FiShield size={20} />
                  </div>
                  <div className="hr-emp-doc-info">
                    <strong>Identity Verification (Aadhaar/PAN).pdf</strong>
                    <small className="text-green">Verified Official Record • 1.1 MB</small>
                  </div>
                  <button
                    type="button"
                    className="hr-emp-doc-action-btn"
                    onClick={() => handleDownloadDoc('Identity Verification.pdf')}
                    title="Download Document"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HREmployeeDetails;
