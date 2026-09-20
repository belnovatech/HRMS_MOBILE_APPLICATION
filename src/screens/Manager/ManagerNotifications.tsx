import React, { useMemo, useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FiBell,
  FiCheck,
  FiFilter,
  FiX,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import "./Notifications.css";

export interface NotificationRecord {
  id: number | string;
  title: string;
  desc: string;
  time: string;
  type: "leave" | "payroll" | "attendance" | "hr" | "system" | string;
  unread: boolean;
}

export default function Notifications() {
  const { notificationsList = [], markNotificationAsRead, markAllNotificationsAsRead } = useAuth();

  const notifications: NotificationRecord[] = useMemo(() => {
    return notificationsList.map((n) => ({
      id: n.id,
      title: n.title,
      desc: n.message,
      time: n.time || 'Recent',
      type: (n.category || 'system').toLowerCase(),
      unread: n.unread ?? true,
    }));
  }, [notificationsList]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const categoryConfig: Record<string, string> = {
    all: "All",
    leave: "Leave",
    payroll: "Payroll",
    attendance: "Attendance",
    hr: "HR",
    system: "System",
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <FiBell size={17} />;
      case "payroll":
        return <FiDollarSign size={17} />;
      case "attendance":
        return <FiClock size={17} />;
      case "hr":
        return <FiFileText size={17} />;
      case "system":
        return <FiSettings size={17} />;
      default:
        return <FiUsers size={17} />;
    }
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const getCategoryUnreadCount = (category: string) => {
    if (category === "all") {
      return unreadCount;
    }

    return notifications.filter(
      (notification) =>
        notification.type === category && notification.unread
    ).length;
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const categoryMatch =
        activeCategory === "all" || notification.type === activeCategory;

      const unreadMatch = !onlyUnread || notification.unread;

      return categoryMatch && unreadMatch;
    });
  }, [notifications, activeCategory, onlyUnread]);

  const markAllRead = () => {
    if (markAllNotificationsAsRead) {
      markAllNotificationsAsRead();
    }
  };

  const markAsRead = (id: number | string) => {
    if (markNotificationAsRead) {
      markNotificationAsRead(String(id));
    }
  };

  const handleNotificationClick = (notification: NotificationRecord) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
  };

  const clearFilters = () => {
    setActiveCategory("all");
    setOnlyUnread(false);
  };

  const hasActiveFilters = activeCategory !== "all" || onlyUnread;

  return (
    <ManagerLayout title="Notifications" breadcrumb="Notifications">
      <div className="notifmgr-page">
        {/* ================= HEADER ================= */}
        <div className="notifmgr-header">
          <div className="notifmgr-heading">
            <h1>Notifications</h1>
            <p>{unreadCount} unread notifications</p>
          </div>

          <div className="notifmgr-header-actions">
            <button
              type="button"
              className="notifmgr-mark-all"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <FiCheck size={14} />
              <span>Mark all read</span>
            </button>

            <button
              type="button"
              className={`notifmgr-filter-button ${
                showFilterPanel ? "notifmgr-filter-active" : ""
              }`}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <FiFilter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* ================= CATEGORY FILTER ================= */}
        <div className="notifmgr-category-wrapper">
          <div className="notifmgr-category-list">
            {Object.entries(categoryConfig).map(([key, label]) => {
              const categoryCount = getCategoryUnreadCount(key);

              return (
                <button
                  type="button"
                  key={key}
                  className={`notifmgr-category-chip ${
                    activeCategory === key ? "notifmgr-category-active" : ""
                  }`}
                  onClick={() => setActiveCategory(key)}
                >
                  <span>{label}</span>

                  {key !== "all" && categoryCount > 0 && (
                    <span className="notifmgr-chip-count">{categoryCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= FILTER PANEL ================= */}
        {showFilterPanel && (
          <div
            className="notifmgr-filter-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowFilterPanel(false);
              }
            }}
          >
            <div className="notifmgr-filter-panel" role="dialog" aria-modal="true">
              <div className="notifmgr-filter-title">
                <div>
                  <strong>Notification Filters</strong>
                  <span>Customize which notifications are displayed.</span>
                </div>

                <button
                  type="button"
                  className="notifmgr-filter-close"
                  onClick={() => setShowFilterPanel(false)}
                  aria-label="Close filters"
                >
                  <FiX size={15} />
                </button>
              </div>

              <div className="notifmgr-filter-options">
                <label className="notifmgr-checkbox-option">
                  <input
                    type="checkbox"
                    checked={onlyUnread}
                    onChange={(event) => setOnlyUnread(event.target.checked)}
                  />
                  <span>Show unread only</span>
                </label>

                <button
                  type="button"
                  className="notifmgr-clear-filter"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= NOTIFICATION LIST ================= */}
        <div className="notifmgr-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`notifmgr-item ${
                  notification.unread ? "notifmgr-item-unread" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* ICON */}
                <div
                  className={`notifmgr-icon notifmgr-icon-${notification.type}`}
                >
                  {getNotificationIcon(notification.type)}
                  {notification.unread && (
                    <span className="notifmgr-unread-dot" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="notifmgr-content">
                  <div className="notifmgr-title-row">
                    <div className="notifmgr-title-wrapper">
                      <strong>{notification.title}</strong>
                      <span
                        className={`notifmgr-type-badge notifmgr-type-${notification.type}`}
                      >
                        {categoryConfig[notification.type] || notification.type}
                      </span>
                    </div>

                    <time>{notification.time}</time>
                  </div>

                  <p>{notification.desc}</p>

                  {notification.unread && (
                    <button
                      type="button"
                      className="notifmgr-mark-read"
                      onClick={(event) => {
                        event.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <FiCheck size={11} />
                      <span>Mark as read</span>
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            /* ================= EMPTY STATE ================= */
            <div className="notifmgr-empty">
              <div className="notifmgr-empty-icon">
                <FiBell size={23} />
              </div>
              <h3>No notifications found</h3>
              <p>There are no notifications matching your current filters.</p>
              <button type="button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        {filteredNotifications.length > 0 && (
          <div className="notifmgr-footer">
            <span>
              Showing <strong>{filteredNotifications.length}</strong> of{" "}
              <strong>{notifications.length}</strong> notifications
            </span>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}

export const ManagerNotifications = Notifications;
