/**
 * GraphQL client для работы с KeystoneJS backend
 * Использует graphql-request для выполнения запросов
 */
import { GraphQLClient } from 'graphql-request';
import { logger } from './logger';
import { rateLimiter, type RequestType } from './rateLimiter';
import { RateLimitError } from './errors';

// В development используем прокси Vite (/api -> http://localhost:1337)
// В production используем прямой URL из env
// GraphQLClient требует абсолютный URL, поэтому всегда используем полный путь
const getGraphQLEndpoint = (): string => {
  if (import.meta.env.DEV) {
    // В development используем window.location.origin для получения текущего домена
    // Это работает с прокси Vite, который перенаправляет /api на backend
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return `${window.location.origin}/api/graphql`;
    }
    // Fallback для SSR или если window недоступен
    return 'http://localhost:5173/api/graphql';
  }
  // В production используем прямой URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337';
  return `${apiBaseUrl}/api/graphql`;
};

// Создаем GraphQL клиент с lazy initialization
// Это нужно, чтобы window.location был доступен при создании клиента
let graphqlClientInstance: GraphQLClient | null = null;

const createGraphQLClient = (): GraphQLClient => {
  if (graphqlClientInstance) {
    return graphqlClientInstance;
  }
  
  const endpoint = getGraphQLEndpoint();
  
  // Дополнительная проверка валидности URL
  try {
    new URL(endpoint); // Проверяем, что URL валидный
  } catch (error) {
    // Если URL невалидный, используем fallback
    const fallbackEndpoint = typeof window !== 'undefined' && window.location
      ? `${window.location.origin}/api/graphql`
      : 'http://localhost:5173/api/graphql';
    graphqlClientInstance = new GraphQLClient(fallbackEndpoint, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return graphqlClientInstance;
  }
  
  graphqlClientInstance = new GraphQLClient(endpoint, {
    credentials: 'include', // Включаем cookies для сессий
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return graphqlClientInstance;
};

// Экспортируем клиент (будет создан при первом использовании)
export const graphqlClient = createGraphQLClient();

/**
 * Выполнить GraphQL запрос с обработкой ошибок
 */
export async function request<T = any>(
  query: string,
  variables?: Record<string, any>,
  customHeaders?: Record<string, string>
): Promise<T> {
  try {
    // Убеждаемся, что клиент создан
    const client = createGraphQLClient();
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const data = await client.request<T>(query, variables, headers);

    if (import.meta.env.DEV) {
      logger.debug('GraphQL request successful', { query: query.slice(0, 100) });
    }

    return data;
  } catch (error: any) {
    // Обработка HTTP 429 ошибок (Rate Limit от сервера)
    if (error.response?.status === 429) {
      const responseData = error.response.data || {};
      const retryAfter = error.response.headers?.['retry-after'] || error.response.headers?.['Retry-After'];
      
      // Пытаемся извлечь время ожидания из заголовка или ответа
      let waitTime = 0;
      if (retryAfter) {
        waitTime = parseInt(retryAfter, 10);
      } else if (responseData.waitTime !== undefined) {
        waitTime = parseInt(responseData.waitTime, 10);
      } else if (responseData.message) {
        // Пытаемся извлечь время из сообщения (например, "wait 5 seconds")
        const match = responseData.message.match(/(\d+)\s*(?:second|секунд)/i);
        if (match) {
          waitTime = parseInt(match[1], 10);
        }
      }
      
      // Определяем тип операции из query
      const queryLower = query.toLowerCase();
      let rateLimitType: RequestType = 'mutation';
      if (queryLower.includes('reacttocomment') || queryLower.includes('reacttoarticle')) {
        rateLimitType = 'reaction';
      } else if (queryLower.includes('createfollow') || queryLower.includes('deletefollow') || queryLower.includes('unfollow')) {
        rateLimitType = 'follow';
      } else if (queryLower.includes('createbookmark') || queryLower.includes('deletebookmark')) {
        rateLimitType = 'bookmark';
      } else if (queryLower.includes('createarticle') || queryLower.includes('updatearticle')) {
        rateLimitType = 'article-mutation';
      } else if (queryLower.includes('updateprofile')) {
        rateLimitType = 'profile-update';
      } else if (queryLower.includes('createcomment') || queryLower.includes('updatecomment') || queryLower.includes('deletecomment')) {
        rateLimitType = 'comment';
      } else if (queryLower.includes('authenticate') || queryLower.includes('login')) {
        rateLimitType = 'login';
      } else if (queryLower.includes('query') && !queryLower.includes('mutation')) {
        rateLimitType = 'query';
      }
      
      logger.warn('[GraphQL] Server rate limit exceeded', { waitTime, type: rateLimitType });
      throw new RateLimitError(waitTime, rateLimitType, 'server');
    }

    // Подробное логирование ошибок
    logger.error('[GraphQL] Request failed:', {
      message: error.message,
      response: error.response?.data || error.response,
      errors: error.response?.errors || error.errors,
      stack: import.meta.env.DEV ? error.stack : undefined,
      query: query.substring(0, 200),
      variables: variables ? {
        ...variables,
        // Специальная обработка для content
        ...(variables.data?.content && {
          data: {
            ...variables.data,
            content: Array.isArray(variables.data.content)
              ? `[Array of ${variables.data.content.length} blocks]`
              : typeof variables.data.content,
          },
        }),
      } : undefined,
    });

    // Обработка GraphQL ошибок
    if (error.response) {
      const graphqlErrors = error.response.errors;
      if (graphqlErrors && graphqlErrors.length > 0) {
        const errorMessage = graphqlErrors.map((e: any) => e.message).join(', ');
        throw new Error(errorMessage);
      }
    }

    throw error;
  }
}

/**
 * Выполнить GraphQL mutation
 * @param mutation GraphQL mutation строка
 * @param variables Переменные для mutation
 * @param customHeaders Дополнительные заголовки
 * @param rateLimitType Тип rate limit ('mutation' по умолчанию, 'comment' для комментариев)
 */
export async function mutate<T = any>(
  mutation: string,
  variables?: Record<string, any>,
  customHeaders?: Record<string, string>,
  rateLimitType: RequestType = 'mutation'
): Promise<T> {
  // Проверяем rate limit перед выполнением mutation
  const limitCheck = rateLimiter.checkLimit(rateLimitType);
  if (!limitCheck.allowed) {
    const waitTime = limitCheck.waitTime || 0;
    logger.warn(`[GraphQL] Rate limit exceeded for ${rateLimitType}`, { waitTime });
    throw new RateLimitError(waitTime, rateLimitType);
  }

  // Логируем mutation для отладки
  if (import.meta.env.DEV) {
    const mutationName = mutation.match(/mutation\s+(\w+)/)?.[1] || 'unknown';
    logger.debug(`[GraphQL] Executing mutation: ${mutationName}`, {
      mutation: mutation.substring(0, 200),
      variables: variables ? {
        ...variables,
        // Специальная обработка для content (может быть большим)
        ...(variables.data?.content && {
          data: {
            ...variables.data,
            content: Array.isArray(variables.data.content)
              ? `[Array of ${variables.data.content.length} blocks]`
              : typeof variables.data.content,
          },
        }),
      } : undefined,
    });
  }
  
  try {
    const result = await request<T>(mutation, variables, customHeaders);
    // Записываем успешный запрос в историю только после успешного выполнения
    rateLimiter.recordRequest(rateLimitType);
    return result;
  } catch (error: any) {
    // Не записываем неуспешные запросы в историю
    // Это позволяет пользователю повторить попытку после исправления ошибки (например, авторизации)
    throw error;
  }
}

/**
 * Выполнить GraphQL query
 */
export async function query<T = any>(
  query: string,
  variables?: Record<string, any>,
  customHeaders?: Record<string, string>
): Promise<T> {
  // Проверяем rate limit перед выполнением query
  const limitCheck = rateLimiter.checkLimit('query');
  if (!limitCheck.allowed) {
    const waitTime = limitCheck.waitTime || 0;
    logger.warn('[GraphQL] Rate limit exceeded for query', { waitTime });
    throw new RateLimitError(waitTime, 'query');
  }

  try {
    const result = await request<T>(query, variables, customHeaders);
    // Записываем успешный запрос в историю только после успешного выполнения
    rateLimiter.recordRequest('query');
    return result;
  } catch (error: any) {
    // Не записываем неуспешные запросы в историю
    throw error;
  }
}

