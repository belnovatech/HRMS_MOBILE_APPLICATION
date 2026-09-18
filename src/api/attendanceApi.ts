import client from './client';

export interface AttendanceRecordDto {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: string;
}

export interface AttendanceCorrectionDto {
  id?: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  status?: string;
}

export const attendanceApi = {
  getAttendance: async (employeeId?: string, date?: string): Promise<AttendanceRecordDto[]> => {
    const params: Record<string, string> = {};
    if (employeeId) params.employeeId = employeeId;
    if (date) params.date = date;
    const response = await client.get('/Attendance', { params });
    return response.data;
  },

  checkIn: async (employeeId: string, employeeName?: string): Promise<AttendanceRecordDto> => {
    const response = await client.post('/Attendance/check-in', {
      employeeId,
      employeeName,
    });
    return response.data;
  },

  checkOut: async (employeeId: string, employeeName?: string): Promise<AttendanceRecordDto> => {
    const response = await client.post('/Attendance/check-out', {
      employeeId,
      employeeName,
    });
    return response.data;
  },

  getCorrections: async (): Promise<AttendanceCorrectionDto[]> => {
    const response = await client.get('/attendance/corrections');
    return response.data;
  },

  requestCorrection: async (data: AttendanceCorrectionDto): Promise<any> => {
    const response = await client.post('/attendance/corrections', data);
    return response.data;
  },

  decideCorrection: async (id: string, decision: { status: 'Approved' | 'Rejected'; note?: string }): Promise<any> => {
    const response = await client.post(`/attendance/corrections/${id}/decision`, decision);
    return response.data;
  },
};

export default attendanceApi;

