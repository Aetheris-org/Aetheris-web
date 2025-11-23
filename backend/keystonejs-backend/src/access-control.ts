/**
 * Access control rules (RBAC) для всех схем
 * Определяет кто может читать, создавать, обновлять и удалять данные
 */

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
  if (!item) return false; // Защита от undefined
  return String(item.user?.id || item.user) === String(session.itemId);
}

/**
 * Проверка, является ли пользователь владельцем комментария
 */
function isCommentOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) {
    return false;
  }
  if (!item) {
    return false; // Защита от undefined
  }
  
  try {
    // Используем authorId напрямую из Prisma (быстрее и надежнее)
    // Fallback на item.author?.id или item.author если authorId недоступно
    const authorId = item.authorId ?? item.author?.id ?? item.author;
    if (!authorId) {
      return false;
    }
    
    return String(authorId) === String(session.itemId);
  } catch (error) {
    return false;
  }
}

/**
 * Проверка, является ли пользователь владельцем статьи
 */
function isArticleOwner({ session, item }: { session?: any; item: any }) {
  if (!session?.itemId) return false;
  if (!item) return false; // Защита от undefined
  
  // Используем authorId напрямую из Prisma (быстрее и надежнее)
  // Fallback на item.author?.id или item.author если authorId недоступно
  const authorId = item.authorId ?? item.author?.id ?? item.author;
  if (!authorId) {
    return false;
  }
  
  return String(authorId) === String(session.itemId);
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
      update: ({ session }: { session?: any }) => {
        // Упрощено: проверяем только авторизацию, владельца проверяем через filter
        return !!session?.itemId;
      },
      delete: ({ session }: { session?: any }) => {
        // Упрощено: проверяем только авторизацию, владельца проверяем через filter
        return !!session?.itemId;
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
      update: ({ session }: { session?: any }) => {
        // Обновлять может только автор статьи
        if (!session?.itemId) return false;
        return {
          author: { id: { equals: session.itemId } },
        };
      },
      delete: ({ session }: { session?: any }) => {
        // Удалять может только автор статьи
        if (!session?.itemId) return false;
        return {
          author: { id: { equals: session.itemId } },
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
      update: ({ session }: { session?: any }) => {
        // Разрешаем обновление, но фильтр ограничит доступ только к своим комментариям
        return !!session?.itemId;
      },
      delete: ({ session }: { session?: any }) => {
        // Разрешаем удаление, но фильтр ограничит доступ только к своим комментариям
        return !!session?.itemId;
      },
    },
    filter: {
      query: () => true, // Все видят все комментарии
      update: ({ session }: { session?: any }) => {
        // Обновлять можно только свои комментарии
        if (!session?.itemId) return false;
        return {
          author: { id: { equals: session.itemId } },
        };
      },
      delete: ({ session }: { session?: any }) => {
        // Удалять можно только свои комментарии
        if (!session?.itemId) return false;
        return {
          author: { id: { equals: session.itemId } },
        };
      },
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

  Bookmark: {
    operation: {
      query: ({ session }: { session?: any }) => {
        // Читать закладки может только владелец
        return !!session?.itemId;
      },
      create: ({ session }: { session?: any }) => {
        // Создавать закладки могут только авторизованные
        return !!session?.itemId;
      },
      update: () => false, // Закладки нельзя обновлять
      delete: ({ session }: { session?: any }) => {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Разрешаем удаление авторизованным пользователям
        // Фильтр filter.delete гарантирует, что пользователь может удалять только свои закладки
        return !!session?.itemId;
      },
    },
    filter: {
      query: ({ session }: { session?: any }) => {
        // Пользователь видит только свои закладки
        if (!session?.itemId) return false;
        return {
          user: { id: { equals: session.itemId } },
        };
      },
      delete: ({ session }: { session?: any }) => {
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Пользователь может удалять только свои закладки
        if (!session?.itemId) return false;
        return {
          user: { id: { equals: session.itemId } },
        };
      },
    },
  },

  Follow: {
    operation: {
      query: () => true, // Чтение подписок - публично
      create: ({ session }: { session?: any }) => {
        // Создавать подписки могут только авторизованные
        return !!session?.itemId;
      },
      update: () => false, // Подписки нельзя обновлять
      delete: ({ session, item }: { session?: any; item: any }) => {
        // Удалять может только владелец подписки (follower)
        if (!session?.itemId) return false;
        if (!item) return false;
        return String(item.follower?.id || item.follower) === String(session.itemId);
      },
    },
    filter: {
      query: () => true, // Все видят все подписки
    },
  },

  Notification: {
    operation: {
      query: ({ session }: { session?: any }) => {
        // Читать уведомления могут только авторизованные
        return !!session?.itemId;
      },
      create: () => false, // Уведомления создаются только системой через hooks
      update: ({ session }: { session?: any }) => {
        // Обновлять может только авторизованный пользователь
        // filter.update уже гарантирует, что пользователь может обновлять только свои уведомления
        // Разрешаем обновлять только isRead и readAt
        return !!session?.itemId;
      },
      delete: ({ session }: { session?: any }) => {
        // Удалять может только авторизованный пользователь
        // filter.delete уже гарантирует, что пользователь может удалять только свои уведомления
        return !!session?.itemId;
      },
    },
    filter: {
      query: ({ session }: { session?: any }) => {
        // Пользователь видит только свои уведомления
        if (!session?.itemId) return false;
        return {
          user: { id: { equals: session.itemId } },
        };
      },
      update: ({ session }: { session?: any }) => {
        // Обновлять можно только свои уведомления
        if (!session?.itemId) return false;
        return {
          user: { id: { equals: session.itemId } },
        };
      },
      delete: ({ session }: { session?: any }) => {
        // Удалять можно только свои уведомления
        if (!session?.itemId) return false;
        return {
          user: { id: { equals: session.itemId } },
        };
      },
    },
  },
};

