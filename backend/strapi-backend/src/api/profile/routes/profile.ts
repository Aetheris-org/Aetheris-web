export default {
  routes: [
    {
      method: 'GET',
      path: '/profile/:id',
      handler: 'profile.findOne',
      config: {
        auth: false,
      },
    },
  ],
};

