# 🔧 Исправление ошибки импорта @supabase/supabase-js

## ❌ Проблема:
```
Failed to resolve import "@supabase/supabase-js" from "src/lib/supabase.ts"
```

## ✅ Решение:

Пакет `@supabase/supabase-js` указан в `package.json`, но не установлен в `node_modules`.

### Вариант 1: Использовать npm
```bash
cd frontend-react
npm install
```

### Вариант 2: Использовать yarn
```bash
cd frontend-react
yarn install
```

### Вариант 3: Установить только @supabase/supabase-js
```bash
cd frontend-react
npm install @supabase/supabase-js
# или
yarn add @supabase/supabase-js
```

## 🔍 Проверка:

После установки проверьте:
```bash
ls -la node_modules/@supabase/supabase-js
```

Должна быть директория с файлами пакета.

## 💡 Если npm/yarn не найдены:

1. Установите Node.js и npm:
   ```bash
   # Fedora
   sudo dnf install nodejs npm
   ```

2. Или используйте nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install --lts
   nvm use --lts
   ```

