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

export const INITIAL_EMPLOYEES_STORE: EmployeeRecord[] = [];

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

const STORAGE_KEY = 'belnova_employees';

const loadFromStorage = (): EmployeeRecord[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (list: EmployeeRecord[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage quota errors
  }
};

// Central store with localStorage persistence
let employeesMemory: EmployeeRecord[] = loadFromStorage();

export const getEmployees = (): EmployeeRecord[] => {
  if (employeesMemory.length === 0) {
    employeesMemory = loadFromStorage();
  }
  return employeesMemory;
};

export const syncEmployeesFromTeam = (members: any[]): void => {
  if (!Array.isArray(members)) return;
  if (employeesMemory.length === 0) {
    employeesMemory = loadFromStorage();
  }
  members.forEach((m) => {
    const existingIdx = employeesMemory.findIndex(
      (e) =>
        (m.id && e.id.toLowerCase() === m.id.toLowerCase()) ||
        (m.email && e.email.toLowerCase() === m.email.toLowerCase())
    );
    const names = (m.name || '').split(' ');
    const record: EmployeeRecord = {
      id: m.id || m.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: m.name || 'Employee',
      firstName: names[0] || m.firstName || 'Employee',
      lastName: names.slice(1).join(' ') || m.lastName || '',
      email: m.email || '',
      phone: m.phone || '—',
      department: m.department || (m.role === 'hr' ? 'Human Resources' : 'Engineering'),
      role: m.designation || m.role || 'Staff',
      status: (m.status as any) || 'Active',
      joinDate: m.joinDate || '2024-01-01',
      avatarBg: m.color || m.avatarBg || '#2F6FED',
      workLocation: m.workLocation || m.location || 'Bangalore HQ',
      employmentType: m.employmentType || 'Full-Time',
    };
    if (existingIdx >= 0) {
      employeesMemory[existingIdx] = { ...record, ...employeesMemory[existingIdx] };
    } else {
      employeesMemory.push(record);
    }
  });
  saveToStorage(employeesMemory);
};

export const getEmployeeById = (id: string): EmployeeRecord | undefined => {
  if (employeesMemory.length === 0) {
    employeesMemory = loadFromStorage();
  }
  return employeesMemory.find((e) => e.id.toLowerCase() === id.toLowerCase());
};

export const saveEmployee = (emp: EmployeeRecord): void => {
  if (employeesMemory.length === 0) {
    employeesMemory = loadFromStorage();
  }
  const index = employeesMemory.findIndex((e) => e.id.toLowerCase() === emp.id.toLowerCase());
  if (index >= 0) {
    employeesMemory[index] = { ...employeesMemory[index], ...emp };
  } else {
    employeesMemory = [emp, ...employeesMemory];
  }
  saveToStorage(employeesMemory);
};
