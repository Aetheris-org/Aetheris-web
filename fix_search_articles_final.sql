-- ИСПРАВЛЕННАЯ ФУНКЦИЯ search_articles - убрана json_agg для избежания GROUP BY проблем
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
    SELECT COALESCE(
      json_agg(
        json_build_object(
          ''id'', sub.id,
          ''title'', sub.title,
          ''content'', sub.content,
          ''excerpt'', sub.excerpt,
          ''tags'', sub.tags,
          ''difficulty'', sub.difficulty,
          ''preview_image'', sub.preview_image,
          ''created_at'', sub.created_at,
          ''updated_at'', sub.updated_at,
          ''published_at'', sub.published_at,
          ''views'', sub.views,
          ''read_time_minutes'', sub.read_time_minutes,
          ''likes_count'', sub.likes_count,
          ''dislikes_count'', sub.dislikes_count,
          ''author_id'', sub.author_id,
          ''author_username'', sub.username,
          ''author_nickname'', sub.nickname,
          ''author_tag'', sub.tag,
          ''author_avatar'', sub.avatar,
          ''user_reaction'', sub.user_reaction
        )
      ),
      ''[]''::json
    ) as result
    FROM (
      SELECT DISTINCT
        a.id, a.title, a.content, a.excerpt, a.tags, a.difficulty, a.preview_image,
        a.created_at, a.updated_at, a.published_at, a.views, a.read_time_minutes,
        a.likes_count, a.dislikes_count, a.author_id,
        p.username, p.nickname, p.tag, p.avatar,
        CASE
          WHEN $1 IS NOT NULL THEN (
            SELECT reaction
            FROM article_reactions
            WHERE article_id = a.id AND user_id = $1
          )
          ELSE NULL
        END as user_reaction
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

  query_text := query_text || ' LIMIT $6 OFFSET $5) sub';

  EXECUTE query_text
  INTO result
  USING user_uuid, p_search, p_tags, p_difficulty, p_skip, p_take;

  RETURN result;
END;
$$;
