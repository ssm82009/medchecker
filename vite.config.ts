
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // إضافة إعدادات النشر
  base: '/', // استخدام مسار مطلق للأصول (يمكن تغييره إلى './' للتطوير المحلي)
  build: {
    outDir: 'dist', // مجلد الإخراج
    assetsDir: 'assets', // مجلد الأصول (CSS, JS, etc.)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query'
          ],
        },
        // تجنب استخدام الهاش في أسماء الملفات لمنع مشاكل 404
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
    },
  },
}));
