-- Создаем функцию search_articles если ее нет
CREATE OR REPLACE FUNCTION search_articles(
  p_search text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_sort text DEFAULT 'newest',
  p_skip integer DEFAULT 0,
  p_take integer DEFAULT 10,
  p_user_id text DEFAULT NULL
)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text text;
  result json[];
  user_uuid uuid;
BEGIN
  -- Преобразуем user_id в UUID если передан
  IF p_user_id IS NOT NULL THEN
    BEGIN
      user_uuid := p_user_id::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        user_uuid := NULL;
    END;
  END IF;

  -- Базовый запрос
  query_text := '
    SELECT json_build_object(
      ''id'', a.id,
      ''title'', a.title,
      ''content'', a.content,
      ''excerpt'', a.excerpt,
      ''tags'', a.tags,
      ''difficulty'', a.difficulty,
      ''preview_image'', a.preview_image,
      ''created_at'', a.created_at,
      ''updated_at'', a.updated_at,
      ''published_at'', a.published_at,
      ''views'', a.views,
      ''views_count'', a.views_count,
      ''read_time_minutes'', a.read_time_minutes,
      ''likes_count'', a.likes_count,
      ''dislikes_count'', a.dislikes_count,
      ''author_id'', a.author_id,
      ''author_username'', p.username,
      ''author_nickname'', p.nickname,
      ''author_tag'', p.tag,
      ''author_avatar'', p.avatar,
      ''user_reaction'', CASE 
        WHEN $7::uuid IS NOT NULL THEN (
          SELECT reaction 
          FROM article_reactions 
          WHERE article_id = a.id AND user_id = $7::uuid
        )
        ELSE NULL
      END
    )
    FROM articles a
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.published_at IS NOT NULL
  ';

  -- Добавляем условия поиска
  IF p_search IS NOT NULL AND length(trim(p_search)) >= 2 THEN
    query_text := query_text || ' AND (a.title ILIKE ''%'' || $1 || ''%'' OR a.excerpt ILIKE ''%'' || $1 || ''%'' OR a.content ILIKE ''%'' || $1 || ''%'')';
  END IF;

  IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
    query_text := query_text || ' AND a.tags && $2';
  END IF;

  IF p_difficulty IS NOT NULL AND p_difficulty != 'all' THEN
    query_text := query_text || ' AND a.difficulty = $3';
  END IF;

  -- Сортировка
  CASE p_sort
    WHEN 'newest' THEN
      query_text := query_text || ' ORDER BY a.created_at DESC';
    WHEN 'oldest' THEN
      query_text := query_text || ' ORDER BY a.created_at ASC';
    WHEN 'popular' THEN
      query_text := query_text || ' ORDER BY COALESCE(a.views, 0) DESC';
    WHEN 'trending' THEN
      query_text := query_text || ' ORDER BY a.created_at DESC'; -- Можно улучшить логику трендов
    ELSE
      query_text := query_text || ' ORDER BY a.created_at DESC';
  END CASE;

  -- Пагинация
  query_text := query_text || ' LIMIT $5 OFFSET $4';

  -- Выполняем запрос
  EXECUTE query_text 
  INTO result 
  USING p_search, p_tags, p_difficulty, p_skip, p_take, p_sort, user_uuid;

  RETURN result;
END;
$$;
