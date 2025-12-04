/**
 * User Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth } from '../../utils/auth';

export const Query = {
  me: async (_, __, context) => {
    requireAuth(context);
    return await context.prisma.user.findUniqueOrThrow({
      where: { id: context.user!.id },
    });
  },
  user: async (_, { id }, context) => {
    return await context.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  },
  users: async (_, { skip = 0, take = 10 }, context) => {
    return await context.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },
};

export const Mutation = {
  updateProfile: async (_, { input }, context) => {
    requireAuth(context);

    const updateData: any = {};
    if (input.username !== undefined) {
      if (input.username.length < 3 || input.username.length > 50) {
        throw new Error('Username must be between 3 and 50 characters');
      }
      updateData.username = input.username;
    }
    if (input.bio !== undefined) {
      if (input.bio && input.bio.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }
      updateData.bio = input.bio || null;
    }
    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar || null;
    }
    if (input.coverImage !== undefined) {
      updateData.coverImage = input.coverImage || null;
    }

    return await context.prisma.user.update({
      where: { id: context.user!.id },
      data: updateData,
    });
  },
};

export const User = {
  articles: async (parent, _, context) => {
    return await context.prisma.article.findMany({
      where: { authorId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
  comments: async (parent, _, context) => {
    return await context.prisma.comment.findMany({
      where: { authorId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
  articleReactions: async (parent, _, context) => {
    return await context.prisma.articleReaction.findMany({
      where: { userId: parent.id },
    });
  },
  commentReactions: async (parent, _, context) => {
    return await context.prisma.commentReaction.findMany({
      where: { userId: parent.id },
    });
  },
  bookmarks: async (parent, _, context) => {
    return await context.prisma.bookmark.findMany({
      where: { userId: parent.id },
      include: { article: true },
    });
  },
  following: async (parent, _, context) => {
    return await context.prisma.follow.findMany({
      where: { followerId: parent.id },
      include: { following: true },
    });
  },
  followers: async (parent, _, context) => {
    return await context.prisma.follow.findMany({
      where: { followingId: parent.id },
      include: { follower: true },
    });
  },
  notifications: async (parent, _, context) => {
    return await context.prisma.notification.findMany({
      where: { userId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};

