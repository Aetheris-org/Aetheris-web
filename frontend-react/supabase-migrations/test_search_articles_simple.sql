-- Простой тестовый запрос к функции search_articles
-- Попробуйте выполнить эту команду

-- Вариант 1: Без параметров (используются значения по умолчанию)
SELECT 
  id,
  title,
  category,
  excerpt,
  published_at
FROM search_articles()
LIMIT 3;

-- Вариант 2: Если первый вариант не работает, попробуйте с явными NULL
SELECT 
  id,
  title,
  category,
  excerpt,
  published_at
FROM search_articles(
  NULL,
  NULL,
  NULL,
  'newest',
  0,
  3,
  NULL
)
LIMIT 3;
