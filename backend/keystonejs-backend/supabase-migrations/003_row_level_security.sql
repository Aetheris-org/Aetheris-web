-- Supabase Migration: Row Level Security (RLS) Policies
-- Настройка политик безопасности для всех таблиц

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Все могут читать профили (публичные данные)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Пользователи могут создавать свой профиль при регистрации
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ARTICLES POLICIES
-- ============================================

-- Все могут читать опубликованные статьи
CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (published_at IS NOT NULL);

-- Авторы могут читать свои неопубликованные статьи (черновики)
CREATE POLICY "Authors can view own drafts"
  ON public.articles FOR SELECT
  USING (auth.uid() = author_id OR published_at IS NOT NULL);

-- Авторизованные пользователи могут создавать статьи
CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Авторы могут обновлять свои статьи
CREATE POLICY "Authors can update own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

-- Авторы могут удалять свои статьи
CREATE POLICY "Authors can delete own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Все могут читать комментарии к опубликованным статьям
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = comments.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Авторизованные пользователи могут создавать комментарии
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = comments.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Авторы могут обновлять свои комментарии
CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Авторы могут удалять свои комментарии
CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- ARTICLE REACTIONS POLICIES
-- ============================================

-- Все могут читать реакции на опубликованные статьи
CREATE POLICY "Article reactions are viewable by everyone"
  ON public.article_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_reactions.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Авторизованные пользователи могут создавать реакции
CREATE POLICY "Authenticated users can create article reactions"
  ON public.article_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_reactions.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Пользователи могут обновлять свои реакции
CREATE POLICY "Users can update own article reactions"
  ON public.article_reactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут удалять свои реакции
CREATE POLICY "Users can delete own article reactions"
  ON public.article_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENT REACTIONS POLICIES
-- ============================================

-- Все могут читать реакции на комментарии
CREATE POLICY "Comment reactions are viewable by everyone"
  ON public.comment_reactions FOR SELECT
  USING (true);

-- Авторизованные пользователи могут создавать реакции
CREATE POLICY "Authenticated users can create comment reactions"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои реакции
CREATE POLICY "Users can update own comment reactions"
  ON public.comment_reactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут удалять свои реакции
CREATE POLICY "Users can delete own comment reactions"
  ON public.comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- BOOKMARKS POLICIES
-- ============================================

-- Пользователи могут читать только свои закладки
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Авторизованные пользователи могут создавать закладки
CREATE POLICY "Authenticated users can create bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = bookmarks.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Пользователи могут удалять свои закладки
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FOLLOWS POLICIES
-- ============================================

-- Все могут читать подписки (публичная информация)
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

-- Авторизованные пользователи могут создавать подписки
CREATE POLICY "Authenticated users can create follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Пользователи могут удалять свои подписки
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Пользователи могут читать только свои уведомления
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Система может создавать уведомления (через service role)
-- Обычные пользователи не могут создавать уведомления напрямую
-- Это будет делаться через backend API с service role ключом

-- Пользователи могут обновлять свои уведомления (например, отмечать как прочитанные)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут удалять свои уведомления
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);


