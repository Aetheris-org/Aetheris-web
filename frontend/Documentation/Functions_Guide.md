# РУКОВОДСТВО ПО ФУНКЦИЯМ ДЛЯ BACKEND РАЗРАБОТЧИКА

## ОСНОВНЫЕ COMPOSABLES

### useArticles.ts

#### loadArticles(filters)
**Описание:** Загружает список статей с фильтрацией и пагинацией
**Вызывается:** Articles.vue при загрузке страницы, изменении фильтров
**Параметры:**
```typescript
{
  page: number,           // Номер страницы (начиная с 1)
  limit: number,          // Количество статей (10 или 20-25)
  search?: string,        // Поисковый запрос
  tags?: string[],        // Массив тегов для фильтрации
  category?: string,      // Категория статьи
  authorId?: number,      // ID автора
  sortBy?: string,        // Поле сортировки
  sortOrder?: 'asc'|'desc' // Направление сортировки
}
```
**API запрос:** `GET /api/articles`

#### loadArticle(id)
**Описание:** Загружает полную статью по ID
**Вызывается:** При клике на карточку статьи
**Параметры:**
```typescript
id: number  // ID статьи
```
**API запрос:** `GET /api/articles/${id}`

#### createArticle(articleData)
**Описание:** Создает новую статью
**Вызывается:** CreateArticle.vue при сохранении
**Параметры:**
```typescript
{
  title: string,          // Заголовок статьи
  content: string,        // HTML контент из Quill Editor
  excerpt?: string,       // Краткое описание
  tags: string[],         // Массив тегов
  category: string,       // Категория
  status: 'draft'|'published' // Статус публикации
}
```
**API запрос:** `POST /api/articles`

#### updateArticle(id, articleData)
**Описание:** Обновляет существующую статью
**Вызывается:** При редактировании статьи
**API запрос:** `PUT /api/articles/${id}`

#### deleteArticle(id)
**Описание:** Удаляет статью
**Вызывается:** При нажатии кнопки удаления
**API запрос:** `DELETE /api/articles/${id}`

### useAuth.ts

#### login(credentials)
**Описание:** Авторизация пользователя
**Вызывается:** Login.vue при отправке формы
**Параметры:**
```typescript
{
  login: string,    // Email или никнейм
  password: string  // Пароль
}
```
**API запрос:** `POST /api/auth/login`

#### register(userData)
**Описание:** Регистрация нового пользователя
**Вызывается:** SignIn.vue при отправке формы
**Параметры:**
```typescript
{
  nickname: string,  // Никнейм (3-24 символа)
  email: string,     // Email адрес
  password: string   // Пароль (8-48 символов)
}
```
**API запрос:** `POST /api/auth/register`

#### logout()
**Описание:** Выход из системы
**Вызывается:** При клике на кнопку выхода в хедере
**API запрос:** `POST /api/auth/logout`

#### checkAuth()
**Описание:** Проверка токена авторизации
**Вызывается:** При загрузке приложения, router guards
**API запрос:** `GET /api/auth/me`

## ВЗАИМОДЕЙСТВИЕ С КОМПОНЕНТАМИ

### ArticleCard.vue

#### toggleLike(articleId)
**Описание:** Лайк/дизлайк статьи
**Вызывается:** При клике на кнопку лайка
**Параметры:** `articleId: number`
**API запросы:** 
- `POST /api/articles/${id}/like`
- `POST /api/articles/${id}/unlike`

#### toggleBookmark(articleId)
**Описание:** Добавление/удаление из закладок
**Вызывается:** При клике на кнопку закладки
**Параметры:** `articleId: number`
**API запрос:** `POST /api/articles/${id}/bookmark`

#### openComments(articleId)
**Описание:** Открытие секции комментариев
**Вызывается:** При клике на кнопку комментариев
**Параметры:** `articleId: number`

### CreateArticle.vue

#### saveArticle(isDraft)
**Описание:** Сохранение статьи как черновика или публикация
**Вызывается:** При клике на кнопки "Сохранить" или "Опубликовать"
**Параметры:** `isDraft: boolean`
**Что собирает:**
- Заголовок из input
- Контент из Quill Editor (HTML)
- Выбранные теги
- Категорию
- Статус (draft/published)

### Profile.vue

#### loadUserProfile(userId)
**Описание:** Загружает профиль пользователя
**Вызывается:** При переходе на страницу профиля
**API запрос:** `GET /api/users/${userId}`

#### loadUserArticles(userId, page)
**Описание:** Загружает статьи пользователя
**Вызывается:** На странице профиля, при пагинации
**API запрос:** `GET /api/users/${userId}/articles`

## СТРУКТУРА ДАННЫХ

### Статья в списке (Articles.vue)
```typescript
{
  id: number,
  title: string,
  excerpt: string,
  author: {
    id: number,
    username: string,
    avatar: string|null
  },
  tags: string[],
  category: string,
  createdAt: string,
  views: number,
  likes: number,
  commentsCount: number,
  readingTime: number
}
```

### Полная статья (просмотр)
```typescript
{
  id: number,
  title: string,
  content: string,
  excerpt: string,
  author: User,
  tags: string[],
  category: string,
  createdAt: string,
  publishedAt: string,
  views: number,
  likes: number,
  dislikes: number,
  commentsCount: number,
  readingTime: number,
  isLiked: boolean,
  isBookmarked: boolean
}
```

## ПАГИНАЦИЯ

### Стандартное отображение
- **Лимит:** 10 статей на страницу
- **Используется:** Articles.vue основной вид

### Списочное отображение  
- **Лимит:** 20-25 статей на страницу
- **Используется:** Компактный список статей

### Структура ответа пагинации
```typescript
{
  articles: Article[],
  pagination: {
    total: number,      // Общее количество
    page: number,       // Текущая страница
    limit: number,      // Количество на странице
    hasMore: boolean    // Есть ли еще страницы
  }
}
```

## ВАЛИДАЦИЯ

### Статья
- **title:** 1-255 символов, обязательно
- **content:** минимум 100 символов для публикации
- **excerpt:** максимум 500 символов
- **tags:** максимум 10 тегов, каждый тег 2-30 символов
- **category:** одна из предустановленных категорий

### Комментарий
- **content:** 1-1000 символов, обязательно
- **parentId:** валидный ID существующего комментария (для ответов)

### Пользователь
- **nickname:** 3-24 символа, уникальный
- **email:** валидный email, уникальный
- **password:** 8-48 символов, требования безопасности

