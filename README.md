# Belnova HRMS Mobile Application

A native-quality, mobile-optimized Human Resource Management System (HRMS) built with **React**, **TypeScript**, **Ionic React UI**, and **Capacitor Android**.

This mobile project is built with 100% feature parity from the source web application (`HRMS_Application`), maintaining identical business logic, authentication behavior, role-based permissions, and API endpoints, presented in a touch-first mobile UI with a bottom navigation bar.

---

## 🚀 Key Features & Parity Summary

- **Authentication & Security**: Email/Username/ID login matching web authentication, JWT token storage, automatic session restoration, and role detection.
- **Role-Based Experience**:
  - **HR Admin (`hr`)**: Executive Dashboard, Organization Chart, Employee Management (Add, Edit, View), Attendance Log, Leave Approvals, Payroll Processing, Recruitment Postings, Access Control Roles & Permissions, Custom Reports & Excel Exports, Document Verification, Biometric Device Integration, Broadcast Notifications, System Settings, and Helpdesk Ticket Resolution.
  - **Manager (`manager`)**: Team Lead Dashboard, Direct Reports Roster, Real-Time Team Attendance Punch Log, Pending Leave Approvals & Rejections, Department Performance Analytics, Manager Alerts, and Support.
  - **Employee (`employee`)**: Mobile Dashboard, Employee Self-Service Profile, One-Touch Clock-In / Clock-Out, Leave Requests & Balance Counter, Monthly Payslip PDF Downloads, Document Uploads, Company Holiday Calendar, Announcements, Expense Claims & Requests, and Support Desk Tickets.
- **Mobile Presentation**:
  - Role-specific **Bottom Navigation Bar** + **"More" Screen/Drawer**.
  - Desktop data tables converted into high-touch **Mobile Cards**, **Filter Sheets**, and **Expandable Lists**.
  - Safe-area inset handling for notch and navigation bar padding on Android devices.

---

## 📁 Project Directory Structure

```
HRMS_Mobile/
├── android/                        # Native Android Studio Gradle Project
├── dist/                           # Compiled production web bundle
├── public/                         # Public assets & manifest
├── src/
│   ├── api/                        # Axios instance & endpoints mirroring web app
│   │   ├── client.ts
│   │   └── payrollApi.ts
│   ├── components/                 # Reusable UI components
│   │   ├── ActionModal/
│   │   ├── AppHeader/
│   │   ├── BottomNavigation/
│   │   ├── EmployeeCard/
│   │   ├── LeaveCard/
│   │   ├── StatCard/
│   │   └── ProtectedRoute.tsx
│   ├── context/                    # AuthContext with 100% state logic parity
│   │   └── AuthContext.tsx
│   ├── data/                       # Initial mock datasets matching mockAuthData.js
│   │   └── mockData.ts
│   ├── navigation/                 # Ionic React Router & tab bar routing
│   │   └── AppRouter.tsx
│   ├── screens/                    # Clean modular screens with component CSS
│   │   ├── Login/
│   │   ├── Dashboard/ (HR, Manager, Employee)
│   │   ├── HRAdmin/ (14 screens)
│   │   ├── Manager/ (6 screens)
│   │   ├── Employee/ (9 screens)
│   │   └── Shared/ (MoreScreen)
│   ├── styles/                     # Design tokens & mobile CSS rules
│   │   ├── variables.css
│   │   ├── theme.css
│   │   └── global.css
│   ├── types/                      # TypeScript definitions for entities & state
│   │   └── index.ts
│   ├── utils/                      # Excel export, date, and formatting utilities
│   │   └── exportUtils.ts
│   ├── App.tsx
│   └── main.tsx
├── capacitor.config.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Developer Setup & Commands

### 1. Installation
Run npm install to restore node modules:
```bash
npm install
```

### 2. Run Locally in Browser
Start Vite development server:
```bash
npm run dev
```

### 3. Build Web Bundle
Compile TypeScript and Vite production bundle:
```bash
npm run build
```

### 4. Sync Capacitor Android Project
Synchronize compiled assets and configuration to the native Android project:
```bash
npx cap sync android
```

### 5. Open in Android Studio
Open the `android/` directory directly in Android Studio:
```bash
npx cap open android
```
*Or open `c:\Users\Manikantha.N\AndroidStudioProjects\HRMS Mobile\android` inside Android Studio.*

### 6. Run on Android Emulator / Physical Device
- Connect an Android phone via USB (with USB Debugging enabled) or start an Android Emulator in Android Studio.
- Press **Run 'app'** in Android Studio, or execute:
```bash
npx cap run android
```

---

## 🔑 Demo Login Credentials

You can log into any of the 3 roles using the following credentials or quick-chips on the login screen:

| Role | Username / Email | Password | Allowed Modules |
|---|---|---|---|
| **HR Admin** | `admin@hr.com` | `password123` | Full HR Executive Suite |
| **Manager** | `manager@belnova.com` | `password123` | Team Management & Approvals |
| **Employee** | `arjun@belnova.com` | `password123` | Employee Self-Service Portal |

---

## ❓ Troubleshooting

1. **Android Studio SDK Error**: Ensure Android SDK 34/35 and Build Tools are installed in Android Studio -> SDK Manager.
2. **Capacitor Sync Failure**: Make sure to run `npm run build` prior to running `npx cap sync android`.
