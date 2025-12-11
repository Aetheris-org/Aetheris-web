-- ========================================================================================
-- ФИНАЛЬНЫЙ ПОЛНЫЙ СКРИПТ - УДАЛЕНИЕ СТАРЫХ + СОЗДАНИЕ НОВЫХ ФУНКЦИЙ
-- ========================================================================================

-- === ШАГ 1: УДАЛЕНИЕ ВСЕХ СТАРЫХ ФУНКЦИЙ ===
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS toggle_bookmark(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS toggle_follow(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS set_comment_reaction(uuid, uuid, text) CASCADE;

-- === ШАГ 2: СОЗДАНИЕ ВСЕХ НОВЫХ ФУНКЦИЙ ===

-- === 1. ФУНКЦИЯ ПОИСКА СТАТЕЙ (ИСПРАВЛЕННАЯ) ===
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
  SELECT * INTO article_record
  FROM articles
  WHERE id = p_article_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article not found';
  END IF;

  IF p_increment_views THEN
    UPDATE articles
    SET views = COALESCE(views, 0) + 1
    WHERE id = p_article_id;
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
  SELECT * INTO existing_bookmark
  FROM bookmarks
  WHERE article_id = p_article_id AND user_id = p_user_id;

  IF FOUND THEN
    DELETE FROM bookmarks
    WHERE article_id = p_article_id AND user_id = p_user_id;

    result := json_build_object('is_bookmarked', false);
  ELSE
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
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  SELECT * INTO existing_follow
  FROM follows
  WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF FOUND THEN
    DELETE FROM follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id;

    result := json_build_object('is_following', false);
  ELSE
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
  IF p_reaction NOT IN ('like', 'dislike') THEN
    RAISE EXCEPTION 'Invalid reaction type. Must be ''like'' or ''dislike''';
  END IF;

  SELECT * INTO existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = p_user_id;

  IF FOUND THEN
    IF existing_reaction.reaction = p_reaction THEN
      DELETE FROM comment_reactions
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    ELSE
      UPDATE comment_reactions
      SET reaction = p_reaction
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    END IF;
  ELSE
    INSERT INTO comment_reactions (comment_id, user_id, reaction)
    VALUES (p_comment_id, p_user_id, p_reaction);
  END IF;

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

  UPDATE comments
  SET
    likes_count = (result->>'likes_count')::integer,
    dislikes_count = (result->>'dislikes_count')::integer
  WHERE id = p_comment_id;

  RETURN result;
END;
$$;

-- === 6. ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО РАСЧЕТА ВРЕМЕНИ ЧТЕНИЯ ===
-- Добавляем колонку read_time_minutes если ее нет
ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_time_minutes numeric DEFAULT 1;

-- Создаем индекс для производительности
CREATE INDEX IF NOT EXISTS idx_articles_read_time ON articles(read_time_minutes);

-- Создаем триггер для автоматического расчета времени чтения
CREATE OR REPLACE FUNCTION calculate_read_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  content_text text := '';
  word_count integer := 0;
  image_count integer := 0;
  code_count integer := 0;
  read_minutes numeric := 1;
BEGIN
  -- Извлекаем текст из контента
  IF NEW.content IS NOT NULL THEN
    -- Простой подсчет слов (можно улучшить)
    content_text := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    word_count := array_length(regexp_split_to_array(content_text, '\s+'), 1);

    -- Считаем изображения
    image_count := (SELECT count(*) FROM regexp_matches(NEW.content, '<img', 'gi'));

    -- Считаем блоки кода
    code_count := (SELECT count(*) FROM regexp_matches(NEW.content, '<(pre|code)', 'gi'));

    -- Рассчитываем время чтения (180 слов в минуту для русского, 200 для английского)
    IF word_count > 0 THEN
      read_minutes := GREATEST(1, ROUND((word_count::numeric / 180 + image_count * 10 / 60 + code_count * 25 / 60) * 2) / 2);
      read_minutes := LEAST(read_minutes, 60); -- Максимум 60 минут
    END IF;
  END IF;

  NEW.read_time_minutes := read_minutes;
  RETURN NEW;
END;
$$;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_calculate_read_time ON articles;
CREATE TRIGGER trigger_calculate_read_time
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_read_time();

-- Обновляем существующие статьи
UPDATE articles SET content = content WHERE read_time_minutes IS NULL OR read_time_minutes = 0;
