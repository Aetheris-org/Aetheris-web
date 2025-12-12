-- Проверка настройки функции update_article_read_time
-- Выполните эти запросы по очереди в Supabase SQL Editor

-- 1. Проверить существующие функции
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    obj_description(oid, 'pg_proc') as description
FROM pg_proc
WHERE proname = 'update_article_read_time';

-- 2. Проверить структуру таблицы
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'article_read_stats'
ORDER BY ordinal_position;

-- 3. Проверить существующие записи (если есть)
SELECT
    id,
    article_id,
    user_id,
    read_time_seconds,
    created_at,
    updated_at
FROM article_read_stats
LIMIT 10;

-- 4. Проверить индексы
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'article_read_stats';

-- 5. Проверить RLS политики
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'article_read_stats';

-- 6. Тестовый вызов функции (замените на реальный UUID статьи)
-- SELECT update_article_read_time(
--     'your-article-uuid-here'::uuid,
--     'your-user-uuid-here',
--     120
-- );

-- 7. Проверить права на функцию
SELECT
    grantee,
    privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name = 'update_article_read_time';
