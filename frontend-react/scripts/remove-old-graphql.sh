#!/bin/bash
# Скрипт для удаления старых GraphQL файлов
# Используется только после проверки, что они не используются

set -e

cd "$(dirname "$0")/.." || exit 1

echo "🗑️  Удаление старых GraphQL файлов"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -d "src/api" ]; then
  echo "❌ Директория src/api не найдена"
  exit 1
fi

# Список файлов для удаления
FILES_TO_REMOVE=(
  "src/api/articles-graphql.ts"
  "src/api/auth-graphql.ts"
  "src/api/bookmarks-graphql.ts"
  "src/api/comments-graphql.ts"
  "src/api/drafts-graphql.ts"
  "src/api/follow-graphql.ts"
  "src/api/notifications-graphql.ts"
  "src/api/profile-graphql.ts"
  "src/lib/graphql.ts"
)

echo "📋 Файлы для удаления:"
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "   - $file"
  fi
done

echo ""
read -p "Вы уверены? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Отменено"
  exit 0
fi

# Создаем backup (опционально)
read -p "Создать backup? (yes/no): " backup
if [ "$backup" == "yes" ]; then
  BACKUP_DIR="backup-graphql-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
      mkdir -p "$BACKUP_DIR/$(dirname "$file")"
      cp "$file" "$BACKUP_DIR/$file"
    fi
  done
  echo "✅ Backup создан: $BACKUP_DIR"
fi

# Удаляем файлы
echo ""
echo "🗑️  Удаление файлов..."
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    echo "   ✅ Удален: $file"
  fi
done

echo ""
echo "✅ Старые GraphQL файлы удалены"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверить, что приложение работает: npm run dev"
echo "   2. Удалить GraphQL зависимости из package.json (опционально):"
echo "      - graphql"
echo "      - graphql-request"
echo ""
echo "✅ Готово!"

