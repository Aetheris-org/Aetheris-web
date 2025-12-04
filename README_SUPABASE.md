# Миграция на Supabase - Краткое руководство

## Быстрый старт

### 1. Установка зависимостей

```bash
cd backend/keystonejs-backend
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [Supabase](https://supabase.com)
2. Получите ключи из Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DATABASE_URL` (из Settings > Database > Connection string)

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Заполните переменные Supabase (см. `.env.example`).

### 4. Применение миграций

В Supabase Dashboard откройте SQL Editor и выполните миграции по порядку:

1. `supabase-migrations/001_initial_schema.sql`
2. `supabase-migrations/002_sync_profiles_with_auth_users.sql`
3. `supabase-migrations/003_row_level_security.sql`

### 5. Настройка EMAIL_HMAC_SECRET

В Supabase SQL Editor выполните:

```sql
ALTER DATABASE postgres SET app.settings.email_hmac_secret = 'ваш-секрет-здесь';
```

Или используйте Supabase Secrets API.

### 6. Настройка Supabase Auth

В Supabase Dashboard:

1. **Authentication > Providers**: Включите Email и Google OAuth
2. **Authentication > URL Configuration**: Добавьте redirect URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 7. Запуск

```bash
npm run dev
```

## Архитектура

- **Supabase Auth**: Аутентификация (OAuth, email/password)
- **Supabase PostgreSQL**: База данных
- **KeystoneJS**: GraphQL API и бизнес-логика
- **Row Level Security**: Защита данных на уровне БД

## Важные замечания

1. **UUID vs Integer ID**: Если у вас уже есть данные с integer ID, нужна миграция
2. **Email Hashing**: Email хешируется через HMAC-SHA256 для приватности
3. **RLS**: Все таблицы защищены Row Level Security политиками
4. **Service Role Key**: Используется только на backend, никогда не передавайте на frontend!

## Дополнительная информация

См. `SUPABASE_MIGRATION.md` для подробной документации.


