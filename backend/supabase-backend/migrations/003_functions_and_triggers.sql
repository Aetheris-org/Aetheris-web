-- Supabase Migration: Additional Functions and Triggers
-- Дополнительные функции для автоматического создания профилей и обработки уведомлений

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_hash_value TEXT;
BEGIN
  -- Хешируем email используя HMAC-SHA256
  -- Используем EMAIL_HMAC_SECRET из переменных окружения Supabase
  -- В production это должно быть настроено через Supabase secrets
  email_hash_value := encode(
    hmac(
      lower(trim(NEW.email)),
      current_setting('app.settings.email_hmac_secret', true),
      'sha256'
    ),
    'hex'
  );

  -- Создаем профиль для нового пользователя
  INSERT INTO public.profiles (id, username, name, email_hash, provider, confirmed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    email_hash_value,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'local'),
    COALESCE((NEW.raw_user_meta_data->>'confirmed')::boolean, false)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create notification
-- Эта функция будет вызываться из backend API с service role
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_actor_id UUID,
  p_article_id INTEGER DEFAULT NULL,
  p_comment_id INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
  duplicate_exists BOOLEAN;
BEGIN
  -- Проверка на дубликаты (например, не создаем несколько уведомлений о подписке от одного пользователя)
  IF p_type = 'follow' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.notifications
      WHERE user_id = p_user_id
      AND type = p_type
      AND actor_id = p_actor_id
      AND created_at > NOW() - INTERVAL '1 hour'
    ) INTO duplicate_exists;

    IF duplicate_exists THEN
      RETURN NULL;
    END IF;
  END IF;

  -- Создаем уведомление
  INSERT INTO public.notifications (
    user_id,
    type,
    actor_id,
    article_id,
    comment_id,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_actor_id,
    p_article_id,
    p_comment_id,
    p_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reaction for article
CREATE OR REPLACE FUNCTION public.get_user_article_reaction(
  p_article_id INTEGER,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  reaction_value TEXT;
BEGIN
  SELECT reaction INTO reaction_value
  FROM public.article_reactions
  WHERE article_id = p_article_id
  AND user_id = p_user_id
  LIMIT 1;

  RETURN COALESCE(reaction_value, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reaction for comment
CREATE OR REPLACE FUNCTION public.get_user_comment_reaction(
  p_comment_id INTEGER,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  reaction_value TEXT;
BEGIN
  SELECT reaction INTO reaction_value
  FROM public.comment_reactions
  WHERE comment_id = p_comment_id
  AND user_id = p_user_id
  LIMIT 1;

  RETURN COALESCE(reaction_value, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for article statistics (для оптимизации запросов)
CREATE OR REPLACE VIEW public.article_stats AS
SELECT
  a.id,
  a.author_id,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT b.id) as bookmarks_count,
  COUNT(DISTINCT CASE WHEN ar.reaction = 'like' THEN ar.id END) as likes_count,
  COUNT(DISTINCT CASE WHEN ar.reaction = 'dislike' THEN ar.id END) as dislikes_count
FROM public.articles a
LEFT JOIN public.comments c ON c.article_id = a.id
LEFT JOIN public.bookmarks b ON b.article_id = a.id
LEFT JOIN public.article_reactions ar ON ar.article_id = a.id
GROUP BY a.id, a.author_id;

-- View for user statistics
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  p.id as user_id,
  COUNT(DISTINCT a.id) FILTER (WHERE a.published_at IS NOT NULL) as articles_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT f1.id) as followers_count,
  COUNT(DISTINCT f2.id) as following_count
FROM public.profiles p
LEFT JOIN public.articles a ON a.author_id = p.id
LEFT JOIN public.comments c ON c.author_id = p.id
LEFT JOIN public.follows f1 ON f1.following_id = p.id
LEFT JOIN public.follows f2 ON f2.follower_id = p.id
GROUP BY p.id;


