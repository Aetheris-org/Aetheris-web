/**
 * GraphQL API для работы с подписками
 */
import { query, mutate } from '@/lib/graphql'
import { logger } from '@/lib/logger'

/**
 * Подписаться на пользователя
 */
export async function followUser(followingId: number): Promise<{ id: string }> {
  const followMutation = `
    mutation FollowUser($followingId: ID!) {
      createFollow(data: {
        following: { connect: { id: $followingId } }
      }) {
        id
      }
    }
  `

  try {
    const response = await mutate<{ createFollow: { id: string } }>(followMutation, {
      followingId: String(followingId),
    })

    logger.debug('[followUser] Follow created:', response.createFollow)
    return response.createFollow
  } catch (error: any) {
    logger.error('[followUser] Failed to follow user:', error)
    throw error
  }
}

/**
 * Отписаться от пользователя
 */
export async function unfollowUser(followId: string): Promise<void> {
  const unfollowMutation = `
    mutation UnfollowUser($id: ID!) {
      deleteFollow(where: { id: $id }) {
        id
      }
    }
  `

  try {
    await mutate<{ deleteFollow: { id: string } }>(unfollowMutation, {
      id: followId,
    })

    logger.debug('[unfollowUser] Follow deleted:', followId)
  } catch (error: any) {
    logger.error('[unfollowUser] Failed to unfollow user:', error)
    throw error
  }
}

/**
 * Проверить, подписан ли текущий пользователь на другого пользователя
 */
export async function checkFollowStatus(followingId: number, currentUserId: number): Promise<{ id: string } | null> {
  const checkQuery = `
    query CheckFollowStatus($followerId: ID!, $followingId: ID!) {
      follows(
        where: {
          follower: { id: { equals: $followerId } }
          following: { id: { equals: $followingId } }
        }
        take: 1
      ) {
        id
      }
    }
  `

  try {
    const response = await query<{ follows: Array<{ id: string }> }>(checkQuery, {
      followerId: String(currentUserId),
      followingId: String(followingId),
    })

    return response.follows.length > 0 ? response.follows[0] : null
  } catch (error: any) {
    logger.error('[checkFollowStatus] Failed to check follow status:', error)
    throw error
  }
}

