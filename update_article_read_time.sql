-- Функция для обновления времени прочтения статьи
-- Обновляет статистику чтения на основе реального времени пребывания пользователя

CREATE OR REPLACE FUNCTION update_article_read_time(
  p_article_id INTEGER,
  p_user_id TEXT DEFAULT NULL,
  p_read_time_seconds INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uuid UUID := NULL;
  v_existing_time INTEGER := 0;
  v_total_time INTEGER;
BEGIN
  -- Проверяем валидность входных данных
  IF p_article_id IS NULL OR p_read_time_seconds IS NULL OR p_read_time_seconds < 10 THEN
    RAISE EXCEPTION 'Invalid parameters: article_id and read_time_seconds (min 10) are required';
  END IF;

  -- Конвертируем user_id в UUID если он предоставлен
  IF p_user_id IS NOT NULL THEN
    BEGIN
      v_user_uuid := p_user_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- Игнорируем некорректный user_id
      v_user_uuid := NULL;
    END;
  END IF;

  -- Получаем существующее время чтения для этой статьи и пользователя
  -- (в будущем можно добавить таблицу article_read_times для детальной статистики)
  SELECT COALESCE(read_time_seconds, 0)
  INTO v_existing_time
  FROM article_read_stats
  WHERE article_id = p_article_id AND user_id = v_user_uuid;

  -- Вычисляем общее время чтения (максимум из существующего и нового)
  v_total_time := GREATEST(v_existing_time, p_read_time_seconds);

  -- Вставляем или обновляем статистику чтения
  INSERT INTO article_read_stats (article_id, user_id, read_time_seconds, updated_at)
  VALUES (p_article_id, v_user_uuid, v_total_time, NOW())
  ON CONFLICT (article_id, user_id)
  DO UPDATE SET
    read_time_seconds = GREATEST(article_read_stats.read_time_seconds, EXCLUDED.read_time_seconds),
    updated_at = NOW();

  -- Обновляем общую статистику статьи (опционально)
  -- Можно добавить поля вроде total_read_time, average_read_time в таблицу articles

  RETURN json_build_object(
    'success', true,
    'article_id', p_article_id,
    'user_id', v_user_uuid,
    'read_time_seconds', v_total_time,
    'message', 'Read time updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'article_id', p_article_id,
      'user_id', v_user_uuid
    );
END;
$$;

-- Создаем таблицу для хранения статистики чтения статей (если не существует)
CREATE TABLE IF NOT EXISTS article_read_stats (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Уникальный индекс для предотвращения дубликатов
  UNIQUE(article_id, user_id)
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_article_read_stats_article_id ON article_read_stats(article_id);
CREATE INDEX IF NOT EXISTS idx_article_read_stats_user_id ON article_read_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_article_read_stats_updated_at ON article_read_stats(updated_at);

-- Включаем RLS
ALTER TABLE article_read_stats ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свою статистику чтения
CREATE POLICY "Users can view own read stats" ON article_read_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут вставлять/обновлять только свою статистику
CREATE POLICY "Users can manage own read stats" ON article_read_stats
  FOR ALL USING (auth.uid() = user_id);

-- Политика: анонимные пользователи могут вставлять статистику (без user_id)
CREATE POLICY "Anonymous users can insert read stats" ON article_read_stats
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION update_article_read_time(INTEGER, TEXT, INTEGER) TO authenticated, anon;

-- Даем права на таблицу
GRANT ALL ON article_read_stats TO authenticated, anon;
GRANT USAGE ON SEQUENCE article_read_stats_id_seq TO authenticated, anon;
