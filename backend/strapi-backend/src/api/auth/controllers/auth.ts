/**
 * Кастомный контроллер для авторизации
 * 
 * ВАЖНО: Используем обычный объект, а не createCoreController,
 * потому что эти эндпоинты не привязаны к конкретному content-type.
 * createCoreController предназначен только для контроллеров, работающих
 * с content-types (collectionType или singleType).
 */
export default {
  async csrf(ctx) {
    try {
      // Strapi автоматически генерирует CSRF токен для сессии
      // Возвращаем токен из сессии или генерируем новый
      const token = ctx.state.csrf || ctx.cookies.get('csrfToken');
      
      ctx.body = {
        csrfToken: token || null,
      };
    } catch (error) {
      strapi.log.error('CSRF token generation failed:', error);
      return ctx.internalServerError('Failed to generate CSRF token');
    }
  },

  async logout(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Not authenticated');
      }

      // Очищаем сессию и токены
      ctx.cookies.set('accessToken', null, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
      });

      ctx.cookies.set('jwtToken', null, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
      });

      ctx.body = {
        message: 'Logged out successfully',
      };
    } catch (error) {
      strapi.log.error('Logout failed:', error);
      return ctx.internalServerError('Logout failed');
    }
  },
};

