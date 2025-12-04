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
  name?: string;
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

    // Получаем профиль пользователя из таблицы users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      logger.error('Failed to get user profile', profileError);
      return null;
    }

    // Адаптируем к типу User
    const user: User = {
      id: Number(profile.id) || 0,
      nickname: profile.username || '',
      email: profile.email || '', // Email может быть скрыт для безопасности
      avatar: profile.avatar || undefined,
      bio: profile.bio || undefined,
      role: (profile.role || 'user') as 'user' | 'moderator' | 'admin' | 'super_admin',
      articlesCount: 0, // Будет загружено отдельно если нужно
      commentsCount: 0,
      likesReceived: 0,
      viewsReceived: 0,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || undefined,
      status: profile.blocked ? 'banned' : 'active',
      isVerified: false,
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
  username: string,
  name: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Регистрируем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
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

    // Создаем профиль в таблице users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        username: username,
        name: name,
        provider: 'local',
        confirmed: false,
        blocked: false,
        role: 'user',
      });

    if (profileError) {
      logger.error('Failed to create user profile', profileError);
      // Удаляем пользователя из auth если не удалось создать профиль
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to create user profile',
      };
    }

    return {
      success: true,
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

