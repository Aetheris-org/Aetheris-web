/**
 * GraphQL Resolvers
 * Все resolvers для GraphQL API
 */
import { GraphQLContext } from '../context';
import * as userResolvers from './user';
import * as articleResolvers from './article';
import * as commentResolvers from './comment';
import * as reactionResolvers from './reaction';
import * as bookmarkResolvers from './bookmark';
import * as followResolvers from './follow';
import * as notificationResolvers from './notification';

// Объединяем все resolvers
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...articleResolvers.Query,
    ...commentResolvers.Query,
    ...bookmarkResolvers.Query,
    ...followResolvers.Query,
    ...notificationResolvers.Query,
  },
  Mutation: {
    ...articleResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...reactionResolvers.Mutation,
    ...bookmarkResolvers.Mutation,
    ...followResolvers.Mutation,
    ...userResolvers.Mutation,
    ...notificationResolvers.Mutation,
  },
  User: userResolvers.User,
  Article: articleResolvers.Article,
  Comment: commentResolvers.Comment,
  Notification: notificationResolvers.Notification,
};

