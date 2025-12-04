# Установка @supabase/supabase-js

## Проблема

Пакет `@supabase/supabase-js` не установлен или не найден.

## Решение

### Способ 1: Установка только этого пакета

```bash
cd backend/supabase-backend
npm install @supabase/supabase-js
```

### Способ 2: Переустановка всех зависимостей

```bash
cd backend/supabase-backend
rm -rf node_modules package-lock.json
npm install
```

### Способ 3: Проверка package.json

Убедитесь, что в `package.json` есть:

```json
"dependencies": {
  "@supabase/supabase-js": "^2.39.3",
  ...
}
```

Если нет - добавьте вручную и выполните `npm install`.

## Проверка установки

```bash
npm list @supabase/supabase-js
```

Должно показать версию пакета.

## После установки

```bash
node test-start.js
```

Должно работать!

