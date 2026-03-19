/**
 * components/LoadingIndicator.tsx
 *
 * Full-screen centred loading spinner shown while the WebView is loading.
 * Themed to match the current light/dark mode.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const LoadingIndicator: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default React.memo(LoadingIndicator);
