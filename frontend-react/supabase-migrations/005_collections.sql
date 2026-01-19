-- Миграция: Коллекции статей с совместным редактированием
-- Коллекции — сборники статей. Пользователи могут: сохранять, лайкать, приглашать соавторов по ссылке или по тегу.
-- Коллекции участвуют в лидербордах (по лайкам и сохранениям).
--
-- Требования: таблица public.articles с id UUID. Если articles.id имеет тип bigint,
-- замените в collection_articles: article_id UUID -> article_id BIGINT и REFERENCES.

-- =============================================================================
-- 1. Таблица коллекций
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  invite_token TEXT UNIQUE,
  likes_count INT NOT NULL DEFAULT 0,
  saves_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT collections_title_length CHECK (char_length(title) >= 2 AND char_length(title) <= 200)
);

CREATE INDEX IF NOT EXISTS idx_collections_owner ON public.collections(owner_id);
CREATE INDEX IF NOT EXISTS idx_collections_invite_token ON public.collections(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collections_likes ON public.collections(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_collections_saves ON public.collections(saves_count DESC);
CREATE INDEX IF NOT EXISTS idx_collections_created ON public.collections(created_at DESC);

COMMENT ON TABLE public.collections IS 'Коллекции (сборники) статей. Владелец и редакторы могут добавлять статьи.';

-- =============================================================================
-- 2. Участники коллекции (совместное редактирование)
-- =============================================================================
CREATE TYPE public.collection_member_role AS ENUM ('owner', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS public.collection_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.collection_member_role NOT NULL DEFAULT 'editor',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_members_collection ON public.collection_members(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_members_user ON public.collection_members(user_id);

COMMENT ON TABLE public.collection_members IS 'Участники коллекции: владелец, редакторы, зрители. Редакторы и владелец могут добавлять/удалять статьи.';

-- =============================================================================
-- 3. Статьи в коллекции (many-to-many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.collection_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(collection_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_articles_collection ON public.collection_articles(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_articles_article ON public.collection_articles(article_id);

COMMENT ON TABLE public.collection_articles IS 'Связь коллекций и статей. position — порядок отображения.';

-- =============================================================================
-- 4. Лайки коллекций
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.collection_likes (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_likes_user ON public.collection_likes(user_id);

-- =============================================================================
-- 5. Сохранения коллекций (закладки)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.collection_saves (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_saves_user ON public.collection_saves(user_id);

-- =============================================================================
-- 6. Триггер updated_at для collections
-- =============================================================================
CREATE OR REPLACE FUNCTION public.collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_collections_updated_at ON public.collections;
CREATE TRIGGER tr_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.collections_updated_at();

-- =============================================================================
-- 7. Триггеры для likes_count и saves_count
-- =============================================================================
CREATE OR REPLACE FUNCTION public.collection_likes_count_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections SET likes_count = likes_count + 1 WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_collection_likes_count ON public.collection_likes;
CREATE TRIGGER tr_collection_likes_count
  AFTER INSERT OR DELETE ON public.collection_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.collection_likes_count_sync();

CREATE OR REPLACE FUNCTION public.collection_saves_count_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections SET saves_count = saves_count + 1 WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_collection_saves_count ON public.collection_saves;
CREATE TRIGGER tr_collection_saves_count
  AFTER INSERT OR DELETE ON public.collection_saves
  FOR EACH ROW
  EXECUTE FUNCTION public.collection_saves_count_sync();

-- =============================================================================
-- 8. RLS
-- =============================================================================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_saves ENABLE ROW LEVEL SECURITY;

-- collections: чтение — все публичные; создание/изменение/удаление — владелец и редакторы
DROP POLICY IF EXISTS "collections_select_public" ON public.collections;
CREATE POLICY "collections_select_public"
  ON public.collections FOR SELECT
  USING (is_public = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.collection_members m WHERE m.collection_id = collections.id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "collections_insert_owner" ON public.collections;
CREATE POLICY "collections_insert_owner"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "collections_update_members" ON public.collections;
CREATE POLICY "collections_update_members"
  ON public.collections FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = collections.id AND m.user_id = auth.uid() AND m.role IN ('owner','editor'))
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "collections_delete_owner" ON public.collections;
CREATE POLICY "collections_delete_owner"
  ON public.collections FOR DELETE
  USING (owner_id = auth.uid());

-- collection_members
DROP POLICY IF EXISTS "collection_members_select" ON public.collection_members;
CREATE POLICY "collection_members_select"
  ON public.collection_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_members.collection_id AND (c.is_public OR c.owner_id = auth.uid()))
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "collection_members_insert" ON public.collection_members;
CREATE POLICY "collection_members_insert"
  ON public.collection_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = c.id AND m.user_id = auth.uid() AND m.role IN ('owner','editor'))))
  );

DROP POLICY IF EXISTS "collection_members_update" ON public.collection_members;
CREATE POLICY "collection_members_update"
  ON public.collection_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_members.collection_id AND c.owner_id = auth.uid()))
  WITH CHECK (true);

DROP POLICY IF EXISTS "collection_members_delete" ON public.collection_members;
CREATE POLICY "collection_members_delete"
  ON public.collection_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_members.collection_id AND c.owner_id = auth.uid())
  );

-- collection_articles
DROP POLICY IF EXISTS "collection_articles_select" ON public.collection_articles;
CREATE POLICY "collection_articles_select"
  ON public.collection_articles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_articles.collection_id AND (c.is_public OR c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = c.id AND m.user_id = auth.uid()))));

DROP POLICY IF EXISTS "collection_articles_insert" ON public.collection_articles;
CREATE POLICY "collection_articles_insert"
  ON public.collection_articles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = c.id AND m.user_id = auth.uid() AND m.role IN ('owner','editor'))))
  );

DROP POLICY IF EXISTS "collection_articles_update" ON public.collection_articles;
CREATE POLICY "collection_articles_update"
  ON public.collection_articles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = collection_articles.collection_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')))
  WITH CHECK (true);

DROP POLICY IF EXISTS "collection_articles_delete" ON public.collection_articles;
CREATE POLICY "collection_articles_delete"
  ON public.collection_articles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_articles.collection_id AND c.owner_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.collection_members m WHERE m.collection_id = collection_articles.collection_id AND m.user_id = auth.uid() AND m.role::text IN ('owner', 'editor'))
  );

-- collection_likes: все могут читать; ставить/снимать лайк — только свой
DROP POLICY IF EXISTS "collection_likes_select" ON public.collection_likes;
CREATE POLICY "collection_likes_select"
  ON public.collection_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "collection_likes_insert" ON public.collection_likes;
CREATE POLICY "collection_likes_insert"
  ON public.collection_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collection_likes_delete" ON public.collection_likes;
CREATE POLICY "collection_likes_delete"
  ON public.collection_likes FOR DELETE
  USING (auth.uid() = user_id);

-- collection_saves
DROP POLICY IF EXISTS "collection_saves_select" ON public.collection_saves;
CREATE POLICY "collection_saves_select"
  ON public.collection_saves FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "collection_saves_insert" ON public.collection_saves;
CREATE POLICY "collection_saves_insert"
  ON public.collection_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collection_saves_delete" ON public.collection_saves;
CREATE POLICY "collection_saves_delete"
  ON public.collection_saves FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 9. Функция: добавить владельца в collection_members при создании коллекции
-- =============================================================================
CREATE OR REPLACE FUNCTION public.collections_after_insert_add_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.collection_members (collection_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (collection_id, user_id) DO NOTHING;
  -- Генерируем invite_token для приглашения по ссылке
  IF NEW.invite_token IS NULL THEN
    UPDATE public.collections SET invite_token = replace(replace(replace(encode(gen_random_bytes(12), 'base64'), '+', '-'), '/', '_'), '=', '') WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_collections_after_insert_add_owner ON public.collections;
CREATE TRIGGER tr_collections_after_insert_add_owner
  AFTER INSERT ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.collections_after_insert_add_owner();

-- =============================================================================
-- 10. RPC: join по invite_token (добавляет текущего пользователя как editor)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.collection_join_by_token(p_token TEXT)
RETURNS TABLE (collection_id UUID, joined BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coll_id UUID;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT c.id INTO v_coll_id FROM public.collections c WHERE c.invite_token = p_token AND p_token IS NOT NULL AND length(trim(p_token)) > 0 LIMIT 1;
  IF v_coll_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, false;
    RETURN;
  END IF;
  INSERT INTO public.collection_members (collection_id, user_id, role)
  VALUES (v_coll_id, v_uid, 'editor')
  ON CONFLICT (collection_id, user_id) DO NOTHING;
  RETURN QUERY SELECT v_coll_id, true;
END;
$$;

COMMENT ON FUNCTION public.collection_join_by_token IS 'Присоединиться к коллекции по инвайт-токену (ссылка). Добавляет текущего пользователя как editor.';

-- =============================================================================
-- 11. RPC: toggle лайк коллекции
-- =============================================================================
CREATE OR REPLACE FUNCTION public.toggle_collection_like(p_collection_id UUID, p_user_id UUID)
RETURNS TABLE (is_liked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authenticated or user mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM public.collection_likes WHERE collection_id = p_collection_id AND user_id = p_user_id) THEN
    DELETE FROM public.collection_likes WHERE collection_id = p_collection_id AND user_id = p_user_id;
    RETURN QUERY SELECT false;
  ELSE
    INSERT INTO public.collection_likes (collection_id, user_id) VALUES (p_collection_id, p_user_id)
    ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT true;
  END IF;
END;
$$;

-- =============================================================================
-- 12. RPC: toggle сохранение коллекции
-- =============================================================================
CREATE OR REPLACE FUNCTION public.toggle_collection_save(p_collection_id UUID, p_user_id UUID)
RETURNS TABLE (is_saved BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authenticated or user mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM public.collection_saves WHERE collection_id = p_collection_id AND user_id = p_user_id) THEN
    DELETE FROM public.collection_saves WHERE collection_id = p_collection_id AND user_id = p_user_id;
    RETURN QUERY SELECT false;
  ELSE
    INSERT INTO public.collection_saves (collection_id, user_id) VALUES (p_collection_id, p_user_id)
    ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT true;
  END IF;
END;
$$;
