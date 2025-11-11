import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::comment.comment' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
  routes: [
    {
      method: 'GET',
      path: '/articles/:documentId/comments',
      handler: 'comment.findForArticle',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/articles/:documentId/comments',
      handler: 'comment.createForArticle',
      config: {
        auth: true,
      },
    },
  ],
} as any);

