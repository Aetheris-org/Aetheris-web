# 🔐 Настройка OAuth Redirect URL для Supabase

## 📋 Какой Redirect URL нужен?

Redirect URL - это адрес, на который Supabase перенаправит пользователя после успешной авторизации через OAuth (Google, GitHub и т.д.).

### Формат:
```
https://your-domain.com/auth/callback
```

### Для разных окружений:

**Development (локально):**
```
http://localhost:5173/auth/callback
```

**Production (на вашем домене):**
```
https://your-domain.com/auth/callback
```

## 🔍 Где взять Redirect URL?

### 1. Для Development:

Redirect URL уже настроен в коде:
- Файл: `frontend-react/src/api/auth.ts`
- Строка: `redirectTo: \`${window.location.origin}/auth/callback\``

Это означает, что URL будет автоматически:
- `http://localhost:5173/auth/callback` (если запущено на localhost:5173)
- `http://localhost:3000/auth/callback` (если запущено на другом порту)

### 2. Для Production:

Нужно использовать ваш реальный домен:
- Если домен: `https://aetheris.com` → Redirect URL: `https://aetheris.com/auth/callback`
- Если домен: `https://aetheristea.vercel.app` → Redirect URL: `https://aetheristea.vercel.app/auth/callback`

## ⚙️ Как настроить в Supabase Dashboard:

### Шаг 1: Откройте настройки провайдера

1. Зайдите в [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **Authentication** → **Providers**
4. Выберите провайдера (например, **Google**)

### Шаг 2: Добавьте Redirect URL

В разделе **Redirect URLs** добавьте:

**Для Development:**
```
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

**Для Production:**
```
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
```

### Шаг 3: Настройте OAuth приложение

#### Для Google:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте OAuth 2.0 Client ID
3. В **Authorized redirect URIs** добавьте:
   ```
   https://lublvnvoawndnmkgndct.supabase.co/auth/v1/callback
   ```
   ⚠️ **Важно:** Это URL Supabase, а не ваш сайт!

4. Скопируйте **Client ID** и **Client Secret**
5. Вставьте их в Supabase Dashboard → Authentication → Providers → Google

#### Для GitHub:

1. Перейдите в [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Создайте новое OAuth App
3. В **Authorization callback URL** добавьте:
   ```
   https://lublvnvoawndnmkgndct.supabase.co/auth/v1/callback
   ```
   ⚠️ **Важно:** Это URL Supabase, а не ваш сайт!

4. Скопируйте **Client ID** и **Client Secret**
5. Вставьте их в Supabase Dashboard → Authentication → Providers → GitHub

## 📝 Пример настройки:

### В Supabase Dashboard:

**Authentication → Providers → Google:**

```
Enabled: ✅
Client ID: your-google-client-id
Client Secret: your-google-client-secret
Redirect URLs:
  - http://localhost:5173/auth/callback
  - https://your-domain.com/auth/callback
```

### В Google Cloud Console:

**OAuth 2.0 Client ID → Authorized redirect URIs:**

```
https://lublvnvoawndnmkgndct.supabase.co/auth/v1/callback
```

## ⚠️ Важные моменты:

1. **Два разных Redirect URL:**
   - В **Google/GitHub** настройках: URL Supabase (`https://your-project.supabase.co/auth/v1/callback`)
   - В **Supabase Dashboard**: URL вашего сайта (`https://your-domain.com/auth/callback`)

2. **Порядок редиректов:**
   - Пользователь → Google/GitHub → Supabase → Ваш сайт (`/auth/callback`)

3. **HTTPS обязателен для production:**
   - В production используйте только `https://`
   - Для development можно использовать `http://localhost`

4. **Множественные домены:**
   - Можно добавить несколько Redirect URL (для dev, staging, production)

## 🔍 Как проверить:

1. Откройте страницу авторизации
2. Нажмите "Войти через Google"
3. После авторизации вы должны быть перенаправлены на `/auth/callback`
4. Затем автоматически на главную страницу

## 💡 Быстрая настройка:

**Минимальный набор Redirect URL для начала:**

В Supabase Dashboard → Authentication → Providers → Google/GitHub:

```
http://localhost:5173/auth/callback
https://your-production-domain.com/auth/callback
```

Это покроет и development, и production.

