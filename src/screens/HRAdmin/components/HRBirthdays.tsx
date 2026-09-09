import React from 'react';
import './HRBirthdays.css';

interface BirthdayEmployee {
  id: string;
  name: string;
  initials: string;
  department: string;
  dateStatus: string;
  isToday: boolean;
  avatarBg: string;
}

export const HRBirthdays: React.FC = () => {
  const birthdays: BirthdayEmployee[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      initials: 'PS',
      department: 'HR',
      dateStatus: 'Today',
      isToday: true,
      avatarBg: '#2F6FED',
    },
    {
      id: '2',
      name: 'Kiran Reddy',
      initials: 'KR',
      department: 'Engineering',
      dateStatus: 'Tomorrow',
      isToday: false,
      avatarBg: '#635BEB',
    },
    {
      id: '3',
      name: 'Anjali Nair',
      initials: 'AN',
      department: 'Finance',
      dateStatus: 'Sep 3',
      isToday: false,
      avatarBg: '#10B981',
    },
  ];

  return (
    <div className="hr-section-card hr-birthdays-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">
            <span className="hr-cake-emoji">🎂</span> Birthdays
          </h3>
          <span className="hr-section-subtitle">Upcoming team celebrations</span>
        </div>
        <span className="hr-bday-count-badge">3 this week</span>
      </div>

      <div className="hr-birthdays-list">
        {birthdays.map((emp) => (
          <div key={emp.id} className={`hr-bday-item ${emp.isToday ? 'is-today-item' : ''}`}>
            <div className="hr-bday-avatar" style={{ backgroundColor: emp.avatarBg }}>
              {emp.initials}
            </div>

            <div className="hr-bday-info">
              <span className="hr-bday-name">{emp.name}</span>
              <span className="hr-bday-dept">{emp.department}</span>
            </div>

            <div className="hr-bday-status">
              <span className={`hr-bday-pill ${emp.isToday ? 'pill-today' : 'pill-upcoming'}`}>
                {emp.isToday ? '🎉 Today' : emp.dateStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
