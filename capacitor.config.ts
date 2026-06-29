import type { CapacitorConfig } from '@capacitor/cli'

const isProduction = process.env.NODE_ENV === 'production'

const config: CapacitorConfig = {
  appId: 'com.ardiyesizgiris.web',
  appName: 'Ardiyesiz Giriş',
  webDir: 'out',

  // Production: live Vercel domain serves the web UI + API.
  // Development (cleartext: true): allows localhost testing in the
  // Capacitor webview without SSL errors.  Remove cleartext + url
  // for production.
  server: isProduction
    ? {
        url: 'https://www.ardiyesizgiris.com',
        cleartext: false,
      }
    : {
        cleartext: true,
      },

  // iOS-specific configuration
  ios: {
    contentInset: 'always',
    // URL scheme for deep link fallback — must match the scheme
    // registered in Xcode under Info → URL Types.
    scheme: 'ardiyesizgiris',
    // Allow the webview to scroll beyond safe-area insets so the
    // PWA bottom tab bar and notch-safe CSS work as designed.
    allowsLinkPreview: true,
  },

  // Android-specific configuration
  android: {
    // Allow mixed content only in dev — production serves over HTTPS.
    allowMixedContent: !isProduction,
    // Path to the AndroidManifest.xml — set here so Capacitor CLI
    // can inject permissions and intent filters during `cap sync`.
    // Default: android/app/src/main/AndroidManifest.xml
  },

  // Capacitor plugins registered at the JS bridge level.
  // Native plugins (App, SplashScreen, etc.) still need `npm install`
  // and `npx cap sync` to link the native side.
  plugins: {
    // App plugin handles deep links / URL open events.
    // Install: npm install @capacitor/app
    // App: {
    //   // No extra config needed — App.addListener('appUrlOpen', ...)
    //   // in the web app handles incoming URL events.
    // },
  },
}

export default config
