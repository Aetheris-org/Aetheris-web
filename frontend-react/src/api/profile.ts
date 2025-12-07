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
export async function getUserProfile(userId: number): Promise<UserProfile> {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser ? Number(currentUser.id) : undefined;

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', String(userId))
      .single();

    if (profileError || !profile) {
      logger.error('Error fetching user profile', profileError);
      throw new Error('User not found');
    }

    // Получаем статьи пользователя
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        *,
        author:users!articles_author_id_fkey (
          id,
          username,
          avatar,
          name
        ),
        comments:comments!comments_article_id_fkey (
          id
        )
      `)
      .eq('author_id', String(userId))
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
          title
        )
      `)
      .eq('author_id', String(userId))
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
          preview_image
        )
      `)
      .eq('user_id', String(userId))
      .order('created_at', { ascending: false })
      .limit(50);

    if (bookmarksError) {
      logger.error('Error fetching user bookmarks', bookmarksError);
    }

    // Получаем подписки
    const { error: followingError } = await supabase
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
      .eq('follower_id', String(userId));

    if (followingError) {
      logger.error('Error fetching following', followingError);
    }

    // Получаем подписчиков
    const { error: followersError } = await supabase
      .from('follows')
      .select(`
        id,
        follower:profiles!follows_follower_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .eq('following_id', String(userId));

    if (followersError) {
      logger.error('Error fetching followers', followersError);
    }

    // Трансформируем данные
    const publishedArticles = (articles || []).filter((a: any) => a.published_at !== null);
    const totalLikes = publishedArticles.reduce((sum: number, article: any) => sum + (article.likes_count || 0), 0);

    // Получаем все уникальные теги
    const allTags = publishedArticles.flatMap((a: any) => a.tags || []);
    const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag]) => tag);

    const transformedArticles: Article[] = (articles || []).map((article: any) => 
      transformArticle(article, currentUserId ? String(currentUserId) : undefined)
    );

    const userProfile: UserProfile = {
      user: {
        id: Number(profile.id) || userId,
        username: profile.username || '',
        bio: profile.bio || null,
        memberSince: profile.created_at || new Date().toISOString(),
        avatarUrl: profile.avatar || null,
        coverImageUrl: profile.cover_image || null,
      },
      stats: {
        publishedArticles: publishedArticles.length,
        totalLikes,
        totalComments: (comments || []).length,
      },
      highlights: {
        tags: topTags,
        recentArticleCount: publishedArticles.length,
      },
      articles: transformedArticles,
      comments: (comments || []).map((c: any) => ({
        id: String(c.id),
        text: c.text,
        createdAt: c.created_at,
        article: {
          id: String(c.article?.id || ''),
          title: c.article?.title || '',
        },
      })),
      bookmarks: (bookmarks || []).map((b: any) => ({
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
}): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updateData: any = {};
    if (input.username !== undefined) updateData.username = input.username;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;
    if (input.coverImage !== undefined) updateData.cover_image = input.coverImage;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      logger.error('Error updating profile', error);
      throw error;
    }

    // Получаем обновленный профиль
    return await getUserProfile(Number(user.id));
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
}): Promise<{ nickname: string; bio?: string; avatar?: string; coverImage?: string }> {
  const profile = await updateProfile(input);
  return {
    nickname: profile.user.username,
    bio: profile.user.bio || undefined,
    avatar: profile.user.avatarUrl || undefined,
    coverImage: profile.user.coverImageUrl || undefined,
  };
}

