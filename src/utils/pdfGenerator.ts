import { jsPDF } from 'jspdf';

export const downloadPayslipPdf = (slip: any, user: any) => {
  const doc = new jsPDF();

  const userName = user?.name || 'Rahul Kumar';
  const empId = user?.employeeId || user?.id || 'EMP001';
  const designation = user?.designation || 'Software Engineer';
  const department = user?.department || 'Engineering';
  const month = slip?.month || 'August 2026';

  // Company Header
  doc.setFillColor(47, 115, 244);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BELNOVA HRMS', 14, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL PAYSLIP STATEMENT', 14, 32);

  doc.text(`Period: ${month}`, 145, 32);

  // Employee Information
  doc.setTextColor(30, 40, 60);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 14, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${userName}`, 14, 65);
  doc.text(`Employee ID: ${empId}`, 14, 72);
  doc.text(`Designation: ${designation}`, 120, 65);
  doc.text(`Department: ${department}`, 120, 72);

  // Divider
  doc.setDrawColor(220, 225, 235);
  doc.line(14, 80, 196, 80);

  // Salary Breakdown Table Header
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 88, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS & DEDUCTIONS', 18, 95);
  doc.text('AMOUNT', 160, 95);

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.text('Gross Salary / Earnings', 18, 110);
  doc.text(String(slip?.grossSalary || '₹60,000'), 160, 110);

  doc.text('Total Deductions (PF / Tax)', 18, 122);
  doc.text(`- ${String(slip?.deductions || '₹11,500')}`, 160, 122);

  // Divider
  doc.line(14, 130, 196, 130);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('Net Salary Paid', 18, 142);
  doc.text(String(slip?.netSalary || '₹48,500'), 160, 142);

  // Footer Note
  doc.setFontSize(9);
  doc.setTextColor(130, 140, 155);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a system-generated payslip document from BELNOVA HRMS Mobile.', 14, 170);

  // Save PDF
  doc.save(`Payslip_${month.replace(/\s+/g, '_')}.pdf`);
};

export const downloadReportPdf = (
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  fileName: string
) => {
  const doc = new jsPDF();

  // Company Header
  doc.setFillColor(47, 115, 244);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BELNOVA HRMS DOCUMENT VAULT', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} (${subtitle})`, 14, 29);

  let yPosition = 50;

  // Table Headers
  doc.setFillColor(240, 243, 250);
  doc.rect(14, yPosition, 182, 9, 'F');
  doc.setTextColor(40, 50, 70);
  doc.setFont('helvetica', 'bold');

  doc.text(headers[0] || 'Field', 18, yPosition + 6);
  doc.text(headers[1] || 'Value', 100, yPosition + 6);

  yPosition += 15;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  rows.forEach((row) => {
    doc.text(String(row[0] || ''), 18, yPosition);
    doc.text(String(row[1] || ''), 100, yPosition);
    yPosition += 10;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text('Official verified record generated from Belnova HRMS Mobile Document Management.', 14, yPosition + 15);

  doc.save(fileName);
};

export function getCompanyPdfHeaderHtml({
  documentTitle,
  period = '2026',
}: {
  documentTitle: string;
  period?: string;
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #2563eb;padding-bottom:14px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;font-family:sans-serif;">B</div>
        <div>
          <h1 style="margin:0;font-size:20px;color:#0f172a;font-weight:800;letter-spacing:-0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">BELNOVA HRMS</h1>
          <div style="font-size:12px;color:#64748b;font-weight:500;margin-top:2px;">${documentTitle} &bull; Official Executive Report</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Coverage Period</div>
        <div style="font-size:13px;color:#2563eb;font-weight:700;">${period}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:2px;">Generated: ${currentDate}</div>
      </div>
    </div>
  `;
}
