/**
 * Auth API using Supabase Auth
 * Замена для auth-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { User } from '@/types/user';

export interface SupabaseUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  cover_image?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      logger.debug('No authenticated user');
      return null;
    }

      const usernameFromMeta =
        (authUser.user_metadata as any)?.username ||
        (authUser.user_metadata as any)?.name ||
        authUser.email?.split('@')[0] ||
        'user';
      const avatarFromMeta =
        (authUser.user_metadata as any)?.avatar_url ||
        (authUser.user_metadata as any)?.picture ||
        null;

    const buildFallbackProfile = () => ({
      id: authUser.id,
      username: usernameFromMeta,
      nickname: usernameFromMeta,
      avatar: avatarFromMeta,
      avatar_url: avatarFromMeta,
      tag: null,
      bio: null,
      role: 'user',
      created_at: authUser.created_at || new Date().toISOString(),
    })

    // helper: ensure profile row exists for auth user (handles missing profiles for OAuth)
    const ensureProfile = async () => {
      // check again before insert to avoid duplicates
      const { data: existing, error: existingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (existing && !existingError) {
        return existing;
      }

      const { data: upserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
          id: authUser.id,
            username: usernameFromMeta,
            nickname: usernameFromMeta,
          avatar: avatarFromMeta,
          avatar_url: avatarFromMeta,
          },
          {
            onConflict: 'id',
          }
        )
        .select()
        .maybeSingle();

      if (upsertError) {
        const msg = (upsertError as any)?.message || ''
        const code = (upsertError as any)?.code || ''
        const isNameSchemaIssue = msg.includes('name') || code === 'PGRST204'
        if (isNameSchemaIssue) {
          logger.warn('Profile upsert failed due to missing name column; returning fallback profile', upsertError)
          return buildFallbackProfile()
        }
        logger.error('Failed to create profile for auth user', upsertError);
        return null;
      }

      return upserted;
    };

    let profile = null;
    let profileError = null;

    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    profile = profileData;
    profileError = fetchError;

    if (profileError || !profile) {
      logger.warn('Profile missing for auth user, attempting to create...', profileError);
      profile = await ensureProfile();

      // если не удалось создать или получить профиль, используем фолбек,
      // чтобы не зависнуть на загрузке/онбординге
      if (!profile) {
        profile = buildFallbackProfile()
      }

      // если профиль всё ещё пустой, выходим
      if (!profile) {
        return null;
      }
    }


    const uuidToNumber = (uuid: string): number => {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
      }
      return Math.abs(hash);
    };

    const user: User = {
      id: profile.id ? uuidToNumber(profile.id) : 0,
      uuid: profile.id, // Сохраняем оригинальный UUID для запросов к базе 
      nickname: profile.username || '',
      email: '',
      avatar: profile.avatar || profile.avatar_url || undefined,
      coverImage: profile.cover_image || profile.cover_url || undefined,
      tag: profile.tag || undefined,
      bio: profile.bio || undefined,
      role: (profile.role || 'user') as 'user' | 'moderator' | 'admin' | 'super_admin',
      articlesCount: 0,
      commentsCount: 0,
      likesReceived: 0,
      viewsReceived: 0,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || undefined,
      status: profile.blocked ? 'banned' : 'active',
      isVerified: false,
      confirmed: !!profile.confirmed,
      isProfilePublic: true,
      showEmail: false,
      showLastSeen: false,
      reputation: 0,
      level: 1,
      experience: 0,
    };

    return user;
  } catch (error: any) {
    logger.error('Error in getCurrentUser', error);
    return null;
  }
}

/**
 * Вход через email и пароль
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Sign in error', error);
      return {
        success: false,
        message: error.message || 'Failed to sign in',
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    logger.error('Error in signIn', error);
    return {
      success: false,
      message: error.message || 'Failed to sign in',
    };
  }
}

/**
 * Регистрация нового пользователя
 */
export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Регистрируем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError || !authData.user) {
      logger.error('Sign up error', authError);
      return {
        success: false,
        message: authError?.message || 'Failed to sign up',
      };
    }

    // Профиль в таблице public.profiles будет создан автоматически триггером
    // Не нужно вручную создавать профиль - триггер сделает это при INSERT в auth.users
    logger.debug('✅ User registered in Supabase Auth, profile will be created by trigger');

    return {
      success: true,
      message: 'Please check your email to confirm your account.',
    };
  } catch (error: any) {
    logger.error('Error in signUp', error);
    return {
      success: false,
      message: error.message || 'Failed to sign up',
    };
  }
}

/**
 * Выход
 */
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Sign out error', error);
      return false;
    }

    return true;
  } catch (error: any) {
    logger.error('Error in signOut', error);
    return false;
  }
}

/**
 * Сброс пароля
 */
export async function resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      logger.error('Reset password error', error);
      return {
        success: false,
        message: error.message || 'Failed to reset password',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    logger.error('Error in resetPassword', error);
    return {
      success: false,
      message: error.message || 'Failed to reset password',
    };
  }
}

/**
 * Обновление пароля
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error('Update password error', error);
      return {
        success: false,
        message: error.message || 'Failed to update password',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    logger.error('Error in updatePassword', error);
    return {
      success: false,
      message: error.message || 'Failed to update password',
    };
  }
}

/**
 * Вход через OAuth провайдера (Google, GitHub и т.д.)
 */
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Минимальные scope для Google, чтобы не тянуть email/avatar в raw_user_meta_data
        scopes: provider === 'google' ? 'openid profile' : undefined,
      },
    });

    if (error) {
      logger.error(`OAuth sign in error with ${provider}`, error);
      return {
        success: false,
        message: error.message || `Failed to sign in with ${provider}`,
      };
    }

    // Supabase перенаправит пользователя на страницу провайдера
    // После успешной авторизации провайдер перенаправит обратно на redirectTo
    return {
      success: true,
    };
  } catch (error: any) {
    logger.error(`Unexpected OAuth sign in error with ${provider}`, error);
    return {
      success: false,
      message: error.message || `An unexpected error occurred with ${provider}`,
    };
  }
}

