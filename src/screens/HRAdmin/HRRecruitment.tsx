import React, { useMemo, useState } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiEye,
  FiFilter,
  FiPlus,
  FiSearch,
  FiSend,
  FiX,
  FiUsers,
  FiUserCheck,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiLayers,
} from 'react-icons/fi';
import './HRRecruitment.css';

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  applied: string;
  experience: string;
  email: string;
  phone: string;
  avatarBg?: string;
}

interface JobPosition {
  id: string;
  title: string;
  dept: string;
  openings: number;
  applicants: number;
  status: 'Active' | 'Closed';
}

const INITIAL_CANDIDATES: Candidate[] = [];

const INITIAL_JOBS: JobPosition[] = [];

const STAGES: ('Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected')[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
];

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Product',
  'Human Resources',
  'Marketing',
  'Finance',
  'Operations',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function downloadCsv(filename: string, headers: string[], rows: any[][]) {
  const escapeCsv = (value: any) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const HRRecruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'jobs'>('pipeline');
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('belnova_recruitment_candidates');
    return saved ? JSON.parse(saved) : [];
  });
  const [jobs, setJobs] = useState<JobPosition[]>(() => {
    const saved = localStorage.getItem('belnova_recruitment_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [stageCounts, setStageCounts] = useState({
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
    Hired: 0,
    Rejected: 0,
  });

  React.useEffect(() => {
    localStorage.setItem('belnova_recruitment_candidates', JSON.stringify(candidates));
    const counts: Record<string, number> = { Applied: 0, Screening: 0, Interview: 0, Offer: 0, Hired: 0, Rejected: 0 };
    candidates.forEach((c) => {
      if (counts[c.stage] !== undefined) counts[c.stage]++;
    });
    setStageCounts(counts as any);
  }, [candidates]);

  React.useEffect(() => {
    localStorage.setItem('belnova_recruitment_jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Filters
  const [selectedStageTab, setSelectedStageTab] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals & Bottom Sheets
  const [modal, setModal] = useState<'postJob' | 'candidate' | 'offer' | 'jobCandidates' | 'filters' | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

  // Forms State
  const [postJobForm, setPostJobForm] = useState({
    title: '',
    department: 'Engineering',
    openings: 1,
  });

  const [offerForm, setOfferForm] = useState({
    ctc: '₹12,00,000',
    joiningDate: '2026-10-01',
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStage = selectedStageTab === 'All' || candidate.stage === selectedStageTab;

      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.id.toLowerCase().includes(query);

      return matchesStage && matchesSearch;
    });
  }, [candidates, search, selectedStageTab]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesDepartment = departmentFilter === 'All' || job.dept === departmentFilter;

      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.dept.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query);

      return matchesDepartment && matchesSearch;
    });
  }, [jobs, search, departmentFilter]);

  // Candidate Actions
  const advanceCandidate = (candidateId: string) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate) return;

    const currentIndex = STAGES.indexOf(candidate.stage);
    const nextStage = STAGES[Math.min(currentIndex + 1, 4)]; // max to 'Hired'

    if (candidate.stage === nextStage) return;

    setCandidates((current) =>
      current.map((item) => (item.id === candidateId ? { ...item, stage: nextStage } : item))
    );

    setStageCounts((current: any) => ({
      ...current,
      [candidate.stage]: Math.max(0, current[candidate.stage] - 1),
      [nextStage]: (current[nextStage] || 0) + 1,
    }));

    showToast(`${candidate.name} advanced to ${nextStage}.`);
    if (modal === 'candidate') setModal(null);
  };

  const rejectCandidate = (candidateId: string) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate || candidate.stage === 'Rejected') return;

    setCandidates((current) =>
      current.map((item) => (item.id === candidateId ? { ...item, stage: 'Rejected' } : item))
    );

    setStageCounts((current) => ({
      ...current,
      [candidate.stage]: Math.max(0, (current as any)[candidate.stage] - 1),
      Rejected: current.Rejected + 1,
    }));

    showToast(`${candidate.name} moved to Rejected.`, 'info');
    if (modal === 'candidate') setModal(null);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setCandidates((current) =>
      current.map((item) => (item.id === selectedCandidate.id ? { ...item, stage: 'Hired' } : item))
    );

    setStageCounts((current) => ({
      ...current,
      Offer: Math.max(0, current.Offer - 1),
      Hired: current.Hired + 1,
    }));

    setModal(null);
    showToast(`Offer letter sent to ${selectedCandidate.name}. Moved to Hired!`);
  };

  // Job Actions
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postJobForm.title.trim()) {
      showToast('Job title is required.', 'error');
      return;
    }

    const newJob: JobPosition = {
      id: `JOB-${101 + jobs.length}`,
      title: postJobForm.title.trim(),
      dept: postJobForm.department,
      openings: Number(postJobForm.openings) || 1,
      applicants: 0,
      status: 'Active',
    };

    setJobs((current) => [newJob, ...current]);
    setPostJobForm({ title: '', department: 'Engineering', openings: 1 });
    setModal(null);
    showToast(`Job "${newJob.title}" posted successfully!`);
  };

  const toggleJobStatus = (jobId: string) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId ? { ...job, status: job.status === 'Active' ? 'Closed' : 'Active' } : job
      )
    );

    showToast('Job status updated.');
  };

  const viewCandidatesForJob = (job: JobPosition) => {
    setSelectedJob(job);
    setModal('jobCandidates');
  };

  // Export
  const exportRecruitment = () => {
    if (activeTab === 'pipeline') {
      downloadCsv(
        'recruitment-candidate-pipeline.csv',
        ['Candidate ID', 'Candidate', 'Role', 'Stage', 'Applied', 'Experience', 'Email', 'Phone'],
        filteredCandidates.map((candidate) => [
          candidate.id,
          candidate.name,
          candidate.role,
          candidate.stage,
          candidate.applied,
          candidate.experience,
          candidate.email,
          candidate.phone,
        ])
      );
      showToast('Downloaded recruitment-candidate-pipeline.csv');
    } else {
      downloadCsv(
        'recruitment-open-positions.csv',
        ['Job ID', 'Position', 'Department', 'Openings', 'Applicants', 'Status'],
        filteredJobs.map((job) => [
          job.id,
          job.title,
          job.dept,
          job.openings,
          job.applicants,
          job.status,
        ])
      );
      showToast('Downloaded recruitment-open-positions.csv');
    }
  };

  const clearFilters = () => {
    setSelectedStageTab('All');
    setDepartmentFilter('All');
    setSearch('');
    showToast('Filters reset.', 'info');
  };

  return (
    <div className="bel-recruit-page-container">
      {/* App Header */}
      <AppHeader title="Recruitment & Hiring" showBack={false} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`bel-recruit-toast bel-recruit-toast--${toast.type}`} role="alert">
          {toast.type === 'success' && <FiCheckCircle className="bel-recruit-toast-icon" />}
          {toast.type === 'error' && <FiAlertCircle className="bel-recruit-toast-icon" />}
          {toast.type === 'info' && <FiUsers className="bel-recruit-toast-icon" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bel-recruit-scroll-content">
        {/* Mobile Header Hero */}
        <div className="bel-recruit-hero-header">
          <div className="bel-recruit-hero-text">
            <h1 className="bel-recruit-title">Recruitment Pipeline</h1>
            <p className="bel-recruit-subtitle">Manage open vacancies and hiring candidates</p>
          </div>

          <button
            type="button"
            className="bel-recruit-btn-post"
            onClick={() => setModal('postJob')}
            aria-label="Post New Job"
          >
            <FiPlus />
            <span>Post Job</span>
          </button>
        </div>

        {/* Dynamic Stage KPI Scroll Row */}
        <section className="bel-recruit-stats-scroll" aria-label="Recruitment Metrics">
          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--applied ${selectedStageTab === 'Applied' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Applied' ? 'All' : 'Applied')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Applied}</strong>
            <span className="bel-recruit-stat-lbl">Applied</span>
          </div>

          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--screening ${selectedStageTab === 'Screening' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Screening' ? 'All' : 'Screening')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Screening}</strong>
            <span className="bel-recruit-stat-lbl">Screening</span>
          </div>

          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--interview ${selectedStageTab === 'Interview' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Interview' ? 'All' : 'Interview')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Interview}</strong>
            <span className="bel-recruit-stat-lbl">Interview</span>
          </div>

          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--offer ${selectedStageTab === 'Offer' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Offer' ? 'All' : 'Offer')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Offer}</strong>
            <span className="bel-recruit-stat-lbl">Offer</span>
          </div>

          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--hired ${selectedStageTab === 'Hired' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Hired' ? 'All' : 'Hired')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Hired}</strong>
            <span className="bel-recruit-stat-lbl">Hired</span>
          </div>

          <div
            className={`bel-recruit-stat-chip bel-recruit-stat-chip--rejected ${selectedStageTab === 'Rejected' ? 'is-selected' : ''}`}
            onClick={() => setSelectedStageTab(selectedStageTab === 'Rejected' ? 'All' : 'Rejected')}
            role="button"
            tabIndex={0}
          >
            <strong className="bel-recruit-stat-num">{stageCounts.Rejected}</strong>
            <span className="bel-recruit-stat-lbl">Rejected</span>
          </div>
        </section>

        {/* Mobile Main Segmented Navigation */}
        <div className="bel-recruit-segmented-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pipeline'}
            className={`bel-recruit-tab-btn ${activeTab === 'pipeline' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <span>Candidate Pipeline</span>
            <span className="bel-recruit-tab-badge">{candidates.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'jobs'}
            className={`bel-recruit-tab-btn ${activeTab === 'jobs' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <span>Open Positions</span>
            <span className="bel-recruit-tab-badge">{jobs.length}</span>
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="bel-recruit-search-bar-row">
          <div className="bel-recruit-search-box">
            <FiSearch className="bel-recruit-search-icon" />
            <input
              type="search"
              className="bel-recruit-search-input"
              placeholder={activeTab === 'pipeline' ? 'Search candidates by name, role or ID...' : 'Search positions...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search recruitment"
            />
            {search && (
              <button
                type="button"
                className="bel-recruit-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <button
            type="button"
            className="bel-recruit-btn-export-icon"
            onClick={exportRecruitment}
            aria-label="Export Data CSV"
            title="Export CSV"
          >
            <FiDownload />
          </button>
        </div>

        {/* =========================================================
            TAB 1: CANDIDATE PIPELINE (MOBILE CARDS)
            ========================================================= */}
        {activeTab === 'pipeline' && (
          <section className="bel-recruit-candidates-section">
            {/* Stage Pills Carousel */}
            <div className="bel-recruit-stage-filter-carousel">
              <button
                type="button"
                className={`bel-recruit-stage-pill ${selectedStageTab === 'All' ? 'is-active' : ''}`}
                onClick={() => setSelectedStageTab('All')}
              >
                All Stages ({candidates.length})
              </button>
              {STAGES.map((stg) => {
                const count = candidates.filter((c) => c.stage === stg).length;
                return (
                  <button
                    type="button"
                    key={stg}
                    className={`bel-recruit-stage-pill bel-recruit-stage-pill--${stg.toLowerCase()} ${selectedStageTab === stg ? 'is-active' : ''}`}
                    onClick={() => setSelectedStageTab(stg)}
                  >
                    {stg} ({count})
                  </button>
                );
              })}
            </div>

            {/* Candidates Card List */}
            {filteredCandidates.length === 0 ? (
              <div className="bel-recruit-empty-box">
                <FiUsers />
                <h3>No candidates found</h3>
                <p>Try switching to another stage or resetting the search filter.</p>
                {(search || selectedStageTab !== 'All') && (
                  <button type="button" className="bel-recruit-btn-reset-filters" onClick={clearFilters}>
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bel-recruit-cards-list">
                {filteredCandidates.map((candidate) => (
                  <article key={candidate.id} className="bel-recruit-cand-card">
                    {/* Top Row: Avatar, Name, Role, Stage Badge */}
                    <div className="bel-recruit-cand-card-top">
                      <div className="bel-recruit-cand-info-wrap">
                        <span
                          className="bel-recruit-cand-avatar"
                          style={{ backgroundColor: candidate.avatarBg || '#2F6FED' }}
                        >
                          {getInitials(candidate.name)}
                        </span>
                        <div>
                          <strong className="bel-recruit-cand-name">{candidate.name}</strong>
                          <span className="bel-recruit-cand-role">{candidate.role}</span>
                        </div>
                      </div>

                      <span className={`bel-recruit-stage-badge bel-recruit-stage-badge--${candidate.stage.toLowerCase()}`}>
                        {candidate.stage}
                      </span>
                    </div>

                    {/* Metadata Row: ID, Exp, Applied Date */}
                    <div className="bel-recruit-cand-meta-row">
                      <div className="bel-recruit-meta-chip">
                        <span>ID:</span>
                        <strong>{candidate.id}</strong>
                      </div>
                      <div className="bel-recruit-meta-chip">
                        <span>Exp:</span>
                        <strong>{candidate.experience}</strong>
                      </div>
                      <div className="bel-recruit-meta-chip">
                        <span>Applied:</span>
                        <strong>{candidate.applied}</strong>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="bel-recruit-cand-actions">
                      <button
                        type="button"
                        className="bel-recruit-btn-view-details"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setModal('candidate');
                        }}
                        aria-label={`View ${candidate.name}`}
                      >
                        <FiEye />
                        <span>View</span>
                      </button>

                      {candidate.stage === 'Offer' ? (
                        <button
                          type="button"
                          className="bel-recruit-btn-send-offer"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setModal('offer');
                          }}
                        >
                          <FiSend />
                          <span>Send Offer</span>
                        </button>
                      ) : candidate.stage !== 'Rejected' && candidate.stage !== 'Hired' ? (
                        <>
                          <button
                            type="button"
                            className="bel-recruit-btn-reject-cand"
                            onClick={() => rejectCandidate(candidate.id)}
                            aria-label={`Reject ${candidate.name}`}
                          >
                            <FiX />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            className="bel-recruit-btn-advance-cand"
                            onClick={() => advanceCandidate(candidate.id)}
                            aria-label={`Advance ${candidate.name}`}
                          >
                            <FiArrowRight />
                            <span>Advance</span>
                          </button>
                        </>
                      ) : (
                        <span className="bel-recruit-terminal-status">
                          {candidate.stage === 'Hired' ? '✓ Candidate Hired' : '✕ Application Rejected'}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            TAB 2: OPEN POSITIONS (MOBILE CARDS)
            ========================================================= */}
        {activeTab === 'jobs' && (
          <section className="bel-recruit-jobs-section">
            {/* Department Filter Chips */}
            <div className="bel-recruit-dept-filter-carousel">
              {DEPARTMENTS.map((dept) => (
                <button
                  type="button"
                  key={dept}
                  className={`bel-recruit-dept-chip ${departmentFilter === dept ? 'is-active' : ''}`}
                  onClick={() => setDepartmentFilter(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Jobs Cards List */}
            {filteredJobs.length === 0 ? (
              <div className="bel-recruit-empty-box">
                <FiBriefcase />
                <h3>No open positions found</h3>
                <p>Try searching with another title or selecting "All" departments.</p>
              </div>
            ) : (
              <div className="bel-recruit-jobs-list">
                {filteredJobs.map((job) => (
                  <article key={job.id} className="bel-recruit-job-card">
                    {/* Header */}
                    <div className="bel-recruit-job-card-header">
                      <div className="bel-recruit-job-title-group">
                        <div className="bel-recruit-job-icon-wrap">
                          <FiBriefcase />
                        </div>
                        <div>
                          <strong className="bel-recruit-job-title">{job.title}</strong>
                          <span className="bel-recruit-job-dept-text">{job.dept} · {job.id}</span>
                        </div>
                      </div>

                      <span className={`bel-recruit-job-status-pill bel-recruit-job-status-pill--${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Metrics 2-Col Box */}
                    <div className="bel-recruit-job-metrics-row">
                      <div className="bel-recruit-job-metric-cell">
                        <small>Open Positions</small>
                        <strong>{job.openings} {job.openings === 1 ? 'Opening' : 'Openings'}</strong>
                      </div>

                      <div className="bel-recruit-job-metric-cell">
                        <small>Total Applicants</small>
                        <strong>{job.applicants} Candidates</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bel-recruit-job-card-actions">
                      <button
                        type="button"
                        className="bel-recruit-btn-job-candidates"
                        onClick={() => viewCandidatesForJob(job)}
                      >
                        <FiUsers />
                        <span>View Applicants ({job.applicants})</span>
                      </button>

                      <button
                        type="button"
                        className={`bel-recruit-btn-job-toggle ${job.status === 'Active' ? 'is-active' : 'is-closed'}`}
                        onClick={() => toggleJobStatus(job.id)}
                      >
                        {job.status === 'Active' ? 'Close Job' : 'Reopen Job'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* =========================================================
          BOTTOM SHEET: POST NEW JOB REQUISITION
          ========================================================= */}
      {modal === 'postJob' && (
        <div
          className="bel-recruit-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bel-recruit-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="post-job-title">
            <div className="bel-recruit-sheet-drag-handle" />

            <div className="bel-recruit-sheet-header">
              <div>
                <h2 id="post-job-title">Post New Job Opening</h2>
                <p>Create a requisition for candidate applications</p>
              </div>
              <button type="button" className="bel-recruit-sheet-close" onClick={() => setModal(null)} aria-label="Close form">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="bel-recruit-sheet-body">
                <div className="bel-recruit-form-group">
                  <label className="bel-recruit-form-label">Position Title</label>
                  <input
                    type="text"
                    className="bel-recruit-form-input"
                    placeholder="e.g. Senior React Developer"
                    value={postJobForm.title}
                    onChange={(e) => setPostJobForm({ ...postJobForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="bel-recruit-form-group">
                  <label className="bel-recruit-form-label">Department</label>
                  <select
                    className="bel-recruit-form-select"
                    value={postJobForm.department}
                    onChange={(e) => setPostJobForm({ ...postJobForm, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="bel-recruit-form-group">
                  <label className="bel-recruit-form-label">Number of Openings</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="bel-recruit-form-input"
                    value={postJobForm.openings}
                    onChange={(e) => setPostJobForm({ ...postJobForm, openings: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="bel-recruit-sheet-footer">
                <button type="button" className="bel-recruit-btn-sheet-secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="bel-recruit-btn-sheet-primary">
                  <FiPlus />
                  <span>Publish Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: CANDIDATE PROFILE & DETAILS
          ========================================================= */}
      {modal === 'candidate' && selectedCandidate && (
        <div
          className="bel-recruit-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bel-recruit-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="cand-title">
            <div className="bel-recruit-sheet-drag-handle" />

            <div className="bel-recruit-sheet-header">
              <div>
                <h2 id="cand-title">Candidate Details</h2>
                <p>{selectedCandidate.id}</p>
              </div>
              <button type="button" className="bel-recruit-sheet-close" onClick={() => setModal(null)} aria-label="Close details">
                <FiX />
              </button>
            </div>

            <div className="bel-recruit-sheet-body">
              {/* Profile Card */}
              <div className="bel-recruit-cand-profile-hero">
                <span
                  className="bel-recruit-cand-avatar bel-recruit-cand-avatar--lg"
                  style={{ backgroundColor: selectedCandidate.avatarBg || '#2F6FED' }}
                >
                  {getInitials(selectedCandidate.name)}
                </span>
                <div>
                  <h3>{selectedCandidate.name}</h3>
                  <p>{selectedCandidate.role}</p>
                </div>
                <span className={`bel-recruit-stage-badge bel-recruit-stage-badge--${selectedCandidate.stage.toLowerCase()}`}>
                  {selectedCandidate.stage}
                </span>
              </div>

              {/* Data Grid */}
              <div className="bel-recruit-cand-data-grid">
                <div className="bel-recruit-cand-data-cell">
                  <span>Experience</span>
                  <strong>{selectedCandidate.experience}</strong>
                </div>

                <div className="bel-recruit-cand-data-cell">
                  <span>Applied Date</span>
                  <strong>{selectedCandidate.applied}</strong>
                </div>

                <div className="bel-recruit-cand-data-cell bel-recruit-cell--full">
                  <span>Email Address</span>
                  <a href={`mailto:${selectedCandidate.email}`}>{selectedCandidate.email}</a>
                </div>

                <div className="bel-recruit-cand-data-cell bel-recruit-cell--full">
                  <span>Phone Number</span>
                  <a href={`tel:${selectedCandidate.phone}`}>{selectedCandidate.phone}</a>
                </div>
              </div>
            </div>

            <div className="bel-recruit-sheet-footer">
              <button type="button" className="bel-recruit-btn-sheet-secondary" onClick={() => setModal(null)}>
                Close
              </button>

              {selectedCandidate.stage !== 'Rejected' && selectedCandidate.stage !== 'Hired' && (
                <button
                  type="button"
                  className="bel-recruit-btn-sheet-primary"
                  onClick={() => advanceCandidate(selectedCandidate.id)}
                >
                  <FiArrowRight />
                  <span>Advance Stage</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: SEND OFFER FORM
          ========================================================= */}
      {modal === 'offer' && selectedCandidate && (
        <div
          className="bel-recruit-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bel-recruit-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="offer-title">
            <div className="bel-recruit-sheet-drag-handle" />

            <div className="bel-recruit-sheet-header">
              <div>
                <h2 id="offer-title">Release Offer Letter</h2>
                <p>Candidate: {selectedCandidate.name}</p>
              </div>
              <button type="button" className="bel-recruit-sheet-close" onClick={() => setModal(null)} aria-label="Close offer form">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSendOffer}>
              <div className="bel-recruit-sheet-body">
                <div className="bel-recruit-offer-hero">
                  <FiSend className="bel-recruit-offer-icon" />
                  <div>
                    <strong>{selectedCandidate.name}</strong>
                    <span>{selectedCandidate.role} · {selectedCandidate.id}</span>
                  </div>
                </div>

                <div className="bel-recruit-form-group">
                  <label className="bel-recruit-form-label">Annual CTC Package</label>
                  <input
                    type="text"
                    className="bel-recruit-form-input"
                    value={offerForm.ctc}
                    onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                    required
                  />
                </div>

                <div className="bel-recruit-form-group">
                  <label className="bel-recruit-form-label">Expected Joining Date</label>
                  <input
                    type="date"
                    className="bel-recruit-form-input"
                    value={offerForm.joiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bel-recruit-sheet-footer">
                <button type="button" className="bel-recruit-btn-sheet-secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="bel-recruit-btn-sheet-primary">
                  <FiSend />
                  <span>Send Offer Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM SHEET: JOB APPLICANTS LIST
          ========================================================= */}
      {modal === 'jobCandidates' && selectedJob && (
        <div
          className="bel-recruit-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bel-recruit-bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="job-applicants-title">
            <div className="bel-recruit-sheet-drag-handle" />

            <div className="bel-recruit-sheet-header">
              <div>
                <h2 id="job-applicants-title">{selectedJob.title}</h2>
                <p>{selectedJob.dept} · {selectedJob.applicants} Total Applicants</p>
              </div>
              <button type="button" className="bel-recruit-sheet-close" onClick={() => setModal(null)} aria-label="Close applicants">
                <FiX />
              </button>
            </div>

            <div className="bel-recruit-sheet-body">
              <div className="bel-recruit-applicants-list-sheet">
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="bel-recruit-applicant-sheet-item"
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setModal('candidate');
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span
                      className="bel-recruit-cand-avatar"
                      style={{ backgroundColor: cand.avatarBg || '#2F6FED' }}
                    >
                      {getInitials(cand.name)}
                    </span>
                    <div className="bel-recruit-applicant-sheet-info">
                      <strong>{cand.name}</strong>
                      <span>{cand.role} · {cand.experience}</span>
                    </div>
                    <span className={`bel-recruit-stage-badge bel-recruit-stage-badge--${cand.stage.toLowerCase()}`}>
                      {cand.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bel-recruit-sheet-footer">
              <button type="button" className="bel-recruit-btn-sheet-secondary" onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent HR Admin Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
