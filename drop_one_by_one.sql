-- ВЫПОЛНИТЕ КАЖДУЮ СТРОКУ ОТДЕЛЬНО!!!

DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS search_articles(text, text[], text, text, integer, integer, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS get_article_with_details(integer, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS toggle_bookmark(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS toggle_follow(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS set_comment_reaction(uuid, uuid, text) CASCADE;
