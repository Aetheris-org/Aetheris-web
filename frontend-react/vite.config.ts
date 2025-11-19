import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        secure: false,
        // ВАЖНО: для работы с cookies нужно правильно настроить прокси
        configure: (proxy, _options) => {
          // Передаем cookies от клиента к бэкенду
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          
          // ВАЖНО: Передаем Set-Cookie заголовки от бэкенда к клиенту
          // Это нужно, чтобы cookie устанавливался в браузере
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Убеждаемся, что Set-Cookie заголовки передаются
            if (proxyRes.headers['set-cookie']) {
              // Vite прокси автоматически передает Set-Cookie, но убедимся
              res.setHeader('Set-Cookie', proxyRes.headers['set-cookie']);
            }
          });
        },
      },
    },
  },
})

