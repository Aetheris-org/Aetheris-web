-- Проверим структуру таблицы articles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- Проверим структуру таблицы profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
