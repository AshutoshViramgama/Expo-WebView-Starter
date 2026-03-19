/**
 * services/storage.ts
 *
 * Persistent key-value storage built on AsyncStorage.
 * Centralises all storage keys to avoid typos and collisions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  LAST_URL: '@webview_app/last_url',
} as const;

// ─── Last URL ─────────────────────────────────────────────────────────────────

/**
 * Returns the last URL visited by the user, or null if none is stored yet.
 */
export async function getLastUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.LAST_URL);
  } catch (err) {
    if (__DEV__) console.warn('[storage] getLastUrl error:', err);
    return null;
  }
}

/**
 * Persists the currently visited URL so it can be restored on next launch.
 */
export async function saveLastUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_URL, url);
  } catch (err) {
    if (__DEV__) console.warn('[storage] saveLastUrl error:', err);
  }
}

/**
 * Clears the stored last URL (useful during logout / reset flows).
 */
export async function clearLastUrl(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.LAST_URL);
  } catch (err) {
    if (__DEV__) console.warn('[storage] clearLastUrl error:', err);
  }
}
