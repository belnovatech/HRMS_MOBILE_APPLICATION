export * from './client';
export * from './authApi';
export * from './attendanceApi';
export * from './leaveApi';
export * from './payrollApi';
export * from './documentApi';
export * from './supportApi';
export * from './notificationApi';
export * from './generalApi';

import client from './client';
import authApi from './authApi';
import attendanceApi from './attendanceApi';
import leaveApi from './leaveApi';
import payrollApi from './payrollApi';
import documentApi from './documentApi';
import supportApi from './supportApi';
import notificationApi from './notificationApi';
import generalApi from './generalApi';

export default {
  client,
  auth: authApi,
  attendance: attendanceApi,
  leave: leaveApi,
  payroll: payrollApi,
  document: documentApi,
  support: supportApi,
  notification: notificationApi,
  general: generalApi,
};

