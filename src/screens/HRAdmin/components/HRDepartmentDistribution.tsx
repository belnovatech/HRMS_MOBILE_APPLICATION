import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamMember } from '../../../types';
import './HRDepartmentDistribution.css';

export interface DepartmentData {
  name: string;
  count: number;
  percentage: string;
  color: string;
}

export interface HRDepartmentDistributionProps {
  teamMembers?: TeamMember[];
  departmentsData?: Array<{ name: string; count: number; percentage: string; color?: string }>;
}

export const HRDepartmentDistribution: React.FC<HRDepartmentDistributionProps> = ({
  teamMembers = [],
  departmentsData,
}) => {
  const navigate = useNavigate();

  const colors = ['#2F6FED', '#D946EF', '#10B981', '#F59E0B', '#635BEB', '#06B6D4'];

  const departments: DepartmentData[] = React.useMemo(() => {
    if (departmentsData && departmentsData.length > 0) {
      return departmentsData.map((d, i) => ({
        ...d,
        color: d.color || colors[i % colors.length],
      }));
    }

    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }

    const map = new Map<string, number>();
    teamMembers.forEach((m) => {
      const dept =
        (m as any).department ||
        (m.role === 'hr'
          ? 'Human Resources'
          : m.role === 'manager'
          ? 'Engineering'
          : 'Engineering');
      map.set(dept, (map.get(dept) || 0) + 1);
    });

    const totalCount = teamMembers.length;
    let i = 0;
    const list: DepartmentData[] = [];
    map.forEach((cnt, deptName) => {
      list.push({
        name: deptName,
        count: cnt,
        percentage: `${((cnt / totalCount) * 100).toFixed(1)}%`,
        color: colors[i % colors.length],
      });
      i++;
    });
    return list;
  }, [teamMembers, departmentsData]);

  const [activeDept, setActiveDept] = useState<DepartmentData | null>(null);

  const total = departments.reduce((acc, d) => acc + d.count, 0) || teamMembers.length || 0;
  const radius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash arrays
  let accumulatedPercent = 0;
  const segments = departments.map((dept) => {
    const percent = total > 0 ? dept.count / total : 0;
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
          <span className="hr-section-subtitle">{total} total employees</span>
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
