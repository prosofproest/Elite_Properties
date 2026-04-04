import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY),
      'process.env.CLOUDINARY_API_KEY': JSON.stringify(env.CLOUDINARY_API_KEY),
      'process.env.CLOUDINARY_API_SECRET': JSON.stringify(env.CLOUDINARY_API_SECRET),
      'process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
      'process.env.APP_URL': JSON.stringify(env.APP_URL),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      port: 3000,
      hmr: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            'ui-vendor': ['framer-motion', 'lucide-react', 'sonner'],
            'chart-vendor': ['chart.js', 'react-chartjs-2'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});