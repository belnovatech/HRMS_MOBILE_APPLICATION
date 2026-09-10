import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  FileSpreadsheet,
  Download,
  Share2,
  ExternalLink,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { openNativeFile, shareNativeFile } from '../../services/downloadService';
import './DocumentDownloadModal.css';

export interface DocumentDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fileName?: string;
  filePath?: string;
  mimeType?: string;
  status: 'idle' | 'generating' | 'downloading' | 'complete' | 'failed';
  errorMessage?: string;
  onRetry?: () => void;
}

export const DocumentDownloadModal: React.FC<DocumentDownloadModalProps> = ({
  isOpen,
  onClose,
  title = 'Document Download',
  fileName = 'Document.pdf',
  filePath,
  mimeType,
  status,
  errorMessage,
  onRetry,
}) => {
  const [opening, setOpening] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  const isCsv = fileName.endsWith('.csv');

  const handleOpen = async () => {
    setOpening(true);
    setFeedbackMsg(null);
    try {
      const res = await openNativeFile(filePath || fileName, mimeType);
      if (!res.success && res.error) {
        setFeedbackMsg(res.error);
      }
    } catch (err: any) {
      setFeedbackMsg('Could not open file in system viewer.');
    } finally {
      setOpening(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setFeedbackMsg(null);
    try {
      const res = await shareNativeFile(filePath || fileName, mimeType, `Share ${fileName}`);
      if (!res.success && res.error) {
        setFeedbackMsg(res.error);
      }
    } catch (err: any) {
      setFeedbackMsg('Unable to share file.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="doc-dl-modal-overlay" onClick={onClose}>
      <div className="doc-dl-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="doc-dl-modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="doc-dl-icon-container">
          {status === 'generating' || status === 'downloading' ? (
            <div className="doc-dl-icon-spinner">
              <Loader2 size={38} className="spin-icon" />
            </div>
          ) : status === 'complete' ? (
            <div className="doc-dl-icon-badge success">
              <CheckCircle2 size={36} />
            </div>
          ) : status === 'failed' ? (
            <div className="doc-dl-icon-badge error">
              <AlertCircle size={36} />
            </div>
          ) : isExcel || isCsv ? (
            <div className="doc-dl-icon-badge file">
              <FileSpreadsheet size={36} />
            </div>
          ) : (
            <div className="doc-dl-icon-badge file">
              <FileText size={36} />
            </div>
          )}
        </div>

        {/* Title & Status */}
        <h3 className="doc-dl-title">
          {status === 'generating'
            ? 'Generating document...'
            : status === 'downloading'
            ? 'Downloading to device...'
            : status === 'complete'
            ? '✓ Download Complete'
            : status === 'failed'
            ? '✕ Download Failed'
            : title}
        </h3>

        {/* File Card Info */}
        <div className="doc-dl-file-card">
          <div className="doc-dl-file-icon">
            {isExcel || isCsv ? <FileSpreadsheet size={22} /> : <FileText size={22} />}
          </div>
          <div className="doc-dl-file-details">
            <strong className="doc-dl-file-name" title={fileName}>
              {fileName}
            </strong>
            <span className="doc-dl-file-location">
              {status === 'complete'
                ? 'Saved locally to Device Downloads'
                : 'Official verified Belnova document'}
            </span>
          </div>
        </div>

        {/* Feedback / Error Message */}
        {status === 'failed' && (
          <div className="doc-dl-error-box">
            <p>{errorMessage || 'Unable to download the document. Please try again.'}</p>
          </div>
        )}

        {feedbackMsg && (
          <div className="doc-dl-feedback-box">
            <AlertCircle size={15} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="doc-dl-actions">
          {status === 'complete' && (
            <>
              <button
                type="button"
                className="doc-dl-btn primary"
                onClick={handleOpen}
                disabled={opening}
              >
                {opening ? (
                  <Loader2 size={16} className="spin-icon" />
                ) : (
                  <ExternalLink size={16} />
                )}
                <span>Open File</span>
              </button>

              <button
                type="button"
                className="doc-dl-btn secondary"
                onClick={handleShare}
                disabled={sharing}
              >
                {sharing ? <Loader2 size={16} className="spin-icon" /> : <Share2 size={16} />}
                <span>Share</span>
              </button>
            </>
          )}

          {status === 'failed' && onRetry && (
            <button type="button" className="doc-dl-btn primary retry" onClick={onRetry}>
              <RotateCcw size={16} />
              <span>Retry Download</span>
            </button>
          )}

          {(status === 'generating' || status === 'downloading') && (
            <div className="doc-dl-progress-bar-wrap">
              <div className="doc-dl-progress-bar">
                <div className="doc-dl-progress-fill" />
              </div>
              <span className="doc-dl-progress-text">Please wait...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
