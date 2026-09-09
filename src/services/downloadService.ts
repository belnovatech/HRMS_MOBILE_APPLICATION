import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { NotificationItem } from '../types';

export interface DownloadOptions {
  fileName: string;
  mimeType?: string;
  blob?: Blob;
  dataUrl?: string;
  url?: string;
  arrayBuffer?: ArrayBuffer;
  text?: string;
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

export interface DownloadResult {
  success: boolean;
  fileName: string;
  mimeType: string;
  error?: string;
}

/**
 * Infer MIME type based on file extension if not explicitly specified.
 */
export const getMimeTypeFromExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'csv':
      return 'text/csv';
    case 'txt':
      return 'text/plain';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Helper to convert Data URL (base64) to Blob
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Dispatches an in-app toast banner notification and saves an item to AuthContext notifications list
 */
const triggerDownloadNotification = (
  fileName: string,
  title: string = 'Download Completed',
  description?: string
) => {
  const notifMsg = description || `${fileName} has been saved successfully.`;

  // 1. Save to localStorage notifications so Bell badge updates in HRMS
  try {
    const saved = localStorage.getItem('belnova_notifications');
    const existingNotifs: NotificationItem[] = saved ? JSON.parse(saved) : [];

    const newNotif: NotificationItem = {
      id: `NOTIF-DL-${Date.now().toString().slice(-5)}`,
      audience: 'All',
      category: 'Downloads',
      title: title,
      message: notifMsg,
      time: 'Just now',
      unread: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      'belnova_notifications',
      JSON.stringify([newNotif, ...existingNotifs])
    );
  } catch (err) {
    console.error('Error updating notification history:', err);
  }

  // 2. Dispatch custom event for UI toast banners
  const event = new CustomEvent('hrms-download-completed', {
    detail: {
      fileName,
      title,
      message: notifMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  });
  window.dispatchEvent(event);

  // 3. Native Browser / Android Notification API if granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`HRMS ✓ ${title}`, {
        body: notifMsg,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification suppressed or unavailable in WebView context.');
    }
  }
};

/**
 * Reusable Mobile Download Handler
 */
export const downloadFile = async (
  options: DownloadOptions
): Promise<DownloadResult> => {
  const {
    fileName,
    mimeType: providedMimeType,
    blob: providedBlob,
    dataUrl,
    url,
    arrayBuffer,
    text,
    title = 'File Downloaded',
    description,
    onProgress,
  } = options;

  if (onProgress) onProgress(20);

  const mimeType = providedMimeType || getMimeTypeFromExtension(fileName);

  try {
    let finalBlob: Blob;

    if (providedBlob) {
      finalBlob = providedBlob;
    } else if (dataUrl) {
      finalBlob = dataUrlToBlob(dataUrl);
    } else if (arrayBuffer) {
      finalBlob = new Blob([arrayBuffer], { type: mimeType });
    } else if (text) {
      finalBlob = new Blob([text], { type: mimeType });
    } else if (url) {
      if (onProgress) onProgress(40);
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch file from server (${resp.status})`);
      }
      finalBlob = await resp.blob();
    } else {
      throw new Error('No valid file source (blob, dataUrl, url, arrayBuffer, or text) provided.');
    }

    if (onProgress) onProgress(80);

    // Save File using file-saver (works seamlessly across web view & mobile browsers)
    saveAs(finalBlob, fileName);

    if (onProgress) onProgress(100);

    // Notify User
    triggerDownloadNotification(fileName, title, description);

    return {
      success: true,
      fileName,
      mimeType,
    };
  } catch (error: any) {
    console.error('Download error:', error);

    const errorMsg = error?.message || 'Download failed due to a network or storage error.';

    // Dispatch error toast event
    const errorEvent = new CustomEvent('hrms-download-failed', {
      detail: {
        fileName,
        error: errorMsg,
      },
    });
    window.dispatchEvent(errorEvent);

    return {
      success: false,
      fileName,
      mimeType,
      error: errorMsg,
    };
  }
};

/**
 * Payslip PDF Downloader wrapper
 */
export const downloadPayslip = async (slip: any, user: any): Promise<DownloadResult> => {
  const doc = new jsPDF();

  const userName = user?.name || 'Employee User';
  const empId = user?.employeeId || user?.id || 'EMP001';
  const designation = user?.designation || 'Software Engineer';
  const department = user?.department || 'Engineering';
  const month = slip?.month || 'August 2026';

  // Header Banner
  doc.setFillColor(37, 105, 233);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BELNOVA HRMS', 14, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL PAYSLIP STATEMENT', 14, 32);
  doc.text(`Period: ${month}`, 145, 32);

  // Employee Details
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

  // Salary Table
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 88, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS & DEDUCTIONS', 18, 95);
  doc.text('AMOUNT', 160, 95);

  doc.setFont('helvetica', 'normal');
  doc.text('Gross Salary / Earnings', 18, 110);
  doc.text(String(slip?.grossSalary || '₹60,000'), 160, 110);

  doc.text('Total Deductions (PF / Tax)', 18, 122);
  doc.text(`- ${String(slip?.deductions || '₹11,500')}`, 160, 122);

  doc.line(14, 130, 196, 130);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('Net Salary Paid', 18, 142);
  doc.text(String(slip?.netSalary || '₹48,500'), 160, 142);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(130, 140, 155);
  doc.setFont('helvetica', 'italic');
  doc.text('System-generated official payslip from BELNOVA HRMS Mobile Application.', 14, 170);

  const pdfBlob = doc.output('blob');
  const fileName = `EmployeePayslip_${month.replace(/\s+/g, '_')}.pdf`;

  return downloadFile({
    fileName,
    mimeType: 'application/pdf',
    blob: pdfBlob,
    title: 'Payslip Downloaded',
    description: `Official payslip for ${month} saved successfully.`,
  });
};

/**
 * Document File Downloader wrapper
 */
export const downloadDocument = async (docItem: any): Promise<DownloadResult> => {
  const fileName = docItem.fileName || `${(docItem.title || 'Document').replace(/\s+/g, '_')}.pdf`;
  const mimeType = getMimeTypeFromExtension(fileName);

  // If document carries actual Blob/File object (e.g. uploaded file)
  if (docItem.file && docItem.file instanceof Blob) {
    return downloadFile({
      fileName,
      mimeType,
      blob: docItem.file,
      title: 'Document Downloaded',
      description: `${docItem.title || fileName} saved successfully.`,
    });
  }

  // If document carries dataUrl
  if (docItem.file && typeof docItem.file === 'string' && docItem.file.startsWith('data:')) {
    return downloadFile({
      fileName,
      mimeType,
      dataUrl: docItem.file,
      title: 'Document Downloaded',
      description: `${docItem.title || fileName} saved successfully.`,
    });
  }

  // Fallback: Generate official verified PDF statement
  const doc = new jsPDF();
  doc.setFillColor(37, 105, 233);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BELNOVA HRMS VERIFIED DOCUMENT', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document Title: ${docItem.title || 'Official Document'}`, 14, 29);

  let yPosition = 50;

  doc.setFillColor(240, 243, 250);
  doc.rect(14, yPosition, 182, 9, 'F');
  doc.setTextColor(40, 50, 70);
  doc.setFont('helvetica', 'bold');

  doc.text('METADATA FIELD', 18, yPosition + 6);
  doc.text('DETAILS', 100, yPosition + 6);

  yPosition += 15;

  doc.setFont('helvetica', 'normal');
  const metaRows = [
    ['Document ID', docItem.id || 'DOC-101'],
    ['Title', docItem.title || 'Official Document'],
    ['Category', docItem.category || 'General'],
    ['Owner / Employee', docItem.employee || 'Employee User'],
    ['Uploaded Date', docItem.uploaded || '2026-09-01'],
    ['Verification Status', docItem.status || 'Verified'],
    ['File Size', docItem.size || '1.5 MB'],
  ];

  metaRows.forEach((row) => {
    doc.text(String(row[0]), 18, yPosition);
    doc.text(String(row[1]), 100, yPosition);
    yPosition += 10;
  });

  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text('Official verified record generated from BELNOVA HRMS Document Vault.', 14, yPosition + 15);

  const pdfBlob = doc.output('blob');

  return downloadFile({
    fileName,
    mimeType: 'application/pdf',
    blob: pdfBlob,
    title: 'Document Downloaded',
    description: `${docItem.title || fileName} saved successfully.`,
  });
};

/**
 * Generic Report PDF Downloader wrapper
 */
export const downloadReport = async (
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  fileName: string
): Promise<DownloadResult> => {
  const doc = new jsPDF();

  doc.setFillColor(37, 105, 233);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BELNOVA HRMS REPORT VAULT', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} (${subtitle})`, 14, 29);

  let yPosition = 50;

  doc.setFillColor(240, 243, 250);
  doc.rect(14, yPosition, 182, 9, 'F');
  doc.setTextColor(40, 50, 70);
  doc.setFont('helvetica', 'bold');

  doc.text(headers[0] || 'Field', 18, yPosition + 6);
  doc.text(headers[1] || 'Value', 100, yPosition + 6);

  yPosition += 15;

  doc.setFont('helvetica', 'normal');
  rows.forEach((row) => {
    doc.text(String(row[0] || ''), 18, yPosition);
    doc.text(String(row[1] || ''), 100, yPosition);
    yPosition += 10;
  });

  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text('Official verified report generated from BELNOVA HRMS Mobile Application.', 14, yPosition + 15);

  const pdfBlob = doc.output('blob');

  return downloadFile({
    fileName,
    mimeType: 'application/pdf',
    blob: pdfBlob,
    title: 'Report Downloaded',
    description: `${fileName} saved successfully.`,
  });
};
