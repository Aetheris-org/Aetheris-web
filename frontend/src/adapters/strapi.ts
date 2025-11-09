/**
 * Strapi API Response Adapters
 * Handles Strapi's { data: {...}, meta: {...} } response format
 */

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
      start?: number;
      limit?: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

/**
 * Unwrap a single Strapi entity response
 * Supports both Strapi v4 (with attributes) and v5 (flat) formats
 */
export function unwrapStrapiEntity<T>(response: any): T & { id: number } {
  // Strapi v5: flat format { id: 1, title: "...", content: "..." }
  if (!response.attributes) {
    return response;
  }
  
  // Strapi v4: nested format { id: 1, attributes: { title: "...", content: "..." } }
  return {
    id: response.id,
    ...response.attributes
  };
}

/**
 * Unwrap a collection of Strapi entities
 * Supports both Strapi v4 and v5 formats
 */
export function unwrapStrapiCollection<T>(entities: any[]): Array<T & { id: number }> {
  return entities.map(unwrapStrapiEntity);
}

/**
 * Unwrap a full Strapi response (single entity)
 * Supports both Strapi v4 and v5 formats
 */
export function unwrapStrapiResponse<T>(response: any): T & { id: number } {
  return unwrapStrapiEntity(response.data);
}

/**
 * Unwrap a full Strapi collection response
 * Supports both Strapi v4 and v5 formats
 */
export function unwrapStrapiCollectionResponse<T>(
  response: any
): Array<T & { id: number }> {
  return unwrapStrapiCollection(response.data);
}

/**
 * Wrap data for Strapi POST/PUT requests
 */
export function wrapStrapiData<T>(data: T): { data: T } {
  return { data };
}

/**
 * Extract media URL from Strapi media field
 * Converts relative URLs to absolute URLs using Strapi base URL
 */
export function getStrapiMediaUrl(media: any): string | undefined {
  console.log('🔍 [getStrapiMediaUrl] Input:', media, 'Type:', typeof media);
  
  if (!media) {
    console.log('❌ [getStrapiMediaUrl] Media is null/undefined');
  return undefined;
  }
  
  let url: string | undefined;
  
  if (typeof media === 'string') {
    url = media; // Legacy string URL
    console.log('✅ [getStrapiMediaUrl] Media is string:', url);
  } else if (media.data?.attributes?.url) {
    url = media.data.attributes.url;
    console.log('✅ [getStrapiMediaUrl] Found in data.attributes.url:', url);
  } else if (media.url) {
    url = media.url;
    console.log('✅ [getStrapiMediaUrl] Found in url:', url);
  } else {
    console.log('❌ [getStrapiMediaUrl] No URL found in media object:', JSON.stringify(media, null, 2));
  }
  
  if (!url) return undefined;
  
  // ВАЖНО: Strapi возвращает относительные URL типа /uploads/xxx.webp
  // Нужно преобразовать их в полные URL с baseURL
  if (url.startsWith('/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337';
    const fullUrl = `${baseURL}${url}`;
    console.log('🔗 [getStrapiMediaUrl] Converted relative to absolute:', url, '->', fullUrl);
    return fullUrl;
  }
  
  console.log('✅ [getStrapiMediaUrl] Final URL:', url);
  return url;
}

/**
 * Extract author data from Strapi relation
 */
export function unwrapAuthor(author: any): { id: number; username: string; avatar?: string } | null {
  if (!author) return null;
  
  const data = author.data || author;
  if (!data) return null;

  const attributes = data.attributes || data;
  
  return {
    id: data.id || attributes.id,
    username: attributes.username,
    avatar: getStrapiMediaUrl(attributes.avatar)
  };
}

