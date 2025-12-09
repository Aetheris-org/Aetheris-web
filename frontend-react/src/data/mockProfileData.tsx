/**
 * ⚠️ ВРЕМЕННЫЕ МОК-ДАННЫЕ
 * Этот файл содержит временные мок-данные для разработки.
 * В будущем будет заменен на реальные API запросы к KeystoneJS backend.
 * TODO: Заменить на GraphQL запросы к backend
 * 
 * МОК-ДАННЫЕ ДЛЯ СТРАНИЦЫ ПРОФИЛЯ
 * 
 * ⚠️ ВАЖНО: Эти данные используются только для демонстрации UI/UX.
 * 
 * 📋 ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ С БД:
 * 
 * 1. КОММЕНТАРИИ (MockProfileComment):
 *    - Текущий API: GET /api/articles/:documentId/comments уже существует
 *    - Добавить в backend (Strapi):
 *      * В контроллере profile.ts добавить метод `getUserComments(userId)`
 *      * Использовать `strapi.entityService.findMany('api::comment.comment', { filters: { author: userId } })`
 *      * Вернуть массив комментариев с полями: id, text, article (с title, documentId), createdAt, likes_count
 *    - На фронтенде:
 *      * Обновить getUserProfile() в api/profile.ts, добавить поле comments
 *      * Или создать отдельный endpoint: GET /api/profile/:id/comments
 *      * Заменить mockProfileComments на реальные данные из API
 * 
 * 2. ЗАКЛАДКИ (MockProfileBookmark):
 *    - Текущий API: article-bookmark content type уже существует
 *    - Добавить в backend:
 *      * В контроллере profile.ts добавить метод `getUserBookmarks(userId)`
 *      * Использовать `strapi.entityService.findMany('api::article-bookmark.article-bookmark', { filters: { user: userId }, populate: { article: true } })`
 *      * Вернуть массив закладок с полями: id, article (с title, documentId, excerpt/preview)
 *    - На фронтенде:
 *      * Обновить getUserProfile() в api/profile.ts, добавить поле bookmarks
 *      * Или создать отдельный endpoint: GET /api/profile/:id/bookmarks
 *      * Заменить mockProfileBookmarks на реальные данные из API
 * 
 * 3. ТИПЫ ДАННЫХ:
 *    - Расширить UserProfile в types/profile.ts:
 *      * Добавить comments?: ProfileComment[]
 *      * Добавить bookmarks?: ProfileBookmark[]
 *    - Или использовать отдельные запросы через useQuery для каждой вкладки
 * 
 * 4. ОПТИМИЗАЦИЯ:
 *    - Использовать lazy loading для комментариев/закладок (загружать только при открытии вкладки)
 *    - Добавить пагинацию для больших списков
 *    - Кешировать данные через React Query
 * 
 * 5. УДАЛЕНИЕ МОКОВ:
 *    - После подключения реальных данных удалить этот файл
 *    - Убрать импорты mockProfileComments/mockProfileBookmarks из ProfilePage.tsx
 *    - Обновить типы, убрав приставку "Mock"
 * 
 * 📝 ПРИМЕР ИНТЕГРАЦИИ В Backend (Strapi):
 * 
 * ```typescript
 * // backend/strapi-backend/src/api/profile/controllers/profile.ts
 * 
 * async getUserComments(ctx) {
 *   const userId = Number(ctx.params.id)
 *   const comments = await strapi.entityService.findMany('api::comment.comment', {
 *     filters: { author: userId },
 *     populate: {
 *       article: {
 *         fields: ['title', 'documentId'],
 *       },
 *     },
 *     sort: [{ createdAt: 'desc' }],
 *     limit: 50,
 *   })
 *   return ctx.send({ data: comments })
 * }
 * ```
 * 
 * 📝 ПРИМЕР ИНТЕГРАЦИИ НА Frontend:
 * 
 * ```typescript
 * // frontend-react/src/api/profile.ts
 * 
 * export async function getUserComments(userId: number): Promise<ProfileComment[]> {
 *   const response = await apiClient.get(`/api/profile/${userId}/comments`)
 *   return response.data.data.map(transformComment)
 * }
 * 
 * // frontend-react/src/pages/ProfilePage.tsx
 * 
 * const { data: comments } = useQuery({
 *   queryKey: ['profile-comments', profileId],
 *   queryFn: () => getUserComments(profileId!),
 *   enabled: !!profileId && activeTab === 'comments',
 * })
 * ```
 */

export interface MockProfileComment {
  id: string
  articleTitle: string
  articleId: string
  excerpt: string
  publishedAt: string
  likes?: number
}

export interface MockProfileBookmark {
  id: string
  title: string
  description: string
  articleId: string
}

export const mockProfileComments: MockProfileComment[] = [
  {
    id: 'comment-1',
    articleTitle: 'Designing quiet spaces inside loud products',
    articleId: 'mock-article-1',
    excerpt: 'Отличная статья! Особенно понравилась часть про снижение усталости от уведомлений. Обязательно попробую применить в нашем проекте.',
    publishedAt: '2025-03-11T10:00:00.000Z',
    likes: 12,
  },
  {
    id: 'comment-2',
    articleTitle: 'Rebuilding editorial rhythm with mindful tooling',
    articleId: 'mock-article-2',
    excerpt: 'Мы применили вашу модель к нашему календарю контента и сразу увидели улучшение морального духа команды. Спасибо за чек-лист!',
    publishedAt: '2025-02-22T09:15:00.000Z',
    likes: 8,
  },
  {
    id: 'comment-3',
    articleTitle: 'Getting Started with React and TypeScript',
    articleId: 'mock-article-3',
    excerpt: 'Полезный туториал для начинающих. Было бы здорово добавить раздел про практические примеры.',
    publishedAt: '2025-01-30T21:45:00.000Z',
  },
]

export const mockProfileBookmarks: MockProfileBookmark[] = [
  {
    id: 'bookmark-1',
    title: 'Typography tuning in Strapi + shadcn',
    description: 'Отличная статья о том, как синхронизировать модульные шкалы с токенами темизации.',
    articleId: 'ref-typography',
  },
  {
    id: 'bookmark-2',
    title: 'Motion safety checklist',
    description: 'Сборник эвристик для создания доступных анимаций при вестибулярных расстройствах.',
    articleId: 'ref-motion',
  },
  {
    id: 'bookmark-3',
    title: 'Design Systems Best Practices',
    description: 'Руководство по созданию масштабируемых дизайн-систем для больших команд.',
    articleId: 'ref-design-systems',
  },
]

// Дополнительные мок-данные для восстановленных блоков

/**
 * 📊 AUDIENCE INSIGHTS (Аналитика аудитории):
 * - Текущий API: не существует, нужно создать
 * - Добавить в backend (Strapi):
 *   * В контроллере profile.ts добавить метод `getAudienceInsights(userId)`
 *   * Агрегировать данные из статей пользователя:
 *     - Просмотры статей: сумма views всех статей
 *     - Уникальные читатели: подсчет уникальных user_id из просмотров
 *     - Время чтения: среднее время чтения статей
 *     - Дочитываемость: процент прочитанных до конца статей
 *   * Вернуть метрики с изменениями по сравнению с предыдущим периодом
 * - На фронтенде:
 *   * Обновить getUserProfile() в api/profile.ts, добавить поле audienceInsights
 *   * Или создать отдельный endpoint: GET /api/profile/:id/insights
 *   * Заменить mockAudienceInsights на реальные данные из API
 */
export interface MockAudienceInsight {
  metric: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * 🎨 CONTENT MIX (Распределение контента):
 * - Текущий API: не существует, нужно создать
 * - Добавить в backend (Strapi):
 *   * В контроллере profile.ts добавить метод `getContentMix(userId)`
 *   * Агрегировать данные из статей пользователя:
 *     - Подсчитать количество статей по каждому тегу
 *     - Рассчитать процент от общего количества статей
 *   * Вернуть массив тегов с количеством и процентом
 * - На фронтенде:
 *   * Обновить getUserProfile() в api/profile.ts, добавить поле contentMix
 *   * Или создать отдельный endpoint: GET /api/profile/:id/content-mix
 *   * Заменить mockContentMix на реальные данные из API
 */
export interface MockContentMix {
  tag: string
  count: number
  percentage: number
}

/**
 * 📝 ACTIVITY FEED (Лента активности):
 * - Текущий API: не существует, нужно создать
 * - Добавить в backend (Strapi):
 *   * В контроллере profile.ts добавить метод `getActivityFeed(userId)`
 *   * Собрать данные из различных источников:
 *     - Статьи: последние опубликованные статьи
 *     - Комментарии: последние оставленные комментарии
 *     - Реакции: последние полученные реакции (лайки)
 *     - Закладки: последние добавленные закладки
 *   * Вернуть отсортированный по времени массив активностей
 * - На фронтенде:
 *   * Обновить getUserProfile() в api/profile.ts, добавить поле activityFeed
 *   * Или создать отдельный endpoint: GET /api/profile/:id/activity
 *   * Заменить mockActivityFeed на реальные данные из API
 */
export interface MockActivityItem {
  id: string
  type: 'article' | 'comment' | 'reaction' | 'bookmark'
  title: string
  timestamp: string
  icon: string
}

/**
 * 🎯 CREATOR GOALS (Цели создателя):
 * - Текущий API: не существует, нужно создать
 * - Добавить в backend (Strapi):
 *   * Создать content type `creator-goal` с полями: title, description, target, progress, completed
 *   * В контроллере profile.ts добавить метод `getCreatorGoals(userId)`
 *   * Вернуть массив целей пользователя с текущим прогрессом
 *   * Прогресс может рассчитываться автоматически на основе статистики:
 *     - Количество статей: из stats.publishedArticles
 *     - Количество подписчиков: из followers (если есть)
 *     - Уровень: из gamification store
 * - На фронтенде:
 *   * Обновить getUserProfile() в api/profile.ts, добавить поле creatorGoals
 *   * Или создать отдельный endpoint: GET /api/profile/:id/goals
 *   * Заменить mockCreatorGoals на реальные данные из API
 */
export interface MockCreatorGoal {
  id: string
  title: string
  description: string
  progress: number
  target: number
  completed: boolean
}

/**
 * ⚡ QUICK ACTIONS (Быстрые действия):
 * - Текущий API: не требуется, это статические действия
 * - На фронтенде:
 *   * Можно сделать динамическим, добавив в настройки пользователя
 *   * Или оставить статическим, как сейчас
 *   * Заменить mockQuickActions на настраиваемые действия из настроек пользователя
 */
export interface MockQuickAction {
  id: string
  label: string
  icon: string
  href: string
  variant: 'default' | 'outline' | 'secondary'
}

/**
 * 📌 PINNED COLLECTIONS (Закрепленные коллекции):
 * - Текущий API: не существует, нужно создать
 * - Добавить в backend (Strapi):
 *   * Создать content type `collection` с полями: title, description, articles (relation), pinned
 *   * В контроллере profile.ts добавить метод `getPinnedCollections(userId)`
 *   * Вернуть закрепленные коллекции пользователя с количеством статей
 * - На фронтенде:
 *   * Обновить getUserProfile() в api/profile.ts, добавить поле pinnedCollections
 *   * Или создать отдельный endpoint: GET /api/profile/:id/collections
 *   * Заменить mockPinnedCollections на реальные данные из API
 */
export interface MockPinnedCollection {
  id: string
  title: string
  description: string
  articleCount: number
  href: string
}

export const mockAudienceInsights: MockAudienceInsight[] = [
  {
    metric: 'Просмотры статей',
    value: 12450,
    change: 12.5,
    trend: 'up',
  },
  {
    metric: 'Уникальные читатели',
    value: 3240,
    change: 8.3,
    trend: 'up',
  },
  {
    metric: 'Время чтения',
    value: 245,
    change: -2.1,
    trend: 'down',
  },
  {
    metric: 'Дочитываемость',
    value: 68,
    change: 5.2,
    trend: 'up',
  },
]

export const mockContentMix: MockContentMix[] = [
  { tag: 'react', count: 12, percentage: 35 },
  { tag: 'frontend', count: 8, percentage: 24 },
  { tag: 'typescript', count: 6, percentage: 18 },
  { tag: 'design', count: 5, percentage: 15 },
  { tag: 'tutorial', count: 3, percentage: 8 },
]

export const mockActivityFeed: MockActivityItem[] = [
  {
    id: 'activity-1',
    type: 'article',
    title: 'Published article "Deep dive into Strapi v5"',
    timestamp: '2025-03-15T10:30:00Z',
    icon: 'NotebookPen',
  },
  {
    id: 'activity-2',
    type: 'comment',
    title: 'Left a comment on "React and TypeScript"',
    timestamp: '2025-03-14T15:20:00Z',
    icon: 'MessageSquare',
  },
  {
    id: 'activity-3',
    type: 'reaction',
    title: 'Received 25 likes on "Vue vs React"',
    timestamp: '2025-03-13T09:15:00Z',
    icon: 'Heart',
  },
  {
    id: 'activity-4',
    type: 'bookmark',
    title: 'Bookmarked: "Design Systems Best Practices"',
    timestamp: '2025-03-12T14:45:00Z',
    icon: 'Bookmark',
  },
  {
    id: 'activity-5',
    type: 'article',
    title: 'Published "Building responsive UI with Shadcn/ui"',
    timestamp: '2025-03-11T11:00:00Z',
    icon: 'NotebookPen',
  },
]

export const mockCreatorGoals: MockCreatorGoal[] = [
  {
    id: 'goal-1',
    title: 'Publish 50 articles',
    description: 'Current progress: 34 of 50',
    progress: 34,
    target: 50,
    completed: false,
  },
  {
    id: 'goal-2',
    title: 'Reach 1000 followers',
    description: 'Current progress: 756 of 1000',
    progress: 756,
    target: 1000,
    completed: false,
  },
  {
    id: 'goal-3',
    title: 'Reach level 20',
    description: 'Current progress: level 15',
    progress: 15,
    target: 20,
    completed: false,
  },
]

export const mockQuickActions: MockQuickAction[] = [
  {
    id: 'action-1',
    label: 'Create article',
    icon: 'PenSquare',
    href: '/create',
    variant: 'default',
  },
  {
    id: 'action-2',
    label: 'Profile settings',
    icon: 'Settings',
    href: '/settings/profile',
    variant: 'outline',
  },
  {
    id: 'action-3',
    label: 'My drafts',
    icon: 'FileEdit',
    href: '/drafts',
    variant: 'outline',
  },
]

export const mockPinnedCollections: MockPinnedCollection[] = [
  {
    id: 'collection-1',
    title: 'React Tutorials',
    description: 'Сборник статей по React',
    articleCount: 12,
    href: '/collections/react-tutorials',
  },
  {
    id: 'collection-2',
    title: 'Design Systems',
    description: 'Статьи о дизайн-системах',
    articleCount: 8,
    href: '/collections/design-systems',
  },
]

