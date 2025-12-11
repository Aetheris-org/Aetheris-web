CREATE OR REPLACE FUNCTION toggle_bookmark(
  p_article_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_bookmark record;
  result json;
BEGIN
  SELECT * INTO existing_bookmark
  FROM bookmarks
  WHERE article_id = p_article_id AND user_id = p_user_id;
  
  IF FOUND THEN
    DELETE FROM bookmarks 
    WHERE article_id = p_article_id AND user_id = p_user_id;
    
    result := json_build_object('is_bookmarked', false);
  ELSE
    INSERT INTO bookmarks (article_id, user_id)
    VALUES (p_article_id, p_user_id);
    
    result := json_build_object('is_bookmarked', true);
  END IF;
  
  RETURN result;
END;
$$;
