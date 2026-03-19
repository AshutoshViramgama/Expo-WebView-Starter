/**
 * ESLint configuration for the WebView Starter App.
 * Uses TypeScript-aware rules + React / React Native / React Hooks plugins.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    es6: true,
    node: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  rules: {
    // ── TypeScript ────────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // ── React ─────────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // not needed with new JSX transform
    'react/prop-types': 'off',

    // ── React Native ──────────────────────────────────────────────────────────
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/split-platform-components': 'off',
    'react-native/sort-styles': 'off',

    // ── General ───────────────────────────────────────────────────────────────
    'no-console': 'off', // allow console.warn / console.log in __DEV__ guards
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'android/', 'ios/'],
};
