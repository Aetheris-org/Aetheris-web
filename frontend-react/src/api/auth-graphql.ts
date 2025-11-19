/**
 * GraphQL API для авторизации
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import { logger } from '@/lib/logger';

export interface User {
  id: string;
  email: string;
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
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User | null> {
  const meQuery = `
    query Me {
      authenticatedItem {
        ... on User {
          id
          email
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
    const response = await query<{ authenticatedItem: User | null }>(meQuery);

    return response.authenticatedItem;
  } catch (error) {
    logger.error('Failed to get current user:', error);
    return null;
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
            email
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
    }>(signInMutation, { email, password });

    if (response.authenticateUserWithPassword.sessionToken) {
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
    await mutate(signOutMutation);
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
        email
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
    });

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to sign up:', error);
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
}

