import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';
import './EmployeeAnnouncements.css';

export const EmployeeAnnouncements: React.FC = () => {
  const { announcements } = useAuth();

  return (
    <div className="app-container">
      <AppHeader title="Company Announcements" showBack />

      <main className="page-content">
        <div className="announcements-full-list">
          {announcements.map((item) => (
            <div key={item.id} className="announcement-full-card">
              <div className="a-top">
                <span className="badge badge-info">{item.category}</span>
                <span className="a-date"><Calendar size={12} /> {item.date}</span>
              </div>

              <h3 className="a-title">{item.title}</h3>
              <p className="a-content">{item.content}</p>

              {item.important && (
                <div className="a-important-tag">
                  <AlertCircle size={14} /> High Priority Policy Notice
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
