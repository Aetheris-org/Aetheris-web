-- ПРОСТОЙ СКРИПТ УДАЛЕНИЯ ФУНКЦИЙ
-- Выполните каждую команду отдельно в Supabase SQL Editor

-- 1. Удаляем все функции search_articles
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, uuid) CASCADE;

-- 2. Удаляем функции для статей
DROP FUNCTION IF EXISTS get_article_with_details(integer, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, uuid, boolean) CASCADE;

-- 3. Удаляем функции для закладок
DROP FUNCTION IF EXISTS toggle_bookmark(uuid, uuid) CASCADE;

-- 4. Удаляем функции для подписок  
DROP FUNCTION IF EXISTS toggle_follow(uuid, uuid) CASCADE;

-- 5. Удаляем функции для комментариев
DROP FUNCTION IF EXISTS set_comment_reaction(uuid, uuid, text) CASCADE;
