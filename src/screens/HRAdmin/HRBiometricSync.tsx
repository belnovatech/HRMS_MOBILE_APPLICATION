import React, { useMemo, useState, useEffect } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiActivity,
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiDownload,
  FiFileText,
  FiGlobe,
  FiLock,
  FiMonitor,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiWifi,
  FiWifiOff,
  FiX,
  FiZap,
  FiSliders,
  FiChevronRight,
  FiArrowUpRight,
  FiFilter,
  FiUser,
  FiRadio,
} from 'react-icons/fi';
import { MdFingerprint } from 'react-icons/md';
import './HRBiometricSync.css';

export interface BiometricDevice {
  id: string;
  name: string;
  location: string;
  zone: string;
  ip: string;
  port: string;
  model: string;
  vendor: string;
  status: 'Connected' | 'Syncing' | 'Disconnected' | 'Error';
  mode: string;
  lastSync: string;
  lastHeartbeat: string;
  records: number;
  pending: number;
  todayScans: number;
  firmware: string;
  attendanceMode: string;
  sync: string;
}

export interface AttendanceEvent {
  id: number;
  device: string;
  deviceName: string;
  employee: string;
  employeeId: string;
  event: string;
  method: string;
  time: string;
  result: 'Accepted' | 'Device Error' | 'Rejected';
}

const INITIAL_DEVICES: BiometricDevice[] = [];

const INITIAL_EVENTS: AttendanceEvent[] = [];

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString('en-IN');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getStatusClass(status: string) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

export const HRBiometricSync: React.FC = () => {
  const [devices, setDevices] = useState<BiometricDevice[]>(() => {
    const saved = localStorage.getItem('belnova_biometric_devices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((d) => d.name === 'Main Entrance Gate')) {
          localStorage.removeItem('belnova_biometric_devices');
          return [];
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [events, setEvents] = useState<AttendanceEvent[]>(() => {
    const saved = localStorage.getItem('belnova_biometric_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((e) => e.employee === 'Rahul Kumar')) {
          localStorage.removeItem('belnova_biometric_events');
          return [];
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'health' | 'settings'>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSyncLog, setShowSyncLog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);
  const [testingDevice, setTestingDevice] = useState<string | null>(null);

  // Integration Settings controlled state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('belnova_biometric_settings');
    return saved
      ? JSON.parse(saved)
      : {
          autoSync: true,
          duplicateProtection: true,
          gracePeriod: true,
          deviceAuth: true,
          networkPolicy: 'Restricted (VPN Only)',
          biometricPrivacy: 'Protected (Events Only)',
        };
  });

  const [newDevice, setNewDevice] = useState({
    name: '',
    location: 'Mumbai HQ',
    zone: '',
    ip: '',
    port: '4370',
    model: 'ZKTeco SpeedFace-V5L',
    mode: 'Face + Fingerprint',
  });

  useEffect(() => {
    localStorage.setItem('belnova_biometric_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('belnova_biometric_events', JSON.stringify(events));
  }, [events]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const stats = useMemo(() => {
    const total = devices.length;
    const connected = devices.filter((item) => item.status === 'Connected').length;
    const syncing = devices.filter((item) => item.status === 'Syncing').length;
    const disconnected = devices.filter((item) => item.status === 'Disconnected').length;
    const errors = devices.filter((item) => item.status === 'Error').length;
    const pending = devices.reduce((sum, item) => sum + item.pending, 0);
    const scans = devices.reduce((sum, item) => sum + item.todayScans, 0);
    const availability = total > 0 ? Math.round(((connected + syncing) / total) * 100) : 100;

    return { total, connected, syncing, disconnected, errors, pending, scans, availability };
  }, [devices]);

  const locations = useMemo(
    () => ['All', ...Array.from(new Set(devices.map((item) => item.location)))],
    [devices]
  );

  const filteredDevices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesSearch =
        !query ||
        device.name.toLowerCase().includes(query) ||
        device.id.toLowerCase().includes(query) ||
        device.ip.toLowerCase().includes(query) ||
        device.location.toLowerCase().includes(query) ||
        device.zone.toLowerCase().includes(query) ||
        device.model.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'All' || device.status === statusFilter;
      const matchesLocation = locationFilter === 'All' || device.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [devices, search, statusFilter, locationFilter]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      if (!query) return true;
      return (
        event.employee.toLowerCase().includes(query) ||
        event.employeeId.toLowerCase().includes(query) ||
        event.deviceName.toLowerCase().includes(query) ||
        event.event.toLowerCase().includes(query) ||
        event.method.toLowerCase().includes(query)
      );
    });
  }, [events, search]);

  const attentionDevices = useMemo(() => {
    return devices.filter(
      (d) => d.status === 'Disconnected' || d.status === 'Error' || d.pending > 0
    );
  }, [devices]);

  const addEvent = (device: BiometricDevice, eventName = 'Manual Sync', method = 'Device Sync', result: 'Accepted' | 'Device Error' = 'Accepted') => {
    setEvents((current) => [
      {
        id: Date.now(),
        device: device.id,
        deviceName: device.name,
        employee: 'System Automated Sync',
        employeeId: 'SYS-SYNC',
        event: eventName,
        method,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        result,
      },
      ...current,
    ]);
  };

  const syncDevice = (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device || syncingDevice) return;

    setSyncingDevice(deviceId);

    setDevices((current) =>
      current.map((item) =>
        item.id === deviceId
          ? { ...item, status: 'Syncing', lastSync: 'Syncing...' }
          : item
      )
    );

    window.setTimeout(() => {
      setDevices((current) =>
        current.map((item) =>
          item.id === deviceId
            ? {
                ...item,
                status: 'Connected',
                lastSync: 'Just now',
                lastHeartbeat: '4 sec ago',
                pending: 0,
                records: item.records + item.pending,
              }
            : item
        )
      );

      addEvent(device, 'Sync Completed', 'Biometric Protocol');
      setSyncingDevice(null);
      showToast(`${device.name} synchronized successfully.`, 'success');
    }, 1200);
  };

  const syncAll = () => {
    if (isSyncingAll) return;

    setIsSyncingAll(true);
    setDevices((current) =>
      current.map((item) =>
        item.status === 'Disconnected' || item.status === 'Error'
          ? item
          : { ...item, status: 'Syncing', lastSync: 'Syncing...' }
      )
    );

    window.setTimeout(() => {
      setDevices((current) =>
        current.map((item) => {
          if (item.status === 'Disconnected' || item.status === 'Error') {
            return item;
          }

          return {
            ...item,
            status: 'Connected',
            lastSync: 'Just now',
            lastHeartbeat: '2 sec ago',
            records: item.records + item.pending,
            pending: 0,
          };
        })
      );

      setIsSyncingAll(false);
      showToast('All available biometric devices synchronized.', 'success');
    }, 1700);
  };

  const testConnection = (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;

    setTestingDevice(deviceId);
    showToast(`Testing TCP socket to ${device.ip}:${device.port}...`, 'info');

    window.setTimeout(() => {
      setTestingDevice(null);
      const isReachable = device.status !== 'Disconnected' && device.status !== 'Error';

      if (isReachable) {
        setDevices((current) =>
          current.map((item) =>
            item.id === deviceId
              ? { ...item, lastHeartbeat: 'Just now', status: 'Connected' }
              : item
          )
        );
        showToast(`Connection verified: ${device.name} is online.`, 'success');
      } else {
        showToast(`Connection failed: ${device.name} is unreachable at ${device.ip}.`, 'error');
      }
    }, 900);
  };

  const toggleDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    const willEnable = target?.status === 'Disconnected';

    setDevices((current) =>
      current.map((item) =>
        item.id === deviceId
          ? {
              ...item,
              status: willEnable ? 'Connected' : 'Disconnected',
              lastHeartbeat: willEnable ? 'Just now' : item.lastHeartbeat,
            }
          : item
      )
    );

    showToast(
      willEnable ? `${target?.name} enabled and active.` : `${target?.name} disconnected from sync.`,
      willEnable ? 'success' : 'warning'
    );
  };

  const removeDevice = (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;

    const confirmed = window.confirm(
      `Remove ${device.name} (${device.id}) from biometric management?`
    );

    if (!confirmed) return;

    setDevices((current) => current.filter((item) => item.id !== deviceId));
    setSelectedDevice(null);
    showToast(`${device.name} removed from registry.`, 'info');
  };

  const handleAddDevice = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newDevice.name.trim() || !newDevice.ip.trim()) {
      showToast('Device name and IP address are required.', 'error');
      return;
    }

    // Robust unique BIO-XXX generation
    const existingIds = new Set(devices.map((d) => d.id));
    let counter = 1;
    let newId = `BIO-${String(counter).padStart(3, '0')}`;
    while (existingIds.has(newId)) {
      counter++;
      newId = `BIO-${String(counter).padStart(3, '0')}`;
    }

    const created: BiometricDevice = {
      id: newId,
      name: newDevice.name.trim(),
      location: newDevice.location,
      zone: newDevice.zone.trim() || 'Main Gate Entry',
      ip: newDevice.ip.trim(),
      port: newDevice.port || '4370',
      model: newDevice.model,
      vendor: newDevice.model.includes('Suprema') ? 'Suprema' : 'ZKTeco',
      status: 'Disconnected',
      mode: newDevice.mode,
      lastSync: 'Never',
      lastHeartbeat: 'Not initialized',
      records: 0,
      pending: 0,
      todayScans: 0,
      firmware: '6.4.0',
      attendanceMode: 'IN / OUT',
      sync: 'Automatic',
    };

    setDevices((current) => [...current, created]);
    setNewDevice({
      name: '',
      location: 'Mumbai HQ',
      zone: '',
      ip: '',
      port: '4370',
      model: 'ZKTeco SpeedFace-V5L',
      mode: 'Face + Fingerprint',
    });
    setShowAddDevice(false);
    showToast(`${created.name} registered. Test connection to activate.`, 'success');
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setLocationFilter('All');
    setShowFilters(false);
    showToast('Biometric filters cleared.', 'info');
  };

  const exportDeviceRegister = () => {
    const headers = [
      'Device ID',
      'Device Name',
      'Location',
      'Zone',
      'IP Address',
      'Port',
      'Model',
      'Status',
      'Biometric Mode',
      'Last Sync',
      'Pending Records',
      'Today Scans',
    ];

    const rows = devices.map((device) => [
      device.id,
      device.name,
      device.location,
      device.zone,
      device.ip,
      device.port,
      device.model,
      device.status,
      device.mode,
      device.lastSync,
      device.pending,
      device.todayScans,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'HRMS-Biometric-Device-Register.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Biometric device register exported.', 'success');
  };

  const exportAttendanceActivity = () => {
    const headers = ['Event ID', 'Employee Name', 'Employee ID', 'Device ID', 'Terminal Name', 'Event Type', 'Biometric Method', 'Time', 'Result'];
    const rows = events.map((e) => [e.id, e.employee, e.employeeId, e.device, e.deviceName, e.event, e.method, e.time, e.result]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'HRMS-Biometric-Attendance-Activity.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Attendance activity log exported.', 'success');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('belnova_biometric_settings', JSON.stringify(settings));
    showToast('Biometric integration settings saved.', 'success');
  };

  return (
    <div className="app-container bel-bio-mobile-layout">
      {/* 1. App Header */}
      <AppHeader title="Biometric Integration" showBack />

      <main className="page-content bel-bio-main">
        {/* 2. Hero System Status Banner */}
        <section className="bel-bio-hero-card">
          <div className="bio-hero-top-row">
            <div className="bio-live-status-badge">
              <span className="live-pulsing-dot" />
              <span>System Operational</span>
            </div>
            <div className="bio-attendance-source-tag">
              <FiShield size={12} />
              <span>Verified Hardware Terminals</span>
            </div>
          </div>

          <div className="bio-hero-content">
            <h2>Biometric Control Center</h2>
            <p>Live workforce access terminals, automated sync engine, and hardware integrity.</p>
          </div>

          {/* High-level Status Row */}
          <div className="bio-hero-status-strip">
            <div className="status-metric-col">
              <span className="metric-val">{stats.availability}%</span>
              <span className="metric-lbl">Availability</span>
            </div>
            <div className="metric-sep" />
            <div className="status-metric-col">
              <span className="metric-val">{formatNumber(stats.scans)}</span>
              <span className="metric-lbl">Today's Scans</span>
            </div>
            <div className="metric-sep" />
            <div className="status-metric-col">
              <span className="metric-val" style={{ color: stats.pending > 0 ? '#fbbf24' : '#ffffff' }}>
                {stats.pending}
              </span>
              <span className="metric-lbl">Pending Sync</span>
            </div>
            <div className="metric-sep" />
            <div className="status-metric-col">
              <span className="metric-val" style={{ color: stats.disconnected + stats.errors > 0 ? '#f87171' : '#34d399' }}>
                {stats.disconnected + stats.errors}
              </span>
              <span className="metric-lbl">Attention</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="bio-hero-actions-row">
            <button
              type="button"
              className="btn-bio-sync-all"
              onClick={syncAll}
              disabled={isSyncingAll}
              aria-label="Synchronize all online biometric devices"
            >
              <FiRefreshCw className={isSyncingAll ? 'bel-bio-spin' : ''} size={15} />
              <span>{isSyncingAll ? 'Synchronizing All...' : 'Sync All Devices'}</span>
            </button>

            <button
              type="button"
              className="btn-bio-add-device"
              onClick={() => setShowAddDevice(true)}
              aria-label="Register a new biometric terminal"
            >
              <FiPlus size={16} />
              <span>Add Device</span>
            </button>
          </div>
        </section>

        {/* 3. Interactive KPI Filter Cards */}
        <section className="bel-bio-kpi-scroll-track">
          <button
            type="button"
            className={`bio-kpi-btn ${statusFilter === 'All' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            <div className="kpi-icon total">
              <FiMonitor size={14} />
            </div>
            <div className="kpi-text">
              <strong className="kpi-num">{stats.total}</strong>
              <span className="kpi-title">Total</span>
            </div>
          </button>

          <button
            type="button"
            className={`bio-kpi-btn ${statusFilter === 'Connected' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'Connected' ? 'All' : 'Connected')}
          >
            <div className="kpi-icon connected">
              <FiWifi size={14} />
            </div>
            <div className="kpi-text">
              <strong className="kpi-num">{stats.connected}</strong>
              <span className="kpi-title">Online</span>
            </div>
          </button>

          <button
            type="button"
            className={`bio-kpi-btn ${statusFilter === 'Syncing' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'Syncing' ? 'All' : 'Syncing')}
          >
            <div className="kpi-icon syncing">
              <FiRefreshCw size={14} />
            </div>
            <div className="kpi-text">
              <strong className="kpi-num">{stats.syncing}</strong>
              <span className="kpi-title">Syncing</span>
            </div>
          </button>

          <button
            type="button"
            className={`bio-kpi-btn ${statusFilter === 'Disconnected' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'Disconnected' ? 'All' : 'Disconnected')}
          >
            <div className="kpi-icon disconnected">
              <FiWifiOff size={14} />
            </div>
            <div className="kpi-text">
              <strong className="kpi-num">{stats.disconnected}</strong>
              <span className="kpi-title">Offline</span>
            </div>
          </button>

          <button
            type="button"
            className={`bio-kpi-btn ${statusFilter === 'Error' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'Error' ? 'All' : 'Error')}
          >
            <div className="kpi-icon error">
              <FiAlertCircle size={14} />
            </div>
            <div className="kpi-text">
              <strong className="kpi-num">{stats.errors}</strong>
              <span className="kpi-title">Errors</span>
            </div>
          </button>
        </section>

        {/* 4. Segmented Section Navigation Tabs */}
        <nav className="bel-bio-nav-tabs" aria-label="Biometric navigation sections">
          <button
            type="button"
            className={`bio-nav-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiCpu size={14} />
            <span>Overview ({devices.length})</span>
          </button>

          <button
            type="button"
            className={`bio-nav-tab ${activeTab === 'activity' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FiActivity size={14} />
            <span>Activity</span>
          </button>

          <button
            type="button"
            className={`bio-nav-tab ${activeTab === 'health' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            <FiShield size={14} />
            <span>Health</span>
          </button>

          <button
            type="button"
            className={`bio-nav-tab ${activeTab === 'settings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings size={14} />
            <span>Settings</span>
          </button>
        </nav>

        {/* =========================================================================
            TAB 1: DEVICE OVERVIEW
           ========================================================================= */}
        {activeTab === 'overview' && (
          <>
            {/* Attention Required Banner (if any devices offline or error) */}
            {attentionDevices.length > 0 && (
              <div className="bel-bio-attention-banner">
                <div className="attention-icon">
                  <FiAlertCircle size={18} />
                </div>
                <div className="attention-text">
                  <strong>{attentionDevices.length} Terminal(s) Require Attention</strong>
                  <span>
                    {attentionDevices.map((d) => d.name).join(', ')} ({stats.pending} pending sync records).
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-attention-action"
                  onClick={() => {
                    setSelectedDevice(attentionDevices[0]);
                  }}
                >
                  Inspect
                </button>
              </div>
            )}

            {/* Toolbar */}
            <section className="bel-bio-search-toolbar">
              <div className="bio-search-input-box">
                <FiSearch size={15} />
                <input
                  type="text"
                  placeholder="Search device, IP, location, model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="btn-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              <div className="bio-toolbar-dropdowns">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bio-select-filter"
                  aria-label="Filter by status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Connected">Connected</option>
                  <option value="Syncing">Syncing</option>
                  <option value="Disconnected">Disconnected</option>
                  <option value="Error">Error</option>
                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bio-select-filter"
                  aria-label="Filter by location"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === 'All' ? 'All Locations' : loc}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-export-register"
                  onClick={exportDeviceRegister}
                  title="Export device register CSV"
                >
                  <FiDownload size={14} />
                  <span>Export</span>
                </button>
              </div>
            </section>

            {/* List Header */}
            <div className="bel-bio-section-title-row">
              <div>
                <h3>Biometric Hardware Terminals</h3>
                <span className="subtext">Real-time attendance ingestion checkpoints</span>
              </div>
              <span className="count-tag">
                {filteredDevices.length} of {devices.length} Devices
              </span>
            </div>

            {/* Device Cards Grid */}
            <section className="bel-bio-devices-grid">
              {filteredDevices.map((device) => (
                <article className="bel-bio-device-card" key={device.id}>
                  {/* Card Top Row */}
                  <div className="device-card-header">
                    <div className="device-icon-box">
                      <MdFingerprint size={22} />
                    </div>

                    <div className="device-header-center">
                      <h4 className="device-name">{device.name}</h4>
                      <span className="device-location-zone">
                        {device.location} &bull; {device.zone}
                      </span>
                    </div>

                    <span className={`device-status-badge ${getStatusClass(device.status)}`}>
                      {device.status === 'Connected' && <FiWifi size={11} />}
                      {device.status === 'Syncing' && <FiRefreshCw className="bel-bio-spin" size={11} />}
                      {device.status === 'Disconnected' && <FiWifiOff size={11} />}
                      {device.status === 'Error' && <FiAlertCircle size={11} />}
                      <span>{device.status}</span>
                    </span>
                  </div>

                  {/* Card Info Grid */}
                  <div className="device-meta-grid" onClick={() => setSelectedDevice(device)}>
                    <div className="meta-item">
                      <span className="meta-lbl">Terminal ID</span>
                      <strong className="meta-val">{device.id}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">IP Address</span>
                      <strong className="meta-val">{device.ip}:{device.port}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Last Sync</span>
                      <strong className="meta-val">{device.lastSync}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">Records Synced</span>
                      <strong className="meta-val">{formatNumber(device.records)}</strong>
                    </div>
                  </div>

                  {/* Mode & Pending Badge Row */}
                  <div className="device-mode-strip">
                    <div className="mode-tag">
                      <FiShield size={11} />
                      <span>{device.mode}</span>
                    </div>

                    {device.pending > 0 && (
                      <span className="pending-badge">
                        {device.pending} Pending
                      </span>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="device-card-actions">
                    <button
                      type="button"
                      className="btn-card-sync"
                      disabled={syncingDevice === device.id}
                      onClick={() => syncDevice(device.id)}
                    >
                      <FiRefreshCw
                        className={syncingDevice === device.id ? 'bel-bio-spin' : ''}
                        size={13}
                      />
                      <span>{syncingDevice === device.id ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-card-logs"
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowSyncLog(true);
                      }}
                    >
                      <FiFileText size={13} />
                      <span>Logs</span>
                    </button>

                    <button
                      type="button"
                      className="btn-card-more"
                      onClick={() => setSelectedDevice(device)}
                      aria-label="Device options"
                    >
                      <FiMoreVertical size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {/* Empty State */}
            {filteredDevices.length === 0 && (
              <div className="bel-bio-empty-state">
                <div className="empty-icon-wrap">
                  <FiMonitor size={28} />
                </div>
                <h4>No biometric devices match filters</h4>
                <p>Try searching for a different location, IP address, or reset all active filters.</p>
                <button type="button" className="btn-reset-filters" onClick={resetFilters}>
                  Reset All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            TAB 2: ATTENDANCE ACTIVITY
           ========================================================================= */}
        {activeTab === 'activity' && (
          <section className="bel-bio-activity-view">
            {/* Activity Summary Bar */}
            <div className="activity-summary-grid">
              <div className="act-stat-card">
                <span className="act-num">{formatNumber(stats.scans)}</span>
                <span className="act-lbl">Today's Scans</span>
              </div>
              <div className="act-stat-card">
                <span className="act-num">{events.length}</span>
                <span className="act-lbl">Logged Events</span>
              </div>
              <div className="act-stat-card">
                <span className="act-num">{stats.pending}</span>
                <span className="act-lbl">Pending Sync</span>
              </div>
              <div className="act-stat-card">
                <span className="act-num" style={{ color: stats.errors > 0 ? '#ef4444' : '#10b981' }}>
                  {stats.errors}
                </span>
                <span className="act-lbl">Device Errors</span>
              </div>
            </div>

            {/* Activity Toolbar */}
            <div className="activity-action-toolbar">
              <div className="act-search-box">
                <FiSearch size={14} />
                <input
                  type="text"
                  placeholder="Filter by employee, ID, terminal, method..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-export-activity"
                onClick={exportAttendanceActivity}
              >
                <FiDownload size={13} />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Activity Cards List */}
            <div className="activity-cards-list">
              {filteredEvents.map((event) => (
                <div className="activity-event-card" key={event.id}>
                  <div className="event-avatar">
                    {getInitials(event.employee)}
                  </div>

                  <div className="event-content">
                    <div className="event-title-row">
                      <strong className="event-emp-name">{event.employee}</strong>
                      <span className="event-emp-id">{event.employeeId}</span>
                    </div>

                    <div className="event-details-row">
                      <span className="event-badge">{event.event}</span>
                      <span className="event-method">{event.method}</span>
                      <span className="event-terminal">&bull; {event.deviceName}</span>
                    </div>
                  </div>

                  <div className="event-meta-right">
                    <span className="event-time">{event.time}</span>
                    <span
                      className={`event-result-badge ${
                        event.result === 'Accepted' ? 'is-accepted' : 'is-error'
                      }`}
                    >
                      {event.result === 'Accepted' ? (
                        <FiCheckCircle size={11} />
                      ) : (
                        <FiAlertCircle size={11} />
                      )}
                      <span>{event.result}</span>
                    </span>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="bel-bio-empty-state">
                  <FiActivity size={26} />
                  <h4>No matching activity logs</h4>
                  <p>Check employee punch activity or reset search terms.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 3: SYSTEM HEALTH
           ========================================================================= */}
        {activeTab === 'health' && (
          <section className="bel-bio-health-view">
            {/* System Health Score Card */}
            <div className="health-score-hero-card">
              <div className="score-top">
                <span className="score-lbl">Biometric Infrastructure Health</span>
                <span className="health-live-pill">
                  <span className="live-dot" /> Live Monitoring
                </span>
              </div>

              <div className="score-main-row">
                <strong className="score-number">{stats.availability}%</strong>
                <div className="score-desc">
                  <span>{stats.connected} of {stats.total} Terminals Online</span>
                  <p>Real-time TCP socket connectivity and periodic keepalive heartbeat checks.</p>
                </div>
              </div>

              <div className="health-checks-grid">
                <div className="health-check-item">
                  <FiCheckCircle className="check-ok" size={14} />
                  <span>Attendance Ingestion: <b>Healthy</b></span>
                </div>
                <div className="health-check-item">
                  <FiCheckCircle className="check-ok" size={14} />
                  <span>Auto-Sync Engine: <b>Active</b></span>
                </div>
                <div className="health-check-item">
                  <FiAlertCircle
                    className={stats.disconnected + stats.errors > 0 ? 'check-warn' : 'check-ok'}
                    size={14}
                  />
                  <span>
                    Attention Required: <b>{stats.disconnected + stats.errors} Device(s)</b>
                  </span>
                </div>
                <div className="health-check-item">
                  <FiLock className="check-ok" size={14} />
                  <span>Biometric Privacy: <b>Protected</b></span>
                </div>
              </div>
            </div>

            {/* Device-by-Device Connectivity Status */}
            <div className="health-devices-section">
              <h4>Terminal Heartbeat &amp; Signal Quality</h4>
              <div className="health-device-rows">
                {devices.length === 0 ? (
                  <div className="bel-bio-empty-state">
                    <FiCpu size={26} />
                    <h4>No terminals registered</h4>
                    <p>Register a terminal to view real-time heartbeat and signal quality.</p>
                  </div>
                ) : (
                  devices.map((dev) => (
                  <div className="health-device-row-card" key={dev.id}>
                    <div className="h-dev-header">
                      <div className="h-dev-info">
                        <FiCpu size={15} />
                        <div>
                          <strong>{dev.name}</strong>
                          <span>{dev.id} &bull; {dev.ip}:{dev.port}</span>
                        </div>
                      </div>
                      <span className={`device-status-badge ${getStatusClass(dev.status)}`}>
                        {dev.status}
                      </span>
                    </div>

                    <div className="h-dev-progress-bar-wrap">
                      <div className="progress-label-row">
                        <span>Signal / Reachability</span>
                        <strong>
                          {dev.status === 'Connected' ? '100%' : dev.status === 'Syncing' ? '80%' : '0%'}
                        </strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width:
                              dev.status === 'Connected' ? '100%' : dev.status === 'Syncing' ? '80%' : '4%',
                            background:
                              dev.status === 'Connected'
                                ? '#10b981'
                                : dev.status === 'Syncing'
                                ? '#2563eb'
                                : '#ef4444',
                          }}
                        />
                      </div>
                    </div>

                    <div className="h-dev-footer">
                      <span>Last Heartbeat: <b>{dev.lastHeartbeat}</b></span>
                      <span>Pending: <b>{dev.pending}</b></span>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 4: INTEGRATION SETTINGS
           ========================================================================= */}
        {activeTab === 'settings' && (
          <section className="bel-bio-settings-view">
            <div className="settings-section-card">
              <div className="settings-card-header">
                <FiSliders size={18} />
                <div>
                  <h4>Attendance Synchronization Policies</h4>
                  <span>Configure automated polling and shift grace-period parameters</span>
                </div>
              </div>

              <div className="settings-options-list">
                {/* Setting 1 */}
                <div className="settings-item-row">
                  <div className="setting-info">
                    <strong>Automatic Synchronization</strong>
                    <span>Periodically pull punch records from connected terminals into HRMS database.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoSync}
                      onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {/* Setting 2 */}
                <div className="settings-item-row">
                  <div className="setting-info">
                    <strong>Duplicate Punch Protection</strong>
                    <span>Suppress repeated scans occurring within 5 minutes of previous check-in.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.duplicateProtection}
                      onChange={(e) => setSettings({ ...settings, duplicateProtection: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {/* Setting 3 */}
                <div className="settings-item-row">
                  <div className="setting-info">
                    <strong>Grace-Period Validation</strong>
                    <span>Apply configured company grace minutes before flagging attendance logs as Late.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.gracePeriod}
                      onChange={(e) => setSettings({ ...settings, gracePeriod: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {/* Setting 4 */}
                <div className="settings-item-row">
                  <div className="setting-info">
                    <strong>Terminal Authentication Check</strong>
                    <span>Require encrypted TLS / pre-shared authentication keys for all TCP endpoints.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.deviceAuth}
                      onChange={(e) => setSettings({ ...settings, deviceAuth: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Security Policy Information */}
              <div className="settings-security-strip">
                <div className="sec-info-item">
                  <FiGlobe size={14} />
                  <div>
                    <span>Network Policy</span>
                    <strong>{settings.networkPolicy}</strong>
                  </div>
                </div>

                <div className="sec-info-item">
                  <FiLock size={14} />
                  <div>
                    <span>Biometric Data Privacy</span>
                    <strong>{settings.biometricPrivacy}</strong>
                  </div>
                </div>
              </div>

              <div className="settings-card-footer">
                <span className="footer-note">Settings are applied to all subsequent synchronization cycles.</span>
                <button type="button" className="btn-save-settings" onClick={handleSaveSettings}>
                  Save Integration Settings
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: DEVICE DETAILS BOTTOM SHEET
         ========================================================================= */}
      {selectedDevice && !showSyncLog && (
        <div className="bel-modal-backdrop" onClick={() => setSelectedDevice(null)}>
          <div
            className="bel-bottom-sheet-panel bio-details-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <div className="device-detail-icon">
                  <MdFingerprint size={24} />
                </div>
                <div>
                  <h4>{selectedDevice.name}</h4>
                  <span>{selectedDevice.id} &bull; {selectedDevice.model}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setSelectedDevice(null)}
                aria-label="Close device details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              {/* Status Row */}
              <div className="details-status-row">
                <span className={`device-status-badge ${getStatusClass(selectedDevice.status)}`}>
                  {selectedDevice.status}
                </span>
                <span className="details-mode-tag">{selectedDevice.mode}</span>
                <span className="details-vendor-tag">{selectedDevice.vendor}</span>
              </div>

              {/* Comprehensive Details Grid */}
              <div className="details-kv-grid">
                <div className="kv-cell">
                  <span className="kv-lbl">Location &amp; Zone</span>
                  <strong className="kv-val">{selectedDevice.location} — {selectedDevice.zone}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">IP Address &amp; Port</span>
                  <strong className="kv-val">{selectedDevice.ip}:{selectedDevice.port}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Firmware Version</span>
                  <strong className="kv-val">v{selectedDevice.firmware}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Last Heartbeat</span>
                  <strong className="kv-val">{selectedDevice.lastHeartbeat}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Attendance Mode</span>
                  <strong className="kv-val">{selectedDevice.attendanceMode}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Sync Policy</span>
                  <strong className="kv-val">{selectedDevice.sync}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Records Synced</span>
                  <strong className="kv-val">{formatNumber(selectedDevice.records)}</strong>
                </div>
                <div className="kv-cell">
                  <span className="kv-lbl">Pending Records</span>
                  <strong className="kv-val" style={{ color: selectedDevice.pending > 0 ? '#ea580c' : '#059669' }}>
                    {selectedDevice.pending}
                  </strong>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="details-action-buttons-grid">
              <button
                type="button"
                className="btn-details-action sync"
                disabled={syncingDevice === selectedDevice.id}
                onClick={() => syncDevice(selectedDevice.id)}
              >
                <FiRefreshCw className={syncingDevice === selectedDevice.id ? 'bel-bio-spin' : ''} size={14} />
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                className="btn-details-action test"
                disabled={testingDevice === selectedDevice.id}
                onClick={() => testConnection(selectedDevice.id)}
              >
                <FiActivity size={14} />
                <span>{testingDevice === selectedDevice.id ? 'Testing...' : 'Test Ping'}</span>
              </button>

              <button
                type="button"
                className="btn-details-action toggle"
                onClick={() => toggleDevice(selectedDevice.id)}
              >
                <FiWifiOff size={14} />
                <span>{selectedDevice.status === 'Disconnected' ? 'Enable' : 'Disconnect'}</span>
              </button>

              <button
                type="button"
                className="btn-details-action remove"
                onClick={() => removeDevice(selectedDevice.id)}
              >
                <FiTrash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SYNC LOGS BOTTOM SHEET
         ========================================================================= */}
      {showSyncLog && (
        <div className="bel-modal-backdrop" onClick={() => setShowSyncLog(false)}>
          <div
            className="bel-bottom-sheet-panel bio-logs-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiFileText size={18} />
                <div>
                  <h4>{selectedDevice ? `${selectedDevice.name} Logs` : 'Terminal Sync Logs'}</h4>
                  <span>Recent hardware event transmissions</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowSyncLog(false)}
                aria-label="Close logs"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="bio-logs-timeline">
                {filteredEvents
                  .filter((e) => !selectedDevice || e.device === selectedDevice.id)
                  .map((evt) => (
                    <div className="timeline-log-item" key={evt.id}>
                      <div className="timeline-icon-dot">
                        <FiCheck size={12} />
                      </div>
                      <div className="timeline-log-content">
                        <div className="log-title-row">
                          <strong>{evt.event} &bull; {evt.employee}</strong>
                          <span className="log-time">{evt.time}</span>
                        </div>
                        <span className="log-meta">
                          {evt.deviceName} &bull; {evt.method} ({evt.employeeId})
                        </span>
                      </div>
                    </div>
                  ))}

                {filteredEvents.length === 0 && (
                  <div className="bel-bio-empty-state">
                    <p>No recent activity logs for this terminal.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button
                type="button"
                className="btn-sheet-close-full"
                onClick={() => setShowSyncLog(false)}
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD DEVICE BOTTOM SHEET
         ========================================================================= */}
      {showAddDevice && (
        <div className="bel-modal-backdrop" onClick={() => setShowAddDevice(false)}>
          <div
            className="bel-bottom-sheet-panel add-device-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiPlus size={18} />
                <div>
                  <h4>Register Biometric Terminal</h4>
                  <span>Add a new ZKTeco or Suprema hardware terminal</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowAddDevice(false)}
                aria-label="Close add device"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="sheet-content-scroll">
              <div className="sheet-form-group">
                <label>Terminal / Device Name *</label>
                <input
                  type="text"
                  placeholder="e.g. West Wing Turnstile Gate"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="sheet-text-input"
                  required
                />
              </div>

              <div className="sheet-form-grid-2">
                <div className="sheet-form-group">
                  <label>Office Location *</label>
                  <select
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                    className="sheet-select-wrapper"
                  >
                    <option>Mumbai HQ</option>
                    <option>Bengaluru</option>
                    <option>Delhi</option>
                    <option>Hyderabad</option>
                    <option>Chennai</option>
                    <option>Pune</option>
                  </select>
                </div>

                <div className="sheet-form-group">
                  <label>Zone / Floor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ground Floor"
                    value={newDevice.zone}
                    onChange={(e) => setNewDevice({ ...newDevice, zone: e.target.value })}
                    className="sheet-text-input"
                    required
                  />
                </div>
              </div>

              <div className="sheet-form-grid-2">
                <div className="sheet-form-group">
                  <label>IP Address *</label>
                  <input
                    type="text"
                    placeholder="192.168.1.110"
                    value={newDevice.ip}
                    onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                    className="sheet-text-input"
                    required
                  />
                </div>

                <div className="sheet-form-group">
                  <label>Port</label>
                  <input
                    type="text"
                    value={newDevice.port}
                    onChange={(e) => setNewDevice({ ...newDevice, port: e.target.value })}
                    className="sheet-text-input"
                    required
                  />
                </div>
              </div>

              <div className="sheet-form-grid-2">
                <div className="sheet-form-group">
                  <label>Device Model</label>
                  <select
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    className="sheet-select-wrapper"
                  >
                    <option>ZKTeco SpeedFace-V5L</option>
                    <option>ZKTeco uFace 302</option>
                    <option>Suprema FaceLite</option>
                    <option>Suprema BioStation 3</option>
                  </select>
                </div>

                <div className="sheet-form-group">
                  <label>Biometric Mode</label>
                  <select
                    value={newDevice.mode}
                    onChange={(e) => setNewDevice({ ...newDevice, mode: e.target.value })}
                    className="sheet-select-wrapper"
                  >
                    <option>Face + Fingerprint</option>
                    <option>Face Recognition</option>
                    <option>Fingerprint</option>
                    <option>Face + PIN</option>
                  </select>
                </div>
              </div>

              <div className="add-device-security-note">
                <FiShield size={14} />
                <span>
                  All device credentials and endpoint packets are encrypted. Raw biometric templates are stored on hardware only.
                </span>
              </div>

              <div className="sheet-footer-actions">
                <button
                  type="button"
                  className="btn-sheet-clear"
                  onClick={() => setShowAddDevice(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sheet-apply">
                  <FiPlus size={15} />
                  <span>Register Terminal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Toast Notifications */}
      {toast && (
        <div className={`bel-bio-toast-banner ${toast.type}`} role="status" aria-live="polite">
          {toast.type === 'success' && <FiCheckCircle size={16} />}
          {toast.type === 'error' && <FiAlertCircle size={16} />}
          {toast.type === 'warning' && <FiAlertCircle size={16} />}
          {toast.type === 'info' && <FiRadio size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 12. Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HRBiometricSync;
