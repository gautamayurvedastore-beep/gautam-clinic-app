import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gautamclinic.patientapp',
  appName: 'Gautam Ayurveda',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
