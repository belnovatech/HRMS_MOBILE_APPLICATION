import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import { openNativeFile } from '../../services/downloadService';
import './DownloadToast.css';

interface ToastData {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
  fileName: string;
  filePath?: string;
  mimeType?: string;
  time?: string;
}

export const DownloadToast: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToast({
        id: String(Date.now()),
        type: 'success',
        title: detail.title || '✓ Download Complete',
        message: detail.message || `${detail.fileName} saved successfully.`,
        fileName: detail.fileName,
        filePath: detail.filePath,
        mimeType: detail.mimeType,
        time: detail.time || 'Just now',
      });
    };

    const handleFailed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToast({
        id: String(Date.now()),
        type: 'error',
        title: '✕ Download Failed',
        message: detail.error || `Could not save ${detail.fileName}. Please try again.`,
        fileName: detail.fileName,
        time: 'Just now',
      });
    };

    window.addEventListener('hrms-download-completed', handleSuccess);
    window.addEventListener('hrms-download-failed', handleFailed);

    return () => {
      window.removeEventListener('hrms-download-completed', handleSuccess);
      window.removeEventListener('hrms-download-failed', handleFailed);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const handleOpen = async () => {
    setIsOpening(true);
    try {
      await openNativeFile(toast.filePath || toast.fileName, toast.mimeType);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className={`download-toast-banner toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      </div>

      <div className="toast-body">
        <div className="toast-top-row">
          <strong className="toast-title">{toast.title}</strong>
          <span className="toast-time">{toast.time}</span>
        </div>
        <p className="toast-msg">{toast.message}</p>
      </div>

      {toast.type === 'success' && (
        <button
          className="toast-open-btn"
          onClick={handleOpen}
          disabled={isOpening}
          title="Open in device viewer"
        >
          {isOpening ? <Loader2 size={12} className="spin-icon" /> : <ExternalLink size={12} />}
          <span>OPEN</span>
        </button>
      )}

      <button className="toast-close-btn" onClick={() => setToast(null)} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};

export default DownloadToast;
