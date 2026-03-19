/**
 * hooks/useNavigationState.ts
 *
 * Loads the persisted last-visited URL on mount,
 * and provides a debounced `saveUrl` function to update it.
 *
 * This gives the app "resume from where you left off" behaviour.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLastUrl, saveLastUrl } from '../services/storage';
import appConfig from '../config/app.config';
import { isDomainAllowed } from '../utils/urlUtils';

interface NavigationState {
  /** URL to load in the WebView (last visited, or BASE_URL as fallback) */
  initialUrl: string;
  /** true while loading the stored URL from AsyncStorage */
  isLoadingUrl: boolean;
  /**
   * Call this whenever the WebView navigates to a new URL.
   * Persists the URL with a 500ms debounce to avoid excessive writes.
   */
  saveUrl: (url: string) => void;
}

/** Debounce delay in milliseconds before writing to AsyncStorage */
const DEBOUNCE_MS = 500;

export function useNavigationState(): NavigationState {
  const [initialUrl, setInitialUrl] = useState<string>(appConfig.baseUrl);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted URL on mount
  useEffect(() => {
    (async () => {
      const stored = await getLastUrl();
      // Only restore the URL if it belongs to one of the currently allowed domains.
      // E.g., if .env domains change, we want to discard the old URL.
      if (stored && isDomainAllowed(stored, appConfig.allowedDomains)) {
        setInitialUrl(stored);
      }
      setIsLoadingUrl(false);
    })();
  }, []);

  // Debounced save to avoid AsyncStorage thrash during rapid navigation
  const saveUrl = useCallback((url: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      saveLastUrl(url);
    }, DEBOUNCE_MS);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return { initialUrl, isLoadingUrl, saveUrl };
}
