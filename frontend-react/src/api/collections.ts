/**
 * API коллекций статей
 * Коллекции — сборники статей. Поддержка: лайки, сохранения, совместное редактирование (инвайт по ссылке и по тегу), лидерборд.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { transformArticle } from './articles';
import type {
  Collection,
  CollectionMember,
  CollectionArticle,
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionQueryParams,
  CollectionsResponse,
  CollectionLeaderboardEntry,
} from '@/types/collection';

function validateUuid(id: string, name = 'id'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
    throw new Error(`Invalid UUID: ${name}`);
  }
  return id;
}

function transformCollection(row: any, _userId?: string | null): Collection {
  const owner = row.owner || row.owner_id;
  const o = typeof owner === 'object' && owner !== null ? owner : {};
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    title: row.title || '',
    description: row.description || null,
    coverImage: row.cover_image || null,
    isPublic: row.is_public !== false,
    inviteToken: row.invite_token || null,
    likesCount: row.likes_count ?? 0,
    savesCount: row.saves_count ?? 0,
    articlesCount: row.articles_count ?? row.articles?.length,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    isLiked: row.is_liked ?? false,
    isSaved: row.is_saved ?? false,
    owner: {
      id: o.id || row.owner_id,
      username: o.username || '',
      nickname: o.nickname,
      tag: o.tag,
      avatar: o.avatar || o.avatar_url,
    },
    canEdit: row.can_edit,
  };
}

// -----------------------------------------------------------------------------
// CRUD
// -----------------------------------------------------------------------------

export async function getCollections(params?: CollectionQueryParams): Promise<CollectionsResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;
    const page = params?.page ?? 1;
    const pageSize = Math.min(params?.pageSize ?? 12, 50);
    const sort = params?.sort ?? 'newest';
    const ownerId = params?.ownerId?.trim() || undefined;
    const search = params?.search?.trim();
    const from = (page - 1) * pageSize;

    let q = supabase
      .from('collections')
      .select(
        'id, owner_id, title, description, cover_image, is_public, invite_token, likes_count, saves_count, created_at, updated_at',
        { count: 'exact' }
      );

    if (ownerId) {
      q = q.eq('owner_id', ownerId);
      if (ownerId === userId) {
        // Свои коллекции: показываем и приватные
      } else {
        q = q.eq('is_public', true);
      }
    } else {
      q = q.eq('is_public', true);
    }
    if (search && search.length >= 2) {
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const order = sort === 'likes' ? 'likes_count' : sort === 'saves' ? 'saves_count' : 'created_at';
    q = q.order(order, { ascending: false });
    const { data: rows, count, error } = await q.range(from, from + pageSize - 1);

    if (error) {
      logger.error('[getCollections]', error);
      throw error;
    }

    const ids = (rows || []).map((r: any) => r.id);
    let isLikedMap: Record<string, boolean> = {};
    let isSavedMap: Record<string, boolean> = {};
    let articlesCountMap: Record<string, number> = {};

    if (userId && ids.length > 0) {
      const [likesRes, savesRes, countRes] = await Promise.all([
        supabase.from('collection_likes').select('collection_id').eq('user_id', userId).in('collection_id', ids),
        supabase.from('collection_saves').select('collection_id').eq('user_id', userId).in('collection_id', ids),
        supabase.from('collection_articles').select('collection_id').in('collection_id', ids),
      ]);
      (likesRes.data || []).forEach((r: any) => { isLikedMap[r.collection_id] = true; });
      (savesRes.data || []).forEach((r: any) => { isSavedMap[r.collection_id] = true; });
      (countRes.data || []).forEach((r: any) => {
        articlesCountMap[r.collection_id] = (articlesCountMap[r.collection_id] || 0) + 1;
      });
    }

    const ownerIds = [...new Set((rows || []).map((r: any) => r.owner_id))];
    let ownerMap: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, username, nickname, tag, avatar').in('id', ownerIds);
      ownerMap = (profs || []).reduce((a: Record<string, any>, p: any) => { a[p.id] = p; return a; }, {});
    }

    const data: Collection[] = (rows || []).map((r: any) => {
      const c = transformCollection(
        {
          ...r,
          owner: ownerMap[r.owner_id],
          is_liked: isLikedMap[r.id],
          is_saved: isSavedMap[r.id],
          articles_count: articlesCountMap[r.id],
        },
        userId
      );
      return c;
    });

    return { data, total: count ?? 0 };
  } catch (e: any) {
    logger.error('[getCollections]', e);
    throw e;
  }
}

export async function getCollection(id: string, options?: { withArticles?: boolean; withMembers?: boolean }): Promise<Collection> {
  const cid = validateUuid(id, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const { data: row, error } = await supabase
    .from('collections')
    .select('id, owner_id, title, description, cover_image, is_public, invite_token, likes_count, saves_count, created_at, updated_at')
    .eq('id', cid)
    .single();

  if (error || !row) {
    logger.error('[getCollection]', error);
    throw new Error('Collection not found');
  }

  const [isLiked, isSaved, canEdit, ownerProf, members, articles] = await Promise.all([
    userId ? supabase.from('collection_likes').select('collection_id').eq('collection_id', cid).eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null }),
    userId ? supabase.from('collection_saves').select('collection_id').eq('collection_id', cid).eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null }),
    userId
      ? (async () => {
          if (row.owner_id === userId) return true;
          const { data: m } = await supabase.from('collection_members').select('role').eq('collection_id', cid).eq('user_id', userId).maybeSingle();
          return m && (m.role === 'owner' || m.role === 'editor');
        })()
      : Promise.resolve(false),
    supabase.from('profiles').select('id, username, nickname, tag, avatar').eq('id', row.owner_id).maybeSingle(),
    options?.withMembers
      ? supabase
          .from('collection_members')
          .select('id, collection_id, user_id, role, invited_by, joined_at')
          .eq('collection_id', cid)
          .order('joined_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    options?.withArticles
      ? supabase
          .from('collection_articles')
          .select(`
            id, collection_id, article_id, position, added_at, added_by,
            article:articles(id, title, excerpt, preview_image, author_id, tags, difficulty, likes_count, dislikes_count, views, published_at, created_at, category)
          `)
          .eq('collection_id', cid)
          .order('position', { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const owner = ownerProf?.data;
  const memData = members?.data || [];
  let profMap: Record<string, any> = {};
  if (memData.length > 0) {
    const uids = [...new Set(memData.map((m: any) => m.user_id))];
    const { data: profs } = await supabase.from('profiles').select('id, username, nickname, tag, avatar').in('id', uids);
    profMap = (profs || []).reduce((a: Record<string, any>, p: any) => { a[p.id] = p; return a; }, {});
  }
  const membersList: CollectionMember[] = memData.map((m: any) => ({
    id: String(m.id),
    collectionId: String(m.collection_id),
    userId: String(m.user_id),
    role: m.role,
    invitedBy: m.invited_by || null,
    joinedAt: m.joined_at,
    user: profMap[m.user_id] ? { id: profMap[m.user_id].id, username: profMap[m.user_id].username, nickname: profMap[m.user_id].nickname, tag: profMap[m.user_id].tag, avatar: profMap[m.user_id].avatar } : undefined,
  }));

  const articlesList: CollectionArticle[] = (articles?.data || [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((a: any) => ({
      id: String(a.id),
      collectionId: String(a.collection_id),
      articleId: String(a.article_id),
      position: a.position ?? 0,
      addedAt: a.added_at,
      addedBy: a.added_by || null,
      article: a.article ? transformArticle(a.article, userId ?? undefined) : undefined,
    }));

  return transformCollection(
    {
      ...row,
      owner,
      is_liked: !!isLiked?.data,
      is_saved: !!isSaved?.data,
      can_edit: canEdit,
      members: membersList,
      articles: articlesList,
      articles_count: articlesList.length,
    },
    userId
  );
}

export async function createCollection(input: CreateCollectionInput): Promise<Collection> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (!input.title || input.title.length < 2 || input.title.length > 200) {
    throw new Error('Title must be 2–200 characters');
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      owner_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      cover_image: input.coverImage || null,
      is_public: input.isPublic !== false,
    })
    .select('id')
    .single();

  if (error) {
    logger.error('[createCollection]', error);
    throw error;
  }
  return getCollection(data.id, { withMembers: true });
}

export async function updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
  const cid = validateUuid(id, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const upd: Record<string, unknown> = {};
  if (input.title !== undefined) {
    if (input.title.length < 2 || input.title.length > 200) throw new Error('Title must be 2–200 characters');
    upd.title = input.title.trim();
  }
  if (input.description !== undefined) upd.description = input.description?.trim() || null;
  if (input.coverImage !== undefined) upd.cover_image = input.coverImage || null;
  if (input.isPublic !== undefined) upd.is_public = input.isPublic;

  if (Object.keys(upd).length === 0) return getCollection(id);

  const { error } = await supabase.from('collections').update(upd).eq('id', cid);
  if (error) {
    logger.error('[updateCollection]', error);
    throw error;
  }
  return getCollection(id);
}

export async function deleteCollection(id: string): Promise<void> {
  const cid = validateUuid(id, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: c } = await supabase.from('collections').select('owner_id').eq('id', cid).single();
  if (!c || c.owner_id !== user.id) throw new Error('Only the owner can delete the collection');

  const { error } = await supabase.from('collections').delete().eq('id', cid);
  if (error) {
    logger.error('[deleteCollection]', error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Статьи в коллекции
// -----------------------------------------------------------------------------

export async function addArticleToCollection(collectionId: string, articleId: string): Promise<CollectionArticle> {
  const cid = validateUuid(collectionId, 'collection id');
  const aid = validateUuid(articleId, 'article id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: max } = await supabase
    .from('collection_articles')
    .select('position')
    .eq('collection_id', cid)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = ((max?.position ?? 0) as number) + 1;

  const { data, error } = await supabase
    .from('collection_articles')
    .insert({ collection_id: cid, article_id: aid, position: nextPos, added_by: user.id })
    .select(`
      id, collection_id, article_id, position, added_at, added_by,
      article:articles(id, title, excerpt, preview_image, author_id, tags, difficulty, likes_count, dislikes_count, views, published_at, created_at, category, content)
    `)
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Article is already in the collection');
    logger.error('[addArticleToCollection]', error);
    throw error;
  }
  return {
    id: String(data.id),
    collectionId: String(data.collection_id),
    articleId: String(data.article_id),
    position: data.position ?? 0,
    addedAt: data.added_at,
    addedBy: data.added_by || null,
    article: data.article ? transformArticle(data.article, user.id) : undefined,
  };
}

export async function removeArticleFromCollection(collectionId: string, articleId: string): Promise<void> {
  const cid = validateUuid(collectionId, 'collection id');
  const aid = validateUuid(articleId, 'article id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('collection_articles')
    .delete()
    .eq('collection_id', cid)
    .eq('article_id', aid);
  if (error) {
    logger.error('[removeArticleFromCollection]', error);
    throw error;
  }
}

export async function reorderCollectionArticles(collectionId: string, articleIds: string[]): Promise<void> {
  const cid = validateUuid(collectionId, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  for (let i = 0; i < articleIds.length; i++) {
    await supabase
      .from('collection_articles')
      .update({ position: i })
      .eq('collection_id', cid)
      .eq('article_id', articleIds[i]);
  }
}

// -----------------------------------------------------------------------------
// Участники: добавление по user id (в т.ч. по тегу — id приходит из searchProfilesByTag)
// -----------------------------------------------------------------------------

export async function addMemberToCollection(collectionId: string, userId: string, role: 'editor' | 'viewer' = 'editor'): Promise<CollectionMember> {
  const cid = validateUuid(collectionId, 'collection id');
  const uid = validateUuid(userId, 'user id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('collection_members')
    .insert({ collection_id: cid, user_id: uid, role, invited_by: user.id })
    .select('id, collection_id, user_id, role, invited_by, joined_at')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('User is already a member');
    logger.error('[addMemberToCollection]', error);
    throw error;
  }
  let userProfile: any;
  const { data: prof } = await supabase.from('profiles').select('id, username, nickname, tag, avatar').eq('id', uid).maybeSingle();
  userProfile = prof;
  return {
    id: String(data.id),
    collectionId: String(data.collection_id),
    userId: String(data.user_id),
    role: data.role,
    invitedBy: data.invited_by || null,
    joinedAt: data.joined_at,
    user: userProfile ? { id: userProfile.id, username: userProfile.username, nickname: userProfile.nickname, tag: userProfile.tag, avatar: userProfile.avatar } : undefined,
  };
}

export async function removeMemberFromCollection(collectionId: string, userId: string): Promise<void> {
  const cid = validateUuid(collectionId, 'collection id');
  const uid = validateUuid(userId, 'user id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: col } = await supabase.from('collections').select('owner_id').eq('id', cid).single();
  if (!col) throw new Error('Collection not found');
  if (col.owner_id !== user.id && uid !== user.id) {
    throw new Error('Only the owner can remove other members; you can leave yourself');
  }
  if (col.owner_id === uid) throw new Error('Owner cannot be removed');

  const { error } = await supabase.from('collection_members').delete().eq('collection_id', cid).eq('user_id', uid);
  if (error) {
    logger.error('[removeMemberFromCollection]', error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Присоединение по инвайт-токену (ссылка)
// -----------------------------------------------------------------------------

export async function joinCollectionByInviteToken(token: string): Promise<{ collectionId: string; joined: boolean }> {
  const t = (token || '').trim();
  if (!t) throw new Error('Invalid invite token');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('collection_join_by_token', { p_token: t });
  if (error) {
    logger.error('[joinCollectionByInviteToken]', error);
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    collectionId: row?.collection_id ? String(row.collection_id) : '',
    joined: !!row?.joined,
  };
}

export async function getCollectionInviteLink(collectionId: string): Promise<string> {
  const c = await getCollection(collectionId);
  if (!c.inviteToken) throw new Error('Invite token not available');
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/collections/join/${encodeURIComponent(c.inviteToken)}`;
}

// -----------------------------------------------------------------------------
// Лайки и сохранения
// -----------------------------------------------------------------------------

export async function toggleCollectionLike(collectionId: string): Promise<{ isLiked: boolean }> {
  const cid = validateUuid(collectionId, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('toggle_collection_like', { p_collection_id: cid, p_user_id: user.id });
  if (error) {
    logger.error('[toggleCollectionLike]', error);
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { isLiked: !!row?.is_liked };
}

export async function toggleCollectionSave(collectionId: string): Promise<{ isSaved: boolean }> {
  const cid = validateUuid(collectionId, 'collection id');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('toggle_collection_save', { p_collection_id: cid, p_user_id: user.id });
  if (error) {
    logger.error('[toggleCollectionSave]', error);
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { isSaved: !!row?.is_saved };
}

export async function isCollectionLiked(collectionId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('collection_likes')
    .select('collection_id')
    .eq('collection_id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle();
  return !!data;
}

export async function isCollectionSaved(collectionId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('collection_saves')
    .select('collection_id')
    .eq('collection_id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle();
  return !!data;
}

// -----------------------------------------------------------------------------
// Сохранённые коллекции пользователя
// -----------------------------------------------------------------------------

export async function getSavedCollections(page = 1, pageSize = 20): Promise<CollectionsResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], total: 0 };

  const from = (page - 1) * pageSize;
  const { data: saves, error: e1 } = await supabase
    .from('collection_saves')
    .select('collection_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (e1 || !saves?.length) return { data: [], total: 0 };

  const ids = saves.map((s: any) => s.collection_id);
  const { data: rows, error } = await supabase
    .from('collections')
    .select('id, owner_id, title, description, cover_image, is_public, invite_token, likes_count, saves_count, created_at, updated_at')
    .in('id', ids);

  if (error || !rows?.length) return { data: [], total: 0 };

  const order = ids.reduce((acc: Record<string, number>, id, i) => { acc[id] = i; return acc; }, {});
  rows.sort((a: any, b: any) => (order[a.id] ?? 999) - (order[b.id] ?? 999));

  const ownerIds = [...new Set(rows.map((r: any) => r.owner_id))];
  let ownerMap: Record<string, any> = {};
  if (ownerIds.length > 0) {
    const { data: profs } = await supabase.from('profiles').select('id, username, nickname, tag, avatar').in('id', ownerIds);
    ownerMap = (profs || []).reduce((a: Record<string, any>, p: any) => { a[p.id] = p; return a; }, {});
  }

  const { count } = await supabase.from('collection_saves').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const data = rows.map((r: any) => transformCollection({ ...r, owner: ownerMap[r.owner_id], is_saved: true }, user.id));
  return { data, total: count ?? 0 };
}

// -----------------------------------------------------------------------------
// Лидерборд коллекций (по лайкам или сохранениям)
// -----------------------------------------------------------------------------

export type CollectionLeaderboardSort = 'likes' | 'saves';

export async function getCollectionLeaderboard(
  sort: CollectionLeaderboardSort = 'likes',
  limit = 20,
  period?: 'all-time' | 'monthly' | 'weekly'
): Promise<CollectionLeaderboardEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const orderCol = sort === 'saves' ? 'saves_count' : 'likes_count';
  let q = supabase
    .from('collections')
    .select('id, owner_id, title, description, cover_image, is_public, invite_token, likes_count, saves_count, created_at, updated_at')
    .eq('is_public', true)
    .order(orderCol, { ascending: false })
    .limit(limit);

  if (period && period !== 'all-time') {
    const since = period === 'weekly' ? 7 : 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - since);
    q = q.gte('created_at', sinceDate.toISOString());
  }

  const { data: rows, error } = await q;
  if (error) {
    logger.error('[getCollectionLeaderboard]', error);
    throw error;
  }

  const ownerIds = [...new Set((rows || []).map((r: any) => r.owner_id))];
  let ownerMap: Record<string, any> = {};
  if (ownerIds.length > 0) {
    const { data: profs } = await supabase.from('profiles').select('id, username, nickname, tag, avatar').in('id', ownerIds);
    ownerMap = (profs || []).reduce((a: Record<string, any>, p: any) => { a[p.id] = p; return a; }, {});
  }

  const result: CollectionLeaderboardEntry[] = (rows || []).map((r: any, i: number) => ({
    rank: i + 1,
    collection: transformCollection({ ...r, owner: ownerMap[r.owner_id] }, userId),
    likesCount: r.likes_count ?? 0,
    savesCount: r.saves_count ?? 0,
  }));
  return result;
}
