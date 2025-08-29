import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to the backend
    proxy: {
      '/api': {
        // Use production backend by default, or local if specified in .env
        target: process.env.VITE_API_BASE_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: process.env.VITE_API_BASE_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app',
        changeOrigin: true,
        secure: true,
      },
      '/ready': {
        target: process.env.VITE_API_BASE_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app',
        changeOrigin: true,
        secure: true,
      },
      '/live': {
        target: process.env.VITE_API_BASE_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Set chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'form-vendor': ['react-hook-form'],
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        'src/mocks/',
        'src/types/',
      ],
    },
  },
});