# Обход проблемы с Prisma Engines

## Проблема

Prisma не может загрузить engines из-за проблем с сетью/CDN (ECONNRESET). Это блокирует установку.

## ✅ Решение: Установка БЕЗ engines

**Хорошая новость**: Для работы с Supabase через Prisma Client engines **НЕ обязательны**!

Engines нужны только для:
- `prisma migrate` (миграции через Prisma CLI)
- `prisma studio` (GUI для БД)

Но для работы приложения через Prisma Client engines не требуются.

## 🚀 Установка без engines

```bash
cd backend/supabase-backend

# Способ 1: Использовать готовый скрипт
bash scripts/install-without-engines.sh

# Способ 2: Вручную
npm install --ignore-scripts
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx prisma generate
```

## ✅ Проверка

```bash
# Проверка наличия Prisma Client
ls node_modules/.prisma/client

# Или
node -e "require('@prisma/client'); console.log('✅ OK')"
```

## 📝 Важные замечания

1. **Миграции**: Используйте SQL миграции напрямую в Supabase Dashboard вместо `prisma migrate`
2. **Prisma Studio**: Не будет работать без engines (используйте Supabase Dashboard)
3. **Приложение**: Будет работать нормально через Prisma Client

## 🔄 Если позже понадобятся engines

Когда сеть будет стабильной или через VPN:

```bash
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
npx prisma generate
```

## 🎯 Итог

**Можно продолжать разработку без engines!** Prisma Client работает отлично с Supabase PostgreSQL.

