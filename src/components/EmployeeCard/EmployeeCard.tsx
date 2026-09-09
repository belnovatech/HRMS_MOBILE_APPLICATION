import React from 'react';
import { Mail, Phone } from 'lucide-react';
import './EmployeeCard.css';

interface EmployeeCardProps {
  id: string;
  name: string;
  designation: string;
  department?: string;
  initials?: string;
  color?: string;
  status?: string;
  email?: string;
  phone?: string;
  onClick?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  id,
  name,
  designation,
  department,
  initials,
  color = '#2563eb',
  status,
  email,
  phone,
  onClick,
}) => {
  const displayInitials = initials || name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="employee-card" onClick={onClick}>
      <div className="emp-avatar" style={{ backgroundColor: color }}>
        {displayInitials}
      </div>

      <div className="emp-info">
        <div className="emp-header">
          <span className="emp-name">{name}</span>
          {status && (
            <span
              className={`badge ${
                status === 'Present'
                  ? 'badge-success'
                  : status === 'WFH'
                  ? 'badge-info'
                  : status === 'Absent'
                  ? 'badge-danger'
                  : 'badge-warning'
              }`}
            >
              {status}
            </span>
          )}
        </div>
        <span className="emp-role">{designation} {department ? `• ${department}` : ''}</span>
        <span className="emp-id">ID: {id}</span>

        {(email || phone) && (
          <div className="emp-contact">
            {email && <span className="contact-item"><Mail size={12} /> {email}</span>}
            {phone && <span className="contact-item"><Phone size={12} /> {phone}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
