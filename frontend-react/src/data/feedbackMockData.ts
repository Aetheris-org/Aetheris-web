/**
 * FEEDBACK MOCK DATA
 * ===================
 * 
 * This file contains mock data for the feedback system (bug reports and feature requests).
 * 
 * BACKEND INTEGRATION GUIDE:
 * ==========================
 * 
 * 1. CREATE STRAPI CONTENT TYPES:
 *    - Create a "feedback" content type in Strapi with fields:
 *      * id (UID, required)
 *      * type (Enumeration: 'bug' | 'feature', required)
 *      * title (Text, required)
 *      * description (Rich Text or Long Text, required)
 *      * stepsToReproduce (Long Text, optional - only for bug reports)
 *      * status (Enumeration: 'open' | 'in-progress' | 'resolved' | 'rejected', default: 'open')
 *      * priority (Enumeration: 'low' | 'medium' | 'high' | 'critical', optional)
 *      * author (Relation: User, required)
 *      * createdAt (DateTime, required)
 *      * updatedAt (DateTime, required)
 *      * reactions (Component: FeedbackReaction[], optional - stores reaction counts)
 *      * tags (Relation: Tag[], optional)
 *      * attachments (Media[], optional)
 *      * relatedFeedback (Relation: Feedback[], optional - for linking related items)
 *      * assignedTo (Relation: User, optional - for admin assignment)
 *      * resolution (Text, optional - admin response)
 *      * resolvedAt (DateTime, optional)
 * 
 *    - Create a "feedback-reaction" component type:
 *      * type (Enumeration: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix', required)
 *      * count (Number, default: 0)
 * 
 *    - Create a "user-feedback-reaction" content type (join table):
 *      * user (Relation: User, required)
 *      * feedback (Relation: Feedback, required)
 *      * reactionType (Enumeration: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix', required)
 *      * createdAt (DateTime, required)
 * 
 * 2. CREATE API ENDPOINTS:
 *    In backend/strapi-backend/src/api/feedback/:
 *    - controllers/feedback.ts: 
 *      * GET /api/feedbacks (list all, with filters for type, status, etc.)
 *      * GET /api/feedbacks/:id (single feedback with reactions)
 *      * POST /api/feedbacks (create new feedback)
 *      * PUT /api/feedbacks/:id (update feedback - admin only)
 *      * DELETE /api/feedbacks/:id (delete feedback - admin or author)
 * 
 *    - controllers/feedback-reaction.ts:
 *      * POST /api/feedback-reactions (add/update user reaction)
 *      * DELETE /api/feedback-reactions/:id (remove user reaction)
 *      * GET /api/feedback-reactions/me (get user's reactions)
 * 
 * 3. UPDATE FRONTEND API LAYER:
 *    Create frontend-react/src/api/feedback.ts:
 *    ```typescript
 *    import { api } from './axios'
 * 
 *    export interface Feedback {
 *      id: string
 *      type: 'bug' | 'feature'
 *      title: string
 *      description: string
 *      status: 'open' | 'in-progress' | 'resolved' | 'rejected'
 *      priority?: 'low' | 'medium' | 'high' | 'critical'
 *      author: {
 *        id: string
 *        username: string
 *        avatar?: string
 *      }
 *      createdAt: string
 *      updatedAt: string
 *      reactions: {
 *        upvote: number
 *        downvote: number
 *        important: number
 *        duplicate: number
 *        wontfix: number
 *      }
 *      userReaction?: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix'
 *      tags?: string[]
 *      attachments?: Array<{ url: string; name: string }>
 *      relatedFeedback?: string[]
 *      assignedTo?: { id: string; username: string }
 *      resolution?: string
 *      resolvedAt?: string
 *    }
 * 
 *    export async function getFeedbacks(params?: {
 *      type?: 'bug' | 'feature'
 *      status?: string
 *      sort?: 'newest' | 'oldest' | 'most-voted' | 'priority'
 *      page?: number
 *      limit?: number
 *    }): Promise<{ data: Feedback[]; total: number }> {
 *      const { data } = await api.get('/api/feedbacks', { params })
 *      return data
 *    }
 * 
 *    export async function getFeedback(id: string): Promise<Feedback> {
 *      const { data } = await api.get(`/api/feedbacks/${id}?populate=*`)
 *      return data.data
 *    }
 * 
 *    export async function createFeedback(feedback: {
 *      type: 'bug' | 'feature'
 *      title: string
 *      description: string
 *      stepsToReproduce?: string // Optional, only for bugs
 *      priority?: 'low' | 'medium' | 'high' | 'critical'
 *      tags?: string[]
 *    }): Promise<Feedback> {
 *      const { data } = await api.post('/api/feedbacks', { data: feedback })
 *      return data.data
 *    }
 * 
 *    export async function addReaction(
 *      feedbackId: string,
 *      reactionType: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix'
 *    ): Promise<void> {
 *      await api.post('/api/feedback-reactions', {
 *        data: { feedback: feedbackId, reactionType }
 *      })
 *    }
 * 
 *    export async function removeReaction(feedbackId: string): Promise<void> {
 *      await api.delete(`/api/feedback-reactions/${feedbackId}`)
 *    }
 *    ```
 * 
 * 4. REPLACE MOCK DATA:
 *    - Remove this mock data file or keep it for development/testing
 *    - Replace useFeedbackMockData() with API calls using React Query:
 *    ```typescript
 *    const { data: feedbacks = [], isLoading } = useQuery({
 *      queryKey: ['feedbacks', type, status, sort],
 *      queryFn: () => getFeedbacks({ type, status, sort })
 *    })
 *    ```
 * 
 * 5. UPDATE REACTIONS:
 *    - Use mutations for adding/removing reactions:
 *    ```typescript
 *    const addReactionMutation = useMutation({
 *      mutationFn: ({ feedbackId, reactionType }) => addReaction(feedbackId, reactionType),
 *      onSuccess: () => {
 *        queryClient.invalidateQueries(['feedbacks'])
 *      }
 *    })
 *    ```
 * 
 * 6. ADD REAL-TIME UPDATES (optional):
 *    - Use Strapi's real-time features or polling to update feedbacks
 *    - Show notifications when feedback status changes
 * 
 * 7. REMOVE THIS COMMENT BLOCK once integration is complete.
 */

export type FeedbackType = 'bug' | 'feature'
export type FeedbackStatus = 'open' | 'in-progress' | 'resolved' | 'rejected'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'
export type ReactionType = 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix'

export interface FeedbackReactions {
  upvote: number
  downvote: number
  important: number
  duplicate: number
  wontfix: number
}

export interface FeedbackAuthor {
  id: string
  username: string
  avatar?: string
}

export interface Feedback {
  id: string
  type: FeedbackType
  title: string
  description: string
  status: FeedbackStatus
  priority?: FeedbackPriority
  author: FeedbackAuthor
  createdAt: string
  updatedAt: string
  reactions: FeedbackReactions
  userReaction?: ReactionType
  tags?: string[]
  views?: number
  commentsCount?: number
  stepsToReproduce?: string // Optional field for bug reports
}

// Mock data
export const mockBugs: Feedback[] = [
  {
    id: 'bug-1',
    type: 'bug',
    title: 'Проблема с отображением тегов на мобильных устройствах',
    description: 'На странице статей теги обрезаются и не отображаются полностью на экранах меньше 375px. Особенно заметно на iPhone SE.',
    stepsToReproduce: '1. Открыть любую статью на мобильном устройстве с шириной экрана меньше 375px\n2. Прокрутить до блока с тегами\n3. Наблюдать обрезание тегов справа',
    status: 'open',
    priority: 'medium',
    author: {
      id: 'user-1',
      username: 'dev_master',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev_master',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    reactions: {
      upvote: 24,
      downvote: 2,
      important: 8,
      duplicate: 0,
      wontfix: 0,
    },
    userReaction: 'upvote',
    tags: ['mobile', 'ui', 'tags'],
    views: 156,
    commentsCount: 5,
  },
  {
    id: 'bug-2',
    type: 'bug',
    title: 'Ошибка при сохранении черновика статьи',
    description: 'При попытке сохранить черновик статьи с большим количеством изображений (более 10) возникает ошибка 500. Консоль показывает проблему с размером payload.',
    stepsToReproduce: '1. Создать новую статью\n2. Добавить более 10 изображений в редактор\n3. Нажать "Сохранить в черновик"\n4. Ошибка 500 появляется в консоли',
    status: 'in-progress',
    priority: 'high',
    author: {
      id: 'user-2',
      username: 'content_creator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=content_creator',
    },
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    reactions: {
      upvote: 42,
      downvote: 1,
      important: 15,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['editor', 'drafts', 'backend'],
    views: 289,
    commentsCount: 12,
  },
  {
    id: 'bug-3',
    type: 'bug',
    title: 'Пагинация не работает после применения фильтров',
    description: 'После применения фильтров по тегам и сложности, пагинация перестает работать корректно - показывает неправильное количество страниц и не переключается.',
    stepsToReproduce: '1. Применить фильтр по тегу (например, "React")\n2. Применить фильтр по сложности (например, "medium")\n3. Попытаться переключиться на следующую страницу\n4. Пагинация не реагирует или показывает неправильное количество страниц',
    status: 'open',
    priority: 'high',
    author: {
      id: 'user-3',
      username: 'bug_hunter',
    },
    createdAt: '2024-01-13T08:45:00Z',
    updatedAt: '2024-01-13T08:45:00Z',
    reactions: {
      upvote: 18,
      downvote: 0,
      important: 6,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['pagination', 'filters', 'ui'],
    views: 98,
    commentsCount: 3,
  },
  {
    id: 'bug-4',
    type: 'bug',
    title: 'Утечка памяти при длительном использовании редактора',
    description: 'При работе в редакторе статей более 30 минут без перезагрузки страницы, браузер начинает потреблять все больше памяти. Особенно заметно в Chrome.',
    status: 'resolved',
    priority: 'critical',
    author: {
      id: 'user-4',
      username: 'performance_guru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=performance_guru',
    },
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    reactions: {
      upvote: 67,
      downvote: 0,
      important: 23,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['editor', 'performance', 'memory'],
    views: 445,
    commentsCount: 18,
  },
  {
    id: 'bug-5',
    type: 'bug',
    title: 'Некорректное отображение эмодзи в комментариях',
    description: 'Некоторые эмодзи (особенно составные, как флаги стран) отображаются как квадратики или не отображаются вообще.',
    status: 'open',
    priority: 'low',
    author: {
      id: 'user-5',
      username: 'emoji_lover',
    },
    createdAt: '2024-01-12T16:20:00Z',
    updatedAt: '2024-01-12T16:20:00Z',
    reactions: {
      upvote: 9,
      downvote: 1,
      important: 2,
      duplicate: 1,
      wontfix: 0,
    },
    tags: ['comments', 'emoji', 'ui'],
    views: 67,
    commentsCount: 2,
  },
]

export const mockFeatures: Feedback[] = [
  {
    id: 'feature-1',
    type: 'feature',
    title: 'Добавить темную тему для сайта',
    description: 'Многие пользователи просят добавить поддержку темной темы. Это улучшит опыт использования сайта в вечернее время и снизит нагрузку на глаза.',
    status: 'in-progress',
    priority: 'high',
    author: {
      id: 'user-6',
      username: 'night_owl',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=night_owl',
    },
    createdAt: '2024-01-11T09:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    reactions: {
      upvote: 234,
      downvote: 5,
      important: 89,
      duplicate: 0,
      wontfix: 0,
    },
    userReaction: 'important',
    tags: ['theme', 'ui', 'accessibility'],
    views: 1234,
    commentsCount: 45,
  },
  {
    id: 'feature-2',
    type: 'feature',
    title: 'Система уведомлений в реальном времени',
    description: 'Добавить систему push-уведомлений для новых комментариев, реакций на статьи и ответов на комментарии. Можно использовать WebSocket или Server-Sent Events.',
    status: 'open',
    priority: 'medium',
    author: {
      id: 'user-7',
      username: 'notification_fan',
    },
    createdAt: '2024-01-09T14:30:00Z',
    updatedAt: '2024-01-09T14:30:00Z',
    reactions: {
      upvote: 156,
      downvote: 3,
      important: 34,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['notifications', 'realtime', 'backend'],
    views: 678,
    commentsCount: 23,
  },
  {
    id: 'feature-3',
    type: 'feature',
    title: 'Экспорт статей в PDF и Markdown',
    description: 'Добавить возможность экспортировать статьи в различные форматы: PDF для печати и архива, Markdown для бэкенпа и других платформ.',
    status: 'open',
    priority: 'low',
    author: {
      id: 'user-8',
      username: 'export_pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=export_pro',
    },
    createdAt: '2024-01-08T10:15:00Z',
    updatedAt: '2024-01-08T10:15:00Z',
    reactions: {
      upvote: 78,
      downvote: 2,
      important: 12,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['export', 'pdf', 'markdown'],
    views: 234,
    commentsCount: 8,
  },
  {
    id: 'feature-4',
    type: 'feature',
    title: 'Улучшенный поиск с автодополнением',
    description: 'Добавить автодополнение в поиске, поиск по содержимому статей (не только по заголовкам), фильтры по дате, автору, тегам прямо в поиске.',
    status: 'open',
    priority: 'medium',
    author: {
      id: 'user-9',
      username: 'search_master',
    },
    createdAt: '2024-01-07T13:45:00Z',
    updatedAt: '2024-01-07T13:45:00Z',
    reactions: {
      upvote: 189,
      downvote: 1,
      important: 56,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['search', 'ui', 'ux'],
    views: 567,
    commentsCount: 19,
  },
  {
    id: 'feature-5',
    type: 'feature',
    title: 'Удалить обязательную регистрацию для чтения статей',
    description: 'Сделать статьи доступными для чтения без регистрации. Регистрация должна требоваться только для создания контента и взаимодействия.',
    status: 'rejected',
    priority: 'low',
    author: {
      id: 'user-10',
      username: 'anonymous_user',
    },
    createdAt: '2024-01-06T11:20:00Z',
    updatedAt: '2024-01-19T09:00:00Z',
    reactions: {
      upvote: 45,
      downvote: 89,
      important: 5,
      duplicate: 0,
      wontfix: 12,
    },
    tags: ['auth', 'accessibility'],
    views: 345,
    commentsCount: 34,
  },
  {
    id: 'feature-6',
    type: 'feature',
    title: 'Интеграция с GitHub для синхронизации кода',
    description: 'Добавить возможность вставлять код из GitHub репозиториев прямо в статьи с синхронизацией. При обновлении кода в репозитории, код в статье тоже обновляется.',
    status: 'open',
    priority: 'medium',
    author: {
      id: 'user-11',
      username: 'github_integration',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github_integration',
    },
    createdAt: '2024-01-05T15:00:00Z',
    updatedAt: '2024-01-05T15:00:00Z',
    reactions: {
      upvote: 123,
      downvote: 4,
      important: 28,
      duplicate: 0,
      wontfix: 0,
    },
    tags: ['github', 'integration', 'code'],
    views: 456,
    commentsCount: 15,
  },
]

export const allMockFeedback: Feedback[] = [...mockBugs, ...mockFeatures]

