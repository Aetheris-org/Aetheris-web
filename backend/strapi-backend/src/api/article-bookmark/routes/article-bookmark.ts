/**
 * Article-bookmark routes - standard CRUD operations
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/article-bookmarks',
      handler: 'article-bookmark.find',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/article-bookmarks/:id',
      handler: 'article-bookmark.findOne',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/article-bookmarks',
      handler: 'article-bookmark.create',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/article-bookmarks/:id',
      handler: 'article-bookmark.update',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'DELETE',
      path: '/article-bookmarks/:id',
      handler: 'article-bookmark.delete',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};

