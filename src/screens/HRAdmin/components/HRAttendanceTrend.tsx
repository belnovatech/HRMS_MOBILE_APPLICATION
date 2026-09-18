import React, { useState } from 'react';
import './HRAttendanceTrend.css';

type TrendTab = 'Attendance' | 'Growth' | 'Payroll';

interface DayAttendance {
  day: string;
  present: number;
  absent: number;
  leave: number;
}

export interface HRAttendanceTrendProps {
  totalEmployees?: number;
  presentToday?: number;
  absentToday?: number;
  onLeaveToday?: number;
  monthlyPayroll?: number | string;
}

export const HRAttendanceTrend: React.FC<HRAttendanceTrendProps> = ({
  totalEmployees = 0,
  presentToday = 0,
  absentToday = 0,
  onLeaveToday = 0,
  monthlyPayroll = 0,
}) => {
  const [activeTab, setActiveTab] = useState<TrendTab>('Attendance');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = daysOfWeek[new Date().getDay()];

  const fullAttendanceData: DayAttendance[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
    if (d === todayDayName) {
      return { day: d, present: presentToday, absent: absentToday, leave: onLeaveToday };
    }
    return { day: d, present: 0, absent: 0, leave: 0 };
  });

  const headcount = totalEmployees || 4;
  const growthData = [
    { label: 'Apr', value: Math.max(1, headcount - 1), formatted: `${Math.max(1, headcount - 1)} Employees` },
    { label: 'May', value: Math.max(1, headcount - 1), formatted: `${Math.max(1, headcount - 1)} Employees` },
    { label: 'Jun', value: headcount, formatted: `${headcount} Employees` },
    { label: 'Jul', value: headcount, formatted: `${headcount} Employees` },
    { label: 'Aug', value: headcount, formatted: `${headcount} Employees` },
    { label: 'Sep', value: headcount, formatted: `${headcount} Employees` },
  ];

  const payrollNum = typeof monthlyPayroll === 'number'
    ? monthlyPayroll
    : parseFloat(String(monthlyPayroll).replace(/[^0-9.]/g, '')) || 0;
  const payrollLakhs = payrollNum / 100000;
  const payrollData = [
    { label: 'Apr', value: 0, formatted: '₹0.0L Disbursed' },
    { label: 'May', value: 0, formatted: '₹0.0L Disbursed' },
    { label: 'Jun', value: 0, formatted: '₹0.0L Disbursed' },
    { label: 'Jul', value: 0, formatted: '₹0.0L Disbursed' },
    { label: 'Aug', value: 0, formatted: '₹0.0L Disbursed' },
    { label: 'Sep', value: payrollLakhs, formatted: `₹${payrollLakhs.toFixed(1)}L Current` },
  ];

  const maxAttendance = Math.max(headcount, 4);
  const maxGrowth = Math.max(headcount * 1.5, 6);
  const maxPayroll = Math.max(payrollLakhs * 1.5, 5);

  const yTickTop = activeTab === 'Attendance' ? `${maxAttendance}` : activeTab === 'Growth' ? `${Math.round(maxGrowth)}` : `${Math.round(maxPayroll)}L`;
  const yTickMid = activeTab === 'Attendance' ? `${Math.round(maxAttendance * 0.66)}` : activeTab === 'Growth' ? `${Math.round(maxGrowth * 0.66)}` : `${(maxPayroll * 0.66).toFixed(1)}L`;
  const yTickLow = activeTab === 'Attendance' ? `${Math.round(maxAttendance * 0.33)}` : activeTab === 'Growth' ? `${Math.round(maxGrowth * 0.33)}` : `${(maxPayroll * 0.33).toFixed(1)}L`;

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
            <span className="hr-y-label">{yTickTop}</span>
            <div className="hr-grid-line" />
          </div>
          <div className="hr-y-tick-row">
            <span className="hr-y-label">{yTickMid}</span>
            <div className="hr-grid-line" />
          </div>
          <div className="hr-y-tick-row">
            <span className="hr-y-label">{yTickLow}</span>
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
              const isHovered = hoveredIndex === index;
              const presentHeight = (item.present / maxAttendance) * 100;
              const absentHeight = (item.absent / maxAttendance) * 100;
              const leaveHeight = (item.leave / maxAttendance) * 100;

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
              const isHovered = hoveredIndex === index;
              const height = (item.value / maxGrowth) * 100;

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
              const isHovered = hoveredIndex === index;
              const height = (item.value / maxPayroll) * 100;

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
