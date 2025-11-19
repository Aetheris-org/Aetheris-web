/**
 * GraphQL API для работы с комментариями
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import { logger } from '@/lib/logger';

export interface CommentAuthor {
  id: number | string;
  username: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  author: CommentAuthor;
  parentId?: string | null;
  likes?: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
}

interface CommentMeta {
  total?: number;
  start?: number;
  limit?: number;
}

/**
 * Transform KeystoneJS comment to frontend Comment type
 */
function transformComment(raw: any): Comment {
  const numericId = typeof raw.id === 'number' ? raw.id : Number.parseInt(raw.id, 10) || 0;

  // Обработка parent
  let parentId: string | null = null;
  if (raw.parent) {
    if (typeof raw.parent === 'object' && raw.parent.id !== undefined) {
      parentId = String(raw.parent.id);
    } else if (typeof raw.parent === 'number' || typeof raw.parent === 'string') {
      parentId = String(raw.parent);
    }
  }

  // Извлекаем userReaction
  let userReaction = raw.userReaction ?? null;

  // Проверяем, что userReaction является строкой 'like' или 'dislike', или null
  if (userReaction !== null && userReaction !== 'like' && userReaction !== 'dislike') {
    if (import.meta.env.DEV) {
      logger.warn('[transformComment] userReaction has invalid value:', {
        id: numericId,
        userReaction,
        userReactionType: typeof userReaction,
      });
    }
    userReaction = null;
  }

  return {
    id: String(numericId),
    text: raw.text || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || undefined,
    author: {
      id: raw.author?.id || 0,
      username: raw.author?.username || 'Anonymous',
      avatar: raw.author?.avatar || undefined,
    },
    parentId,
    likes: raw.likes_count || 0,
    dislikes: raw.dislikes_count || 0,
    userReaction,
  };
}

/**
 * Получить комментарии к статье
 */
export async function getArticleComments(
  articleId: string,
  options: { start?: number; limit?: number } = {}
): Promise<{ comments: Comment[]; meta: CommentMeta }> {
  const skip = options.start || 0;
  const take = options.limit || 1000; // Максимум 1000 комментариев

  const commentsQuery = `
    query GetArticleComments($articleId: ID!, $skip: Int!, $take: Int!) {
      comments(
        where: { article: { id: { equals: $articleId } } }
        skip: $skip
        take: $take
        orderBy: { createdAt: asc }
      ) {
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
      }
    }
  `;

  try {
    const response = await query<{ comments: any[] }>(commentsQuery, {
      articleId,
      skip,
      take,
    });

    const comments = response.comments.map(transformComment);

    // TODO: Получить userReaction для каждого комментария отдельным запросом
    // если пользователь аутентифицирован

    return {
      comments,
      meta: {
        total: comments.length,
        start: skip,
        limit: take,
      },
    };
  } catch (error) {
    logger.error(`Failed to fetch comments for article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Создать комментарий
 */
export async function createComment(data: {
  articleId: string;
  text: string;
  parentId?: string | null;
}): Promise<Comment> {
  const createMutation = `
    mutation CreateComment($data: CommentCreateInput!) {
      createComment(data: $data) {
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
      }
    }
  `;

  const createData: any = {
    text: data.text,
    article: { connect: { id: data.articleId } },
  };

  if (data.parentId) {
    createData.parent = { connect: { id: data.parentId } };
  }

  try {
    const response = await mutate<{ createComment: any }>(createMutation, {
      data: createData,
    });

    return transformComment(response.createComment);
  } catch (error) {
    logger.error('Failed to create comment:', error);
    throw error;
  }
}

/**
 * Обновить комментарий
 */
export async function updateComment(
  id: string,
  data: { text: string }
): Promise<Comment> {
  const updateMutation = `
    mutation UpdateComment($id: ID!, $data: CommentUpdateInput!) {
      updateComment(where: { id: $id }, data: $data) {
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
      }
    }
  `;

  try {
    const response = await mutate<{ updateComment: any }>(updateMutation, {
      id,
      data: { text: data.text },
    });

    return transformComment(response.updateComment);
  } catch (error) {
    logger.error(`Failed to update comment ${id}:`, error);
    throw error;
  }
}

/**
 * Удалить комментарий
 */
export async function deleteComment(id: string): Promise<boolean> {
  const deleteMutation = `
    mutation DeleteComment($id: ID!) {
      deleteComment(where: { id: $id }) {
        id
      }
    }
  `;

  try {
    await mutate(deleteMutation, { id });
    return true;
  } catch (error) {
    logger.error(`Failed to delete comment ${id}:`, error);
    throw error;
  }
}

/**
 * Реакция на комментарий (like/dislike)
 */
export async function reactToComment(
  commentId: string,
  reaction: 'like' | 'dislike'
): Promise<Comment> {
  const reactMutation = `
    mutation ReactToComment($commentId: ID!, $reaction: ReactionType!) {
      reactToComment(commentId: $commentId, reaction: $reaction) {
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
      }
    }
  `;

  try {
    const response = await mutate<{ reactToComment: any }>(reactMutation, {
      commentId,
      reaction,
    });

    const comment = transformComment(response.reactToComment);
    // userReaction теперь виртуальное поле, оно автоматически разрешается KeystoneJS
    return comment;
  } catch (error) {
    logger.error(`Failed to react to comment ${commentId}:`, error);
    throw error;
  }
}

