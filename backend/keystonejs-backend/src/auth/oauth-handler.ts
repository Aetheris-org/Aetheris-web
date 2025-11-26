/**
 * OAuth2 handler для интеграции с KeystoneJS
 * Создает или обновляет пользователей в базе данных через KeystoneJS context
 */
import type { KeystoneContext } from '@keystone-6/core/types';
import { createHash } from 'crypto';
import logger from '../lib/logger';
import { hashEmail, isEmailHash } from '../lib/email-hash';

/**
 * Хеширует email старым способом (SHA-256 без секрета) для обратной совместимости
 * Используется только для поиска пользователей со старыми хешами
 */
function hashEmailOld(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const hash = createHash('sha256');
  hash.update(normalizedEmail);
  return hash.digest('hex');
}

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
      logger.error('Google OAuth: No email in profile', {
        profileId: profile.id,
        hasEmails: !!profile.emails && profile.emails.length > 0,
      });
      return null;
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Хешируем email новым способом (HMAC-SHA256)
    const hashedEmail = hashEmail(email);

    // Ищем пользователя по новому хешу email (HMAC-SHA256)
    // Используем sudo() для обхода access control при OAuth обработке
    let existingUser = await context.sudo().query.User.findMany({
      where: { email: { equals: hashedEmail } },
      query: 'id email username name avatar provider confirmed',
      take: 1,
    });

    // Если не найден по новому хешу, пробуем найти по старому (SHA-256) для обратной совместимости
    if (existingUser.length === 0) {
      const oldHashedEmail = hashEmailOld(email);
      existingUser = await context.sudo().query.User.findMany({
        where: { email: { equals: oldHashedEmail } },
        query: 'id email username name avatar provider confirmed',
        take: 1,
      });
      
      if (existingUser.length > 0) {
        logger.info(`Found user with old email hash format, will rehash to HMAC-SHA256: ${existingUser[0].id}`);
      }
    }

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      // Обновляем данные, если они изменились
      const updateData: any = {};
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Перехешируем email с новым алгоритмом, если он изменился
      // Это происходит автоматически при следующем OAuth входе для пользователей со старыми хешами
      if (user.email !== hashedEmail) {
        updateData.email = hashedEmail;
        logger.info(`Rehashing email for user ${user.id} from old format to HMAC-SHA256`);
      }
      
      if (profile.displayName && user.name !== profile.displayName) {
        updateData.name = profile.displayName;
      }
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Обновляем аватар из Google ТОЛЬКО если у пользователя его нет
      // Это предотвращает перезапись загруженного пользователем аватара при повторной авторизации
      if (profile.avatar && (!user.avatar || user.avatar.trim() === '')) {
        updateData.avatar = profile.avatar;
        logger.debug('Updating avatar from Google OAuth (user had no avatar)', {
          userId: user.id,
          googleAvatar: profile.avatar,
        });
      } else if (profile.avatar && user.avatar && user.avatar !== profile.avatar) {
        logger.debug('Skipping avatar update from Google OAuth (user has custom avatar)', {
          userId: user.id,
          currentAvatar: user.avatar,
          googleAvatar: profile.avatar,
        });
      }
      if (user.provider !== 'google') {
        updateData.provider = 'google';
      }
      if (user.confirmed !== true) {
        updateData.confirmed = true;
      }

      if (Object.keys(updateData).length > 0) {
        // Используем context.sudo() для обхода access control при OAuth обработке
        // Это безопасно, так как мы обновляем только публичные поля (name, avatar, provider, email)
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: updateData,
        });
        logger.info(`Updated Google OAuth user: ${user.id}`);
      }

      return {
        id: String(user.id),
        email: '', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
        username: user.username,
        name: user.name || profile.displayName,
        avatar: user.avatar || profile.avatar,
      };
    }

    // Создаем нового пользователя
    // Генерируем username из email или displayName
    // ИСПРАВЛЕНИЕ: Проверяем существование displayName перед вызовом методов
    const baseUsername = profile.displayName
      ? profile.displayName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20)
      : email.split('@')[0].substring(0, 20);

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
        email: hashedEmail, // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем хеш email вместо оригинального
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
      email: '', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
      username: newUser.username,
      name: newUser.name || profile.displayName,
      avatar: newUser.avatar || profile.avatar,
    };
  } catch (error) {
    logger.error('Error in findOrCreateGoogleUser:', error);
    return null;
  }
}








