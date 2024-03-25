import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.alwadaq.user.com',
  appName: 'مياه الودق',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: ['*'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
