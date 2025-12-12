-- Функция для установки реакций на комментарии
-- Создает/обновляет реакции и пересчитывает счетчики

CREATE OR REPLACE FUNCTION set_comment_reaction(
  p_comment_id UUID,
  p_user_id UUID,
  p_reaction TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_reaction TEXT;
  v_likes_count INTEGER := 0;
  v_dislikes_count INTEGER := 0;
  v_user_reaction TEXT := NULL;
BEGIN
  -- Проверяем существование комментария
  IF NOT EXISTS (SELECT 1 FROM comments WHERE id = p_comment_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Comment not found'
    );
  END IF;

  -- Проверяем валидность реакции
  IF p_reaction IS NOT NULL AND p_reaction NOT IN ('like', 'dislike') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid reaction. Must be "like" or "dislike"'
    );
  END IF;

  -- Получаем текущую реакцию пользователя (если есть)
  SELECT reaction INTO v_existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = p_user_id;

  -- Логика установки реакции
  IF p_reaction IS NULL THEN
    -- Удаляем реакцию (toggle off)
    DELETE FROM comment_reactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
  ELSIF v_existing_reaction = p_reaction THEN
    -- Та же реакция - удаляем (toggle off)
    DELETE FROM comment_reactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
  ELSE
    -- Новая или другая реакция - устанавливаем
    INSERT INTO comment_reactions (comment_id, user_id, reaction)
    VALUES (p_comment_id, p_user_id, p_reaction)
    ON CONFLICT (comment_id, user_id)
    DO UPDATE SET
      reaction = EXCLUDED.reaction,
      created_at = NOW();
  END IF;

  -- Пересчитываем счетчики
  SELECT
    COUNT(*) FILTER (WHERE reaction = 'like'),
    COUNT(*) FILTER (WHERE reaction = 'dislike')
  INTO v_likes_count, v_dislikes_count
  FROM comment_reactions
  WHERE comment_id = p_comment_id;

  -- Обновляем счетчики в таблице comments
  UPDATE comments
  SET
    likes_count = v_likes_count,
    dislikes_count = v_dislikes_count
  WHERE id = p_comment_id;

  -- Получаем финальную реакцию пользователя
  SELECT reaction INTO v_user_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'comment_id', p_comment_id,
    'user_id', p_user_id,
    'user_reaction', v_user_reaction,
    'likes_count', v_likes_count,
    'dislikes_count', v_dislikes_count,
    'message', 'Reaction updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'comment_id', p_comment_id,
      'user_id', p_user_id
    );
END;
$$;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION set_comment_reaction(UUID, UUID, TEXT) TO authenticated, anon;

-- Убеждаемся, что таблица comment_reactions существует
CREATE TABLE IF NOT EXISTS comment_reactions (
  id SERIAL PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(comment_id, user_id)
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_reaction ON comment_reactions(reaction);

-- Включаем RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view all comment reactions" ON comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own comment reactions" ON comment_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Даем права на таблицу
GRANT ALL ON comment_reactions TO authenticated, anon;
GRANT USAGE ON SEQUENCE comment_reactions_id_seq TO authenticated, anon;
