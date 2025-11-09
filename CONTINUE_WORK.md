# 🔧 Контекст работы и текущая проблема

## 📋 Общая информация

**Проект**: Aetheris Community - платформа для статей с комментариями, авторизацией через Google OAuth2, закладками и уведомлениями.

**Технологии**:
- Backend: Strapi v5.30.0 (Node.js, TypeScript, SQLite)
- Frontend: Vue 3 + TypeScript + Pinia + Vue Router
- Авторизация: Google OAuth2 с хешированием email
- Безопасность: CSRF защита, Rate Limiting, Security Headers, HttpOnly cookies

**Статус**: Миграция с Python/FastAPI на Strapi завершена, но есть критическая проблема с отображением статей.

---

## 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА (ТЕКУЩАЯ)

### Описание проблемы

**Симптомы**:
- Статьи создаются успешно (видны в логах Strapi, есть `publishedAt`, `author` и все поля)
- `GET /api/articles` возвращает **пустой массив** (`data: []`)
- В консоли браузера: `Статьи загружены следующие: Proxy(Array) {}`
- В логах Strapi: `🔵 Article.find returned 0 articles`

**Что работает**:
- ✅ Создание статей (`POST /api/articles`) - работает, статьи сохраняются в БД
- ✅ Авторизация через Google OAuth2 - работает
- ✅ Получение пользователя (`GET /api/users/me`) - работает
- ✅ Все остальные endpoints (bookmarks, reactions, notifications) - работают

**Что НЕ работает**:
- ❌ Получение списка статей (`GET /api/articles`) - возвращает пустой массив

### Текущая реализация `Article.find`

**Файл**: `backend/strapi-backend/src/api/article/controllers/article.ts`

**Метод `find`** использует `strapi.entityService.findMany` напрямую (чтобы обойти sanitization):

```typescript
async find(ctx) {
  const userId = ctx.state.user?.id;
  
  const queryFilters = (ctx.query as any).filters || {};
  const filters: any = {
    ...queryFilters,
    publishedAt: { $notNull: true }
  };
  
  const pagination = (ctx.query as any).pagination || {};
  const start = parseInt(pagination.start) || 0;
  const limit = parseInt(pagination.limit) || 100;

  try {
    // Добавлены отладочные логи
    const totalArticles = await strapi.db.query('api::article.article').count();
    console.log('🔵 Total articles in DB:', totalArticles);
    const rawSample = await strapi.db.query('api::article.article').findMany({
      orderBy: { createdAt: 'desc' },
      populate: { author: true },
      limit: 1,
    });
    if (rawSample?.length) {
      console.log('🔵 Raw sample article:', JSON.stringify(rawSample[0], null, 2));
    }

    // Fetch articles using entityService
    const articles = await strapi.entityService.findMany('api::article.article', {
      filters,
      start,
      limit,
      sort: { publishedAt: 'desc' },
      publicationState: 'live', // CRITICAL: для Strapi v5
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url', 'name'] }
          }
        },
        preview_image: { fields: ['url', 'name', 'alternativeText'] }
      }
    });

    console.log(`🔵 Article.find returned ${articles.length} articles`);
    
    // ... добавление user_reaction для авторизованных пользователей
    // ... возврат { data, meta }
  }
}
```

**Проблема**: `entityService.findMany` возвращает 0 статей, хотя:
- Статьи есть в БД (создаются успешно)
- У них есть `publishedAt` (не null)
- Фильтр `publishedAt: { $notNull: true }` должен их находить

**Возможные причины**:
1. `publicationState: 'live'` не работает как ожидается
2. Фильтр `$notNull` не работает с `entityService.findMany` в Strapi v5
3. Нужно использовать другой подход для получения опубликованных статей

---

## 🔒 КРИТИЧЕСКИ ВАЖНО: МЕХАНИЗМЫ БЕЗОПАСНОСТИ

### ⚠️ НЕЛЬЗЯ нарушать эти механизмы!

Все следующие механизмы безопасности **ДОЛЖНЫ** быть сохранены:

### 1. Email Hashing (GDPR/CCPA Compliance)

**Файл**: `backend/strapi-backend/src/extensions/users-permissions/strapi-server.ts`

**Реализация**: 
- Email НЕ сохраняется в БД
- Вместо этого сохраняется HMAC-SHA256 хеш с pepper: `hash-{HMAC(email, pepper)}@internal.local`
- Pepper хранится в `process.env.EMAIL_HASH_PEPPER`

**Код**:
```typescript
function generatePseudoEmail(email: string): string {
  const pepper = process.env.EMAIL_HASH_PEPPER || 'default-pepper-change-in-production';
  const hash = crypto.createHmac('sha256', pepper).update(email).digest('hex');
  return `hash-${hash}@internal.local`;
}
```

**Важно**: Никогда не возвращать даже части хеша на фронтенд!

### 2. CSRF Protection

**Файл**: `backend/strapi-backend/src/index.ts`

**Реализация**:
- CSRF токены генерируются через `/api/auth/csrf`
- Токены хранятся в Redis/in-memory с привязкой к IP
- Проверяются для всех небезопасных методов (POST, PUT, DELETE, PATCH)
- Исключения: OAuth endpoints, `/api/auth/refresh`, `/api/auth/logout`, Admin panel

**Важно**: Не отключать CSRF защиту!

### 3. Rate Limiting

**Файл**: `backend/strapi-backend/src/index.ts`

**Реализация**:
- Глобальный: 500 запросов/минуту на IP
- OAuth endpoints: 10 запросов/минуту на IP (защита от brute-force)
- Использует Redis (если доступен) или in-memory fallback

### 4. Security Headers (Helmet.js)

**Файл**: `backend/strapi-backend/src/middlewares/security-headers.ts`

**Реализация**: 
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 5. HttpOnly Cookies для Refresh Token

**Файл**: `backend/strapi-backend/src/extensions/users-permissions/strapi-server.ts`

**Реализация**:
- Access Token: `httpOnly: false` (нужен для Authorization header)
- Refresh Token: `httpOnly: true` (защита от XSS)
- Secure: `process.env.NODE_ENV === 'production'`
- SameSite: `'lax'`

### 6. Автоматическая установка author при создании статьи

**Файл**: `backend/strapi-backend/src/api/article/controllers/article.ts`

**Реализация**:
```typescript
async create(ctx) {
  const userId = ctx.state.user?.id;
  if (!userId) return ctx.unauthorized();
  
  const articleData = {
    ...data,
    author: userId, // SECURITY: Автоматически устанавливается из токена
    publishedAt: data.publishedAt || null,
  };
  
  // Пользователь НЕ может создать статью от имени другого пользователя
}
```

**Важно**: Пользователь НЕ может передать `author` в payload - он игнорируется!

### 7. Проверка владельца при update/delete

**Файл**: `backend/strapi-backend/src/api/article/controllers/article.ts`

**Реализация**:
```typescript
async update(ctx) {
  const existingArticle = await strapi.entityService.findOne('api::article.article', id, {
    populate: ['author']
  });
  
  if ((existingArticle as any).author?.id !== userId) {
    return ctx.forbidden('You can only update your own articles');
  }
}
```

### 8. Permissions управляются ВРУЧНУЮ

**КРИТИЧЕСКИ ВАЖНО**: Пользователь **ЯВНО** запросил полный контроль над permissions через Strapi Admin Panel.

**Файл**: `backend/strapi-backend/src/index.ts`

**Текущее состояние**:
```typescript
async bootstrap({ strapi }) {
  // Permissions настраиваются вручную через Strapi Admin Panel:
  // Settings → Users & Permissions → Roles
  console.log('✅ Strapi started. Configure permissions manually in Admin Panel.');
}
```

**ВАЖНО**: НЕ создавать автоматическую настройку permissions! Пользователь хочет полный контроль.

---

## 📝 РЕКОМЕНДАЦИИ ПОЛЬЗОВАТЕЛЯ ПО БЕЗОПАСНОСТИ

Пользователь **явно** запросил:

1. **"Максимальная безопасность"** - использовать самые безопасные опции
2. **"Стандарты и best practices"** - следовать индустриальным стандартам
3. **"Использовать существующие инструменты"** - не изобретать велосипеды
4. **"Без костылей"** - избегать временных решений
5. **"Полный контроль над permissions"** - не автоматизировать настройку прав доступа

---

## 🏗️ АРХИТЕКТУРА ПРОЕКТА

### Структура Backend (Strapi)

```
backend/strapi-backend/
├── src/
│   ├── api/
│   │   ├── article/
│   │   │   ├── controllers/article.ts    # КРИТИЧЕСКИЙ: Здесь проблема с find()
│   │   │   ├── services/article.ts
│   │   │   └── content-types/article/schema.json
│   │   ├── comment/
│   │   ├── notification/
│   │   └── article-bookmark/
│   ├── extensions/
│   │   └── users-permissions/
│   │       └── strapi-server.ts          # OAuth, email hashing, refresh tokens
│   ├── services/
│   │   ├── csrf-token.ts
│   │   ├── session-store.ts
│   │   └── refresh-token.ts
│   ├── middlewares/
│   │   └── security-headers.ts
│   └── index.ts                           # Регистрация middlewares, CSRF, Rate Limiting
└── config/
    └── plugins.ts                         # OAuth redirect configuration
```

### Структура Frontend (Vue 3)

```
frontend/src/
├── api/
│   ├── articles.ts                        # API клиент для статей
│   ├── axios.ts                           # Axios instance с CSRF token
│   └── notifications.ts
├── adapters/
│   └── strapi.ts                          # Адаптеры для Strapi v5 flat format
├── views/
│   ├── HomePage.vue                       # Главная страница (отображает статьи)
│   ├── CreateArticle.vue
│   └── Profile.vue
├── stores/
│   └── auth.ts                            # Pinia store для авторизации
└── router/
    └── index.ts                           # Vue Router с guards
```

### Content Types

**Article** (`api::article.article`):
- `title` (string, required)
- `content` (text, required) - HTML контент
- `excerpt` (text, optional)
- `tags` (json) - массив строк
- `author` (relation → `plugin::users-permissions.user`)
- `preview_image` (media, optional)
- `difficulty` (enum: easy/medium/hard)
- `likes_count`, `dislikes_count`, `comments_count` (integer)
- `publishedAt` (datetime) - null = draft, не null = published

**Comment** (`api::comment.comment`):
- `text` (text)
- `article` (relation → article)
- `author` (relation → user)
- `parent` (relation → comment) - для вложенных комментариев

**Notification** (`api::notification.notification`):
- `type` (enum)
- `user` (relation → user)
- `read` (boolean)

**ArticleBookmark** (`api::article-bookmark.article-bookmark`):
- `article` (relation → article)
- `user` (relation → user)

---

## 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ

### Что проверить

1. **Проверить логи отладки**:
   - После перезагрузки страницы должны появиться логи:
     - `🔵 Total articles in DB: X`
     - `🔵 Raw sample article: {...}`
   - Если `Total articles in DB: 0` - значит статьи не сохраняются (но это не так, они создаются)
   - Если `Total articles in DB > 0`, но `Article.find returned 0` - проблема в `entityService.findMany`

2. **Проверить формат данных в БД**:
   - Может быть проблема с форматом `publishedAt` в SQLite
   - Может быть проблема с тем, как Strapi v5 обрабатывает `$notNull` фильтр

3. **Альтернативные подходы**:
   - Использовать `strapi.db.query('api::article.article').findMany()` вместо `entityService.findMany`
   - Проверить, нужно ли использовать другой формат фильтра для `publishedAt`
   - Попробовать убрать фильтр `publishedAt: { $notNull: true }` и фильтровать вручную

### Возможные решения

**Вариант 1**: Использовать `strapi.db.query` напрямую:
```typescript
const articles = await strapi.db.query('api::article.article').findMany({
  where: { publishedAt: { $notNull: true } },
  orderBy: { publishedAt: 'desc' },
  populate: ['author', 'preview_image'],
  limit,
  offset: start
});
```

**Вариант 2**: Изменить формат фильтра:
```typescript
const filters: any = {
  publishedAt: { $ne: null } // вместо $notNull
};
```

**Вариант 3**: Убрать фильтр и фильтровать вручную:
```typescript
const allArticles = await strapi.entityService.findMany('api::article.article', {
  publicationState: 'live',
  // ...
});
const articles = allArticles.filter(a => a.publishedAt !== null);
```

---

## ✅ ЧТО УЖЕ РАБОТАЕТ

1. ✅ Google OAuth2 авторизация
2. ✅ Email hashing (GDPR compliance)
3. ✅ CSRF protection
4. ✅ Rate limiting
5. ✅ Security headers
6. ✅ HttpOnly cookies для refresh token
7. ✅ Автоматическая установка author при создании статьи
8. ✅ Проверка владельца при update/delete
9. ✅ Создание статей (сохраняются в БД)
10. ✅ Bookmarks, Reactions, Notifications
11. ✅ Получение пользователя (`/api/users/me`)

---

## ❌ ЧТО НЕ РАБОТАЕТ

1. ❌ **Получение списка статей** (`GET /api/articles`) - возвращает пустой массив

---

## 📌 КРИТИЧЕСКИЕ ЗАМЕЧАНИЯ

1. **НЕ удалять механизмы безопасности** - все они критически важны
2. **НЕ создавать автоматическую настройку permissions** - пользователь хочет полный контроль
3. **НЕ возвращать email или части хеша** на фронтенд
4. **НЕ отключать CSRF protection** или Rate Limiting
5. **Использовать Strapi v5 API** - проект использует Strapi v5.30.0 (flat format, не v4 nested format)
6. **Сохранить проверку владельца** при update/delete статей
7. **Автор устанавливается автоматически** из токена - пользователь не может передать его в payload

---

## 🎯 ЦЕЛЬ

Исправить метод `Article.find` так, чтобы он возвращал опубликованные статьи с авторами, сохраняя все механизмы безопасности и не нарушая архитектуру проекта.

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ

- **Strapi версия**: 5.30.0
- **База данных**: SQLite (`.tmp/data.db`)
- **Node.js версия**: v22.20.0
- **Фронтенд**: Vue 3 + TypeScript
- **Порт Strapi**: 1337
- **Порт Frontend**: 5173

---

**Последнее обновление**: 2025-11-04 23:37
**Статус**: Критическая проблема - статьи не возвращаются из API

