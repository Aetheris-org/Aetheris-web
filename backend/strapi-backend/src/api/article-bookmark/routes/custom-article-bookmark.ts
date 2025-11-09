/**
 * Article Bookmark custom routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/articles/:articleId/bookmark',
      handler: 'article-bookmark.toggle',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/articles/:articleId/bookmark',
      handler: 'article-bookmark.check',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/bookmarks',
      handler: 'article-bookmark.getBookmarkedArticles',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};

