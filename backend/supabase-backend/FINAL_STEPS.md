# 🎯 Финальные шаги миграции

## ✅ Что уже сделано:

1. ✅ Миграции БД применены
2. ✅ Все API файлы созданы (7 файлов)
3. ✅ TypeScript клиент Supabase создан

## 📋 Что нужно сделать сейчас:

### 1. Установить зависимости

```bash
cd frontend-react
npm install @supabase/supabase-js
```

### 2. Настроить переменные окружения

Создайте `frontend-react/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Где взять:**
- Supabase Dashboard → Settings → API
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Обновить импорты в компонентах

Замените все импорты:

**Было:**
```typescript
import { getArticles } from '@/api/articles-graphql';
import { signIn } from '@/api/auth-graphql';
```

**Стало:**
```typescript
import { getArticles } from '@/api/articles';
import { signIn } from '@/api/auth';
```

**Файлы для замены:**
- `articles-graphql` → `articles`
- `auth-graphql` → `auth`
- `comments-graphql` → `comments`
- `bookmarks-graphql` → `bookmarks`
- `follow-graphql` → `follow`
- `notifications-graphql` → `notifications`
- `profile-graphql` → `profile`

### 4. Протестировать

Проверьте:
- [ ] Вход/выход
- [ ] Загрузка статей
- [ ] Создание статьи
- [ ] Комментарии
- [ ] Реакции
- [ ] Закладки
- [ ] Подписки
- [ ] Уведомления
- [ ] Профили

### 5. Удалить старый код (опционально)

После успешного тестирования можно удалить:
- `backend/supabase-backend/` (или оставить для справки)
- GraphQL зависимости из `package.json`:
  - `graphql-request`
  - `graphql`
  - `graphql-tag`

## 🎉 Готово!

После выполнения всех шагов ваш проект будет полностью работать на Supabase REST API без Express сервера!

