export interface Author {
    id: number
    username: string
}

export interface Article {
    id: number
    title: string
    content: string
    excerpt?: string
    author: {
        id: number
        username: string
        avatar?: string
    }
    tags: string[]
    createdAt: string
    updatedAt?: string
    status: 'draft' | 'published' | 'archived'
    likes?: number
    dislikes?: number
    commentsCount?: number
    userReaction?: 'like' | 'dislike' | null
    isBookmarked?: boolean  // Флаг закладки (из backend)
    previewImage?: string
    difficulty?: string
    author_id?: number  // ID автора для навигации к профилю (из backend)
    views?: number  // Количество просмотров статьи
}

// Type for articles from user profile API (uses snake_case)
export interface UserArticle {
    id: number
    title: string
    content: string
    excerpt?: string
    author: string  // Backend stores author as string (username)
    author_avatar?: string  // Avatar URL для автора статьи
    tags: string[]
    created_at: string  // Backend uses snake_case
    updated_at?: string
    status: 'draft' | 'published' | 'archived'
    likes?: number
    dislikes?: number
    comments_count?: number  // Backend uses snake_case
    user_reaction?: 'like' | 'dislike' | null  // Backend uses snake_case
    preview_image?: string  // Backend uses snake_case
    difficulty?: string
}

export interface ArticleCardProps {
    article: Article
}

export interface ArticleCardEmits {
    tagClick: [tag: string]
    authorClick: [authorId: number]
    articleClick: [articleId: number]
    articleDeleted: [articleId: number]
    deleteArticle: [article: { id: number; title: string }]
    editArticle: [article: { id: number; title: string }]
    reportArticle: [article: { id: number; title: string }]
    shareArticle: [article: { id: number; title: string }]
}

export interface ArticlesResponse {
    articles: Article[]
    total: number
}

export interface CreateArticleRequest {
    title: string;
    content: string;
    excerpt?: string;
    tags: string[];
    status: string;
    preview_image?: number | null;  // ВАЖНО: ID файла (число), а не URL (строка)
    difficulty?: string;
    // SECURITY: author НЕ включается - бэкенд автоматически устанавливает его из токена
}
