/**
 * Comment custom routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/comments/:id/react',
      handler: 'comment.react',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};

