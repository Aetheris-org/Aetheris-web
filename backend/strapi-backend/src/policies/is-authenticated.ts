export default async (ctx, next) => {
  try {
    const authService = strapi.plugin('users-permissions').service('jwt');
    const userService = strapi.plugin('users-permissions').service('user');

    const authHeader = ctx.request.headers['authorization'];
    const cookieHeader = ctx.request.headers['cookie'];
    strapi.log.info('🔍 is-authenticated policy: incoming request', {
      url: ctx.request.url,
      method: ctx.request.method,
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.split(' ')[0] : null,
      hasCookie: !!cookieHeader,
    });

    const decoded = await authService.getToken(ctx);
    strapi.log.info('🔍 JWT decode result', {
      decoded: decoded ? { id: decoded.id, iat: decoded.iat, exp: decoded.exp } : null,
    });

    if (!decoded || !decoded.id) {
      ctx.status = 401;
      ctx.body = { data: null, error: { status: 401, message: 'Authentication required' } };
      strapi.log.warn('⚠️  is-authenticated policy: token missing or invalid');
      return;
    }

    const user = await userService.fetchAuthenticatedUser(decoded.id);
    strapi.log.info('🔍 Loaded user for token', {
      userId: user?.id,
      blocked: user?.blocked,
      username: user?.username,
    });

    if (!user || user.blocked) {
      ctx.status = 401;
      ctx.body = { data: null, error: { status: 401, message: 'Invalid user' } };
      strapi.log.warn('⚠️  is-authenticated policy: user not found or blocked', {
        tokenUserId: decoded.id,
      });
      return;
    }

    ctx.state.user = user;
    strapi.log.info('✅ is-authenticated policy passed', { userId: user.id });
    if (typeof next === 'function') {
      await next();
    } else {
      strapi.log.warn('⚠️ is-authenticated policy: next is not a function, skipping call');
    }
  } catch (error) {
    strapi.log.error('❌ is-authenticated policy error:', error);
    ctx.status = 401;
    ctx.body = { data: null, error: { status: 401, message: 'Authentication failed' } };
  }
};
