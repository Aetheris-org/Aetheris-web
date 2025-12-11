-- Исправленная функция toggle_follow с правильным порядком параметров
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
BEGIN
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  SELECT * INTO existing_follow
  FROM follows
  WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF FOUND THEN
    DELETE FROM follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id;

    result := json_build_object('is_following', false);
  ELSE
    INSERT INTO follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id);

    result := json_build_object('is_following', true);
  END IF;

  RETURN result;
END;
$$;
