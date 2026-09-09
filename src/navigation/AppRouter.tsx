import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Auth
import { Login } from '../screens/Login/Login';

// Shared
import { MoreScreen } from '../screens/Shared/MoreScreen/MoreScreen';

// HR Admin Screens
import { HRDashboard } from '../screens/HRAdmin/HRDashboard';
import { HROrganization } from '../screens/HRAdmin/HROrganization';
import { HREmployees } from '../screens/HRAdmin/HREmployees';
import { HRAddEmployee } from '../screens/HRAdmin/HRAddEmployee';
import { HREmployeeDetails } from '../screens/HRAdmin/HREmployeeDetails';
import { HREditEmployee } from '../screens/HRAdmin/HREditEmployee';
import { HRAttendance } from '../screens/HRAdmin/HRAttendance';
import { HRLeaveManagement } from '../screens/HRAdmin/HRLeaveManagement';
import { HRPayroll } from '../screens/HRAdmin/HRPayroll';
import { HRRecruitment } from '../screens/HRAdmin/HRRecruitment';
import { HRRolesPermissions } from '../screens/HRAdmin/HRRolesPermissions';
import { HRReports } from '../screens/HRAdmin/HRReports';
import { HRDocuments } from '../screens/HRAdmin/HRDocuments';
import { HRBiometricSync } from '../screens/HRAdmin/HRBiometricSync';
import { HRNotifications } from '../screens/HRAdmin/HRNotifications';
import { HRSettings } from '../screens/HRAdmin/HRSettings';
import { HRHelpSupport } from '../screens/HRAdmin/HRHelpSupport';

// Manager Screens
import { ManagerDashboard } from '../screens/Manager/ManagerDashboard';
import { MyTeam } from '../screens/Manager/MyTeam';
import { TeamAttendance } from '../screens/Manager/TeamAttendance';
import { LeaveApprovals } from '../screens/Manager/LeaveApprovals';
import { TeamReports } from '../screens/Manager/TeamReports';
import { ManagerNotifications } from '../screens/Manager/ManagerNotifications';
import { ManagerHelp } from '../screens/Manager/ManagerHelp';

// Employee Screens
import { EmployeeDashboard } from '../screens/Employee/EmployeeDashboard';
import { EmployeeProfile } from '../screens/Employee/EmployeeProfile';
import { EmployeeAttendance } from '../screens/Employee/EmployeeAttendance';
import { EmployeeLeave } from '../screens/Employee/EmployeeLeave';
import { EmployeePayslips } from '../screens/Employee/EmployeePayslips';
import { EmployeeDocuments } from '../screens/Employee/EmployeeDocuments';
import { EmployeeHolidays } from '../screens/Employee/EmployeeHolidays';
import { EmployeeAnnouncements } from '../screens/Employee/EmployeeAnnouncements';
import { EmployeeRequests } from '../screens/Employee/EmployeeRequests';
import { EmployeeHelp } from '../screens/Employee/EmployeeHelp';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      
      {/* Shared Module Menu */}
      <Route
        path="/shared/more"
        element={
          <ProtectedRoute>
            <MoreScreen />
          </ProtectedRoute>
        }
      />

      {/* ================= HR ROUTES ================= */}
      <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['hr']}><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/organization" element={<ProtectedRoute allowedRoles={['hr']}><HROrganization /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['hr']}><HREmployees /></ProtectedRoute>} />
      <Route path="/hr/employees/add" element={<ProtectedRoute allowedRoles={['hr']}><HRAddEmployee /></ProtectedRoute>} />
      <Route path="/hr/employees/:id" element={<ProtectedRoute allowedRoles={['hr']}><HREmployeeDetails /></ProtectedRoute>} />
      <Route path="/hr/employees/:id/edit" element={<ProtectedRoute allowedRoles={['hr']}><HREditEmployee /></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['hr']}><HRAttendance /></ProtectedRoute>} />
      <Route path="/hr/leave-management" element={<ProtectedRoute allowedRoles={['hr']}><HRLeaveManagement /></ProtectedRoute>} />
      <Route path="/hr/payroll" element={<ProtectedRoute allowedRoles={['hr']}><HRPayroll /></ProtectedRoute>} />
      <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['hr']}><HRRecruitment /></ProtectedRoute>} />
      <Route path="/hr/roles-permissions" element={<ProtectedRoute allowedRoles={['hr']}><HRRolesPermissions /></ProtectedRoute>} />
      <Route path="/hr/reports" element={<ProtectedRoute allowedRoles={['hr']}><HRReports /></ProtectedRoute>} />
      <Route path="/hr/documents" element={<ProtectedRoute allowedRoles={['hr']}><HRDocuments /></ProtectedRoute>} />
      <Route path="/hr/biometric-sync" element={<ProtectedRoute allowedRoles={['hr']}><HRBiometricSync /></ProtectedRoute>} />
      <Route path="/hr/notifications" element={<ProtectedRoute allowedRoles={['hr']}><HRNotifications /></ProtectedRoute>} />
      <Route path="/hr/settings" element={<ProtectedRoute allowedRoles={['hr']}><HRSettings /></ProtectedRoute>} />
      <Route path="/hr/help" element={<ProtectedRoute allowedRoles={['hr']}><HRHelpSupport /></ProtectedRoute>} />

      {/* ================= MANAGER ROUTES ================= */}
      <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/team" element={<ProtectedRoute allowedRoles={['manager']}><MyTeam /></ProtectedRoute>} />
      <Route path="/manager/my-team" element={<ProtectedRoute allowedRoles={['manager']}><MyTeam /></ProtectedRoute>} />
      <Route path="/manager/attendance" element={<ProtectedRoute allowedRoles={['manager']}><TeamAttendance /></ProtectedRoute>} />
      <Route path="/manager/attendance-corrections" element={<ProtectedRoute allowedRoles={['manager']}><TeamAttendance /></ProtectedRoute>} />
      <Route path="/manager/leave-approvals" element={<ProtectedRoute allowedRoles={['manager']}><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/manager/leave-calendar" element={<ProtectedRoute allowedRoles={['manager']}><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['manager']}><TeamReports /></ProtectedRoute>} />
      <Route path="/manager/notifications" element={<ProtectedRoute allowedRoles={['manager']}><ManagerNotifications /></ProtectedRoute>} />
      <Route path="/manager/help" element={<ProtectedRoute allowedRoles={['manager']}><ManagerHelp /></ProtectedRoute>} />

      {/* ================= EMPLOYEE ROUTES ================= */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
      <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLeave /></ProtectedRoute>} />
      <Route path="/employee/payslips" element={<ProtectedRoute allowedRoles={['employee']}><EmployeePayslips /></ProtectedRoute>} />
      <Route path="/employee/documents" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDocuments /></ProtectedRoute>} />
      <Route path="/employee/holidays" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeHolidays /></ProtectedRoute>} />
      <Route path="/employee/announcements" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAnnouncements /></ProtectedRoute>} />
      <Route path="/employee/requests" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeRequests /></ProtectedRoute>} />
      <Route path="/employee/help" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeHelp /></ProtectedRoute>} />

      {/* Fallback Redirects */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
