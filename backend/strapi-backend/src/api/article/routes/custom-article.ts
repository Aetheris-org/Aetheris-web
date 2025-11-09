/**
 * Article custom routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/articles/:id/react',
      handler: 'article.react',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/articles/:id/user-reaction',
      handler: 'article.getUserReaction',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      }
    }
  ]
};

