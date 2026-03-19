/**
 * hooks/useNetworkStatus.ts
 *
 * Monitors the device's internet connectivity and returns a live boolean.
 * Components can use this to show the OfflineScreen when connectivity is lost.
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  /** true when the device has an active internet connection */
  isConnected: boolean;
  /** true on the very first render before NetInfo resolves */
  isLoading: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch the current state immediately on mount
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      setIsLoading(false);
    });

    // Subscribe to future changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return { isConnected, isLoading };
}
