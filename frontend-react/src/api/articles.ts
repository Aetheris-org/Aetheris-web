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
  const previewUrl = getStrapiMediaUrl(strapiArticle.preview_image)
  const previewId = getPreviewImageId(strapiArticle.preview_image)

  const documentId =
    strapiArticle.documentId ||
    strapiArticle.document_id ||
    (typeof strapiArticle.id !== 'undefined' ? String(strapiArticle.id) : '')
  const databaseId =
    typeof strapiArticle.id === 'number'
      ? strapiArticle.id
      : Number.parseInt(strapiArticle.id, 10) || 0

  return {
    id: documentId,
    documentId,
    databaseId,
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
    difficulty: strapiArticle.difficulty || 'medium',
    likes: strapiArticle.likes_count || 0,
    dislikes: strapiArticle.dislikes_count || 0,
    commentsCount: strapiArticle.comments_count || 0,
    createdAt: strapiArticle.createdAt || strapiArticle.created_at,
    updatedAt: strapiArticle.updatedAt || strapiArticle.updated_at,
    userReaction: strapiArticle.user_reaction || null,
    isBookmarked: strapiArticle.is_bookmarked || false,
    views: strapiArticle.views || 0,
    previewImageId: previewId ?? null
  }
}

export interface ArticlesResponse {
  data: Article[]
  total: number
}

export type ArticleDifficulty = 'easy' | 'medium' | 'hard'

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
      },
      preview_image: { fields: ['url'] }
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
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles', {
    params: buildArticleQueryParams(options)
  })
  
  const articles = unwrapStrapiCollectionResponse(res.data).map(transformArticle)
  const total = res.data.meta?.pagination?.total || articles.length
  
  return {
    data: articles,
    total
  }
}

export async function searchArticles(query: string, _userId?: number, skip: number = 0, limit: number = 100): Promise<Article[]> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles/search', {
    params: { 
      q: query,
      skip,
      limit
    }
  })
  
  return unwrapStrapiCollectionResponse(res.data).map(transformArticle)
}

export async function getTrendingArticles(_userId?: number, limit: number = 3): Promise<Article[]> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles', {
    params: {
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] }
          }
        },
        preview_image: { fields: ['url'] }
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
  if (!import.meta.env.DEV) {
    return
  }

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

    console.error(`${label}: ${JSON.stringify(payload, null, 2)}`)
  } else {
    console.error(label, error)
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
        },
        preview_image: { fields: ['url'] }
      }
    }

  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/api/articles/${id}`, {
      params,
    })
    
    return transformArticle(unwrapStrapiResponse(res.data))
  } catch (error) {
    logAxiosError('[api/getArticle] request failed', error)
    throw error
  }
}

export async function getDraftArticle(id: number): Promise<Article> {
  if (!Number.isFinite(id)) {
    throw new Error('Draft id must be a number')
  }

  try {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/api/articles/me/drafts/${id}`, {
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
  const res = await apiClient.post<StrapiResponse<any>>(`/api/articles/${articleId}/react`, {
    reaction,
  })

  return transformArticle(res.data.data)
}

export async function deleteArticle(id: number): Promise<void> {
  await apiClient.delete(`/api/articles/${id}`)
}

export interface DraftPayload {
  title: string
  content: string
  excerpt?: string | null
  tags?: string[]
  difficulty?: ArticleDifficulty | 'all'
  previewImageId?: number | null
}

function buildArticleData(payload: DraftPayload, publishedAt?: string | null) {
  return {
    title: payload.title,
    content: payload.content,
    excerpt: payload.excerpt ?? null,
    tags: payload.tags ?? [],
    difficulty: payload.difficulty && payload.difficulty !== 'all' ? payload.difficulty : 'medium',
    preview_image: typeof payload.previewImageId === 'number' ? payload.previewImageId : null,
    ...(typeof publishedAt !== 'undefined' ? { publishedAt } : {}),
  }
}

export async function createDraftArticle(payload: DraftPayload): Promise<Article> {
  const res = await apiClient.post('/api/articles', wrapStrapiData(buildArticleData(payload, null)))
  return transformArticle(unwrapStrapiResponse(res.data))
}

export async function updateDraftArticle(id: number, payload: DraftPayload): Promise<Article> {
  const res = await apiClient.put(`/api/articles/${id}`, wrapStrapiData(buildArticleData(payload, null)))
  return transformArticle(unwrapStrapiResponse(res.data))
}

export async function publishArticle(
  payload: DraftPayload,
  draftId?: number | null
): Promise<Article> {
  const data = buildArticleData(payload, new Date().toISOString())

  const res = draftId
    ? await apiClient.put(`/api/articles/${draftId}`, wrapStrapiData(data))
    : await apiClient.post('/api/articles', wrapStrapiData(data))

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
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles/me/drafts', {
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

