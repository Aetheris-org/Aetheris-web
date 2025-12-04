# Исправление проблем с установкой

## Проблема 1: Apollo Server v4 deprecated

✅ **Исправлено**: Обновлен до Apollo Server v5

## Проблема 2: Prisma engines установка (ECONNRESET)

Это сетевая проблема при загрузке Prisma engines (бинарные файлы для работы с БД). 

**Причина**: Prisma пытается скачать engines с CDN, но соединение обрывается.

**Решения** (попробуйте по порядку):

### ✅ Вариант 1: Использование скрипта (РЕКОМЕНДУЕТСЯ)

Скрипт автоматически пробует разные зеркала:

```bash
cd backend/supabase-backend
bash scripts/fix-prisma-engines.sh
```

### Вариант 2: Ручная установка с зеркалом

```bash
cd backend/supabase-backend
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
npx prisma generate
```

### Вариант 3: Использование yarn (часто работает лучше)

```bash
cd backend/supabase-backend
yarn install
PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh yarn prisma generate
```

### Вариант 4: Установка без engines (только для разработки)

Если engines не критичны для вашей работы:

```bash
cd backend/supabase-backend
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
npm install --ignore-scripts
# Prisma Client будет работать, но некоторые функции могут быть ограничены
```

### Вариант 5: Использование VPN

Если Prisma CDN заблокирован в вашем регионе, используйте VPN и повторите установку.

## Если ничего не помогает

1. Проверьте интернет-соединение
2. Попробуйте использовать VPN (если Prisma CDN заблокирован)
3. Используйте yarn вместо npm:

```bash
yarn install
yarn prisma generate
```

## После успешной установки

```bash
# Проверка установки
npm run type-check

# Запуск сервера
npm run dev
```

