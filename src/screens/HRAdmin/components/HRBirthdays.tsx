import { TeamMember } from '../../../types';
import './HRBirthdays.css';

export interface HRBirthdaysProps {
  teamMembers?: TeamMember[];
}

interface BirthdayEmployee {
  id: string;
  name: string;
  initials: string;
  department: string;
  dateStatus: string;
  isToday: boolean;
  avatarBg: string;
}

export const HRBirthdays: React.FC<HRBirthdaysProps> = ({ teamMembers = [] }) => {
  // If team members have no explicit DOB, show clean empty state rather than fake birthdays
  const birthdays: BirthdayEmployee[] = [];

  return (
    <div className="hr-section-card hr-birthdays-card">
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">
            <span className="hr-cake-emoji">🎂</span> Birthdays
          </h3>
          <span className="hr-section-subtitle">Upcoming team celebrations</span>
        </div>
        <span className="hr-bday-count-badge">{birthdays.length} this week</span>
      </div>

      <div className="hr-birthdays-list">
        {birthdays.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No upcoming team birthdays this week.
          </div>
        ) : (
          birthdays.map((emp) => (
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
          ))
        )}
      </div>
    </div>
  );
};
