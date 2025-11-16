export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        auth: false, // Отключаем проверку прав, используем наш middleware
      },
    },
  ],
};

