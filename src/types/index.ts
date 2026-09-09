export type UserRole = 'hr' | 'manager' | 'employee';

export interface User {
  id: string;
  employeeId?: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  name: string;
  designation: string;
  department: string;
  reportsTo?: string;
  avatar: string;
  avatarBg: string;
  joiningDate?: string;
  phone?: string;
  address?: string;
  token?: string;
}

export interface TeamMember {
  id: string;
  initials: string;
  color: string;
  name: string;
  designation: string;
  checkIn: string;
  status: 'Present' | 'Absent' | 'WFH' | 'On Leave';
  performance: string;
  email: string;
  phone: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  initials: string;
  avatarBg: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  rejectReason?: string;
}

export interface LeaveBalanceCategory {
  available: number;
  used: number;
  total: number;
}

export interface LeaveBalances {
  casual: LeaveBalanceCategory;
  sick: LeaveBalanceCategory;
  earned: LeaveBalanceCategory;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  day: string;
  type: string;
}

export interface Announcement {
  id: number;
  title: string;
  category: string;
  date: string;
  content: string;
  important: boolean;
}

export interface Payslip {
  id?: string | number;
  month: string;
  grossSalary: string;
  deductions: string;
  netSalary: string;
  payDate: string;
  status: string;
}

export interface HelpTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  subject: string;
  description: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  responseNote?: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employee: string;
  title: string;
  fileName: string;
  category: string;
  size: string;
  uploaded: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  file?: any;
}

export interface NotificationItem {
  id: string;
  audience: 'All' | 'HR' | 'Manager' | 'Employee' | 'All Employees' | 'HR Administrators' | 'All Portals' | string;
  recipientId?: string | null;
  category: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  priority?: 'Normal' | 'High' | 'Low' | string;
  targetPath?: string;
  createdAt?: string;
}

export interface TodayAttendance {
  checkedIn: boolean;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  workingHours: string;
}
