import React from 'react';
import { Calendar } from 'lucide-react';
import './HRHolidays.css';

interface Holiday {
  id: string;
  month: string;
  date: string;
  name: string;
  weekday: string;
  type: string;
  isUpcomingSoon?: boolean;
}

export const HRHolidays: React.FC = () => {
  const holidays: Holiday[] = [
    {
      id: '1',
      month: 'SEP',
      date: '07',
      name: 'Ganesh Chaturthi',
      weekday: 'Monday',
      type: 'Gazetted',
      isUpcomingSoon: true,
    },
    {
      id: '2',
      month: 'OCT',
      date: '02',
      name: 'Gandhi Jayanti',
      weekday: 'Friday',
      type: 'National Holiday',
    },
    {
      id: '3',
      month: 'OCT',
      date: '20',
      name: 'Diwali',
      weekday: 'Monday',
      type: 'Festival Holiday',
    },
  ];

  return (
    <div className="hr-section-card hr-holidays-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">
            <Calendar size={18} className="hr-cal-icon" /> Upcoming Holidays
          </h3>
          <span className="hr-section-subtitle">2026 Organization Calendar</span>
        </div>
        <span className="hr-holidays-count-badge">3 upcoming</span>
      </div>

      <div className="hr-holidays-list">
        {holidays.map((h) => (
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
        ))}
      </div>
    </div>
  );
};
