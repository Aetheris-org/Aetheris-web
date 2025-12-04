/**
 * Supabase OAuth handler
 * Интеграция OAuth через Supabase Auth вместо Passport.js
 */
import type { KeystoneContext } from '@keystone-6/core/types';
import { getSupabaseAdmin } from '../lib/supabase';
import logger from '../lib/logger';
import { hashEmail } from '../lib/email-hash';

export interface SupabaseOAuthProfile {
  id: string; // Supabase user ID (UUID)
  email: string;
  displayName?: string;
  avatar?: string;
  provider: 'google' | 'github' | 'discord' | 'local';
}

/**
 * Создать или обновить пользователя в Supabase Auth и синхронизировать с KeystoneJS
 * 
 * Этот handler вызывается после успешной OAuth аутентификации через Supabase Auth.
 * Supabase Auth уже создал пользователя в auth.users, нам нужно:
 * 1. Убедиться, что профиль создан в public.profiles (через триггер)
 * 2. Синхронизировать данные с KeystoneJS User схемой
 */
export async function syncSupabaseUserWithKeystone(
  context: KeystoneContext,
  supabaseUserId: string,
  profile: SupabaseOAuthProfile
): Promise<{ id: string; username: string; name: string; avatar?: string } | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Получаем данные пользователя из Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
    
    if (authError || !authUser) {
      logger.error('Failed to get user from Supabase Auth:', authError);
      return null;
    }

    const email = authUser.user.email;
    if (!email) {
      logger.error('Supabase user has no email:', { userId: supabaseUserId });
      return null;
    }

    // Хешируем email для поиска в KeystoneJS
    const hashedEmail = hashEmail(email);

    // Ищем пользователя в KeystoneJS по хешу email
    let existingUser = await context.sudo().query.User.findMany({
      where: { email: { equals: hashedEmail } },
      query: 'id email username name avatar provider confirmed',
      take: 1,
    });

    // Если пользователь не найден, создаем его
    if (existingUser.length === 0) {
      // Генерируем username
      const baseUsername = profile.displayName
        ? profile.displayName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20)
        : email.split('@')[0].substring(0, 20);

      let username = baseUsername;
      let counter = 1;

      // Проверяем уникальность username
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
        if (counter > 100) {
          throw new Error('Could not generate unique username');
        }
      }

      // Создаем пользователя в KeystoneJS
      // ВАЖНО: ID должен быть UUID из Supabase Auth
      const newUser = await context.sudo().query.User.createOne({
        data: {
          id: supabaseUserId, // Используем UUID из Supabase Auth
          email: hashedEmail,
          username,
          name: profile.displayName || email.split('@')[0],
          avatar: profile.avatar || undefined,
          provider: profile.provider,
          confirmed: true,
          blocked: false,
          role: 'user',
        },
        query: 'id email username name avatar',
      });

      logger.info(`Created new Supabase OAuth user in KeystoneJS: ${newUser.id}`);

      return {
        id: String(newUser.id),
        username: newUser.username,
        name: newUser.name || profile.displayName || email.split('@')[0],
        avatar: newUser.avatar || profile.avatar,
      };
    }

    // Пользователь существует - обновляем данные
    const user = existingUser[0];
    const updateData: any = {};

    if (profile.displayName && user.name !== profile.displayName) {
      updateData.name = profile.displayName;
    }

    // Обновляем аватар только если у пользователя его нет
    if (profile.avatar && (!user.avatar || user.avatar.trim() === '')) {
      updateData.avatar = profile.avatar;
    }

    if (user.provider !== profile.provider) {
      updateData.provider = profile.provider;
    }

    if (user.confirmed !== true) {
      updateData.confirmed = true;
    }

    // Синхронизируем ID, если он отличается (миграция с integer на UUID)
    if (String(user.id) !== supabaseUserId) {
      logger.warn(`User ID mismatch: KeystoneJS=${user.id}, Supabase=${supabaseUserId}. Migration needed.`);
      // В этом случае нужна дополнительная миграция данных
    }

    if (Object.keys(updateData).length > 0) {
      await context.sudo().query.User.updateOne({
        where: { id: user.id },
        data: updateData,
      });
      logger.info(`Updated Supabase OAuth user in KeystoneJS: ${user.id}`);
    }

    return {
      id: String(user.id),
      username: user.username,
      name: user.name || profile.displayName || email.split('@')[0],
      avatar: user.avatar || profile.avatar,
    };
  } catch (error) {
    logger.error('Error in syncSupabaseUserWithKeystone:', error);
    return null;
  }
}

/**
 * Получить или создать пользователя из Supabase Auth токена
 * Используется для проверки аутентификации через Supabase
 */
export async function getUserFromSupabaseToken(
  context: KeystoneContext,
  accessToken: string
): Promise<{ id: string; username: string; name: string; avatar?: string } | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Проверяем токен и получаем пользователя
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      logger.error('Failed to get user from Supabase token:', error);
      return null;
    }

    // Синхронизируем с KeystoneJS
    const profile: SupabaseOAuthProfile = {
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.name || user.user_metadata?.full_name,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: (user.app_metadata?.provider as any) || 'local',
    };

    return await syncSupabaseUserWithKeystone(context, user.id, profile);
  } catch (error) {
    logger.error('Error in getUserFromSupabaseToken:', error);
    return null;
  }
}


