import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  getEmployeeById,
  saveEmployee,
  isValidName,
  isValidPhone,
  isValidEmail,
  isValidAadhaar,
  isValidPAN,
} from '../../data/employeeStore';
import {
  FiArrowLeft,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';
import './HREditEmployee.css';

export const HREditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existing = getEmployeeById(id || 'EMP-1001');

  const [formData, setFormData] = useState({
    firstName: existing?.firstName || existing?.name.split(' ')[0] || 'Arjun',
    lastName: existing?.lastName || existing?.name.split(' ')[1] || 'Mehta',
    email: existing?.email || 'arjun.m@belnova.com',
    phone: existing?.phone || '9876543210',
    dob: existing?.dob || '1994-08-12',
    gender: (existing?.gender || 'Male') as 'Male' | 'Female' | 'Other',
    department: existing?.department || 'Engineering',
    role: existing?.role || 'Sr. Frontend Dev',
    employeeId: existing?.id || id || 'EMP-1001',
    joinDate: existing?.joinDate || '2023-04-15',
    workLocation: existing?.workLocation || existing?.location || 'Bangalore HQ',
    baseCtc: existing?.baseCtc || '1850000',
    bankName: existing?.bankName || existing?.bank || 'HDFC Bank',
    accountNumber: existing?.accountNumber || existing?.account || '50100098765432',
    aadhaarNumber: existing?.aadhaarNumber || '789012345678',
    panNumber: existing?.panNumber || 'ABCDE1234F',
  });

  useEffect(() => {
    if (id) {
      const emp = getEmployeeById(id);
      if (emp) {
        setFormData({
          firstName: emp.firstName || emp.name.split(' ')[0] || '',
          lastName: emp.lastName || emp.name.split(' ')[1] || '',
          email: emp.email || '',
          phone: emp.phone || '',
          dob: emp.dob || '1994-08-12',
          gender: (emp.gender || 'Male') as 'Male' | 'Female' | 'Other',
          department: emp.department || 'Engineering',
          role: emp.role || '',
          employeeId: emp.id,
          joinDate: emp.joinDate || '',
          workLocation: emp.workLocation || emp.location || 'Bangalore HQ',
          baseCtc: emp.baseCtc || '1850000',
          bankName: emp.bankName || emp.bank || 'HDFC Bank',
          accountNumber: emp.accountNumber || emp.account || '',
          aadhaarNumber: emp.aadhaarNumber || '',
          panNumber: emp.panNumber || '',
        });
      }
    }
  }, [id]);

  const steps = [
    { number: 1, label: 'Personal Info', icon: <FiUser size={15} /> },
    { number: 2, label: 'Employment', icon: <FiBriefcase size={15} /> },
    { number: 3, label: 'Salary', icon: <FiDollarSign size={15} /> },
    { number: 4, label: 'Review & Save', icon: <FiCheckCircle size={15} /> },
  ];

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim() || !isValidName(formData.firstName)) {
        errs.firstName = 'Enter a valid first name (letters only, min 2 chars)';
      }
      if (!formData.lastName.trim() || !isValidName(formData.lastName)) {
        errs.lastName = 'Enter a valid last name (letters only, min 2 chars)';
      }
      if (!formData.email.trim() || !isValidEmail(formData.email)) {
        errs.email = 'Enter a valid email address';
      }
      if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        errs.phone = 'Enter a valid 10-digit mobile number';
      }
      if (formData.aadhaarNumber && !isValidAadhaar(formData.aadhaarNumber)) {
        errs.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
      }
      if (formData.panNumber && !isValidPAN(formData.panNumber)) {
        errs.panNumber = 'Enter a valid 10-character PAN';
      }
    } else if (step === 2) {
      if (!formData.role.trim()) {
        errs.role = 'Role / Designation is required';
      }
    } else if (step === 3) {
      if (!formData.baseCtc || Number(formData.baseCtc) <= 0) {
        errs.baseCtc = 'Enter a valid base CTC amount';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/hr/employees/${formData.employeeId}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const updatedRecord = {
      id: formData.employeeId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      name: fullName,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      role: formData.role.trim(),
      status: existing?.status || 'Active',
      joinDate: formData.joinDate,
      ctc: `₹${Number(formData.baseCtc).toLocaleString('en-IN')} / year`,
      baseCtc: formData.baseCtc,
      location: formData.workLocation,
      workLocation: formData.workLocation,
      dob: formData.dob,
      gender: formData.gender,
      bank: formData.bankName,
      bankName: formData.bankName,
      account: formData.accountNumber,
      accountNumber: formData.accountNumber,
      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
    };

    saveEmployee(updatedRecord);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);

      setTimeout(() => {
        navigate(`/hr/employees/${formData.employeeId}`);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="app-container hr-emp-edit-container">
      <AppHeader title="Edit Employee Profile" showBack />

      {showToast && (
        <div className="hr-emp-toast-success">
          <FiCheckCircle size={18} />
          <span>Employee details updated successfully! Redirecting...</span>
        </div>
      )}

      <main className="page-content hr-emp-edit-scroll">
        {/* Header Card */}
        <section className="hr-emp-edit-header-card">
          <div className="hr-emp-edit-nav-row">
            <button
              type="button"
              className="hr-emp-back-text-btn"
              onClick={() => navigate(`/hr/employees/${formData.employeeId}`)}
            >
              <FiArrowLeft size={16} />
              <span>Back to Profile</span>
            </button>
            <span className="hr-emp-edit-id-badge">{formData.employeeId}</span>
          </div>

          <h2 className="hr-emp-edit-title">
            Edit Profile: {formData.firstName} {formData.lastName}
          </h2>
          <p className="hr-emp-edit-desc">
            Modify employee records and save to update the organization directory.
          </p>
        </section>

        {/* Stepper Progress */}
        <div className="hr-emp-mobile-stepper">
          <div className="hr-emp-stepper-progress-bar">
            <div
              className="hr-emp-stepper-progress-fill"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          <div className="hr-emp-stepper-label-row">
            <span className="hr-emp-step-count-text">
              Step <strong>{currentStep}</strong> of 4
            </span>
            <span className="hr-emp-step-curr-label">{steps[currentStep - 1].label}</span>
          </div>

          <div className="hr-emp-stepper-pills">
            {steps.map((s) => (
              <button
                key={s.number}
                type="button"
                className={`hr-emp-step-pill ${
                  currentStep === s.number
                    ? 'active'
                    : currentStep > s.number
                    ? 'completed'
                    : ''
                }`}
                onClick={() => {
                  if (s.number < currentStep) setCurrentStep(s.number);
                }}
              >
                {currentStep > s.number ? <FiCheckCircle size={13} /> : s.number}
              </button>
            ))}
          </div>
        </div>

        {/* Form Form Card */}
        <form onSubmit={handleSubmit} className="hr-emp-form-card">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiUser className="hr-emp-step-icon" size={18} />
                <h3>Personal Information</h3>
              </div>

              <div className="hr-emp-form-fields">
                <div className="hr-emp-field-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className={`hr-emp-input ${errors.firstName ? 'input-error' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: '' });
                    }}
                  />
                  {errors.firstName && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.firstName}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className={`hr-emp-input ${errors.lastName ? 'input-error' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: '' });
                    }}
                  />
                  {errors.lastName && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.lastName}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Work Email Address *</label>
                  <input
                    type="email"
                    className={`hr-emp-input ${errors.email ? 'input-error' : ''}`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                  />
                  {errors.email && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Phone Number (10 Digits) *</label>
                  <div className="hr-emp-phone-input-wrap">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`hr-emp-input phone-field ${errors.phone ? 'input-error' : ''}`}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: val });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                    />
                  </div>
                  {errors.phone && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.phone}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="hr-emp-input"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div className="hr-emp-field-group">
                  <label>Gender</label>
                  <select
                    className="hr-emp-select"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as 'Male' | 'Female' | 'Other',
                      })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="hr-emp-field-group">
                  <label>Aadhaar Number (Optional - 12 Digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    className={`hr-emp-input ${errors.aadhaarNumber ? 'input-error' : ''}`}
                    placeholder="123456789012"
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, aadhaarNumber: val });
                      if (errors.aadhaarNumber) setErrors({ ...errors, aadhaarNumber: '' });
                    }}
                  />
                  {errors.aadhaarNumber && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.aadhaarNumber}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>PAN Number (Optional - 10 Characters)</label>
                  <input
                    type="text"
                    maxLength={10}
                    className={`hr-emp-input ${errors.panNumber ? 'input-error' : ''}`}
                    placeholder="ABCDE1234F"
                    value={formData.panNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData({ ...formData, panNumber: val });
                      if (errors.panNumber) setErrors({ ...errors, panNumber: '' });
                    }}
                  />
                  {errors.panNumber && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.panNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {currentStep === 2 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiBriefcase className="hr-emp-step-icon" size={18} />
                <h3>Employment Details</h3>
              </div>

              <div className="hr-emp-form-fields">
                <div className="hr-emp-field-group">
                  <label>Department *</label>
                  <select
                    className="hr-emp-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="HR & Operations">HR & Operations</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & Legal">Finance & Legal</option>
                  </select>
                </div>

                <div className="hr-emp-field-group">
                  <label>Designation / Role *</label>
                  <input
                    type="text"
                    className={`hr-emp-input ${errors.role ? 'input-error' : ''}`}
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (errors.role) setErrors({ ...errors, role: '' });
                    }}
                  />
                  {errors.role && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.role}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Employee ID (Read Only)</label>
                  <input
                    type="text"
                    readOnly
                    className="hr-emp-input input-readonly"
                    value={formData.employeeId}
                  />
                </div>

                <div className="hr-emp-field-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    className="hr-emp-input"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>

                <div className="hr-emp-field-group">
                  <label>Work Location</label>
                  <select
                    className="hr-emp-select"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  >
                    <option value="Bangalore HQ">Bangalore HQ</option>
                    <option value="Mumbai Office">Mumbai Office</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Salary */}
          {currentStep === 3 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiDollarSign className="hr-emp-step-icon" size={18} />
                <h3>Compensation & Banking</h3>
              </div>

              <div className="hr-emp-form-fields">
                <div className="hr-emp-field-group">
                  <label>Annual Base CTC (₹) *</label>
                  <input
                    type="number"
                    className={`hr-emp-input ${errors.baseCtc ? 'input-error' : ''}`}
                    value={formData.baseCtc}
                    onChange={(e) => {
                      setFormData({ ...formData, baseCtc: e.target.value });
                      if (errors.baseCtc) setErrors({ ...errors, baseCtc: '' });
                    }}
                  />
                  {errors.baseCtc && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.baseCtc}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>Bank Name</label>
                  <select
                    className="hr-emp-select"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>

                <div className="hr-emp-field-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    className="hr-emp-input"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiCheckCircle className="hr-emp-step-icon text-green" size={18} />
                <h3>Review & Save Changes</h3>
              </div>

              <div className="hr-emp-review-cards">
                <div className="hr-emp-review-card">
                  <div className="review-card-head">
                    <h4>Summary of Modifications</h4>
                    <button type="button" onClick={() => setCurrentStep(1)}>Edit</button>
                  </div>
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> +91 {formData.phone}</p>
                  <p><strong>Department:</strong> {formData.department} ({formData.role})</p>
                  <p><strong>Base CTC:</strong> ₹{Number(formData.baseCtc).toLocaleString('en-IN')} / year</p>
                  <p><strong>Bank:</strong> {formData.bankName} (Acct: {formData.accountNumber})</p>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Mobile Action Bar */}
          <div className="hr-emp-form-action-bar">
            <button
              type="button"
              className="hr-emp-btn-cancel-nav"
              onClick={handlePrev}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="hr-emp-action-right-wrap">
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="hr-emp-btn-continue"
                  onClick={handleNext}
                >
                  <span>Continue</span>
                  <FiChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hr-emp-btn-submit"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HREditEmployee;
