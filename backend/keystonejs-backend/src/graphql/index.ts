/**
 * Объединение всех GraphQL schema extensions
 * Правильное объединение resolver'ов без вложенных graphql.extend
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';

// Импортируем resolver'ы напрямую
import { extendGraphqlSchema as reactionsSchema } from './reactions';
import { extendGraphqlSchemaArticles } from './articles';

export const extendGraphqlSchema = graphql.extend((base) => {
  try {
    // Вызываем каждый resolver с base - они уже используют graphql.extend внутри
    const reactions = reactionsSchema(base);
    const articles = extendGraphqlSchemaArticles(base);
    
    // Объединяем результаты
    const merged = {
      query: {
        ...(reactions.query || {}),
        ...(articles.query || {}),
      },
      mutation: {
        ...(reactions.mutation || {}),
        ...(articles.mutation || {}),
      },
    };
    
    logger.debug('[GraphQL] Merged schemas:', {
      queries: Object.keys(merged.query || {}),
      mutations: Object.keys(merged.mutation || {}),
    });
    
    return merged;
  } catch (error: any) {
    logger.error('[GraphQL] Error merging schemas:', error);
    // В случае ошибки возвращаем только reactions
    return reactionsSchema(base);
  }
});

