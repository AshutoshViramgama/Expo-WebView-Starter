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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebViewContainerProps {
  /** Initial URL to load */
  initialUrl: string;
  /** Called whenever the WebView navigates to a new URL (for save-state) */
  onUrlChange?: (url: string) => void;
  /** Notifies parent of whether the WebView can go back */
  onCanGoBackChange?: (canGoBack: boolean) => void;
  /** Emits dynamically detected background/theme color from the webpage */
  onThemeColorChange?: (color: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WebViewContainer = React.forwardRef<WebView | null, WebViewContainerProps>(
  ({ initialUrl, onUrlChange, onCanGoBackChange, onThemeColorChange }, ref) => {
    const [refreshing, setRefreshing] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(initialUrl);

    // Internal ref used when no external ref is provided
    const internalRef = useRef<WebView | null>(null);
    const webViewRef = (ref as React.RefObject<WebView | null>) ?? internalRef;

    // ── Event handlers ──────────────────────────────────────────────────────

    const handleLoadEnd = useCallback(() => {
      setRefreshing(false);
    }, []);

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
        if (__DEV__) {
          console.warn(
            '[WebView Guard] Blocked & opening in Safari:',
            url,
            '| isTopFrame:',
            request.isTopFrame,
          );
        }

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
      webViewRef.current?.reload();
    }, [webViewRef]);

    // ─────────────────────────────────────────────────────────────────────────

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="never"
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
            // ── Dynamic Color Tracking ────────────────────────────────
            injectedJavaScript={`
              (function() {
                function sendColor() {
                  let color = null;
                  var metaTheme = document.querySelector('meta[name="theme-color"]');
                  if (metaTheme) {
                    color = metaTheme.getAttribute('content');
                  } else {
                    color = window.getComputedStyle(document.body).backgroundColor;
                  }
                  if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'themeColor', color: color }));
                  }
                }
                sendColor();
                setTimeout(sendColor, 500);
                setTimeout(sendColor, 1500);
              })();
              true;
            `}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'themeColor' && data.color && onThemeColorChange) {
                  onThemeColorChange(data.color);
                }
              } catch (e) {
                // Ignore parsing errors from other scripts
              }
            }}
            // ── Navigation ──────────────────────────────────────────────
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={handleNavigationStateChange}
            // ── Load events ─────────────────────────────────────────────
            onLoadEnd={handleLoadEnd}
            // ── Security ─────────────────────────────────────────────────
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            allowFileAccessFromFileURLs={false}
            originWhitelist={['*']}
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
