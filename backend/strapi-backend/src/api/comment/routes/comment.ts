/**
 * Comment routes
 * RESTful API endpoints для работы с комментариями
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/:articleId/comments',
      handler: 'comment.find',
      config: {
        auth: false, // Публичный доступ для чтения комментариев
      },
    },
    {
      method: 'POST',
      path: '/articles/:articleId/comments',
      handler: 'comment.create',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'PUT',
      path: '/comments/:id',
      handler: 'comment.update',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'DELETE',
      path: '/comments/:id',
      handler: 'comment.delete',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'POST',
      path: '/comments/:id/react',
      handler: 'comment.react',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
  ],
};

