import apiClient from './axios'
import type { Article, CreateArticleRequest, UserArticle } from '@/types/article'
import {
  unwrapStrapiCollectionResponse,
  unwrapStrapiResponse,
  unwrapStrapiEntity,
  wrapStrapiData,
  getStrapiMediaUrl,
  unwrapAuthor,
  type StrapiResponse,
  type StrapiEntity
} from '@/adapters/strapi'

export interface CommentDTO {
    id: number
    article_id: number
    parent_id?: number | null
    author_id?: number | null
    author_name: string
    author_avatar?: string | null
    text: string
    created_at: string
    updated_at?: string | null
    likes?: number
    dislikes?: number
    user_reaction?: string | null
}

/**
 * Transform Strapi article to frontend Article type
 */
function transformArticle(strapiArticle: any): Article {
  console.log('🔄 [transformArticle] Raw Strapi article:', {
    id: strapiArticle.id,
    title: strapiArticle.title,
    preview_image_raw: strapiArticle.preview_image,
    preview_image_type: typeof strapiArticle.preview_image
  });
  
  const author = unwrapAuthor(strapiArticle.author);
  
  const previewUrl = getStrapiMediaUrl(strapiArticle.preview_image);
  console.log('📸 [transformArticle] Preview URL after getStrapiMediaUrl:', previewUrl);
  
  const transformed = {
    id: strapiArticle.id,
    title: strapiArticle.title,
    content: strapiArticle.content,
    excerpt: strapiArticle.excerpt || undefined,
    author: {
      id: author?.id || 0,
      username: author?.username || 'Anonymous',
      avatar: author?.avatar || null
    },
    author_id: author?.id,
    author_avatar: author?.avatar,
    tags: Array.isArray(strapiArticle.tags) ? strapiArticle.tags : [],
    preview_image: previewUrl,
    previewImage: previewUrl, // Для совместимости с типом Article
    status: strapiArticle.publishedAt ? 'published' : 'draft',
    difficulty: strapiArticle.difficulty || 'medium',
    likes: strapiArticle.likes_count || 0,
    dislikes: strapiArticle.dislikes_count || 0,
    comments_count: strapiArticle.comments_count || 0,
    commentsCount: strapiArticle.comments_count || 0, // Для совместимости с типом Article
    created_at: strapiArticle.createdAt || strapiArticle.created_at,
    createdAt: strapiArticle.createdAt || strapiArticle.created_at, // Для совместимости с типом Article
    updatedAt: strapiArticle.updatedAt || strapiArticle.updated_at,
    user_reaction: strapiArticle.user_reaction || null,
    userReaction: strapiArticle.user_reaction || null, // Для совместимости с типом Article
    is_bookmarked: strapiArticle.is_bookmarked || false,
    isBookmarked: strapiArticle.is_bookmarked || false // Для совместимости с типом Article
  };
  
  console.log('✅ [transformArticle] Transformed article:', {
    id: transformed.id,
    preview_image: transformed.preview_image,
    previewImage: transformed.previewImage
  });
  
  return transformed;
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
    });
    
    const articles = unwrapStrapiCollectionResponse(res.data).map(transformArticle);
    const total = res.data.meta?.pagination?.total || articles.length;
    
    return {
        data: articles,
        total
    };
}

export async function searchArticles(query: string, userId?: number, skip: number = 0, limit: number = 100): Promise<Article[]> {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles/search', {
        params: { 
            q: query,
            skip,
            limit
        }
    });
    
    return unwrapStrapiCollectionResponse(res.data).map(transformArticle);
}

// TODO: Implement proper trending logic in Strapi backend
export async function getTrendingArticles(userId?: number, limit: number = 3): Promise<Article[]> {
    // Временная заглушка: возвращаем последние опубликованные статьи
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
    });
    
    return unwrapStrapiCollectionResponse(res.data).map(transformArticle);
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
    });
    
    return transformArticle(unwrapStrapiResponse(res.data));
}

export async function reactArticle(
    articleId: number,
    userId: number,
    reaction: 'like' | 'dislike'
): Promise<Article> {
    const res = await apiClient.post<StrapiResponse<any>>(`/api/articles/${articleId}/react`, {
        reaction
    });
    
    return transformArticle(res.data.data);
}

export async function createArticle(data: CreateArticleRequest): Promise<Article> {
    // SECURITY: Author берётся автоматически из ctx.state.user на бэкенде
    // Это безопасно - пользователь не может создать статью от имени другого пользователя
    
    // preview_image может быть:
    // 1. ID файла (number) - если загружено через /api/upload
    // 2. URL (string) - если загружено через внешний сервис (ImgBB)
    // Strapi автоматически обработает оба варианта
    
    const articleData: any = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || undefined, // Добавляем excerpt если есть
        tags: data.tags,
        difficulty: data.difficulty,
        publishedAt: data.status === 'published' ? new Date().toISOString() : null
    };
    
    // Добавляем preview_image только если он есть
    if (data.preview_image) {
        // Если это число - ID файла в Strapi Media
        if (typeof data.preview_image === 'number' || !isNaN(Number(data.preview_image))) {
            articleData.preview_image = Number(data.preview_image);
        } else {
            // Если это URL - сохраняем как есть (для внешних изображений)
            articleData.preview_image = data.preview_image;
        }
    }
    
    console.log('📤 Sending article data to Strapi:', JSON.stringify(articleData, null, 2));
    
    const res = await apiClient.post<StrapiResponse<StrapiEntity<any>>>('/api/articles', wrapStrapiData(articleData));
    
    return transformArticle(unwrapStrapiResponse(res.data));
}

export async function updateArticle(id: number, data: CreateArticleRequest): Promise<Article> {
    // SECURITY: Author берётся автоматически из ctx.state.user на бэкенде
    // Пользователь не может изменить автора статьи
    
    const articleData: any = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || undefined, // Добавляем excerpt если есть
        tags: data.tags,
        difficulty: data.difficulty,
        publishedAt: data.status === 'published' ? new Date().toISOString() : null
    };
    
    // Добавляем preview_image только если он есть
    if (data.preview_image) {
        if (typeof data.preview_image === 'number' || !isNaN(Number(data.preview_image))) {
            articleData.preview_image = Number(data.preview_image);
        } else {
            articleData.preview_image = data.preview_image;
        }
    }
    
    console.log('📤 Updating article data in Strapi:', JSON.stringify(articleData, null, 2));
    
    const res = await apiClient.put<StrapiResponse<StrapiEntity<any>>>(`/api/articles/${id}`, wrapStrapiData(articleData));
    
    return transformArticle(unwrapStrapiResponse(res.data));
}

export async function deleteArticle(id: number): Promise<void> {
    // SECURITY: userId берётся автоматически из ctx.state.user на бэкенде
    // Проверка владельца выполняется на сервере
    await apiClient.delete(`/api/articles/${id}`);
}

// comments
function transformComment(strapiComment: any): CommentDTO {
  // Try unwrap relation first
  const relAuthor = unwrapAuthor(strapiComment.author);
  // Fall back to flattened fields returned by backend comment.find
  const author_id = relAuthor?.id ?? strapiComment.author_id ?? null;
  const author_name = relAuthor?.username ?? strapiComment.author_name ?? 'Guest';
  
  // ВАЖНО: Правильно обрабатываем аватар - используем getStrapiMediaUrl для преобразования
  let author_avatar: string | null = null;
  if (relAuthor?.avatar) {
    // Если есть объект аватара из Strapi, используем getStrapiMediaUrl
    author_avatar = getStrapiMediaUrl(relAuthor.avatar) || null;
  } else if (strapiComment.author_avatar) {
    // Если уже есть строка URL, используем как есть
    author_avatar = strapiComment.author_avatar;
  }

  return {
    id: strapiComment.id,
    article_id: strapiComment.article?.data?.id || strapiComment.article?.id,
    parent_id: strapiComment.parent?.data?.id || strapiComment.parent?.id || null,
    author_id,
    author_name,
    author_avatar,
    text: strapiComment.text,
    created_at: strapiComment.createdAt || strapiComment.created_at,
    updated_at: strapiComment.updated_at_custom || strapiComment.updatedAt || strapiComment.updated_at,
    likes: strapiComment.likes_count || 0,
    dislikes: strapiComment.dislikes_count || 0,
    user_reaction: strapiComment.user_reaction || null
  };
}

export async function getArticleComments(articleId: number, userId?: number): Promise<CommentDTO[]> {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>(`/api/comments`, {
        params: {
          'filters[article][id][$eq]': articleId,
          populate: {
            author: {
              fields: ['id', 'username'],
              populate: {
                avatar: { fields: ['url'] }
              }
            },
            parent: { fields: ['id'] }
          }
        }
    });
    try {
      // Log first 3 raw items
      const sample = (res.data?.data || []).slice(0, 3);
      console.warn('🔵 getArticleComments raw sample:', sample);
    } catch {}

    const mapped = unwrapStrapiCollectionResponse(res.data).map(transformComment);
    try {
      console.warn('🔵 getArticleComments mapped sample:', mapped.slice(0, 3));
    } catch {}
    return mapped;
}

export async function createArticleComment(articleId: number, payload: { text: string; parent_id?: number | null }): Promise<CommentDTO> {
    // ВАЖНО: Добавляем populate для автора с аватаром в query параметрах URL
    // Для POST запросов в axios нужно добавлять query параметры в URL, а не в config.params
    const populateParams = new URLSearchParams({
        'populate[author][fields][0]': 'id',
        'populate[author][fields][1]': 'username',
        'populate[author][populate][avatar][fields][0]': 'url',
        'populate[parent][fields][0]': 'id'
    });
    
    const res = await apiClient.post<StrapiResponse<StrapiEntity<any>>>(`/api/comments?${populateParams.toString()}`, wrapStrapiData({
        text: payload.text,
        article: articleId,
        parent: payload.parent_id || null
    }));
    
    return transformComment(unwrapStrapiResponse(res.data));
}

export async function reactComment(commentId: number, reaction: 'like' | 'dislike'): Promise<CommentDTO> {
    const res = await apiClient.post<StrapiResponse<any>>(`/api/comments/${commentId}/react`, {
        reaction
    });
    
    return transformComment(res.data.data);
}

export async function updateComment(commentId: number, text: string): Promise<CommentDTO> {
    const res = await apiClient.put<StrapiResponse<StrapiEntity<any>>>(`/api/comments/${commentId}`, wrapStrapiData({
        text,
        updated_at_custom: new Date().toISOString()
    }));
    
    return transformComment(unwrapStrapiResponse(res.data));
}

export async function deleteComment(commentId: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/comments/${commentId}`);
}

// User stats and articles
export interface UserStats {
    articles_count: number
    comments_count: number
    join_date: string
}

export async function getUserStats(): Promise<UserStats> {
    try {
        // Подсчитываем опубликованные статьи пользователя
    const articlesRes = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles', {
      params: {
        'filters[author][id][$eq]': '$USER_ID', // Will be replaced by backend
            'filters[publishedAt][$notNull]': true, // Только опубликованные
            'pagination[limit]': 1, // Минимальный limit для получения total
            'pagination[withCount]': true // ВАЖНО: запрашиваем total count
      }
    });
    
        const articles_count = articlesRes.data?.meta?.pagination?.total ?? 0;
        console.log('📊 [getUserStats] Articles count:', articles_count);
        
        // Подсчитываем комментарии пользователя
        const commentsRes = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/comments', {
          params: {
            'filters[author][id][$eq]': '$USER_ID', // Will be replaced by backend
            'pagination[limit]': 1,
            'pagination[withCount]': true // ВАЖНО: запрашиваем total count
          }
        });
        
        const comments_count = commentsRes.data?.meta?.pagination?.total ?? 0;
        console.log('💬 [getUserStats] Comments count:', comments_count);
        
        // Получаем дату регистрации из первого запроса (если есть данные)
        let join_date = new Date().toISOString();
        if (articlesRes.data?.data && Array.isArray(articlesRes.data.data) && articlesRes.data.data.length > 0) {
          try {
            const firstArticle = unwrapStrapiEntity(articlesRes.data.data[0]);
            if (firstArticle?.createdAt || firstArticle?.created_at) {
              join_date = firstArticle.createdAt || firstArticle.created_at;
            }
          } catch (err) {
            console.warn('⚠️ [getUserStats] Could not extract join date from first article:', err);
          }
        }
        
        const stats = {
            articles_count,
            comments_count,
            join_date
        };
        
        console.log('✅ [getUserStats] Stats:', stats);
        return stats;
    } catch (error: any) {
        console.error('❌ [getUserStats] Error:', error);
        // Возвращаем дефолтные значения при ошибке
    return {
            articles_count: 0,
        comments_count: 0,
        join_date: new Date().toISOString()
    };
    }
}

export async function getUserArticles(skip: number = 0, limit: number = 100): Promise<UserArticle[]> {
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
          pagination: { start: skip, limit }
        }
    });
    
    // Преобразуем Article в UserArticle формат
    return unwrapStrapiCollectionResponse(res.data).map((article: any): UserArticle => {
        const transformed = transformArticle(article);
        return {
            id: transformed.id,
            title: transformed.title,
            content: transformed.content,
            excerpt: transformed.excerpt,
            author: transformed.author.username, // ВАЖНО: преобразуем author объект в строку (username)
            author_avatar: transformed.author.avatar || undefined, // Сохраняем аватар отдельно
            tags: transformed.tags,
            created_at: transformed.created_at || transformed.createdAt,
            updated_at: transformed.updatedAt,
            status: transformed.status,
            likes: transformed.likes,
            dislikes: transformed.dislikes,
            comments_count: transformed.comments_count || transformed.commentsCount,
            user_reaction: transformed.user_reaction || transformed.userReaction,
            preview_image: transformed.preview_image || transformed.previewImage,
            difficulty: transformed.difficulty
        };
    });
}

export async function getArticleForEdit(id: number): Promise<Article> {
    return getArticle(id);
}

// Public user profile functions
export interface PublicUser {
    id: number
    username: string
    avatar?: string | null
    created_at: string
}

export async function getPublicUserProfile(userId: number): Promise<PublicUser> {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>>>(`/api/users/${userId}`, {
      params: {
        populate: {
          avatar: { fields: ['url'] }
        }
      }
    });
    
    const user = unwrapStrapiResponse(res.data);
    return {
      id: user.id,
      username: user.username,
      avatar: getStrapiMediaUrl(user.avatar),
      created_at: user.createdAt || user.created_at
    };
}

export async function getPublicUserStats(userId: number): Promise<UserStats> {
    try {
        // Подсчитываем опубликованные статьи пользователя
        const articlesRes = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles', {
          params: {
            'filters[author][id][$eq]': userId,
            'filters[publishedAt][$notNull]': true, // Только опубликованные
            'pagination[limit]': 1,
            'pagination[withCount]': true // ВАЖНО: запрашиваем total count
          }
        });
        
        const articles_count = articlesRes.data?.meta?.pagination?.total ?? 0;
        console.log('📊 [getPublicUserStats] Articles count for user', userId, ':', articles_count);
        
        // Подсчитываем комментарии пользователя
        const commentsRes = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/comments', {
          params: {
            'filters[author][id][$eq]': userId,
            'pagination[limit]': 1,
            'pagination[withCount]': true // ВАЖНО: запрашиваем total count
          }
        });
        
        const comments_count = commentsRes.data?.meta?.pagination?.total ?? 0;
        console.log('💬 [getPublicUserStats] Comments count for user', userId, ':', comments_count);
        
        // Получаем дату регистрации из профиля пользователя
        let join_date = new Date().toISOString();
        try {
          const userProfile = await getPublicUserProfile(userId);
          if (userProfile.created_at) {
            join_date = userProfile.created_at;
          }
        } catch (err) {
          console.warn('⚠️ [getPublicUserStats] Could not fetch user profile for join date:', err);
          // Если не удалось получить профиль, используем дату из первой статьи
          if (articlesRes.data?.data && Array.isArray(articlesRes.data.data) && articlesRes.data.data.length > 0) {
            try {
              const firstArticle = unwrapStrapiEntity(articlesRes.data.data[0]);
              if (firstArticle?.createdAt || firstArticle?.created_at) {
                join_date = firstArticle.createdAt || firstArticle.created_at;
              }
            } catch (unwrapErr) {
              console.warn('⚠️ [getPublicUserStats] Could not extract join date from first article:', unwrapErr);
            }
          }
        }
        
        const stats = {
            articles_count,
            comments_count,
            join_date
        };
        
        console.log('✅ [getPublicUserStats] Stats for user', userId, ':', stats);
        return stats;
    } catch (error: any) {
        console.error('❌ [getPublicUserStats] Error for user', userId, ':', error);
        // Возвращаем дефолтные значения при ошибке
        return {
            articles_count: 0,
            comments_count: 0,
            join_date: new Date().toISOString()
        };
    }
}

export async function getPublicUserArticles(userId: number, skip: number = 0, limit: number = 100, viewerUserId?: number): Promise<UserArticle[]> {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/articles', {
        params: { 
          'filters[author][id][$eq]': userId,
          'filters[publishedAt][$notNull]': true,
          populate: {
            author: {
              fields: ['id', 'username'],
              populate: {
                avatar: { fields: ['url'] }
              }
            },
            preview_image: { fields: ['url'] }
          },
          pagination: { start: skip, limit }
        }
    });
    
    // Преобразуем Article в UserArticle формат
    return unwrapStrapiCollectionResponse(res.data).map((article: any): UserArticle => {
        const transformed = transformArticle(article);
        return {
            id: transformed.id,
            title: transformed.title,
            content: transformed.content,
            excerpt: transformed.excerpt,
            author: transformed.author.username, // ВАЖНО: преобразуем author объект в строку (username)
            author_avatar: transformed.author.avatar || undefined, // Сохраняем аватар отдельно
            tags: transformed.tags,
            created_at: transformed.created_at || transformed.createdAt,
            updated_at: transformed.updatedAt,
            status: transformed.status,
            likes: transformed.likes,
            dislikes: transformed.dislikes,
            comments_count: transformed.comments_count || transformed.commentsCount,
            user_reaction: transformed.user_reaction || transformed.userReaction,
            preview_image: transformed.preview_image || transformed.previewImage,
            difficulty: transformed.difficulty
        };
    });
}

// Admin stubs
export async function fetchReportedArticles(): Promise<Array<{ id: number; title: string; reportReason: string }>> {
    return [];
}

export async function fetchReportedComments(): Promise<Array<{ id: number; content: string; reportReason: string }>> {
    return [];
}

export async function fetchReportedProfiles(): Promise<Array<{ id: number; nickname: string; reportReason: string }>> {
    return [];
}

// Bookmarks
export interface BookmarkResponse {
    is_bookmarked: boolean
    was_added: boolean
    article_id: number
}

export async function toggleBookmark(articleId: number): Promise<BookmarkResponse> {
    const res = await apiClient.post<StrapiResponse<BookmarkResponse>>(`/api/articles/${articleId}/bookmark`);
    return res.data.data;
}

export async function checkBookmark(articleId: number): Promise<BookmarkResponse> {
    const res = await apiClient.get<StrapiResponse<BookmarkResponse>>(`/api/articles/${articleId}/bookmark`);
    return res.data.data;
}

export async function getBookmarkedArticles(skip: number = 0, limit: number = 100): Promise<Article[]> {
    const res = await apiClient.get<StrapiResponse<StrapiEntity<any>[]>>('/api/bookmarks', {
        params: { skip, limit }
    });
    
    return unwrapStrapiCollectionResponse(res.data).map(transformArticle);
}

// Upload preview image
export interface PreviewUploadResponse {
    id: number
    url: string
}

export async function uploadPreviewImage(file: File): Promise<number> {
    const formData = new FormData();
    formData.append('files', file);
    
    const res = await apiClient.post<PreviewUploadResponse[]>('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    // ВАЖНО: Strapi upload возвращает массив файлов, нужен ID (число) для relation
    const uploadedFile = res.data[0];
    if (!uploadedFile || !uploadedFile.id) {
        throw new Error('Upload failed: no file ID returned');
    }
    
    // Возвращаем ID файла (число) для Strapi media relation
    return uploadedFile.id;
}
