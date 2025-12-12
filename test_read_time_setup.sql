-- Проверка и настройка функции update_article_read_time
-- Выполните этот скрипт полностью в Supabase SQL Editor

-- 1. Проверим существующие функции
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    obj_description(oid, 'pg_proc') as description
FROM pg_proc
WHERE proname LIKE '%update_article_read_time%';

-- 2. Проверим существующие таблицы
SELECT tablename
FROM pg_tables
WHERE tablename = 'article_read_stats';

-- 3. Удалим все старые версии
DROP FUNCTION IF EXISTS update_article_read_time(integer, text, integer) CASCADE;
DROP FUNCTION IF EXISTS update_article_read_time(uuid, text, integer) CASCADE;
DROP TABLE IF EXISTS article_read_stats CASCADE;

-- 4. Создадим таблицу
CREATE TABLE article_read_stats (
  id SERIAL PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(article_id, user_id)
);

-- 5. Создадим индексы
CREATE INDEX idx_article_read_stats_article_id ON article_read_stats(article_id);
CREATE INDEX idx_article_read_stats_user_id ON article_read_stats(user_id);
CREATE INDEX idx_article_read_stats_updated_at ON article_read_stats(updated_at);

-- 6. Включим RLS
ALTER TABLE article_read_stats ENABLE ROW LEVEL SECURITY;

-- 7. Создадим политики RLS
CREATE POLICY "Users can view own read stats" ON article_read_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own read stats" ON article_read_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert read stats" ON article_read_stats
  FOR INSERT WITH CHECK (user_id IS NULL);

-- 8. Создадим функцию
CREATE OR REPLACE FUNCTION update_article_read_time(
  p_article_id UUID,
  p_user_id TEXT,
  p_read_time_seconds INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uuid UUID := NULL;
  v_existing_time INTEGER := 0;
  v_total_time INTEGER;
BEGIN
  -- Проверяем валидность входных данных
  IF p_article_id IS NULL OR p_read_time_seconds IS NULL OR p_read_time_seconds < 10 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid parameters: article_id and read_time_seconds (min 10) are required'
    );
  END IF;

  -- Конвертируем user_id в UUID если он предоставлен
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    BEGIN
      v_user_uuid := p_user_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- Игнорируем некорректный user_id
      v_user_uuid := NULL;
    END;
  END IF;

  -- Получаем существующее время чтения для этой статьи и пользователя
  SELECT COALESCE(read_time_seconds, 0)
  INTO v_existing_time
  FROM article_read_stats
  WHERE article_id = p_article_id AND user_id = v_user_uuid;

  -- Вычисляем общее время чтения (максимум из существующего и нового)
  v_total_time := GREATEST(v_existing_time, p_read_time_seconds);

  -- Вставляем или обновляем статистику чтения
  INSERT INTO article_read_stats (article_id, user_id, read_time_seconds, updated_at)
  VALUES (p_article_id, v_user_uuid, v_total_time, NOW())
  ON CONFLICT (article_id, user_id)
  DO UPDATE SET
    read_time_seconds = GREATEST(article_read_stats.read_time_seconds, EXCLUDED.read_time_seconds),
    updated_at = NOW();

  RETURN json_build_object(
    'success', true,
    'article_id', p_article_id,
    'user_id', v_user_uuid,
    'read_time_seconds', v_total_time,
    'message', 'Read time updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'article_id', p_article_id,
      'user_id', v_user_uuid
    );
END;
$$;

-- 9. Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION update_article_read_time(UUID, TEXT, INTEGER) TO authenticated, anon;

-- 10. Даем права на таблицу
GRANT ALL ON article_read_stats TO authenticated, anon;
GRANT USAGE ON SEQUENCE article_read_stats_id_seq TO authenticated, anon;

-- 11. Тестируем функцию
-- (Раскомментируйте для тестирования с реальными UUID)
-- SELECT update_article_read_time(
--   'your-article-uuid-here'::uuid,
--   'your-user-uuid-here',
--   120
-- );
