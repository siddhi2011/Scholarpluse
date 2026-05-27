
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

const hasBase44Plugin = typeof base44 !== 'undefined';

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: hasBase44Plugin ? {} : {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  plugins: [
    ...(hasBase44Plugin ? [base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    })] : []),
    react(),
  ]
});
