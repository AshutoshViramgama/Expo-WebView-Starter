/**
 * App.tsx – Root entry point
 *
 * Keeps this file intentionally minimal:
 * all business logic lives in screens/ and hooks/.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from './hooks/useTheme';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <HomeScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
