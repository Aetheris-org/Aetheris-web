/**
 * Custom security headers middleware
 * Strapi v5 middleware factory pattern
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    ctx.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );
    ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
    ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
    ctx.set('Cross-Origin-Resource-Policy', 'same-origin');
    await next();
  };
};
