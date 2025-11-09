# Настройка OAuth2 авторизации через Google в Strapi

## 🎯 Обзор

Проект полностью переведён на OAuth2 авторизацию через Google. Старые страницы `/login` и `/signin` удалены.

## 📋 Что было сделано

### Backend (Strapi)

1. ✅ Настроен Google OAuth2 provider в `backend/strapi-backend/config/plugins.ts`
2. ✅ Добавлен автоматический редирект на фронтенд после авторизации
3. ✅ Настроен CORS для работы с фронтендом

### Frontend (Vue.js)

1. ✅ Создана страница `/auth` - единственная точка входа для авторизации
2. ✅ Создана страница `/auth/callback` - обработка редиректа от Google
3. ✅ Создана страница `/auth/finalize` - установка никнейма после первого входа
4. ✅ Обновлён роутер с чистой логикой навигации
5. ✅ Удалены старые страницы авторизации

## 🔧 Настройка Strapi Admin Panel

### Шаг 1: Настройка прав доступа

1. Открой Strapi Admin Panel: http://localhost:1337/admin
2. Войди с admin логином
3. Перейди в **Settings** (⚙️ внизу слева)
4. Выбери **Users & Permissions plugin** → **Roles**

#### Роль "Public" (неавторизованные пользователи)

Кликни на **Public** и установи следующие права:

**Users-permissions**:
- ✅ `connect` - (GET) Разрешить подключение через провайдеры OAuth

Сохрани изменения.

#### Роль "Authenticated" (авторизованные пользователи)

Кликни на **Authenticated** и установи следующие права:

**Users-permissions**:
- ✅ `me` - (GET) `/api/users/me` - получение своих данных
- ✅ `find` - (GET) `/api/users` - получение списка пользователей (опционально)
- ✅ `findOne` - (GET) `/api/users/:id` - получение данных пользователя по ID

**ВАЖНО**: Для обновления профиля создадим кастомный endpoint или используем расширение:

### Шаг 2: Разрешить пользователям обновлять только свой профиль

Strapi не позволяет по умолчанию пользователям обновлять свои данные через стандартный endpoint.

**Вариант 1: Через расширение контроллера (рекомендуется)**

Создай файл `backend/strapi-backend/src/extensions/users-permissions/controllers/user.ts`:

```typescript
export default {
  async updateMe(ctx) {
    const userId = ctx.state.user.id;
    const { username } = ctx.request.body;

    // Валидация
    if (!username || username.length < 3 || username.length > 24) {
      return ctx.badRequest('Invalid username');
    }

    // Проверка уникальности
    const existing = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { username } });

    if (existing && existing.id !== userId) {
      return ctx.badRequest('Username already taken');
    }

    // Обновляем только username
    const updated = await strapi.db
      .query('plugin::users-permissions.user')
      .update({
        where: { id: userId },
        data: { username },
      });

    return updated;
  },
};
```

Создай файл `backend/strapi-backend/src/extensions/users-permissions/routes/custom-user.ts`:

```typescript
export default {
  routes: [
    {
      method: 'PUT',
      path: '/users/me',
      handler: 'user.updateMe',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

**Вариант 2: Временное решение (быстрое)**

В роли **Authenticated** включи:
- ✅ `update` - (PUT) `/api/users/:id`

⚠️ **Внимание**: Это небезопасно, так как пользователи смогут обновлять данные других пользователей. Используй только для тестирования!

### Шаг 3: Проверка Google OAuth2 настроек

1. Перейди в **Settings** → **Users & Permissions plugin** → **Providers**
2. Найди **Google**
3. Убедись что:
   - ✅ Enabled: `ON`
   - ✅ Client ID: Заполнен (из Google Cloud Console)
   - ✅ Client Secret: Заполнен
   - ✅ Redirect URL: `http://localhost:1337/api/connect/google/callback`

4. **Нажми Save**

## 🚀 Запуск проекта

### Терминал 1: Strapi Backend

```bash
cd backend/strapi-backend
npm run dev
```

### Терминал 2: Vue Frontend

```bash
npm run dev
```

## ✅ Тестирование OAuth Flow

1. Открой http://localhost:5173
2. Кликни на любую защищённую страницу (или сразу перейди на http://localhost:5173/auth)
3. Нажми **"Продолжить с Google"**
4. Выбери Google аккаунт
5. Тебя перенаправит на `/auth/callback` → автоматически на `/auth/finalize`
6. Введи никнейм (3-24 символа, латиница, цифры, `-`, `_`)
7. Нажми **"Продолжить"**
8. Ты должен быть авторизован и перенаправлен на главную страницу

## 📝 Переменные окружения

### Backend: `backend/strapi-backend/.env`

```env
# URLs
PUBLIC_URL=http://localhost:1337
FRONTEND_URL=http://localhost:5173

# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:1337/api/connect/google/callback

# Strapi secrets
APP_KEYS=generate-random-keys-here
JWT_SECRET=generate-random-secret
API_TOKEN_SALT=generate-random-salt
ADMIN_JWT_SECRET=generate-random-secret
```

### Frontend: `.env` (если нужно)

```env
VITE_API_BASE_URL=http://localhost:1337
VITE_FRONTEND_URL=http://localhost:5173
```

## 🔒 Безопасность

- ✅ JWT токены хранятся в localStorage
- ✅ Токены автоматически добавляются к запросам через Axios interceptor
- ✅ При 401 ошибке токены автоматически удаляются
- ✅ Навигационные guards защищают приватные маршруты
- ⚠️ TODO: Добавить проверку роли админа для `/admin`
- ⚠️ TODO: Реализовать безопасное обновление профиля (только свой)

## 🎨 Архитектура

```
Frontend Flow:
1. User → /auth (Auth.vue)
2. Click "Google" → window.location = "http://localhost:1337/api/connect/google?redirectUrl=..."
3. Google → Login → Redirect to Strapi
4. Strapi → Validate → Create/Update User → Redirect to Frontend
5. Frontend → /auth/callback?access_token=... (AuthCallback.vue)
6. Save token → Fetch user data → Redirect based on username
7a. No username → /auth/finalize (AuthFinalize.vue) → Set nickname → Home
7b. Has username → Home (/)
```

## 🐛 Troubleshooting

### Проблема: "Токен не найден" в /auth/callback

**Причина**: Strapi не редиректит правильно

**Решение**:
1. Проверь `backend/strapi-backend/config/plugins.ts` - должен быть `redirect: { success: ... }`
2. Перезапусти Strapi: `Ctrl+C`, затем `npm run dev`
3. Очисть кэш браузера

### Проблема: "Failed to fetch user: 401"

**Причина**: Нет прав на `/api/users/me`

**Решение**:
1. Зайди в Strapi Admin → Settings → Roles → Authenticated
2. Включи `users-permissions.me` (GET)
3. Сохрани

### Проблема: "Не удалось сохранить никнейм"

**Причина**: Нет прав на обновление пользователя

**Решение**:
1. Создай кастомный endpoint (см. выше) ИЛИ
2. Временно включи `update` для роли Authenticated (небезопасно!)

## 📚 Дополнительно

- Документация Strapi Users & Permissions: https://docs.strapi.io/dev-docs/plugins/users-permissions
- Google OAuth2 Setup: https://console.cloud.google.com/apis/credentials

