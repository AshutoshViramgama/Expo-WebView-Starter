/**
 * hooks/useBackHandler.ts
 *
 * Android hardware back-button handler.
 *
 * Behaviour:
 *  - If the WebView can go back → navigate back inside the WebView
 *  - If there is no WebView history → exit the app
 *
 * On iOS this hook is a no-op (gesture navigation is handled natively).
 */

import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface BackHandlerOptions {
  /** Ref to the WebView component */
  webViewRef: React.RefObject<WebView | null>;
  /** Current value of WebView's canGoBack — updated via onNavigationStateChange */
  canGoBack: boolean;
}

export function useBackHandler({ webViewRef, canGoBack }: BackHandlerOptions): void {
  // Keep a mutable ref so the BackHandler callback always reads the latest value
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS !== 'android') return; // iOS: no-op

    const handleBackPress = (): boolean => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent default (exit app)
      }
      return false; // let the system handle it (close app)
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [webViewRef]);
}
