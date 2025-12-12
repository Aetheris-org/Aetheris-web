-- ТЕСТ: проверка функции increment_article_views
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверить, существует ли функция
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'increment_article_views';

-- 2. Проверить таблицы
SELECT tablename
FROM pg_tables
WHERE tablename IN ('user_article_views', 'articles')
ORDER BY tablename;

-- 3. Найти тестовую статью (возьмем первую)
SELECT id, title, views
FROM articles
WHERE published_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- 4. ТЕСТОВЫЙ ВЫЗОВ (замените article-uuid на реальный ID из пункта 3)
-- SELECT increment_article_views(
--     'your-article-uuid-here'::uuid,
--     NULL
-- );

-- 5. Проверить, изменились ли просмотры после теста
-- SELECT id, title, views
-- FROM articles
-- WHERE id = 'your-article-uuid-here';
