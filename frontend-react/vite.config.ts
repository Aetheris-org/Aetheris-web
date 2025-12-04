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
    // ⚠️ Прокси удален - бэкенд теперь полностью на Supabase
    // Все API вызовы идут напрямую через @supabase/supabase-js
  },
})

