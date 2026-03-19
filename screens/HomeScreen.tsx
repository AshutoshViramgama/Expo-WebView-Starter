/**
 * screens/HomeScreen.tsx
 *
 * The single screen of the app. Orchestrates:
 *  - Network status (shows OfflineScreen when disconnected)
 *  - Persistent last-visited URL (useNavigationState)
 *  - Android back-button handling (useBackHandler)
 *  - Deep link handling (expo-linking)
 *  - WebViewContainer (the actual WebView)
 */

import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';

import appConfig from '../config/app.config';
import { useNavigationState } from '../hooks/useNavigationState';
import { useBackHandler } from '../hooks/useBackHandler';
import { useTheme } from '../hooks/useTheme';
import { handleDeepLink } from '../utils/deepLink';

import WebViewContainer from '../components/WebViewContainer';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  // Ensure we wait for initialUrl to be populated from async storage before mounting WebView,
  // to avoid loading baseUrl then immediately reloading the stored url.
  const { initialUrl, isLoadingUrl, saveUrl } = useNavigationState();
  const [canGoBack, setCanGoBack] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // ── Android hardware back button ─────────────────────────────────────────
  useBackHandler({ webViewRef, canGoBack });

  // ── Deep linking ─────────────────────────────────────────────────────────
  const handleUrl = useCallback(
    ({ url }: { url: string }) => {
      if (appConfig.features.enableDeepLinking && url) {
        handleDeepLink(url, webViewRef);
      }
    },
    [webViewRef],
  );

  // Handle deep links received while the app is already open
  React.useEffect(() => {
    if (!appConfig.features.enableDeepLinking) return;
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [handleUrl]);

  // Handle deep link that launched the app from cold start
  React.useEffect(() => {
    if (!appConfig.features.enableDeepLinking) return;
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url, webViewRef);
    });
  }, [webViewRef]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (isLoadingUrl) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebViewContainer
        ref={webViewRef}
        initialUrl={initialUrl}
        onUrlChange={saveUrl}
        onCanGoBackChange={setCanGoBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
