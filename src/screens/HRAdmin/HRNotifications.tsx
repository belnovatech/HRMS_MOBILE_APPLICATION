import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiPlus,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiArrowRight,
  FiRadio,
  FiVolume2,
  FiSliders,
} from 'react-icons/fi';
import './HRNotifications.css';

const CATEGORY_OPTIONS = [
  'All',
  'Leave',
  'Payroll',
  'Attendance',
  'HR',
  'System',
];

const CATEGORY_META: Record<string, { icon: React.ElementType; className: string; color: string; bg: string }> = {
  Leave: {
    icon: FiCalendar,
    className: 'leave',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  Payroll: {
    icon: FiDollarSign,
    className: 'payroll',
    color: '#059669',
    bg: '#ecfdf5',
  },
  Attendance: {
    icon: FiClock,
    className: 'attendance',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  HR: {
    icon: FiUsers,
    className: 'hr',
    color: '#d97706',
    bg: '#fffbeb',
  },
  System: {
    icon: FiSettings,
    className: 'system',
    color: '#64748b',
    bg: '#f8fafc',
  },
};

function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] || {
      icon: FiBell,
      className: 'system',
      color: '#64748b',
      bg: '#f8fafc',
    }
  );
}

export const HRNotifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notificationsList = [],
    sendNotification,
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useAuth();

  const notifications = useMemo(() => {
    return notificationsList.map((n) => ({
      id: n.id,
      category: n.category || 'HR',
      title: n.title,
      message: n.message,
      time: n.time || 'Just now',
      unread: n.unread ?? true,
      priority: n.priority || 'Normal',
      audience: n.audience || 'All Employees',
      targetPath: n.targetPath,
    }));
  }, [notificationsList]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<typeof notifications[0] | null>(null);

  const [priorityFilter, setPriorityFilter] = useState('All');
  const [readFilter, setReadFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const [composeForm, setComposeForm] = useState({
    title: '',
    message: '',
    category: 'HR',
    audience: 'All Employees',
    priority: 'Normal',
  });

  // Notification Preferences State with localStorage
  const [prefSettings, setPrefSettings] = useState(() => {
    const saved = localStorage.getItem('belnova_notif_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          pushNotifs: true,
          emailAlerts: true,
          payrollAlerts: true,
          leaveRequests: true,
          securityEvents: true,
        };
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => item.unread).length;
  }, [notifications]);

  const highPriorityCount = useMemo(() => {
    return notifications.filter((item) => item.priority === 'High').length;
  }, [notifications]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: notifications.length };
    CATEGORY_OPTIONS.slice(1).forEach((category) => {
      counts[category] = notifications.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      ).length;
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return notifications.filter((item) => {
      const categoryMatch =
        activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();

      const searchMatch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.message.toLowerCase().includes(normalizedSearch) ||
        item.audience.toLowerCase().includes(normalizedSearch);

      const priorityMatch =
        priorityFilter === 'All' || item.priority === priorityFilter;

      const readMatch =
        readFilter === 'All' ||
        (readFilter === 'Unread' && item.unread) ||
        (readFilter === 'Read' && !item.unread);

      const audienceMatch =
        audienceFilter === 'All' || item.audience === audienceFilter;

      return (
        categoryMatch &&
        searchMatch &&
        priorityMatch &&
        readMatch &&
        audienceMatch
      );
    });
  }, [
    notifications,
    activeCategory,
    searchText,
    priorityFilter,
    readFilter,
    audienceFilter,
  ]);

  const activeFilterCount = [
    priorityFilter !== 'All',
    readFilter !== 'All',
    audienceFilter !== 'All',
  ].filter(Boolean).length;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    if (selectedNotification && selectedNotification.id === notificationId) {
      setSelectedNotification({ ...selectedNotification, unread: false });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    showToast('All notifications marked as read.', 'success');
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (deleteNotification) {
      deleteNotification(notificationId);
    }
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
    showToast('Notification removed from inbox.', 'info');
  };

  const clearFilters = () => {
    setSearchText('');
    setActiveCategory('All');
    setPriorityFilter('All');
    setReadFilter('All');
    setAudienceFilter('All');
    setShowFilterPanel(false);
    showToast('Notification filters reset.', 'info');
  };

  const submitAnnouncement = (event: React.FormEvent) => {
    event.preventDefault();

    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      showToast('Please enter an announcement title and message.', 'error');
      return;
    }

    sendNotification({
      audience: composeForm.audience,
      category: composeForm.category,
      title: composeForm.title.trim(),
      message: composeForm.message.trim(),
      priority: composeForm.priority,
      targetPath: '/hr/notifications',
    });

    setComposeForm({
      title: '',
      message: '',
      category: 'HR',
      audience: 'All Employees',
      priority: 'Normal',
    });
    setShowCompose(false);
    showToast('Announcement broadcasted successfully.', 'success');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('belnova_notif_prefs', JSON.stringify(prefSettings));
    setShowPreferences(false);
    showToast('Notification delivery preferences saved.', 'success');
  };

  const renderIcon = (category: string) => {
    const meta = getCategoryMeta(category);
    const IconComponent = meta.icon;
    return <IconComponent />;
  };

  return (
    <div className="app-container bel-notif-mobile-layout">
      {/* 1. App Header */}
      <AppHeader title="Communication Center" showBack />

      <main className="page-content bel-notif-main">
        {/* 2. Hero Summary Banner */}
        <section className="bel-notif-hero-card">
          <div className="notif-hero-top-row">
            <div className="notif-hero-badge">
              <FiVolume2 size={13} />
              <span>HR Broadcast &amp; Alerts</span>
            </div>

            <div className="notif-hero-unread-pill">
              <FiBell size={12} />
              <span>
                {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
              </span>
            </div>
          </div>

          <div className="notif-hero-content">
            <h2>Organization Announcements</h2>
            <p>Broadcast updates, review pending approvals, and inspect executive bulletins.</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="notif-hero-stats-row">
            <button
              type="button"
              className={`hero-stat-col ${readFilter === 'Unread' ? 'is-active-filter' : ''}`}
              onClick={() => setReadFilter(readFilter === 'Unread' ? 'All' : 'Unread')}
            >
              <strong className="stat-value" style={{ color: unreadCount > 0 ? '#fbbf24' : '#ffffff' }}>
                {unreadCount}
              </strong>
              <span className="stat-label">Unread</span>
            </button>

            <div className="hero-stat-divider" />

            <button
              type="button"
              className={`hero-stat-col ${priorityFilter === 'High' ? 'is-active-filter' : ''}`}
              onClick={() => setPriorityFilter(priorityFilter === 'High' ? 'All' : 'High')}
            >
              <strong className="stat-value" style={{ color: highPriorityCount > 0 ? '#f87171' : '#ffffff' }}>
                {highPriorityCount}
              </strong>
              <span className="stat-label">High Priority</span>
            </button>

            <div className="hero-stat-divider" />

            <div className="hero-stat-col">
              <strong className="stat-value">{notifications.length}</strong>
              <span className="stat-label">Total Inbox</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="notif-hero-actions-row">
            <button
              type="button"
              className="btn-notif-mark-all"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <FiCheck size={14} />
              <span>Mark All Read</span>
            </button>

            <button
              type="button"
              className="btn-notif-compose"
              onClick={() => setShowCompose(true)}
            >
              <FiPlus size={15} />
              <span>New Announcement</span>
            </button>
          </div>
        </section>

        {/* 3. Horizontally Scrollable Category Filter Pills */}
        <div className="bel-notif-category-track-wrap">
          <div className="bel-notif-category-track">
            {CATEGORY_OPTIONS.map((cat) => {
              const meta = getCategoryMeta(cat);
              const IconComp = cat === 'All' ? FiBell : meta.icon;

              return (
                <button
                  type="button"
                  key={cat}
                  className={`notif-category-chip ${activeCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === cat && cat !== 'All' ? 'All' : cat)}
                >
                  <span className="chip-icon">
                    <IconComp size={13} />
                  </span>
                  <span className="chip-name">{cat}</span>
                  <span className="chip-count">{categoryCounts[cat] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Search and Filter Bar */}
        <section className="bel-notif-search-toolbar">
          <div className="notif-search-box">
            <FiSearch size={15} />
            <input
              type="text"
              placeholder="Search notifications, announcements, or recipients..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchText('')}
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-notif-filter-trigger ${activeFilterCount > 0 ? 'is-active' : ''}`}
            onClick={() => setShowFilterPanel(true)}
            aria-label="Open filter options"
          >
            <FiFilter size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="active-filter-dot">{activeFilterCount}</span>
            )}
          </button>
        </section>

        {/* 5. Section Heading & Quick Filters Summary */}
        <div className="bel-notif-section-header">
          <div className="header-titles">
            <h4>
              {activeCategory === 'All' ? 'All Communications' : `${activeCategory} Notifications`}
            </h4>
            <span className="counter-text">
              Showing <b>{filteredNotifications.length}</b> of <b>{notifications.length}</b>
            </span>
          </div>

          {(searchText || activeCategory !== 'All' || activeFilterCount > 0) && (
            <button type="button" className="btn-reset-inline" onClick={clearFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {/* 6. Notifications Feed Cards */}
        <section className="bel-notif-feed-list">
          {filteredNotifications.map((item) => {
            const meta = getCategoryMeta(item.category);

            return (
              <article
                key={item.id}
                className={`bel-notif-card ${item.unread ? 'is-unread' : 'is-read'}`}
                onClick={() => {
                  setSelectedNotification(item);
                  if (item.unread) {
                    handleMarkAsRead(item.id);
                  }
                }}
              >
                {/* Category Icon */}
                <div
                  className={`notif-card-icon ${meta.className}`}
                  style={{ color: meta.color, background: meta.bg }}
                >
                  {renderIcon(item.category)}
                  {item.unread && <span className="unread-pulsing-dot" />}
                </div>

                {/* Body Content */}
                <div className="notif-card-body">
                  <div className="notif-card-top-line">
                    <h5 className="notif-title">{item.title}</h5>

                    <div className="notif-badge-group">
                      <span className={`cat-pill ${meta.className}`}>
                        {item.category}
                      </span>
                      {item.priority === 'High' && (
                        <span className="priority-pill high">High</span>
                      )}
                    </div>
                  </div>

                  <p className="notif-msg">{item.message}</p>

                  <div className="notif-card-meta-line">
                    <span className="meta-time">
                      <FiClock size={11} />
                      {item.time}
                    </span>
                    <span className="meta-audience">
                      <FiUsers size={11} />
                      {item.audience}
                    </span>
                  </div>
                </div>

                {/* Quick Row Actions */}
                <div className="notif-card-actions" onClick={(e) => e.stopPropagation()}>
                  {item.unread ? (
                    <button
                      type="button"
                      className="btn-action-read"
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Mark as read"
                    >
                      <FiCheck size={14} />
                    </button>
                  ) : (
                    <span className="read-indicator-icon" title="Read">
                      <FiCheckCircle size={14} />
                    </span>
                  )}

                  <button
                    type="button"
                    className="btn-action-delete"
                    onClick={() => handleDeleteNotification(item.id)}
                    title="Remove notification"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="bel-notif-empty-state">
              <div className="empty-icon-circle">
                <FiBell size={28} />
              </div>
              <h4>No notifications found</h4>
              <p>You have no notifications matching your selected criteria.</p>
              <button type="button" className="btn-empty-reset" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* 7. Footer Preference Bar */}
        <section className="bel-notif-footer-card">
          <div className="footer-card-info">
            <div className="footer-icon-wrap">
              <FiShield size={16} />
            </div>
            <div>
              <strong>HR Broadcast Security &amp; Delivery</strong>
              <p>Configure automated dispatch channels and executive escalation alerts.</p>
            </div>
          </div>

          <button
            type="button"
            className="btn-open-preferences"
            onClick={() => setShowPreferences(true)}
          >
            <FiSliders size={13} />
            <span>Preferences</span>
          </button>
        </section>
      </main>

      {/* =========================================================================
          MODAL 1: NOTIFICATION DETAILS BOTTOM SHEET
         ========================================================================= */}
      {selectedNotification && (
        <div className="bel-modal-backdrop" onClick={() => setSelectedNotification(null)}>
          <div
            className="bel-bottom-sheet-panel notif-details-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <div
                  className="details-icon-box"
                  style={{
                    color: getCategoryMeta(selectedNotification.category).color,
                    background: getCategoryMeta(selectedNotification.category).bg,
                  }}
                >
                  {renderIcon(selectedNotification.category)}
                </div>
                <div>
                  <h4>{selectedNotification.title}</h4>
                  <span>{selectedNotification.time} &bull; {selectedNotification.category}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="notif-detail-badges-row">
                <span className={`cat-pill ${getCategoryMeta(selectedNotification.category).className}`}>
                  {selectedNotification.category}
                </span>

                <span className={`priority-pill ${selectedNotification.priority.toLowerCase()}`}>
                  {selectedNotification.priority} Priority
                </span>

                <span className="audience-pill">
                  <FiUsers size={11} />
                  {selectedNotification.audience}
                </span>
              </div>

              <div className="notif-detail-msg-box">
                <p>{selectedNotification.message}</p>
              </div>

              {selectedNotification.targetPath && selectedNotification.targetPath !== '/hr/notifications' && (
                <button
                  type="button"
                  className="btn-open-target-module"
                  onClick={() => {
                    navigate(selectedNotification.targetPath!);
                    setSelectedNotification(null);
                  }}
                >
                  <span>Open Related HR Module</span>
                  <FiArrowRight size={14} />
                </button>
              )}
            </div>

            <div className="sheet-footer-actions">
              <button
                type="button"
                className="btn-sheet-clear"
                onClick={() => handleDeleteNotification(selectedNotification.id)}
              >
                <FiTrash2 size={14} />
                <span>Remove</span>
              </button>

              <button
                type="button"
                className="btn-sheet-apply"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FILTER BOTTOM SHEET
         ========================================================================= */}
      {showFilterPanel && (
        <div className="bel-modal-backdrop" onClick={() => setShowFilterPanel(false)}>
          <div
            className="bel-bottom-sheet-panel filter-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiFilter size={18} />
                <div>
                  <h4>Filter Notifications</h4>
                  <span>Refine inbox by priority, read status, and audience</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowFilterPanel(false)}
                aria-label="Close filters"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="sheet-form-group">
                <label>Priority Level</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="sheet-select-wrapper"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Normal">Normal Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="sheet-form-group">
                <label>Read Status</label>
                <select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value)}
                  className="sheet-select-wrapper"
                >
                  <option value="All">All Notifications</option>
                  <option value="Unread">Unread Only</option>
                  <option value="Read">Read Only</option>
                </select>
              </div>

              <div className="sheet-form-group">
                <label>Target Audience</label>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  className="sheet-select-wrapper"
                >
                  <option value="All">All Audiences</option>
                  <option value="All Employees">All Employees</option>
                  <option value="HR Administrators">HR Administrators</option>
                  <option value="All Portals">All Portals</option>
                  <option value="Rahul Kumar">Rahul Kumar</option>
                  <option value="Sneha Rao">Sneha Rao</option>
                </select>
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button type="button" className="btn-sheet-clear" onClick={clearFilters}>
                Reset
              </button>
              <button
                type="button"
                className="btn-sheet-apply"
                onClick={() => {
                  setShowFilterPanel(false);
                  showToast('Notification filters applied.', 'success');
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NEW ANNOUNCEMENT COMPOSER BOTTOM SHEET
         ========================================================================= */}
      {showCompose && (
        <div className="bel-modal-backdrop" onClick={() => setShowCompose(false)}>
          <div
            className="bel-bottom-sheet-panel compose-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiSend size={18} />
                <div>
                  <h4>Create Announcement</h4>
                  <span>Broadcast an official update to employees</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowCompose(false)}
                aria-label="Close composer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={submitAnnouncement} className="sheet-content-scroll">
              <div className="sheet-form-group">
                <label>Announcement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Organization Townhall Meeting"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                  className="sheet-text-input"
                  required
                />
              </div>

              <div className="sheet-form-grid-2">
                <div className="sheet-form-group">
                  <label>Category</label>
                  <select
                    value={composeForm.category}
                    onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value })}
                    className="sheet-select-wrapper"
                  >
                    <option value="HR">HR</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Leave">Leave</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div className="sheet-form-group">
                  <label>Priority</label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value })}
                    className="sheet-select-wrapper"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="sheet-form-group">
                <label>Target Audience</label>
                <select
                  value={composeForm.audience}
                  onChange={(e) => setComposeForm({ ...composeForm, audience: e.target.value })}
                  className="sheet-select-wrapper"
                >
                  <option value="All Employees">All Employees (Company-wide)</option>
                  <option value="HR Administrators">HR Administrators Only</option>
                  <option value="All Portals">All Portals &amp; Channels</option>
                  <option value="Rahul Kumar">Rahul Kumar (Direct)</option>
                  <option value="Sneha Rao">Sneha Rao (Direct)</option>
                </select>
              </div>

              <div className="sheet-form-group">
                <label>Announcement Message *</label>
                <textarea
                  rows={4}
                  placeholder="Write clear, professional broadcast details..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  className="sheet-textarea"
                  required
                />
              </div>

              {/* Recipient Preview Box */}
              <div className="compose-recipient-preview">
                <div className="preview-top">
                  <FiRadio size={12} />
                  <span>Broadcast Preview</span>
                </div>
                <div className="preview-body">
                  <strong>{composeForm.title || 'Untitled Announcement'}</strong>
                  <p>{composeForm.message || 'No message entered yet...'}</p>
                  <div className="preview-tags">
                    <span>Audience: <b>{composeForm.audience}</b></span>
                    <span>Priority: <b>{composeForm.priority}</b></span>
                  </div>
                </div>
              </div>

              <div className="sheet-footer-actions">
                <button
                  type="button"
                  className="btn-sheet-clear"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sheet-apply">
                  <FiSend size={14} />
                  <span>Publish Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NOTIFICATION PREFERENCES BOTTOM SHEET
         ========================================================================= */}
      {showPreferences && (
        <div className="bel-modal-backdrop" onClick={() => setShowPreferences(false)}>
          <div
            className="bel-bottom-sheet-panel preferences-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiSliders size={18} />
                <div>
                  <h4>Notification Preferences</h4>
                  <span>Configure automated HR delivery channels</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowPreferences(false)}
                aria-label="Close preferences"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="preferences-toggles-list">
                <div className="pref-toggle-item">
                  <div>
                    <strong>Push Notifications</strong>
                    <span>Send immediate in-app alerts on new activity.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefSettings.pushNotifs}
                      onChange={(e) => setPrefSettings({ ...prefSettings, pushNotifs: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="pref-toggle-item">
                  <div>
                    <strong>Executive Email Digests</strong>
                    <span>Deliver daily consolidated reports to registered HR email.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefSettings.emailAlerts}
                      onChange={(e) => setPrefSettings({ ...prefSettings, emailAlerts: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="pref-toggle-item">
                  <div>
                    <strong>Payroll &amp; Salary Alerts</strong>
                    <span>Notifications for payroll batches and statutory filings.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefSettings.payrollAlerts}
                      onChange={(e) => setPrefSettings({ ...prefSettings, payrollAlerts: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="pref-toggle-item">
                  <div>
                    <strong>Leave &amp; Regularization Escalations</strong>
                    <span>Alerts for requests pending for over 48 hours.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefSettings.leaveRequests}
                      onChange={(e) => setPrefSettings({ ...prefSettings, leaveRequests: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="pref-toggle-item">
                  <div>
                    <strong>Security &amp; Hardware Errors</strong>
                    <span>Immediate warnings on biometric disconnects or breaches.</span>
                  </div>
                  <label className="bio-toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefSettings.securityEvents}
                      onChange={(e) => setPrefSettings({ ...prefSettings, securityEvents: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button
                type="button"
                className="btn-sheet-clear"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-sheet-apply"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Toast Feedback */}
      {toast && (
        <div className={`bel-notif-toast-banner ${toast.type}`} role="status" aria-live="polite">
          {toast.type === 'success' && <FiCheckCircle size={16} />}
          {toast.type === 'error' && <FiAlertCircle size={16} />}
          {toast.type === 'warning' && <FiAlertCircle size={16} />}
          {toast.type === 'info' && <FiRadio size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 9. Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HRNotifications;
