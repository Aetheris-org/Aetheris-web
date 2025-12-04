-- ============================================
-- Database Functions для кастомной логики
-- ============================================

-- ============================================
-- Функция поиска статей с фильтрацией
-- ============================================
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
  id INTEGER,
  title TEXT,
  content JSONB,
  excerpt TEXT,
  author_id UUID,
  tags TEXT[],
  difficulty TEXT,
  preview_image TEXT,
  likes_count INTEGER,
  dislikes_count INTEGER,
  views INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author JSONB,
  user_reaction TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_articles AS (
    SELECT 
      a.*,
      COUNT(*) OVER() as total_count
    FROM articles a
    WHERE 
      -- Только опубликованные статьи
      a.published_at IS NOT NULL
      -- Поиск по тексту
      AND (p_search IS NULL OR 
           a.title ILIKE '%' || p_search || '%' OR 
           a.excerpt ILIKE '%' || p_search || '%')
      -- Фильтр по тегам
      AND (p_tags IS NULL OR a.tags && p_tags)
      -- Фильтр по сложности
      AND (p_difficulty IS NULL OR a.difficulty = p_difficulty)
  ),
  sorted_articles AS (
    SELECT *
    FROM filtered_articles
    ORDER BY 
      CASE 
        WHEN p_sort = 'popular' THEN views
        WHEN p_sort = 'likes' THEN likes_count
        ELSE NULL::INTEGER
      END DESC NULLS LAST,
      CASE 
        WHEN p_sort = 'oldest' THEN published_at
        ELSE NULL::TIMESTAMPTZ
      END ASC NULLS FIRST,
      CASE 
        WHEN p_sort = 'newest' OR p_sort IS NULL THEN published_at
        WHEN p_sort = 'oldest' THEN NULL::TIMESTAMPTZ
        ELSE published_at
      END DESC NULLS LAST,
      created_at DESC
    LIMIT p_take
    OFFSET p_skip
  ),
  articles_with_author AS (
    SELECT 
      sa.*,
      jsonb_build_object(
        'id', u.id,
        'username', u.username,
        'avatar', u.avatar,
        'name', u.name
      ) as author_data
    FROM sorted_articles sa
    LEFT JOIN users u ON u.id = sa.author_id
  ),
  articles_with_reaction AS (
    SELECT 
      awa.*,
      ar.reaction as user_reaction_data
    FROM articles_with_author awa
    LEFT JOIN article_reactions ar ON 
      ar.article_id = awa.id 
      AND ar.user_id = p_user_id
  )
  SELECT 
    a.id,
    a.title,
    a.content,
    a.excerpt,
    a.author_id,
    a.tags,
    a.difficulty,
    a.preview_image,
    a.likes_count,
    a.dislikes_count,
    a.views,
    a.published_at,
    a.created_at,
    a.updated_at,
    a.author_data as author,
    a.user_reaction_data as user_reaction,
    a.total_count
  FROM articles_with_reaction a;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Функция получения статьи с автором и реакцией пользователя
-- ============================================
CREATE OR REPLACE FUNCTION get_article_with_details(
  p_article_id INTEGER,
  p_user_id UUID DEFAULT NULL,
  p_increment_views BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  content JSONB,
  excerpt TEXT,
  author_id UUID,
  tags TEXT[],
  difficulty TEXT,
  preview_image TEXT,
  likes_count INTEGER,
  dislikes_count INTEGER,
  views INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author JSONB,
  user_reaction TEXT
) AS $$
BEGIN
  -- Увеличиваем счетчик просмотров
  IF p_increment_views THEN
    UPDATE articles
    SET views = views + 1
    WHERE id = p_article_id;
  END IF;

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
    a.likes_count,
    a.dislikes_count,
    a.views,
    a.published_at,
    a.created_at,
    a.updated_at,
    jsonb_build_object(
      'id', u.id,
      'username', u.username,
      'avatar', u.avatar,
      'name', u.name,
      'bio', u.bio
    ) as author,
    ar.reaction as user_reaction
  FROM articles a
  LEFT JOIN users u ON u.id = a.author_id
  LEFT JOIN article_reactions ar ON 
    ar.article_id = a.id 
    AND ar.user_id = p_user_id
  WHERE a.id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Функция для toggle реакции на статью
-- ============================================
CREATE OR REPLACE FUNCTION toggle_article_reaction(
  p_article_id INTEGER,
  p_user_id UUID,
  p_reaction TEXT
)
RETURNS TABLE (
  article_id INTEGER,
  likes_count INTEGER,
  dislikes_count INTEGER,
  user_reaction TEXT
) AS $$
DECLARE
  v_existing_reaction TEXT;
  v_new_likes_count INTEGER;
  v_new_dislikes_count INTEGER;
BEGIN
  -- Проверяем существующую реакцию
  SELECT reaction INTO v_existing_reaction
  FROM article_reactions
  WHERE article_id = p_article_id AND user_id = p_user_id;

  IF v_existing_reaction = p_reaction THEN
    -- Удаляем реакцию (toggle off)
    DELETE FROM article_reactions
    WHERE article_id = p_article_id AND user_id = p_user_id;
    
    v_new_likes_count := (SELECT likes_count FROM articles WHERE id = p_article_id) - 
                         CASE WHEN p_reaction = 'like' THEN 1 ELSE 0 END;
    v_new_dislikes_count := (SELECT dislikes_count FROM articles WHERE id = p_article_id) - 
                            CASE WHEN p_reaction = 'dislike' THEN 1 ELSE 0 END;
    
    UPDATE articles
    SET 
      likes_count = GREATEST(0, v_new_likes_count),
      dislikes_count = GREATEST(0, v_new_dislikes_count)
    WHERE id = p_article_id;
    
    RETURN QUERY SELECT p_article_id, v_new_likes_count, v_new_dislikes_count, NULL::TEXT;
  ELSE
    -- Обновляем или создаем реакцию
    INSERT INTO article_reactions (article_id, user_id, reaction)
    VALUES (p_article_id, p_user_id, p_reaction)
    ON CONFLICT (article_id, user_id) 
    DO UPDATE SET reaction = p_reaction;
    
    -- Обновляем счетчики
    IF v_existing_reaction IS NOT NULL THEN
      -- Меняем реакцию
      v_new_likes_count := (SELECT likes_count FROM articles WHERE id = p_article_id) + 
                           CASE WHEN p_reaction = 'like' THEN 1 ELSE -1 END;
      v_new_dislikes_count := (SELECT dislikes_count FROM articles WHERE id = p_article_id) + 
                              CASE WHEN p_reaction = 'dislike' THEN 1 ELSE -1 END;
    ELSE
      -- Новая реакция
      v_new_likes_count := (SELECT likes_count FROM articles WHERE id = p_article_id) + 
                           CASE WHEN p_reaction = 'like' THEN 1 ELSE 0 END;
      v_new_dislikes_count := (SELECT dislikes_count FROM articles WHERE id = p_article_id) + 
                              CASE WHEN p_reaction = 'dislike' THEN 1 ELSE 0 END;
    END IF;
    
    UPDATE articles
    SET 
      likes_count = GREATEST(0, v_new_likes_count),
      dislikes_count = GREATEST(0, v_new_dislikes_count)
    WHERE id = p_article_id;
    
    RETURN QUERY SELECT p_article_id, v_new_likes_count, v_new_dislikes_count, p_reaction;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Функция для toggle закладки
-- ============================================
CREATE OR REPLACE FUNCTION toggle_bookmark(
  p_article_id INTEGER,
  p_user_id UUID
)
RETURNS TABLE (
  is_bookmarked BOOLEAN,
  bookmark_id UUID
) AS $$
DECLARE
  v_existing_bookmark_id UUID;
BEGIN
  -- Проверяем существующую закладку
  SELECT id INTO v_existing_bookmark_id
  FROM bookmarks
  WHERE article_id = p_article_id AND user_id = p_user_id;

  IF v_existing_bookmark_id IS NOT NULL THEN
    -- Удаляем закладку
    DELETE FROM bookmarks
    WHERE id = v_existing_bookmark_id;
    
    RETURN QUERY SELECT false, NULL::UUID;
  ELSE
    -- Создаем закладку
    INSERT INTO bookmarks (article_id, user_id)
    VALUES (p_article_id, p_user_id)
    RETURNING id INTO v_existing_bookmark_id;
    
    RETURN QUERY SELECT true, v_existing_bookmark_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Функция для toggle подписки
-- ============================================
CREATE OR REPLACE FUNCTION toggle_follow(
  p_following_id UUID,
  p_follower_id UUID
)
RETURNS TABLE (
  is_following BOOLEAN,
  follow_id UUID
) AS $$
DECLARE
  v_existing_follow_id UUID;
BEGIN
  -- Нельзя подписаться на себя
  IF p_following_id = p_follower_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  -- Проверяем существующую подписку
  SELECT id INTO v_existing_follow_id
  FROM follows
  WHERE following_id = p_following_id AND follower_id = p_follower_id;

  IF v_existing_follow_id IS NOT NULL THEN
    -- Удаляем подписку
    DELETE FROM follows
    WHERE id = v_existing_follow_id;
    
    RETURN QUERY SELECT false, NULL::UUID;
  ELSE
    -- Создаем подписку
    INSERT INTO follows (following_id, follower_id)
    VALUES (p_following_id, p_follower_id)
    RETURNING id INTO v_existing_follow_id;
    
    RETURN QUERY SELECT true, v_existing_follow_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Обновление триггеров для счетчиков
-- ============================================

-- Триггер для обновления счетчиков реакций на статьях
CREATE OR REPLACE FUNCTION update_article_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles
    SET 
      likes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = NEW.article_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = NEW.article_id AND reaction = 'dislike'
      )
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles
    SET 
      likes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = OLD.article_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = OLD.article_id AND reaction = 'dislike'
      )
    WHERE id = OLD.article_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE articles
    SET 
      likes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = NEW.article_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM article_reactions 
        WHERE article_id = NEW.article_id AND reaction = 'dislike'
      )
    WHERE id = NEW.article_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Удаляем старые триггеры если есть
DROP TRIGGER IF EXISTS update_article_reaction_counts_trigger ON article_reactions;
CREATE TRIGGER update_article_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON article_reactions
  FOR EACH ROW EXECUTE FUNCTION update_article_reaction_counts();

-- Аналогично для комментариев
CREATE OR REPLACE FUNCTION update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments
    SET 
      likes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = NEW.comment_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = NEW.comment_id AND reaction = 'dislike'
      )
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments
    SET 
      likes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = OLD.comment_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = OLD.comment_id AND reaction = 'dislike'
      )
    WHERE id = OLD.comment_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE comments
    SET 
      likes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = NEW.comment_id AND reaction = 'like'
      ),
      dislikes_count = (
        SELECT COUNT(*) FROM comment_reactions 
        WHERE comment_id = NEW.comment_id AND reaction = 'dislike'
      )
    WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comment_reaction_counts_trigger ON comment_reactions;
CREATE TRIGGER update_comment_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW EXECUTE FUNCTION update_comment_reaction_counts();
