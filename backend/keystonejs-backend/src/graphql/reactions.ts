/**
 * Custom GraphQL mutations for reactions
 * Кастомные mutations для реакций на статьи и комментарии
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';

export const extendGraphqlSchema = graphql.extend((base) => {
  // Определяем enum сначала
  const ReactionType = graphql.enum({
    name: 'ReactionType',
    values: graphql.enumValues(['like', 'dislike']),
  });

  return {
    mutation: {
      reactToArticle: graphql.field({
        type: base.object('Article'),
        args: {
          articleId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          reaction: graphql.arg({
            type: graphql.nonNull(ReactionType),
          }),
        },
        async resolve(root, { articleId, reaction }, context) {
          const session = context.session;
          if (!session?.itemId) {
            throw new Error('Authentication required');
          }

          const userId = session.itemId;

          // Проверяем, что реакция валидна
          if (reaction !== 'like' && reaction !== 'dislike') {
            throw new Error('Invalid reaction type');
          }

          // Находим статью
          const article = await context.query.Article.findOne({
            where: { id: articleId },
            query: 'id likes_count dislikes_count',
          });

          if (!article) {
            throw new Error('Article not found');
          }

          // Проверяем существующую реакцию
          const existingReaction = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: articleId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });

          let finalUserReaction: 'like' | 'dislike' | null = null;
          let newLikes = article.likes_count || 0;
          let newDislikes = article.dislikes_count || 0;

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            
            if (currentReaction === reaction) {
              // Удаляем реакцию (toggle off)
              await context.query.ArticleReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
              
              if (reaction === 'like') {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              // Меняем реакцию
              await context.query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
              
              if (reaction === 'like') {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            // Создаем новую реакцию
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: articleId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
            
            if (reaction === 'like') {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }

          // Обновляем счетчики в статье
          const updatedArticle = await context.query.Article.updateOne({
            where: { id: articleId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: `
              id
              title
              content
              excerpt
              author {
                id
                username
                avatar
              }
              previewImage
              tags
              difficulty
              likes_count
              dislikes_count
              views
              publishedAt
              createdAt
              updatedAt
              userReaction
            `,
          });

          // userReaction теперь виртуальное поле, его не нужно добавлять вручную
          logger.info(`Article reaction: articleId=${articleId}, userId=${userId}, reaction=${finalUserReaction}`);
          
          return updatedArticle;
        },
      }),

      reactToComment: graphql.field({
        type: base.object('Comment'),
        args: {
          commentId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          reaction: graphql.arg({
            type: graphql.nonNull(ReactionType),
          }),
        },
        async resolve(root, { commentId, reaction }, context) {
          const session = context.session;
          if (!session?.itemId) {
            throw new Error('Authentication required');
          }

          const userId = session.itemId;

          // Проверяем, что реакция валидна
          if (reaction !== 'like' && reaction !== 'dislike') {
            throw new Error('Invalid reaction type');
          }

          // Находим комментарий
          const comment = await context.query.Comment.findOne({
            where: { id: commentId },
            query: 'id likes_count dislikes_count',
          });

          if (!comment) {
            throw new Error('Comment not found');
          }

          // Проверяем существующую реакцию
          const existingReaction = await context.query.CommentReaction.findMany({
            where: {
              comment: { id: { equals: commentId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });

          let finalUserReaction: 'like' | 'dislike' | null = null;
          let newLikes = comment.likes_count || 0;
          let newDislikes = comment.dislikes_count || 0;

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            
            if (currentReaction === reaction) {
              // Удаляем реакцию (toggle off)
              await context.query.CommentReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
              
              if (reaction === 'like') {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              // Меняем реакцию
              await context.query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
              
              if (reaction === 'like') {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            // Создаем новую реакцию
            await context.query.CommentReaction.createOne({
              data: {
                comment: { connect: { id: commentId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
            
            if (reaction === 'like') {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }

          // Обновляем счетчики в комментарии
          const updatedComment = await context.query.Comment.updateOne({
            where: { id: commentId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: `
              id
              text
              author {
                id
                username
                avatar
              }
              parent {
                id
              }
              article {
                id
              }
              likes_count
              dislikes_count
              createdAt
              updatedAt
              userReaction
            `,
          });

          // userReaction теперь виртуальное поле, его не нужно добавлять вручную
          logger.info(`Comment reaction: commentId=${commentId}, userId=${userId}, reaction=${finalUserReaction}`);
          
          return updatedComment;
        },
      }),
    },
  };
});

