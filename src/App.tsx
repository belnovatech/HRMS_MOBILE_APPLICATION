import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './navigation/AppRouter';
import { DownloadToast } from './components/DownloadToast/DownloadToast';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DownloadToast />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
