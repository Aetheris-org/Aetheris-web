# Исправление ошибки Prisma Client

## ❌ Ошибка:
```
Cannot find module '.prisma/client/default'
```

## ✅ Решение:

Prisma Client нужно сгенерировать из schema.prisma файла.

### Способ 1: Через скрипт (рекомендуется)

```bash
cd backend/supabase-backend
bash scripts/generate-prisma-client.sh
```

### Способ 2: Вручную

```bash
cd backend/supabase-backend

# Устанавливаем переменные для пропуска engines
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Генерируем Prisma Client
npx prisma generate
```

### Способ 3: Если не работает - используйте yarn

```bash
cd backend/supabase-backend
PRISMA_SKIP_POSTINSTALL_GENERATE=1 PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 yarn prisma generate
```

## ✅ Проверка

После генерации проверьте:

```bash
ls node_modules/.prisma/client
```

Должна существовать директория.

## 🧪 Тест

После генерации запустите:

```bash
node test-start.js
```

Должно вывести: ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!

## ⚠️ Если все еще ошибка

Возможно, Prisma пытается скачать engines и падает. В этом случае:

1. Используйте VPN
2. Или попробуйте позже (временные проблемы с CDN)

Но для работы приложения engines НЕ нужны - нужен только сгенерированный Prisma Client!

