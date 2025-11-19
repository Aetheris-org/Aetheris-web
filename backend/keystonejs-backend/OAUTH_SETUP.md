# 🔐 OAuth2 Setup Guide (Google)

## Настройка Google OAuth в Google Console

### Шаг 1: Создание OAuth 2.0 Client ID

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект (или создайте новый)
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите тип приложения: **Web application**

### Шаг 2: Настройка Authorized redirect URIs

**ВАЖНО**: Укажите URL вашего **BACKEND** сервера, а не frontend!

#### Для Development:
```
http://localhost:1337/api/connect/google/callback
```

#### Для Production:
```
https://your-domain.com/api/connect/google/callback
```

**Почему backend URL?**
- Google редиректит на backend после авторизации
- Backend обрабатывает OAuth callback через Passport.js
- Backend создает пользователя и устанавливает session cookie
- Затем backend редиректит на frontend `/auth/callback`

### Шаг 3: Получение Credentials

После создания OAuth client ID вы получите:
- **Client ID** - добавьте в `.env` как `GOOGLE_CLIENT_ID`
- **Client Secret** - добавьте в `.env` как `GOOGLE_CLIENT_SECRET`

### Шаг 4: Настройка .env

Добавьте в `.env` файл:

```env
# Google OAuth2
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"

# Frontend URL (для редиректа после OAuth)
FRONTEND_URL="http://localhost:5173"
```

### Шаг 5: Проверка настроек

1. Убедитесь, что `GOOGLE_CALLBACK_URL` в `.env` совпадает с URL в Google Console
2. Убедитесь, что backend запущен на порту 1337
3. Убедитесь, что frontend запущен на порту 5173

## Как работает OAuth flow

1. Пользователь нажимает "Continue with Google" на `/auth`
2. Frontend редиректит на `/api/connect/google` (backend)
3. Backend редиректит на Google для авторизации
4. Google редиректит обратно на `/api/connect/google/callback` (backend)
5. Backend создает/находит пользователя в KeystoneJS
6. Backend сохраняет userId в Express session
7. Backend редиректит на frontend `/auth/callback?oauth=success&userId=...`
8. Frontend вызывает `/api/auth/oauth/session` для создания KeystoneJS session
9. Frontend получает данные пользователя и редиректит на нужную страницу

## Troubleshooting

### Ошибка: "redirect_uri_mismatch"
- Проверьте, что URL в Google Console точно совпадает с `GOOGLE_CALLBACK_URL` в `.env`
- Убедитесь, что используется правильный протокол (http/https)
- Убедитесь, что порт правильный (1337 для backend)

### Ошибка: "No email in profile"
- Убедитесь, что в Google Console настроен OAuth consent screen
- Убедитесь, что scope включает `email` (уже настроено в коде)

### Ошибка: "OAuth session not found"
- Проверьте, что Express session работает (Redis или in-memory)
- Проверьте, что cookies отправляются с запросами (`credentials: 'include'`)

