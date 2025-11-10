import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::article.article' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
  routes: [
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/articles/:id/react',
      handler: 'article.react',
      config: { auth: true },
    },
  ],
} as any);

