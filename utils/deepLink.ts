/**
 * deepLink.ts
 *
 * Handles incoming deep links and routes them to the WebView.
 *
 * Deep link format: webviewapp://path?query=value
 * → Opens: <BASE_URL>/path?query=value
 */

import { WebView } from 'react-native-webview';
import appConfig from '../config/app.config';

/**
 * Converts an app deep-link URL into a full web URL and navigates the WebView.
 *
 * @param deepLinkUrl  - The deep link URL received by the app (e.g. "webviewapp://blog/post?id=1")
 * @param webViewRef   - RefObject pointing to the WebView component
 */
export function handleDeepLink(
  deepLinkUrl: string,
  webViewRef: React.RefObject<WebView | null>,
): void {
  if (!deepLinkUrl || !webViewRef.current) return;

  try {
    const scheme = `${appConfig.deepLinkScheme}://`;

    // Strip the custom scheme to get the path + query portion
    const pathAndQuery = deepLinkUrl.startsWith(scheme)
      ? deepLinkUrl.slice(scheme.length)
      : deepLinkUrl;

    // Combine with the base URL (strip trailing slash to avoid double slashes)
    const base = appConfig.baseUrl.replace(/\/$/, '');
    const targetUrl = `${base}/${pathAndQuery}`;

    // Navigate the WebView
    webViewRef.current.injectJavaScript(
      `window.location.href = ${JSON.stringify(targetUrl)}; true;`,
    );
  } catch (err) {
    // Silently ignore malformed deep links
    if (__DEV__) {
      console.warn('[deepLink] Failed to handle deep link:', deepLinkUrl, err);
    }
  }
}
