import client from './client';

export const getPayslipByEmployee = (empId: string) =>
  client.get(`/payroll/calculate/${empId}`);

export const calculateAllPayroll = () =>
  client.get('/payroll/calculate-all');

export const getAllPayslips = () =>
  client.get('/payroll/payslips');

export const getPayslipById = (payslipId: string) =>
  client.get(`/payroll/${payslipId}`);

export const getEmployeePayslips = (empId: string) =>
  client.get(`/payroll/employee/${empId}`);

export const getMonthlyPayslip = () =>
  client.get('/payroll/employee/monthly');
