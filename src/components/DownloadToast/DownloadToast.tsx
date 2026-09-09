import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import './DownloadToast.css';

interface ToastData {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
  fileName: string;
  time?: string;
}

export const DownloadToast: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToast({
        id: String(Date.now()),
        type: 'success',
        title: detail.title || 'Download Complete',
        message: detail.message || `${detail.fileName} downloaded successfully.`,
        fileName: detail.fileName,
        time: detail.time || 'Just now',
      });
    };

    const handleFailed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToast({
        id: String(Date.now()),
        type: 'error',
        title: 'Download Failed',
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
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

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
          onClick={() => {
            alert(`File saved: ${toast.fileName}\nLocation: Android Downloads / Documents Vault`);
          }}
        >
          <ExternalLink size={12} /> OPEN
        </button>
      )}

      <button className="toast-close-btn" onClick={() => setToast(null)} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};
