# Исправление проблемы с установкой зависимостей

Проблема: `npm install` падает на Prisma engines из-за проблем с сетью.

## ✅ Быстрое решение

Выполните команды по порядку:

```bash
cd backend/keystonejs-backend

# 1. Установите зависимости БЕЗ postinstall скриптов
npm install --ignore-scripts

# 2. Сгенерируйте Prisma Client вручную
npx prisma generate --schema=./schema.prisma

# 3. Запустите backend
npm run dev
```

Или используйте готовый скрипт:

```bash
cd backend/keystonejs-backend
chmod +x install-fix.sh
./install-fix.sh
npm run dev
```

## 🔄 Альтернатива: Используйте yarn

Yarn обычно лучше справляется с проблемами сети:

```bash
cd backend/keystonejs-backend

# Установите yarn (если еще не установлен)
npm install -g yarn

# Установите зависимости через yarn
yarn install

# Запустите
yarn dev
```

## 🆘 Если все еще не работает

Попробуйте установить Prisma engines вручную:

```bash
cd backend/keystonejs-backend

# Установите зависимости
npm install --ignore-scripts

# Установите Prisma engines отдельно
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
npx prisma generate

# Или используйте альтернативный mirror
export PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma
npx prisma generate
```

## 📝 После успешной установки

Когда зависимости установятся:

1. Запустите backend: `npm run dev`
2. Проверьте, что ошибка Admin UI исчезла
3. Откройте Admin UI: `http://localhost:1337`


