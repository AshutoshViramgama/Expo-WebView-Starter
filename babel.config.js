/**
 * babel.config.js
 *
 * Extends the default Expo/Metro babel preset with two plugins:
 *
 *  1. react-native-dotenv  – makes .env variables importable as `import { VAR } from '@env'`
 *  2. module-resolver      – enables clean path aliases (e.g. `@/hooks/useTheme`)
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ── .env support ────────────────────────────────────────────────────────
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: true,          // require variables defined in .env.example
          allowUndefined: true, // fallback to undefined (not crash) if missing
          verbose: false,
        },
      ],
      // ── Path aliases ─────────────────────────────────────────────────────────
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.native.js'],
          alias: {
            '@': '.',
            '@config': './config',
            '@hooks': './hooks',
            '@components': './components',
            '@screens': './screens',
            '@services': './services',
            '@utils': './utils',
          },
        },
      ],
    ],
  };
};
