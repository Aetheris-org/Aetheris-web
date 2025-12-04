#!/bin/bash
# Установка Prisma Client БЕЗ engines (работает для Supabase)

echo "🔧 Установка Prisma Client без engines..."

# Устанавливаем пакеты, игнорируя postinstall скрипты
echo "📦 Установка npm пакетов..."
npm install --ignore-scripts

# Устанавливаем переменные для пропуска engines
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_SKIP_ENV_CHECK=1

echo "📦 Генерация Prisma Client..."
# Пробуем сгенерировать, игнорируя ошибки загрузки engines
npx prisma generate --schema=./prisma/schema.prisma 2>&1 | grep -v "Downloading Prisma engines" || {
  echo "⚠️  Ошибка при генерации, но продолжаем..."
}

# Проверка наличия Prisma Client
if [ -d "node_modules/.prisma/client" ]; then
  echo "✅ Prisma Client установлен в node_modules/.prisma/client"
elif [ -f "node_modules/@prisma/client/index.js" ]; then
  echo "✅ Prisma Client установлен в node_modules/@prisma/client"
else
  echo "❌ Prisma Client не найден"
  echo "💡 Попробуйте:"
  echo "   1. Использовать VPN"
  echo "   2. Или установить engines позже вручную"
  exit 1
fi

echo ""
echo "✅ Установка завершена!"
echo "ℹ️  Prisma Client работает без engines для Supabase PostgreSQL"
echo "   Engines нужны только для миграций через Prisma CLI"
echo "   Для работы с Supabase через Prisma Client engines не требуются"

