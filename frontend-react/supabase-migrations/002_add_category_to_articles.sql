-- Миграция: Добавление колонки category в таблицу articles
-- Дата создания: 2024-12-XX
-- Описание: Добавляет колонку category для категоризации статей (news, changes, и т.д.)

-- Добавление колонки category в таблицу articles
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Создание индекса для оптимизации запросов по категориям
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category) WHERE category IS NOT NULL;

-- Комментарии к колонке
COMMENT ON COLUMN articles.category IS 'Категория статьи: news (новости), changes (обновления) или NULL для обычных статей';
