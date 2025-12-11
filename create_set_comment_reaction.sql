CREATE OR REPLACE FUNCTION set_comment_reaction(
  p_comment_id uuid,
  p_user_id uuid,
  p_reaction text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_reaction record;
  result json;
BEGIN
  IF p_reaction NOT IN ('like', 'dislike') THEN
    RAISE EXCEPTION 'Invalid reaction type. Must be ''like'' or ''dislike''';
  END IF;
  
  SELECT * INTO existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = p_user_id;
  
  IF FOUND THEN
    IF existing_reaction.reaction = p_reaction THEN
      DELETE FROM comment_reactions 
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    ELSE
      UPDATE comment_reactions 
      SET reaction = p_reaction
      WHERE comment_id = p_comment_id AND user_id = p_user_id;
    END IF;
  ELSE
    INSERT INTO comment_reactions (comment_id, user_id, reaction)
    VALUES (p_comment_id, p_user_id, p_reaction);
  END IF;
  
  SELECT 
    COUNT(*) FILTER (WHERE reaction = 'like') as likes_count,
    COUNT(*) FILTER (WHERE reaction = 'dislike') as dislikes_count,
    CASE 
      WHEN p_user_id IN (SELECT user_id FROM comment_reactions WHERE comment_id = p_comment_id) 
      THEN (SELECT reaction FROM comment_reactions WHERE comment_id = p_comment_id AND user_id = p_user_id)
      ELSE NULL
    END as user_reaction
  INTO result
  FROM comment_reactions
  WHERE comment_id = p_comment_id;
  
  UPDATE comments 
  SET 
    likes_count = (result->>'likes_count')::integer,
    dislikes_count = (result->>'dislikes_count')::integer
  WHERE id = p_comment_id;
  
  RETURN result;
END;
$$;
