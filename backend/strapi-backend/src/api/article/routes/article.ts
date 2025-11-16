/**
 * Article routes
 * RESTful API endpoints для работы со статьями
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: false, // Публичный доступ для чтения опубликованных статей
      },
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
      config: {
        auth: false, // Публичный доступ для чтения опубликованных статей
      },
    },
    {
      method: 'POST',
      path: '/articles',
      handler: 'article.create',
      config: {
        auth: {
          scope: [], // Требует аутентификации, но без дополнительных прав
        },
      },
    },
    {
      method: 'PUT',
      path: '/articles/:id',
      handler: 'article.update',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'DELETE',
      path: '/articles/:id',
      handler: 'article.delete',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'GET',
      path: '/articles/me/drafts',
      handler: 'article.findDrafts',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'GET',
      path: '/articles/me/drafts/:id',
      handler: 'article.findDraft',
      config: {
        auth: {
          scope: [], // Требует аутентификации
        },
      },
    },
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: {
        auth: false, // Публичный доступ для поиска
      },
    },
  ],
};

