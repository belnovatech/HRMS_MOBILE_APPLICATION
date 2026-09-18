import axios, { AxiosError } from 'axios';

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV && typeof window !== 'undefined' && !window.location.origin.startsWith('capacitor://')
    ? '/api'
    : 'https://belnova-hrms-api.onrender.com/api');
const baseURL = rawBaseUrl.replace(/\/+$/, '');

export const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const url = err.config?.url?.toLowerCase() || '';
    if (err.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/verify-otp')) {
      localStorage.removeItem('token');
      localStorage.removeItem('belnova_user');
    }
    return Promise.reject(err);
  }
);

export const getApiErrorMessage = (error: any, fallbackMessage?: string): string => {
  if (!error) return fallbackMessage || 'An unexpected error occurred.';
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.title) return data.title;
    if (data.message) return data.message;
    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return String(messages[0]);
    }
  }
  if (error.message) {
    if (error.message.includes('Network Error')) {
      return 'Network error: Please check your internet connection or backend server status.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timeout: Backend server took too long to respond.';
    }
    return error.message;
  }
  return 'Unable to reach the server. Please try again.';
};

export default client;
