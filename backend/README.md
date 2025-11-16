# Backend - Aetheris Platform

Strapi 5.30.0 бэкенд для платформы Aetheris с OAuth2 авторизацией.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd strapi-backend
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

**Обязательные переменные:**
- `APP_KEYS` - сгенерируйте 4 ключа: `openssl rand -base64 32` (повторите 4 раза)
- `JWT_SECRET` - сгенерируйте секрет: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Client ID из Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Client Secret из Google Cloud Console

### 3. Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Создайте OAuth 2.0 Client ID
3. Добавьте Authorized redirect URIs:
   - `http://localhost:1337/api/connect/google/callback` (для разработки)
   - `https://yourdomain.com/api/connect/google/callback` (для продакшена)
4. Скопируйте Client ID и Client Secret в `.env`

### 4. Настройка OAuth в Strapi Admin

1. Запустите Strapi: `npm run develop`
2. Откройте http://localhost:1337/admin
3. Создайте админ-аккаунт (первый запуск)
4. Перейдите в **Settings** → **Users & Permissions Plugin** → **Providers**
5. Найдите **Google** и включите:
   - **Enabled**: ON
   - **Client ID**: ваш Client ID
   - **Client Secret**: ваш Client Secret
   - **Redirect URL**: `http://localhost:1337/api/connect/google/callback`
6. Сохраните настройки

### 5. Настройка прав доступа

В Strapi Admin → **Settings** → **Roles**:

**Public роль:**
- `connect` (GET) - для OAuth подключения
- `callback` (GET) - для OAuth callback

**Authenticated роль:**
- `me` (GET) - для получения текущего пользователя
- `logout` (POST) - для выхода

### 6. Запуск

```bash
# Режим разработки (с hot reload)
npm run develop

# Продакшен режим
npm run build
npm run start
```

## 📋 API Endpoints

### Авторизация

#### `GET /api/connect/google`
Начало OAuth flow. Редиректит на Google авторизацию.

#### `GET /api/auth/google/callback?code=...`
Обработка OAuth callback от Google. Возвращает JWT токен и данные пользователя.

**Ответ:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "avatar": {...},
    "bio": "...",
    "role": {...},
    "confirmed": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/auth/csrf`
Получение CSRF токена для защиты от CSRF атак.

**Ответ:**
```json
{
  "csrfToken": "token_string"
}
```

#### `POST /api/auth/logout`
Выход из системы. Очищает сессию и токены.

**Требует авторизации:** Bearer token в заголовке `Authorization`

### Пользователи

#### `GET /api/users/me`
Получение данных текущего авторизованного пользователя.

**Требует авторизации:** Bearer token в заголовке `Authorization`

**Ответ:**
```json
{
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "bio": "...",
  "avatar": {
    "url": "/uploads/avatar.jpg",
    "formats": {...}
  },
  "coverImage": {
    "url": "/uploads/cover.jpg",
    "formats": {...}
  },
  "confirmed": true,
  "blocked": false,
  "role": {
    "name": "Authenticated",
    "type": "authenticated"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Безопасность

### JWT Tokens
- JWT токены устанавливаются в cookies (`accessToken`, `jwtToken`) после успешной авторизации
- Токены также поддерживаются через заголовок `Authorization: Bearer <token>`
- Время жизни токена: 7 дней

### CORS
- Настроен для фронтенда (`FRONTEND_URL`)
- Поддержка credentials (cookies)
- Разрешены необходимые заголовки

### CSRF Protection
- CSRF защита включена для всех unsafe методов (POST, PUT, DELETE, PATCH)
- Токен получается через `/api/auth/csrf`
- Токен отправляется в заголовке `X-CSRF-Token`

### Rate Limiting
- Настроен через koa-ratelimit
- Защита от brute-force атак

## 🗄️ База данных

По умолчанию используется SQLite (`better-sqlite3`). Для продакшена рекомендуется использовать PostgreSQL или MySQL.

### SQLite (по умолчанию)
```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### PostgreSQL
```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/strapi
```

### MySQL
```env
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
```

## 📁 Структура проекта

```
strapi-backend/
├── config/              # Конфигурация Strapi
│   ├── database.ts      # Настройки БД
│   ├── server.ts        # Настройки сервера
│   ├── middlewares.ts   # Middleware
│   └── plugins.ts      # Плагины
├── src/
│   ├── api/            # API эндпоинты
│   │   ├── auth/       # Авторизация
│   │   └── user/       # Пользователи
│   ├── extensions/     # Расширения
│   │   └── users-permissions/
│   │       └── content-types/
│   │           └── user/
│   │               └── schema.json  # Расширенная User модель
│   └── middlewares/    # Кастомные middleware
│       └── jwt-cookie.ts  # Middleware для JWT cookies
└── .env.example        # Пример переменных окружения
```

## 🔧 Расширенная User модель

User модель расширена следующими полями:
- `avatar` (media, images) - аватар пользователя
- `coverImage` (media, images) - обложка профиля
- `bio` (text) - биография пользователя

## 🐛 Отладка

### Проблема: "Failed to connect to database"
- Проверьте переменные окружения в `.env`
- Убедитесь, что база данных доступна

### Проблема: "OAuth callback failed"
- Проверьте настройки Google OAuth в Strapi Admin
- Убедитесь, что redirect URL совпадает с настройками в Google Console
- Проверьте права доступа для Public роли

### Проблема: "JWT token not found"
- Проверьте, что middleware `jwt-cookie` зарегистрирован
- Проверьте логи сервера на наличие ошибок

## 📚 Дополнительная документация

- [Strapi Documentation](https://docs.strapi.io)
- [Users & Permissions Plugin](https://docs.strapi.io/dev-docs/plugins/users-permissions)
- [OAuth2 Providers](https://docs.strapi.io/dev-docs/plugins/users-permissions#providers)
