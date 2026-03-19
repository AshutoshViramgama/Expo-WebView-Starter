/**
 * components/ErrorScreen.tsx
 *
 * Displayed when the WebView fails to load a page (HTTP error, timeout, or
 * network failure while online).
 *
 * Props:
 *  - errorDescription: human-readable reason for the failure
 *  - onRetry: called when the user presses the retry button
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ErrorScreenProps {
  errorDescription?: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorDescription = 'Something went wrong while loading the page.',
  onRetry,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Icon */}
      <Text style={styles.icon}>⚠️</Text>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Page Failed to Load</Text>

      {/* Error detail */}
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {errorDescription}
      </Text>

      {/* Retry button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading page"
      >
        <Text style={styles.buttonText}>Retry</Text>
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

export default React.memo(ErrorScreen);
