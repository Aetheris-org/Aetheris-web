/**
 * OAuth2 handler для интеграции с KeystoneJS
 * Создает или обновляет пользователей в базе данных через KeystoneJS context
 */
import type { KeystoneContext } from '@keystone-6/core/types';
import logger from '../lib/logger';

export interface GoogleProfile {
  id: string;
  email: string; // Email уже извлечен в passport.ts
  displayName: string;
  avatar?: string;
  provider: string;
}

/**
 * Найти или создать пользователя через Google OAuth
 */
export async function findOrCreateGoogleUser(
  context: KeystoneContext,
  profile: GoogleProfile
): Promise<{ id: string; email: string; username: string; name: string; avatar?: string } | null> {
  try {
    const email = profile.email;
    if (!email) {
      logger.error('Google OAuth: No email in profile', { profile });
      return null;
    }

    // Ищем пользователя по email
    // Используем sudo() для обхода access control при OAuth обработке
    const existingUser = await context.sudo().query.User.findMany({
      where: { email: { equals: email } },
      query: 'id email username name avatar provider confirmed',
      take: 1,
    });

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      // Обновляем данные, если они изменились
      const updateData: any = {};
      if (profile.displayName && user.name !== profile.displayName) {
        updateData.name = profile.displayName;
      }
      if (profile.avatar && user.avatar !== profile.avatar) {
        updateData.avatar = profile.avatar;
      }
      if (user.provider !== 'google') {
        updateData.provider = 'google';
      }
      if (user.confirmed !== true) {
        updateData.confirmed = true;
      }

      if (Object.keys(updateData).length > 0) {
        // Используем context.sudo() для обхода access control при OAuth обработке
        // Это безопасно, так как мы обновляем только публичные поля (name, avatar, provider)
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: updateData,
        });
        logger.info(`Updated Google OAuth user: ${user.id}`);
      }

      return {
        id: String(user.id),
        email: user.email,
        username: user.username,
        name: user.name || profile.displayName,
        avatar: user.avatar || profile.avatar,
      };
    }

    // Создаем нового пользователя
    // Генерируем username из email или displayName
    const baseUsername = profile.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) || email.split('@')[0].substring(0, 20);

    let username = baseUsername;
    let counter = 1;

    // Проверяем уникальность username
    // Используем sudo() для обхода access control при OAuth обработке
    while (true) {
      const existing = await context.sudo().query.User.findMany({
        where: { username: { equals: username } },
        take: 1,
      });

      if (existing.length === 0) {
        break;
      }

      username = `${baseUsername}${counter}`;
      counter++;
      if (counter > 100) { // Ограничение, чтобы избежать бесконечного цикла
        throw new Error('Could not generate unique username');
      }
    }

    // Создаем пользователя
    // Используем sudo() для обхода access control при OAuth обработке
    const newUser = await context.sudo().query.User.createOne({
      data: {
        email,
        username,
        name: profile.displayName,
        avatar: profile.avatar || undefined,
        provider: 'google',
        confirmed: true,
        blocked: false,
        role: 'user', // Новые пользователи получают роль 'user' по умолчанию
        // password не требуется для OAuth пользователей
      },
      query: 'id email username name avatar',
    });

    logger.info(`Created new Google OAuth user: ${newUser.id}`);

    return {
      id: String(newUser.id),
      email: newUser.email,
      username: newUser.username,
      name: newUser.name || profile.displayName,
      avatar: newUser.avatar || profile.avatar,
    };
  } catch (error) {
    logger.error('Error in findOrCreateGoogleUser:', error);
    return null;
  }
}


