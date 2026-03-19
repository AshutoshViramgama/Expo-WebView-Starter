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
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useNavigationState } from '../hooks/useNavigationState';
import { useBackHandler } from '../hooks/useBackHandler';
import { useTheme } from '../hooks/useTheme';
import { handleDeepLink } from '../utils/deepLink';

import WebViewContainer from '../components/WebViewContainer';
import OfflineScreen from '../components/OfflineScreen';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { isConnected, isLoading: isNetworkLoading } = useNetworkStatus();
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

  // ── Retry after offline recovery ─────────────────────────────────────────
  const handleRetryConnection = useCallback(() => {
    // useNetworkStatus will re-render when connectivity is restored;
    // pressing retry here just causes a re-render that shows the WebView again.
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  // Wait until both network status and stored URL are resolved
  if (isNetworkLoading || isLoadingUrl) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <OfflineScreen onRetry={handleRetryConnection} />
      </View>
    );
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
