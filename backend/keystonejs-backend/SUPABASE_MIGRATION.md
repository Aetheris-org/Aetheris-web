# Миграция на Supabase

Этот документ описывает процесс миграции проекта с KeystoneJS на Supabase PostgreSQL.

## Обзор

Мы используем **гибридный подход**: KeystoneJS остается как GraphQL API и ORM, но подключается к Supabase PostgreSQL и использует Supabase Auth для аутентификации.

## Преимущества

- ✅ Сохраняем GraphQL API и всю бизнес-логику KeystoneJS
- ✅ Используем Supabase Auth (OAuth, email/password) вместо KeystoneJS Auth
- ✅ Используем Supabase PostgreSQL как базу данных
- ✅ Row Level Security (RLS) для безопасности данных
- ✅ Минимальные изменения в коде

## Шаги миграции

### 1. Настройка Supabase проекта

1. Создайте проект на [Supabase](https://supabase.com)
2. Получите следующие данные:
   - `SUPABASE_URL` - URL вашего проекта
   - `SUPABASE_ANON_KEY` - Anon/Public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service Role key (секретный!)
   - `SUPABASE_DATABASE_URL` - Connection string для PostgreSQL

### 2. Переменные окружения

Добавьте в `.env` файл backend:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Остальные переменные остаются без изменений
DATABASE_URL=${SUPABASE_DATABASE_URL}  # Для обратной совместимости
SESSION_SECRET=your-session-secret
EMAIL_HMAC_SECRET=your-email-hmac-secret
FRONTEND_URL=http://localhost:5173
```

### 3. Установка зависимостей

```bash
cd backend/keystonejs-backend
npm install @supabase/supabase-js
```

### 4. Применение миграций Supabase

Выполните миграции в Supabase SQL Editor или через CLI:

```bash
# В Supabase Dashboard -> SQL Editor выполните:
# 1. supabase-migrations/001_initial_schema.sql
# 2. supabase-migrations/002_sync_profiles_with_auth_users.sql
# 3. supabase-migrations/003_row_level_security.sql
```

Или через Supabase CLI:

```bash
supabase db push
```

### 5. Настройка Supabase Auth

В Supabase Dashboard:

1. **Authentication > Providers**: Включите нужные провайдеры (Email, Google OAuth)
2. **Authentication > URL Configuration**: Настройте redirect URLs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

3. **Settings > API**: Убедитесь, что RLS включен

### 6. Настройка EMAIL_HMAC_SECRET в Supabase

Для работы хеширования email нужно настроить секрет в Supabase:

```sql
-- В Supabase SQL Editor выполните:
ALTER DATABASE postgres SET app.settings.email_hmac_secret = 'your-email-hmac-secret-here';
```

Или используйте Supabase Secrets API (рекомендуется для production).

### 7. Обновление схемы User в KeystoneJS

Схема User должна использовать UUID вместо integer ID для совместимости с Supabase Auth:

```typescript
// schemas/User.ts
export const User = list({
  // ... конфигурация
  fields: {
    id: uuid({ ... }), // Используем UUID вместо autoincrement
    // ... остальные поля
  },
});
```

**Примечание**: Если у вас уже есть данные с integer ID, нужна дополнительная миграция для конвертации.

### 8. Обновление OAuth handlers

OAuth handlers теперь должны:
1. Создавать пользователя в Supabase Auth через Supabase Admin API
2. Профиль автоматически создается через триггер `handle_new_user()`
3. Синхронизировать данные с KeystoneJS User схемой

### 9. Обновление frontend

Frontend должен использовать Supabase Auth клиент для аутентификации:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Вход через Google OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## Структура данных

### Связь auth.users и profiles

- `auth.users` - таблица Supabase Auth (управляется Supabase)
- `public.profiles` - расширяет auth.users, содержит дополнительные данные
- Связь: `profiles.id = auth.users.id` (UUID)

### Связь profiles и других таблиц

- `articles.author_id` → `profiles.id` (UUID)
- `comments.author_id` → `profiles.id` (UUID)
- `article_reactions.user_id` → `profiles.id` (UUID)
- И т.д.

## Безопасность

### Row Level Security (RLS)

Все таблицы защищены RLS политиками:
- Пользователи могут читать только публичные данные
- Пользователи могут изменять только свои данные
- Админы имеют расширенные права (через KeystoneJS access control)

### Email Hashing

Email хешируется через HMAC-SHA256 для приватности:
- Email никогда не хранится в открытом виде
- Хеш используется для поиска пользователей
- Требуется `EMAIL_HMAC_SECRET` для генерации хеша

## Миграция существующих данных

Если у вас уже есть данные с integer ID:

1. Экспортируйте данные из старой БД
2. Создайте пользователей в Supabase Auth
3. Импортируйте профили в `public.profiles` с UUID из auth.users
4. Обновите внешние ключи в других таблицах

**Примечание**: Это сложный процесс, рекомендуется делать на тестовой среде сначала.

## Проверка миграции

1. Проверьте подключение к Supabase:
   ```bash
   npm run dev
   # Должно подключиться к Supabase PostgreSQL
   ```

2. Проверьте создание профиля:
   - Зарегистрируйте нового пользователя через Supabase Auth
   - Проверьте, что профиль создался автоматически в `public.profiles`

3. Проверьте GraphQL API:
   - Откройте GraphQL Playground
   - Выполните запросы к API
   - Убедитесь, что данные возвращаются корректно

## Troubleshooting

### Ошибка подключения к БД

- Проверьте `SUPABASE_DATABASE_URL`
- Убедитесь, что IP адрес разрешен в Supabase Dashboard
- Проверьте пароль в connection string

### Профиль не создается автоматически

- Проверьте, что триггер `on_auth_user_created` создан
- Проверьте логи Supabase
- Убедитесь, что `EMAIL_HMAC_SECRET` настроен

### RLS блокирует запросы

- Проверьте, что пользователь аутентифицирован через Supabase Auth
- Проверьте RLS политики в Supabase Dashboard
- Используйте Service Role key для backend операций (только на сервере!)

## Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [KeystoneJS Documentation](https://keystonejs.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)


