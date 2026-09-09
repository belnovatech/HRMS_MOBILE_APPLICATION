import React, { useState } from 'react';
import './HRAttendanceTrend.css';

type TrendTab = 'Attendance' | 'Growth' | 'Payroll';

interface DayAttendance {
  day: string;
  present: number;
  absent: number;
  leave: number;
}

export const HRAttendanceTrend: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TrendTab>('Attendance');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);



  const fullAttendanceData: DayAttendance[] = [
    { day: 'Mon', present: 1080, absent: 70, leave: 30 },
    { day: 'Tue', present: 1090, absent: 65, leave: 25 },
    { day: 'Wed', present: 1070, absent: 80, leave: 30 },
    { day: 'Thu', present: 1100, absent: 60, leave: 25 },
    { day: 'Fri', present: 1080, absent: 70, leave: 35 },
    { day: 'Sat', present: 850, absent: 330, leave: 15 },
  ];

  const growthData = [
    { label: 'Apr', value: 1185, formatted: '1,185 Employees' },
    { label: 'May', value: 1198, formatted: '1,198 Employees' },
    { label: 'Jun', value: 1212, formatted: '1,212 Employees' },
    { label: 'Jul', value: 1228, formatted: '1,228 Employees' },
    { label: 'Aug', value: 1236, formatted: '1,236 Employees' },
    { label: 'Sep', value: 1248, formatted: '1,248 Employees' },
  ];

  const payrollData = [
    { label: 'Apr', value: 44.5, formatted: '₹44.5L Disbursed' },
    { label: 'May', value: 45.8, formatted: '₹45.8L Disbursed' },
    { label: 'Jun', value: 46.2, formatted: '₹46.2L Disbursed' },
    { label: 'Jul', value: 47.1, formatted: '₹47.1L Disbursed' },
    { label: 'Aug', value: 48.0, formatted: '₹48.0L Disbursed' },
    { label: 'Sep', value: 48.7, formatted: '₹48.7L Current' },
  ];

  return (
    <div className="hr-section-card hr-trend-card">
      {/* Card Header */}
      <div className="hr-section-card-header hr-trend-header">
        <div className="hr-section-title-wrap">
          <h3 className="hr-section-title">Attendance Trend</h3>
          <span className="hr-section-subtitle">
            {activeTab === 'Attendance'
              ? 'This week'
              : activeTab === 'Growth'
              ? 'Headcount growth 2026'
              : 'Monthly payroll trend'}
          </span>
        </div>

        {/* Tabs */}
        <div className="hr-trend-tabs">
          {(['Attendance', 'Growth', 'Payroll'] as TrendTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`hr-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setHoveredIndex(null);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Legend for Attendance */}
      {activeTab === 'Attendance' && (
        <div className="hr-trend-legend-row">
          <div className="hr-trend-leg-item">
            <span className="hr-leg-dot leg-dot-present" />
            <span>Present</span>
          </div>
          <div className="hr-trend-leg-item">
            <span className="hr-leg-dot leg-dot-absent" />
            <span>Absent</span>
          </div>
          <div className="hr-trend-leg-item">
            <span className="hr-leg-dot leg-dot-leave" />
            <span>Leave</span>
          </div>
        </div>
      )}

      {/* Chart Canvas / Bar Area */}
      <div className="hr-chart-wrapper">
        {/* Y Axis Grid Lines */}
        <div className="hr-y-axis">
          <div className="hr-y-tick-row">
            <span className="hr-y-label">
              {activeTab === 'Attendance' ? '1200' : activeTab === 'Growth' ? '1400' : '60L'}
            </span>
            <div className="hr-grid-line" />
          </div>
          <div className="hr-y-tick-row">
            <span className="hr-y-label">
              {activeTab === 'Attendance' ? '900' : activeTab === 'Growth' ? '1050' : '45L'}
            </span>
            <div className="hr-grid-line" />
          </div>
          <div className="hr-y-tick-row">
            <span className="hr-y-label">
              {activeTab === 'Attendance' ? '600' : activeTab === 'Growth' ? '700' : '30L'}
            </span>
            <div className="hr-grid-line" />
          </div>
          <div className="hr-y-tick-row hr-baseline-row">
            <span className="hr-y-label">0</span>
            <div className="hr-grid-line hr-grid-baseline" />
          </div>
        </div>

        {/* Bars */}
        <div className="hr-bars-row">
          {activeTab === 'Attendance' &&
            fullAttendanceData.map((item, index) => {
              const max = 1200;
              const isHovered = hoveredIndex === index;
              const presentHeight = (item.present / max) * 100;
              const absentHeight = (item.absent / max) * 100;
              const leaveHeight = (item.leave / max) * 100;

              return (
                <div
                  key={item.day}
                  className="hr-bar-col"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(isHovered ? null : index)}
                >
                  {isHovered && (
                    <div className="hr-bar-tooltip">
                      <strong>{item.day}</strong>
                      <span className="tip-present">P: {item.present}</span>
                      <span className="tip-absent">A: {item.absent}</span>
                      <span className="tip-leave">L: {item.leave}</span>
                    </div>
                  )}

                  <div className="hr-grouped-bars">
                    <div className="hr-subbar bar-present" style={{ height: `${presentHeight}%` }} />
                    <div className="hr-subbar bar-absent" style={{ height: `${absentHeight}%` }} />
                    <div className="hr-subbar bar-leave" style={{ height: `${leaveHeight}%` }} />
                  </div>

                  <span className="hr-x-label">{item.day}</span>
                </div>
              );
            })}

          {activeTab === 'Growth' &&
            growthData.map((item, index) => {
              const max = 1400;
              const isHovered = hoveredIndex === index;
              const height = (item.value / max) * 100;

              return (
                <div
                  key={item.label}
                  className="hr-bar-col"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered && (
                    <div className="hr-bar-tooltip">
                      <strong>{item.label}</strong>
                      <span>{item.formatted}</span>
                    </div>
                  )}

                  <div className="hr-single-bar-track">
                    <div
                      className="hr-subbar bar-growth"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="hr-x-label">{item.label}</span>
                </div>
              );
            })}

          {activeTab === 'Payroll' &&
            payrollData.map((item, index) => {
              const max = 60;
              const isHovered = hoveredIndex === index;
              const height = (item.value / max) * 100;

              return (
                <div
                  key={item.label}
                  className="hr-bar-col"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered && (
                    <div className="hr-bar-tooltip">
                      <strong>{item.label}</strong>
                      <span>{item.formatted}</span>
                    </div>
                  )}

                  <div className="hr-single-bar-track">
                    <div
                      className="hr-subbar bar-payroll"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="hr-x-label">{item.label}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
