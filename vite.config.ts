import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps
  },
  css: {
    // Enable CSS source maps for easier debugging
    devSourcemap: true
  },
  define: {
    // Polyfill for process.env in the browser
    'process.env': {
      VITE_INFURA_PROJECT_ID: JSON.stringify(process.env.VITE_INFURA_PROJECT_ID || ''),
      VITE_INFURA_API_SECRET: JSON.stringify(process.env.VITE_INFURA_API_SECRET || '')
    }
  },
  server: {
    hmr: {
      overlay: false, // Disable the error overlay
    },
    watch: {
      usePolling: true,
    },
    host: 'localhost',
    port: 5173,
  },
  resolve: {
    alias: {
      // Add an alias for styles directory to help with imports
      '@styles': path.resolve(__dirname, './src/assets/styles')
    }
  }
})