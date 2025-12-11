-- Обновляем существующие статьи для пересчета времени чтения
UPDATE articles SET content = content WHERE read_time_minutes IS NULL OR read_time_minutes = 0;
