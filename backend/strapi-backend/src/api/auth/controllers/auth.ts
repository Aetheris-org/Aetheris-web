/**
 * Auth controller - для обработки текущего пользователя
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  /**
   * GET /api/me - получить текущего пользователя
   * Не требует проверки permissions, работает напрямую с ctx.state.user
   */
  async me(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You are not authenticated');
    }

    try {
      console.log('🔵 /api/me called for user:', userId);

      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId,
        {
          populate: {
            avatar: { fields: ['id', 'name', 'url'] },
            role: { fields: ['id', 'name'] }
          }
        }
      );

      if (!user) {
        return ctx.notFound('User not found');
      }

      console.log('✅ User data retrieved:', user.username);

      return {
        data: user
      };
    } catch (error) {
      console.error('❌ Error in /api/me:', error);
      return ctx.internalServerError('Failed to fetch user data');
    }
  }
}));

