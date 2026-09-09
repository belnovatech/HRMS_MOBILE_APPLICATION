import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
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
  FiFileText,
  FiCheckCircle,
  FiUploadCloud,
  FiSave,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';
import './HRAddEmployee.css';

export const HRAddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatedId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '1995-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    department: 'Engineering',
    role: '',
    employeeId: generatedId,
    joinDate: new Date().toISOString().split('T')[0],
    workLocation: 'Bangalore HQ',
    employmentType: 'Full-Time',
    baseCtc: '',
    pfNumber: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: 'HDFC0000123',
    aadhaarNumber: '',
    panNumber: '',
    photoName: '',
  });

  const steps = [
    { number: 1, label: 'Personal Info', icon: <FiUser size={15} /> },
    { number: 2, label: 'Employment', icon: <FiBriefcase size={15} /> },
    { number: 3, label: 'Compensation', icon: <FiDollarSign size={15} /> },
    { number: 4, label: 'Documents', icon: <FiFileText size={15} /> },
    { number: 5, label: 'Review', icon: <FiCheckCircle size={15} /> },
  ];

  // Validation function per step
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
        errs.email = 'Enter a valid work email address (e.g. name@belnova.com)';
      }
      // Strict 10 digit mobile phone validation
      if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        errs.phone = 'Enter a valid 10-digit mobile number (e.g. 9876543210)';
      }
      if (formData.aadhaarNumber && !isValidAadhaar(formData.aadhaarNumber)) {
        errs.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
      }
      if (formData.panNumber && !isValidPAN(formData.panNumber)) {
        errs.panNumber = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
      }
    } else if (step === 2) {
      if (!formData.role.trim()) {
        errs.role = 'Designation / Role is required';
      }
      if (!formData.department) {
        errs.department = 'Department is required';
      }
    } else if (step === 3) {
      if (!formData.baseCtc || Number(formData.baseCtc) <= 0) {
        errs.baseCtc = 'Enter a valid annual base CTC amount';
      }
      if (formData.accountNumber && formData.accountNumber.length < 8) {
        errs.accountNumber = 'Enter a valid bank account number (min 8 digits)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/hr/employees');
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
    const newRecord = {
      id: formData.employeeId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      name: fullName,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      role: formData.role.trim() || 'Software Engineer',
      status: 'Active' as const,
      joinDate: formData.joinDate,
      ctc: `₹${Number(formData.baseCtc || 1450000).toLocaleString('en-IN')} / year`,
      baseCtc: formData.baseCtc || '1450000',
      location: formData.workLocation,
      workLocation: formData.workLocation,
      dob: formData.dob,
      gender: formData.gender,
      bank: formData.bankName,
      bankName: formData.bankName,
      account: formData.accountNumber || '50100098765432',
      accountNumber: formData.accountNumber || '50100098765432',
      ifscCode: formData.ifscCode,
      pfNumber: formData.pfNumber,
      employmentType: formData.employmentType,
      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
      photoName: formData.photoName,
      avatarBg: '#2F6FED',
    };

    saveEmployee(newRecord);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);

      setTimeout(() => {
        navigate(`/hr/employees/${formData.employeeId}`);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="app-container hr-emp-add-container">
      <AppHeader title="Add New Employee" showBack />

      {showToast && (
        <div className="hr-emp-toast-success">
          <FiCheckCircle size={18} />
          <span>Employee added successfully! Redirecting...</span>
        </div>
      )}

      <main className="page-content hr-emp-add-scroll">
        {/* Header Banner */}
        <section className="hr-emp-add-header-card">
          <div className="hr-emp-add-nav-row">
            <button
              type="button"
              className="hr-emp-back-text-btn"
              onClick={() => navigate('/hr/employees')}
            >
              <FiArrowLeft size={16} />
              <span>Back to Directory</span>
            </button>
            <span className="hr-emp-draft-badge">Draft</span>
          </div>

          <h2 className="hr-emp-add-title">Add New Employee</h2>
          <p className="hr-emp-add-desc">
            Complete the 5-step onboarding profile for the new workforce member.
          </p>
        </section>

        {/* Mobile Stepper Indicator */}
        <div className="hr-emp-mobile-stepper">
          <div className="hr-emp-stepper-progress-bar">
            <div
              className="hr-emp-stepper-progress-fill"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          <div className="hr-emp-stepper-label-row">
            <span className="hr-emp-step-count-text">
              Step <strong>{currentStep}</strong> of 5
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

        {/* Form Container Card */}
        <form onSubmit={handleSubmit} className="hr-emp-form-card">
          {/* STEP 1: Personal Info */}
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
                    placeholder="e.g. Ramesh"
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
                    placeholder="e.g. Kumar"
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
                    placeholder="ramesh.k@belnova.com"
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
                      placeholder="9876543210"
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

          {/* STEP 2: Employment */}
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
                    placeholder="e.g. Senior Software Engineer"
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
                  <label>Employee ID (Generated)</label>
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

                <div className="hr-emp-field-group">
                  <label>Employment Type</label>
                  <select
                    className="hr-emp-select"
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Salary */}
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
                    placeholder="e.g. 1450000"
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
                  <label>PF Account Number</label>
                  <input
                    type="text"
                    className="hr-emp-input"
                    placeholder="MH/BAN/0012345/000/0000123"
                    value={formData.pfNumber}
                    onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                  />
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
                    className={`hr-emp-input ${errors.accountNumber ? 'input-error' : ''}`}
                    placeholder="50100012345678"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, accountNumber: e.target.value });
                      if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' });
                    }}
                  />
                  {errors.accountNumber && (
                    <span className="hr-emp-error-text">
                      <FiAlertCircle size={12} /> {errors.accountNumber}
                    </span>
                  )}
                </div>

                <div className="hr-emp-field-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    className="hr-emp-input"
                    placeholder="HDFC0000123"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Documents */}
          {currentStep === 4 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiFileText className="hr-emp-step-icon" size={18} />
                <h3>Documents & Photo</h3>
              </div>

              <div className="hr-emp-upload-zone">
                <FiUploadCloud className="hr-emp-upload-icon" size={32} />
                <h4>Upload Profile Photo & Verification Documents</h4>
                <p>Attach employee photo, resume, or identity verification file.</p>
                <input
                  type="file"
                  id="hr-doc-file"
                  className="hr-emp-file-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, photoName: e.target.files[0].name });
                    }
                  }}
                />
                <label htmlFor="hr-doc-file" className="hr-emp-file-btn">
                  Choose File
                </label>

                {formData.photoName && (
                  <div className="hr-emp-attached-pill">
                    <FiCheckCircle size={14} color="#10B981" />
                    <span>Attached: {formData.photoName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 5 && (
            <div className="hr-emp-step-section">
              <div className="hr-emp-step-title-row">
                <FiCheckCircle className="hr-emp-step-icon text-green" size={18} />
                <h3>Review & Confirm</h3>
              </div>
              <p className="hr-emp-review-sub">Please review the employee details before creating the profile.</p>

              <div className="hr-emp-review-cards">
                {/* Personal Info Card */}
                <div className="hr-emp-review-card">
                  <div className="review-card-head">
                    <h4>Personal Information</h4>
                    <button type="button" onClick={() => setCurrentStep(1)}>Edit</button>
                  </div>
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> +91 {formData.phone}</p>
                  <p><strong>Gender / DOB:</strong> {formData.gender} • {formData.dob}</p>
                </div>

                {/* Employment Details Card */}
                <div className="hr-emp-review-card">
                  <div className="review-card-head">
                    <h4>Employment Details</h4>
                    <button type="button" onClick={() => setCurrentStep(2)}>Edit</button>
                  </div>
                  <p><strong>ID:</strong> {formData.employeeId}</p>
                  <p><strong>Department:</strong> {formData.department}</p>
                  <p><strong>Designation:</strong> {formData.role || 'Developer'}</p>
                  <p><strong>Location:</strong> {formData.workLocation} ({formData.employmentType})</p>
                </div>

                {/* Compensation Card */}
                <div className="hr-emp-review-card">
                  <div className="review-card-head">
                    <h4>Compensation & Banking</h4>
                    <button type="button" onClick={() => setCurrentStep(3)}>Edit</button>
                  </div>
                  <p><strong>Base CTC:</strong> ₹{Number(formData.baseCtc || 1450000).toLocaleString('en-IN')} / year</p>
                  <p><strong>Bank:</strong> {formData.bankName}</p>
                  <p><strong>Account:</strong> {formData.accountNumber ? `•••• ${formData.accountNumber.slice(-4)}` : 'Not provided'}</p>
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
              <button
                type="button"
                className="hr-emp-btn-draft-save"
                onClick={() => navigate('/hr/employees')}
              >
                <FiSave size={14} />
                <span>Save Draft</span>
              </button>

              {currentStep < 5 ? (
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
                  {isSubmitting ? 'Saving Profile...' : 'Add Employee'}
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

export default HRAddEmployee;
