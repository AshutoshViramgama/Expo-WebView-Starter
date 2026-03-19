/**
 * components/WebViewContainer.tsx
 *
 * The heart of the app — a fully-featured WebView wrapper with:
 *
 *  ✅ Domain whitelist enforcement (opens external URLs in system browser)
 *  ✅ HTTPS-only enforcement (optional, via config)
 *  ✅ Pull-to-refresh
 *  ✅ Load timeout with automatic error display
 *  ✅ onError / onHttpError callbacks
 *  ✅ System scheme handling (tel:, mailto:, etc.)
 *  ✅ Analytics page-view tracking stub
 *  ✅ Exposes ref for parent back-button handling
 *
 * Performance notes:
 *  - Wrapped in React.forwardRef so parents can call webViewRef.current.goBack()
 *  - React.memo on the ScrollView wrapper prevents unnecessary re-renders
 *  - domStorageEnabled + cacheMode set from config
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import WebView, {
  WebViewNavigation,
} from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import appConfig from '../config/app.config';
import { trackPageView } from '../services/analytics';
import { isDomainAllowed, isSystemScheme, ensureHttps } from '../utils/urlUtils';
import ErrorScreen from './ErrorScreen';
import LoadingIndicator from './LoadingIndicator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebViewContainerProps {
  /** Initial URL to load */
  initialUrl: string;
  /** Called whenever the WebView navigates to a new URL (for save-state) */
  onUrlChange?: (url: string) => void;
  /** Notifies parent of whether the WebView can go back */
  onCanGoBackChange?: (canGoBack: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WebViewContainer = React.forwardRef<WebView | null, WebViewContainerProps>(
  ({ initialUrl, onUrlChange, onCanGoBackChange }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorDescription, setErrorDescription] = useState<string | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(initialUrl);

    // Track the load-timeout timer so we can cancel it on successful load
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Internal ref used when no external ref is provided
    const internalRef = useRef<WebView | null>(null);
    const webViewRef = (ref as React.RefObject<WebView | null>) ?? internalRef;

    // ── Timeout management ──────────────────────────────────────────────────

    const startLoadTimeout = useCallback(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        setErrorDescription(
          `The page took too long to load (>${appConfig.loadTimeoutMs / 1000}s). Please check your connection.`,
        );
      }, appConfig.loadTimeoutMs);
    }, []);

    const cancelLoadTimeout = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, []);

    // ── Event handlers ──────────────────────────────────────────────────────

    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
      setHasError(false);
      startLoadTimeout();
    }, [startLoadTimeout]);

    const handleLoadEnd = useCallback(() => {
      cancelLoadTimeout();
      setIsLoading(false);
      setRefreshing(false);
    }, [cancelLoadTimeout]);

    const handleError = useCallback(
      (syntheticEvent: { nativeEvent: { description?: string } }) => {
        cancelLoadTimeout();
        setIsLoading(false);
        setHasError(true);
        setErrorDescription(syntheticEvent.nativeEvent.description);
      },
      [cancelLoadTimeout],
    );

    const handleHttpError = useCallback(
      (syntheticEvent: { nativeEvent: { description?: string; statusCode?: number } }) => {
        const { statusCode, description } = syntheticEvent.nativeEvent;
        if (statusCode && statusCode >= 500) {
          cancelLoadTimeout();
          setIsLoading(false);
          setHasError(true);
          setErrorDescription(description ?? `Server error (HTTP ${statusCode})`);
        }
      },
      [cancelLoadTimeout],
    );

    const handleProgress = useCallback(() => {
      // Progress events confirm the page is actively loading: reset timeout window
      startLoadTimeout();
    }, [startLoadTimeout]);

    const handleNavigationStateChange = useCallback(
      (navState: WebViewNavigation) => {
        onCanGoBackChange?.(navState.canGoBack);
        if (navState.url && navState.url !== currentUrl) {
          setCurrentUrl(navState.url);
          onUrlChange?.(navState.url);
          trackPageView(navState.url);
        }
      },
      [currentUrl, onCanGoBackChange, onUrlChange],
    );

    /**
     * Domain guard: called before every navigation request.
     * Returns true to allow, false to block (and open externally if http/https).
     */
    const handleShouldStartLoadWithRequest = useCallback(
      (request: ShouldStartLoadRequest): boolean => {
        const url = request.url;

        // If this is an iframe (not the main page), allow it to load inside the webview.
        // Third-party scripts like Google reCAPTCHA, ads, and video embeds rely on this.
        if (request.isTopFrame === false) return true;

        // Always allow about:blank (used internally by WebView)
        if (url === 'about:blank') return true;

        // Handle system schemes (tel:, mailto:, etc.)
        if (isSystemScheme(url)) {
          Linking.openURL(url).catch(() => {
            if (__DEV__) console.warn('[WebView] Cannot open system URL:', url);
          });
          return false;
        }

        // Apply HTTPS enforcement
        const safeUrl = ensureHttps(url, appConfig.features.httpsOnly);
        if (safeUrl !== url) {
          // Redirect to https version; the next request will be allowed
          webViewRef.current?.injectJavaScript(
            `window.location.replace(${JSON.stringify(safeUrl)}); true;`,
          );
          return false;
        }

        // Allow whitelisted domains
        if (isDomainAllowed(url, appConfig.allowedDomains)) {
          return true;
        }

        // Open external URLs in the system browser
        Linking.openURL(url).catch(() => {
          if (__DEV__) console.warn('[WebView] Cannot open external URL:', url);
        });
        return false;
      },
      [webViewRef],
    );

    // ── Refresh ─────────────────────────────────────────────────────────────

    const handleRefresh = useCallback(() => {
      setRefreshing(true);
      setHasError(false);
      webViewRef.current?.reload();
    }, [webViewRef]);

    // ── Retry ───────────────────────────────────────────────────────────────

    const handleRetry = useCallback(() => {
      setHasError(false);
      setIsLoading(true);
      webViewRef.current?.reload();
    }, [webViewRef]);

    // ─────────────────────────────────────────────────────────────────────────

    if (hasError) {
      return <ErrorScreen errorDescription={errorDescription} onRetry={handleRetry} />;
    }

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            appConfig.features.enablePullToRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            ) : undefined
          }
        >
          <WebView
            ref={ref ?? internalRef}
            style={styles.webView}
            source={{ uri: currentUrl }}
            // ── Navigation ──────────────────────────────────────────────
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={handleNavigationStateChange}
            // ── Load events ─────────────────────────────────────────────
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleHttpError}
            onLoadProgress={handleProgress}
            // ── Security ─────────────────────────────────────────────────
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            allowFileAccessFromFileURLs={false}
            originWhitelist={appConfig.allowedDomains.map((d) => `https://${d}`).concat(
              appConfig.features.httpsOnly
                ? []
                : appConfig.allowedDomains.map((d) => `http://${d}`),
            )}
            // ── Performance ──────────────────────────────────────────────
            cacheEnabled
            domStorageEnabled
            javaScriptEnabled
            // ── Android ──────────────────────────────────────────────────
            {...(Platform.OS === 'android' && {
              overScrollMode: 'never' as const,
              setSupportMultipleWindows: false,
              cacheMode: appConfig.cacheMode as import('react-native-webview/lib/WebViewTypes').CacheMode,
            })}
            // ── iOS ───────────────────────────────────────────────────────
            {...(Platform.OS === 'ios' && {
              allowsBackForwardNavigationGestures: true,
              allowsInlineMediaPlayback: true,
              dataDetectorTypes: 'none',
            })}
          />
        </ScrollView>
        {isLoading && <LoadingIndicator />}
      </View>
    );
  },
);

WebViewContainer.displayName = 'WebViewContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});

export default React.memo(WebViewContainer);
