# Заполните .env файл СЕЙЧАС

## ✅ У вас уже есть:

- SUPABASE_URL: `https://lublvnvoawndnmkgndct.supabase.co`
- SUPABASE_ANON_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs9lBSwoSESQ9d_G2PVBqHM`
- SUPABASE_SERVICE_ROLE_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1MTMwNSwiZXhwIjoyMDc5NzI3MzA1fQ.yGnLijPqC2cdJkJQYkhpj2rIzg9ld2DNQri9KBIGpwo`

## ❌ Нужно получить:

**DATABASE_URL** - строка подключения к PostgreSQL

## 📍 Где найти DATABASE_URL:

### Вариант 1: Через Settings (рекомендуется)

1. В **левом меню** найдите иконку **⚙️ Settings** (в самом низу)
2. Нажмите на **Settings**
3. В открывшемся меню выберите **Database**
4. Прокрутите вниз до секции **Connection string**
5. Выберите вкладку **URI** (не Session или Transaction)
6. Скопируйте строку - она будет выглядеть так:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
   ```
7. **ЗАМЕНИТЕ** `[YOUR-PASSWORD]` на реальный пароль

### Вариант 2: Если не видите Connection string

1. **Settings** → **Database** → **Database password**
2. Если не помните пароль - нажмите **Reset database password**
3. Скопируйте пароль
4. Составьте строку вручную:
   ```
   postgresql://postgres:ВАШ_ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
   ```

## 📝 Заполните .env файл:

Откройте файл `backend/supabase-backend/.env` и вставьте:

```env
SUPABASE_URL=https://lublvnvoawndnmkgndct.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs9lBSwoSESQ9d_G2PVBqHM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1MTMwNSwiZXhwIjoyMDc5NzI3MzA1fQ.yGnLijPqC2cdJkJQYkhpj2rIzg9ld2DNQri9KBIGpwo
SUPABASE_DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres

FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:1337
PORT=1337
NODE_ENV=development
LOG_LEVEL=info
```

**ВАЖНО**: Замените `ВАШ_ПАРОЛЬ` на реальный пароль из Supabase!

## ✅ После заполнения:

```bash
node test-start.js
```

Должно вывести: ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!

