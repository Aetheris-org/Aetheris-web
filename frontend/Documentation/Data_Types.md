# ТИПЫ ДАННЫХ ДЛЯ BACKEND

## ПОЛЬЗОВАТЕЛЬ

```typescript
interface User {
  id: number
  username: string
  email: string
  avatar?: string
  firstName?: string
  lastName?: string
  bio?: string
  createdAt: string | Date
  updatedAt?: string | Date
  lastLoginAt?: string | Date
}
```

## СТАТЬЯ

```typescript
interface Article {
  id: number
  title: string
  content: string
  excerpt?: string
  author: User
  tags: string[]
  createdAt: string | Date
  updatedAt?: string | Date
  publishedAt?: string | Date
  status: 'draft' | 'published' | 'archived'
  views?: number
  likes?: number
  dislikes?: number
  comments?: number
  commentsCount?: number
  featured?: boolean
  category?: string
  readingTime?: number
}
```

## КОММЕНТАРИЙ

```typescript
interface Comment {
  id: number
  content: string
  author: User
  articleId: number
  createdAt: string | Date
  updatedAt?: string | Date
  parentId?: number  // Для ответов на комментарии
}
```

## ЗАПРОСЫ

### Регистрация
```typescript
interface RegisterRequest {
  nickname: string
  email: string
  password: string
}
```

### Авторизация
```typescript
interface LoginRequest {
  login: string  // nickname or email
  password: string
}
```

### Создание статьи
```typescript
interface CreateArticleRequest {
  title: string
  content: string
  excerpt?: string
  tags: string[]
  status: 'draft' | 'published'
  category?: string
}
```

### Фильтры статей
```typescript
interface ArticleFilters {
  authorId?: number
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
  category?: string
  search?: string
  dateFrom?: string | Date
  dateTo?: string | Date
  featured?: boolean
}
```

### Пагинация
```typescript
interface PaginationParams {
  page: number
  limit: number  // 10 для стандартного отображения, 20-25 для списка
  sortBy: string
  sortOrder: 'asc' | 'desc'
}
```

## ОТВЕТЫ API

### Стандартный ответ
```typescript
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string>
}
```

### Список статей
```typescript
interface ArticlesResponse {
  articles: Article[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}
```

### Валидация
```typescript
interface ValidationResult {
  isValid: boolean
  message: string
}
```
