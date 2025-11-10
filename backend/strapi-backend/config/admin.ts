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
  vite: (viteConfig) => {
    const plugins = [...(viteConfig.plugins ?? []), nodePolyfills()];

    const resolveAlias = {
      ...(viteConfig.resolve?.alias ?? {}),
      path: 'path-browserify',
      url: 'url/',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      stream: 'stream-browserify',
      events: 'events/',
      'source-map-js': 'source-map-js/source-map.js',
    };

    const optimizeDeps = {
      ...(viteConfig.optimizeDeps ?? {}),
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        'buffer',
        'process',
        'util',
        'stream-browserify',
        'events',
        'path-browserify',
        'url',
        'source-map-js',
      ],
    };

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
        alias: resolveAlias,
      },
      optimizeDeps,
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
