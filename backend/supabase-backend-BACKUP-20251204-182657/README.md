# Supabase Backend для Aetheris Platform

Современный бэкенд на основе Supabase, Express и Apollo Server (GraphQL) для платформы Aetheris.

## 🚀 Технологический стек

- **Node.js 18-22** с TypeScript
- **Express** - HTTP сервер
- **Apollo Server** - GraphQL API
- **Supabase** - PostgreSQL база данных и аутентификация
- **Prisma** - ORM для работы с базой данных
- **Winston** - логирование
- **Zod** - валидация данных
- **Helmet, CORS, Rate Limiting** - безопасность

## 📋 Требования

- Node.js >= 18.0.0
- npm >= 6.0.0
- Supabase проект с настроенной базой данных

## 🛠️ Установка

1. **Клонируйте репозиторий и перейдите в директорию:**

```bash
cd backend/supabase-backend
```

2. **Установите зависимости:**

```bash
npm install
```

3. **Настройте переменные окружения:**

Скопируйте `.env.example` в `.env` и заполните все необходимые значения:

```bash
cp .env.example .env
```

Обязательные переменные:
- `SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_ANON_KEY` - Anon ключ Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ Supabase
- `DATABASE_URL` - PostgreSQL connection string

4. **Настройте Prisma:**

```bash
# Генерируем Prisma Client
npm run prisma:generate

# Применяем миграции (если нужно)
npm run prisma:migrate
```

## 🏃 Запуск

### Development режим:

```bash
npm run dev
```

Сервер запустится на `http://localhost:1337`
GraphQL API доступен на `http://localhost:1337/api/graphql`

### Production режим:

```bash
npm run build
npm start
```

## 📚 GraphQL API

### Endpoint

```
POST /api/graphql
```

### Примеры запросов

**Получить текущего пользователя:**

```graphql
query {
  me {
    id
    username
    email
    avatar
  }
}
```

**Получить статьи:**

```graphql
query {
  articles(take: 10) {
    id
    title
    excerpt
    author {
      username
      avatar
    }
    likesCount
    views
  }
}
```

**Создать статью:**

```graphql
mutation {
  createArticle(input: {
    title: "My Article"
    content: { "type": "doc", "content": [] }
    excerpt: "Article excerpt"
    tags: ["tech", "tutorial"]
    difficulty: medium
  }) {
    id
    title
  }
}
```

## 🔐 Аутентификация

Аутентификация выполняется через Supabase Auth. Для запросов к GraphQL API необходимо передать JWT токен в заголовке:

```
Authorization: Bearer <supabase-jwt-token>
```

## 📁 Структура проекта

```
src/
├── graphql/
│   ├── schema.ts          # GraphQL схема
│   ├── context.ts         # GraphQL контекст
│   └── resolvers/         # GraphQL resolvers
│       ├── index.ts
│       ├── user.ts
│       ├── article.ts
│       ├── comment.ts
│       ├── reaction.ts
│       ├── bookmark.ts
│       ├── follow.ts
│       └── notification.ts
├── lib/
│   ├── logger.ts          # Winston logger
│   ├── prisma.ts          # Prisma Client
│   └── supabase.ts        # Supabase клиенты
├── middleware/
│   ├── auth.ts            # Аутентификация
│   └── security.ts         # Безопасность
├── services/
│   ├── article.ts         # Бизнес-логика статей
│   └── notification.ts    # Бизнес-логика уведомлений
├── utils/
│   └── auth.ts            # Утилиты для auth
└── index.ts               # Точка входа
```

## 🔒 Безопасность

- **CORS** - настроен для разрешенных доменов
- **Helmet** - защита HTTP заголовков
- **Rate Limiting** - ограничение количества запросов
- **HPP** - защита от HTTP Parameter Pollution
- **JWT Authentication** - проверка токенов через Supabase
- **Input Validation** - валидация через Zod и express-validator

## 📝 Логирование

Логи сохраняются в директории `logs/`:
- `application-YYYY-MM-DD.log` - общие логи
- `error-YYYY-MM-DD.log` - ошибки
- `exceptions-YYYY-MM-DD.log` - исключения
- `rejections-YYYY-MM-DD.log` - отклоненные промисы

## 🗄️ База данных

База данных управляется через Prisma. Схема находится в `prisma/schema.prisma`.

### Миграции:

```bash
# Создать новую миграцию
npm run prisma:migrate

# Применить миграции
npm run prisma:migrate
```

### Prisma Studio (GUI для БД):

```bash
npm run prisma:studio
```

## 🧪 Тестирование

```bash
# Type checking
npm run type-check
```

## 📖 Документация

Полная документация GraphQL API доступна через GraphQL Playground в development режиме:
`http://localhost:1337/api/graphql`

## 🤝 Вклад

При создании новых features следуйте структуре проекта и используйте существующие паттерны.

## 📄 Лицензия

ISC

