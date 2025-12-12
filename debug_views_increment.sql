-- ПОЛНАЯ ДИАГНОСТИКА ПРОБЛЕМЫ С ПРОСМОТРАМИ
-- Выполните этот скрипт ПОШАГОВО в Supabase SQL Editor

-- ШАГ 1: ПРОВЕРИТЬ СУЩЕСТВОВАНИЕ ФУНКЦИИ
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    obj_description(oid, 'pg_proc') as description
FROM pg_proc
WHERE proname = 'increment_article_views';

-- ШАГ 2: ПРОВЕРИТЬ СУЩЕСТВОВАНИЕ ТАБЛИЦ
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN ('articles', 'user_article_views')
ORDER BY tablename;

-- ШАГ 3: ПРОВЕРИТЬ СТРУКТУРУ user_article_views
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_article_views'
ORDER BY ordinal_position;

-- ШАГ 4: ПРОВЕРИТЬ ПРАВИЛА RLS
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
WHERE tablename = 'user_article_views';

-- ШАГ 5: НАЙТИ ТЕСТОВУЮ СТАТЬЮ
SELECT
    id,
    title,
    views,
    published_at
FROM articles
WHERE published_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;

-- ШАГ 6: ТЕСТИРОВАТЬ ФУНКЦИЮ (замените article-uuid на реальный из ШАГА 5)
-- SELECT increment_article_views(
--     'your-article-uuid-here'::uuid,
--     NULL
-- );

-- ШАГ 7: ПРОВЕРИТЬ, ИЗМЕНИЛИСЬ ЛИ ПРОСМОТРЫ
-- SELECT id, title, views
-- FROM articles
-- WHERE id = 'your-article-uuid-here';

-- ШАГ 8: ПРОВЕРИТЬ ЗАПИСИ В user_article_views
-- SELECT * FROM user_article_views
-- WHERE article_id = 'your-article-uuid-here'
-- ORDER BY created_at DESC;

-- ШАГ 9: ЕСЛИ ФУНКЦИЯ НЕ СУЩЕСТВУЕТ - СОЗДАТЬ ЕЕ ЗАНОВО
-- (Раскомментируйте и выполните, если функция не найдена в ШАГЕ 1)

-- -- Удалить старую версию
-- DROP FUNCTION IF EXISTS increment_article_views(uuid, text) CASCADE;
-- DROP TABLE IF EXISTS user_article_views CASCADE;
--
-- -- Создать таблицу
-- CREATE TABLE user_article_views (
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
--   view_hour TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('hour', NOW()),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   PRIMARY KEY (user_id, article_id, view_hour)
-- );
--
-- -- Включить RLS
-- ALTER TABLE user_article_views ENABLE ROW LEVEL SECURITY;
--
-- -- Создать политику
-- CREATE POLICY "Users can view own article views" ON user_article_views
--   FOR SELECT USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert own article views" ON user_article_views
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
--
-- -- Создать функцию
-- CREATE OR REPLACE FUNCTION increment_article_views(
--   p_article_id UUID,
--   p_user_id TEXT DEFAULT NULL
-- )
-- RETURNS JSON
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- DECLARE
--   v_user_uuid UUID := NULL;
--   v_current_hour TIMESTAMP WITH TIME ZONE;
-- BEGIN
--   -- Проверка существования статьи
--   IF NOT EXISTS (SELECT 1 FROM articles WHERE id = p_article_id) THEN
--     RETURN json_build_object('success', false, 'error', 'Article not found');
--   END IF;
--
--   -- Конвертация user_id
--   IF p_user_id IS NOT NULL AND p_user_id != '' THEN
--     BEGIN
--       v_user_uuid := p_user_id::UUID;
--     EXCEPTION WHEN OTHERS THEN
--       v_user_uuid := NULL;
--     END;
--   END IF;
--
--   -- Текущий час
--   v_current_hour := DATE_TRUNC('hour', NOW());
--
--   -- Защита от накрутки для авторизованных пользователей
--   IF v_user_uuid IS NOT NULL THEN
--     INSERT INTO user_article_views (user_id, article_id, view_hour)
--     VALUES (v_user_uuid, p_article_id, v_current_hour)
--     ON CONFLICT (user_id, article_id, view_hour) DO NOTHING;
--
--     -- Если вставка не удалась - уже считали в этом часу
--     IF NOT FOUND THEN
--       RETURN json_build_object(
--         'success', true,
--         'message', 'View already counted this hour',
--         'user_id', v_user_uuid,
--         'article_id', p_article_id
--       );
--     END IF;
--   END IF;
--
--   -- Инкремент просмотров
--   UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = p_article_id;
--
--   RETURN json_build_object(
--     'success', true,
--     'article_id', p_article_id,
--     'user_id', v_user_uuid,
--     'message', 'Views incremented successfully',
--     'view_hour', v_current_hour
--   );
--
-- EXCEPTION
--   WHEN OTHERS THEN
--     RETURN json_build_object(
--       'success', false,
--       'error', SQLERRM,
--       'article_id', p_article_id,
--       'user_id', v_user_uuid
--     );
-- END;
-- $$;
--
-- -- Права
-- GRANT EXECUTE ON FUNCTION increment_article_views(UUID, TEXT) TO authenticated, anon;
-- GRANT ALL ON user_article_views TO authenticated, anon;
