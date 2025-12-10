/**
 * Profile API using Supabase REST API
 * Замена для profile-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { UserProfile } from '@/types/profile';
import type { Article } from '@/types/article';
import { transformArticle } from './articles';

/**
 * Получить профиль пользователя
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser ? currentUser.id : undefined;

    const profileUuid = userId;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, role, bio, tag, avatar, cover_image, created_at, followers_count, avatar_url, cover_url')
      .eq('id', profileUuid)
      .single();

    if (profileError || !profile) {
      logger.error('Error fetching user profile', profileError);
      throw new Error('User not found');
    }

    // Всегда явно подтягиваем role, чтобы не потерять колонку из-за кеша/различий типов
    const { data: roleRow } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', profileUuid)
      .single()
    if (roleRow?.role) {
      (profile as any).role = roleRow.role
    }

    // Если username пуст, поднимаем его отдельным запросом по id
    if (!profile.username) {
      const { data: usernameRow } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', profileUuid)
        .single();
      if (usernameRow?.username) {
        (profile as any).username = usernameRow.username;
      }
    }

    // Получаем статьи пользователя
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar
        ),
        comments:comments!comments_article_id_fkey (
          id
        )
      `)
      .eq('author_id', profileUuid)
      .order('created_at', { ascending: false });

    if (articlesError) {
      logger.error('Error fetching user articles', articlesError);
    }

    // Получаем комментарии пользователя
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        text,
        created_at,
        article:articles!comments_article_id_fkey (
          id,
          title,
          status,
          deleted_at,
          is_deleted
        )
      `)
      .eq('author_id', profileUuid)
      .order('created_at', { ascending: false })
      .limit(50);

    if (commentsError) {
      logger.error('Error fetching user comments', commentsError);
    }

    // Получаем закладки пользователя
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        article:articles!bookmarks_article_id_fkey (
          id,
          title,
          excerpt,
          preview_image,
          status,
          deleted_at,
          is_deleted
        )
      `)
      .eq('user_id', profileUuid)
      .order('created_at', { ascending: false })
      .limit(50);

    if (bookmarksError) {
      logger.error('Error fetching user bookmarks', bookmarksError);
    }

    // Получаем подписки
    const { data: followingData, error: followingError } = await supabase
      .from('follows')
      .select(`
        id,
        following:profiles!follows_following_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .eq('follower_id', profileUuid);

    if (followingError) {
      logger.error('Error fetching following', followingError);
    }

    const isSoftDeleted = (item: any) => {
      const status = (item?.status || item?.article_status || '').toString().toLowerCase()
      const deletedAt = item?.deleted_at || item?.deletedAt
      const isDeletedFlag = item?.is_deleted === true || item?.isDeleted === true
      return Boolean(deletedAt) || isDeletedFlag || status === 'deleted'
    }

    const isValidArticle = (item: any) => item && item.id

    // Фильтруем удаленные статьи (soft delete / статус deleted)
    const filteredArticlesRaw = (articles || []).filter((a: any) => !isSoftDeleted(a))

    // Видимые статьи (все не удалённые, независимо от published_at)
    const visibleArticles = filteredArticlesRaw;
    const totalLikes = visibleArticles.reduce((sum: number, article: any) => sum + (article.likes_count || 0), 0);

    // Получаем все уникальные теги
    const allTags = visibleArticles.flatMap((a: any) => a.tags || []);
    const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag]) => tag);

    const transformedArticles: Article[] = visibleArticles.map((article: any) => 
      transformArticle(article, currentUserId ? String(currentUserId) : undefined)
    );

    const uuidToNumber = (uuid: string): number => {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const normalizeStr = (value: any) => (typeof value === 'string' && value.trim().length > 0 ? value.trim() : null)

    const normalizedTag = typeof profile.tag === 'string' ? profile.tag : null

    const normalizedAvatar =
      normalizeStr(profile.avatar) ||
      normalizeStr(profile.avatar_url) ||
      normalizeStr((profile as any).avatarUrl) ||
      normalizeStr((profile as any).avatar_url) ||
      normalizeStr((profile as any).avatar) ||
      normalizeStr((profile as any).photo_url) ||
      null

    const normalizedCover =
      normalizeStr(profile.cover_image) ||
      normalizeStr(profile.cover_url) ||
      normalizeStr((profile as any).coverImageUrl) ||
      normalizeStr((profile as any).coverImage) ||
      normalizeStr((profile as any).cover_image) ||
      normalizeStr((profile as any).coverUrl) ||
      normalizeStr((profile as any).cover) ||
      normalizeStr((profile as any).banner_url) ||
      null

    const userProfile: UserProfile = {
      user: {
        id: profile.id ? uuidToNumber(profile.id) : 0,
        uuid: profile.id,
        username: profile.username || '',
        role: (profile as any).role || undefined,
        tag: normalizedTag ?? undefined,
        bio: profile.bio || null,
        memberSince: profile.created_at || new Date().toISOString(),
        avatarUrl: normalizedAvatar ?? undefined,
        coverImageUrl: normalizedCover ?? undefined,
      },
      stats: {
        publishedArticles: visibleArticles.length,
        totalLikes,
        totalComments: (comments || []).filter((c: any) => isValidArticle(c.article) && !isSoftDeleted(c.article)).length,
        followers: typeof profile.followers_count === 'number' ? profile.followers_count : 0,
        following: (followingData || []).length,
      },
      highlights: {
        tags: topTags,
        recentArticleCount: visibleArticles.length,
      },
      articles: transformedArticles,
      comments: (comments || [])
        .filter((c: any) => isValidArticle(c.article) && !isSoftDeleted(c.article))
        .map((c: any) => ({
          id: String(c.id),
          text: c.text,
          createdAt: c.created_at,
          article: {
            id: String(c.article?.id || ''),
            title: c.article?.title || '',
          },
        })),
      bookmarks: (bookmarks || [])
        .filter((b: any) => isValidArticle(b.article) && !isSoftDeleted(b.article))
        .map((b: any) => ({
          id: String(b.id),
          createdAt: b.created_at,
          article: {
            id: String(b.article?.id || ''),
            title: b.article?.title || '',
            excerpt: b.article?.excerpt || null,
            previewImage: b.article?.preview_image || null,
          },
        })),
    };

    return userProfile;
  } catch (error: any) {
    logger.error('Error in getUserProfile', error);
    throw error;
  }
}

/**
 * Обновить профиль пользователя
 * Возвращает обновленный UserProfile
 */
export async function updateProfile(input: {
  username?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  tag?: string;
}): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updateData: any = {};
    if (input.username !== undefined) updateData.username = input.username;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar;
      updateData.avatar_url = input.avatar; // дублируем в snake_case колонку
    }
    if (input.coverImage !== undefined) {
      updateData.cover_image = input.coverImage;
      updateData.cover_url = input.coverImage; // дублируем в snake_case колонку
    }
    if (input.tag !== undefined) {
      const trimmedTag = input.tag.trim();
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(trimmedTag)) {
        throw new Error('Tag must be 3-24 chars: letters, numbers, underscore');
      }
      // Проверка уникальности
      const { data: existingTag, error: tagError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tag', trimmedTag)
        .neq('id', user.id)
        .maybeSingle();

      if (tagError) {
        logger.error('Error checking tag uniqueness', tagError);
        throw tagError;
      }
      if (existingTag) {
        throw new Error('Tag is already taken');
      }

      updateData.tag = trimmedTag;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      logger.error('Error updating profile', error);
      throw error;
    }

    // Получаем обновленный профиль
    return await getUserProfile(user.id);
  } catch (error: any) {
    logger.error('Error in updateProfile', error);
    throw error;
  }
}

/**
 * Обновить профиль пользователя (возвращает User для обратной совместимости)
 */
export async function updateUserProfile(input: {
  username?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  tag?: string;
}): Promise<{ nickname: string; bio?: string; avatar?: string; coverImage?: string; tag?: string }> {
  const profile = await updateProfile(input);
  return {
    nickname: profile.user.username,
    bio: profile.user.bio || undefined,
    avatar: profile.user.avatarUrl || undefined,
    coverImage: profile.user.coverImageUrl || undefined,
    tag: profile.user.tag || undefined,
  };
}

