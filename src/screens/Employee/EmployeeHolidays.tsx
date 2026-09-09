import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import {
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import "./EmployeeHolidays.css";

const getHolidayDate = (value: any): Date | null => {
  if (!value) return null;

  const raw = String(value).trim();

  // Supports YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Supports common display formats such as "7 Sep 2026".
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMonthName = (date: Date | null): string =>
  date
    ? date.toLocaleDateString("en-US", { month: "long" })
    : "Holiday";

const getMonthShort = (date: Date | null): string =>
  date
    ? date.toLocaleDateString("en-US", { month: "short" })
    : "";

const getDayNumber = (date: Date | null, fallbackDate?: string): number | string => {
  if (date) return date.getDate();

  const match = String(fallbackDate || "").match(/\d{1,2}/);
  return match ? match[0] : "—";
};

const getYear = (date: Date | null, fallback = new Date().getFullYear()): number =>
  date ? date.getFullYear() : fallback;

const getDaysUntil = (date: Date | null): number | null => {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export const EmployeeHolidays: React.FC = () => {
  const { holidays = [] } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const normalizedHolidays = useMemo(() => {
    return holidays
      .map((item, index) => {
        const parsedDate = getHolidayDate(item.date);

        return {
          ...item,
          _index: index,
          _date: parsedDate,
          _month: getMonthName(parsedDate),
          _monthShort: getMonthShort(parsedDate),
          _dayNumber: getDayNumber(parsedDate, item.date),
          _year: getYear(parsedDate),
          _daysUntil: getDaysUntil(parsedDate),
        };
      })
      .sort((a, b) => {
        if (!a._date && !b._date) return a._index - b._index;
        if (!a._date) return 1;
        if (!b._date) return -1;
        return a._date.getTime() - b._date.getTime();
      });
  }, [holidays]);

  const holidayTypes = useMemo(() => {
    const types = normalizedHolidays
      .map((item) => item.type)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(types))];
  }, [normalizedHolidays]);

  const filteredHolidays = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedHolidays.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.day || "").toLowerCase().includes(query) ||
        String(item.type || "").toLowerCase().includes(query) ||
        String(item.date || "").toLowerCase().includes(query);

      const matchesType =
        selectedType === "All" ||
        item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [normalizedHolidays, searchTerm, selectedType]);

  const upcomingHoliday = useMemo(() => {
    const future = normalizedHolidays.filter(
      (item) =>
        item._date &&
        item._daysUntil !== null &&
        item._daysUntil >= 0
    );

    return future[0] || normalizedHolidays[0] || null;
  }, [normalizedHolidays]);

  const totalHolidays = normalizedHolidays.length;

  const nationalCount = normalizedHolidays.filter(
    (item) =>
      String(item.type || "").toLowerCase().includes("national")
  ).length;

  const optionalCount = normalizedHolidays.filter(
    (item) =>
      String(item.type || "").toLowerCase().includes("optional")
  ).length;

  const year = useMemo(() => {
    const firstDate = normalizedHolidays.find(
      (item) => item._date
    );

    return firstDate?._year || new Date().getFullYear();
  }, [normalizedHolidays]);

  const groupedByMonth = useMemo(() => {
    return filteredHolidays.reduce((groups: Record<string, { key: string; label: string; items: typeof filteredHolidays }>, item) => {
      const key = item._date
        ? `${item._year}-${String(item._date.getMonth() + 1).padStart(2, "0")}`
        : "other";

      if (!groups[key]) {
        groups[key] = {
          key,
          label: item._date
            ? item._date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Other Holidays",
          items: [],
        };
      }

      groups[key].items.push(item);
      return groups;
    }, {});
  }, [filteredHolidays]);

  const monthGroups = Object.values(groupedByMonth);

  return (
    <div className="app-container">
      <AppHeader title="Company Holidays" showBack />

      <main className="page-content">
        <div className="emp-holidays-page">
          {/* Page heading */}
          <section className="emp-holidays-header">
            <div>
              <span className="emp-holidays-eyebrow">
                BELNOVA HRMS
              </span>

              <h1>Holidays</h1>

              <p>
                Plan ahead with the official company holiday
                calendar and upcoming observances.
              </p>
            </div>

            <div className="emp-holidays-year-badge">
              <FiCalendar />
              <span>{year} Calendar</span>
            </div>
          </section>

          {/* Hero / upcoming holiday */}
          <section className="emp-holidays-hero">
            <div className="emp-holidays-hero-decoration emp-holidays-hero-decoration-one" />
            <div className="emp-holidays-hero-decoration emp-holidays-hero-decoration-two" />

            <div className="emp-holidays-hero-copy">
              <span className="emp-holidays-hero-kicker">
                NEXT HOLIDAY
              </span>

              {upcomingHoliday ? (
                <>
                  <h2>{upcomingHoliday.name}</h2>

                  <p>
                    {upcomingHoliday.day}
                    {upcomingHoliday._date
                      ? ` · ${upcomingHoliday._date.toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}`
                      : ""}
                  </p>

                  <div className="emp-holidays-hero-meta">
                    <span>
                      <FiMapPin />
                      {upcomingHoliday.type || "Company Holiday"}
                    </span>

                    {upcomingHoliday._daysUntil !== null && (
                      <span>
                        <FiClock />
                        {upcomingHoliday._daysUntil === 0
                          ? "Today"
                          : upcomingHoliday._daysUntil === 1
                          ? "Tomorrow"
                          : `In ${upcomingHoliday._daysUntil} days`}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2>No holidays available</h2>
                  <p>
                    The company holiday calendar will appear
                    here when records are available.
                  </p>
                </>
              )}
            </div>

            {upcomingHoliday && (
              <div className="emp-holidays-hero-date">
                <span>
                  {upcomingHoliday._monthShort}
                </span>

                <strong>
                  {upcomingHoliday._dayNumber}
                </strong>

                <small>
                  {upcomingHoliday._year}
                </small>
              </div>
            )}
          </section>

          {/* Summary cards */}
          <section className="emp-holidays-summary">
            <div className="emp-holidays-summary-card">
              <div className="emp-holidays-summary-icon emp-holidays-summary-icon-blue">
                <FiCalendar />
              </div>

              <div>
                <span>Total Holidays</span>
                <strong>{totalHolidays}</strong>
              </div>

              <small>Listed this year</small>
            </div>

            <div className="emp-holidays-summary-card">
              <div className="emp-holidays-summary-icon emp-holidays-summary-icon-green">
                <FiStar />
              </div>

              <div>
                <span>National</span>
                <strong>{nationalCount}</strong>
              </div>

              <small>Official holidays</small>
            </div>

            <div className="emp-holidays-summary-card">
              <div className="emp-holidays-summary-icon emp-holidays-summary-icon-orange">
                <FiClock />
              </div>

              <div>
                <span>Optional</span>
                <strong>{optionalCount}</strong>
              </div>

              <small>Optional observances</small>
            </div>

            <div className="emp-holidays-summary-card">
              <div className="emp-holidays-summary-icon emp-holidays-summary-icon-purple">
                <FiCalendar />
              </div>

              <div>
                <span>Next Holiday</span>
                <strong>
                  {upcomingHoliday?._daysUntil === 0
                    ? "Today"
                    : upcomingHoliday?._daysUntil === 1
                    ? "1 day"
                    : upcomingHoliday?._daysUntil !== null
                    ? `${upcomingHoliday._daysUntil} days`
                    : "—"}
                </strong>
              </div>

              <small>From today</small>
            </div>
          </section>

          {/* Toolbar */}
          <section className="emp-holidays-toolbar">
            <div className="emp-holidays-toolbar-heading">
              <div>
                <span className="emp-holidays-section-label">
                  OFFICIAL CALENDAR
                </span>

                <h2>Company Holiday Calendar</h2>
              </div>

              <span className="emp-holidays-result-count">
                {filteredHolidays.length}{" "}
                {filteredHolidays.length === 1
                  ? "holiday"
                  : "holidays"}
              </span>
            </div>

            <div className="emp-holidays-controls">
              <div className="emp-holidays-search">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search holidays..."
                />
              </div>

              <div className="emp-holidays-type-filter">
                <select
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(event.target.value)
                  }
                >
                  {holidayTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "All"
                        ? "All Types"
                        : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Holiday list */}
          <section className="emp-holidays-calendar">
            {monthGroups.length > 0 ? (
              monthGroups.map((group) => (
                <div
                  className="emp-holidays-month-group"
                  key={group.key}
                >
                  <div className="emp-holidays-month-heading">
                    <div className="emp-holidays-month-marker" />

                    <h3>{group.label}</h3>

                    <span>
                      {group.items.length}{" "}
                      {group.items.length === 1
                        ? "holiday"
                        : "holidays"}
                    </span>
                  </div>

                  <div className="emp-holidays-list">
                    {group.items.map((item) => (
                      <article
                        className="emp-holidays-item"
                        key={item.id || `${item.name}-${item.date}-${item._index}`}
                      >
                        <div className="emp-holidays-date-tile">
                          <span>
                            {item._monthShort ||
                              "—"}
                          </span>

                          <strong>
                            {item._dayNumber}
                          </strong>
                        </div>

                        <div className="emp-holidays-item-info">
                          <div className="emp-holidays-item-title-row">
                            <h4>{item.name}</h4>

                            <span
                              className={`emp-holidays-type emp-holidays-type-${String(
                                item.type || "holiday"
                              )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {item.type ||
                                "Holiday"}
                            </span>
                          </div>

                          <p>
                            {item.day || "Company Holiday"}
                          </p>

                          {item._date && (
                            <span className="emp-holidays-full-date">
                              {item._date.toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                        </div>

                        <div className="emp-holidays-item-side">
                          {item._daysUntil !== null &&
                            item._daysUntil >= 0 && (
                              <span className="emp-holidays-countdown">
                                {item._daysUntil === 0
                                  ? "Today"
                                  : item._daysUntil === 1
                                  ? "Tomorrow"
                                  : `${item._daysUntil} days`}
                              </span>
                            )}

                          <FiChevronRight />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="emp-holidays-empty">
                <div className="emp-holidays-empty-icon">
                  <FiCalendar />
                </div>

                <h3>No holidays found</h3>

                <p>
                  Try changing the search or holiday type
                  filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("All");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          {/* Footer note */}
          <section className="emp-holidays-note">
            <FiStar />

            <div>
              <strong>Holiday information</strong>
              <span>
                Dates shown here are maintained by HR and
                represent the company holiday calendar.
              </span>
            </div>
          </section>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EmployeeHolidays;
