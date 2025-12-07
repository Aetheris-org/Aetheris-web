/**
 * Follow API using Supabase REST API
 * Замена для follow-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Подписаться на пользователя
 */
export async function followUser(followingId: string): Promise<{ id: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Используем Database Function с UUID
    const { data, error } = await supabase.rpc('toggle_follow', {
      p_following_id: followingId,
      p_follower_id: user.id,
    });

    if (error) {
      logger.error('Error following user', error);
      throw error;
    }

    if (!data?.[0]?.is_following) {
      throw new Error('Failed to follow user');
    }

    return {
      id: data[0].follow_id || '',
    };
  } catch (error: any) {
    logger.error('Error in followUser', error);
    throw error;
  }
}

/**
 * Отписаться от пользователя
 */
export async function unfollowUser(followingId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Используем Database Function с UUID
    const { data, error } = await supabase.rpc('toggle_follow', {
      p_following_id: followingId,
      p_follower_id: user.id,
    });

    if (error) {
      logger.error('Error unfollowing user', error);
      throw error;
    }

    if (data?.[0]?.is_following) {
      throw new Error('Failed to unfollow user');
    }
  } catch (error: any) {
    logger.error('Error in unfollowUser', error);
    throw error;
  }
}

/**
 * Проверить, подписан ли текущий пользователь на другого пользователя
 */
export async function checkFollowStatus(
  followingId: string,
  currentUserId: string
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', followingId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking follow status', error);
      return null;
    }

    return data ? { id: data.id } : null;
  } catch (error: any) {
    logger.error('Error in checkFollowStatus', error);
    return null;
  }
}

/**
 * Получить список подписок пользователя
 */
export async function getFollowing(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
      .eq('follower_id', userId);

    if (error) {
      logger.error('Error fetching following', error);
      throw error;
    }

    return (data || []).map((follow: any) => follow.following);
  } catch (error: any) {
    logger.error('Error in getFollowing', error);
    throw error;
  }
}

/**
 * Получить список подписчиков пользователя
 */
export async function getFollowers(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
      .eq('following_id', userId);

    if (error) {
      logger.error('Error fetching followers', error);
      throw error;
    }

    return (data || []).map((follow: any) => follow.follower);
  } catch (error: any) {
    logger.error('Error in getFollowers', error);
    throw error;
  }
}

