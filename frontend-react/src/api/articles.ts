import apiClient from '@/lib/axios'
import type { Article } from '@/types/article'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  wrapStrapiData,
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
  
  return {
    id: strapiArticle.id,
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

export async function getAllArticles(userId?: number, start: number = 0, limit: number = 10): Promise<ArticlesResponse> {
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
      'pagination[start]': start,
      'pagination[limit]': limit,
      'pagination[withCount]': true
    }
  })
  
  const articles = unwrapStrapiCollectionResponse(res.data).map(transformArticle)
  const total = res.data.meta?.pagination?.total || articles.length
  
  return {
    data: articles,
    total
  }
}

export async function searchArticles(query: string, userId?: number, skip: number = 0, limit: number = 100): Promise<Article[]> {
  const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles/search', {
    params: { 
      q: query,
      skip,
      limit
    }
  })
  
  return unwrapStrapiCollectionResponse(res.data).map(transformArticle)
}

export async function getTrendingArticles(userId?: number, limit: number = 3): Promise<Article[]> {
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

export async function getArticle(id: number, userId?: number): Promise<Article> {
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

export async function reactArticle(
  articleId: number,
  userId: number,
  reaction: 'like' | 'dislike'
): Promise<Article> {
  const res = await apiClient.post<StrapiResponse<any>>(`/api/articles/${articleId}/react`, {
    reaction
  })
  
  return transformArticle(res.data.data)
}

export async function deleteArticle(id: number): Promise<void> {
  await apiClient.delete(`/api/articles/${id}`)
}

