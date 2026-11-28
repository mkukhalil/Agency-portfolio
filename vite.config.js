import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { blogPlugin } from './scripts/blogPlugin.js';

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), blogPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor splitting only matters for the browser bundle.
          if (isSsrBuild || !id.includes('node_modules')) return undefined;

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react';
          }

          if (id.includes('/framer-motion/') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) {
            return 'vendor-motion';
          }

          if (id.includes('/lucide-react/')) {
            return 'vendor-icons';
          }

          if (id.includes('/lenis/')) {
            return 'vendor-lenis';
          }

          // Lottie is only reached through a dynamic import (night-mode icon).
          // Leaving it unassigned keeps it in that lazy chunk; a named vendor
          // chunk here gets pulled into the entry graph and preloaded everywhere.
          if (id.includes('/@lottiefiles/')) {
            return undefined;
          }

          return 'vendor';
        },
      },
    },
  },
}));
