/**
 * types/env.d.ts
 *
 * TypeScript declarations for environment variables imported from '@env'.
 * Keep this in sync with .env.example.
 */

declare module '@env' {
  /** The base URL loaded in the WebView on first launch */
  export const APP_BASE_URL: string | undefined;

  /** Comma-separated list of whitelisted domains */
  export const APP_ALLOWED_DOMAINS: string | undefined;

  /** Runtime environment: development | staging | production */
  export const APP_ENV: string | undefined;
}
