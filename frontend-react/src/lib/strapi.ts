/**
 * Strapi API Response Adapters
 * Handles Strapi's { data: {...}, meta: {...} } response format
 */

export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page?: number
      pageSize?: number
      pageCount?: number
      total?: number
      start?: number
      limit?: number
    }
  }
}

export interface StrapiEntity<T> {
  id: number
  attributes: T
}

/**
 * Unwrap a single Strapi entity response
 * Supports both Strapi v4 (with attributes) and v5 (flat) formats
 */
export function unwrapStrapiEntity<T>(response: any): T & { id: number } {
  if (!response.attributes) {
    return response
  }
  
  return {
    id: response.id,
    ...response.attributes
  }
}

/**
 * Unwrap a collection of Strapi entities
 */
export function unwrapStrapiCollection<T>(entities: any[]): Array<T & { id: number }> {
  return entities.map((entity) => unwrapStrapiEntity<T>(entity)) as Array<T & { id: number }>
}

/**
 * Unwrap a full Strapi response (single entity)
 */
export function unwrapStrapiResponse<T>(response: any): T & { id: number } {
  return unwrapStrapiEntity(response.data)
}

/**
 * Unwrap a full Strapi collection response
 * Supports both Strapi v4 (with attributes) and v5 (flat) formats
 */
export function unwrapStrapiCollectionResponse<T>(
  response: any
): Array<T & { id: number }> {
  // Если response уже массив (Strapi v5 flat format)
  if (Array.isArray(response)) {
    return response.map((item) => unwrapStrapiEntity<T>(item))
  }
  
  // Если response.data это массив (Strapi v4/v5 standard format)
  if (response?.data && Array.isArray(response.data)) {
    return unwrapStrapiCollection(response.data)
  }
  
  // Fallback: возвращаем пустой массив
  console.warn('[unwrapStrapiCollectionResponse] Unexpected response format:', response)
  return []
}

/**
 * Wrap data for Strapi POST/PUT requests
 */
export function wrapStrapiData<T>(data: T): { data: T } {
  return { data }
}

/**
 * Extract media URL from Strapi media field
 */
export function getStrapiMediaUrl(media: any): string | undefined {
  if (!media) return undefined
  
  let url: string | undefined
  
  if (typeof media === 'string') {
    url = media
  } else if (media.data?.attributes?.url) {
    url = media.data.attributes.url
  } else if (media.url) {
    url = media.url
  }
  
  if (!url) return undefined
  
  if (url.startsWith('/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
    return `${baseURL}${url}`
  }
  
  return url
}

/**
 * Extract author data from Strapi relation
 */
export function unwrapAuthor(author: any): { id: number; username: string; avatar?: string } | null {
  if (!author) return null
  
  const data = author.data || author
  if (!data) return null

  const attributes = data.attributes || data
  
  return {
    id: data.id || attributes.id,
    username: attributes.username,
    avatar: getStrapiMediaUrl(attributes.avatar)
  }
}

