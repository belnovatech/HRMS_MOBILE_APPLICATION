import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { Download, Eye, X, FileText, Loader2 } from 'lucide-react';
import './EmployeePayslips.css';
import { downloadPayslip } from '../../services/downloadService';

export const EmployeePayslips: React.FC = () => {
  const { payslips = [], user } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [downloadingSlipId, setDownloadingSlipId] = useState<string | null>(null);

  const currentSlip = useMemo(() => {
    if (!payslips.length) return null;
    return payslips[0];
  }, [payslips]);

  const handleDownload = async (slip: any) => {
    if (!slip) return;
    const slipId = slip.id || slip.month || 'current';
    setDownloadingSlipId(slipId);

    try {
      await downloadPayslip(slip, user);
    } finally {
      setDownloadingSlipId(null);
    }
  };

  const getMonthName = (monthValue?: string) => {
    if (!monthValue) return 'Current Month';
    const value = String(monthValue);
    if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-').map(Number);
      return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    return value;
  };

  return (
    <div className="app-container">
      <AppHeader title="My Payslips" showBack />

      <main className="page-content emp-payslip-page">
        {/* Page Header */}
        <section className="emp-payslip-page-header">
          <h1>My Payslips</h1>
          <p>View and download your monthly payslips</p>
        </section>

        {/* Current Month Card */}
        {currentSlip ? (
          <section className="emp-payslip-current-card">
            <div className="emp-payslip-current-top">
              <span className="emp-payslip-current-label">
                Current Month — {getMonthName(currentSlip.month)}
              </span>

              <div className="emp-payslip-company-mark">
                <div className="emp-payslip-company-icon">B</div>
                <div className="emp-payslip-company-name">
                  <strong>BELNOVA</strong>
                  <span>HRMS</span>
                </div>
              </div>
            </div>

            <div className="emp-payslip-current-salary-grid">
              <div className="emp-payslip-current-item">
                <span>Gross Salary</span>
                <strong>{currentSlip.grossSalary}</strong>
              </div>

              <div className="emp-payslip-current-item">
                <span>Deductions</span>
                <strong>{currentSlip.deductions}</strong>
              </div>

              <div className="emp-payslip-current-item">
                <span>Net Salary</span>
                <strong>{currentSlip.netSalary}</strong>
              </div>
            </div>

            <button
              type="button"
              className="emp-payslip-current-download"
              disabled={downloadingSlipId === (currentSlip.id || currentSlip.month || 'current')}
              onClick={() => handleDownload(currentSlip)}
            >
              {downloadingSlipId === (currentSlip.id || currentSlip.month || 'current') ? (
                <>
                  <Loader2 size={13} className="spin-icon" />
                  Downloading Payslip...
                </>
              ) : (
                <>
                  <Download size={13} />
                  Download {getMonthName(currentSlip.month)} Payslip PDF
                </>
              )}
            </button>
          </section>
        ) : (
          <section className="emp-payslip-current-card emp-payslip-no-current">
            <FileText size={28} />
            <div>
              <strong>No payslip available</strong>
              <span>Your latest payslip will appear here once it is available.</span>
            </div>
          </section>
        )}

        {/* Payslip History */}
        <section className="emp-payslip-history-card">
          <div className="emp-payslip-history-header">
            <h2>Payslip History</h2>
          </div>

          <div className="emp-payslip-table-scroll">
            <table className="emp-payslip-table">
              <thead>
                <tr>
                  <th>MONTH</th>
                  <th>GROSS</th>
                  <th>DEDUCTIONS</th>
                  <th>NET SALARY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {payslips.length > 0 ? (
                  payslips.map((slip: any, index: number) => {
                    const slipKey = slip.id || `${slip.month}-${index}`;
                    const isDownloading = downloadingSlipId === slipKey;

                    return (
                      <tr key={slipKey}>
                        <td>
                          <strong>{slip.month}</strong>
                        </td>
                        <td className="emp-payslip-gross">{slip.grossSalary}</td>
                        <td className="emp-payslip-deduction">{slip.deductions}</td>
                        <td className="emp-payslip-net">{slip.netSalary}</td>
                        <td>
                          <span
                            className={`emp-payslip-status emp-payslip-status-${String(
                              slip.status || 'Processed'
                            )
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {slip.status || 'Processed'}
                          </span>
                        </td>
                        <td>
                          <div className="emp-payslip-actions">
                            <button
                              type="button"
                              className="emp-payslip-view-button"
                              onClick={() => setSelectedSlip(slip)}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              className="emp-payslip-pdf-button"
                              disabled={isDownloading}
                              onClick={() => handleDownload(slip)}
                            >
                              {isDownloading ? (
                                <Loader2 size={12} className="spin-icon" />
                              ) : (
                                <Download size={12} />
                              )}
                              <span>{isDownloading ? 'Saving...' : 'PDF'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="emp-payslip-empty">
                      No payslip records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Payslip View Modal */}
      {selectedSlip && (
        <div
          className="emp-payslip-modal-overlay"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="emp-payslip-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="emp-payslip-modal-header">
              <div>
                <span className="emp-payslip-modal-kicker">PAYROLL STATEMENT</span>
                <h2>Payslip Details</h2>
              </div>
              <button
                type="button"
                className="emp-payslip-modal-close"
                onClick={() => setSelectedSlip(null)}
                aria-label="Close payslip"
              >
                <X size={16} />
              </button>
            </div>

            <div className="emp-payslip-modal-body">
              <div className="emp-payslip-employee-info">
                <span>Employee</span>
                <strong>{user?.name || 'Harish Yadav Pilli'}</strong>
                <small>
                  {user?.employeeId || user?.id || 'BLN001'} •{' '}
                  {user?.designation || 'Associate Software Engineer'}
                </small>
              </div>

              <div className="emp-payslip-breakdown">
                <div className="emp-payslip-breakdown-row">
                  <span>Gross Earnings</span>
                  <strong className="emp-payslip-modal-green">
                    {selectedSlip.grossSalary}
                  </strong>
                </div>

                <div className="emp-payslip-breakdown-row">
                  <span>Total Deductions</span>
                  <strong className="emp-payslip-modal-red">
                    - {selectedSlip.deductions}
                  </strong>
                </div>

                <div className="emp-payslip-breakdown-divider" />

                <div className="emp-payslip-breakdown-row emp-payslip-breakdown-total">
                  <span>Net Salary Paid</span>
                  <strong>{selectedSlip.netSalary}</strong>
                </div>
              </div>

              <button
                type="button"
                className="emp-payslip-modal-download"
                disabled={downloadingSlipId === (selectedSlip.id || selectedSlip.month || 'modal')}
                onClick={() => handleDownload(selectedSlip)}
              >
                {downloadingSlipId === (selectedSlip.id || selectedSlip.month || 'modal') ? (
                  <>
                    <Loader2 size={14} className="spin-icon" />
                    Downloading Official PDF...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download Official Payslip PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default EmployeePayslips;
