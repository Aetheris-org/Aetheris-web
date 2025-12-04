#!/bin/bash
# Генерация Prisma Client БЕЗ engines

set -e

echo "🔧 Генерация Prisma Client..."

# Устанавливаем переменные для пропуска engines
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_SKIP_ENV_CHECK=1

# Пробуем сгенерировать, игнорируя ошибки engines
echo "📦 Запуск prisma generate..."
npx prisma generate --schema=./prisma/schema.prisma 2>&1 | grep -v "Downloading Prisma engines" || {
  echo "⚠️  Ошибка при генерации, но продолжаем..."
}

# Проверка
if [ -d "node_modules/.prisma/client" ]; then
  echo "✅ Prisma Client сгенерирован в node_modules/.prisma/client"
  exit 0
elif [ -f "node_modules/@prisma/client/index.js" ]; then
  echo "✅ Prisma Client найден в node_modules/@prisma/client"
  exit 0
else
  echo "❌ Prisma Client не сгенерирован"
  echo "💡 Попробуйте:"
  echo "   1. Проверьте prisma/schema.prisma существует"
  echo "   2. Используйте VPN (если Prisma CDN заблокирован)"
  exit 1
fi

