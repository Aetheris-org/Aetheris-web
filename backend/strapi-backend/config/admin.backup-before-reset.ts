import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('ADMIN_URL', env('PUBLIC_URL', 'http://localhost:1337')),
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  
  // Настройка Vite для админ-панели с полифилами Node.js модулей
  vite: (viteConfig) => {
    const plugins = [
      ...(viteConfig.plugins ?? []),
      nodePolyfills({
        include: ['path', 'fs', 'url', 'buffer', 'process', 'util', 'stream', 'events'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        overrides: {
          fs: 'memfs',
        },
        protocolImports: true,
      }),
    ];

    return {
      ...viteConfig,
      plugins,
      define: {
        ...(viteConfig.define ?? {}),
        global: 'globalThis',
        'process.env': {},
      },
      resolve: {
        ...(viteConfig.resolve ?? {}),
        alias: {
          ...(viteConfig.resolve?.alias ?? {}),
          path: 'path-browserify',
          fs: 'memfs',
          url: 'url',
          buffer: 'buffer',
          process: 'process/browser',
          util: 'util',
          stream: 'stream-browserify',
          events: 'events/',
          'source-map-js': 'source-map-js/source-map.js',
        },
      },
      optimizeDeps: {
        ...(viteConfig.optimizeDeps ?? {}),
        include: [
          ...(viteConfig.optimizeDeps?.include ?? []),
          'buffer',
          'process',
          'util',
          'stream-browserify',
          'events',
          'path-browserify',
          'memfs',
        ],
      },
      server: {
        ...(viteConfig.server ?? {}),
        hmr: {
          ...(viteConfig.server?.hmr ?? {}),
          overlay: false,
        },
      },
    };
  },
});
