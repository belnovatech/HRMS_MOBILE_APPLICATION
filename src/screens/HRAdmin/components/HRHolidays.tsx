import React from 'react';
import { Calendar } from 'lucide-react';
import { Holiday as HolidayType } from '../../../types';
import './HRHolidays.css';

export interface HRHolidaysProps {
  holidays?: HolidayType[];
}

export const HRHolidays: React.FC<HRHolidaysProps> = ({ holidays = [] }) => {
  const displayHolidays = React.useMemo(() => {
    if (!holidays || holidays.length === 0) {
      return [];
    }
    return holidays.slice(0, 5).map((h, idx) => {
      const d = h.date ? new Date(h.date) : new Date();
      return {
        id: String(h.id || idx),
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        date: String(d.getDate()).padStart(2, '0'),
        name: h.name,
        weekday: h.day || d.toLocaleString('en-US', { weekday: 'long' }),
        type: h.type || 'Public Holiday',
        isUpcomingSoon: idx === 0,
      };
    });
  }, [holidays]);

  return (
    <div className="hr-section-card hr-holidays-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">
            <Calendar size={18} className="hr-cal-icon" /> Upcoming Holidays
          </h3>
          <span className="hr-section-subtitle">2026 Organization Calendar</span>
        </div>
        <span className="hr-holidays-count-badge">{displayHolidays.length} upcoming</span>
      </div>

      <div className="hr-holidays-list">
        {displayHolidays.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No upcoming holidays in the organization calendar.
          </div>
        ) : (
          displayHolidays.map((h) => (
            <div key={h.id} className={`hr-holiday-item ${h.isUpcomingSoon ? 'holiday-soon' : ''}`}>
              <div className="hr-holiday-date-badge">
                <span className="hr-h-month">{h.month}</span>
                <span className="hr-h-date">{h.date}</span>
              </div>

              <div className="hr-holiday-details">
                <span className="hr-holiday-name">{h.name}</span>
                <span className="hr-holiday-day">{h.weekday} • {h.type}</span>
              </div>

              {h.isUpcomingSoon && (
                <span className="hr-holiday-soon-pill">Next up</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
