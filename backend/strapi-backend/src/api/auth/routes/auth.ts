/**
 * Auth routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/me',
      handler: 'auth.me',
      config: {
        auth: false,
        policies: ['global::is-authenticated'],
        middlewares: []
      }
    }
  ]
};

