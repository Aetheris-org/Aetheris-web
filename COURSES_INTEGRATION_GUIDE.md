# 🎓 Руководство по интеграции системы курсов с базой данных

## 📋 Оглавление
1. [Обзор системы](#обзор-системы)
2. [Структура Strapi](#структура-strapi)
3. [API эндпоинты](#api-эндпоинты)
4. [Интеграция с фронтендом](#интеграция-с-фронтендом)
5. [Система монетизации](#система-монетизации)
6. [Права доступа и репутация](#права-доступа-и-репутация)
7. [Чеклист миграции](#чеклист-миграции)

---

## 🎯 Обзор системы

Система курсов Aetheris включает:
- **Верифицированные курсы** - проверены модерацией, высокое качество
- **Курсы от сообщества** - созданы пользователями с достаточной репутацией
- **Роадмап курса** - структурированная программа с разделами и уроками
- **Система прогресса** - отслеживание завершенных уроков
- **Монетизация** - платные курсы, подписки, реклама, доступ по уровню
- **Отзывы и рейтинги** - обратная связь от студентов

---

## 🗄️ Структура Strapi

### 1. Content Type: `Course`

```typescript
{
  title: string (required, unique)
  slug: string (required, unique, auto-generated from title)
  description: text (required)
  shortDescription: string (required, max 200 chars)
  thumbnail: media (single image)
  coverImage: media (single image)
  
  // Relations
  author: relation (User, many-to-one)
  sections: relation (CourseSection, one-to-many)
  category: relation (CourseCategory, many-to-one)
  
  // Verification
  isVerified: boolean (default: false)
  verificationDate: datetime
  moderatorNotes: text
  
  // Content
  totalLessons: number (computed)
  totalDuration: number (in minutes, computed)
  tags: json (array of strings)
  level: enumeration ['beginner', 'intermediate', 'advanced', 'expert']
  language: string (default: 'ru')
  
  // Access & Pricing
  pricingType: enumeration ['free', 'paid', 'subscription', 'level-gated']
  price: decimal (nullable, for 'paid' type)
  currency: enumeration ['USD', 'EUR', 'RUB'] (default: 'USD')
  requiredTier: enumeration ['basic', 'premium', 'pro'] (nullable, for 'subscription')
  requiredLevel: number (nullable, for 'level-gated')
  hasAds: boolean (default: false)
  adRevenueEnabled: boolean (default: false)
  estimatedCPM: decimal (nullable)
  
  // Stats (updated via hooks/cron)
  enrolledStudents: number (default: 0)
  completionRate: number (default: 0)
  averageRating: decimal (default: 0)
  totalReviews: number (default: 0)
  totalRevenue: decimal (default: 0)
  viewCount: number (default: 0)
  
  // Learning
  learningOutcomes: json (array of strings)
  prerequisites: json (array of strings)
  providesCertificate: boolean (default: false)
  certificateTemplate: string (nullable)
  
  // Status
  status: enumeration ['draft', 'published', 'archived', 'under-review'] (default: 'draft')
  publishedAt: datetime (nullable)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**Hooks для Course:**
- `beforeCreate`: Проверка репутации автора (min 100) и уровня (min 5)
- `beforeUpdate`: Пересчет totalLessons и totalDuration при изменении sections
- `afterCreate`: Отправка уведомления модераторам для верификации
- `afterUpdate`: Обновление статистики

---

### 2. Content Type: `CourseSection`

```typescript
{
  title: string (required)
  description: text (required)
  order: number (required)
  estimatedDuration: number (in minutes, computed from lessons)
  
  // Relations
  course: relation (Course, many-to-one)
  lessons: relation (CourseLesson, one-to-many)
  
  // Access
  isLocked: boolean (default: false)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**Hooks для CourseSection:**
- `beforeUpdate`: Пересчет estimatedDuration при изменении lessons
- `afterCreate/afterUpdate/afterDelete`: Обновление totalLessons и totalDuration в Course

---

### 3. Content Type: `CourseLesson`

```typescript
{
  title: string (required)
  description: text (required)
  duration: number (required, in minutes)
  type: enumeration ['video', 'article', 'interactive', 'quiz', 'assignment'] (required)
  order: number (required)
  
  // Content
  content: richtext (nullable, for 'article' type)
  videoUrl: string (nullable, for 'video' type)
  videoProvider: enumeration ['youtube', 'vimeo', 'custom'] (nullable)
  attachments: media (multiple files)
  
  // Access
  isPreview: boolean (default: false) // Can be viewed without enrollment
  
  // Relations
  section: relation (CourseSection, many-to-one)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

---

### 4. Content Type: `CourseEnrollment`

```typescript
{
  // Relations
  user: relation (User, many-to-one)
  course: relation (Course, many-to-one)
  
  // Progress
  completedLessons: json (array of lesson IDs)
  currentSection: string (section ID)
  currentLesson: string (lesson ID)
  overallProgress: number (percentage, computed)
  
  // Certificate
  certificateIssued: boolean (default: false)
  certificateIssuedAt: datetime (nullable)
  certificateId: string (nullable, unique)
  certificateUrl: string (nullable)
  
  // Timestamps
  enrolledAt: datetime (auto, on create)
  lastAccessedAt: datetime (updated on lesson view)
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**Unique constraint:** `user` + `course` (one enrollment per user per course)

**Hooks для CourseEnrollment:**
- `beforeCreate`: Проверка доступа (pricing, level, subscription)
- `afterCreate`: Увеличение enrolledStudents в Course
- `beforeUpdate`: Пересчет overallProgress, проверка на завершение (100%) для выдачи сертификата

---

### 5. Content Type: `CourseReview`

```typescript
{
  // Relations
  user: relation (User, many-to-one)
  course: relation (Course, many-to-one)
  
  // Review
  rating: number (required, min: 1, max: 5)
  comment: text (required, min: 10 chars)
  helpful: number (default: 0) // Number of "helpful" votes
  courseProgress: number (percentage at time of review)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

**Unique constraint:** `user` + `course` (one review per user per course)

**Hooks для CourseReview:**
- `afterCreate/afterUpdate/afterDelete`: Пересчет averageRating и totalReviews в Course

---

### 6. Content Type: `CourseCategory`

```typescript
{
  name: string (required, unique)
  slug: string (required, unique)
  description: text
  icon: string (Lucide icon name)
  courseCount: number (computed)
  
  // Relations
  courses: relation (Course, one-to-many)
  
  // Timestamps
  createdAt: datetime (auto)
  updatedAt: datetime (auto)
}
```

---

### 7. Расширение User Content Type

Добавить поля в существующий User:

```typescript
{
  // ... existing fields
  
  // Course-related
  reputation: number (default: 0)
  level: number (default: 1)
  canCreateCourses: boolean (computed: reputation >= 100 && level >= 5)
  
  // Relations
  createdCourses: relation (Course, one-to-many, field: 'author')
  enrollments: relation (CourseEnrollment, one-to-many)
  reviews: relation (CourseReview, one-to-many)
}
```

---

## 🔌 API эндпоинты

### Courses

```typescript
// GET /api/courses
// Query params: filters, sort, pagination
// Returns: { data: Course[], meta: { pagination } }

// GET /api/courses/:slug
// Populate: author, sections.lessons, category
// Returns: { data: Course }

// POST /api/courses
// Body: Partial<Course>
// Auth: Required, check reputation & level
// Returns: { data: Course }

// PUT /api/courses/:id
// Body: Partial<Course>
// Auth: Required, author only or admin
// Returns: { data: Course }

// DELETE /api/courses/:id
// Auth: Required, author only or admin
// Returns: { data: Course }

// POST /api/courses/:id/verify
// Auth: Required, moderator/admin only
// Body: { moderatorNotes?: string }
// Returns: { data: Course }
```

### Enrollments

```typescript
// POST /api/courses/:id/enroll
// Auth: Required
// Check: pricing, level, subscription
// Returns: { data: CourseEnrollment }

// GET /api/courses/:id/progress
// Auth: Required
// Returns: { data: CourseEnrollment }

// PUT /api/courses/:id/progress
// Auth: Required
// Body: { lessonId: string, completed: boolean }
// Returns: { data: CourseEnrollment }
```

### Reviews

```typescript
// POST /api/courses/:id/reviews
// Auth: Required, must be enrolled
// Body: { rating: number, comment: string }
// Returns: { data: CourseReview }

// PUT /api/reviews/:id
// Auth: Required, author only
// Body: { rating?: number, comment?: string }
// Returns: { data: CourseReview }

// DELETE /api/reviews/:id
// Auth: Required, author only or admin
// Returns: { data: CourseReview }

// POST /api/reviews/:id/helpful
// Auth: Required
// Toggle helpful vote
// Returns: { data: CourseReview }
```

### Categories

```typescript
// GET /api/course-categories
// Returns: { data: CourseCategory[] }
```

---

## 🎨 Интеграция с фронтендом

### 1. Создать API клиент

**Файл:** `frontend-react/src/api/courses.ts`

```typescript
import { api } from './client'
import type { Course, CourseFilters, CourseEnrollment, CourseReview } from '@/types/courses'

export const coursesApi = {
  // Get all courses with filters
  getCourses: async (filters?: CourseFilters) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('filters[category][name][$eq]', filters.category)
    if (filters?.level) params.append('filters[level][$eq]', filters.level)
    if (filters?.verified !== undefined) params.append('filters[isVerified][$eq]', String(filters.verified))
    if (filters?.pricing) params.append('filters[pricingType][$eq]', filters.pricing)
    if (filters?.search) params.append('filters[$or][0][title][$containsi]', filters.search)
    if (filters?.minRating) params.append('filters[averageRating][$gte]', String(filters.minRating))
    
    // Sorting
    const sortMap = {
      popular: 'enrolledStudents:desc',
      newest: 'publishedAt:desc',
      rating: 'averageRating:desc',
      trending: 'viewCount:desc',
    }
    if (filters?.sortBy) params.append('sort', sortMap[filters.sortBy])
    
    params.append('populate', 'author,category')
    
    const response = await api.get(`/courses?${params.toString()}`)
    return response.data
  },

  // Get single course by slug
  getCourse: async (slug: string) => {
    const response = await api.get(`/courses/${slug}?populate=author,sections.lessons,category`)
    return response.data.data as Course
  },

  // Create course
  createCourse: async (data: Partial<Course>) => {
    const response = await api.post('/courses', { data })
    return response.data.data as Course
  },

  // Update course
  updateCourse: async (id: string, data: Partial<Course>) => {
    const response = await api.put(`/courses/${id}`, { data })
    return response.data.data as Course
  },

  // Enroll in course
  enrollInCourse: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/enroll`)
    return response.data.data as CourseEnrollment
  },

  // Get user progress
  getProgress: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/progress`)
    return response.data.data as CourseEnrollment
  },

  // Update lesson progress
  updateProgress: async (courseId: string, lessonId: string, completed: boolean) => {
    const response = await api.put(`/courses/${courseId}/progress`, {
      lessonId,
      completed,
    })
    return response.data.data as CourseEnrollment
  },

  // Add review
  addReview: async (courseId: string, rating: number, comment: string) => {
    const response = await api.post(`/courses/${courseId}/reviews`, {
      data: { rating, comment },
    })
    return response.data.data as CourseReview
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/course-categories')
    return response.data.data
  },
}
```

---

### 2. Обновить страницы для использования API

**Файл:** `frontend-react/src/pages/CoursesPage.tsx`

Заменить импорт мок-данных:

```typescript
// ❌ Удалить
import { mockCourses, mockCategories } from '@/data/coursesMockData'

// ✅ Добавить
import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/api/courses'
import { Skeleton } from '@/components/ui/skeleton'
```

Заменить useState на useQuery:

```typescript
// ❌ Удалить
const filteredCourses = useMemo(() => {
  return mockCourses.filter(...)
}, [filters])

// ✅ Добавить
const { data: courses, isLoading } = useQuery({
  queryKey: ['courses', filters],
  queryFn: () => coursesApi.getCourses(filters),
})

// Добавить loading state
if (isLoading) {
  return <CoursesPageSkeleton />
}
```

---

### 3. Добавить Skeleton компоненты

**Файл:** `frontend-react/src/components/skeletons/CoursesPageSkeleton.tsx`

```typescript
export function CoursesPageSkeleton() {
  return (
    <div className="container py-8 space-y-8">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

---

### 4. Обновить CourseDetailPage

```typescript
// В CourseDetailPage.tsx
const { data: course, isLoading } = useQuery({
  queryKey: ['course', slug],
  queryFn: () => coursesApi.getCourse(slug!),
  enabled: !!slug,
})

const { data: enrollment } = useQuery({
  queryKey: ['enrollment', course?.id],
  queryFn: () => coursesApi.getProgress(course!.id),
  enabled: !!course && isEnrolled,
})

// Добавить mutation для enrollment
const enrollMutation = useMutation({
  mutationFn: (courseId: string) => coursesApi.enrollInCourse(courseId),
  onSuccess: () => {
    queryClient.invalidateQueries(['enrollment', course?.id])
    toast.success('Вы успешно записались на курс!')
  },
})
```

---

## 💰 Система монетизации

### 1. Интеграция Stripe (для платных курсов)

**Установка:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Создать эндпоинт в Strapi:**
```typescript
// backend/src/api/course/controllers/payment.ts
export default {
  async createCheckoutSession(ctx) {
    const { courseId } = ctx.request.body
    const course = await strapi.entityService.findOne('api::course.course', courseId)
    
    if (course.pricingType !== 'paid') {
      return ctx.badRequest('Course is not paid')
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: course.currency.toLowerCase(),
          product_data: {
            name: course.title,
            description: course.shortDescription,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/${course.slug}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}?payment=cancelled`,
      metadata: {
        courseId: course.id,
        userId: ctx.state.user.id,
      },
    })
    
    return { sessionId: session.id }
  },
  
  async handleWebhook(ctx) {
    const sig = ctx.request.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(ctx.request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { courseId, userId } = session.metadata
      
      // Create enrollment
      await strapi.entityService.create('api::course-enrollment.course-enrollment', {
        data: {
          user: userId,
          course: courseId,
          enrolledAt: new Date(),
        },
      })
    }
    
    return { received: true }
  },
}
```

---

### 2. Проверка подписки

**В Strapi middleware:**
```typescript
// backend/src/middlewares/checkSubscription.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.state.user) {
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        ctx.state.user.id,
        { populate: ['subscription'] }
      )
      
      ctx.state.user.subscriptionTier = user.subscription?.tier || null
      ctx.state.user.subscriptionActive = user.subscription?.active || false
    }
    
    await next()
  }
}
```

**Проверка при enrollment:**
```typescript
// В beforeCreate hook CourseEnrollment
if (course.pricingType === 'subscription') {
  const userTier = ctx.state.user.subscriptionTier
  const requiredTier = course.requiredTier
  
  const tierHierarchy = ['basic', 'premium', 'pro']
  const userTierIndex = tierHierarchy.indexOf(userTier)
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier)
  
  if (userTierIndex < requiredTierIndex) {
    throw new Error(`Требуется подписка уровня ${requiredTier}`)
  }
}
```

---

### 3. Система рекламы

**Google AdSense интеграция:**

```typescript
// frontend-react/src/components/CourseAd.tsx
export function CourseAd({ course }: { course: Course }) {
  useEffect(() => {
    if (course.access.hasAds && course.access.adRevenue?.enabled) {
      // Load AdSense script
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      script.async = true
      document.head.appendChild(script)
      
      // Track ad impression for revenue
      coursesApi.trackAdImpression(course.id)
    }
  }, [course])
  
  if (!course.access.hasAds) return null
  
  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
      />
    </div>
  )
}
```

**Отслеживание дохода в Strapi:**
```typescript
// backend/src/api/course/controllers/analytics.ts
export default {
  async trackAdImpression(ctx) {
    const { courseId } = ctx.request.body
    const course = await strapi.entityService.findOne('api::course.course', courseId)
    
    // Increment view count
    await strapi.entityService.update('api::course.course', courseId, {
      data: {
        viewCount: course.viewCount + 1,
      },
    })
    
    // Calculate revenue (CPM = cost per 1000 impressions)
    if (course.adRevenueEnabled && course.estimatedCPM) {
      const revenuePerView = course.estimatedCPM / 1000
      await strapi.entityService.update('api::course.course', courseId, {
        data: {
          totalRevenue: course.totalRevenue + revenuePerView,
        },
      })
    }
    
    return { success: true }
  },
}
```

---

## 🔐 Права доступа и репутация

### 1. Проверка прав на создание курса

**В Strapi controller:**
```typescript
// backend/src/api/course/controllers/course.ts
export default {
  async create(ctx) {
    const user = ctx.state.user
    
    // Check reputation and level
    if (user.reputation < 100 || user.level < 5) {
      return ctx.forbidden('Недостаточно репутации или уровня для создания курса')
    }
    
    // Create course
    const course = await strapi.entityService.create('api::course.course', {
      data: {
        ...ctx.request.body.data,
        author: user.id,
        status: 'draft',
        isVerified: false,
      },
    })
    
    return course
  },
}
```

---

### 2. Система репутации

**Начисление репутации:**
- Завершение курса: +10
- Оставление отзыва: +5
- Полезный отзыв (helpful): +2 автору отзыва
- Создание верифицированного курса: +50
- Студент завершил ваш курс: +3 автору курса

**В Strapi hooks:**
```typescript
// backend/src/api/course-enrollment/lifecycles.ts
export default {
  async afterUpdate(event) {
    const { result, params } = event
    
    // Check if course was just completed
    if (result.overallProgress === 100 && params.data.overallProgress !== 100) {
      // Award reputation to student
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        result.user.id,
        { data: { reputation: result.user.reputation + 10 } }
      )
      
      // Award reputation to course author
      const course = await strapi.entityService.findOne('api::course.course', result.course.id, {
        populate: ['author'],
      })
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        course.author.id,
        { data: { reputation: course.author.reputation + 3 } }
      )
    }
  },
}
```

---

## ✅ Чеклист миграции

### Backend (Strapi)

- [ ] Создать все Content Types (Course, CourseSection, CourseLesson, CourseEnrollment, CourseReview, CourseCategory)
- [ ] Добавить поля в User (reputation, level, canCreateCourses)
- [ ] Настроить relations между Content Types
- [ ] Создать hooks для автоматических вычислений (totalLessons, averageRating, etc.)
- [ ] Настроить permissions для каждого Content Type
- [ ] Создать custom controllers для enrollment, progress, reviews
- [ ] Интегрировать Stripe для платных курсов
- [ ] Настроить webhook для Stripe
- [ ] Создать middleware для проверки подписки
- [ ] Реализовать систему репутации (hooks)
- [ ] Создать cron job для обновления статистики курсов
- [ ] Настроить email уведомления (новый курс на модерацию, верификация, etc.)

### Frontend (React)

- [ ] Создать `src/api/courses.ts` с API клиентом
- [ ] Обновить `CoursesPage.tsx` для использования useQuery
- [ ] Обновить `CourseDetailPage.tsx` для использования useQuery
- [ ] Создать Skeleton компоненты для loading states
- [ ] Добавить error handling и toast notifications
- [ ] Создать страницу создания курса (`CourseCreatePage.tsx`)
- [ ] Создать страницу редактирования курса (`CourseEditPage.tsx`)
- [ ] Создать страницу обучения (`CourseLearningPage.tsx`) для просмотра уроков
- [ ] Интегрировать Stripe Checkout для платных курсов
- [ ] Добавить компонент рекламы (`CourseAd.tsx`)
- [ ] Создать dashboard для авторов курсов (статистика, доход)
- [ ] Добавить страницу "Мои курсы" (enrolled courses)
- [ ] Реализовать систему отзывов (добавление, редактирование, helpful votes)
- [ ] Добавить фильтрацию и сортировку курсов
- [ ] Оптимизировать для мобильных устройств

### Testing

- [ ] Написать unit тесты для API functions
- [ ] Написать integration тесты для enrollment flow
- [ ] Протестировать payment flow (Stripe)
- [ ] Протестировать систему прогресса
- [ ] Протестировать права доступа (reputation, level, subscription)
- [ ] Провести E2E тестирование всего flow (от регистрации до завершения курса)

### Deployment

- [ ] Настроить environment variables для Stripe
- [ ] Настроить webhook URL для Stripe в production
- [ ] Настроить AdSense account и получить publisher ID
- [ ] Создать backup strategy для базы данных
- [ ] Настроить monitoring и logging
- [ ] Провести load testing для API endpoints
- [ ] Оптимизировать database queries (indexes)
- [ ] Настроить CDN для media files (thumbnails, videos)

### Cleanup

- [ ] Удалить `frontend-react/src/data/coursesMockData.ts`
- [ ] Удалить все импорты mock data из компонентов
- [ ] Удалить этот файл (`COURSES_INTEGRATION_GUIDE.md`) после завершения миграции

---

## 📚 Дополнительные ресурсы

- [Strapi Documentation](https://docs.strapi.io/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Последнее обновление:** 2025-02-20

**Автор:** AI Assistant (Claude Sonnet 4.5)

**Версия:** 1.0.0

