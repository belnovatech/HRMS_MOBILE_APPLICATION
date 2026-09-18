import client from './client';

export interface PayslipDto {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number | string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  payDate?: string;
  status: string;
}

export const payrollApi = {
  getAllPayslips: async (): Promise<PayslipDto[]> => {
    const response = await client.get('/Payroll/payslips');
    return response.data || [];
  },

  getPayslipById: async (payslipId: string): Promise<PayslipDto> => {
    const response = await client.get(`/Payroll/${payslipId}`);
    return response.data;
  },

  getEmployeePayslips: async (empId: string): Promise<PayslipDto[]> => {
    const response = await client.get(`/Payroll/employee/${empId}`);
    return response.data || [];
  },

  getMonthlyPayslip: async (): Promise<PayslipDto | null> => {
    const response = await client.get('/Payroll/employee/monthly');
    return response.data;
  },

  calculateEmployeePayroll: async (empId: string, month: number, year: number): Promise<any> => {
    const response = await client.post(`/Payroll/calculate/${empId}`, { month, year });
    return response.data;
  },

  calculateAllPayroll: async (month: number, year: number): Promise<any> => {
    const response = await client.post('/Payroll/calculate-all', { month, year });
    return response.data;
  },

  processPayroll: async (payslipIds: string[]): Promise<any> => {
    const response = await client.post('/Payroll/process', { payslipIds });
    return response.data;
  },

  getPayrollDashboard: async (): Promise<any> => {
    const response = await client.get('/Payroll/dashboard');
    return response.data;
  },
};

export default payrollApi;
