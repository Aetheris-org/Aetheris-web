/**
 * GraphQL API для авторизации
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import { logger } from '@/lib/logger';
import type { User } from '@/types/user';

export interface GraphQLUser {
  id: string;
  email: string; // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email будет пустой строкой (скрыт для безопасности)
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  coverImage?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Получить текущего пользователя (GraphQL версия)
 * Возвращает GraphQLUser или null
 */
export async function getCurrentUserGraphQL(): Promise<GraphQLUser | null> {
  const meQuery = `
    query Me {
      authenticatedItem {
        ... on User {
          id
          username
          name
          avatar
          bio
          coverImage
          role
          createdAt
          updatedAt
        }
      }
    }
  `;

  try {
    const response = await query<{ authenticatedItem: GraphQLUser | null }>(meQuery);

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Устанавливаем email как пустую строку (скрыт для безопасности)
    if (response.authenticatedItem) {
      response.authenticatedItem.email = '';
    }

    return response.authenticatedItem;
  } catch (error) {
    logger.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Получить текущего пользователя
 * Адаптирует GraphQL User к типу User из @/types/user
 */
export async function getCurrentUser(): Promise<User> {
  logger.debug('👤 getCurrentUser called (GraphQL)')

  try {
    const graphqlUser = await getCurrentUserGraphQL()

    if (!graphqlUser) {
      logger.debug('❌ No authenticated user')
      throw new Error('Not authenticated')
    }

    // Адаптируем GraphQL User к нашему типу User
    const user: User = {
      id: typeof graphqlUser.id === 'string' ? Number.parseInt(graphqlUser.id, 10) : Number(graphqlUser.id),
      nickname: graphqlUser.username,
      email: '', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email скрыт для безопасности (не используем email из GraphQL)
      avatar: graphqlUser.avatar ?? undefined,
      coverImage: graphqlUser.coverImage ?? undefined,
      bio: graphqlUser.bio ?? undefined,
      articlesCount: 0, // TODO: Получить из GraphQL
      commentsCount: 0, // TODO: Получить из GraphQL
      likesReceived: 0, // TODO: Получить из GraphQL
      viewsReceived: 0, // TODO: Получить из GraphQL
      createdAt: graphqlUser.createdAt || new Date().toISOString(),
      status: 'active',
      role: (graphqlUser.role as 'user' | 'admin') || 'user',
      isVerified: false,
      isProfilePublic: true,
      showEmail: false,
      showLastSeen: false,
      reputation: 0,
      level: 1,
      experience: 0,
    }

    logger.debug('✅ User data loaded:', user.nickname)
    return user
  } catch (error: any) {
    logger.error('❌ Failed to load current user:', error)
    throw error
  }
}

/**
 * Войти через email/password
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  const signInMutation = `
    mutation SignIn($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        ... on UserAuthenticationWithPasswordSuccess {
          sessionToken
          item {
            id
            username
            name
            avatar
          }
        }
        ... on UserAuthenticationWithPasswordFailure {
          message
        }
      }
    }
  `;

  try {
    const response = await mutate<{
      authenticateUserWithPassword: {
        sessionToken?: string;
        item?: User;
        message?: string;
      };
    }>(signInMutation, { email, password }, undefined, 'login'); // Используем специальный rate limit для логина (5/5 мин)

    if (response.authenticateUserWithPassword.sessionToken) {
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Устанавливаем email как пустую строку (скрыт для безопасности)
      if (response.authenticateUserWithPassword.item) {
        response.authenticateUserWithPassword.item.email = '';
      }
      // TODO: Сохранить sessionToken в cookies или localStorage
      return { success: true };
    } else {
      return {
        success: false,
        message: response.authenticateUserWithPassword.message || 'Authentication failed',
      };
    }
  } catch (error) {
    logger.error('Failed to sign in:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

/**
 * Выйти
 */
export async function signOut(): Promise<boolean> {
  const signOutMutation = `
    mutation SignOut {
      endSession
    }
  `;

  try {
    await mutate(signOutMutation, undefined, undefined, 'mutation'); // signOut использует общий mutation rate limit
    return true;
  } catch (error) {
    logger.error('Failed to sign out:', error);
    return false;
  }
}

/**
 * Регистрация нового пользователя
 */
export async function signUp(data: {
  email: string;
  password: string;
  username: string;
  name?: string;
}): Promise<{ success: boolean; message?: string }> {
  const signUpMutation = `
    mutation SignUp($data: UserCreateInput!) {
      createUser(data: $data) {
        id
        username
        name
      }
    }
  `;

  try {
    await mutate(signUpMutation, {
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.name || data.username,
      },
    }, undefined, 'login'); // Используем специальный rate limit для регистрации (5/5 мин)

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to sign up:', error);
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
}

