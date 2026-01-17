-- Миграция: Обновление функции search_articles для включения поля category
-- Дата создания: 2024-12-XX
-- Описание: Добавляет поле category в возвращаемые данные функции search_articles

-- ВНИМАНИЕ: Эта миграция обновляет существующую функцию search_articles
-- Убедитесь, что колонка category уже добавлена в таблицу articles (миграция 002)

-- Удаляем все существующие версии функции search_articles
-- Используем DO блок для динамического удаления всех перегрузок
DO $$
DECLARE
  func_record RECORD;
  drop_stmt TEXT;
BEGIN
  -- Удаляем все функции с именем search_articles в схеме public
  FOR func_record IN 
    SELECT oid, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc 
    WHERE proname = 'search_articles' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    drop_stmt := format('DROP FUNCTION IF EXISTS public.search_articles(%s) CASCADE', func_record.args);
    EXECUTE drop_stmt;
  END LOOP;
END $$;

-- Создаем новую функцию search_articles с полем category
CREATE OR REPLACE FUNCTION search_articles(
  p_search TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'newest',
  p_skip INTEGER DEFAULT 0,
  p_take INTEGER DEFAULT 10,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  author_id UUID,
  tags TEXT[],
  difficulty TEXT,
  preview_image TEXT,
  category TEXT,
  likes_count INTEGER,
  dislikes_count INTEGER,
  views INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author JSONB,
  user_reaction TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.content,
    a.excerpt,
    a.author_id,
    a.tags,
    a.difficulty,
    a.preview_image,
    a.category,
    a.likes_count,
    a.dislikes_count,
    a.views,
    a.published_at,
    a.created_at,
    a.updated_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'nickname', p.nickname,
      'tag', p.tag,
      'avatar', p.avatar
    ) as author,
    CASE 
      WHEN p_user_id IS NOT NULL THEN
        (SELECT reaction::TEXT 
         FROM article_reactions 
         WHERE article_id = a.id AND user_id = p_user_id
         LIMIT 1)
      ELSE NULL
    END as user_reaction,
    COUNT(*) OVER() as total_count
  FROM articles a
  LEFT JOIN profiles p ON a.author_id = p.id
  WHERE 
    a.published_at IS NOT NULL
    AND (p_search IS NULL OR a.title ILIKE '%' || p_search || '%' OR a.excerpt ILIKE '%' || p_search || '%')
    AND (p_tags IS NULL OR a.tags && p_tags)
    AND (p_difficulty IS NULL OR a.difficulty = p_difficulty)
  ORDER BY
    CASE 
      WHEN p_sort = 'newest' THEN EXTRACT(EPOCH FROM a.published_at)
      WHEN p_sort = 'popular' THEN (a.likes_count + a.dislikes_count)::NUMERIC
      WHEN p_sort = 'trending' THEN (a.likes_count + a.views)::NUMERIC
      ELSE EXTRACT(EPOCH FROM a.published_at)
    END DESC
  LIMIT p_take
  OFFSET p_skip;
END;
$$;

COMMENT ON FUNCTION search_articles IS 'Функция для поиска и фильтрации статей с поддержкой категорий';
