import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { Download, Eye, X, FileText, Loader2, ExternalLink, Share2, CheckCircle2 } from 'lucide-react';
import { COMPANY_BRANDING } from '../../constants/branding';
import { downloadPayslip, openNativeFile, shareNativeFile, DownloadResult } from '../../services/downloadService';
import { validateAndNormalizePayslipData, formatINR } from '../../utils/pdfGenerator';
import { numberToIndianWords } from '../../utils/numberToWords';
import { DocumentDownloadModal } from '../../components/DocumentDownloadModal/DocumentDownloadModal';
import './EmployeePayslips.css';

export const EmployeePayslips: React.FC = () => {
  const { payslips = [], user } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [downloadModalState, setDownloadModalState] = useState<{
    isOpen: boolean;
    status: 'idle' | 'generating' | 'downloading' | 'complete' | 'failed';
    fileName: string;
    filePath?: string;
    mimeType?: string;
    errorMessage?: string;
    activeSlip?: any;
  }>({
    isOpen: false,
    status: 'idle',
    fileName: 'Payslip.pdf',
  });

  const [downloadingSlipId, setDownloadingSlipId] = useState<string | null>(null);

  const currentSlip = useMemo(() => {
    if (!payslips.length) return null;
    return payslips[0];
  }, [payslips]);

  const handleDownload = async (slip: any) => {
    if (!slip) return;
    const slipId = slip.id || slip.month || 'current';
    setDownloadingSlipId(slipId);

    const normData = validateAndNormalizePayslipData(slip, user);
    const safeName = `Payslip_${(normData.employeeName || 'Employee').replace(/\s+/g, '_')}_${(normData.month || 'Current_Month').replace(/\s+/g, '_')}.pdf`;

    setDownloadModalState({
      isOpen: true,
      status: 'generating',
      fileName: safeName,
      activeSlip: slip,
    });

    try {
      // Small tick for progress UX
      setTimeout(() => {
        setDownloadModalState((prev) => ({ ...prev, status: 'downloading' }));
      }, 400);

      const res: DownloadResult = await downloadPayslip(slip, user);

      if (res.success) {
        setDownloadModalState({
          isOpen: true,
          status: 'complete',
          fileName: res.fileName,
          filePath: res.filePath,
          mimeType: res.mimeType,
          activeSlip: slip,
        });
      } else {
        setDownloadModalState({
          isOpen: true,
          status: 'failed',
          fileName: safeName,
          errorMessage: res.error || 'Failed to download payslip.',
          activeSlip: slip,
        });
      }
    } catch (err: any) {
      setDownloadModalState({
        isOpen: true,
        status: 'failed',
        fileName: safeName,
        errorMessage: err?.message || 'Error occurred while generating payslip.',
        activeSlip: slip,
      });
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

  const selectedNormData = useMemo(() => {
    if (!selectedSlip) return null;
    return validateAndNormalizePayslipData(selectedSlip, user);
  }, [selectedSlip, user]);

  return (
    <div className="app-container">
      <AppHeader title="My Payslips" showBack />

      <main className="page-content emp-payslip-page">
        {/* Page Header */}
        <section className="emp-payslip-page-header">
          <h1>My Payslips</h1>
          <p>Official verified employee payroll statements and download vault</p>
        </section>

        {/* Current Month Card */}
        {currentSlip ? (
          <section className="emp-payslip-current-card">
            <div className="emp-payslip-current-top">
              <span className="emp-payslip-current-label">
                Current Month — {getMonthName(currentSlip.month)}
              </span>

              <div className="emp-payslip-company-mark">
                <img
                  src={COMPANY_BRANDING.logoUrl}
                  alt={COMPANY_BRANDING.companyName}
                  style={{ height: '26px', objectFit: 'contain' }}
                />
              </div>
            </div>

            <div className="emp-payslip-current-salary-grid">
              <div className="emp-payslip-current-item">
                <span>Gross Salary</span>
                <strong>{currentSlip.grossSalary || '₹0'}</strong>
              </div>

              <div className="emp-payslip-current-item">
                <span>Deductions</span>
                <strong>{currentSlip.deductions || '₹0'}</strong>
              </div>

              <div className="emp-payslip-current-item">
                <span>Net Salary</span>
                <strong>{currentSlip.netSalary || '₹0'}</strong>
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
                  Generating & Saving Payslip...
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
                              title="Preview Payslip"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              className="emp-payslip-pdf-button"
                              disabled={isDownloading}
                              onClick={() => handleDownload(slip)}
                              title="Download PDF"
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

      {/* Payslip View Modal with Reference Structure */}
      {selectedSlip && selectedNormData && (
        <div
          className="emp-payslip-modal-overlay"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="emp-payslip-modal"
            style={{ maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="emp-payslip-modal-header" style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={COMPANY_BRANDING.logoUrl} alt="BELNOVA" style={{ height: '24px', objectFit: 'contain' }} />
                <div>
                  <span className="emp-payslip-modal-kicker">{COMPANY_BRANDING.companyName}</span>
                  <h2 style={{ fontSize: '15px', margin: 0 }}>Payslip for {selectedNormData.month}</h2>
                </div>
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

            <div className="emp-payslip-modal-body" style={{ padding: '14px 4px 6px' }}>
              {/* Employee Summary Grid */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  EMPLOYEE SUMMARY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Name: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedNormData.employeeName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Designation: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedNormData.designation}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Emp ID: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedNormData.employeeId}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Pay Period: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedNormData.payPeriod}</strong>
                  </div>
                </div>

                {/* Net Pay Card inside modal */}
                <div style={{ marginTop: '10px', background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{formatINR(Number(selectedNormData.netSalary))}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Total Net Pay</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px' }}>
                    <div><span style={{ color: '#64748b' }}>Paid Days:</span> <strong>{selectedNormData.paidDays}</strong></div>
                    <div><span style={{ color: '#64748b' }}>LOP Days:</span> <strong>{selectedNormData.lopDays}</strong></div>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Table Preview */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', padding: '6px 10px', fontSize: '10px', fontWeight: 700, borderBottom: '1px solid #cbd5e1' }}>
                  <div>EARNINGS</div>
                  <div style={{ textAlign: 'right' }}>DEDUCTIONS</div>
                </div>
                <div style={{ padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Pay: ₹{formatINR(Number(selectedNormData.basic))}</span>
                    <span style={{ color: '#dc2626' }}>EPF: ₹{formatINR(Number(selectedNormData.epf))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>HRA: ₹{formatINR(Number(selectedNormData.hra))}</span>
                    <span style={{ color: '#dc2626' }}>PT: ₹{formatINR(Number(selectedNormData.professionalTax))}</span>
                  </div>
                  {selectedNormData.lta ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>LTA: ₹{formatINR(Number(selectedNormData.lta))}</span>
                    </div>
                  ) : null}
                  {selectedNormData.fixedAllowance ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fixed Allowance: ₹{formatINR(Number(selectedNormData.fixedAllowance))}</span>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f8fafc', padding: '6px 10px', fontSize: '11px', fontWeight: 700, borderTop: '1px solid #cbd5e1' }}>
                  <div>Gross: ₹{formatINR(Number(selectedNormData.grossSalary))}</div>
                  <div style={{ textAlign: 'right', color: '#dc2626' }}>Total Ded: ₹{formatINR(Number(selectedNormData.deductions))}</div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div style={{ background: '#f0f9ff', border: '1px solid #0f172a', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <strong style={{ fontSize: '11px', color: '#0f172a' }}>TOTAL NET PAYABLE</strong>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Gross Earnings - Total Deductions</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{formatINR(Number(selectedNormData.netSalary))}
                </div>
              </div>

              {/* Amount In Words */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', marginBottom: '14px' }}>
                Amount In Words: <strong style={{ color: '#1e293b' }}>{numberToIndianWords(Number(selectedNormData.netSalary))}</strong>
              </div>

              {/* Modal Download Button */}
              <button
                type="button"
                className="emp-payslip-modal-download"
                disabled={downloadingSlipId === (selectedSlip.id || selectedSlip.month || 'modal')}
                onClick={() => {
                  const slipToDl = selectedSlip;
                  setSelectedSlip(null);
                  handleDownload(slipToDl);
                }}
              >
                <Download size={14} /> Download Official Payslip PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Download Complete / Progress Modal */}
      <DocumentDownloadModal
        isOpen={downloadModalState.isOpen}
        onClose={() => setDownloadModalState((prev) => ({ ...prev, isOpen: false }))}
        title="Payslip Download"
        fileName={downloadModalState.fileName}
        filePath={downloadModalState.filePath}
        mimeType={downloadModalState.mimeType}
        status={downloadModalState.status}
        errorMessage={downloadModalState.errorMessage}
        onRetry={() => {
          if (downloadModalState.activeSlip) {
            handleDownload(downloadModalState.activeSlip);
          }
        }}
      />

      <BottomNavigation />
    </div>
  );
};

export default EmployeePayslips;
