import apiClient from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { Article } from '@/types/article'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  getStrapiMediaUrl,
  unwrapAuthor,
  wrapStrapiData,
  type StrapiResponse,
  type StrapiEntity
} from '@/lib/strapi'
import { logger } from '@/lib/logger'

/**
 * Transform Strapi article to frontend Article type
 */
function getPreviewImageId(previewImage: any): number | null {
  if (!previewImage) return null

  if (typeof previewImage === 'number') {
    return previewImage
  }

  if (previewImage.data?.id) {
    return previewImage.data.id
  }

  if (previewImage.id) {
    return previewImage.id
  }

  return null
}

function transformArticle(strapiArticle: any): Article {
  const author = unwrapAuthor(strapiArticle.author)
  // preview_image теперь строка (URL от imgBB), а не media объект
  const previewUrl = typeof strapiArticle.preview_image === 'string' 
    ? strapiArticle.preview_image 
    : getStrapiMediaUrl(strapiArticle.preview_image)
  const previewId = typeof strapiArticle.preview_image === 'string'
    ? null // URL не имеет ID
    : getPreviewImageId(strapiArticle.preview_image)

  // id - это строковое представление числового Strapi id
  const numericId =
    typeof strapiArticle.id === 'number'
      ? strapiArticle.id
      : Number.parseInt(strapiArticle.id, 10) || 0

  // Извлекаем userReaction (может быть в разных местах после transformResponse)
  const userReaction = strapiArticle.userReaction ?? strapiArticle.user_reaction ?? strapiArticle.attributes?.userReaction ?? null

  // Логирование для отладки (только в development)
  if (import.meta.env.DEV && userReaction !== null) {
    logger.debug('[transformArticle] userReaction found:', {
      id: numericId,
      userReaction,
      raw: strapiArticle.userReaction,
      rawAlt: strapiArticle.user_reaction,
      attributes: strapiArticle.attributes?.userReaction,
    })
  }

  return {
    id: String(numericId),
    title: strapiArticle.title,
    content: strapiArticle.content,
    excerpt: strapiArticle.excerpt || undefined,
    author: {
      id: author?.id || 0,
      username: author?.username || 'Anonymous',
      avatar: author?.avatar || undefined
    },
    author_id: author?.id,
    tags: Array.isArray(strapiArticle.tags) ? strapiArticle.tags : [],
    previewImage: previewUrl,
    status: strapiArticle.publishedAt ? 'published' : 'draft',
    difficulty: strapiArticle.difficulty || 'intermediate',
    likes: strapiArticle.likes_count || 0,
    dislikes: strapiArticle.dislikes_count || 0,
    commentsCount: strapiArticle.comments_count || 0,
    createdAt: strapiArticle.createdAt || strapiArticle.created_at,
    updatedAt: strapiArticle.updatedAt || strapiArticle.updated_at,
    userReaction,
    isBookmarked: strapiArticle.is_bookmarked || false,
    views: strapiArticle.views || 0,
    previewImageId: previewId ?? null
  }
}

export interface ArticlesResponse {
  data: Article[]
  total: number
}

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ArticleSortOption = 'newest' | 'oldest' | 'popular'

export interface ArticleQueryOptions {
  start?: number
  limit?: number
  tags?: string[]
  difficulty?: ArticleDifficulty | 'all'
  sort?: ArticleSortOption
}

function buildArticleQueryParams(options: ArticleQueryOptions = {}) {
  const {
    start = 0,
    limit = 10,
    tags,
    difficulty,
    sort = 'newest',
  } = options

  const params: Record<string, any> = {
    populate: {
      author: {
        fields: ['id', 'username'],
        populate: {
          avatar: { fields: ['url'] }
        }
      }
      // preview_image теперь строка (URL), не требует populate
    },
    'filters[publishedAt][$notNull]': true,
    'pagination[start]': start,
    'pagination[limit]': limit,
    'pagination[withCount]': true
  }

  if (tags && tags.length > 0) {
    tags.forEach((tag, index) => {
      params[`filters[$and][${index}][tags][$containsi]`] = tag
    })
  }

  if (difficulty && difficulty !== 'all') {
    params['filters[difficulty][$eq]'] = difficulty
  }

  switch (sort) {
    case 'oldest':
      params['sort[0]'] = 'createdAt:asc'
      break
    case 'popular':
      params['sort[0]'] = 'likes_count:desc'
      params['sort[1]'] = 'createdAt:desc'
      break
    case 'newest':
    default:
      params['sort[0]'] = 'createdAt:desc'
      break
  }

  return params
}

export async function getAllArticles(options: ArticleQueryOptions = {}): Promise<ArticlesResponse> {
  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/articles', {
    params: buildArticleQueryParams(options)
  })
  
        // Логирование для отладки (только в development)
        logger.debug('[getAllArticles] Raw response:', JSON.stringify(res.data, null, 2))
        logger.debug('[getAllArticles] Response structure:', {
          hasData: !!res.data,
          hasDataData: !!res.data?.data,
          dataType: Array.isArray(res.data?.data) ? 'array' : typeof res.data?.data,
          dataLength: Array.isArray(res.data?.data) ? res.data.data.length : 0,
          firstItem: Array.isArray(res.data?.data) && res.data.data.length > 0 ? JSON.stringify(res.data.data[0], null, 2) : null,
          meta: res.data?.meta,
          fullResponse: res.data,
        })
    
    // Strapi v5 возвращает данные напрямую в data (без attributes)
    // Проверяем формат ответа
    const rawData = res.data?.data
    if (!rawData) {
      logger.error('[getAllArticles] No data in response:', res.data)
      return { data: [], total: 0 }
    }
    
    if (!Array.isArray(rawData)) {
      logger.error('[getAllArticles] Data is not an array:', typeof rawData, rawData)
      return { data: [], total: 0 }
    }
    
    // Обрабатываем ответ через unwrapStrapiCollectionResponse
        const unwrappedArticles = unwrapStrapiCollectionResponse(res.data)
        
        logger.debug('[getAllArticles] Unwrapped articles:', {
          count: unwrappedArticles.length,
          firstArticle: unwrappedArticles[0] ? JSON.stringify(unwrappedArticles[0], null, 2) : null,
          allArticles: unwrappedArticles.length > 0 ? unwrappedArticles.map(a => ({ id: a.id, title: (a as any).title, publishedAt: (a as any).publishedAt })) : [],
        })
    
    const articles = unwrappedArticles.map(transformArticle)
  const total = res.data.meta?.pagination?.total || articles.length
    
    logger.debug('[getAllArticles] Processed:', {
      articlesCount: articles.length,
      total,
      firstTransformed: articles[0] ? JSON.stringify(articles[0], null, 2) : null,
      allTransformed: articles.length > 0 ? articles.map(a => ({ id: a.id, title: a.title, publishedAt: (a as any).publishedAt })) : [],
    })
  
  return {
    data: articles,
    total
    }
  } catch (error) {
    logAxiosError('[getAllArticles] request failed', error)
    throw error
  }
}

export async function searchArticles(query: string, _userId?: number, skip: number = 0, limit: number = 100): Promise<Article[]> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/articles/search', {
    params: { 
      q: query,
      skip,
      limit
    }
  })
  
  return unwrapStrapiCollectionResponse(res.data).map(transformArticle)
}

export async function getTrendingArticles(_userId?: number, limit: number = 3): Promise<Article[]> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/articles', {
    params: {
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] }
          }
        }
        // preview_image теперь строка (URL), не требует populate
      },
      'filters[publishedAt][$notNull]': true,
      'pagination[limit]': limit,
      'sort[0]': 'createdAt:desc'
    }
  })
  
  return unwrapStrapiCollectionResponse(res.data).map(transformArticle)
}

export interface GetArticleOptions {
  userId?: number
}

function logAxiosError(label: string, error: unknown) {
  const possibleAxiosError = error as Partial<AxiosError>

  if (possibleAxiosError && typeof possibleAxiosError === 'object' && possibleAxiosError?.isAxiosError) {
    const response = possibleAxiosError.response
    const payload = {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      url: possibleAxiosError.config?.url,
      params: possibleAxiosError.config?.params,
      method: possibleAxiosError.config?.method,
    }

    logger.error(`${label}: ${JSON.stringify(payload, null, 2)}`)
  } else {
    logger.error(label, error)
  }
}

export async function getArticle(id: string, _options: GetArticleOptions = {}): Promise<Article> {
  const params: Record<string, unknown> = {
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] }
          }
        }
        // preview_image теперь строка (URL), не требует populate
      }
    }

  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/articles/${id}`, {
      params,
    })
    
    const unwrapped = unwrapStrapiResponse(res.data)
    
    // Логирование для отладки (только в development)
    if (import.meta.env.DEV) {
      logger.debug('[getArticle] Response:', {
        id,
        rawData: res.data,
        rawDataKeys: res.data ? Object.keys(res.data) : [],
        hasData: !!(res.data as any)?.data,
        dataUserReaction: (res.data as any)?.data?.userReaction,
        directUserReaction: (res.data as any)?.userReaction,
        unwrapped,
        unwrappedKeys: Object.keys(unwrapped || {}),
        hasUserReaction: !!(unwrapped as any).userReaction,
        userReaction: (unwrapped as any).userReaction,
        userReactionType: typeof (unwrapped as any).userReaction,
      })
    }
    
    return transformArticle(unwrapped)
  } catch (error) {
    logAxiosError('[api/getArticle] request failed', error)
    throw error
  }
}

export async function getDraftArticle(id: number | string): Promise<Article> {
  const numericId = typeof id === 'string' ? Number.parseInt(id, 10) : id
  if (!Number.isFinite(numericId)) {
    throw new Error('Draft id must be a number')
  }

  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/articles/me/drafts/${numericId}`, {
      headers: {
        'X-Require-Auth': 'true',
      },
  })
  
  return transformArticle(unwrapStrapiResponse(res.data))
  } catch (error) {
    logAxiosError('[api/getDraftArticle] request failed', error)
    throw error
  }
}

export async function reactArticle(articleId: string, reaction: 'like' | 'dislike'): Promise<Article> {
  const res = await apiClient.post<StrapiResponse<any>>(`/articles/${articleId}/react`, {
    reaction,
  })

  // Логирование для отладки (только в development)
  if (import.meta.env.DEV) {
    logger.debug('[reactArticle] Response:', {
      articleId,
      reaction,
      rawData: res.data,
      rawDataKeys: res.data ? Object.keys(res.data) : [],
      hasData: !!(res.data as any)?.data,
      dataUserReaction: (res.data as any)?.data?.userReaction,
      directUserReaction: (res.data as any)?.userReaction,
    })
  }

  // Используем unwrapStrapiResponse для консистентности с другими методами
  const unwrapped = unwrapStrapiResponse(res.data)
  
  if (import.meta.env.DEV) {
    logger.debug('[reactArticle] Unwrapped:', {
      articleId,
      unwrappedId: (unwrapped as any).id,
      unwrappedKeys: Object.keys(unwrapped || {}),
      hasUserReaction: !!(unwrapped as any).userReaction,
      userReaction: (unwrapped as any).userReaction,
      userReactionType: typeof (unwrapped as any).userReaction,
    })
  }
  
  const transformed = transformArticle(unwrapped)
  
  if (import.meta.env.DEV) {
    logger.debug('[reactArticle] Transformed:', {
      articleId,
      transformedId: transformed.id,
      hasUserReaction: !!transformed.userReaction,
      userReaction: transformed.userReaction,
      userReactionType: typeof transformed.userReaction,
    })
  }
  
  return transformed
}

export async function deleteArticle(id: number | string): Promise<void> {
  const numericId = typeof id === 'string' ? Number.parseInt(id, 10) : id
  await apiClient.delete(`/articles/${numericId}`)
}

export interface DraftPayload {
  title: string
  content: string
  excerpt?: string | null
  tags?: string[]
  difficulty?: ArticleDifficulty | 'all'
  previewImageUrl?: string | null
}

function buildArticleData(payload: DraftPayload, publishedAt?: string | null) {
  return {
    title: payload.title,
    content: payload.content,
    excerpt: payload.excerpt ?? null,
    tags: payload.tags ?? [],
    difficulty: payload.difficulty && payload.difficulty !== 'all' ? payload.difficulty : 'intermediate',
    preview_image: payload.previewImageUrl || null,
    ...(typeof publishedAt !== 'undefined' ? { publishedAt } : {}),
  }
}

export async function createDraftArticle(payload: DraftPayload): Promise<Article> {
  const res = await apiClient.post('/articles', wrapStrapiData(buildArticleData(payload, null)))
  return transformArticle(unwrapStrapiResponse(res.data))
}

export async function updateDraftArticle(id: number | string, payload: DraftPayload): Promise<Article> {
  const numericId = typeof id === 'string' ? Number.parseInt(id, 10) : id
  const res = await apiClient.put(`/articles/${numericId}`, wrapStrapiData(buildArticleData(payload, null)))
  return transformArticle(unwrapStrapiResponse(res.data))
}

export async function publishArticle(
  payload: DraftPayload,
  draftId?: number | string | null
): Promise<Article> {
  const data = buildArticleData(payload, new Date().toISOString())

  const res = draftId
    ? await apiClient.put(`/articles/${typeof draftId === 'string' ? Number.parseInt(draftId, 10) : draftId}`, wrapStrapiData(data))
    : await apiClient.post('/articles', wrapStrapiData(data))

  return transformArticle(unwrapStrapiResponse(res.data))
}

export async function getDraftArticles(userId: number, options: { limit?: number } = {}): Promise<Article[]> {
  const { limit = 20 } = options

  const params = {
    limit,
  }

  if (import.meta.env.DEV) {
    console.info('[api/getDraftArticles] Request params', { userId, ...params })
  }

  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/articles/me/drafts', {
      params,
      headers: {
        'X-Require-Auth': 'true',
      },
    })

    if (import.meta.env.DEV) {
      console.info('[api/getDraftArticles] Response payload', res.data)
    }

    return unwrapStrapiCollectionResponse(res.data).map(transformArticle)
  } catch (error) {
    logAxiosError('[api/getDraftArticles] request failed', error)
    throw error
  }
}

