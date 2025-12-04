#!/bin/bash
# Скрипт для копирования переменных окружения из старого бэкенда

OLD_ENV="../keystonejs-backend/.env"
NEW_ENV=".env"

if [ ! -f "$OLD_ENV" ]; then
  echo "❌ Файл $OLD_ENV не найден"
  echo "💡 Создайте .env вручную на основе .env.example"
  exit 1
fi

echo "📋 Копирование переменных из $OLD_ENV..."

# Извлекаем нужные переменные
SUPABASE_URL=$(grep "^SUPABASE_URL=" "$OLD_ENV" | cut -d '=' -f2- | tr -d '"')
SUPABASE_ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" "$OLD_ENV" | cut -d '=' -f2- | tr -d '"')
SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$OLD_ENV" | cut -d '=' -f2- | tr -d '"')
SUPABASE_DATABASE_URL=$(grep "^SUPABASE_DATABASE_URL=" "$OLD_ENV" | cut -d '=' -f2- | tr -d '"')
DATABASE_URL=$(grep "^DATABASE_URL=" "$OLD_ENV" | cut -d '=' -f2- | tr -d '"' | sed "s/\${SUPABASE_DATABASE_URL}/$SUPABASE_DATABASE_URL/")

# Если DATABASE_URL не найден, используем SUPABASE_DATABASE_URL
if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "\${SUPABASE_DATABASE_URL}" ]; then
  DATABASE_URL="$SUPABASE_DATABASE_URL"
fi

# Создаем новый .env
cat > "$NEW_ENV" << EOF
# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL=$SUPABASE_DATABASE_URL

# Для обратной совместимости
DATABASE_URL=$DATABASE_URL

# ============================================
# Application Configuration
# ============================================
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:1337
PORT=1337
NODE_ENV=development

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
EOF

echo "✅ Файл .env создан!"
echo ""
echo "Проверка переменных:"
echo "  SUPABASE_URL: ${SUPABASE_URL:0:30}..."
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo ""
echo "Теперь запустите: npm run dev"

