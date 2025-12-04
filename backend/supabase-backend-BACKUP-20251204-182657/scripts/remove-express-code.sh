#!/bin/bash
# Скрипт для удаления только кода Express сервера
# Сохраняет миграции и документацию

set -e

# Определяем директорию
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🗑️  Удаление кода Express сервера"
echo ""
echo "⚠️  ВНИМАНИЕ: Это удалит код, но сохранит миграции и документацию"
echo ""

# Спрашиваем подтверждение
read -p "Вы уверены? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Отменено"
  exit 0
fi

echo ""
echo "📋 Что будет удалено:"
echo "   - src/ (Express + Apollo Server код)"
echo "   - node_modules/"
echo "   - package.json"
echo "   - package-lock.json"
echo "   - tsconfig.json"
echo "   - test-start.js"
echo "   - prisma/ (Prisma схема)"
echo "   - logs/"
echo ""
echo "✅ Что будет сохранено:"
echo "   - migrations/ (SQL миграции)"
echo "   - scripts/ (полезные скрипты)"
echo "   - *.md (документация)"
echo ""

# Создаем backup (опционально)
read -p "Создать backup всего? (yes/no): " backup
if [ "$backup" == "yes" ]; then
  BACKUP_DIR="$(dirname "$SUPABASE_BACKEND_DIR")/supabase-backend-BACKUP-$(date +%Y%m%d-%H%M%S)"
  echo "📦 Создание backup в $BACKUP_DIR..."
  cp -r "$SUPABASE_BACKEND_DIR" "$BACKUP_DIR"
  echo "✅ Backup создан: $BACKUP_DIR"
fi

# Удаляем только код
echo ""
echo "🗑️  Удаление кода..."

cd "$SUPABASE_BACKEND_DIR"

# Удаляем директории с кодом
rm -rf src/
rm -rf node_modules/
rm -rf logs/
rm -rf prisma/

# Удаляем файлы конфигурации
rm -f package.json
rm -f package-lock.json
rm -f tsconfig.json
rm -f test-start.js

echo "✅ Код Express сервера удален"
echo ""
echo "✅ Сохранено:"
echo "   - migrations/ (SQL миграции)"
echo "   - scripts/ (скрипты)"
echo "   - *.md (документация)"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Удалить GraphQL зависимости из frontend-react/package.json (опционально)"
echo "   2. Обновить документацию"
echo ""
echo "✅ Готово!"

