/**
 * Custom GraphQL mutations for user profile
 * Кастомные mutations для обновления профиля пользователя
 */
import { graphql } from '@keystone-6/core';
import { z } from 'zod';
import logger from '../lib/logger';

// Схема валидации для обновления профиля
const UpdateProfileInputSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
});

export const extendGraphqlSchemaProfile = graphql.extend((base) => {
  return {
    mutation: {
      updateProfile: graphql.field({
        type: base.object('User'),
        args: {
          username: graphql.arg({ type: graphql.String }),
          bio: graphql.arg({ type: graphql.String }),
          avatar: graphql.arg({ type: graphql.String }),
          coverImage: graphql.arg({ type: graphql.String }),
        },
        async resolve(root, args, context) {
          logger.info('[updateProfile] START:', {
            hasUsername: !!args.username,
            hasBio: args.bio !== undefined,
            hasAvatar: args.avatar !== undefined,
            hasCoverImage: args.coverImage !== undefined,
          });

          const session = context.session;
          if (!session?.itemId) {
            logger.error('[updateProfile] Authentication required');
            throw new Error('Authentication required');
          }

          const userId = session.itemId;
          logger.info(`[updateProfile] userId=${userId}`);

          // Валидация входных данных через Zod
          try {
            const validatedArgs = UpdateProfileInputSchema.parse({
              username: args.username,
              bio: args.bio ?? null,
              avatar: args.avatar ?? null,
              coverImage: args.coverImage ?? null,
            });

            logger.debug('[updateProfile] Validated args:', validatedArgs);

            // Подготавливаем данные для обновления
            const updateData: any = {};
            
            if (validatedArgs.username !== undefined) {
              updateData.username = validatedArgs.username;
            }
            
            if (validatedArgs.bio !== undefined) {
              updateData.bio = validatedArgs.bio;
            }
            
            if (validatedArgs.avatar !== undefined) {
              updateData.avatar = validatedArgs.avatar;
            }
            
            if (validatedArgs.coverImage !== undefined) {
              updateData.coverImage = validatedArgs.coverImage;
            }

            // Обновляем профиль пользователя
            logger.info(`[updateProfile] Updating user profile: userId=${userId}`);
            const updatedUser = await context.query.User.updateOne({
              where: { id: String(userId) },
              data: updateData,
              query: 'id username bio avatar coverImage createdAt updatedAt', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из query
            });

            if (!updatedUser) {
              logger.error(`[updateProfile] User not found: userId=${userId}`);
              throw new Error('User not found');
            }

            logger.info(`[updateProfile] SUCCESS: userId=${userId}, username=${updatedUser.username}`);
            return updatedUser;
          } catch (error: any) {
            if (error instanceof z.ZodError) {
              logger.error('[updateProfile] Validation error:', error.errors);
              throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
            }
            logger.error('[updateProfile] Error:', error);
            throw error;
          }
        },
      }),
    },
  };
});



