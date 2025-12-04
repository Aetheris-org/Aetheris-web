-- ============================================
-- Database Triggers для автоматического создания уведомлений
-- Заменяет логику из Express сервера
-- ============================================

-- ============================================
-- Функция для создания уведомления о лайке на статью
-- ============================================
CREATE OR REPLACE FUNCTION create_article_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_article_author_id UUID;
  v_likes_count INTEGER;
  v_threshold INTEGER;
  v_should_notify BOOLEAN := false;
BEGIN
  -- Получаем автора статьи
  SELECT author_id INTO v_article_author_id
  FROM articles
  WHERE id = NEW.article_id;

  -- Не создаем уведомление, если пользователь лайкает свою статью
  IF v_article_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Получаем текущее количество лайков
  SELECT likes_count INTO v_likes_count
  FROM articles
  WHERE id = NEW.article_id;

  -- Проверяем пороги для уведомлений (1, 5, 10, 50, 100, 500, 1000)
  IF v_likes_count IN (1, 5, 10, 50, 100, 500, 1000) THEN
    v_should_notify := true;
    v_threshold := v_likes_count;
  END IF;

  -- Проверяем, нет ли уже непрочитанного уведомления за последний час
  IF v_should_notify THEN
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = v_article_author_id
        AND type = 'article_like'
        AND actor_id = NEW.user_id
        AND article_id = NEW.article_id
        AND is_read = false
        AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      INSERT INTO notifications (
        user_id,
        type,
        actor_id,
        article_id,
        metadata
      ) VALUES (
        v_article_author_id,
        'article_like',
        NEW.user_id,
        NEW.article_id,
        jsonb_build_object('threshold', v_threshold, 'likesCount', v_likes_count)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомлений при лайке статьи
DROP TRIGGER IF EXISTS article_like_notification_trigger ON article_reactions;
CREATE TRIGGER article_like_notification_trigger
  AFTER INSERT ON article_reactions
  FOR EACH ROW
  WHEN (NEW.reaction = 'like')
  EXECUTE FUNCTION create_article_like_notification();

-- ============================================
-- Функция для создания уведомления о лайке на комментарий
-- ============================================
CREATE OR REPLACE FUNCTION create_comment_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_comment_author_id UUID;
BEGIN
  -- Получаем автора комментария
  SELECT author_id INTO v_comment_author_id
  FROM comments
  WHERE id = NEW.comment_id;

  -- Не создаем уведомление, если пользователь лайкает свой комментарий
  IF v_comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Проверяем, нет ли уже непрочитанного уведомления за последний час
  IF NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = v_comment_author_id
      AND type = 'comment_like'
      AND actor_id = NEW.user_id
      AND comment_id = NEW.comment_id
      AND is_read = false
      AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    INSERT INTO notifications (
      user_id,
      type,
      actor_id,
      comment_id
    ) VALUES (
      v_comment_author_id,
      'comment_like',
      NEW.user_id,
      NEW.comment_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомлений при лайке комментария
DROP TRIGGER IF EXISTS comment_like_notification_trigger ON comment_reactions;
CREATE TRIGGER comment_like_notification_trigger
  AFTER INSERT ON comment_reactions
  FOR EACH ROW
  WHEN (NEW.reaction = 'like')
  EXECUTE FUNCTION create_comment_like_notification();

-- ============================================
-- Функция для создания уведомления о комментарии
-- ============================================
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_article_author_id UUID;
  v_parent_comment_author_id UUID;
BEGIN
  -- Получаем автора статьи
  SELECT author_id INTO v_article_author_id
  FROM articles
  WHERE id = NEW.article_id;

  -- Если это ответ на комментарий, получаем автора родительского комментария
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_author_id
    FROM comments
    WHERE id = NEW.parent_id;
  END IF;

  -- Уведомляем автора статьи (если это не его комментарий)
  IF v_article_author_id IS NOT NULL 
     AND v_article_author_id != NEW.author_id 
     AND (NEW.parent_id IS NULL OR v_parent_comment_author_id != v_article_author_id) THEN
    INSERT INTO notifications (
      user_id,
      type,
      actor_id,
      article_id,
      comment_id
    ) VALUES (
      v_article_author_id,
      'comment',
      NEW.author_id,
      NEW.article_id,
      NEW.id
    )
    ON CONFLICT DO NOTHING; -- Избегаем дубликатов
  END IF;

  -- Уведомляем автора родительского комментария (если это ответ)
  IF v_parent_comment_author_id IS NOT NULL 
     AND v_parent_comment_author_id != NEW.author_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      actor_id,
      article_id,
      comment_id
    ) VALUES (
      v_parent_comment_author_id,
      'comment_reply',
      NEW.author_id,
      NEW.article_id,
      NEW.id
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомлений при создании комментария
DROP TRIGGER IF EXISTS comment_notification_trigger ON comments;
CREATE TRIGGER comment_notification_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- ============================================
-- Функция для создания уведомления о подписке
-- ============================================
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаем уведомление о новой подписке
  INSERT INTO notifications (
    user_id,
    type,
    actor_id
  ) VALUES (
    NEW.following_id,
    'follow',
    NEW.follower_id
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомлений при подписке
DROP TRIGGER IF EXISTS follow_notification_trigger ON follows;
CREATE TRIGGER follow_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- ============================================
-- Функция для создания уведомления о публикации статьи
-- ============================================
CREATE OR REPLACE FUNCTION create_article_published_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_follower RECORD;
BEGIN
  -- Если статья только что опубликована (была draft, стала published)
  IF OLD.published_at IS NULL AND NEW.published_at IS NOT NULL THEN
    -- Уведомляем всех подписчиков автора
    FOR v_follower IN
      SELECT follower_id
      FROM follows
      WHERE following_id = NEW.author_id
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        actor_id,
        article_id
      ) VALUES (
        v_follower.follower_id,
        'article_published',
        NEW.author_id,
        NEW.id
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания уведомлений при публикации статьи
DROP TRIGGER IF EXISTS article_published_notification_trigger ON articles;
CREATE TRIGGER article_published_notification_trigger
  AFTER UPDATE OF published_at ON articles
  FOR EACH ROW
  WHEN (OLD.published_at IS NULL AND NEW.published_at IS NOT NULL)
  EXECUTE FUNCTION create_article_published_notification();

