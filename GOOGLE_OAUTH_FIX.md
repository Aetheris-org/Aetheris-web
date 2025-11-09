# 🔧 Исправление ошибки Google OAuth "Error 400: invalid_request"

## ❌ Проблема

При попытке войти через Google появляется ошибка:
- **"Access blocked: Authorization Error"**
- **"Error 400: invalid_request"**
- **"This app doesn't comply with Google's OAuth 2.0 policy"**

## 🔍 Причины

Ошибка возникает из-за несоответствия настроек в Google Cloud Console:

1. **Неправильный Redirect URI** - URL callback не совпадает с зарегистрированным
2. **Приложение в режиме тестирования** - пользователь не добавлен в список тестовых
3. **OAuth Consent Screen не настроен** - не указаны необходимые данные
4. **Неправильные OAuth credentials** - Client ID или Client Secret неверны

## ✅ Решение (пошагово)

### Шаг 1: Проверьте текущий Callback URL

Ваше приложение использует следующий callback URL:
```
http://localhost:1337/api/connect/google/callback
```

### Шаг 2: Настройка Google Cloud Console

#### 2.1. Создайте OAuth 2.0 Client ID

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект (или создайте новый)
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**

#### 2.2. Настройте OAuth Consent Screen

**ВАЖНО**: Сначала настройте Consent Screen!

1. Перейдите в **APIs & Services** → **OAuth consent screen**
2. Выберите тип приложения:
   - **External** - для тестирования (рекомендуется для разработки)
   - **Internal** - только для Google Workspace (если у вас есть)
3. Заполните обязательные поля:
   - **App name**: Aetheris Community (или любое имя)
   - **User support email**: ваш email
   - **Developer contact information**: ваш email
4. Сохраните и продолжите

#### 2.3. Добавьте Scopes

На шаге "Scopes" добавьте:
- `email`
- `profile`
- `openid`

Нажмите **SAVE AND CONTINUE**

#### 2.4. Добавьте тестовых пользователей (ВАЖНО!)

Если приложение в режиме тестирования:

1. На шаге "Test users" нажмите **+ ADD USERS**
2. Добавьте email адреса всех пользователей, которые будут тестировать:
   - `gddeadmaster@gmail.com` (ваш email из ошибки)
   - Другие email адреса тестировщиков
3. Нажмите **SAVE AND CONTINUE**

#### 2.5. Создайте OAuth 2.0 Client ID

1. Вернитесь в **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Выберите тип: **Web application**
4. Заполните:
   - **Name**: Aetheris Strapi Backend (или любое имя)
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:1337
     ```
   - **Authorized redirect URIs**: 
     ```
     http://localhost:1337/api/connect/google/callback
     ```
5. Нажмите **CREATE**
6. **Скопируйте Client ID и Client Secret** (они понадобятся в следующем шаге)

### Шаг 3: Настройте переменные окружения

1. Создайте файл `.env` в папке `backend/strapi-backend/`:

```bash
cd backend/strapi-backend
cp env.example .env
```

2. Откройте `.env` и заполните:

```env
# OAuth2 Google Configuration
GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш-client-secret
GOOGLE_CALLBACK_URL=http://localhost:1337/api/connect/google/callback

# URLs
PUBLIC_URL=http://localhost:1337
FRONTEND_URL=http://localhost:5173
```

3. **ВАЖНО**: Замените `ваш-client-id` и `ваш-client-secret` на реальные значения из Google Cloud Console!

### Шаг 4: Настройте Strapi Admin Panel

1. Откройте Strapi Admin: http://localhost:1337/admin
2. Перейдите в **Settings** → **Users & Permissions plugin** → **Providers**
3. Найдите **Google** и убедитесь что:
   - ✅ **Enabled**: `ON`
   - ✅ **Client ID**: Заполнен (из Google Cloud Console)
   - ✅ **Client Secret**: Заполнен
   - ✅ **Redirect URL**: `http://localhost:1337/api/connect/google/callback`
4. **Нажмите Save**

### Шаг 5: Перезапустите Strapi

```bash
cd backend/strapi-backend
npm run dev
```

### Шаг 6: Проверьте работу

1. Откройте http://localhost:5173/auth
2. Нажмите **"Войти через Google"**
3. Выберите аккаунт Google (который добавлен в тестовые пользователи)
4. Должна произойти успешная авторизация

## 🚨 Частые ошибки

### Ошибка: "redirect_uri_mismatch"

**Причина**: Redirect URI в запросе не совпадает с зарегистрированным в Google Cloud Console.

**Решение**: 
- Убедитесь, что в Google Cloud Console добавлен точно такой же URI:
  ```
  http://localhost:1337/api/connect/google/callback
  ```
- Проверьте, что в `.env` файле указан правильный `GOOGLE_CALLBACK_URL`

### Ошибка: "access_denied" или "This app is blocked"

**Причина**: Приложение в режиме тестирования, и ваш email не добавлен в список тестовых пользователей.

**Решение**:
- Добавьте ваш email в **OAuth consent screen** → **Test users**
- Или отправьте приложение на проверку Google (для production)

### Ошибка: "invalid_client"

**Причина**: Неправильный Client ID или Client Secret.

**Решение**:
- Проверьте, что в `.env` файле указаны правильные значения
- Убедитесь, что вы скопировали значения без лишних пробелов
- Проверьте, что в Strapi Admin Panel также указаны правильные значения

## 📝 Для Production

Когда будете готовы к production:

1. **Измените Redirect URIs** в Google Cloud Console:
   ```
   https://yourdomain.com/api/connect/google/callback
   ```

2. **Обновите `.env` файл**:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/connect/google/callback
   PUBLIC_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Отправьте приложение на проверку Google**:
   - В OAuth consent screen нажмите **PUBLISH APP**
   - Заполните все обязательные поля
   - Дождитесь одобрения Google

## 🔗 Полезные ссылки

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Strapi Users Permissions Plugin](https://docs.strapi.io/dev-docs/plugins/users-permissions)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**После выполнения всех шагов ошибка должна исчезнуть!** ✅




