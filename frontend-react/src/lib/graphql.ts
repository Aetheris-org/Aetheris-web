/**
 * GraphQL client для работы с KeystoneJS backend
 * Использует graphql-request для выполнения запросов
 */
import { GraphQLClient } from 'graphql-request';
import { logger } from './logger';

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
      ...client.headers,
      ...customHeaders,
    };

    const data = await client.request<T>(query, variables, headers);

    if (import.meta.env.DEV) {
      logger.debug('GraphQL request successful', { query: query.slice(0, 100) });
    }

    return data;
  } catch (error: any) {
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
 */
export async function mutate<T = any>(
  mutation: string,
  variables?: Record<string, any>,
  customHeaders?: Record<string, string>
): Promise<T> {
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
  
  return request<T>(mutation, variables, customHeaders);
}

/**
 * Выполнить GraphQL query
 */
export async function query<T = any>(
  query: string,
  variables?: Record<string, any>,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>(query, variables, customHeaders);
}

