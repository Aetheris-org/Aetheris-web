import apiClient from '@/lib/axios'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  getStrapiMediaUrl,
} from '@/lib/strapi'

export interface CommentAuthor {
  id: number | string
  username: string
  avatar?: string
}

export interface Comment {
  // id - это строковое представление числового Strapi id
  id: string
  text: string
  createdAt: string
  updatedAt?: string
  author: CommentAuthor
  parentId?: string | null
  likes?: number
  dislikes?: number
  userReaction?: 'like' | 'dislike' | null
}

interface CommentMeta {
  total?: number
  start?: number
  limit?: number
}

function transformComment(raw: any): Comment {
  // id - это строковое представление числового Strapi id
  const numericId =
    typeof raw.id === 'number' ? raw.id : Number.parseInt(raw.id, 10) || 0

  // В Strapi v5 author может быть объектом напрямую или через data
  let author: any = null
  if (raw.author) {
    if (raw.author.data) {
      author = raw.author.data
    } else {
      author = raw.author
    }
  }

  // Извлекаем данные автора
  const authorId = author?.id ?? 0
  const authorUsername = author?.username ?? 'Anonymous'
  const authorAvatar = author?.avatar
    ? (typeof author.avatar === 'string'
        ? author.avatar
        : author.avatar?.url || author.avatar?.data?.attributes?.url)
    : undefined

  // Обработка parent
  let parentId: string | null = null
  if (raw.parent) {
    if (typeof raw.parent === 'object' && raw.parent.id !== undefined) {
      parentId = String(raw.parent.id)
    } else if (typeof raw.parent === 'number' || typeof raw.parent === 'string') {
      parentId = String(raw.parent)
    }
  }

  // Извлекаем userReaction (может быть в разных местах после transformResponse)
  let userReaction = raw.userReaction ?? raw.attributes?.userReaction ?? null

  // Если userReaction является объектом, пытаемся извлечь значение
  // Это может произойти, если transformResponse обернул значение в объект
  if (userReaction !== null && typeof userReaction === 'object') {
    // Если это объект с полями like/dislike, извлекаем значение
    if ('like' in userReaction || 'dislike' in userReaction) {
      userReaction = (userReaction as any).like ? 'like' : (userReaction as any).dislike ? 'dislike' : null
    } else if ('reaction' in userReaction) {
      // Если это объект с полем reaction
      userReaction = (userReaction as any).reaction
    } else {
      // Неизвестный формат объекта - логируем и устанавливаем null
      if (import.meta.env.DEV) {
        console.warn('[transformComment] userReaction is object with unknown format:', {
          id: numericId,
          userReaction,
          keys: Object.keys(userReaction),
        })
      }
      userReaction = null
    }
  }

  // Проверяем, что userReaction является строкой 'like' или 'dislike', или null
  if (userReaction !== null && userReaction !== 'like' && userReaction !== 'dislike') {
    if (import.meta.env.DEV) {
      console.warn('[transformComment] userReaction has invalid value:', {
        id: numericId,
        userReaction,
        userReactionType: typeof userReaction,
      })
    }
    userReaction = null
  }

  // Логирование для отладки (только в development)
  if (import.meta.env.DEV && userReaction !== null) {
    console.log('[transformComment] userReaction found:', {
      id: numericId,
      userReaction,
      raw: raw.userReaction,
      attributes: raw.attributes?.userReaction,
    })
  }

  return {
    id: String(numericId),
    text: raw.text || raw.attributes?.text || '',
    createdAt: raw.createdAt || raw.attributes?.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.attributes?.updatedAt || undefined,
    author: {
      id: authorId,
      username: authorUsername,
      avatar: authorAvatar ? getStrapiMediaUrl(authorAvatar) : undefined,
    },
    parentId,
    likes: raw.likes_count ?? raw.attributes?.likes_count ?? 0,
    dislikes: raw.dislikes_count ?? raw.attributes?.dislikes_count ?? 0,
    userReaction,
  }
}

export async function getArticleComments(
  articleId: string,
  options: { start?: number; limit?: number } = {},
): Promise<{ comments: Comment[]; meta: CommentMeta }> {
  const params: Record<string, any> = {}
  if (typeof options.start !== 'undefined') params.start = options.start
  if (typeof options.limit !== 'undefined') params.limit = options.limit

  // articleId - это строковое представление числового Strapi id
  const response = await apiClient.get(`/articles/${articleId}/comments`, {
    params,
  })

  // В Strapi v5 transformResponse возвращает { data: [...] } для коллекций
  let collection: any[] = []
  
  // Проверяем различные форматы ответа
  if (Array.isArray(response.data)) {
    // Прямой массив
    collection = response.data
  } else if (response.data?.data) {
    if (Array.isArray(response.data.data)) {
      // { data: [...] }
      collection = response.data.data
    } else {
      // { data: {...} } - один элемент
      collection = [response.data.data]
    }
  }

  const comments = collection.map(transformComment)
  const meta: CommentMeta = response.data?.meta ?? {}

  // Логирование для отладки (только в development)
  if (import.meta.env.DEV) {
    const firstCommentRaw = collection[0]
    const firstCommentTransformed = comments[0]
    console.log('[getArticleComments] Response:', {
      articleId,
      collectionLength: collection.length,
      commentsLength: comments.length,
      firstCommentRaw: firstCommentRaw ? {
        id: firstCommentRaw.id,
        userReaction: firstCommentRaw.userReaction,
        hasUserReaction: !!(firstCommentRaw as any).userReaction,
        allKeys: Object.keys(firstCommentRaw),
      } : null,
      firstCommentTransformed: firstCommentTransformed ? {
        id: firstCommentTransformed.id,
        userReaction: firstCommentTransformed.userReaction,
        hasUserReaction: !!firstCommentTransformed.userReaction,
      } : null,
      allCommentsWithReactions: comments.map(c => ({
        id: c.id,
        userReaction: c.userReaction,
        hasUserReaction: !!c.userReaction,
      })),
      rawResponse: response.data,
    })
  }

  return {
    comments,
    meta,
  }
}

export async function createArticleComment(
  articleId: string,
  payload: { text: string; parentId?: string | null },
): Promise<Comment> {
  // articleId - это строковое представление числового Strapi id
  const response = await apiClient.post(
    `/articles/${articleId}/comments`,
    {
      data: {
        text: payload.text,
        parent: payload.parentId ?? null,
      },
    },
    {
      headers: {
        'X-Require-Auth': 'true',
      },
    },
  )

  // В Strapi v5 transformResponse возвращает { data: {...} } для одной сущности
  let entity: any
  if (response.data?.data) {
    entity = response.data.data
  } else if (response.data) {
    entity = response.data
  } else {
    throw new Error('Unexpected response format')
  }

  const transformed = transformComment(entity)
  
  // Логирование для отладки (только в development)
  if (import.meta.env.DEV) {
    console.log('[createArticleComment] Response:', {
      articleId,
      raw: response.data,
      entity,
      transformed,
      entityKeys: Object.keys(entity || {}),
      entityAuthor: entity?.author,
    })
  }

  return transformed
}

export async function updateComment(
  commentId: string,
  payload: { text: string },
): Promise<Comment> {
  const response = await apiClient.put(`/comments/${commentId}`, {
    data: {
      text: payload.text,
    },
  })

  const entity = unwrapStrapiResponse(response.data)
  return transformComment(entity)
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`)
}

export async function reactToComment(
  commentId: string,
  reaction: 'like' | 'dislike',
): Promise<Comment> {
  const response = await apiClient.post(`/comments/${commentId}/react`, {
    reaction,
  })

  // Логирование для отладки (только в development)
  if (import.meta.env.DEV) {
    console.log('[reactToComment] Response:', {
      commentId,
      reaction,
      rawData: response.data,
      hasData: !!(response.data as any)?.data,
      dataUserReaction: (response.data as any)?.data?.userReaction,
      directUserReaction: (response.data as any)?.userReaction,
      rawDataKeys: response.data ? Object.keys(response.data) : [],
    })
  }

  const entity = unwrapStrapiResponse(response.data)
  
  if (import.meta.env.DEV) {
    console.log('[reactToComment] Unwrapped:', {
      commentId,
      entityId: (entity as any).id,
      entityKeys: Object.keys(entity || {}),
      hasUserReaction: !!(entity as any).userReaction,
      userReaction: (entity as any).userReaction,
      entityUserReactionType: typeof (entity as any).userReaction,
    })
  }
  
  const transformed = transformComment(entity)
  
  if (import.meta.env.DEV) {
    console.log('[reactToComment] Transformed:', {
      commentId,
      transformedId: transformed.id,
      hasUserReaction: !!transformed.userReaction,
      userReaction: transformed.userReaction,
      userReactionType: typeof transformed.userReaction,
    })
  }
  
  return transformed
}

