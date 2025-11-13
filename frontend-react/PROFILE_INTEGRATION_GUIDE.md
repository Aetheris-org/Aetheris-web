# 📋 Гайд по интеграции реальных данных для ProfilePage

## 🎯 Цель

Этот документ описывает, как заменить мок-данные на реальные данные из Strapi backend для страницы профиля (`ProfilePage.tsx`).

## 📦 Текущее состояние

Страница профиля сейчас использует:
- ✅ **Реальные данные**: Основная информация пользователя, статьи, статистика
- ⚠️ **Мок-данные**: Комментарии и закладки (из `src/data/mockProfileData.tsx`)

## 🔧 Шаг 1: Backend (Strapi)

### 1.1. Добавить методы для получения комментариев пользователя

**Файл**: `backend/strapi-backend/src/api/profile/controllers/profile.ts`

```typescript
async getUserComments(ctx) {
  const userId = Number(ctx.params.id)
  
  if (!userId || Number.isNaN(userId)) {
    return ctx.badRequest('Invalid user ID')
  }

  const comments = await strapi.entityService.findMany('api::comment.comment', {
    filters: { author: userId },
    populate: {
      article: {
        fields: ['title', 'documentId'],
      },
    },
    sort: [{ createdAt: 'desc' }],
    limit: 50,
    fields: ['id', 'text', 'createdAt'],
  })

  // Подсчитываем лайки для каждого комментария
  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      const likesCount = await strapi.entityService.count('api::comment-reaction.comment-reaction', {
        filters: { 
          comment: comment.id,
          reaction: 'like',
        },
      })
      return {
        id: comment.id,
        documentId: comment.documentId,
        text: comment.text,
        article: comment.article,
        createdAt: comment.createdAt,
        likes: likesCount,
      }
    })
  )

  return ctx.send({ data: commentsWithLikes })
}
```

### 1.2. Добавить методы для получения закладок пользователя

**Файл**: `backend/strapi-backend/src/api/profile/controllers/profile.ts`

```typescript
async getUserBookmarks(ctx) {
  const userId = Number(ctx.params.id)
  
  if (!userId || Number.isNaN(userId)) {
    return ctx.badRequest('Invalid user ID')
  }

  const bookmarks = await strapi.entityService.findMany('api::article-bookmark.article-bookmark', {
    filters: { user: userId },
    populate: {
      article: {
        fields: ['title', 'documentId', 'excerpt', 'preview_image'],
        populate: {
          preview_image: {
            fields: ['url'],
          },
        },
      },
    },
    sort: [{ createdAt: 'desc' }],
    limit: 50,
    fields: ['id', 'createdAt'],
  })

  const bookmarksData = bookmarks.map((bookmark) => ({
    id: bookmark.id,
    documentId: bookmark.documentId,
    article: bookmark.article,
    createdAt: bookmark.createdAt,
  }))

  return ctx.send({ data: bookmarksData })
}
```

### 1.3. Добавить роуты

**Файл**: `backend/strapi-backend/src/api/profile/routes/profile.ts`

```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/profile/:id',
      handler: 'profile.findOne',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/profile/:id/comments',
      handler: 'profile.getUserComments',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/profile/:id/bookmarks',
      handler: 'profile.getUserBookmarks',
      config: { auth: true }, // Только владелец может видеть свои закладки
    },
  ],
}
```

## 🔧 Шаг 2: Frontend API

### 2.1. Добавить типы

**Файл**: `frontend-react/src/types/profile.ts`

```typescript
export interface ProfileComment {
  id: string
  documentId?: string
  articleTitle: string
  articleId: string
  excerpt: string
  publishedAt: string
  likes?: number
}

export interface ProfileBookmark {
  id: string
  documentId?: string
  title: string
  description: string
  articleId: string
}
```

### 2.2. Добавить API функции

**Файл**: `frontend-react/src/api/profile.ts`

```typescript
export async function getUserComments(userId: number): Promise<ProfileComment[]> {
  const response = await apiClient.get(`/api/profile/${userId}/comments`)
  const comments = response.data?.data ?? []
  
  return comments.map((comment: any) => ({
    id: comment.documentId || String(comment.id),
    documentId: comment.documentId,
    articleTitle: comment.article?.title || 'Статья удалена',
    articleId: comment.article?.documentId || String(comment.article?.id),
    excerpt: comment.text?.substring(0, 150) + (comment.text?.length > 150 ? '...' : ''),
    publishedAt: comment.createdAt,
    likes: comment.likes || 0,
  }))
}

export async function getUserBookmarks(userId: number): Promise<ProfileBookmark[]> {
  const response = await apiClient.get(`/api/profile/${userId}/bookmarks`, {
    headers: {
      'X-Require-Auth': 'true',
    },
  })
  const bookmarks = response.data?.data ?? []
  
  return bookmarks.map((bookmark: any) => ({
    id: bookmark.documentId || String(bookmark.id),
    documentId: bookmark.documentId,
    title: bookmark.article?.title || 'Статья удалена',
    description: bookmark.article?.excerpt || bookmark.article?.content?.substring(0, 100) + '...' || '',
    articleId: bookmark.article?.documentId || String(bookmark.article?.id),
  }))
}
```

## 🔧 Шаг 3: Обновить ProfilePage

### 3.1. Заменить мок-данные на реальные запросы

**Файл**: `frontend-react/src/pages/ProfilePage.tsx`

```typescript
// Убрать импорт моков
// import { mockProfileComments, mockProfileBookmarks } from '@/data/mockProfileData'

// Добавить импорт API функций
import { getUserComments, getUserBookmarks } from '@/api/profile'
import type { ProfileComment, ProfileBookmark } from '@/types/profile'

// В компоненте ProfilePage добавить:

// Загрузка комментариев (только при открытии вкладки)
const {
  data: comments = [],
  isLoading: isLoadingComments,
} = useQuery({
  queryKey: ['profile-comments', profileId],
  queryFn: () => getUserComments(profileId!),
  enabled: !!profileId,
  staleTime: 60000, // Кешировать 1 минуту
})

// Загрузка закладок (только для своего профиля)
const {
  data: bookmarks = [],
  isLoading: isLoadingBookmarks,
} = useQuery({
  queryKey: ['profile-bookmarks', profileId],
  queryFn: () => getUserBookmarks(profileId!),
  enabled: !!profileId && isOwnProfile,
  staleTime: 60000,
})

// Заменить в JSX:
// <CommentsTab comments={mockProfileComments} ... />
// на:
// <CommentsTab comments={comments} isLoading={isLoadingComments} ... />
```

### 3.2. Обновить компоненты для поддержки загрузки

```typescript
function CommentsTab({ 
  comments, 
  isLoading,
  onArticleClick 
}: { 
  comments: ProfileComment[]
  isLoading?: boolean
  onArticleClick: (id: string) => void 
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // ... остальной код
}
```

## 🗑️ Шаг 4: Удаление мок-данных

После успешной интеграции:

1. ✅ Удалить файл `src/data/mockProfileData.tsx`
2. ✅ Убрать импорты мок-данных из `ProfilePage.tsx`
3. ✅ Удалить этот гайд (или оставить как референс)

## 🧪 Тестирование

1. **Комментарии**:
   - Откройте профиль пользователя с комментариями
   - Проверьте, что комментарии загружаются
   - Проверьте навигацию по клику на статью

2. **Закладки**:
   - Войдите в аккаунт
   - Добавьте несколько закладок
   - Откройте свой профиль → вкладка "Закладки"
   - Проверьте, что закладки отображаются

3. **Мобильная версия**:
   - Проверьте на разных размерах экрана
   - Убедитесь, что вкладки удобно переключаются

## 🚀 Оптимизация (опционально)

1. **Lazy loading**: Загружать комментарии/закладки только при открытии вкладки
2. **Пагинация**: Добавить "Показать ещё" для больших списков
3. **Кеширование**: Использовать React Query для кеширования данных

## 📝 Дополнительные заметки

- Комментарии показываются всем пользователям (публичные)
- Закладки показываются только владельцу профиля (приватные)
- Если статья удалена, показывается "Статья удалена" и ссылка не работает
- Все данные кешируются через React Query для лучшей производительности

