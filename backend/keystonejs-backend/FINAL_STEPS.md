# Финальные шаги после миграции

## ✅ Что уже сделано:
- [x] Миграции базы данных выполнены
- [x] EMAIL_HMAC_SECRET настроен (через таблицу app_settings)
- [x] Секреты сгенерированы (SESSION_SECRET, EMAIL_HMAC_SECRET)

## 📋 Что делать дальше:

### Шаг 1: Проверьте .env файл

Убедитесь, что файл `backend/keystonejs-backend/.env` создан и содержит все переменные:

```bash
# Supabase Configuration
SUPABASE_URL=https://lublvnvoawndnmkgndct.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs9lBSwoSESQ9d_G2PVBqHM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1MTMwNSwiZXhwIjoyMDc5NzI3MzA1fQ.yGnLijPqC2cdJkJQYkhpj2rIzg9ld2DNQri9KBIGpwo
SUPABASE_DATABASE_URL=postgresql://postgres:ВАШ-ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres

DATABASE_URL=${SUPABASE_DATABASE_URL}

# Authentication Secrets
SESSION_SECRET=\3fCPGfqb0ZD/495MV9lMzqOCz3D/O4bAMZkNa9KrF/KwT5C5IKqmCoMkGWpVXduUW89rfsHwpFevFdXBeEiA2w==
EMAIL_HMAC_SECRET=KgzGr8mTY1wMfKMIxCpGUi8ojYvKL7396q4JivhoaZ9rWYqv/f6CMptuwPBp2dIHoS+nuSkGJcF6d2A/WSn06A==

# Application URLs
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:1337
PORT=1337
NODE_ENV=development
```

**Важно:** Замените `ВАШ-ПАРОЛЬ` на реальный пароль базы данных!

---

### Шаг 2: Установите зависимости

```bash
cd backend/keystonejs-backend
npm install
```

Это установит `@supabase/supabase-js` и другие зависимости.

---

### Шаг 3: Запустите backend

```bash
npm run dev
```

**Что должно произойти:**
- ✅ Backend запускается без ошибок
- ✅ В логах видно: "✅ Supabase client configured successfully"
- ✅ В логах видно: "✅ Supabase configuration detected - using Supabase PostgreSQL"
- ✅ GraphQL API доступен на `http://localhost:1337/api/graphql`

**Если есть ошибки:**
- Проверьте переменные окружения в `.env`
- Убедитесь, что `SUPABASE_DATABASE_URL` правильный и содержит пароль
- Проверьте, что все миграции выполнены успешно

---

### Шаг 4: Проверьте подключение

#### 4.1. Проверка GraphQL API

Откройте в браузере:
```
http://localhost:1337/api/graphql
```

Должен открыться GraphQL Playground (в development режиме).

Попробуйте выполнить простой запрос:

```graphql
query {
  __typename
}
```

Должен вернуться результат.

#### 4.2. Проверка таблиц в Supabase

В Supabase Dashboard > Table Editor должны быть видны все таблицы:
- `profiles`
- `articles`
- `comments`
- `article_reactions`
- `comment_reactions`
- `bookmarks`
- `follows`
- `notifications`
- `app_settings` (новая таблица для настроек)

#### 4.3. Проверка секрета

В Supabase SQL Editor выполните:

```sql
-- Проверка, что секрет сохранен
SELECT key, LEFT(value, 20) || '...' as value_preview, updated_at
FROM public.app_settings
WHERE key = 'email_hmac_secret';
```

Должна вернуться одна строка с вашим секретом.

---

### Шаг 5: Настройте Supabase Auth (опционально, но рекомендуется)

Если планируете использовать Supabase Auth для аутентификации:

1. **Settings > Authentication > Providers:**
   - Включите **Email** (если нужна регистрация через email/password)
   - Включите **Google** (если нужен OAuth)
   - Настройте OAuth credentials для Google

2. **Settings > Authentication > URL Configuration:**
   - Добавьте **Redirect URLs**:
     - `http://localhost:5173/auth/callback` (development)
     - `http://localhost:1337/api/connect/google/callback` (для текущего OAuth flow)

3. **Settings > API:**
   - Убедитесь, что **Row Level Security (RLS)** включен

---

### Шаг 6: Тестирование (опционально)

Если все работает, можно протестировать:

1. **Создание пользователя через Supabase Auth** (если настроен)
2. **Проверка автоматического создания профиля** (триггер должен создать запись в `public.profiles`)

В Supabase Dashboard > Authentication > Users создайте тестового пользователя и проверьте, что профиль создался автоматически в таблице `profiles`.

---

## 🎉 Готово!

Если все шаги выполнены успешно, ваш проект:
- ✅ Подключается к Supabase PostgreSQL
- ✅ Использует Supabase для хранения данных
- ✅ Имеет настроенный EMAIL_HMAC_SECRET
- ✅ Готов к работе с KeystoneJS GraphQL API

---

## 🚨 Частые проблемы и решения

### Ошибка подключения к БД

```
Error: connect ECONNREFUSED
```

**Решение:**
- Проверьте `SUPABASE_DATABASE_URL` в `.env`
- Убедитесь, что пароль правильный
- Проверьте, что IP адрес разрешен в Supabase Dashboard > Settings > Database > Connection Pooling

### Ошибка "Supabase client is not configured"

**Решение:**
- Проверьте переменные окружения в `.env`
- Убедитесь, что файл `.env` находится в `backend/keystonejs-backend/`
- Перезапустите backend после изменения `.env`

### Ошибка "EMAIL_HMAC_SECRET not configured"

**Решение:**
- Проверьте, что секрет вставлен в таблицу `app_settings`:
  ```sql
  SELECT * FROM public.app_settings WHERE key = 'email_hmac_secret';
  ```
- Если нет - выполните миграцию `004_fix_email_hmac_secret.sql` еще раз

---

## 📝 Следующие шаги (после успешного запуска)

1. **Обновление frontend** (если нужно):
   - Установить `@supabase/supabase-js` на frontend
   - Обновить API клиенты для работы с Supabase Auth

2. **Миграция существующих данных** (если есть):
   - Экспортировать данные из старой БД
   - Импортировать в Supabase

3. **Production настройка**:
   - Обновить переменные окружения для production
   - Настроить production redirect URLs в Supabase
   - Проверить безопасность (RLS, секреты)

---

Удачи! 🚀


