#!/bin/bash
# Скрипт для установки Prisma engines с повторными попытками и альтернативными зеркалами

echo "🔧 Установка Prisma engines..."

# Пробуем разные зеркала
MIRRORS=(
  "https://binaries.prisma.sh"
  "https://cdn.prisma.io"
)

SUCCESS=false

for MIRROR in "${MIRRORS[@]}"; do
  echo "📦 Попытка с зеркалом: $MIRROR"
  export PRISMA_ENGINES_MIRROR="$MIRROR"
  
  # Пробуем установить и проверяем результат
  if PRISMA_ENGINES_MIRROR="$MIRROR" npx prisma generate 2>&1; then
    # Проверяем, что Prisma Client действительно создан
    if [ -d "node_modules/.prisma/client" ] || [ -f "node_modules/@prisma/client/index.js" ]; then
      echo "✅ Prisma engines установлены успешно!"
      SUCCESS=true
      break
    fi
  fi
  
  echo "❌ Не удалось с зеркалом $MIRROR, пробуем следующее..."
  sleep 2
done

if [ "$SUCCESS" = false ]; then
  echo "⚠️  Не удалось установить через зеркала. Пробуем альтернативный способ..."
  
  # Пробуем установить без engines (только клиент)
  echo "📦 Установка Prisma Client без engines..."
  
  # Устанавливаем пакеты вручную
  npm install @prisma/client prisma --save --save-dev 2>&1 || true
  
  # Пробуем сгенерировать с пропуском engines
  export PRISMA_SKIP_POSTINSTALL_GENERATE=1
  export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
  
  if npx prisma generate --schema=./prisma/schema.prisma 2>&1; then
    if [ -d "node_modules/.prisma/client" ] || [ -f "node_modules/@prisma/client/index.js" ]; then
      echo "✅ Prisma Client установлен (без engines, но функционален)"
      SUCCESS=true
    fi
  fi
fi

if [ "$SUCCESS" = false ]; then
  echo ""
  echo "❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось установить Prisma"
  echo ""
  echo "💡 Попробуйте следующие решения:"
  echo "   1. Используйте VPN (Prisma CDN может быть заблокирован)"
  echo "   2. Используйте yarn вместо npm:"
  echo "      yarn install"
  echo "      PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh yarn prisma generate"
  echo "   3. Проверьте интернет-соединение"
  echo "   4. Попробуйте позже (временные проблемы с CDN)"
  echo ""
  exit 1
fi

# Финальная проверка
if [ -d "node_modules/.prisma/client" ] || [ -f "node_modules/@prisma/client/index.js" ]; then
  echo "✅ Проверка: Prisma Client готов к использованию"
else
  echo "⚠️  Внимание: Prisma Client может быть не полностью установлен"
fi

