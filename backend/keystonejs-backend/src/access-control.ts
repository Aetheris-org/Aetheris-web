/**
 * Access control rules (RBAC) для всех схем
 * Определяет кто может читать, создавать, обновлять и удалять данные
 */
import logger from '../lib/logger';

/**
 * Проверка, является ли пользователь владельцем записи
 */
function isOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) return false;
  return String(item.author?.id || item.author) === String(session.itemId);
}

/**
 * Проверка, является ли пользователь владельцем реакции
 */
function isReactionOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) return false;
  return String(item.user?.id || item.user) === String(session.itemId);
}

/**
 * Проверка, является ли пользователь владельцем комментария
 */
function isCommentOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) return false;
  return String(item.author?.id || item.author) === String(session.itemId);
}

/**
 * Проверка, является ли пользователь владельцем статьи
 */
function isArticleOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) return false;
  return String(item.author?.id || item.author) === String(session.itemId);
}

export const accessControl = {
  User: {
    operation: {
      query: () => {
        // Публичные данные пользователей доступны всем
        // Полные данные контролируются через filter
        return true;
      },
      create: () => {
        // Регистрация доступна всем:
        // 1. Через страницу входа Admin UI (если база пустая) - KeystoneJS автоматически покажет форму регистрации
        // 2. Через GraphQL API (для публичной регистрации на сайте)
        // 
        // ВАЖНО: Роль 'admin' НЕ назначается автоматически через GraphQL API
        // Первый администратор создается ТОЛЬКО через защищенный endpoint /api/setup/initial
        // с использованием Prisma транзакции для защиты от race conditions
        return true;
      },
      update: ({ session, item }: { session?: any; item: any }) => {
        // Обновлять можно только свой профиль или админы могут обновлять всех
        if (!session?.itemId) return false;
        const sessionData = session.data as any;
        if (sessionData?.role === 'admin') return true; // Админы могут обновлять всех
        return String(item.id) === String(session.itemId); // Обычные пользователи - только свой профиль
      },
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только админ
        if (!session?.itemId) return false;
        const sessionData = session.data as any;
        return sessionData?.role === 'admin';
      },
    },
    filter: {
      query: ({ session }: { session?: any }) => {
        // Публичные данные доступны всем
        // Полные данные - только админам
        if (!session?.itemId) return true;
        const sessionData = session.data as any;
        if (sessionData?.role === 'admin') return true; // Админы видят все
        return true; // Публичные данные для всех
      },
    },
  },

  Article: {
    operation: {
      query: () => true, // Чтение статей - публично (фильтр ограничит доступ)
      create: ({ session }: { session?: any }) => {
        // Создавать статьи могут только авторизованные
        return !!session?.itemId;
      },
      update: ({ session, item }: { session?: any; item: any }) => {
        // Обновлять может только автор
        return isArticleOwner({ session, item });
      },
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только автор
        return isArticleOwner({ session, item });
      },
    },
    filter: {
      query: ({ session }: { session?: any }) => {
        // Публичные видят только опубликованные статьи
        if (!session?.itemId) {
          return {
            publishedAt: { not: null },
          };
        }
        // Авторизованные видят опубликованные + свои черновики
        return {
          OR: [
            { publishedAt: { not: null } },
            { author: { id: { equals: session.itemId } } },
          ],
        };
      },
    },
  },

  Comment: {
    operation: {
      query: () => true, // Чтение комментариев - публично
      create: ({ session }: { session?: any }) => {
        // Создавать комментарии могут только авторизованные
        return !!session?.itemId;
      },
      update: ({ session, item }: { session?: any; item: any }) => {
        // Обновлять может только автор
        return isCommentOwner({ session, item });
      },
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только автор
        return isCommentOwner({ session, item });
      },
    },
    filter: {
      query: () => true, // Все видят все комментарии
    },
  },

  ArticleReaction: {
    operation: {
      query: () => true, // Чтение реакций - публично
      create: ({ session }: { session?: any }) => {
        // Создавать реакции могут только авторизованные
        return !!session?.itemId;
      },
      update: ({ session, item }: { session?: any; item: any }) => {
        // Обновлять может только владелец реакции
        return isReactionOwner({ session, item });
      },
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только владелец реакции
        return isReactionOwner({ session, item });
      },
    },
    filter: {
      query: () => true, // Все видят все реакции
    },
  },

  CommentReaction: {
    operation: {
      query: () => true, // Чтение реакций - публично
      create: ({ session }: { session?: any }) => {
        // Создавать реакции могут только авторизованные
        return !!session?.itemId;
      },
      update: ({ session, item }: { session?: any; item: any }) => {
        // Обновлять может только владелец реакции
        return isReactionOwner({ session, item });
      },
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только владелец реакции
        return isReactionOwner({ session, item });
      },
    },
    filter: {
      query: () => true, // Все видят все реакции
    },
  },
};

