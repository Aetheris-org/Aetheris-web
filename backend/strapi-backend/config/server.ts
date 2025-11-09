export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  settings: {
    cors: {
      enabled: true,
      origin: [
        env('FRONTEND_URL', 'http://localhost:5173'),
        env('PUBLIC_URL', 'http://localhost:1337'),
      ],
      headers: '*',
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      credentials: true,
    },
  },
});