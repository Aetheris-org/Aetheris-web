/**
 * Follow Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth } from '../../utils/auth';
import { createNotification } from '../../services/notification';

export const Query = {
  following: async (_, { userId }, context) => {
    const follows = await context.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });

    return follows.map((follow) => follow.following);
  },
  followers: async (_, { userId }, context) => {
    const follows = await context.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });

    return follows.map((follow) => follow.follower);
  },
};

export const Mutation = {
  followUser: async (_, { userId }, context) => {
    requireAuth(context);

    if (userId === context.user!.id) {
      throw new Error('You cannot follow yourself');
    }

    // Проверяем существование пользователя
    await context.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Проверяем, не подписан ли уже
    const existing = await context.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: context.user!.id,
          followingId: userId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const follow = await context.prisma.follow.create({
      data: {
        followerId: context.user!.id,
        followingId: userId,
      },
      include: {
        follower: true,
        following: true,
      },
    });

    // Создаем уведомление
    try {
      await createNotification(context, {
        type: 'follow',
        userId,
        actorId: context.user!.id,
      });
    } catch (error: any) {
      context.logger.error('Failed to create notification for follow', {
        error: error.message,
        followId: follow.id,
      });
    }

    return follow;
  },
  unfollowUser: async (_, { userId }, context) => {
    requireAuth(context);

    const follow = await context.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: context.user!.id,
          followingId: userId,
        },
      },
    });

    if (follow) {
      await context.prisma.follow.delete({
        where: { id: follow.id },
      });
    }

    return true;
  },
};

