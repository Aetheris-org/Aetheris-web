# Быстрое исправление ошибки Prisma engines

## ❌ Проблема
```
Error: aborted
code: 'ECONNRESET'
```
Prisma Client **НЕ установлен** (проверено: `node_modules/.prisma/client` отсутствует)

## ✅ Решения (попробуйте по порядку)

### Способ 1: Использовать yarn (РЕКОМЕНДУЕТСЯ)

Yarn часто лучше справляется с загрузкой Prisma engines:

```bash
cd backend/supabase-backend

# Установите yarn, если его нет
npm install -g yarn

# Установка через yarn
bash scripts/install-with-yarn.sh
```

Или вручную:
```bash
yarn install
PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh yarn prisma generate
```

### Способ 2: Использовать VPN

Если Prisma CDN заблокирован в вашем регионе:

1. Включите VPN
2. Выполните:
```bash
cd backend/supabase-backend
bash scripts/fix-prisma-engines.sh
```

### Способ 3: Ручная установка с повторными попытками

```bash
cd backend/supabase-backend

# Очистка
rm -rf node_modules/.prisma

# Установка с зеркалом
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
npx prisma generate

# Проверка
ls node_modules/.prisma/client
```

### Способ 4: Установка без engines (временное решение)

Если engines не критичны для разработки:

```bash
cd backend/supabase-backend
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm install @prisma/client prisma --save --save-dev
npx prisma generate
```

## ✅ Проверка установки

После установки проверьте:

```bash
# Проверка наличия Prisma Client
ls node_modules/.prisma/client

# Или проверка через Node.js
node -e "require('@prisma/client'); console.log('✅ OK')"
```

## 🚀 После успешной установки

```bash
# Проверка типов
npm run type-check

# Запуск сервера
npm run dev
```
