-- Исправленная функция toggle_follow - возвращает ID записи или null
CREATE OR REPLACE FUNCTION toggle_follow(
  p_follower_id uuid,
  p_following_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_follow record;
  result json;
  follow_id uuid;
BEGIN
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  SELECT * INTO existing_follow
  FROM follows
  WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF FOUND THEN
    -- Отписываемся, возвращаем null
    DELETE FROM follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id;

    result := json_build_object('is_following', false, 'id', null);
  ELSE
    -- Подписываемся, создаем запись и возвращаем ее ID
    INSERT INTO follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id)
    RETURNING id INTO follow_id;

    result := json_build_object('is_following', true, 'id', follow_id);
  END IF;

  RETURN result;
END;
$$;
