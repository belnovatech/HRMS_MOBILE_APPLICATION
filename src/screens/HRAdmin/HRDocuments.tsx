import React, { useMemo, useRef, useState } from 'react';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { BottomNavigation } from '../../components/BottomNavigation/BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import { downloadDocument as dlDoc, downloadReportCsv, downloadReport } from '../../services/downloadService';
import {
  FiFileText,
  FiDownload,
  FiUploadCloud,
  FiEye,
  FiSearch,
  FiX,
  FiCheck,
  FiClock,
  FiFolder,
  FiTrash2,
  FiFilter,
  FiCheckCircle,
  FiShield,
  FiUser,
  FiFile,
  FiLayers,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import './HRDocuments.css';

const DOCUMENT_CATEGORIES = [
  'All',
  'Identity',
  'Employment',
  'Education',
  'Legal',
  'Salary',
  'Other',
];

const DEFAULT_EMPLOYEES = [
  { id: 'All', name: 'All Employees' },
];

export interface DocItem {
  id: string;
  employeeId: string;
  employee: string;
  category: string;
  title: string;
  fileName: string;
  type: string;
  size: string;
  uploaded: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  file?: any;
}

async function downloadDocument(documentItem: DocItem) {
  if (documentItem.file) {
    await dlDoc({
      fileName: documentItem.fileName,
      title: documentItem.title,
      file: documentItem.file,
    });
    return;
  }

  const safeFileName = documentItem.fileName
    ? documentItem.fileName.replace(/\.txt$/, '.pdf')
    : `${documentItem.title.replace(/\s+/g, '_')}.pdf`;

  await downloadReport(
    documentItem.title,
    documentItem.category,
    ['Document Metadata Field', 'Value'],
    [
      ['Employee Name', documentItem.employee],
      ['Employee ID', documentItem.employeeId],
      ['Document Title', documentItem.title],
      ['Category', documentItem.category],
      ['File Name', documentItem.fileName],
      ['File Size', documentItem.size],
      ['Upload Date', documentItem.uploaded],
      ['Verification Status', documentItem.status],
    ],
    safeFileName
  );
}

async function downloadEmployeeDocuments(employeeName: string, documents: DocItem[]) {
  const headers = [
    'Document ID',
    'Employee ID',
    'Employee',
    'Category',
    'Document',
    'Type',
    'Size',
    'Uploaded',
    'Status',
  ];

  const rows = documents.map((item) => [
    item.id,
    item.employeeId,
    item.employee,
    item.category,
    item.title,
    item.type,
    item.size,
    item.uploaded,
    item.status,
  ]);

  await downloadReportCsv(headers, rows, `${employeeName.replace(/\s+/g, '-')}-documents.csv`);
}

export const HRDocuments: React.FC = () => {
  const {
    teamMembers = [],
    documentsList = [],
    verifyEmployeeDocument,
    addEmployeeDocument,
    removeEmployeeDocument,
  } = useAuth();

  const employeeOptions = useMemo(() => {
    const list = [{ id: 'All', name: 'All Employees' }];
    if (teamMembers && teamMembers.length > 0) {
      teamMembers.forEach((m) => {
        list.push({ id: m.id || m.employeeId || 'EMP', name: m.name || 'Employee' });
      });
    }
    return list;
  }, [teamMembers]);

  const documents: DocItem[] = useMemo(() => {
    return documentsList.map((d) => ({
      id: d.id,
      employeeId: d.employeeId || 'EMP1001',
      employee: d.employee || 'Employee',
      category: d.category || 'General',
      title: d.title,
      fileName: d.fileName || `${d.title}.pdf`,
      type: (d.fileName || d.title).split('.').pop()?.toUpperCase() || 'PDF',
      size: d.size || '1.5 MB',
      uploaded: d.uploaded || '2026-09-01',
      status: (d.status as 'Pending' | 'Verified' | 'Rejected') || 'Pending',
      file: d.file,
    }));
  }, [documentsList]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDocument, setSelectedDocument] = useState<DocItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState('');
  const [uploadData, setUploadData] = useState<{
    employeeId: string;
    category: string;
    documentName: string;
    file: File | null;
  }>({
    employeeId: '',
    category: 'Identity',
    documentName: '',
    file: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return documents.filter((documentItem) => {
      const matchesSearch =
        !normalizedSearch ||
        documentItem.title.toLowerCase().includes(normalizedSearch) ||
        documentItem.employee.toLowerCase().includes(normalizedSearch) ||
        documentItem.employeeId.toLowerCase().includes(normalizedSearch) ||
        documentItem.fileName.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === 'All' || documentItem.category === categoryFilter;

      const matchesEmployee =
        employeeFilter === 'All' || documentItem.employeeId === employeeFilter;

      const matchesStatus =
        statusFilter === 'All' || documentItem.status === statusFilter;

      return matchesSearch && matchesCategory && matchesEmployee && matchesStatus;
    });
  }, [documents, searchTerm, categoryFilter, employeeFilter, statusFilter]);

  const categoryCounts = useMemo(() => {
    return DOCUMENT_CATEGORIES.reduce((accumulator: Record<string, number>, category) => {
      accumulator[category] =
        category === 'All'
          ? documents.length
          : documents.filter((item) => item.category === category).length;
      return accumulator;
    }, {});
  }, [documents]);

  const verifiedCount = useMemo(() => {
    return documents.filter((d) => d.status === 'Verified').length;
  }, [documents]);

  const pendingCount = useMemo(() => {
    return documents.filter((d) => d.status === 'Pending').length;
  }, [documents]);

  const activeFilterCount = [
    categoryFilter !== 'All',
    employeeFilter !== 'All',
    statusFilter !== 'All',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setEmployeeFilter('All');
    setStatusFilter('All');
    setShowFilters(false);
    showToast('Document filters cleared.');
  };

  const handleVerifyDocument = (documentId: string) => {
    verifyEmployeeDocument(documentId, 'Verified');

    setSelectedDocument((current) =>
      current?.id === documentId ? { ...current, status: 'Verified' } : current
    );

    showToast('Document verified successfully.');
  };

  const handleRemoveDocument = (documentId: string) => {
    const documentItem = documents.find((item) => item.id === documentId);
    if (!documentItem) return;

    const confirmed = window.confirm(
      `Remove "${documentItem.title}" from the document repository?`
    );

    if (!confirmed) return;

    if (removeEmployeeDocument) {
      removeEmployeeDocument(documentId);
    }
    setSelectedDocument(null);
    showToast('Document removed from the repository.');
  };

  const handleUploadSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!uploadData.documentName.trim()) {
      showToast('Enter a document name.');
      return;
    }

    const employeeObj = employeeOptions.find((item) => item.id === uploadData.employeeId);
    const chosenEmployeeName = employeeObj?.name || 'Employee';

    addEmployeeDocument({
      title: `${uploadData.documentName.trim()} — ${chosenEmployeeName}`,
      category: uploadData.category,
      fileName: uploadData.file?.name || `${uploadData.documentName.trim().replace(/\s+/g, '_')}.pdf`,
      size: uploadData.file ? `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      file: uploadData.file,
      employeeId: uploadData.employeeId,
      employee: chosenEmployeeName,
    });

    setUploadData({
      employeeId: 'EMP1001',
      category: 'Identity',
      documentName: '',
      file: null,
    });
    setShowUpload(false);
    showToast('Document uploaded and added for verification.');
  };

  const clearSelectedEmployee = () => {
    setEmployeeFilter('All');
    showToast('Showing documents for all employees.');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Identity':
        return <FiShield />;
      case 'Employment':
        return <FiLayers />;
      case 'Education':
        return <FiFileText />;
      case 'Legal':
        return <FiCheckCircle />;
      case 'Salary':
        return <FiFile />;
      default:
        return <FiFolder />;
    }
  };

  return (
    <div className="app-container bel-documents-mobile-layout">
      {/* 1. App Header */}
      <AppHeader title="Document Management" showBack />

      <main className="page-content bel-documents-main">
        {/* 2. Executive Hero Overview */}
        <section className="bel-documents-hero">
          <div className="hero-top-badge-row">
            <div className="hero-badge">
              <FiShield size={13} />
              <span>HR Vault &amp; Verification</span>
            </div>
            <span className="hero-sync-tag">Encrypted &bull; ISO 27001</span>
          </div>

          <div className="hero-title-content">
            <h2>Employee Document Repository</h2>
            <p>Manage, inspect, and verify official employment, identity, and education records.</p>
          </div>

          {/* Dynamic Metrics Row */}
          <div className="bel-docs-stat-pills">
            <div className="doc-stat-pill">
              <span className="stat-num">{documents.length}</span>
              <span className="stat-lbl">Total Docs</span>
            </div>
            <div className="doc-stat-pill verified">
              <span className="stat-num">{verifiedCount}</span>
              <span className="stat-lbl">Verified</span>
            </div>
            <div className="doc-stat-pill pending">
              <span className="stat-num">{pendingCount}</span>
              <span className="stat-lbl">Pending Review</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            className="bel-btn-hero-upload"
            onClick={() => setShowUpload(true)}
          >
            <FiUploadCloud size={16} />
            <span>Upload Document</span>
          </button>
        </section>

        {/* 3. Horizontally Scrollable Category Bar */}
        <div className="bel-category-scroll-section">
          <div className="section-label-row">
            <span className="section-label">Browse by Category</span>
            <span className="category-active-count">{categoryCounts[categoryFilter] || 0} Records</span>
          </div>

          <div className="bel-category-pill-track">
            {DOCUMENT_CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                className={`category-pill-btn ${categoryFilter === category ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(categoryFilter === category && category !== 'All' ? 'All' : category)}
              >
                <span className="cat-icon">{getCategoryIcon(category)}</span>
                <span className="cat-name">{category}</span>
                <span className="cat-count-badge">{categoryCounts[category] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Search and Mobile Filter Toolbar */}
        <section className="bel-docs-search-toolbar">
          <div className="bel-docs-search-box">
            <FiSearch size={15} />
            <input
              type="text"
              placeholder="Search documents or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search input"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="bel-toolbar-actions">
            {/* Employee Quick Select */}
            <select
              className="bel-select-employee"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              aria-label="Filter by employee"
            >
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            {/* Filter Bottom Sheet Trigger */}
            <button
              type="button"
              className={`bel-btn-more-filters ${activeFilterCount > 0 ? 'is-active' : ''}`}
              onClick={() => setShowFilters(true)}
              aria-label="Open filter options"
            >
              <FiFilter size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="active-filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </section>

        {/* 5. Selected Employee Context Banner */}
        {employeeFilter !== 'All' && (
          <div className="bel-employee-context-card">
            <div className="context-emp-info">
              <div className="emp-avatar-icon">
                <FiUser size={15} />
              </div>
              <div>
                <strong>{employeeOptions.find((e) => e.id === employeeFilter)?.name}</strong>
                <span>
                  {employeeFilter} &bull; {filteredDocuments.length} document
                  {filteredDocuments.length === 1 ? '' : 's'} found
                </span>
              </div>
            </div>

            <div className="context-actions">
              <button
                type="button"
                className="btn-emp-export-csv"
                onClick={() => {
                  const empName =
                    employeeOptions.find((item) => item.id === employeeFilter)?.name || 'Employee';
                  downloadEmployeeDocuments(empName, filteredDocuments);
                  showToast(`${empName} documents downloaded.`);
                }}
              >
                <FiDownload size={13} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                className="btn-emp-clear"
                onClick={clearSelectedEmployee}
                aria-label="Clear employee filter"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>
        )}

        {/* 6. Document Cards Grid */}
        <div className="bel-docs-grid-header">
          <h4>Repository Documents</h4>
          <span className="docs-counter">
            Showing <b>{filteredDocuments.length}</b> of <b>{documents.length}</b>
          </span>
        </div>

        <section className="bel-docs-cards-grid">
          {filteredDocuments.map((docItem) => (
            <article className="bel-doc-card" key={docItem.id}>
              {/* Card Top Row */}
              <div className="doc-card-top">
                <div className={`doc-type-badge type-${docItem.type.toLowerCase()}`}>
                  {docItem.type}
                </div>

                <div
                  className={`doc-status-pill ${
                    docItem.status === 'Verified' ? 'is-verified' : 'is-pending'
                  }`}
                >
                  {docItem.status === 'Verified' ? (
                    <FiCheck size={12} />
                  ) : (
                    <FiClock size={12} />
                  )}
                  <span>{docItem.status}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="doc-card-body" onClick={() => setSelectedDocument(docItem)}>
                <h5 className="doc-title">{docItem.title}</h5>
                <div className="doc-emp-meta">
                  <FiUser size={11} />
                  <span>
                    {docItem.employee} ({docItem.employeeId})
                  </span>
                </div>
                <p className="doc-specs">
                  {docItem.category} &bull; {docItem.size} &bull; Uploaded {docItem.uploaded}
                </p>
              </div>

              {/* Card Actions Footer */}
              <div className="doc-card-actions">
                <button
                  type="button"
                  className="btn-card-action view"
                  onClick={() => setSelectedDocument(docItem)}
                >
                  <FiEye size={13} />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  className="btn-card-action download"
                  onClick={() => {
                    downloadDocument(docItem);
                    showToast(`${docItem.title} downloaded.`);
                  }}
                >
                  <FiDownload size={13} />
                  <span>Download</span>
                </button>

                {docItem.status === 'Pending' && (
                  <button
                    type="button"
                    className="btn-card-action verify"
                    onClick={() => handleVerifyDocument(docItem.id)}
                  >
                    <FiCheck size={13} />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="bel-docs-empty-state">
            <div className="empty-icon-wrap">
              <FiFileText size={28} />
            </div>
            <h4>No documents found</h4>
            <p>Try searching for another employee, category, status, or reset your filters.</p>
            <button type="button" className="btn-clear-empty-filters" onClick={resetFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* 7. Mobile Filter Bottom Sheet */}
      {showFilters && (
        <div className="bel-modal-backdrop" onClick={() => setShowFilters(false)}>
          <div
            className="bel-bottom-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiFilter size={17} />
                <div>
                  <h4>Filter Documents</h4>
                  <span>Filter repository by employee, category, and status</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              <div className="sheet-form-group">
                <label>Filter by Employee</label>
                <div className="sheet-select-wrapper">
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                  >
                    {employeeOptions.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} {emp.id !== 'All' ? `(${emp.id})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sheet-form-group">
                <label>Document Category</label>
                <div className="sheet-select-wrapper">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({categoryCounts[cat] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sheet-form-group">
                <label>Verification Status</label>
                <div className="sheet-select-wrapper">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses ({documents.length})</option>
                    <option value="Verified">Verified ({verifiedCount})</option>
                    <option value="Pending">Pending Review ({pendingCount})</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sheet-footer-actions">
              <button type="button" className="btn-sheet-clear" onClick={resetFilters}>
                Clear All
              </button>
              <button
                type="button"
                className="btn-sheet-apply"
                onClick={() => {
                  setShowFilters(false);
                  showToast('Document filters applied.');
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Mobile Document View & Preview Bottom Sheet */}
      {selectedDocument && (
        <div className="bel-modal-backdrop" onClick={() => setSelectedDocument(null)}>
          <div
            className="bel-bottom-sheet-panel doc-preview-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <div className={`preview-type-badge type-${selectedDocument.type.toLowerCase()}`}>
                  {selectedDocument.type}
                </div>
                <div>
                  <h4>{selectedDocument.title}</h4>
                  <span>{selectedDocument.fileName}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close preview"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="sheet-content-scroll">
              {/* Document Preview Box */}
              <div className="doc-preview-visual-box">
                {selectedDocument.file && selectedDocument.file.type?.startsWith('image/') ? (
                  <div className="image-preview-wrap">
                    <img
                      src={URL.createObjectURL(selectedDocument.file)}
                      alt={selectedDocument.title}
                      className="preview-img-tag"
                    />
                  </div>
                ) : (
                  <div className="generic-doc-preview">
                    <FiFileText size={36} />
                    <strong>{selectedDocument.title}</strong>
                    <span>
                      Official HR record certified for {selectedDocument.employee} ({selectedDocument.employeeId})
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata Key-Value Grid */}
              <div className="doc-metadata-grid">
                <div className="meta-cell">
                  <span className="meta-lbl">Employee</span>
                  <strong className="meta-val">{selectedDocument.employee}</strong>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Employee ID</span>
                  <strong className="meta-val">{selectedDocument.employeeId}</strong>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Category</span>
                  <strong className="meta-val">{selectedDocument.category}</strong>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Upload Date</span>
                  <strong className="meta-val">{selectedDocument.uploaded}</strong>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">File Size</span>
                  <strong className="meta-val">{selectedDocument.size}</strong>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Status</span>
                  <span
                    className={`meta-status-tag ${
                      selectedDocument.status === 'Verified' ? 'verified' : 'pending'
                    }`}
                  >
                    {selectedDocument.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="preview-footer-action-grid">
              <button
                type="button"
                className="btn-preview-action download"
                onClick={() => {
                  downloadDocument(selectedDocument);
                  showToast('Document downloaded.');
                }}
              >
                <FiDownload size={14} />
                <span>Download</span>
              </button>

              {selectedDocument.status === 'Pending' && (
                <button
                  type="button"
                  className="btn-preview-action verify"
                  onClick={() => handleVerifyDocument(selectedDocument.id)}
                >
                  <FiCheck size={14} />
                  <span>Verify</span>
                </button>
              )}

              <button
                type="button"
                className="btn-preview-action remove"
                onClick={() => handleRemoveDocument(selectedDocument.id)}
              >
                <FiTrash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Mobile Upload Document Bottom Sheet */}
      {showUpload && (
        <div className="bel-modal-backdrop" onClick={() => setShowUpload(false)}>
          <div
            className="bel-bottom-sheet-panel upload-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-handle-bar" />

            <div className="sheet-header">
              <div className="sheet-header-title">
                <FiUploadCloud size={18} />
                <div>
                  <h4>Upload Employee Document</h4>
                  <span>Add records to the organization repository</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-sheet-close"
                onClick={() => setShowUpload(false)}
                aria-label="Close upload"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="sheet-content-scroll">
              <div className="sheet-form-group">
                <label>Target Employee *</label>
                <div className="sheet-select-wrapper">
                  <select
                    value={uploadData.employeeId}
                    onChange={(e) =>
                      setUploadData((current) => ({
                        ...current,
                        employeeId: e.target.value,
                      }))
                    }
                    required
                  >
                    {employeeOptions.filter((emp) => emp.id !== 'All').map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sheet-form-group">
                <label>Document Category *</label>
                <div className="sheet-select-wrapper">
                  <select
                    value={uploadData.category}
                    onChange={(e) =>
                      setUploadData((current) => ({
                        ...current,
                        category: e.target.value,
                      }))
                    }
                    required
                  >
                    {DOCUMENT_CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sheet-form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Previous Experience Certificate"
                  value={uploadData.documentName}
                  onChange={(e) =>
                    setUploadData((current) => ({
                      ...current,
                      documentName: e.target.value,
                    }))
                  }
                  className="sheet-text-input"
                  required
                />
              </div>

              {/* Upload Zone */}
              <div className="sheet-form-group">
                <label>Document File (Optional)</label>
                <div className="bel-mobile-upload-zone">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setUploadData((current) => ({
                        ...current,
                        file: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden-file-input"
                  />
                  <FiUploadCloud size={26} />
                  <strong>
                    {uploadData.file ? uploadData.file.name : 'Choose document file'}
                  </strong>
                  <span>PDF, DOC, DOCX, JPG or PNG (Max 15MB)</span>
                  <button
                    type="button"
                    className="btn-browse-files"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadData.file ? 'Change File' : 'Browse Device Files'}
                  </button>
                </div>
              </div>

              {/* Status Note */}
              <div className="upload-compliance-note">
                <FiClock size={14} />
                <span>
                  Uploaded documents will initially be marked <b>Pending</b> until HR review and verification.
                </span>
              </div>

              <div className="sheet-footer-actions">
                <button
                  type="button"
                  className="btn-sheet-clear"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sheet-apply">
                  <FiUploadCloud size={15} />
                  <span>Upload Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Toast Notification */}
      {toast && (
        <div className="bel-documents-toast-banner" role="status" aria-live="polite">
          <FiCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* 11. Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HRDocuments;
