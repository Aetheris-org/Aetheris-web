# 📋 Применение миграций для Supabase REST API

## Шаг 1: Применить миграции в Supabase

1. Откройте **Supabase Dashboard** → **SQL Editor**

2. Примените миграции **по порядку**:
   - `migrations/002_row_level_security.sql` - RLS политики
   - `migrations/003_functions_and_triggers.sql` - Database Functions

3. Проверьте результат:
   - Database → Tables → должны быть все таблицы с RLS включенным
   - Database → Functions → должны быть функции:
     - `search_articles`
     - `get_article_with_details`
     - `toggle_article_reaction`
     - `toggle_bookmark`
     - `toggle_follow`

## Шаг 2: Настроить переменные окружения

В `frontend-react/.env` или `frontend-react/.env.local` добавьте:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Где взять ключи:**
1. Supabase Dashboard → Settings → API
2. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Шаг 3: Установить зависимости

```bash
cd frontend-react
npm install @supabase/supabase-js
```

## Шаг 4: Обновить импорты в компонентах

Замените импорты:
- `from '@/api/articles-graphql'` → `from '@/api/articles'`
- `from '@/api/auth-graphql'` → `from '@/api/auth'` (нужно создать)
- И т.д.

## Шаг 5: Протестировать

1. Запустите фронтенд: `npm run dev`
2. Проверьте работу:
   - Загрузка статей
   - Создание статьи
   - Реакции
   - Закладки

## ⚠️ Важно

- RLS политики защищают данные на уровне БД
- Database Functions выполняются с правами `SECURITY DEFINER`
- Все запросы проходят через Supabase Auth

