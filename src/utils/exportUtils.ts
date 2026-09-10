import * as XLSX from 'xlsx';
import { downloadFile, downloadReportExcel, downloadReportCsv } from '../services/downloadService';

export const exportToExcel = async (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const safeFileName = `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return downloadFile({
    fileName: safeFileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    arrayBuffer: excelBuffer,
    title: '✓ Download Complete',
    description: `${safeFileName} saved successfully.`,
  });
};

export const exportToCsv = async (headers: string[], rows: (string | number)[][], fileName: string) => {
  const safeFileName = `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  return downloadReportCsv(headers, rows, safeFileName);
};

export const formatCurrency = (amount: number | string) => {
  if (typeof amount === 'string') return amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
