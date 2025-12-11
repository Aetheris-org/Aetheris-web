-- Исправленная функция get_article_with_details - принимает text ID вместо integer
CREATE OR REPLACE FUNCTION get_article_with_details(
  p_article_id text,
  p_user_id text DEFAULT NULL,
  p_increment_views boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  article_record record;
  result json;
  numeric_id integer;
BEGIN
  -- Конвертируем p_article_id в число если возможно
  BEGIN
    numeric_id := p_article_id::integer;
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- Если не число, возвращаем ошибку
      RAISE EXCEPTION 'Invalid article ID format. Expected numeric ID, got: %', p_article_id;
  END;

  SELECT * INTO article_record
  FROM articles
  WHERE id = numeric_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article not found';
  END IF;

  IF p_increment_views THEN
    UPDATE articles
    SET views = COALESCE(views, 0) + 1
    WHERE id = numeric_id;
  END IF;

  SELECT json_build_object(
    'id', a.id,
    'title', a.title,
    'content', a.content,
    'excerpt', a.excerpt,
    'tags', a.tags,
    'difficulty', a.difficulty,
    'preview_image', a.preview_image,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'published_at', a.published_at,
    'views', a.views,
    'read_time_minutes', a.read_time_minutes,
    'likes_count', a.likes_count,
    'dislikes_count', a.dislikes_count,
    'author_id', a.author_id,
    'author_username', p.username,
    'author_nickname', p.nickname,
    'author_tag', p.tag,
    'author_avatar', p.avatar,
    'user_reaction', CASE
      WHEN p_user_id IS NOT NULL THEN (
        SELECT reaction
        FROM article_reactions
        WHERE article_id = a.id AND user_id = p_user_id::uuid
      )
      ELSE NULL
    END
  ) INTO result
  FROM articles a
  LEFT JOIN profiles p ON a.author_id = p.id
  WHERE a.id = numeric_id;

  RETURN result;
END;
$$;
