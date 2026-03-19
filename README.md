<div align="center">

# 📱 Expo WebView Starter

**A production-ready, plug-and-play Expo + React Native template that wraps any URL in a fully native mobile app.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react)](https://reactnative.dev/)

---

**🚀 3 steps to ship:**
```
git clone <repo>  →  change URL in .env  →  npx expo start
```

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌐 **WebView Wrapper** | Loads any URL inside the app using `react-native-webview` |
| 🔒 **Domain Whitelist** | Blocks navigation to non-whitelisted domains; opens externally |
| 🔐 **HTTPS Enforcement** | Optionally upgrades all `http://` to `https://` |
| 💾 **Persistent State** | Remembers last-visited URL via AsyncStorage |
| 🔄 **Pull-to-Refresh** | Drag-to-reload gesture (configurable) |
| 🤖 **Android Back Button** | Goes back in WebView history or exits app |
| 🔗 **External Links** | Opens outside-domain URLs in system browser |
| 🔔 **Deep Linking** | Opens `expowebviewstarter://path` → loads matching web path |
| 🌙 **Dark Mode** | Follows system light/dark mode automatically |
| 🎛 **Feature Flags** | Toggle every feature in one config file |
| 📊 **Analytics Stub** | Drop-in placeholder for Firebase/Mixpanel |
| 🛠 **DX Ready** | TypeScript strict mode, ESLint, Prettier |

---

## 📁 Project Structure

```
expo-webview-starter/
├── App.tsx                  # Root entry point (minimal)
├── app.json                 # Expo app config (name, icon, scheme)
├── babel.config.js          # Babel: .env support + path aliases
├── tsconfig.json            # TypeScript: strict mode + path aliases
├── .env                     # Your environment variables (gitignored)
├── .env.example             # Template for .env
├── .eslintrc.js             # ESLint rules
├── .prettierrc              # Prettier config
│
├── config/
│   └── app.config.ts        # ⭐ Central config: URL, domains, flags
│
├── hooks/
│   ├── useNavigationState.ts # Persistent last-URL with debounced save
│   ├── useBackHandler.ts    # Android hardware back button
│   └── useTheme.ts          # System dark/light mode tokens
│
├── components/
│   ├── WebViewContainer.tsx # Core WebView with all features
│
├── screens/
│   └── HomeScreen.tsx       # Orchestrates hooks + components
│
├── services/
│   ├── storage.ts           # AsyncStorage wrappers (getLastUrl, saveLastUrl)
│   └── analytics.ts         # Analytics stub (trackPageView, trackEvent)
│
├── utils/
│   ├── urlUtils.ts          # isDomainAllowed, ensureHttps, etc.
│   └── deepLink.ts          # Deep link → WebView navigation
│
└── types/
    └── env.d.ts             # TypeScript declarations for @env module
```

**Why this structure?**
- **`config/`** — single source of truth for all runtime settings
- **`hooks/`** — reusable, testable stateful logic extracted from UI
- **`components/`** — pure presentation components with no business logic
- **`screens/`** — thin orchestration layer that wires hooks + components
- **`services/`** — I/O abstractions (storage, analytics) easy to swap
- **`utils/`** — pure functions with zero side effects

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Xcode 15+ (Mac only) | Android: Android Studio + SDK

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/expo-webview-starter-starter.git
cd expo-webview-starter-starter
npm install
```

### 2. Configure Your URL

```bash
cp .env.example .env
```

Edit `.env`:
```env
APP_BASE_URL=https://your-website.com
APP_ALLOWED_DOMAINS=your-website.com,www.your-website.com
APP_ENV=development
```

### 3. Run the App

```bash
# Expo Go (fastest — no build required)
npx expo start

# Then press:  a = Android emulator  |  i = iOS simulator  |  scan QR = device
```

---

## 📱 Running with Expo Go

1. Install **Expo Go** from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npx expo start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

> **Note:** `react-native-webview` works in Expo Go. No prebuild required for development.

---

## 🖥 Running with React Native CLI (Bare Workflow)

If you've ejected or want to use the bare workflow:

```bash
# Generate native project files
npx expo prebuild

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 📦 Build for Production

### Android APK (for direct installation)

```bash
# Using EAS Build (recommended)
npx eas build --platform android --profile production

# Or local build (requires Android Studio)
npx expo prebuild
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Android AAB (for Google Play Store)

```bash
# EAS Build
npx eas build --platform android --profile production

# Or local:
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS (App Store / TestFlight)

```bash
# EAS Build (recommended — no Mac required for archive)
npx eas build --platform ios --profile production

# Local build (requires Mac + Xcode)
npx expo prebuild
cd ios && xcodebuild archive -scheme expowebviewstarter
```

#### First-time EAS Setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

| Variable | Description | Example |
|---|---|---|
| `APP_BASE_URL` | Initial URL loaded in the WebView | `https://example.com` |
| `APP_ALLOWED_DOMAINS` | Comma-separated whitelist of domains | `example.com,www.example.com` |
| `APP_ENV` | Runtime environment | `development` \| `staging` \| `production` |

### Feature Flags (`config/app.config.ts`)

```typescript
features: {
  enablePullToRefresh: true,    // Drag-to-reload gesture
  httpsOnly: true,              // Force HTTPS for all navigation
  enableAnalytics: false,       // Enable analytics tracking
  enableDeepLinking: true,      // Handle expowebviewstarter:// deep links
  enableDarkMode: true,         // Follow system dark/light mode
  showHeader: false,            // Show branded header bar
}
```

### Timeouts & Cache

```typescript
cacheMode: 'LOAD_DEFAULT',      // Android cache mode (production)
```

---

## 🎨 Customizing Branding

### App Name
Edit `app.json`:
```json
{ "expo": { "name": "My App", "slug": "my-app" } }
```

### App Icon
Replace `assets/icon.png` with your icon (1024×1024 PNG, no alpha).  
Replace `assets/android-icon-foreground.png` for adaptive icon foreground.

### Splash Screen
Replace `assets/splash-icon.png` with your logo.  
Change `backgroundColor` in `app.json > expo.splash`.

### Colors & Typography
Edit theme tokens in `hooks/useTheme.ts`:
```typescript
const lightTheme = {
  colors: {
    primary: '#007AFF',  // ← Change your brand colour here
    background: '#FFFFFF',
    // ...
  }
}
```

---

## 🔗 Deep Linking

The app registers the `expowebviewstarter://` URL scheme. To open a specific path:

```
expowebviewstarter://blog/post?id=123
→ Opens: https://your-website.com/blog/post?id=123
```

To change the scheme, update:
1. `app.json > expo.scheme`
2. `config/app.config.ts > deepLinkScheme`

---

## 📊 Analytics

By default, analytics is a no-op stub. To enable:

1. Set `features.enableAnalytics: true` in `config/app.config.ts`
2. Install your SDK: `npx expo install @react-native-firebase/analytics`
3. Implement the functions in `services/analytics.ts`

---

## 🔒 Security Notes

- **Domain Whitelist**: Navigation to any domain not in `ALLOWED_DOMAINS` opens the system browser instead of loading in-app. Subdomains of whitelisted domains are also allowed.
- **HTTPS Only**: When `httpsOnly: true`, any `http://` URL is upgraded to `https://` before loading.
- **File Access Disabled**: `allowFileAccess`, `allowUniversalAccessFromFileURLs`, and `allowFileAccessFromFileURLs` are all set to `false`.
- **Multiple Windows Disabled**: `setSupportMultipleWindows: false` prevents pop-up windows.
- **System Schemes**: `tel:`, `mailto:`, `intent:` etc. are handed off to the OS, not loaded in the WebView.
- **Bundle IDs**: Update `ios.bundleIdentifier` and `android.package` in `app.json` before publishing.

---

## 🧪 Development Commands

```bash
npm start           # Start Expo dev server
npm run android     # Open Android emulator
npm run ios         # Open iOS simulator
npm run type-check  # TypeScript compilation check
npm run lint        # ESLint check
npm run format      # Prettier format (write)
npm run format:check # Prettier format (CI check)
npm run prebuild    # Generate native iOS/Android project files
```

---

## 🛠 Troubleshooting

**App opens in Safari / External Browser instead of in-app:**
1. Check that your `APP_ALLOWED_DOMAINS` in `.env` is correct.
2. During development, if you change `.env`, the app might still try to load the **old URL** it saved in `AsyncStorage`. Our `useNavigationState` hook automatically drops old URLs if they don't match your new allowed domains, but if you still experience issues, wipe the app data from your simulator/device to clear the storage.

**Blank Screen / Build Fails:**
Ensure your Expo and React Native versions match. If you encounter issues, run `npx expo install --fix` to verify dependencies.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style

- TypeScript strict mode enforced
- ESLint + Prettier must pass (`npm run lint && npm run format:check`)
- Keep `config/app.config.ts` as the single source of truth
- Extract business logic into hooks; keep components presentational

---

<div align="center">
  Made with ❤️ for the React Native community
  <br/>
  <a href="#-expo-webview-starter-starter">↑ Back to top</a>
</div>
