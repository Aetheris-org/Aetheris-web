#!/bin/bash
# Скрипт для установки зависимостей с обходом проблемы Prisma engines

cd "$(dirname "$0")"

echo "🔧 Установка зависимостей без postinstall скриптов..."
npm install --ignore-scripts

echo "🔧 Генерация Prisma Client..."
npx prisma generate --schema=./schema.prisma || npx prisma generate

echo "✅ Готово! Теперь можно запустить: npm run dev"


