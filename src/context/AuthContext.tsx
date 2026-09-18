import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  TeamMember,
  LeaveRequest,
  LeaveBalances,
  Holiday,
  Announcement,
  Payslip,
  HelpTicket,
  EmployeeDocument,
  NotificationItem,
  TodayAttendance,
} from '../types';
import {
  MOCK_USERS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_LEAVE_REQUESTS,
  EMPLOYEE_LEAVE_BALANCES,
  HOLIDAYS_LIST,
  ANNOUNCEMENTS_LIST,
  PAYSLIPS_LIST,
  INITIAL_HELP_TICKETS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  authApi,
  attendanceApi,
  leaveApi,
  payrollApi,
  documentApi,
  supportApi,
  notificationApi,
  generalApi,
  getApiErrorMessage,
} from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: UserRole; user?: User; error?: string }>;
  logout: () => void;
  requestOtp: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<{ success: boolean; role?: UserRole; user?: User; error?: string }>;
  refresh: (account?: User) => Promise<void>;
  leaveRequests: LeaveRequest[];
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  leaveBalances: LeaveBalances;
  helpTickets: HelpTicket[];
  documentsList: EmployeeDocument[];
  notificationsList: NotificationItem[];
  holidays: Holiday[];
  announcements: Announcement[];
  payslips: Payslip[];
  todayAttendance: TodayAttendance;
  handleApproveLeave: (leaveId: string) => Promise<void> | void;
  handleRejectLeave: (leaveId: string, reason?: string) => Promise<void> | void;
  handleAddLeaveRequest: (newLeave: { leaveType: string; startDate: string; endDate: string; duration: number; reason: string }) => Promise<void> | void;
  addHelpTicket: (ticketData: { category: string; subject: string; description: string }) => HelpTicket;
  updateHelpTicketStatus: (ticketId: string, status: HelpTicket['status'], responseNote?: string) => Promise<void> | void;
  addEmployeeDocument: (docData: { title: string; category?: string; fileName?: string; size?: string; file?: any; employeeId?: string; employee?: string }) => EmployeeDocument;
  verifyEmployeeDocument: (docId: string, newStatus?: EmployeeDocument['status']) => Promise<void> | void;
  removeEmployeeDocument: (docId: string) => void;
  sendNotification: (params: { audience?: NotificationItem['audience']; recipientId?: string | null; category?: string; title: string; message: string; priority?: string; targetPath?: string }) => Promise<void> | void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => Promise<void> | void;
  markAllNotificationsAsRead: () => Promise<void> | void;
  toggleCheckInOut: () => Promise<void> | void;
  requestAttendanceCorrection: (data: { date: string; checkIn: string; checkOut: string; reason: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('belnova_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('belnova_leave_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('belnova_team_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalances>(() => {
    const saved = localStorage.getItem('belnova_leave_balances');
    return saved ? JSON.parse(saved) : {};
  });

  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>(() => {
    const saved = localStorage.getItem('belnova_help_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [documentsList, setDocumentsList] = useState<EmployeeDocument[]>(() => {
    const saved = localStorage.getItem('belnova_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('belnova_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem('belnova_holidays');
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('belnova_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem('belnova_payslips');
    return saved ? JSON.parse(saved) : [];
  });

  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance>(() => {
    const saved = localStorage.getItem('belnova_today_attendance');
    return saved
      ? JSON.parse(saved)
      : {
          checkedIn: false,
          checkInTime: '—',
          checkOutTime: '—',
          status: 'Not checked in',
          workingHours: '—',
        };
  });

  // Sync state to local storage for offline tolerance
  useEffect(() => {
    if (user) {
      localStorage.setItem('belnova_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('belnova_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('belnova_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('belnova_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('belnova_leave_balances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('belnova_today_attendance', JSON.stringify(todayAttendance));
  }, [todayAttendance]);

  useEffect(() => {
    localStorage.setItem('belnova_help_tickets', JSON.stringify(helpTickets));
  }, [helpTickets]);

  useEffect(() => {
    localStorage.setItem('belnova_documents', JSON.stringify(documentsList));
  }, [documentsList]);

  useEffect(() => {
    localStorage.setItem('belnova_notifications', JSON.stringify(notificationsList));
  }, [notificationsList]);

  useEffect(() => {
    localStorage.setItem('belnova_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('belnova_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('belnova_payslips', JSON.stringify(payslips));
  }, [payslips]);

  // Synchronize collections with remote backend API
  const refresh = useCallback(
    async (account?: User) => {
      const targetUser = account || user;
      const sessionToken = localStorage.getItem('token');
      if (!sessionToken || !targetUser) return;

      try {
        const isHr = targetUser.role === 'hr';
        const results = await Promise.allSettled([
          leaveApi.getLeaves(isHr ? undefined : targetUser.id),
          generalApi.getTeam(),
          leaveApi.getLeaveBalances(targetUser.id),
          supportApi.getTickets(isHr ? undefined : targetUser.id),
          documentApi.getDocuments(isHr ? undefined : targetUser.id),
          notificationApi.getNotifications(),
          generalApi.getHolidays(),
          generalApi.getAnnouncements(),
          payrollApi.getAllPayslips(),
          attendanceApi.getAttendance(targetUser.id),
        ]);

        if (sessionToken !== localStorage.getItem('token')) return;

        const [
          leavesRes,
          teamRes,
          balancesRes,
          ticketsRes,
          docsRes,
          notifsRes,
          holidaysRes,
          announcementsRes,
          payslipsRes,
          attendanceRes,
        ] = results;

        if (leavesRes.status === 'fulfilled') {
          setLeaveRequests(leavesRes.value);
        }
        if (teamRes.status === 'fulfilled') {
          setTeamMembers(teamRes.value);
        }
        if (balancesRes.status === 'fulfilled' && balancesRes.value.length > 0) {
          setLeaveBalances((prev) => {
            const nextMap: LeaveBalances = { ...prev };
            balancesRes.value.forEach((b) => {
              const key = b.leaveType.toLowerCase().split(' ')[0];
              nextMap[key] = {
                available: b.available,
                used: b.used,
                total: b.total,
              };
            });
            return nextMap;
          });
        }
        if (ticketsRes.status === 'fulfilled') {
          setHelpTickets(ticketsRes.value);
        }
        if (docsRes.status === 'fulfilled') {
          setDocumentsList(docsRes.value);
        }
        if (notifsRes.status === 'fulfilled') {
          setNotificationsList(notifsRes.value);
        }
        if (holidaysRes.status === 'fulfilled') {
          setHolidays(holidaysRes.value);
        }
        if (announcementsRes.status === 'fulfilled') {
          setAnnouncements(announcementsRes.value);
        }
        if (payslipsRes.status === 'fulfilled') {
          setPayslips(
            payslipsRes.value.map((p) => ({
              id: p.id,
              month: `${p.year}-${String(p.month).padStart(2, '0')}`,
              grossSalary: `₹${(p.basic + p.allowances).toLocaleString()}`,
              deductions: `₹${p.deductions.toLocaleString()}`,
              netSalary: `₹${p.netPay.toLocaleString()}`,
              payDate: p.payDate || 'Last day of month',
              status: p.status || 'Processed',
            }))
          );
        }
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value.length > 0) {
          const todayStr = new Date().toLocaleDateString('en-CA');
          const ownToday = attendanceRes.value.find((r) => r.date === todayStr);
          if (ownToday) {
            setTodayAttendance({
              checkedIn: !ownToday.checkOut,
              checkInTime: ownToday.checkIn || '—',
              checkOutTime: ownToday.checkOut || '—',
              status: ownToday.status || 'Present',
              workingHours: ownToday.workingHours || '—',
            });
          }
        }
      } catch (err) {
        console.warn('Background sync warning:', err);
      }
    },
    [user]
  );

  // Restore authenticated session on initial load
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    if (token.startsWith('demo_session_token_')) {
      localStorage.removeItem('token');
      localStorage.removeItem('belnova_user');
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((me) => {
        if (active) {
          setUser(me);
          localStorage.setItem('belnova_user', JSON.stringify(me));
          refresh(me);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('belnova_user');
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; role?: UserRole; user?: User; error?: string }> => {
    const cleanId = identifier.trim();

    if (!cleanId || !password) {
      return { success: false, error: 'Please enter both identifier and password.' };
    }

    try {
      // Live API login
      const res = await authApi.login(cleanId, password);
      localStorage.setItem('token', res.token);

      const serverUser = res.user;
      const role = (serverUser.role?.toLowerCase() || 'employee') as UserRole;
      const authUser: User = {
        id: serverUser.id,
        employeeId: serverUser.employeeNumber || serverUser.id,
        email: serverUser.email,
        username: serverUser.username,
        role,
        name: serverUser.name || serverUser.username || 'User',
        designation: serverUser.designation || (role === 'hr' ? 'HR Manager' : role === 'manager' ? 'Team Lead' : 'Software Engineer'),
        department: serverUser.department || (role === 'hr' ? 'Human Resources' : 'Engineering'),
        reportsTo: serverUser.reportsTo,
        avatar: (serverUser.name || 'U').slice(0, 2).toUpperCase(),
        avatarBg: role === 'hr' ? '#2563eb' : role === 'manager' ? '#7c3aed' : '#10b981',
        token: res.token,
      };

      setUser(authUser);
      localStorage.setItem('belnova_user', JSON.stringify(authUser));
      await refresh(authUser);

      return {
        success: true,
        role: authUser.role,
        user: authUser,
      };
    } catch (apiError: any) {
      const errorMessage = getApiErrorMessage(apiError, 'Invalid credentials. Please verify your details.');
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    if (user && !user.token?.startsWith('demo_session_token_')) {
      authApi.logout().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('belnova_user');
    localStorage.removeItem('token');
    localStorage.removeItem('belnova_leave_requests');
    localStorage.removeItem('belnova_team_members');
    localStorage.removeItem('belnova_leave_balances');
    localStorage.removeItem('belnova_today_attendance');
    localStorage.removeItem('belnova_help_tickets');
    localStorage.removeItem('belnova_documents');
    localStorage.removeItem('belnova_notifications');
    localStorage.removeItem('belnova_holidays');
    localStorage.removeItem('belnova_announcements');
    localStorage.removeItem('belnova_payslips');
    setLeaveRequests([]);
    setTeamMembers([]);
    setNotificationsList([]);
    setHolidays([]);
    setAnnouncements([]);
    setPayslips([]);
  };

  const requestOtp = async (identifier: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.requestOtp(identifier);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getApiErrorMessage(err) };
    }
  };

  const verifyOtp = async (
    identifier: string,
    otp: string
  ): Promise<{ success: boolean; role?: UserRole; user?: User; error?: string }> => {
    try {
      const res = await authApi.verifyOtp(identifier, otp);
      localStorage.setItem('token', res.token);

      const serverUser = res.user;
      const role = (serverUser.role?.toLowerCase() || 'employee') as UserRole;
      const authUser: User = {
        id: serverUser.id,
        employeeId: serverUser.employeeNumber || serverUser.id,
        email: serverUser.email,
        username: serverUser.username,
        role,
        name: serverUser.name || serverUser.username || 'User',
        designation: serverUser.designation || 'Staff',
        department: serverUser.department || 'General',
        reportsTo: serverUser.reportsTo,
        avatar: (serverUser.name || 'U').slice(0, 2).toUpperCase(),
        avatarBg: role === 'hr' ? '#2563eb' : role === 'manager' ? '#7c3aed' : '#10b981',
        token: res.token,
      };

      setUser(authUser);
      localStorage.setItem('belnova_user', JSON.stringify(authUser));
      await refresh(authUser);

      return {
        success: true,
        role: authUser.role,
        user: authUser,
      };
    } catch (err: any) {
      return { success: false, error: getApiErrorMessage(err) };
    }
  };

  const sendNotification = async ({
    audience = 'All',
    recipientId = null,
    category = 'General',
    title,
    message,
    priority = 'Normal',
    targetPath = '',
  }: {
    audience?: NotificationItem['audience'];
    recipientId?: string | null;
    category?: string;
    title: string;
    message: string;
    priority?: string;
    targetPath?: string;
  }) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      audience,
      recipientId,
      category,
      title,
      message,
      time: 'Just now',
      unread: true,
      priority,
      targetPath,
      createdAt: new Date().toISOString(),
    };
    setNotificationsList((prev) => [newNotif, ...prev]);

    if (user && user.role === 'hr' && !user.token?.startsWith('demo_session_token_')) {
      try {
        await notificationApi.sendNotification({
          audience: audience as any,
          recipientId,
          category,
          title,
          message,
          targetPath,
        });
      } catch (err) {
        console.warn('Notification send warning:', err);
      }
    }
  };

  const deleteNotification = (id: string) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationAsRead = async (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await notificationApi.markAsRead(id);
      } catch (err) {
        console.warn('Mark notification as read warning:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await notificationApi.markAllAsRead();
      } catch (err) {
        console.warn('Mark all notifications read warning:', err);
      }
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    let targetReq: LeaveRequest | null = null;
    let wasAlreadyApproved = false;

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === leaveId) {
          if (req.status === 'Approved') wasAlreadyApproved = true;
          targetReq = { ...req, status: 'Approved' };
          return targetReq;
        }
        return req;
      })
    );

    if (targetReq && !wasAlreadyApproved) {
      sendNotification({
        audience: 'Employee',
        recipientId: (targetReq as LeaveRequest).employeeId,
        category: 'Leave',
        title: 'Leave Request Approved',
        message: `Your ${(targetReq as LeaveRequest).leaveType} request (${(targetReq as LeaveRequest).startDate} to ${(targetReq as LeaveRequest).endDate}) has been Approved.`,
        targetPath: '/employee/leave',
      });
    }

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await leaveApi.decideLeave(leaveId, 'Approved');
        await refresh(user);
      } catch (err) {
        console.warn('Approve leave API warning:', err);
      }
    }
  };

  const handleRejectLeave = async (leaveId: string, reason = '') => {
    let targetReq: LeaveRequest | null = null;
    let wasAlreadyRejected = false;

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === leaveId) {
          if (req.status === 'Rejected') wasAlreadyRejected = true;
          targetReq = { ...req, status: 'Rejected', rejectReason: reason };
          return targetReq;
        }
        return req;
      })
    );

    if (targetReq && !wasAlreadyRejected) {
      sendNotification({
        audience: 'Employee',
        recipientId: (targetReq as LeaveRequest).employeeId,
        category: 'Leave',
        title: 'Leave Request Rejected',
        message: `Your ${(targetReq as LeaveRequest).leaveType} request (${(targetReq as LeaveRequest).startDate} to ${(targetReq as LeaveRequest).endDate}) was Rejected.${reason ? ` Reason: ${reason}` : ''}`,
        targetPath: '/employee/leave',
      });
    }

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await leaveApi.decideLeave(leaveId, 'Rejected', reason);
        await refresh(user);
      } catch (err) {
        console.warn('Reject leave API warning:', err);
      }
    }
  };

  const handleAddLeaveRequest = async (newLeave: {
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
  }) => {
    const created: LeaveRequest = {
      id: `LR-${Date.now().toString().slice(-3)}`,
      employeeId: user?.employeeId || user?.id || 'EMP001',
      employeeName: user?.name || 'Arjun Mehta',
      initials: user?.avatar || 'AM',
      avatarBg: '#10b981',
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      duration: `${newLeave.duration || 1} Day(s)`,
      reason: newLeave.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests((prev) => [created, ...prev]);

    sendNotification({
      audience: 'HR',
      category: 'Leave',
      title: 'New Leave Request Submitted',
      message: `${created.employeeName} (${created.employeeId}) submitted a ${created.leaveType} request.`,
      targetPath: '/hr/leave-management',
    });

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await leaveApi.applyLeave({
          employeeId: user.id,
          employeeName: user.name,
          leaveType: newLeave.leaveType,
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          reason: newLeave.reason,
        });
        await refresh(user);
      } catch (err) {
        console.warn('Submit leave API warning:', err);
      }
    }
  };

  const addHelpTicket = (ticketData: { category: string; subject: string; description: string }): HelpTicket => {
    const created: HelpTicket = {
      id: `EMP-${Date.now().toString().slice(-6)}`,
      employeeId: user?.employeeId || user?.id || 'EMP001',
      employeeName: user?.name || 'Arjun Mehta',
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
      priority: 'Normal',
      responseNote: '',
    };

    setHelpTickets((prev) => [created, ...prev]);

    sendNotification({
      audience: 'HR',
      category: 'Support',
      title: 'New Support Ticket Received',
      message: `${created.employeeName} opened ticket "${created.subject}" (${created.category}).`,
      targetPath: '/hr/help',
    });

    if (user && !user.token?.startsWith('demo_session_token_')) {
      supportApi
        .createTicket({
          employeeId: user.id,
          employeeName: user.name,
          category: ticketData.category,
          subject: ticketData.subject,
          description: ticketData.description,
        })
        .then(() => refresh(user))
        .catch((err) => console.warn('Add ticket API warning:', err));
    }

    return created;
  };

  const updateHelpTicketStatus = async (ticketId: string, status: HelpTicket['status'], responseNote = '') => {
    setHelpTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, responseNote } : t))
    );

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await supportApi.updateTicket(ticketId, status, responseNote);
        await refresh(user);
      } catch (err) {
        console.warn('Update ticket status API warning:', err);
      }
    }
  };

  const addEmployeeDocument = (docData: {
    title: string;
    category?: string;
    fileName?: string;
    size?: string;
    file?: any;
    employeeId?: string;
    employee?: string;
  }): EmployeeDocument => {
    const created: EmployeeDocument = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      employeeId: docData.employeeId || user?.employeeId || user?.id || 'EMP001',
      employee: docData.employee || user?.name || 'Arjun Mehta',
      title: docData.title,
      fileName: docData.fileName || `${docData.title.replace(/\s+/g, '_')}.pdf`,
      category: docData.category || 'General',
      size: docData.size || '1.5 MB',
      uploaded: new Date().toISOString().split('T')[0],
      status: 'Pending',
      file: docData.file,
    };

    setDocumentsList((prev) => [created, ...prev]);

    sendNotification({
      audience: 'HR',
      category: 'Documents',
      title: 'Document Uploaded for Verification',
      message: `${created.employee} uploaded ${created.title} (${created.category}).`,
      targetPath: '/hr/documents',
    });

    if (user && !user.token?.startsWith('demo_session_token_')) {
      (async () => {
        try {
          let fileId: string | undefined;
          if (docData.file instanceof File) {
            const uploadRes = await documentApi.uploadFile(docData.file);
            fileId = uploadRes.id;
          }
          await documentApi.createDocument({
            employeeId: user.id,
            employeeName: user.name,
            title: docData.title,
            fileName: docData.fileName || `${docData.title.replace(/\s+/g, '_')}.pdf`,
            category: docData.category,
            size: docData.size,
            fileId,
          });
          await refresh(user);
        } catch (err) {
          console.warn('Document upload API warning:', err);
        }
      })();
    }

    return created;
  };

  const removeEmployeeDocument = (docId: string) => {
    setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
  };

  const verifyEmployeeDocument = async (docId: string, newStatus: EmployeeDocument['status'] = 'Verified') => {
    setDocumentsList((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
    );

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await documentApi.verifyDocument(docId, newStatus);
        await refresh(user);
      } catch (err) {
        console.warn('Verify document API warning:', err);
      }
    }
  };

  const toggleCheckInOut = async () => {
    const isCheckingOut = todayAttendance.checkedIn && todayAttendance.checkOutTime === '—';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTodayAttendance((prev) => ({
      ...prev,
      checkedIn: !isCheckingOut,
      checkInTime: isCheckingOut ? prev.checkInTime : nowTime,
      checkOutTime: isCheckingOut ? nowTime : '—',
      status: isCheckingOut ? 'Checked Out' : 'Present',
      workingHours: isCheckingOut ? '8h 30m' : '0h 01m',
    }));

    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        if (isCheckingOut) {
          await attendanceApi.checkOut(user.id, user.name);
        } else {
          await attendanceApi.checkIn(user.id, user.name);
        }
        await refresh(user);
      } catch (err) {
        console.warn('Check in/out API warning:', err);
      }
    }
  };

  const requestAttendanceCorrection = async (data: {
    date: string;
    checkIn: string;
    checkOut: string;
    reason: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (user && !user.token?.startsWith('demo_session_token_')) {
      try {
        await attendanceApi.requestCorrection({
          employeeId: user.id,
          employeeName: user.name,
          date: data.date,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          reason: data.reason,
        });
        await refresh(user);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: getApiErrorMessage(err) };
      }
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        requestOtp,
        verifyOtp,
        refresh,
        leaveRequests,
        teamMembers,
        setTeamMembers,
        leaveBalances,
        helpTickets,
        documentsList,
        notificationsList,
        holidays,
        announcements,
        payslips,
        todayAttendance,
        handleApproveLeave,
        handleRejectLeave,
        handleAddLeaveRequest,
        addHelpTicket,
        updateHelpTicketStatus,
        addEmployeeDocument,
        verifyEmployeeDocument,
        removeEmployeeDocument,
        sendNotification,
        deleteNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toggleCheckInOut,
        requestAttendanceCorrection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
