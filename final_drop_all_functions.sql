-- ФИНАЛЬНОЕ УДАЛЕНИЕ ВСЕХ ФУНКЦИЙ ПЕРЕД ПОВТОРНЫМ СОЗДАНИЕМ

-- Удаляем все варианты search_articles
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, uuid) CASCADE;

-- Удаляем все варианты get_article_with_details
DROP FUNCTION IF EXISTS get_article_with_details(integer, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, uuid, boolean) CASCADE;

-- Удаляем функции закладок
DROP FUNCTION IF EXISTS toggle_bookmark(uuid, uuid) CASCADE;

-- Удаляем функции подписок
DROP FUNCTION IF EXISTS toggle_follow(uuid, uuid) CASCADE;

-- Удаляем функции комментариев
DROP FUNCTION IF EXISTS set_comment_reaction(uuid, uuid, text) CASCADE;
