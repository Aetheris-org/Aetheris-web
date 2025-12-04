#!/bin/bash
# Скрипт для проверки использования GraphQL файлов

echo "🔍 Проверка использования GraphQL файлов"
echo ""

cd "$(dirname "$0")/.." || exit 1

# Проверяем использование старых GraphQL API файлов
echo "📋 Старые GraphQL API файлы:"
OLD_GRAPHQL_FILES=$(find src/api -name "*-graphql.ts" 2>/dev/null)
if [ -z "$OLD_GRAPHQL_FILES" ]; then
  echo "   ✅ Нет старых GraphQL файлов"
else
  echo "   Найдено файлов: $(echo "$OLD_GRAPHQL_FILES" | wc -l)"
  for file in $OLD_GRAPHQL_FILES; do
    filename=$(basename "$file")
    usage=$(grep -r "$filename" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "$filename:" | wc -l)
    if [ "$usage" -eq 0 ]; then
      echo "   ⚠️  $filename - НЕ используется"
    else
      echo "   ❌ $filename - используется в $usage местах"
    fi
  done
fi

echo ""
echo "📋 Проверка graphql.ts клиента:"
GRAPHQL_CLIENT_USAGE=$(grep -r "from.*@/lib/graphql\|from.*\.\./lib/graphql" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$GRAPHQL_CLIENT_USAGE" -eq 0 ]; then
  echo "   ✅ graphql.ts - НЕ используется"
else
  echo "   ❌ graphql.ts - используется в $GRAPHQL_CLIENT_USAGE местах"
  echo "   Файлы:"
  grep -r "from.*@/lib/graphql\|from.*\.\./lib/graphql" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | cut -d: -f1 | sort -u | sed 's/^/      - /'
fi

echo ""
echo "📋 Новые API файлы (Supabase):"
NEW_API_FILES=$(find src/api -name "*.ts" ! -name "*-graphql.ts" ! -name "index.ts" 2>/dev/null)
if [ -z "$NEW_API_FILES" ]; then
  echo "   ⚠️  Нет новых API файлов"
else
  echo "   Найдено файлов: $(echo "$NEW_API_FILES" | wc -l)"
  for file in $NEW_API_FILES; do
    filename=$(basename "$file" .ts)
    usage=$(grep -r "from.*@/api/$filename\|from.*\.\./api/$filename" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
    if [ "$usage" -gt 0 ]; then
      echo "   ✅ $filename.ts - используется в $usage местах"
    else
      echo "   ⚠️  $filename.ts - НЕ используется"
    fi
  done
fi

echo ""
echo "✅ Проверка завершена"

