import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.alwadaq.com',
  appName: 'alwadaq-app',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: ['*'],
  },
};

export default config;
