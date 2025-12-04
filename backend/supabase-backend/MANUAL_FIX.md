# Ручное исправление проблем

## Если сервер не запускается и ничего не выводит

### Шаг 1: Проверьте .env файл

Откройте файл `backend/supabase-backend/.env` и убедитесь, что там есть:

```env
SUPABASE_URL=https://lublvnvoawndnmkgndct.supabase.co
SUPABASE_ANON_KEY=ваш-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-ключ
DATABASE_URL=postgresql://postgres:пароль@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
```

**ВАЖНО**: Замените `пароль` на реальный пароль от Supabase!

### Шаг 2: Проверьте Prisma Client

```bash
cd backend/supabase-backend
ls node_modules/.prisma/client
```

Если директория не существует, выполните:

```bash
bash scripts/install-without-engines.sh
```

### Шаг 3: Запустите с явным выводом

```bash
cd backend/supabase-backend
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL);"
```

Должен вывести URL, а не `undefined`.

### Шаг 4: Проверьте импорты

```bash
cd backend/supabase-backend
node -e "try { require('@apollo/server'); console.log('✅ Apollo Server OK'); } catch(e) { console.log('❌', e.message); }"
```

### Шаг 5: Запустите сервер

```bash
npm run dev
```

Теперь вы должны увидеть логи!

## Если все еще ничего не выводит

Попробуйте запустить напрямую через node:

```bash
cd backend/supabase-backend
npx tsx src/index.ts
```

Это покажет все ошибки напрямую.

