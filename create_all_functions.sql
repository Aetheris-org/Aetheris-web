-- === 1. ФУНКЦИЯ ПОИСКА СТАТЕЙ ===
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
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
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
        WHEN user_uuid IS NOT NULL THEN (
          SELECT reaction 
          FROM article_reactions 
          WHERE article_id = a.id AND user_id = user_uuid
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
      query_text := query_text || ' ORDER BY a.created_at DESC';
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

-- === 2. ФУНКЦИЯ ПОЛУЧЕНИЯ СТАТЬИ С ДЕТАЛЯМИ ===
CREATE OR REPLACE FUNCTION get_article_with_details(
  p_article_id integer,
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
BEGIN
  -- Находим статью
  SELECT * INTO article_record
  FROM articles
  WHERE id = p_article_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article not found';
  END IF;
  
  -- Инкрементируем просмотры если запрошено
  IF p_increment_views THEN
    UPDATE articles 
    SET views = COALESCE(views, 0) + 1
    WHERE id = p_article_id;
    
    UPDATE articles 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_article_id;
  END IF;
  
  -- Возвращаем статью с автором
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
    'views_count', a.views_count,
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
  WHERE a.id = p_article_id;
  
  RETURN result;
END;
$$;

-- === 3. ФУНКЦИЯ ЗАКЛАДОК ===
CREATE OR REPLACE FUNCTION toggle_bookmark(
  p_article_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_bookmark record;
  result json;
BEGIN
  -- Проверяем существует ли закладка
  SELECT * INTO existing_bookmark
  FROM bookmarks
  WHERE article_id = p_article_id AND user_id = p_user_id;
  
  IF FOUND THEN
    -- Удаляем закладку
    DELETE FROM bookmarks 
    WHERE article_id = p_article_id AND user_id = p_user_id;
    
    result := json_build_object('is_bookmarked', false);
  ELSE
    -- Создаем закладку
    INSERT INTO bookmarks (article_id, user_id)
    VALUES (p_article_id, p_user_id);
    
    result := json_build_object('is_bookmarked', true);
  END IF;
  
  RETURN result;
END;
$$;

-- === 4. ФУНКЦИЯ ПОДПИСОК ===
CREATE OR REPLACE FUNCTION toggle_follow(
  p_follower_id uuid,
  p_following_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_follow record;
  result json;
BEGIN
  -- Нельзя подписаться на себя
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;
  
  -- Проверяем существует ли подписка
  SELECT * INTO existing_follow
  FROM follows
  WHERE follower_id = p_follower_id AND following_id = p_following_id;
  
  IF FOUND THEN
    -- Отписываемся
    DELETE FROM follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    
    result := json_build_object('is_following', false);
  ELSE
    -- Подписываемся
    INSERT INTO follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id);
    
    result := json_build_object('is_following', true);
  END IF;
  
  RETURN result;
END;
$$;

-- === 5. ФУНКЦИЯ РЕАКЦИЙ НА КОММЕНТАРИИ ===
CREATE OR REPLACE FUNCTION set_comment_reaction(
  p_comment_id uuid,
  p_user_id uuid,
  p_reaction text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_reaction record;
  result json;
BEGIN
  -- Проверяем корректность реакции
  IF p_reaction NOT IN ('like', 'dislike') THEN
    RAISE EXCEPTION 'Invalid reaction type. Must be ''like'' or ''dislike''';
  END IF;
  
  -- Проверяем существует ли реакция
  SELECT * INTO existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = p_user_id;
  
  IF FOUND THEN
    IF existing_reaction.reaction = p_reaction THEN
      -- Убираем реакцию если она такая же
      DELETE FROM comment_reactions 
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    ELSE
      -- Меняем реакцию
      UPDATE comment_reactions 
      SET reaction = p_reaction
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    END IF;
  ELSE
    -- Создаем новую реакцию
    INSERT INTO comment_reactions (comment_id, user_id, reaction)
    VALUES (p_comment_id, p_user_id, p_reaction);
  END IF;
  
  -- Получаем обновленные счетчики
  SELECT 
    COUNT(*) FILTER (WHERE reaction = 'like') as likes_count,
    COUNT(*) FILTER (WHERE reaction = 'dislike') as dislikes_count,
    CASE 
      WHEN p_user_id IN (SELECT user_id FROM comment_reactions WHERE comment_id = p_comment_id) 
      THEN (SELECT reaction FROM comment_reactions WHERE comment_id = p_comment_id AND user_id = p_user_id)
      ELSE NULL
    END as user_reaction
  INTO result
  FROM comment_reactions
  WHERE comment_id = p_comment_id;
  
  -- Обновляем счетчики в таблице комментариев
  UPDATE comments 
  SET 
    likes_count = (result->>'likes_count')::integer,
    dislikes_count = (result->>'dislikes_count')::integer
  WHERE id = p_comment_id;
  
  RETURN result;
END;
$$;
