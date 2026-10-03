import type { CapacitorConfig } from '@capacitor/cli';

// Native wrapper for the Android APK. The PWA stays the primary distribution (spec §2);
// the APK is built by .github/workflows/android.yml with VITE_BASE=/ so assets resolve at the root.
const config: CapacitorConfig = {
  appId: 'app.kotodama',
  appName: 'Kotodama',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  android: { allowMixedContent: false, backgroundColor: '#E9F0E6' },
};

export default config;
