# Исправление ошибки миграции

## ❌ Ошибка:
```
ERROR: 42710: trigger "update_articles_updated_at" for relation "articles" already exists
```

## ✅ Решение:

Триггеры уже существуют - миграция была частично применена ранее.

### Вариант 1: Применить исправленную миграцию (рекомендуется)

1. Откройте `migrations/001_initial_schema.sql` (уже исправлен)
2. Скопируйте **только секцию с триггерами** (последние строки)
3. Вставьте в SQL Editor и выполните

Или скопируйте весь файл заново - теперь он пропускает существующие триггеры.

### Вариант 2: Удалить и пересоздать триггеры

1. Откройте `migrations/002_fix_existing_objects.sql`
2. Скопируйте весь SQL
3. Вставьте в SQL Editor и выполните

Это удалит существующие триггеры и создаст их заново.

### Вариант 3: Вручную удалить триггеры

Выполните в SQL Editor:

```sql
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
```

Затем примените миграцию `001_initial_schema.sql` заново.

## ✅ После исправления

Проверьте таблицы:

1. **Database** → **Tables**
2. Должны быть все таблицы: users, articles, comments, etc.

Затем запустите тест:

```bash
node test-start.js
```

