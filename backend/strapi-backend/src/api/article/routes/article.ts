import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::article.article' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
  routes: [
    {
      method: 'GET',
      path: '/articles/me/drafts',
      handler: 'article.userDrafts',
      config: { auth: true },
      type: 'content-api',
    },
    {
      method: 'GET',
      path: '/articles/me/drafts/:id',
      handler: 'article.draftById',
      config: { auth: true },
      type: 'content-api',
    },
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: { auth: false },
      type: 'content-api',
    },
    {
      method: 'POST',
      path: '/articles/:id/react',
      handler: 'article.react',
      config: { auth: true },
      type: 'content-api',
    },
  ],
} as any);

