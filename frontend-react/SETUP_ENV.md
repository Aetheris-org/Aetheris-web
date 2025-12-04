# 🔧 Настройка переменных окружения для фронтенда

## ❌ Проблема:
```
Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

## ✅ Решение:

Создайте файл `.env.local` в директории `frontend-react/` со следующим содержимым:

```env
# ============================================
# Supabase Configuration
# ============================================
VITE_SUPABASE_URL=https://lublvnvoawndnmkgndct.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs5lBSwoSESQ9d_G2PVBqHM

# ============================================
# Backend API Configuration (legacy)
# ============================================
VITE_API_BASE_URL=http://localhost:1337

# ============================================
# Frontend URL
# ============================================
VITE_FRONTEND_URL=http://localhost:5173
```

## 📝 Шаги:

1. **Создайте файл:**
   ```bash
   cd frontend-react
   touch .env.local
   ```

2. **Добавьте содержимое:**
   Скопируйте переменные выше в файл `.env.local`

3. **Перезапустите dev-сервер:**
   ```bash
   # Остановите текущий сервер (Ctrl+C)
   npm run dev
   ```

## 🔍 Проверка:

После перезапуска проверьте в консоли браузера - ошибка должна исчезнуть.

## 💡 Важно:

- Файл `.env.local` должен быть в корне `frontend-react/`
- Переменные должны начинаться с `VITE_` для работы с Vite
- После изменения `.env.local` нужно перезапустить dev-сервер

