# KeystoneJS Backend

Backend для платформы Aetheris на базе KeystoneJS 6 с GraphQL API.

## 🔒 Безопасность

**ВАЖНО**: Перед запуском в production обязательно прочитайте [SECURITY.md](./SECURITY.md)!

Реализованные меры безопасности:
- ✅ Контроль доступа к Admin UI (только для админов)
- ✅ Защита от brute-force атак (rate limiting)
- ✅ Логирование всех событий безопасности
- ✅ Проверка силы SESSION_SECRET при старте
- ✅ Security headers (Helmet)
- ✅ JWT сессии с хешированием паролей

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL="file:./.tmp/data.db"

# Session & Security (минимум 32 символа для SESSION_SECRET)
SESSION_SECRET="your-very-long-secret-key-minimum-32-characters-long"

# OAuth2 (Google)
# ВАЖНО: GOOGLE_CALLBACK_URL должен указывать на BACKEND, а не frontend!
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
PUBLIC_URL="http://localhost:1337"

# Redis (опционально)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Logging
LOG_LEVEL="info"
NODE_ENV="development"
```

### 3. Создание первого администратора

**Вариант 1: Через endpoint (рекомендуется)**

После запуска сервера отправьте POST запрос:

```bash
curl -X POST http://localhost:1337/api/setup/initial \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "username": "admin",
    "name": "Admin User"
  }'
```

**Вариант 2: Через GraphQL Playground**

1. Откройте `http://localhost:1337/api/graphql` в браузере
2. Выполните mutation:

```graphql
mutation CreateFirstAdmin {
  createUser(data: {
    email: "admin@example.com"
    password: "your-secure-password"
    username: "admin"
    name: "Admin User"
    role: "admin"
    provider: "local"
    confirmed: true
    blocked: false
  }) {
    id
    email
    username
    role
  }
}
```

**Вариант 3: Через скрипт**

```bash
npx ts-node scripts/create-first-admin.ts
```

### 4. Запуск сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:1337`

- Admin UI: `http://localhost:1337/`
- GraphQL API: `http://localhost:1337/api/graphql`
- GraphQL Playground: `http://localhost:1337/api/graphql` (в development)

## Структура проекта

```
backend/keystonejs-backend/
├── schemas/              # KeystoneJS схемы данных
│   ├── User.ts
│   ├── Article.ts
│   ├── Comment.ts
│   ├── ArticleReaction.ts
│   └── CommentReaction.ts
├── src/
│   ├── auth/            # Аутентификация (OAuth2, JWT)
│   ├── graphql/         # Кастомные GraphQL mutations
│   ├── lib/             # Утилиты (logger, redis, cache)
│   └── middlewares/     # Express middleware
├── scripts/             # Вспомогательные скрипты
├── prisma/              # Prisma schema
└── keystone.ts          # Главный файл конфигурации
```

## Безопасность

- Admin UI доступен только для пользователей с ролью `admin`
- Первый созданный пользователь автоматически получает роль `admin`
- Все пароли автоматически хешируются через bcrypt
- Используются httpOnly cookies для сессий
- Настроены CORS, Helmet, rate limiting

## API

### GraphQL Endpoint

`POST /api/graphql`

Все запросы выполняются через GraphQL API. KeystoneJS автоматически генерирует схему на основе определенных схем данных.

### Кастомные Mutations

- `reactToArticle(articleId: ID!, reaction: ReactionType!)` - реакция на статью
- `reactToComment(commentId: ID!, reaction: ReactionType!)` - реакция на комментарий

### REST Endpoints (для OAuth2)

- `GET /api/connect/google` - начало OAuth2 flow
- `GET /api/connect/google/callback` - OAuth2 callback
- `POST /api/setup/initial` - создание первого администратора

## Разработка

```bash
# Development mode
npm run dev

# Build
npm run build

# Production
npm start

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Миграция с Strapi

Этот backend заменяет `backend/strapi-backend/`. Старый Strapi backend можно оставить для справки, но он больше не используется.
