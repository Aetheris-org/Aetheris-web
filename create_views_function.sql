-- СОЗДАНИЕ ФУНКЦИИ increment_article_views
-- Выполните этот скрипт ЦЕЛИКОМ в Supabase SQL Editor

-- Удаляем старую версию если существует
DROP FUNCTION IF EXISTS increment_article_views(uuid, text) CASCADE;
DROP TABLE IF EXISTS user_article_views CASCADE;

-- Создаем таблицу для защиты от накрутки
CREATE TABLE user_article_views (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  view_hour TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('hour', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id, view_hour)
);

-- Включаем RLS
ALTER TABLE user_article_views ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view own article views" ON user_article_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article views" ON user_article_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Создаем функцию
CREATE OR REPLACE FUNCTION increment_article_views(
  p_article_id UUID,
  p_user_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uuid UUID := NULL;
  v_current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Проверяем существование статьи
  IF NOT EXISTS (SELECT 1 FROM articles WHERE id = p_article_id) THEN
    RETURN json_build_object('success', false, 'error', 'Article not found');
  END IF;

  -- Конвертируем user_id в UUID если он предоставлен
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    BEGIN
      v_user_uuid := p_user_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_user_uuid := NULL;
    END;
  END IF;

  -- Текущий час (округляем до начала часа)
  v_current_hour := DATE_TRUNC('hour', NOW());

  -- Для авторизованных пользователей: проверяем лимит 1 просмотр в час
  IF v_user_uuid IS NOT NULL THEN
    INSERT INTO user_article_views (user_id, article_id, view_hour)
    VALUES (v_user_uuid, p_article_id, v_current_hour)
    ON CONFLICT (user_id, article_id, view_hour) DO NOTHING;

    -- Если вставка не удалась (конфликт) - значит уже считали просмотр в этом часу
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', true,
        'message', 'View already counted this hour',
        'user_id', v_user_uuid,
        'article_id', p_article_id
      );
    END IF;
  END IF;

  -- Инкрементим просмотры в таблице articles
  UPDATE articles
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_article_id;

  RETURN json_build_object(
    'success', true,
    'article_id', p_article_id,
    'user_id', v_user_uuid,
    'message', 'Views incremented successfully',
    'view_hour', v_current_hour
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

-- Даем права
GRANT EXECUTE ON FUNCTION increment_article_views(UUID, TEXT) TO authenticated, anon;
GRANT ALL ON user_article_views TO authenticated, anon;
