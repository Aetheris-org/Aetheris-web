# Быстрая настройка .env

## Вариант 1: Если у вас уже есть ключи в старом бэкенде

```bash
cd backend/supabase-backend
bash scripts/copy-env.sh
```

Скрипт автоматически скопирует ключи из `keystonejs-backend/.env`

## Вариант 2: Получить ключи из Supabase Dashboard

### Быстрый путь:

1. Откройте https://app.supabase.com
2. Выберите ваш проект
3. **Settings** → **API**:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (нажмите "Reveal")
4. **Settings** → **Database** → **Connection string** → **URI**:
   - Скопируйте и замените `[YOUR-PASSWORD]` на реальный пароль
   - Это будет `DATABASE_URL`

### Создайте .env файл:

```bash
cd backend/supabase-backend
nano .env
```

Вставьте (замените на ваши значения):

```env
SUPABASE_URL=https://ваш-проект.supabase.co
SUPABASE_ANON_KEY=ваш-anon-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-ключ
DATABASE_URL=postgresql://postgres:ваш-пароль@db.ваш-проект.supabase.co:5432/postgres
```

Сохраните (Ctrl+O, Enter, Ctrl+X)

## Проверка

```bash
node test-start.js
```

Должно вывести: ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!

