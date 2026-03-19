/**
 * components/OfflineScreen.tsx
 *
 * Displayed when the device has no internet connection.
 * Shows a descriptive message and a retry button.
 * The `onRetry` callback is called when the user presses the button —
 * the parent (HomeScreen) then re-checks connectivity.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface OfflineScreenProps {
  onRetry: () => void;
}

const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Icon */}
      <Text style={styles.icon}>📡</Text>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>No Internet Connection</Text>

      {/* Message */}
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        Please check your Wi-Fi or cellular data and try again.
      </Text>

      {/* Retry button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry connection"
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(OfflineScreen);
