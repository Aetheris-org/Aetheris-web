# 🚀 Aetheris Community Platform

Современная платформа для сообщества разработчиков с системой статей, курсов, нетворкинга и геймификации.

## 📁 Структура проекта

```
Aetheris shadcn/
├── frontend-react/          # React приложение (основной фронтенд)
│   ├── src/
│   │   ├── api/            # GraphQL API клиенты
│   │   ├── components/      # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── stores/         # Zustand stores
│   │   └── lib/            # Утилиты
│   └── package.json
├── backend/
│   ├── keystonejs-backend/ # KeystoneJS 6 backend (основной)
│   │   ├── schemas/        # KeystoneJS схемы данных
│   │   ├── src/
│   │   │   ├── auth/       # Аутентификация (OAuth2, JWT)
│   │   │   ├── graphql/    # Кастомные GraphQL mutations
│   │   │   ├── lib/        # Утилиты (logger, redis, cache)
│   │   │   └── middlewares/# Express middleware
│   │   ├── scripts/        # Вспомогательные скрипты
│   │   └── keystone.ts     # Главный файл конфигурации
│   └── strapi-backend/     # Старый Strapi backend (не используется)
└── README.md
```

## 🛠️ Технологический стек

### Frontend (`frontend-react/`)

- **React** 18.2.0 + **TypeScript** 5.3.3
- **Vite** 5.0.11 (сборщик)
- **React Router DOM** 6.21.3 (маршрутизация)
- **UI библиотеки:**
  - shadcn/ui (Radix UI компоненты)
  - Tailwind CSS 3.4.1 + tailwindcss-animate
  - Lucide React (иконки)
- **Редактор контента:** TipTap 3.10.5 (Rich Text Editor)
- **State Management:**
  - Zustand 4.5.0 (глобальное состояние)
  - TanStack React Query 5.17.19 (серверное состояние)
- **HTTP клиент:** Axios 1.6.5
- **Интернационализация:** Кастомный хук `useTranslation` (JSON локали)

### Backend (`backend/keystonejs-backend/`)

- **KeystoneJS** 6 - Headless CMS с GraphQL API
- **Node.js** 18+ с **TypeScript**
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** (production) / **SQLite** (development)
- **Redis** (опционально) - для сессий и кэширования
- **Passport.js** - OAuth2 аутентификация (Google)
- **Express** - HTTP сервер
- **GraphQL** - API для всех операций

## 🚀 Быстрый старт

### Frontend

#### Установка и запуск

```bash
cd frontend-react
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

#### Настройка

Создайте файл `.env`:

```bash
cp .env.example .env
```

Убедитесь что содержимое `.env`:
```env
VITE_API_BASE_URL=http://localhost:1337
```

#### Доступные команды

```bash
npm run dev      # Dev сервер (порт 5173)
npm run build    # Production сборка
npm run preview  # Предпросмотр production
npm run lint     # Проверка кода
```

#### Что уже работает

- ✅ Главная страница со списком статей
- ✅ Поиск по статьям
- ✅ Фильтрация (сложность, время чтения, теги, категории)
- ✅ Пагинация
- ✅ Trending статьи в сайдбаре
- ✅ 3 режима отображения карточек (default, line, square)
- ✅ Удаление статей (с подтверждением)
- ✅ Toast уведомления
- ✅ Темная тема
- ✅ Адаптивный дизайн
- ✅ Cookie-based аутентификация
- ✅ CSRF защита

### Backend

```bash
cd backend/keystonejs-backend
npm install
npm run dev
```

Backend будет доступен на `http://localhost:1337`

- **Admin UI:** `http://localhost:1337/`
- **GraphQL API:** `http://localhost:1337/api/graphql`
- **GraphQL Playground:** `http://localhost:1337/api/graphql` (в development)

## 🔧 Переменные окружения

### Быстрый старт

Для быстрой настройки используйте шаблоны `.env.example`:

**Frontend:**
```bash
cd frontend-react
cp .env.example .env
# Отредактируйте .env и заполните необходимые значения
```

**Backend:**
```bash
cd backend/keystonejs-backend
cp .env.example .env
# Отредактируйте .env и заполните необходимые значения
```

### Frontend (`frontend-react/.env`)

Шаблон: `frontend-react/.env.example`

**Обязательные переменные:**
```env
# URL бэкенда (KeystoneJS GraphQL API)
VITE_API_BASE_URL=http://localhost:1337

# URL фронтенда (для OAuth callbacks)
VITE_FRONTEND_URL=http://localhost:5173
```

**Опциональные переменные:**
```env
# API ключ для ImgBB (для загрузки изображений)
VITE_IMGBB_API_KEY=your_imgbb_api_key_here
```

### Backend (`backend/keystonejs-backend/.env`)

Шаблон: `backend/keystonejs-backend/.env.example`

**Обязательные переменные:**

```env
# Database
# Development: SQLite
DATABASE_URL="file:./.tmp/data.db"
# Production: PostgreSQL (Supabase)
# DATABASE_URL="postgresql://user:password@host:5432/database"

# Session & Security (минимум 32 символа)
SESSION_SECRET="your-very-long-secret-key-minimum-32-characters-long"
EMAIL_HMAC_SECRET="your-very-long-secret-key-minimum-32-characters-long"

# OAuth2 (Google)
# ВАЖНО: GOOGLE_CALLBACK_URL должен указывать на BACKEND, а не frontend!
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
PUBLIC_URL="http://localhost:1337"
```

**Опциональные переменные:**

```env
# Redis (для production рекомендуется)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Image Hosting
IMGBB_API_KEY="your_imgbb_api_key_here"

# Server Configuration
PORT="1337"
NODE_ENV="development"
LOG_LEVEL="info"

# Admin User Creation (для скрипта create-first-admin.ts)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
ADMIN_USERNAME="admin"
ADMIN_NAME="Admin"
```

**Генерация секретных ключей:**

```bash
# SESSION_SECRET
openssl rand -base64 64

# EMAIL_HMAC_SECRET
openssl rand -base64 64
```

**Важно:**
- Все переменные с префиксом `VITE_` должны быть доступны во время сборки frontend
- `SESSION_SECRET` и `EMAIL_HMAC_SECRET` должны быть минимум 32 символа
- В production приложение не запустится без обязательных переменных

## 👤 Создание первого администратора

Первый администратор создается автоматически, если база данных пустая. Есть 3 способа создания первого админа:

### Вариант 1: Через endpoint `/api/setup/initial` (рекомендуется)

Этот endpoint создает первого администратора только если база данных пустая. Использует Prisma транзакцию для защиты от race conditions.

**Как работает:**
1. Проверяет, есть ли уже пользователи в базе данных
2. Если пользователи есть - возвращает ошибку "Initial setup already completed"
3. Если база пустая - создает первого администратора с ролью `admin`
4. Email автоматически хешируется через HMAC-SHA256 перед сохранением
5. Пароль хешируется через bcrypt

**Запуск:**

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

**Ответ:**

```json
{
  "success": true,
  "message": "First admin created successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Важно:**
- Email хешируется через HMAC-SHA256 перед сохранением
- Email не возвращается в ответе (безопасность)
- Работает только один раз (если база уже содержит пользователей - вернет ошибку)
- Использует транзакцию для защиты от одновременных запросов

### Вариант 2: Через скрипт `create-first-admin.ts`

Скрипт создает первого администратора из переменных окружения или значений по умолчанию.

**Как работает:**
1. Проверяет, есть ли уже пользователи в базе данных
2. Если пользователи есть - завершает работу с предупреждением
3. Если база пустая - создает администратора с данными из переменных окружения:
   - `ADMIN_EMAIL` (по умолчанию: `admin@example.com`)
   - `ADMIN_PASSWORD` (по умолчанию: `admin123`)
   - `ADMIN_USERNAME` (по умолчанию: `admin`)
   - `ADMIN_NAME` (по умолчанию: `Admin`)
4. Email автоматически хешируется через HMAC-SHA256 перед сохранением
5. Пароль хешируется через bcrypt

**Запуск:**

```bash
cd backend/keystonejs-backend

# С переменными окружения
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="your-secure-password" \
ADMIN_USERNAME="admin" \
ADMIN_NAME="Admin User" \
npx ts-node scripts/create-first-admin.ts

# Или с значениями по умолчанию
npx ts-node scripts/create-first-admin.ts
```

**Важно:**
- Email хешируется через HMAC-SHA256 перед сохранением
- Email не логируется в консоль (безопасность)
- Работает только один раз (если база уже содержит пользователей - пропускает создание)

### Вариант 3: Через Admin UI (автоматически)

Если база данных пустая, KeystoneJS автоматически покажет форму регистрации при первом открытии Admin UI.

**Как работает:**
1. Откройте `http://localhost:1337/` в браузере
2. Если база пустая - KeystoneJS покажет форму регистрации
3. Заполните форму и создайте первого пользователя
4. Первый созданный пользователь автоматически получает роль `admin`

**Важно:**
- Email хешируется автоматически через middleware
- Этот способ работает только если база данных полностью пустая

## 🔒 Безопасность

### Реализованные меры безопасности

- ✅ **Хеширование email** - Все email адреса хешируются через HMAC-SHA256 перед сохранением
- ✅ **Контроль доступа к Admin UI** - Только пользователи с ролью `admin` могут получить доступ
- ✅ **Защита от brute-force атак** - Rate limiting для всех GraphQL запросов (кроме Admin UI)
- ✅ **Логирование событий безопасности** - Все попытки входа и доступа к Admin UI логируются
- ✅ **Проверка силы секретов** - При старте проверяется длина `SESSION_SECRET` и `EMAIL_HMAC_SECRET` (минимум 32 символа)
- ✅ **Security headers** - Helmet настроен для защиты от XSS, CSRF и других атак
- ✅ **JWT сессии** - Stateless сессии с httpOnly cookies
- ✅ **Хеширование паролей** - Все пароли хешируются через bcrypt (10 rounds)
- ✅ **CORS защита** - Настроен только для разрешенных доменов
- ✅ **Валидация входных данных** - Zod схемы для всех пользовательских данных

### Email хеширование

Все email адреса хешируются через **HMAC-SHA256** перед сохранением в базу данных:

- **Алгоритм:** HMAC-SHA256 с секретным ключом `EMAIL_HMAC_SECRET`
- **Формат:** 64-символьный hex строки
- **Защита:** От радужных таблиц (нужен секретный ключ для расшифровки)
- **Обратная совместимость:** Старые SHA-256 хеши автоматически перехешируются при следующем OAuth входе

**Важно:**
- Email никогда не логируется в открытом виде
- Email не возвращается в API ответах
- Email не хранится в сессиях

## 📋 API

### GraphQL Endpoint

`POST /api/graphql`

Все запросы выполняются через GraphQL API. KeystoneJS автоматически генерирует схему на основе определенных схем данных.

**Пример запроса:**

```graphql
query GetArticles {
  articles(where: { publishedAt: { not: null } }, take: 10) {
    id
    title
    excerpt
    author {
      id
      username
      avatar
    }
    tags
    difficulty
    likes_count
    views
    publishedAt
  }
}
```

### Кастомные Mutations

- `reactToArticle(articleId: ID!, reaction: ReactionType!)` - реакция на статью (like/dislike)
- `reactToComment(commentId: ID!, reaction: ReactionType!)` - реакция на комментарий
- `searchArticles(search: String, tags: [String!], difficulty: Difficulty, skip: Int, take: Int)` - поиск и фильтрация статей
- `updateProfile(username: String, bio: String, avatar: String, coverImage: String)` - обновление профиля пользователя

### REST Endpoints

- `GET /api/connect/google` - начало OAuth2 flow (редирект на Google)
- `GET /api/connect/google/callback` - OAuth2 callback от Google
- `POST /api/setup/initial` - создание первого администратора (только если база пустая)
- `POST /api/auth/oauth/session` - создание KeystoneJS сессии для OAuth пользователей
- `POST /api/upload/image` - загрузка изображений на ImgBB

## 🏗️ Сборка и деплой (для DevOps и системных администраторов)

### Обзор архитектуры

Проект состоит из двух независимых приложений:
- **Frontend** (`frontend-react/`) - React SPA, собирается в статические файлы
- **Backend** (`backend/keystonejs-backend/`) - KeystoneJS сервер с GraphQL API

### Требования к системе

#### Backend
- **Node.js**: версия 18.x - 22.x (проверено на 18.x)
- **npm**: версия 6.0.0 или выше
- **База данных**: PostgreSQL (production) или SQLite (development)
- **Опционально**: Redis для сессий и кэширования

#### Frontend
- **Node.js**: версия 18.x или выше
- **npm**: версия 6.0.0 или выше

### Процесс сборки

#### 1. Backend сборка

```bash
cd backend/keystonejs-backend

# Установка зависимостей
npm install

# Сборка проекта (автоматически генерирует Prisma клиент)
npm run build
```

**Что происходит при сборке:**
1. `prebuild`: Запускается скрипт `fix-next-config.js` для исправления конфигурации Next.js Admin UI
2. `build`: KeystoneJS собирает проект, включая Admin UI и **автоматически генерирует Prisma клиент** из `schema.prisma`
3. `postbuild`: Запускается `fix-next-config.js` для финальной проверки и скрипт `generate-prisma-client.js` для проверки Prisma клиента

**Важно:**
- Скрипт `fix-next-config.js` исправляет ошибку "Html should not be imported outside of pages/_document" путем установки `output: 'standalone'` в конфигурации Next.js
- Это необходимо, так как Admin UI не должен статически экспортироваться
- **Не запускайте `prisma generate` вручную** - `keystone build` автоматически генерирует Prisma клиент в правильное место (`@keystone-6/core/node_modules/.prisma/client/`)
- KeystoneJS использует вложенный Prisma клиент внутри `@keystone-6/core`, поэтому обычный `prisma generate` не подходит

**Результат сборки:**
- Скомпилированный код в `dist/`
- Admin UI в `.keystone/admin/.next/`
- Prisma клиент автоматически сгенерирован в `@keystone-6/core/node_modules/.prisma/client/`

#### 2. Frontend сборка

```bash
cd frontend-react

# Установка зависимостей
npm install

# Проверка типов TypeScript
npm run lint

# Сборка проекта
npm run build
```

**Что происходит при сборке:**
1. `tsc`: Проверка типов TypeScript
2. `vite build`: Сборка React приложения в статические файлы

**Результат сборки:**
- Статические файлы в `dist/`
- Оптимизированные JS/CSS бандлы
- HTML файлы для SPA

**Переменные окружения для сборки:**
```env
VITE_API_BASE_URL=https://your-backend.example.com
VITE_FRONTEND_URL=https://your-frontend.example.com
VITE_IMGBB_API_KEY=your_imgbb_api_key_here  # Опционально
```

**Важно:** Все переменные, начинающиеся с `VITE_`, должны быть доступны во время сборки, так как Vite встраивает их в код на этапе билда.

### Деплой

#### Вариант 1: Деплой на Render.com

##### Backend на Render

1. **Создайте Web Service в Render:**
   - Подключите GitHub репозиторий
   - Выберите ветку `main` (или нужную)

2. **Настройки сервиса:**
   - **Name**: `aetheris-backend` (или любое другое)
   - **Environment**: `Node`
   - **Build Command**: `cd backend/keystonejs-backend && npm install && npm run build`
   - **Start Command**: `cd backend/keystonejs-backend && npm start`
   - **Node Version**: `18.x` (или выше, но не выше 22.x)

   **Важно:** `keystone build` автоматически генерирует Prisma клиент из `schema.prisma` в правильное место (`@keystone-6/core/node_modules/.prisma/client/`). Не запускайте `prisma generate` вручную в Build Command, так как это может конфликтовать с механизмом KeystoneJS.

3. **Переменные окружения:**
```env
   # Database (обязательно)
DATABASE_URL="postgresql://user:password@host:5432/database"

   # Security (обязательно, минимум 32 символа)
SESSION_SECRET="your-very-long-secret-key-minimum-32-characters-long"
EMAIL_HMAC_SECRET="your-very-long-secret-key-minimum-32-characters-long"

   # OAuth2 Google (обязательно)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="https://your-backend.onrender.com/api/connect/google/callback"

   # URLs (обязательно)
FRONTEND_URL="https://your-frontend.onrender.com"
PUBLIC_URL="https://your-backend.onrender.com"

   # Redis (опционально)
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# Environment
NODE_ENV="production"
LOG_LEVEL="info"
PORT="1337"
```

4. **Health Check:**
   - Render автоматически проверяет доступность сервиса
   - Backend должен отвечать на `GET /` (Admin UI) или `GET /api/graphql` (GraphQL endpoint)

##### Frontend на Render (Static Site)

1. **Создайте Static Site в Render:**
   - Подключите GitHub репозиторий
   - Выберите ветку `main`

2. **Настройки:**
   - **Build Command**: `cd frontend-react && npm install && npm run build`
   - **Publish Directory**: `frontend-react/dist`

3. **Переменные окружения для сборки:**
   ```env
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_FRONTEND_URL=https://your-frontend.onrender.com
   ```

4. **Настройка редиректов (для SPA):**
   - Создайте файл `frontend-react/public/_redirects`:
   ```
   /*    /index.html   200
   ```

#### Вариант 2: Деплой на Vercel

##### Backend на Vercel

1. **Создайте проект:**
   ```bash
   vercel init
   ```

2. **Создайте `vercel.json` в корне проекта:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/keystonejs-backend/package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/keystonejs-backend/$1"
       },
       {
         "src": "/(.*)",
         "dest": "backend/keystonejs-backend/$1"
       }
     ]
   }
   ```

3. **Настройте переменные окружения в Vercel Dashboard**

##### Frontend на Vercel

1. **Создайте проект:**
   ```bash
   cd frontend-react
   vercel
   ```

2. **Настройки:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Переменные окружения:**
   ```env
   VITE_API_BASE_URL=https://your-backend.vercel.app
   VITE_FRONTEND_URL=https://your-frontend.vercel.app
   ```

#### Вариант 3: Деплой на собственный сервер

##### Backend

1. **Подготовка сервера:**
   ```bash
   # Установка Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Установка PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Установка PM2 для управления процессами
   sudo npm install -g pm2
   ```

2. **Клонирование и сборка:**
   ```bash
   git clone https://github.com/your-org/aetheris.git
   cd aetheris/backend/keystonejs-backend
   npm install
   npm run build
   ```

3. **Настройка переменных окружения:**
   ```bash
   # Создайте .env файл
   nano .env
   # Добавьте все необходимые переменные (см. раздел "Переменные окружения")
   ```

4. **Запуск с PM2:**
   ```bash
   pm2 start npm --name "aetheris-backend" -- start
   pm2 save
   pm2 startup
   ```

5. **Настройка Nginx (опционально):**
   ```nginx
   server {
       listen 80;
       server_name your-backend.example.com;
       
       location / {
           proxy_pass http://localhost:1337;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

##### Frontend

1. **Сборка:**
   ```bash
   cd frontend-react
   npm install
   npm run build
   ```

2. **Деплой статических файлов:**
   ```bash
   # Вариант 1: Nginx
   sudo cp -r dist/* /var/www/html/
   
   # Вариант 2: Apache
   sudo cp -r dist/* /var/www/html/
   ```

3. **Настройка Nginx для SPA:**
   ```nginx
   server {
       listen 80;
       server_name your-frontend.example.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Миграции базы данных

**Важно:** Перед первым запуском в production необходимо применить миграции Prisma.

```bash
cd backend/keystonejs-backend

# Применение миграций
npm run prisma:migrate

# Или через Prisma CLI напрямую
npx prisma migrate deploy
```

**Автоматические миграции:**
- KeystoneJS автоматически применяет миграции при первом запуске, если `useMigrations: true` в конфигурации
- Для production рекомендуется применять миграции вручную перед запуском

### Переключение с SQLite на PostgreSQL

Если вы использовали SQLite в development и хотите переключиться на PostgreSQL в production, выполните следующие шаги:

#### Шаг 1: Обновите Prisma схему

Измените провайдер базы данных в файле `backend/keystonejs-backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Измените с "sqlite" на "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Шаг 2: Обновите переменную окружения DATABASE_URL

В production установите PostgreSQL connection string:

```env
# Вместо SQLite:
# DATABASE_URL="file:./.tmp/data.db"

# Используйте PostgreSQL:
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"
```

**Пример для Supabase:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Пример для Render PostgreSQL:**
```env
DATABASE_URL="postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname"
```

#### Шаг 3: Проверьте тип ID в keystone.ts

В `keystone.ts` (строка 78) для PostgreSQL по умолчанию используется `uuid`, а для SQLite - `autoincrement`. 

**Вариант A: Использовать UUID (рекомендуется для новых проектов)**

Оставьте как есть в `keystone.ts`:
```typescript
idField: { kind: dbProvider === 'postgresql' ? 'uuid' : 'autoincrement' },
```

При первой миграции KeystoneJS создаст таблицы с UUID. **Важно:** Существующие данные с Int ID не перенесутся автоматически.

**Вариант B: Использовать Int (если нужно сохранить существующие данные)**

Если у вас уже есть данные в SQLite и вы хотите их мигрировать, измените в `keystone.ts`:
```typescript
idField: { kind: 'autoincrement' },  // Всегда используем autoincrement
```

#### Шаг 4: Установите PostgreSQL драйвер

Убедитесь, что `pg` установлен (уже есть в `package.json`):
```bash
cd backend/keystonejs-backend
npm install pg
```

#### Шаг 5: Создайте базу данных PostgreSQL

**Через Supabase:**
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте `DATABASE_URL` из настроек проекта

**Через собственный сервер:**
```sql
CREATE DATABASE aetheris_production;
```

**Через Render:**
1. Создайте PostgreSQL сервис в Render
2. Скопируйте Internal Database URL или External Database URL

#### Шаг 6: Примените миграции

```bash
cd backend/keystonejs-backend

# Сгенерируйте Prisma Client для PostgreSQL
npm run prisma:generate

# Создайте и примените миграции
npm run prisma:migrate
# Или напрямую:
npx prisma migrate dev --name init_postgresql
```

**Для production:**
```bash
npx prisma migrate deploy
```

#### Шаг 7: Миграция данных (если есть существующие данные в SQLite)

Если у вас есть данные в SQLite, которые нужно перенести в PostgreSQL:

**Вариант 1: Использование pgloader (рекомендуется)**

```bash
# Установка pgloader
# macOS:
brew install pgloader

# Ubuntu/Debian:
sudo apt-get install pgloader

# Миграция данных
pgloader sqlite://backend/keystonejs-backend/.tmp/data.db \
         postgresql://user:password@host:5432/database_name
```

**Вариант 2: Ручной экспорт/импорт**

1. **Экспортируйте данные из SQLite:**
```bash
cd backend/keystonejs-backend
sqlite3 .tmp/data.db .dump > sqlite_dump.sql
```

2. **Конвертируйте SQL в PostgreSQL формат:**
   - Замените `INTEGER PRIMARY KEY` на `SERIAL PRIMARY KEY`
   - Уберите SQLite-специфичные команды
   - Исправьте синтаксис дат и других типов данных

3. **Импортируйте в PostgreSQL:**
```bash
psql $DATABASE_URL < converted_dump.sql
```

**Важно:** При миграции данных убедитесь, что:
- Все внешние ключи корректны
- Индексы созданы
- Типы данных совместимы

#### Шаг 8: Перезапустите приложение

```bash
# В production
pm2 restart aetheris-backend

# Или если используете другой процесс-менеджер
npm start
```

#### Проверка успешной миграции

1. **Проверьте подключение:**
```bash
cd backend/keystonejs-backend
npx prisma studio
# Откроется Prisma Studio, подключенная к PostgreSQL
```

2. **Проверьте логи:**
```bash
tail -f logs/application-$(date +%Y-%m-%d).log
# Должны быть сообщения об успешном подключении к PostgreSQL
```

3. **Проверьте Admin UI:**
```
https://your-backend.example.com/
# Должен открыться без ошибок
```

4. **Проверьте данные:**
```bash
# Подключитесь к PostgreSQL
psql $DATABASE_URL

# Проверьте таблицы
\dt

# Проверьте количество записей
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Article";
```

#### Важные замечания

1. **Автоматическое определение провайдера:**
   - KeystoneJS автоматически определяет провайдер по `DATABASE_URL` (строки 19-24 в `keystone.ts`)
   - Если `DATABASE_URL` начинается с `postgresql://` или `postgres://`, используется PostgreSQL
   - Иначе используется SQLite

2. **Тип ID:**
   - Если используете UUID для PostgreSQL, все новые записи будут с UUID
   - Старые Int ID не совместимы без миграции данных
   - Для нового проекта рекомендуется использовать UUID

3. **Резервное копирование:**
   - **Перед миграцией** создайте бэкап SQLite:
   ```bash
   cp backend/keystonejs-backend/.tmp/data.db \
      backend/keystonejs-backend/.tmp/data.db.backup
   ```
   - **После миграции** создайте бэкап PostgreSQL:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

4. **Для чистого production (без миграции данных):**
   - Просто измените `DATABASE_URL` на PostgreSQL connection string
   - Примените миграции - KeystoneJS создаст пустую базу с правильной структурой
   - Создайте первого администратора через `/api/setup/initial`

5. **Обратная миграция (PostgreSQL → SQLite):**
   - Не рекомендуется для production
   - Используйте только для development/testing
   - Может потребоваться ручная конвертация типов данных

### Создание первого администратора

После успешного деплоя backend, создайте первого администратора:

```bash
curl -X POST https://your-backend.example.com/api/setup/initial \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "username": "admin",
    "name": "Admin User"
  }'
```

**Важно:**
- Этот endpoint работает только один раз (если база данных пустая)
- Email и пароль должны быть надежными
- После создания администратора, войдите в Admin UI по адресу `https://your-backend.example.com/`

### Настройка Google OAuth

1. **Создайте OAuth 2.0 Client в Google Cloud Console:**
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Создайте новый OAuth 2.0 Client ID
   - Добавьте **Authorized redirect URIs**:
     - `https://your-backend.example.com/api/connect/google/callback`

2. **Скопируйте Client ID и Client Secret:**
   - Добавьте их в переменные окружения backend:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
   - Установите `GOOGLE_CALLBACK_URL`:
     - `https://your-backend.example.com/api/connect/google/callback`

### Мониторинг и логирование

#### Логи Backend

Логи сохраняются в:
- `backend/keystonejs-backend/logs/application-YYYY-MM-DD.log` - общие логи
- `backend/keystonejs-backend/logs/error-YYYY-MM-DD.log` - ошибки
- `backend/keystonejs-backend/logs/exceptions.log` - исключения
- `backend/keystonejs-backend/logs/rejections.log` - необработанные промисы

**Настройка уровня логирования:**
```env
LOG_LEVEL="info"  # debug, info, warn, error
```

#### Health Checks

Backend предоставляет следующие endpoints для мониторинга:
- `GET /` - Admin UI (требует авторизации)
- `GET /api/graphql` - GraphQL endpoint (можно использовать для health check)

**Пример health check скрипта:**
```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://your-backend.example.com/api/graphql)
if [ $response -eq 200 ] || [ $response -eq 400 ]; then
  echo "Backend is healthy"
  exit 0
else
  echo "Backend is down"
  exit 1
fi
```

### Troubleshooting

#### Backend не запускается

1. **Проверьте переменные окружения:**
   ```bash
   # Backend проверяет длину SESSION_SECRET и EMAIL_HMAC_SECRET при старте
   # Они должны быть минимум 32 символа
   ```

2. **Проверьте подключение к базе данных:**
   ```bash
   # Тест подключения к PostgreSQL
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Проверьте логи:**
   ```bash
   tail -f backend/keystonejs-backend/logs/application-$(date +%Y-%m-%d).log
   ```

#### Ошибка "Html should not be imported outside of pages/_document"

Эта ошибка возникает при сборке Admin UI. Решение:
- Скрипт `fix-next-config.js` автоматически исправляет это при сборке
- Убедитесь, что скрипт выполняется в `prebuild` и `postbuild` хуках

#### Ошибка "@prisma/client did not initialize yet"

Эта ошибка возникает при запуске KeystoneJS на Render или в production.

**Причина:**
- KeystoneJS использует вложенный Prisma клиент в `@keystone-6/core/node_modules/.prisma/client/`
- Обычный `prisma generate` генерирует клиент в `./node_modules/@prisma/client`, что не подходит для KeystoneJS

**Решение:**
1. **Убедитесь, что `keystone build` выполняется в Build Command:**
   ```
   cd backend/keystonejs-backend && npm install && npm run build
   ```
   `keystone build` автоматически генерирует Prisma клиент в правильное место.

2. **Не запускайте `prisma generate` вручную в Build Command** - это может конфликтовать с механизмом KeystoneJS.

3. **Если проблема сохраняется:**
   - Убедитесь, что `schema.prisma` существует в корне `backend/keystonejs-backend/`
   - Проверьте, что `keystone build` выполняется успешно
   - Проверьте логи сборки на наличие ошибок

4. **Для локальной разработки:**
   ```bash
   cd backend/keystonejs-backend
   npm run dev  # keystone dev автоматически генерирует Prisma клиент
   ```

#### Frontend не подключается к Backend

1. **Проверьте CORS настройки:**
   - Убедитесь, что `FRONTEND_URL` в backend совпадает с URL frontend
   - Проверьте, что `VITE_API_BASE_URL` в frontend указывает на правильный backend URL

2. **Проверьте сетевые запросы в браузере:**
   - Откройте DevTools → Network
   - Проверьте, что запросы идут на правильный URL
   - Проверьте наличие CORS ошибок

### Резервное копирование

#### База данных

**PostgreSQL:**
```bash
# Создание бэкапа
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

**Автоматическое резервное копирование (cron):**
```bash
# Добавьте в crontab
0 2 * * * pg_dump $DATABASE_URL > /backups/aetheris_$(date +\%Y\%m\%d).sql
```

### Обновление приложения

1. **Остановите приложение:**
   ```bash
   pm2 stop aetheris-backend
   ```

2. **Обновите код:**
   ```bash
   git pull origin main
   ```

3. **Обновите зависимости:**
   ```bash
   cd backend/keystonejs-backend
   npm install
   ```

4. **Примените миграции (если есть):**
   ```bash
   npm run prisma:migrate
   ```

5. **Пересоберите:**
   ```bash
   npm run build
   ```

6. **Перезапустите:**
   ```bash
   pm2 restart aetheris-backend
   ```

### Безопасность

**Обязательные меры безопасности:**
1. ✅ Используйте HTTPS в production
2. ✅ Установите надежные `SESSION_SECRET` и `EMAIL_HMAC_SECRET` (минимум 32 символа)
3. ✅ Настройте firewall для ограничения доступа к базе данных
4. ✅ Регулярно обновляйте зависимости (`npm audit`)
5. ✅ Используйте Redis для сессий в production
6. ✅ Настройте rate limiting (уже реализовано в коде)
7. ✅ Регулярно создавайте резервные копии базы данных

**Проверка безопасности:**
```bash
# Проверка уязвимостей в зависимостях
cd backend/keystonejs-backend
npm audit

cd ../../frontend-react
npm audit
```

## 📖 Документация

- [TODO_NEW.md](TODO_NEW.md) - Список задач и планов
- [COURSES_INTEGRATION_GUIDE.md](COURSES_INTEGRATION_GUIDE.md) - Руководство по интеграции курсов
- [FRIENDS_INTEGRATION_GUIDE.md](FRIENDS_INTEGRATION_GUIDE.md) - Руководство по интеграции друзей
- [backend/keystonejs-backend/SECURITY.md](backend/keystonejs-backend/SECURITY.md) - Детальная информация о безопасности

## 🎯 Особенности

- **Современный стек** - React 18, TypeScript, KeystoneJS 6
- **Компонентная архитектура** - shadcn/ui
- **TypeScript** - полная типобезопасность
- **Адаптивный дизайн** - Tailwind CSS
- **Темная/светлая тема** - через CSS переменные
- **Интернационализация** - поддержка нескольких языков (EN/RU)
- **OAuth2 авторизация** - только через Google (email/password не используется)
- **Безопасность** - хеширование email, rate limiting, security headers

## 📝 Статус проекта

- ✅ Frontend: React приложение готово
- ✅ Backend: KeystoneJS backend готов
- ✅ API интеграция: GraphQL API работает
- ✅ Аутентификация: OAuth2 Google реализована
- ✅ Безопасность: Хеширование email, rate limiting, security headers
- 🔄 Production: Готов к деплою на Render + Supabase

## 🔧 Разработка

### Backend команды

```bash
cd backend/keystonejs-backend

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

### Frontend команды

```bash
cd frontend-react

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## 📝 License

MIT

---

**Создано с ❤️ используя React + KeystoneJS**
