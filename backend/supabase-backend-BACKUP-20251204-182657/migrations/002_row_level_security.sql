-- ============================================
-- Row Level Security (RLS) Policies
-- Настройка политик доступа для всех таблиц
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Все могут читать профили пользователей
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Пользователи могут создавать свой профиль при регистрации
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- ARTICLES TABLE POLICIES
-- ============================================

-- Все могут читать опубликованные статьи
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (published_at IS NOT NULL OR auth.uid()::text = author_id::text);

-- Авторизованные пользователи могут создавать статьи
CREATE POLICY "Authenticated users can create articles"
  ON articles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Авторы могут обновлять свои статьи
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid()::text = author_id::text);

-- Авторы могут удалять свои статьи
CREATE POLICY "Authors can delete own articles"
  ON articles FOR DELETE
  USING (auth.uid()::text = author_id::text);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================

-- Все могут читать комментарии к опубликованным статьям
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = comments.article_id
      AND articles.published_at IS NOT NULL
    )
  );

-- Авторизованные пользователи могут создавать комментарии
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Авторы могут обновлять свои комментарии
CREATE POLICY "Authors can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid()::text = author_id::text);

-- Авторы могут удалять свои комментарии
CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid()::text = author_id::text);

-- ============================================
-- ARTICLE_REACTIONS TABLE POLICIES
-- ============================================

-- Все могут читать реакции
CREATE POLICY "Article reactions are viewable by everyone"
  ON article_reactions FOR SELECT
  USING (true);

-- Авторизованные пользователи могут создавать реакции
CREATE POLICY "Authenticated users can create article reactions"
  ON article_reactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Пользователи могут обновлять свои реакции
CREATE POLICY "Users can update own article reactions"
  ON article_reactions FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Пользователи могут удалять свои реакции
CREATE POLICY "Users can delete own article reactions"
  ON article_reactions FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- COMMENT_REACTIONS TABLE POLICIES
-- ============================================

-- Все могут читать реакции на комментарии
CREATE POLICY "Comment reactions are viewable by everyone"
  ON comment_reactions FOR SELECT
  USING (true);

-- Авторизованные пользователи могут создавать реакции
CREATE POLICY "Authenticated users can create comment reactions"
  ON comment_reactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Пользователи могут обновлять свои реакции
CREATE POLICY "Users can update own comment reactions"
  ON comment_reactions FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Пользователи могут удалять свои реакции
CREATE POLICY "Users can delete own comment reactions"
  ON comment_reactions FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- BOOKMARKS TABLE POLICIES
-- ============================================

-- Пользователи могут видеть только свои закладки
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Авторизованные пользователи могут создавать закладки
CREATE POLICY "Authenticated users can create bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Пользователи могут удалять свои закладки
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- FOLLOWS TABLE POLICIES
-- ============================================

-- Все могут видеть подписки (для отображения followers/following)
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

-- Авторизованные пользователи могут создавать подписки
CREATE POLICY "Authenticated users can create follows"
  ON follows FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = follower_id::text);

-- Пользователи могут удалять свои подписки
CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  USING (auth.uid()::text = follower_id::text);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Пользователи могут видеть только свои уведомления
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Система может создавать уведомления (через service role)
-- Пользователи могут обновлять свои уведомления
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Пользователи могут удалять свои уведомления
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid()::text = user_id::text);

