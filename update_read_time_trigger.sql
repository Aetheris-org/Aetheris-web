-- Добавляем колонку read_time_minutes если ее нет
ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_time_minutes numeric DEFAULT 1;

-- Создаем индекс для производительности
CREATE INDEX IF NOT EXISTS idx_articles_read_time ON articles(read_time_minutes);

-- Создаем триггер для автоматического расчета времени чтения
CREATE OR REPLACE FUNCTION calculate_read_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  content_text text := '';
  word_count integer := 0;
  image_count integer := 0;
  code_count integer := 0;
  read_minutes numeric := 1;
BEGIN
  -- Извлекаем текст из контента
  IF NEW.content IS NOT NULL THEN
    -- Простой подсчет слов (можно улучшить)
    content_text := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    word_count := array_length(regexp_split_to_array(content_text, '\s+'), 1);
    
    -- Считаем изображения
    image_count := (SELECT count(*) FROM regexp_matches(NEW.content, '<img', 'gi'));
    
    -- Считаем блоки кода
    code_count := (SELECT count(*) FROM regexp_matches(NEW.content, '<(pre|code)', 'gi'));
    
    -- Рассчитываем время чтения (180 слов в минуту для русского, 200 для английского)
    IF word_count > 0 THEN
      read_minutes := GREATEST(1, ROUND((word_count::numeric / 180 + image_count * 10 / 60 + code_count * 25 / 60) * 2) / 2);
      read_minutes := LEAST(read_minutes, 60); -- Максимум 60 минут
    END IF;
  END IF;
  
  NEW.read_time_minutes := read_minutes;
  RETURN NEW;
END;
$$;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_calculate_read_time ON articles;
CREATE TRIGGER trigger_calculate_read_time
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_read_time();

-- Обновляем существующие статьи
UPDATE articles SET content = content WHERE read_time_minutes IS NULL OR read_time_minutes = 0;
