# ✅ Исправление OAuth авторизации

## Что было сделано

Исправлена проблема с авторизацией. Проблема была в том, что:

1. **Frontend router** ожидал формат `{ id, username, email, ... }` напрямую
2. **API profile.ts** пытался unwrap ответ как `{ data: { id, attributes: {...} } }`
3. **Strapi `/api/users/me`** возвращает пользователя напрямую, БЕЗ обёртки

### Изменения:

#### 1. `frontend/src/router/index.ts`
- ✅ Обрабатываем ответ от `/api/users/me` напрямую (не unwrap)
- ✅ Адаптируем к формату frontend `User`
- ✅ Правильно извлекаем avatar URL

#### 2. `frontend/src/api/profile.ts`
- ✅ `getCurrentUser()` читает ответ напрямую
- ✅ `updateProfile()` поддерживает `{ data: {...} }` формат

#### 3. `backend/strapi-backend/src/extensions/users-permissions/strapi-server.ts`
- ✅ `updateMeController` поддерживает оба формата: `{ username }` и `{ data: { username } }`
- ✅ Возвращает пользователя с `populate: ['avatar']`
- ✅ Убирает чувствительные поля (password, tokens)

---

## Как тестировать

### 1. Убедись, что Strapi запущен
```bash
# Проверь логи
tail -f /tmp/strapi_restart.log

# Должно быть:
✅ Strapi started successfully
```

### 2. Убедись, что frontend запущен
```bash
cd /Users/zimbazo/WebstormProjects/Aetheris-community
npm run dev

# Откроется на http://localhost:5173
```

### 3. Тест OAuth
1. Открой http://localhost:5173
2. Нажми "Войти через Google"
3. Авторизуйся через Google
4. **Должен перенаправить на `/auth/finalize`** (если username не установлен)
5. Введи nickname
6. **Должен перенаправить на `/`** (главная страница)
7. **В правом верхнем углу должен быть твой nickname**

### 4. Проверка в консоли браузера

Открой Developer Tools (F12) → Console. Должны быть логи:

```
🔵 Router guard: OAuth callback detected (cookie-based)
✅ Access token found in cookie
🔵 Making request to /api/users/me with cookie token...
🔵 Response status: 200
🔵 Raw response: {"id":1,"username":"user_123456...
✅ User data loaded: {id: 1, username: "user_123456..."}
🔵 User has no valid username, redirecting to /auth/finalize
```

После установки nickname:
```
✅ User data loaded: {id: 1, username: "your_nickname"}
🔵 User has valid username, redirecting to /
```

---

## Если всё равно не работает

### Проверь cookies
1. Открой Developer Tools → Application → Cookies → http://localhost:5173
2. Должны быть:
   - `accessToken` (JS-readable, 15 мин)
   - `refreshToken` (HttpOnly, 7 дней)

### Проверь backend
```bash
# Тест endpoint
curl -s http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq

# Должен вернуть:
{
  "id": 1,
  "username": "user_123...",
  "email": "hash-abc...@internal.local",
  "createdAt": "...",
  "avatar": null или { "url": "..." },
  ...
}
```

### Очисти cookies и попробуй снова
```javascript
// В консоли браузера
document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Структура ответов

### `/api/users/me` (GET)
```json
{
  "id": 1,
  "username": "user_123...",
  "email": "hash-abc...@internal.local",
  "createdAt": "2025-11-04T...",
  "updatedAt": "2025-11-04T...",
  "avatar": {
    "id": 1,
    "url": "/uploads/...",
    ...
  },
  "bio": "..."
}
```

### `/api/users/me` (PUT)
**Request:**
```json
{
  "data": {
    "username": "new_nickname"
  }
}
```

**Response:** (тот же формат что и GET)

---

## ✅ Готово!

После этих исправлений OAuth должен работать корректно:
1. ✅ Вход через Google
2. ✅ Установка nickname
3. ✅ Редирект на главную
4. ✅ Отображение username в header

**Strapi запущен:** http://localhost:1337  
**Frontend:** http://localhost:5173  
**Admin Panel:** http://localhost:1337/admin

