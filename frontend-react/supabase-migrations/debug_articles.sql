-- Отладка: проверка статей в базе данных
-- Выполните эти запросы по очереди, чтобы понять, почему search_articles не возвращает данные

-- 1. Проверка всех статей с категорией news
SELECT 
  id,
  title,
  category,
  published_at,
  created_at,
  CASE 
    WHEN published_at IS NULL THEN 'NOT PUBLISHED'
    WHEN published_at IS NOT NULL THEN 'PUBLISHED'
  END as status
FROM articles
WHERE category = 'news'
ORDER BY created_at DESC;

-- 2. Проверка опубликованных статей с категорией news
SELECT 
  id,
  title,
  category,
  published_at,
  created_at
FROM articles
WHERE category = 'news' 
  AND published_at IS NOT NULL
ORDER BY created_at DESC;

-- 3. Проверка всех статей (включая без категории)
SELECT 
  id,
  title,
  category,
  published_at,
  created_at,
  CASE 
    WHEN published_at IS NULL THEN 'NOT PUBLISHED'
    WHEN published_at IS NOT NULL THEN 'PUBLISHED'
  END as status
FROM articles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Подробная проверка условий из функции search_articles
SELECT 
  id,
  title,
  category,
  published_at,
  tags,
  difficulty,
  CASE 
    WHEN published_at IS NOT NULL THEN '✓ passed published_at check'
    ELSE '✗ failed published_at check'
  END as published_check
FROM articles
WHERE category = 'news'
ORDER BY created_at DESC;

-- 5. Тест функции с явным указанием параметров
SELECT 
  id,
  title,
  category,
  published_at,
  excerpt
FROM search_articles(
  NULL::TEXT,        -- p_search
  NULL::TEXT[],      -- p_tags
  NULL::TEXT,        -- p_difficulty
  'newest'::TEXT,    -- p_sort
  0::INTEGER,        -- p_skip
  10::INTEGER,       -- p_take
  NULL::UUID         -- p_user_id
);

-- 6. Проверка типов данных
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'articles' 
  AND column_name IN ('category', 'published_at', 'id', 'title')
ORDER BY ordinal_position;
