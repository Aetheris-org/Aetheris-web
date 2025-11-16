# API Documentation

## Base URL
- Development: `http://localhost:1337/api`
- Production: `https://your-domain.com/api`

## Authentication

Все защищенные эндпоинты требуют JWT токен в заголовке `Authorization`:
```
Authorization: Bearer <JWT_TOKEN>
```

Или токен может быть передан через cookies (`accessToken` или `jwtToken`).

---

## Authentication Endpoints

### GET `/auth/csrf`
Получить CSRF токен для защиты от CSRF атак.

**Response:**
```json
{
  "csrfToken": "string"
}
```

---

### POST `/auth/logout`
Выход из системы. Требует авторизации.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET `/connect/google`
Инициация OAuth2 авторизации через Google.

**Query Parameters:**
- `redirect` (optional): URL для редиректа после успешной авторизации

**Response:**
- Redirects to Google OAuth consent screen

**Flow:**
1. Frontend редиректит на `/api/connect/google?redirect=<frontend_callback_url>`
2. Пользователь авторизуется в Google
3. Google редиректит на `/api/connect/google/callback?code=<auth_code>`
4. Backend обрабатывает callback и редиректит на frontend с JWT токеном в URL: `<frontend_callback_url>?access_token=<JWT_TOKEN>`
5. Frontend сохраняет токен в cookies и использует для последующих запросов

---

## User Endpoints

### GET `/users/me`
Получить данные текущего авторизованного пользователя.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "bio": "User bio text",
  "avatar": {
    "url": "/uploads/avatar.jpg",
    "formats": {
      "thumbnail": { "url": "/uploads/thumbnail_avatar.jpg" }
    }
  },
  "coverImage": {
    "url": "/uploads/cover.jpg",
    "formats": {
      "large": { "url": "/uploads/large_cover.jpg" }
    }
  },
  "confirmed": true,
  "blocked": false,
  "role": {
    "name": "Authenticated",
    "type": "authenticated"
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Токен отсутствует или невалидный
- `403 Forbidden`: Пользователь заблокирован

---

## Security Features

### Rate Limiting
- **OAuth/Auth endpoints**: 5 запросов за 15 минут на IP + User-Agent
- **API endpoints**: 100 запросов в минуту на IP

**Headers:**
- `X-RateLimit-Remaining`: Оставшееся количество запросов
- `X-RateLimit-Reset`: Время сброса лимита (Unix timestamp)
- `X-RateLimit-Total`: Общий лимит запросов

### CORS
Настроен для работы с frontend на `http://localhost:5173` (development) или вашего production домена.

### Content Security Policy
Настроен для защиты от XSS атак. Разрешает подключения к Google OAuth endpoints.

---

## Error Handling

Все ошибки возвращаются в формате:
```json
{
  "error": {
    "status": 400,
    "message": "Error message"
  }
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (Rate Limit)
- `500`: Internal Server Error

---

## Frontend Integration Example

```typescript
// Получение CSRF токена
const csrfResponse = await fetch('http://localhost:1337/api/auth/csrf');
const { csrfToken } = await csrfResponse.json();

// Инициация OAuth
window.location.href = `http://localhost:1337/api/connect/google?redirect=${encodeURIComponent('http://localhost:5173/auth/callback')}`;

// Получение данных пользователя
const userResponse = await fetch('http://localhost:1337/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const user = await userResponse.json();
```

