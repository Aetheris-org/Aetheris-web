# API ЭНДПОИНТЫ ДЛЯ BACKEND

## АУТЕНТИФИКАЦИЯ

### POST /api/auth/register
**Регистрация нового пользователя**

**Request Body:**
```json
{
  "nickname": "string (3-24 chars)",
  "email": "string (valid email)",
  "password": "string (8-48 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "number",
    "nickname": "string",
    "email": "string",
    "createdAt": "datetime"
  },
  "token": "jwt_token"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "nickname": "Nickname already exists",
    "email": "Invalid email format"
  }
}
```

### POST /api/auth/login
**Авторизация пользователя**

**Request Body:**
```json
{
  "login": "string (nickname or email)",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "number",
    "nickname": "string",
    "email": "string",
    "lastLoginAt": "datetime"
  },
  "token": "jwt_token"
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### GET /api/auth/me
**Проверка токена**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "nickname": "string",
    "email": "string",
    "avatar": "string|null",
    "createdAt": "datetime",
    "lastLoginAt": "datetime"
  }
}
```

### POST /api/auth/logout
**Выход из системы**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## СТАТЬИ

### GET /api/articles
**Получение списка статей**

**Query Parameters:**
- `page`: number (номер страницы)
- `limit`: number (количество на страницу)
- `search`: string (поисковый запрос)
- `tags`: string[] (фильтр по тегам)
- `category`: string (фильтр по категории)
- `authorId`: number (фильтр по автору)
- `sortBy`: string (поле сортировки)
- `sortOrder`: 'asc'|'desc' (направление сортировки)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "string",
        "content": "string",
        "excerpt": "string",
        "author": {
          "id": 1,
          "username": "string",
          "avatar": "string|null"
        },
        "tags": ["string"],
        "createdAt": "datetime",
        "publishedAt": "datetime",
        "status": "draft|published|archived",
        "views": "number",
        "likes": "number",
        "commentsCount": "number",
        "readingTime": "number",
        "category": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "hasMore": "boolean"
    }
  }
}
```

### GET /api/articles/:id
**Получение статьи по ID**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      // Полная информация о статье
    }
  }
}
```

### POST /api/articles
**Создание статьи**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "category": "string",
  "status": "draft|published"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "article": {
      // Созданная статья с ID
    }
  }
}
```

### PUT /api/articles/:id
**Обновление статьи**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "status": "draft|published"
}
```

### DELETE /api/articles/:id
**Удаление статьи**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### POST /api/articles/:id/like
**Лайк статьи**

**Headers:** `Authorization: Bearer <token>`

### POST /api/articles/:id/unlike
**Убрать лайк**

**Headers:** `Authorization: Bearer <token>`

### POST /api/articles/:id/bookmark
**Добавить в закладки**

**Headers:** `Authorization: Bearer <token>`

## КОММЕНТАРИИ

### GET /api/articles/:id/comments
**Получение комментариев к статье**

### POST /api/articles/:id/comments
**Создание комментария**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

### PUT /api/comments/:id
**Обновление комментария**

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/comments/:id
**Удаление комментария**

**Headers:** `Authorization: Bearer <token>`

## ПОЛЬЗОВАТЕЛИ

### GET /api/users/:id
**Получение профиля пользователя**

### PUT /api/users/:id
**Обновление профиля**

**Headers:** `Authorization: Bearer <token>`

### GET /api/users/:id/articles
**Статьи пользователя**

## ВАЛИДАЦИЯ

### Никнейм
- Длина: 3-24 символа
- Разрешенные символы: буквы, цифры, _, -
- Не может начинаться с цифры

### Email
- Валидный формат email
- Максимальная длина: 254 символа

### Пароль
- Длина: 8-48 символов
- Обязательно: заглавная буква, строчная буква, цифра, специальный символ
