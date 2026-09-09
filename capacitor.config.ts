import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.belnova.hrmsmobile',
  appName: 'Belnova HRMS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
