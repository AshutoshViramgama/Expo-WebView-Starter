/**
 * services/analytics.ts
 *
 * Analytics stub – replace the bodies of these functions with your preferred
 * analytics SDK (Firebase Analytics, Mixpanel, Amplitude, etc.).
 *
 * All calls are guarded by the `enableAnalytics` feature flag in app.config.ts,
 * so no events are sent unless you explicitly enable it.
 */

import appConfig from '../config/app.config';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventProperties = Record<string, string | number | boolean | undefined>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEnabled(): boolean {
  return appConfig.features.enableAnalytics;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Track a page / screen view whenever the WebView navigates to a new URL.
 *
 * @param url - The URL the WebView navigated to
 */
export function trackPageView(url: string): void {
  if (!isEnabled()) return;

  // TODO: replace with your SDK call, e.g.:
  // analytics().logScreenView({ screen_name: url, screen_class: 'WebView' });

  if (__DEV__) {
    console.log('[analytics] pageView:', url);
  }
}

/**
 * Track a custom event.
 *
 * @param name  - Event name (snake_case recommended)
 * @param props - Optional key-value properties attached to the event
 */
export function trackEvent(name: string, props?: EventProperties): void {
  if (!isEnabled()) return;

  // TODO: replace with your SDK call, e.g.:
  // analytics().logEvent(name, props);

  if (__DEV__) {
    console.log('[analytics] event:', name, props);
  }
}

/**
 * Identify the current user (e.g. after login).
 *
 * @param userId - Unique identifier for the user
 */
export function identifyUser(userId: string): void {
  if (!isEnabled()) return;

  // TODO: replace with your SDK call, e.g.:
  // analytics().setUserId(userId);

  if (__DEV__) {
    console.log('[analytics] identify:', userId);
  }
}
