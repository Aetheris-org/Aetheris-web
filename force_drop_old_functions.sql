-- Принудительно удалим все функции search_articles
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Удаляем все функции с именем search_articles
    FOR func_record IN
        SELECT oid::regprocedure AS func_signature
        FROM pg_proc 
        WHERE proname = 'search_articles'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.func_signature;
    END LOOP;
END $$;

-- Также проверим и удалим другие проблемные функции если есть
DROP FUNCTION IF EXISTS public.get_article_with_details(integer, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.get_article_with_details(integer, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.toggle_bookmark(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.toggle_follow(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.set_comment_reaction(uuid, uuid, text) CASCADE;
