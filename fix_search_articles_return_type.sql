-- Исправленная функция search_articles - возвращает правильный массив JSON объектов
CREATE OR REPLACE FUNCTION search_articles(
  p_search text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_sort text DEFAULT 'newest',
  p_skip integer DEFAULT 0,
  p_take integer DEFAULT 10,
  p_user_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text text;
  user_uuid uuid := NULL;
  result json;
BEGIN
  -- Преобразуем user_id в UUID если передан
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    BEGIN
      user_uuid := p_user_id::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        user_uuid := NULL;
    END;
  END IF;

  query_text := '
    SELECT json_agg(
      json_build_object(
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
        ''read_time_minutes'', a.read_time_minutes,
        ''likes_count'', a.likes_count,
        ''dislikes_count'', a.dislikes_count,
        ''author_id'', a.author_id,
        ''author_username'', p.username,
        ''author_nickname'', p.nickname,
        ''author_tag'', p.tag,
        ''author_avatar'', p.avatar,
        ''user_reaction'', CASE
          WHEN $1 IS NOT NULL THEN (
            SELECT reaction
            FROM article_reactions
            WHERE article_id = a.id AND user_id = $1
          )
          ELSE NULL
        END
      )
    )
    FROM articles a
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.published_at IS NOT NULL
  ';

  IF p_search IS NOT NULL AND length(trim(p_search)) >= 2 THEN
    query_text := query_text || ' AND (a.title ILIKE ''%'' || $2 || ''%'' OR a.excerpt ILIKE ''%'' || $2 || ''%'' OR a.content ILIKE ''%'' || $2 || ''%'')';
  END IF;

  IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
    query_text := query_text || ' AND a.tags && $3';
  END IF;

  IF p_difficulty IS NOT NULL AND p_difficulty != 'all' THEN
    query_text := query_text || ' AND a.difficulty = $4';
  END IF;

  CASE p_sort
    WHEN 'newest' THEN
      query_text := query_text || ' ORDER BY a.created_at DESC';
    WHEN 'oldest' THEN
      query_text := query_text || ' ORDER BY a.created_at ASC';
    WHEN 'popular' THEN
      query_text := query_text || ' ORDER BY COALESCE(a.views, 0) DESC';
    WHEN 'trending' THEN
      query_text := query_text || ' ORDER BY a.created_at DESC';
    ELSE
      query_text := query_text || ' ORDER BY a.created_at DESC';
  END CASE;

  query_text := query_text || ' LIMIT $6 OFFSET $5';

  EXECUTE query_text
  INTO result
  USING user_uuid, p_search, p_tags, p_difficulty, p_skip, p_take;

  -- Если результат NULL (нет статей), возвращаем пустой массив
  IF result IS NULL THEN
    result := '[]'::json;
  END IF;

  RETURN result;
END;
$$;
