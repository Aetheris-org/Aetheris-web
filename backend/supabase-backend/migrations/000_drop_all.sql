-- ============================================
-- ПОЛНАЯ ОЧИСТКА БАЗЫ ДАННЫХ
-- ⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные и таблицы!
-- Используйте только для чистой установки
-- ============================================

-- Удаляем все триггеры (если существуют)
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
  DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Удаляем функцию (если существует)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Удаляем все таблицы (в правильном порядке из-за foreign keys)
-- CASCADE автоматически удалит зависимости
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS article_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаляем расширение UUID (если не используется другими объектами)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Готово! Теперь можно применить 001_initial_schema.sql заново

