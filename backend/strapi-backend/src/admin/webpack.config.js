const { ProvidePlugin } = require('webpack');

const STEGA_REMOTE = 'https://cdn.jsdelivr.net/npm/@vercel/stega@0.1.2/+esm';

module.exports = (config) => {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    path: require.resolve('path-browserify'),
    url: require.resolve('url/'),
    fs: false,
  };

  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    '@vercel/stega': require.resolve('@vercel/stega'),
    [STEGA_REMOTE]: require.resolve('@vercel/stega'),
  };

  if (config.externals) {
    console.log('Strapi webpack externals:', config.externals);
    config.externals = config.externals.filter((external) => {
      if (typeof external === 'string') {
        return !external.includes(STEGA_REMOTE);
      }
      if (Array.isArray(external)) {
        return !external.includes(STEGA_REMOTE);
      }
      if (typeof external === 'object' && external !== null) {
        return !Object.values(external).some((value) =>
          typeof value === 'string' && value.includes(STEGA_REMOTE)
        );
      }
      return true;
    });
  }

  config.plugins = config.plugins || [];
  config.plugins.push(
    new ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
