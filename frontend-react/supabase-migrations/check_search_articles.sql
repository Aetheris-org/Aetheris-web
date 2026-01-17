-- Проверка функции search_articles
-- Выполните эти команды в Supabase SQL Editor для проверки

-- 1. Проверка существования функции и её сигнатуры
SELECT 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'search_articles' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY oid;

-- 2. Проверка возвращаемого типа функции (должно включать category)
SELECT 
  p.proname as function_name,
  t.typname as return_type_name,
  a.attname as column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) as column_type
FROM pg_proc p
JOIN pg_type t ON p.prorettype = t.oid
LEFT JOIN pg_attribute a ON a.attrelid = t.typrelid
WHERE p.proname = 'search_articles'
  AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;

-- 3. Тестовый запрос к функции (проверка, что category возвращается)
-- Вариант 1: С именованными параметрами
SELECT 
  id,
  title,
  category,
  published_at
FROM search_articles(
  p_search => NULL,
  p_tags => NULL,
  p_difficulty => NULL,
  p_sort => 'newest',
  p_skip => 0,
  p_take => 5,
  p_user_id => NULL
)
LIMIT 5;

-- Вариант 2: С позиционными параметрами (используя DEFAULT значения)
SELECT 
  id,
  title,
  category,
  published_at
FROM search_articles()
LIMIT 5;

-- Вариант 3: С минимальными параметрами
SELECT 
  id,
  title,
  category,
  published_at
FROM search_articles(
  NULL::TEXT,
  NULL::TEXT[],
  NULL::TEXT,
  'newest'::TEXT,
  0::INTEGER,
  5::INTEGER,
  NULL::UUID
)
LIMIT 5;

-- 4. Проверка, что в базе есть статьи с категорией
SELECT 
  COUNT(*) as total_articles,
  COUNT(category) as articles_with_category,
  COUNT(*) FILTER (WHERE category = 'news') as news_articles,
  COUNT(*) FILTER (WHERE category = 'changes') as changes_articles,
  COUNT(*) FILTER (WHERE category IS NULL) as articles_without_category
FROM articles
WHERE published_at IS NOT NULL;
