-- Удаляем старую функцию search_articles которая принимает text для p_user_id
DROP FUNCTION IF EXISTS public.search_articles(text, text[], text, text, integer, integer, text);

-- Оставляем только новую функцию которая принимает uuid для p_user_id
-- (она уже должна быть создана из предыдущего скрипта)

-- Проверяем что функция существует
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'search_articles' 
  AND pg_function_is_visible(oid);
