import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// V10 Frontend Build Configuration
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist/assets',
    emptyOutDir: false, // Changed to false to avoid potential permission issues
    rollupOptions: {
      output: {
        // Predictable filenames without hashes for easier integration
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
