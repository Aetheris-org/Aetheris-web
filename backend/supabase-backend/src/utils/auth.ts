/**
 * Auth utilities
 * Вспомогательные функции для проверки аутентификации
 */
import { GraphQLContext } from '../graphql/context';

/**
 * Проверка аутентификации пользователя
 * Выбрасывает ошибку, если пользователь не аутентифицирован
 */
export function requireAuth(context: GraphQLContext): void {
  if (!context.user) {
    throw new Error('Authentication required');
  }
}

/**
 * Проверка роли администратора
 * Выбрасывает ошибку, если пользователь не администратор
 */
export function requireAdmin(context: GraphQLContext): void {
  requireAuth(context);
  if (context.user!.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

/**
 * Проверка владения ресурсом
 * Выбрасывает ошибку, если пользователь не является владельцем
 */
export function requireOwnership(
  context: GraphQLContext,
  ownerId: string,
  message = 'You do not have permission to access this resource'
): void {
  requireAuth(context);
  if (context.user!.id !== ownerId && context.user!.role !== 'admin') {
    throw new Error(message);
  }
}

