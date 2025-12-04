#!/bin/bash
# Скрипт для безопасного удаления Express сервера
# Использовать только после успешного тестирования нового API

set -e

# Определяем корневую директорию проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Скрипт находится в backend/supabase-backend/scripts/
# Значит supabase-backend это родительская директория скрипта
SUPABASE_BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🗑️  Удаление Express сервера"
echo ""
echo "⚠️  ВНИМАНИЕ: Это удалит $SUPABASE_BACKEND_DIR/"
echo ""

# Проверяем, что директория существует
if [ ! -d "$SUPABASE_BACKEND_DIR" ]; then
  echo "❌ Директория $SUPABASE_BACKEND_DIR не найдена"
  echo "💡 Текущая директория: $(pwd)"
  exit 1
fi

# Спрашиваем подтверждение
read -p "Вы уверены? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Отменено"
  exit 0
fi

echo ""
echo "📋 Что будет удалено:"
echo "   - backend/supabase-backend/ (весь каталог)"
echo "   - Express сервер"
echo "   - Apollo Server"
echo "   - GraphQL resolvers"
echo ""

# Создаем backup (опционально)
read -p "Создать backup? (yes/no): " backup
if [ "$backup" == "yes" ]; then
  BACKUP_DIR="$(dirname "$SUPABASE_BACKEND_DIR")/supabase-backend-BACKUP-$(date +%Y%m%d-%H%M%S)"
  echo "📦 Создание backup в $BACKUP_DIR..."
  cp -r "$SUPABASE_BACKEND_DIR" "$BACKUP_DIR"
  echo "✅ Backup создан: $BACKUP_DIR"
fi

# Удаляем
echo ""
echo "🗑️  Удаление..."
rm -rf "$SUPABASE_BACKEND_DIR"
echo "✅ Express сервер удален"

echo ""
echo "📋 Следующие шаги:"
echo "   1. Удалить GraphQL зависимости из frontend-react/package.json (опционально)"
echo "   2. Обновить документацию"
echo "   3. Обновить README.md"
echo ""
echo "✅ Готово!"

