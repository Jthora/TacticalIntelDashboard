import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: process.env.NODE_ENV !== 'production', // Only generate source maps in development
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          crypto: ['ethers', 'crypto-js'],
          ui: ['axios', 'nanoid']
        }
      }
    }
  },
  css: {
    // Enable CSS source maps for easier debugging
    devSourcemap: true
  },
  define: {
    // Polyfill for process.env in the browser
    'process.env': {
      VITE_INFURA_PROJECT_ID: JSON.stringify(process.env.VITE_INFURA_PROJECT_ID || ''),
      VITE_INFURA_API_SECRET: JSON.stringify(process.env.VITE_INFURA_API_SECRET || ''),
      VITE_WTTP_MODE: JSON.stringify(process.env.VITE_WTTP_MODE || 'false'),
      VITE_WTTP_SITE_ADDRESS: JSON.stringify(process.env.VITE_WTTP_SITE_ADDRESS || ''),
      VITE_WTTP_NETWORK: JSON.stringify(process.env.VITE_WTTP_NETWORK || 'sepolia')
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