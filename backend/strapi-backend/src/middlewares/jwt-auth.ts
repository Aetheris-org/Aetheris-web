/**
 * Middleware для проверки JWT токена и установки пользователя в ctx.state.user
 * Используется для кастомных эндпоинтов, которые не должны проверять права плагина
 * 
 * ВАЖНО: Стандартная система Strapi auth должна работать для большинства эндпоинтов,
 * но этот middleware обеспечивает дополнительную поддержку для кастомных эндпоинтов
 */
import jwt from 'jsonwebtoken';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Определяем, нужна ли проверка JWT для этого эндпоинта
    const needsJwtAuth = 
      ctx.url === '/api/users/me' && ctx.method === 'GET' ||
      (ctx.url.startsWith('/api/articles') && 
       (ctx.method === 'POST' || ctx.method === 'PUT' || ctx.method === 'DELETE' ||
        ctx.url.includes('/me/drafts'))) ||
      (ctx.url.startsWith('/api/upload') && ctx.method === 'POST');
    
    // Если стандартная система Strapi уже установила пользователя, используем его
    if (ctx.state.user) {
      await next();
      return;
    }
    
    // Если эндпоинт требует аутентификации, проверяем JWT
    if (needsJwtAuth) {
      const token = ctx.request.headers.authorization?.replace('Bearer ', '') || 
                   ctx.cookies.get('accessToken') || 
                   ctx.cookies.get('jwtToken');

      if (token) {
        try {
          // Используем прямой декодер JWT, так как jwtService.verify() возвращает пустой объект
          const jwtSecret = strapi.config.get('plugin::users-permissions.jwtSecret') || 
                          process.env.JWT_SECRET;
          
          if (!jwtSecret) {
            strapi.log.error('❌ JWT_SECRET not configured');
            await next();
            return;
          }

          // Проверяем подпись и декодируем токен
          const payload = jwt.verify(token, jwtSecret) as { id?: number; userId?: number | string };
          
          // Логируем для отладки (только в development)
          if (process.env.NODE_ENV === 'development') {
            strapi.log.info(`🔍 JWT payload from token: ${JSON.stringify(payload)}`);
          }
          
          // В Strapi JWT должен содержать `id` (число)
          // Если есть `userId` (строка) - это не Strapi JWT, игнорируем
          const userId = payload.id;
          
          if (!userId) {
            if (process.env.NODE_ENV === 'development') {
              strapi.log.warn(`❌ JWT auth middleware: No 'id' in token payload. Payload: ${JSON.stringify(payload)}`);
            }
            await next();
            return;
          }

          // Получаем пользователя через entityService (правильный способ)
          const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            userId
          );

          if (user && !user.blocked) {
            ctx.state.user = user;
          }
        } catch (error: any) {
          // Токен невалидный или истек - просто пропускаем запрос
          // Контроллер вернет 401 если пользователь не установлен
        }
      }
    }
    
    await next();
  };
};

