# 📊 Текущее состояние бэкенда

## 🔴 СЕЙЧАС РАБОТАЕТ:

### `backend/supabase-backend/` - Express + Apollo Server (GraphQL)
- **Порт:** 1337
- **Технологии:**
  - Express.js (HTTP сервер)
  - Apollo Server (GraphQL API)
  - Supabase (как база данных)
  - TypeScript
- **Endpoint:** `http://localhost:1337/api/graphql`
- **Статус:** ✅ Работает и используется фронтендом

### Фронтенд использует:
- `frontend-react/src/lib/graphql.ts` - GraphQL клиент
- `frontend-react/src/api/*-graphql.ts` - GraphQL API файлы
- Обращается к `http://localhost:1337/api/graphql`

## 🟢 ГОТОВО К ИСПОЛЬЗОВАНИЮ (но еще не используется):

### Новые API файлы - Supabase REST API
- **Технологии:**
  - `@supabase/supabase-js` (клиент)
  - Supabase REST API (напрямую)
  - Database Functions (для кастомной логики)
- **Файлы:**
  - `frontend-react/src/lib/supabase.ts`
  - `frontend-react/src/api/articles.ts`
  - `frontend-react/src/api/auth.ts`
  - `frontend-react/src/api/comments.ts`
  - `frontend-react/src/api/bookmarks.ts`
  - `frontend-react/src/api/follow.ts`
  - `frontend-react/src/api/notifications.ts`
  - `frontend-react/src/api/profile.ts`
- **Статус:** ✅ Созданы, но еще не используются

## 🔄 ПЕРЕХОД:

**Сейчас:**
```
Frontend → GraphQL Client → Express Server (1337) → Supabase DB
```

**После перехода:**
```
Frontend → Supabase Client → Supabase REST API → Supabase DB
```

## 📋 Что нужно сделать:

1. **Обновить импорты** в компонентах:
   - `articles-graphql` → `articles`
   - `auth-graphql` → `auth`
   - И т.д.

2. **Установить зависимости:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Настроить переменные окружения:**
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

4. **После успешного тестирования:**
   - Можно остановить Express сервер
   - Можно удалить `backend/supabase-backend/` (или оставить для справки)

## ⚠️ Важно:

**Сейчас фронтенд все еще использует Express сервер!**

Новые API файлы готовы, но нужно обновить импорты в компонентах, чтобы начать их использовать.

