export interface EmployeeRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  ctc?: string;
  baseCtc?: string;
  location?: string;
  workLocation?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bank?: string;
  bankName?: string;
  account?: string;
  accountNumber?: string;
  ifscCode?: string;
  pfNumber?: string;
  employmentType?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  photoName?: string;
  avatarBg?: string;
}

export const INITIAL_EMPLOYEES_STORE: EmployeeRecord[] = [
  {
    id: 'EMP-1001',
    firstName: 'Arjun',
    lastName: 'Mehta',
    name: 'Arjun Mehta',
    email: 'arjun.m@belnova.com',
    phone: '9876543210',
    department: 'Engineering',
    role: 'Sr. Frontend Dev',
    status: 'Active',
    joinDate: '2023-04-15',
    ctc: '₹18,50,000 / year',
    baseCtc: '1850000',
    location: 'Bangalore HQ',
    workLocation: 'Bangalore HQ',
    dob: '1994-08-12',
    gender: 'Male',
    bank: 'HDFC Bank',
    bankName: 'HDFC Bank',
    account: '50100098765432',
    accountNumber: '50100098765432',
    ifscCode: 'HDFC0000123',
    pfNumber: 'MH/BAN/0012345/000/0000123',
    employmentType: 'Full-Time',
    aadhaarNumber: '789012345678',
    panNumber: 'ABCDE1234F',
    avatarBg: '#2F6FED',
  },
  {
    id: 'EMP-1002',
    firstName: 'Kavya',
    lastName: 'Nair',
    name: 'Kavya Nair',
    email: 'kavya.n@belnova.com',
    phone: '9812345678',
    department: 'Product & Design',
    role: 'UX Designer',
    status: 'Active',
    joinDate: '2023-08-01',
    ctc: '₹14,00,000 / year',
    baseCtc: '1400000',
    location: 'Bangalore HQ',
    workLocation: 'Bangalore HQ',
    dob: '1996-03-24',
    gender: 'Female',
    bank: 'ICICI Bank',
    bankName: 'ICICI Bank',
    account: '000401567890',
    accountNumber: '000401567890',
    ifscCode: 'ICIC0000401',
    pfNumber: 'MH/BAN/0012345/000/0000456',
    employmentType: 'Full-Time',
    aadhaarNumber: '890123456789',
    panNumber: 'FGHIJ5678K',
    avatarBg: '#D946EF',
  },
  {
    id: 'EMP-1003',
    firstName: 'Rahul',
    lastName: 'Verma',
    name: 'Rahul Verma',
    email: 'rahul.v@belnova.com',
    phone: '9876500003',
    department: 'Engineering',
    role: 'Backend Dev',
    status: 'On Leave',
    joinDate: '2024-01-10',
    ctc: '₹16,00,000 / year',
    baseCtc: '1600000',
    location: 'Bangalore HQ',
    workLocation: 'Bangalore HQ',
    dob: '1995-11-05',
    gender: 'Male',
    bank: 'State Bank of India',
    bankName: 'State Bank of India',
    account: '30491029384',
    accountNumber: '30491029384',
    ifscCode: 'SBIN0001234',
    pfNumber: 'MH/BAN/0012345/000/0000789',
    employmentType: 'Full-Time',
    aadhaarNumber: '901234567890',
    panNumber: 'KLMNO9012P',
    avatarBg: '#635BEB',
  },
  {
    id: 'EMP-1004',
    firstName: 'Sneha',
    lastName: 'Sharma',
    name: 'Sneha Sharma',
    email: 'sneha.s@belnova.com',
    phone: '9876500004',
    department: 'HR & Operations',
    role: 'HR Specialist',
    status: 'Active',
    joinDate: '2022-11-20',
    ctc: '₹12,00,000 / year',
    baseCtc: '1200000',
    location: 'Mumbai Office',
    workLocation: 'Mumbai Office',
    dob: '1993-05-18',
    gender: 'Female',
    bank: 'HDFC Bank',
    bankName: 'HDFC Bank',
    account: '50100088899911',
    accountNumber: '50100088899911',
    ifscCode: 'HDFC0000123',
    pfNumber: 'MH/BAN/0012345/000/0000321',
    employmentType: 'Full-Time',
    aadhaarNumber: '678901234567',
    panNumber: 'QRSTU3456V',
    avatarBg: '#10B981',
  },
  {
    id: 'EMP-1005',
    firstName: 'Vikram',
    lastName: 'Singh',
    name: 'Vikram Singh',
    email: 'vikram.s@belnova.com',
    phone: '9876500005',
    department: 'Sales & Marketing',
    role: 'Sales Lead',
    status: 'Active',
    joinDate: '2024-05-12',
    ctc: '₹20,00,000 / year',
    baseCtc: '2000000',
    location: 'Bangalore HQ',
    workLocation: 'Bangalore HQ',
    dob: '1992-09-30',
    gender: 'Male',
    bank: 'Axis Bank',
    bankName: 'Axis Bank',
    account: '912010045678901',
    accountNumber: '912010045678901',
    ifscCode: 'UTIB0000123',
    pfNumber: 'MH/BAN/0012345/000/0000654',
    employmentType: 'Full-Time',
    aadhaarNumber: '567890123456',
    panNumber: 'WXYZB7890C',
    avatarBg: '#F59E0B',
  },
  {
    id: 'EMP-1006',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@belnova.com',
    phone: '9876500006',
    department: 'Finance & Legal',
    role: 'Financial Analyst',
    status: 'Inactive',
    joinDate: '2021-06-18',
    ctc: '₹15,00,000 / year',
    baseCtc: '1500000',
    location: 'Remote',
    workLocation: 'Remote',
    dob: '1991-12-14',
    gender: 'Female',
    bank: 'ICICI Bank',
    bankName: 'ICICI Bank',
    account: '000401998877',
    accountNumber: '000401998877',
    ifscCode: 'ICIC0000401',
    pfNumber: 'MH/BAN/0012345/000/0000987',
    employmentType: 'Full-Time',
    aadhaarNumber: '456789012345',
    panNumber: 'DEFGH4567J',
    avatarBg: '#06B6D4',
  },
];

// Helper validation functions
export const isValidName = (name: string): boolean => {
  return /^[a-zA-Z\s.]{2,50}$/.test(name.trim());
};

export const isValidPhone = (phone: string): boolean => {
  // Strip non-digits and check if exactly 10 digits (optionally starting with +91)
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(clean.slice(2));
  }
  return /^[6-9]\d{9}$/.test(clean);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  const clean = aadhaar.replace(/\D/g, '');
  return clean.length === 12;
};

export const isValidPAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
};

// Central in-memory store
let employeesMemory = [...INITIAL_EMPLOYEES_STORE];

export const getEmployees = (): EmployeeRecord[] => {
  return employeesMemory;
};

export const getEmployeeById = (id: string): EmployeeRecord | undefined => {
  return employeesMemory.find((e) => e.id.toLowerCase() === id.toLowerCase());
};

export const saveEmployee = (emp: EmployeeRecord): void => {
  const index = employeesMemory.findIndex((e) => e.id === emp.id);
  if (index >= 0) {
    employeesMemory[index] = { ...employeesMemory[index], ...emp };
  } else {
    employeesMemory = [emp, ...employeesMemory];
  }
};
