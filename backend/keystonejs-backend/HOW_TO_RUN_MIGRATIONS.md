# Как выполнить миграции Supabase

Есть несколько способов применить миграции к вашей базе данных Supabase.

## Способ 1: Через Supabase Dashboard (Рекомендуется для начала)

Это самый простой способ для первого запуска.

### Шаг 1: Откройте SQL Editor

1. Войдите в [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. В левом меню нажмите на **SQL Editor**

### Шаг 2: Выполните миграции по порядку

**Важно**: Выполняйте миграции строго по порядку!

#### Миграция 1: Создание схемы

1. Откройте файл `supabase-migrations/001_initial_schema.sql`
2. Скопируйте весь его содержимое
3. Вставьте в SQL Editor в Supabase Dashboard
4. Нажмите **Run** (или `Ctrl+Enter`)
5. Убедитесь, что нет ошибок (должно быть сообщение "Success")

#### Миграция 2: Синхронизация с Auth

1. Откройте файл `supabase-migrations/002_sync_profiles_with_auth_users.sql`
2. Скопируйте весь его содержимое
3. Вставьте в SQL Editor (можно в новом запросе или заменить предыдущий)
4. Нажмите **Run**
5. Убедитесь, что нет ошибок

#### Миграция 3: Row Level Security

1. Откройте файл `supabase-migrations/003_row_level_security.sql`
2. Скопируйте весь его содержимое
3. Вставьте в SQL Editor
4. Нажмите **Run**
5. Убедитесь, что нет ошибок

### Шаг 3: Проверка

После выполнения всех миграций проверьте:

1. **Таблицы созданы**: 
   - Откройте **Table Editor** в Supabase Dashboard
   - Должны быть видны таблицы: `profiles`, `articles`, `comments`, `article_reactions`, `comment_reactions`, `bookmarks`, `follows`, `notifications`

2. **Триггеры работают**:
   - В SQL Editor выполните:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%updated_at%';
   ```
   - Должны быть видны триггеры для обновления `updated_at`

3. **RLS включен**:
   - В Table Editor откройте любую таблицу
   - В настройках таблицы должна быть включена опция "Enable RLS"

---

## Способ 2: Через Supabase CLI (Для продвинутых)

Если у вас установлен Supabase CLI, можно применить миграции автоматически.

### Установка Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (через Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
npm install -g supabase
```

### Инициализация проекта

```bash
cd backend/keystonejs-backend

# Логин в Supabase
supabase login

# Свяжите проект с вашим Supabase проектом
supabase link --project-ref your-project-ref
```

### Применение миграций

```bash
# Применить все миграции
supabase db push

# Или применить конкретную миграцию
supabase migration up
```

---

## Способ 3: Через psql (Прямое подключение к PostgreSQL)

Если у вас есть прямой доступ к PostgreSQL.

### Получение connection string

1. В Supabase Dashboard откройте **Settings > Database**
2. Найдите **Connection string** > **URI**
3. Скопируйте строку подключения

### Применение миграций

```bash
# Установите psql (если еще не установлен)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Примените миграции
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase-migrations/001_initial_schema.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase-migrations/002_sync_profiles_with_auth_users.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase-migrations/003_row_level_security.sql
```

---

## Важные замечания

### ⚠️ Ошибки при выполнении

Если вы видите ошибки типа:
- `relation already exists` - таблица уже существует, это нормально при повторном запуске
- `permission denied` - проверьте, что используете правильные права доступа
- `function already exists` - функция уже создана, можно пропустить

### 🔒 Безопасность

- **Никогда** не коммитьте `.env` файл с реальными ключами
- **Service Role Key** используйте только на backend, никогда на frontend
- **Database URL** содержит пароль - храните его в безопасности

### 📝 Настройка EMAIL_HMAC_SECRET

После выполнения миграций нужно настроить секрет для хеширования email:

```sql
-- В Supabase SQL Editor выполните:
ALTER DATABASE postgres SET app.settings.email_hmac_secret = 'ваш-секрет-минимум-32-символа';
```

Или используйте Supabase Secrets API (рекомендуется для production).

### ✅ Проверка успешности миграции

Выполните этот запрос в SQL Editor для проверки:

```sql
-- Проверка таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'articles', 'comments', 'article_reactions', 'comment_reactions', 'bookmarks', 'follows', 'notifications')
ORDER BY table_name;

-- Проверка триггеров
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%updated_at%' OR tgname LIKE '%reaction%';

-- Проверка RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'articles', 'comments', 'article_reactions', 'comment_reactions', 'bookmarks', 'follows', 'notifications');
```

Все таблицы должны иметь `rowsecurity = true`.

---

## Следующие шаги

После успешного выполнения миграций:

1. ✅ Настройте переменные окружения в `.env`
2. ✅ Настройте Supabase Auth (провайдеры, redirect URLs)
3. ✅ Запустите backend: `npm run dev`
4. ✅ Проверьте подключение к базе данных

Удачи! 🚀


