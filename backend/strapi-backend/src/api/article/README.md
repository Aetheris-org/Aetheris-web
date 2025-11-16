# Article API

## Описание

API для работы со статьями пользователей. Реализовано с использованием встроенных механизмов Strapi для валидации, безопасности и RBAC.

## Безопасность

### Встроенные механизмы защиты:

1. **SQL Injection**: Защита через `entityService` (параметризованные запросы)
2. **XSS**: Автоматическая санитаризация HTML через Strapi для `richtext` полей
3. **Валидация**: Автоматическая валидация по схеме через `entityService`
4. **RBAC**: Управление правами доступа через Strapi Admin → Settings → Roles

### Дополнительные проверки:

- Проверка авторства при обновлении/удалении статей
- Валидация длины полей (title: 10-200, content: 100-20000, excerpt: до 500)
- Валидация difficulty (easy, medium, hard)
- Проверка типа данных для tags (массив строк)

## API Endpoints

### Публичные (не требуют аутентификации):

- `GET /api/articles` - Список опубликованных статей
- `GET /api/articles/:id` - Получение опубликованной статьи

### Защищенные (требуют аутентификации):

- `POST /api/articles` - Создание статьи (черновик или опубликованная)
- `PUT /api/articles/:id` - Обновление статьи (только автор)
- `DELETE /api/articles/:id` - Удаление статьи (только автор)
- `GET /api/articles/me/drafts` - Список черновиков текущего пользователя
- `GET /api/articles/me/drafts/:id` - Получение черновика по ID

## Структура данных

### Схема Article:

```json
{
  "title": "string (10-200 символов, required)",
  "content": "richtext (100-20000 символов, required)",
  "excerpt": "text (до 500 символов, optional)",
  "tags": "json (массив строк, optional)",
  "difficulty": "enumeration (easy|medium|hard, default: medium)",
  "preview_image": "media (image, optional)",
  "author": "relation (manyToOne -> User, required, устанавливается автоматически)",
  "likes_count": "integer (default: 0)",
  "dislikes_count": "integer (default: 0)",
  "views": "integer (default: 0)",
  "publishedAt": "datetime (null для черновиков, устанавливается при публикации)"
}
```

## Примеры запросов

### Создание черновика:

```typescript
POST /api/articles
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "data": {
    "title": "My Article Title",
    "content": "<p>Article content here...</p>",
    "excerpt": "Short description",
    "tags": ["tag1", "tag2"],
    "difficulty": "medium",
    "preview_image": 123 // ID загруженного изображения
  }
}
```

### Публикация статьи:

```typescript
POST /api/articles
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "data": {
    "title": "My Article Title",
    "content": "<p>Article content here...</p>",
    "excerpt": "Short description",
    "tags": ["tag1", "tag2"],
    "difficulty": "medium",
    "preview_image": 123,
    "publishedAt": "2025-11-16T12:00:00.000Z"
  }
}
```

### Обновление статьи:

```typescript
PUT /api/articles/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "data": {
    "title": "Updated Title",
    "content": "<p>Updated content...</p>"
  }
}
```

## Настройка прав доступа

После создания content-type, необходимо настроить права доступа в Strapi Admin:

1. Перейдите в **Settings → Users & Permissions → Roles → Authenticated**
2. Найдите **Article** в списке permissions
3. Настройте права:
   - **find**: ✅ (для получения опубликованных статей)
   - **findOne**: ✅ (для получения одной статьи)
   - **create**: ✅ (для создания статей)
   - **update**: ✅ (для обновления своих статей)
   - **delete**: ✅ (для удаления своих статей)

**Важно**: Контроллер дополнительно проверяет авторство при обновлении/удалении, даже если права настроены.

## Валидация

Все данные автоматически валидируются через `entityService` по схеме:

- **title**: минимум 10, максимум 200 символов
- **content**: минимум 100, максимум 20000 символов (HTML)
- **excerpt**: максимум 500 символов
- **tags**: должен быть массивом строк
- **difficulty**: должен быть одним из: easy, medium, hard
- **preview_image**: должен быть ID существующего media файла

## Обработка ошибок

Все ошибки возвращаются в стандартном формате Strapi:

```json
{
  "error": {
    "status": 400,
    "message": "Validation error message"
  }
}
```

Возможные статусы:
- `400` - Bad Request (валидация не прошла)
- `401` - Unauthorized (не аутентифицирован)
- `403` - Forbidden (нет прав доступа)
- `404` - Not Found (статья не найдена)
- `500` - Internal Server Error (ошибка сервера)

