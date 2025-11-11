import apiClient from '@/lib/axios'
import type { Article } from '@/types/article'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  getStrapiMediaUrl,
  unwrapAuthor,
  type StrapiResponse,
  type StrapiEntity
} from '@/lib/strapi'

/**
 * Transform Strapi article to frontend Article type
 */
function transformArticle(strapiArticle: any): Article {
  const author = unwrapAuthor(strapiArticle.author)
  const previewUrl = getStrapiMediaUrl(strapiArticle.preview_image)

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
    views: strapiArticle.views || 0
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

export async function getArticle(id: string, _userId?: number): Promise<Article> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/api/articles/${id}`, {
    params: {
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
  })
  
  return transformArticle(unwrapStrapiResponse(res.data))
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

