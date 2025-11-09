/**
 * Comment routes - standard CRUD operations
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/comments',
      handler: 'comment.find',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/comments/:id',
      handler: 'comment.findOne',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/comments',
      handler: 'comment.create',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/comments/:id',
      handler: 'comment.update',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'DELETE',
      path: '/comments/:id',
      handler: 'comment.delete',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};

