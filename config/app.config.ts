/**
 * app.config.ts
 *
 * Central configuration for the WebView app.
 * Edit this file (or the .env values) to customise the app for your project.
 *
 * ─────────────────────────────────────────────────────────
 *  HOW TO CUSTOMISE
 *  1. Copy .env.example → .env
 *  2. Set APP_BASE_URL and APP_ALLOWED_DOMAINS in .env
 *  3. Adjust FEATURES flags below as needed
 * ─────────────────────────────────────────────────────────
 */

import { APP_BASE_URL, APP_ALLOWED_DOMAINS, APP_ENV } from '@env';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Environment = 'development' | 'staging' | 'production';

export interface FeatureFlags {
  /** Show a pull-to-refresh spinner inside the WebView */
  enablePullToRefresh: boolean;
  /** Force all navigation to use HTTPS */
  httpsOnly: boolean;
  /** Enable the analytics stub (swap implementation in services/analytics.ts) */
  enableAnalytics: boolean;
  /** Register deep-link URL handler */
  enableDeepLinking: boolean;
  /** Follow system dark/light mode */
  enableDarkMode: boolean;
  /** Show a minimal branded header bar above the WebView */
  showHeader: boolean;
}

export interface AppConfig {
  /** Base URL loaded into the WebView on first launch */
  baseUrl: string;
  /**
   * Whitelist of allowed hostnames.
   * Navigation to any other host opens the system browser instead.
   * Example: ['example.com', 'api.example.com']
   */
  allowedDomains: string[];
  /** Current runtime environment */
  environment: Environment;
  /** Feature toggles */
  features: FeatureFlags;
  /** Milliseconds before showing an error instead of a loading spinner */
  loadTimeoutMs: number;
  /** WebView cache mode (Android). Maps to Android WebSettings.CacheMode */
  cacheMode: 'LOAD_DEFAULT' | 'LOAD_CACHE_ONLY' | 'LOAD_CACHE_ELSE_NETWORK' | 'LOAD_NO_CACHE';
  /** Deep-link URL scheme registered in app.json > scheme */
  deepLinkScheme: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a comma-separated list of domains from an env variable.
 * Falls back to the hostname extracted from BASE_URL when not provided.
 */
function parseAllowedDomains(envValue: string | undefined, baseUrl: string): string[] {
  if (envValue && envValue.trim().length > 0) {
    return envValue.split(',').map((d) => d.trim().toLowerCase());
  }
  try {
    return [new URL(baseUrl).hostname.toLowerCase()];
  } catch {
    return [];
  }
}

// ─── Config Object ────────────────────────────────────────────────────────────

const BASE_URL = APP_BASE_URL ?? 'https://example.com';
const ALLOWED_DOMAINS = parseAllowedDomains(APP_ALLOWED_DOMAINS, BASE_URL);
const ENVIRONMENT: Environment = (APP_ENV as Environment) ?? 'development';

const appConfig: AppConfig = {
  baseUrl: BASE_URL,
  allowedDomains: ALLOWED_DOMAINS,
  environment: ENVIRONMENT,

  features: {
    enablePullToRefresh: true,
    httpsOnly: true,
    enableAnalytics: false,   // set true and implement services/analytics.ts
    enableDeepLinking: true,
    enableDarkMode: true,
    showHeader: false,        // set true to show a header bar with app name
  },

  loadTimeoutMs: 15_000,

  cacheMode: ENVIRONMENT === 'production' ? 'LOAD_DEFAULT' : 'LOAD_NO_CACHE',

  deepLinkScheme: 'webviewapp', // must match app.json > expo.scheme
};

export default appConfig;
