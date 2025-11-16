/**
 * Кастомный контроллер для работы с пользователями
 * Не использует createCoreController, чтобы не зависеть от прав плагина users-permissions
 */
export default {
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Not authenticated');
    }

    try {
      // Получаем полную информацию о пользователе с populate
      const userData = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            avatar: {
              fields: ['url', 'formats'],
            },
            coverImage: {
              fields: ['url', 'formats'],
            },
            role: {
              fields: ['name', 'type'],
            },
          },
          fields: [
            'id',
            'username',
            'email',
            'bio',
            'confirmed',
            'blocked',
            'createdAt',
            'updatedAt',
          ],
        }
      );

      if (!userData) {
        return ctx.notFound('User not found');
      }

      // Форматируем ответ для фронтенда
      // Используем type assertion, так как populate добавляет поля, которые не видны в типах
      const userWithPopulate = userData as any;
      
      ctx.body = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        bio: userData.bio || null,
        avatar: userWithPopulate.avatar || null,
        coverImage: userWithPopulate.coverImage || null,
        confirmed: userData.confirmed,
        blocked: userData.blocked,
        role: userWithPopulate.role || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    } catch (error) {
      strapi.log.error('Failed to get user data:', error);
      return ctx.internalServerError('Failed to get user data');
    }
  },
};

