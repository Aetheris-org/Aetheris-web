-- Проверим тип ID в таблице articles
SELECT 
  id,
  pg_typeof(id) as id_type,
  id::text as id_as_text
FROM articles 
LIMIT 5;
