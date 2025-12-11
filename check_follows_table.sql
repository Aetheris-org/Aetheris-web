-- Проверяем структуру таблицы follows
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'follows'
ORDER BY ordinal_position;

-- Проверяем есть ли записи в таблице follows
SELECT COUNT(*) as total_follows FROM follows;

-- Проверяем индексы на таблице follows
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'follows';
