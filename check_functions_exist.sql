-- Проверяем какие функции существуют в базе данных
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  obj_description(oid, 'pg_proc') as description
FROM pg_proc 
WHERE proname IN ('search_articles', 'get_article_with_details', 'toggle_bookmark', 'toggle_follow', 'set_comment_reaction')
  AND pg_function_is_visible(oid)
ORDER BY proname;

-- Проверяем какие таблицы существуют
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('articles', 'profiles', 'follows', 'bookmarks', 'article_reactions', 'comment_reactions')
ORDER BY table_name;
