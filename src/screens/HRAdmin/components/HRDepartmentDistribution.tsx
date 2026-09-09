import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRDepartmentDistribution.css';

interface DepartmentData {
  name: string;
  count: number;
  percentage: string;
  color: string;
}

export const HRDepartmentDistribution: React.FC = () => {
  const navigate = useNavigate();

  const departments: DepartmentData[] = [
    { name: 'Engineering', count: 342, percentage: '27.4%', color: '#2F6FED' },
    { name: 'Sales', count: 215, percentage: '17.2%', color: '#635BEB' },
    { name: 'HR', count: 86, percentage: '6.9%', color: '#D946EF' },
    { name: 'Finance', count: 124, percentage: '9.9%', color: '#10B981' },
    { name: 'Operations', count: 481, percentage: '38.5%', color: '#06B6D4' },
  ];

  const [activeDept, setActiveDept] = useState<DepartmentData | null>(null);

  const total = 1248;
  const radius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash arrays
  let accumulatedPercent = 0;
  const segments = departments.map((dept) => {
    const percent = dept.count / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...dept,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const handleDeptClick = (dept: DepartmentData) => {
    navigate(`/hr/employees?dept=${encodeURIComponent(dept.name)}`);
  };

  return (
    <div className="hr-section-card hr-dept-card">
      {/* Header */}
      <div className="hr-section-card-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">Department Distribution</h3>
          <span className="hr-section-subtitle">1,248 total employees</span>
        </div>
      </div>

      {/* Donut Chart & Center Info */}
      <div className="hr-donut-container">
        <div className="hr-donut-wrapper">
          <svg className="hr-donut-svg" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = activeDept?.name === seg.name;

              return (
                <circle
                  key={seg.name}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="butt"
                  transform="rotate(-90 100 100)"
                  className="hr-donut-segment"
                  onMouseEnter={() => setActiveDept(seg)}
                  onMouseLeave={() => setActiveDept(null)}
                  onClick={() => handleDeptClick(seg)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="hr-donut-center">
            {activeDept ? (
              <>
                <strong className="hr-center-value">{activeDept.count}</strong>
                <span className="hr-center-label">{activeDept.name}</span>
                <small className="hr-center-percent">{activeDept.percentage}</small>
              </>
            ) : (
              <>
                <strong className="hr-center-value">{total}</strong>
                <span className="hr-center-label">Employees</span>
                <small className="hr-center-percent">5 Depts</small>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend List */}
      <div className="hr-dept-legend">
        {departments.map((dept) => {
          const isSelected = activeDept?.name === dept.name;

          return (
            <div
              key={dept.name}
              className={`hr-legend-item ${isSelected ? 'selected' : ''}`}
              onMouseEnter={() => setActiveDept(dept)}
              onMouseLeave={() => setActiveDept(null)}
              onClick={() => handleDeptClick(dept)}
              role="button"
              tabIndex={0}
            >
              <span className="hr-legend-dot" style={{ backgroundColor: dept.color }} />
              <span className="hr-legend-name">{dept.name}</span>
              <span className="hr-legend-count">{dept.count}</span>
              <span className="hr-legend-percent">{dept.percentage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
