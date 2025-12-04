# Проверка переменных окружения

## Проблема

Сервер не запускается - возможно, отсутствуют переменные окружения.

## Решение

1. **Создайте файл `.env`** в директории `backend/supabase-backend/`:

```bash
cd backend/supabase-backend
cp .env.example .env
```

2. **Заполните переменные** в `.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Application
NODE_ENV=development
PORT=1337
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:1337
```

3. **Где взять ключи Supabase:**

- Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com)
- Settings → API
- Скопируйте:
  - `URL` → `SUPABASE_URL`
  - `anon public` → `SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
- Settings → Database → Connection string → URI → `DATABASE_URL`

4. **Запустите сервер:**

```bash
npm run dev
```

Теперь вы должны увидеть логи запуска!

