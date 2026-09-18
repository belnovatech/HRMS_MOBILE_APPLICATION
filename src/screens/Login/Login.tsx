import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import { COMPANY_BRANDING } from '../../constants/branding';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('admin@hr.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'hr' | 'manager' | 'employee'>('hr');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(identifier, password);
      setLoading(false);

      if (res.success && res.role) {
        if (res.role === 'hr') {
          navigate('/hr/dashboard');
        } else if (res.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError(res.error || 'Invalid credentials. Please verify your details.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Login failed. Please check your credentials or network connection.');
    }
  };

  const handleSelectRole = (role: 'hr' | 'manager' | 'employee', idVal: string, passVal = 'password123') => {
    setActiveRole(role);
    setIdentifier(idVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="belnova-login-screen">
      {/* Background Subtle Gradient & Abstract Ambient Glow */}
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />
      <div className="login-bg-grid" />

      {/* Main Centered Login Card */}
      <div className="belnova-login-card">
        {/* Real Logo & Branding Header */}
        <div className="login-brand-header">
          <div className="login-logo-container">
            <img
              src={COMPANY_BRANDING.logoUrl}
              alt={COMPANY_BRANDING.appName}
              className="belnova-real-logo"
            />
          </div>
          <h1 className="login-main-title">BELNOVA HRMS</h1>
          <p className="login-sub-title">HR Management Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={17} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-main-form" noValidate>
          {/* Username / Email / Employee ID Field */}
          <div className="form-field-group">
            <label className="field-label" htmlFor="login-identifier">
              Username / Email / Employee ID
            </label>
            <div className="input-box-wrapper">
              <span className="input-prefix-icon">
                <User size={18} />
              </span>
              <input
                id="login-identifier"
                type="text"
                className="form-text-input"
                placeholder="e.g. admin@hr.com or EMP001"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-field-group">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-box-wrapper">
              <span className="input-prefix-icon">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-text-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="form-options-row">
            <label className="custom-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-visual">
                {rememberMe && <Check size={13} className="checkbox-check" />}
              </span>
              <span className="checkbox-text">Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Large Sign In CTA Button */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading-wrapper">
                <span className="btn-spinner" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="btn-label-wrapper">
                <LogIn size={18} />
                <span>Sign In</span>
              </div>
            )}
          </button>
        </form>

        {/* Demo Role Selection Chips */}
        <div className="demo-roles-container">
          <div className="demo-roles-header">
            <Sparkles size={14} className="sparkles-icon" />
            <span>Demo Quick Roles</span>
          </div>
          <div className="demo-chips-grid">
            <button
              type="button"
              className={`role-chip chip-hr ${activeRole === 'hr' ? 'active' : ''}`}
              onClick={() => handleSelectRole('hr', 'admin@hr.com')}
            >
              <span className="chip-indicator" />
              <span>HR Admin</span>
            </button>

            <button
              type="button"
              className={`role-chip chip-mgr ${activeRole === 'manager' ? 'active' : ''}`}
              onClick={() => handleSelectRole('manager', 'manager@belnova.com')}
            >
              <span className="chip-indicator" />
              <span>Manager</span>
            </button>

            <button
              type="button"
              className={`role-chip chip-emp ${activeRole === 'employee' ? 'active' : ''}`}
              onClick={() => handleSelectRole('employee', 'EMP001')}
            >
              <span className="chip-indicator" />
              <span>Employee</span>
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="login-card-footer">
          <ShieldCheck size={15} className="shield-icon" />
          <span>Enterprise Security · Single Sign-On Enabled</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="forgot-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="forgot-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title-wrap">
                <HelpCircle size={20} className="modal-icon" />
                <h3>Account Password Assistance</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content">
              <p>
                To maintain enterprise security, employee password resets are managed directly through your organization's HR Department and IT Helpdesk.
              </p>

              <div className="contact-info-card">
                <div className="info-line">
                  <span className="line-label">HR Helpdesk:</span>
                  <span className="line-value">hr-support@belnova.com</span>
                </div>
                <div className="info-line">
                  <span className="line-label">Internal Phone:</span>
                  <span className="line-value">Ext. 1044 / 1045</span>
                </div>
                <div className="info-line">
                  <span className="line-label">Toll-Free Helpline:</span>
                  <span className="line-value">1800-BELNOVA-HR</span>
                </div>
              </div>

              <div className="modal-note">
                💡 You can use the <strong>Demo Quick Roles</strong> chips below the form to sign in immediately as HR Admin, Manager, or Employee.
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
