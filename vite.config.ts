import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using @tailwindcss/postcss in postcss.config.js for Tailwind v4
// (no @tailwindcss/vite plugin — the two conflict)
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
