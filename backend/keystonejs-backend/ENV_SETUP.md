# 📝 Настройка .env файла

## Где создать файл

Создайте файл `.env` в директории `backend/keystonejs-backend/`:

```
backend/keystonejs-backend/.env
```

## Что добавить в .env

Скопируйте и вставьте следующее содержимое в ваш `.env` файл:

```env
# Database
DATABASE_URL="file:./.tmp/data.db"

# Session & Security (минимум 32 символа для SESSION_SECRET)
# Генерируйте безопасный секрет: openssl rand -base64 64
SESSION_SECRET="your-very-long-secret-key-minimum-32-characters-long-change-this-in-production"

# OAuth2 (Google)
# ВАЖНО: GOOGLE_CALLBACK_URL должен указывать на BACKEND (порт 1337), а не frontend!
# Это URL, на который Google будет редиректить после авторизации
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"

# Frontend URL (для редиректа после OAuth)
FRONTEND_URL="http://localhost:5173"
PUBLIC_URL="http://localhost:1337"

# Redis (опционально, для production)
# Если Redis не запущен, используется in-memory fallback
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Logging
LOG_LEVEL="info"
NODE_ENV="development"

# Port
PORT="1337"
```

## Что нужно заменить

### 1. SESSION_SECRET (обязательно!)

**ВАЖНО**: Замените на безопасный случайный секрет минимум 32 символа!

```bash
# Генерация безопасного секрета (64 символа)
openssl rand -base64 64
```

Вставьте результат в `.env`:
```env
SESSION_SECRET="ваш-сгенерированный-секрет-здесь"
```

### 2. GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET

Получите из [Google Cloud Console](https://console.cloud.google.com/):

1. Перейдите в **APIs & Services** → **Credentials**
2. Создайте **OAuth 2.0 Client ID**
3. Скопируйте **Client ID** и **Client Secret**

Вставьте в `.env`:
```env
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

### 3. GOOGLE_CALLBACK_URL

**ВАЖНО**: Должен совпадать с URL в Google Console!

Для development:
```env
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"
```

Для production:
```env
GOOGLE_CALLBACK_URL="https://your-domain.com/api/connect/google/callback"
```

## Минимальная конфигурация для начала работы

Если вы хотите быстро начать, минимум что нужно:

```env
# Обязательно!
SESSION_SECRET="your-very-long-secret-key-minimum-32-characters-long"

# Для OAuth (получите из Google Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:1337/api/connect/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

Остальные переменные имеют значения по умолчанию.

## Проверка настроек

После создания `.env` файла:

1. Убедитесь, что `SESSION_SECRET` минимум 32 символа
2. Убедитесь, что `GOOGLE_CALLBACK_URL` указывает на backend (порт 1337)
3. Убедитесь, что `GOOGLE_CALLBACK_URL` совпадает с URL в Google Console
4. Перезапустите backend после изменения `.env`

## Troubleshooting

### Ошибка: "SESSION_SECRET is too short"
- Убедитесь, что `SESSION_SECRET` минимум 32 символа
- Используйте `openssl rand -base64 64` для генерации

### Ошибка: "redirect_uri_mismatch"
- Проверьте, что `GOOGLE_CALLBACK_URL` в `.env` точно совпадает с URL в Google Console
- Убедитесь, что используется правильный протокол (http/https) и порт (1337)

### Ошибка: "Redis connection failed"
- Это нормально, если Redis не запущен
- Backend автоматически использует in-memory fallback
- Для production рекомендуется запустить Redis

