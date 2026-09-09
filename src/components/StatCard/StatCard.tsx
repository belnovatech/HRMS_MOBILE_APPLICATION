import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
  color = 'var(--primary-color)',
  onClick,
}) => {
  return (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        {icon && <div className="stat-icon" style={{ color, background: `${color}15` }}>{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-card-bottom">
          {trend && <span className={`stat-trend trend-${trendType}`}>{trend}</span>}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
