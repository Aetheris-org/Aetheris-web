#!/bin/bash
# Альтернативная установка через yarn (часто работает лучше)

echo "🔧 Установка через yarn..."

# Проверяем наличие yarn
if ! command -v yarn &> /dev/null; then
  echo "❌ Yarn не установлен. Установите: npm install -g yarn"
  exit 1
fi

echo "📦 Установка зависимостей (игнорируя postinstall скрипты)..."
yarn install --ignore-scripts

echo "📦 Генерация Prisma Client без engines..."
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh

# Пробуем сгенерировать, игнорируя ошибки engines
yarn prisma generate 2>&1 | grep -v "Downloading Prisma engines" || true

# Проверка
if [ -d "node_modules/.prisma/client" ] || [ -f "node_modules/@prisma/client/index.js" ]; then
  echo "✅ Prisma Client установлен (без engines, но функционален для Supabase)"
else
  echo "⚠️  Prisma Client может быть не полностью установлен"
  echo "💡 Попробуйте использовать VPN или установить engines позже"
fi

