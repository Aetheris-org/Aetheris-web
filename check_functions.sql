-- Проверим какие функции search_articles существуют
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  obj_description(oid, 'pg_proc') as description
FROM pg_proc 
WHERE proname = 'search_articles' 
  AND pg_function_is_visible(oid)
ORDER BY oid;

-- Проверим какие функции существуют для закладок и непрочитанных
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%bookmark%' OR proname LIKE '%unread%'
  AND pg_function_is_visible(oid)
ORDER BY proname;
