/**
 * Follow API using Supabase REST API
 * Замена для follow-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Валидация UUID
 */
function validateUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || (typeof id !== 'string') || !uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  return id;
}

/**
 * Подписаться на пользователя
 */
export async function followUser(followingId: string): Promise<{ id: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Используем Database Function с UUID (параметры в правильном порядке)
    const { data, error } = await supabase.rpc('toggle_follow', {
      p_follower_id: user.id,
      p_following_id: followingId,
    });

    logger.debug('toggle_follow response:', { data, error, dataType: typeof data, isArray: Array.isArray(data) });

    if (error) {
      logger.error('Error following user', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from toggle_follow function');
    }

    // Проверяем формат ответа - может прийти как объект или как массив
    let responseData = data;
    if (Array.isArray(data) && data.length > 0) {
      responseData = data[0];
    }

    logger.debug('Parsed response data:', responseData);

    // toggle_follow возвращает { is_following: boolean, id: uuid|null }
    if (responseData?.is_following !== true) {
      throw new Error(`Failed to follow user - operation returned is_following: ${responseData?.is_following}`);
    }

    if (!responseData?.id) {
      throw new Error('Failed to create follow record - no ID returned');
    }

    return {
      id: responseData.id,
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

    // Валидируем UUID
    const validatedFollowingId = validateUuid(followingId);

    // Используем Database Function с UUID (параметры в правильном порядке)
    const { data, error } = await supabase.rpc('toggle_follow', {
      p_follower_id: user.id,
      p_following_id: validatedFollowingId,
    });

    logger.debug('toggle_follow unfollow response:', { data, error, dataType: typeof data, isArray: Array.isArray(data) });

    if (error) {
      logger.error('Error unfollowing user', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from toggle_follow function');
    }

    // Проверяем формат ответа - может прийти как объект или как массив
    let responseData = data;
    if (Array.isArray(data) && data.length > 0) {
      responseData = data[0];
    }

    logger.debug('Parsed unfollow response data:', responseData);

    // toggle_follow возвращает { is_following: boolean, id: uuid|null }
    // Для unfollow ожидаем is_following = false
    if (responseData?.is_following !== false) {
      throw new Error(`Failed to unfollow user - operation returned is_following: ${responseData?.is_following}`);
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
    // Валидируем UUID
    const validatedFollowingId = validateUuid(followingId);
    const validatedCurrentUserId = validateUuid(currentUserId);
    
    // Не позволяем пользователю подписаться сам на себя
    if (validatedFollowingId === validatedCurrentUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', validatedCurrentUserId)
      .eq('following_id', validatedFollowingId)
      .limit(1)
      .maybeSingle();

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
    const validatedUserId = validateUuid(userId);
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        following:profiles!follows_following_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .eq('follower_id', validatedUserId);

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
    const validatedUserId = validateUuid(userId);
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        follower:profiles!follows_follower_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .eq('following_id', validatedUserId);

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

