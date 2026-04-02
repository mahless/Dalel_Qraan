import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dalel.qraan',
  appName: 'دليل القران',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'body' as any,
      style: 'dark' as any,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
