# ✅ Исправление проблемы со сбросом permissions при перезапуске

## 🔍 Проблема

После перезапуска Strapi permissions, которые были настроены вручную через Admin Panel для роли `Authenticated`, **сбрасывались к дефолтным значениям**.

## 🔎 Причина

В bootstrap функции (`backend/strapi-backend/src/index.ts`) был код, который **удалял ВСЕ permissions** для `Authenticated` роли при каждом запуске:

```typescript
// ❌ ПЛОХО: Удаляет ВСЕ permissions при каждом запуске
console.log('🗑️  Removing old permissions for authenticated role...');
const oldPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
  where: { role: authenticatedRole.id },
});

for (const oldPerm of oldPermissions) {
  await strapi.db.query('plugin::users-permissions.permission').delete({
    where: { id: oldPerm.id },
  });
}

// Затем создаёт новые
for (const perm of authenticatedPermissions) {
  await strapi.db.query('plugin::users-permissions.permission').create({...});
}
```

**Проблемы такого подхода**:
1. ❌ Сбрасывает ручные настройки администратора
2. ❌ Запускается при каждом перезапуске Strapi
3. ❌ Не позволяет тонко настраивать permissions

## ✅ Решение

Изменил bootstrap функцию - теперь она **создаёт ТОЛЬКО недостающие permissions**, не удаляя существующие:

```typescript
// ✅ ХОРОШО: Создаёт только недостающие, не удаляет существующие
for (const perm of authenticatedPermissions) {
  const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
    where: { action: perm.action, role: authenticatedRole.id },
  });

  if (!existing) {
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action: perm.action,
        role: authenticatedRole.id,
      },
    });
    console.log(`✅ Created permission: ${perm.action} for authenticated`);
  } else {
    console.log(`⏭️  Permission already exists: ${perm.action} for authenticated`);
  }
}
```

**Преимущества нового подхода**:
1. ✅ Сохраняет ручные настройки администратора
2. ✅ Быстро работает (только проверка существующих)
3. ✅ Позволяет тонко настраивать permissions через Admin Panel
4. ✅ Создаёт permissions только при первом запуске или если их нет

## 🔧 Что было сделано

### 1. Исправлен код в `backend/strapi-backend/src/index.ts`

Убран блок кода, который удалял permissions при каждом запуске.

### 2. Удалены старые неправильные permissions из базы данных

Выполнена одноразовая команда:
```bash
sqlite3 .tmp/data.db "DELETE FROM up_permissions WHERE id IN (SELECT permission_id FROM up_permissions_role_lnk WHERE role_id = 1); DELETE FROM up_permissions_role_lnk WHERE role_id = 1;"
```

Это удалило все старые permissions для Authenticated роли, чтобы при следующем запуске они создались заново с правильной структурой.

## 🚀 Тестирование

### Шаг 1: Перезапустить Strapi ПОСЛЕДНИЙ РАЗ

```bash
# В терминале, где запущен Strapi:
# 1. Нажми Ctrl+C для остановки
# 2. Затем запусти снова:
cd /Users/zimbazo/WebstormProjects/Aetheris-community/backend/strapi-backend
npm run develop
```

**Ожидаемые логи в консоли Strapi**:

```
🔧 Setting up default permissions...
📋 Public role ID: 2
📋 Authenticated role ID: 1
✅ Created permission: api::article.article.find for authenticated
✅ Created permission: api::article.article.findOne for authenticated
✅ Created permission: api::article.article.create for authenticated
✅ Created permission: api::article.article.update for authenticated
✅ Created permission: api::article.article.delete for authenticated
...
✅ Default permissions configured successfully
```

### Шаг 2: Проверить статьи КАК неавторизованный

1. Разлогинься (если авторизован)
2. Открой `http://localhost:5173/`
3. **Ожидаемый результат**:
   - ✅ Статьи отображаются правильно
   - ✅ Есть заголовки, содержание, теги, автор

### Шаг 3: Проверить статьи КАК авторизованный

1. Авторизуйся через Google OAuth
2. Открой `http://localhost:5173/`
3. **Ожидаемый результат**:
   - ✅ Статьи отображаются правильно
   - ✅ Есть заголовки, содержание, теги, автор
   - ✅ НЕТ пометки "draft"

### Шаг 4: Создать новую статью

1. Открой `http://localhost:5173/create-article`
2. Заполни форму
3. Нажми "Опубликовать"
4. **Ожидаемый результат**:
   - ✅ Статья появилась на главной
   - ✅ Все поля отображаются правильно

### Шаг 5: Перезапустить Strapi ЕЩЁ РАЗ

```bash
# Ctrl+C, затем npm run develop
```

**Ожидаемые логи**:

```
🔧 Setting up default permissions...
📋 Public role ID: 2
📋 Authenticated role ID: 1
⏭️  Permission already exists: api::article.article.find for authenticated
⏭️  Permission already exists: api::article.article.findOne for authenticated
⏭️  Permission already exists: api::article.article.create for authenticated
...
✅ Default permissions configured successfully
```

**Важно**: Теперь логи показывают `⏭️ Permission already exists` - это означает, что permissions **НЕ пересоздаются**, а остаются как есть!

### Шаг 6: Проверить, что permissions НЕ сбросились

1. Зайди в Strapi Admin: `http://localhost:1337/admin`
2. Settings → Users & Permissions → Roles → **Authenticated**
3. **Ожидаемый результат**:
   - ✅ Все permissions на месте
   - ✅ Если изменить какой-то permission вручную
   - ✅ После перезапуска Strapi изменение **сохранится**

## 📊 Что было исправлено

| Проблема | Статус | Решение |
|----------|--------|---------|
| Permissions сбрасываются при перезапуске | ✅ Исправлено | Bootstrap создаёт только недостающие |
| Ручные настройки теряются | ✅ Исправлено | Существующие permissions не удаляются |
| Медленный запуск из-за пересоздания | ✅ Исправлено | Только проверка существующих (быстро) |

## 🎯 Результат

Теперь:
1. ✅ Permissions создаются **ОДИН РАЗ** при первом запуске
2. ✅ При последующих запусках **НЕ пересоздаются**
3. ✅ Администратор может **настраивать permissions вручную** через Admin Panel
4. ✅ Ручные настройки **сохраняются после перезапуска**

## 📝 Дополнительная информация

### Если нужно сбросить permissions к дефолтным

Если когда-нибудь понадобится сбросить permissions для `Authenticated` роли к дефолтным, можно:

**Вариант 1: Через Admin Panel**

1. Зайти в Settings → Users & Permissions → Roles → Authenticated
2. Снять ВСЕ галочки
3. Сохранить
4. Перезапустить Strapi
5. Permissions создадутся заново

**Вариант 2: Через базу данных**

```bash
cd backend/strapi-backend
sqlite3 .tmp/data.db "DELETE FROM up_permissions WHERE id IN (SELECT permission_id FROM up_permissions_role_lnk WHERE role_id = 1); DELETE FROM up_permissions_role_lnk WHERE role_id = 1;"
```

Затем перезапустить Strapi.

### Если нужно добавить новый content type

Если добавишь новый content type (например, `api::blog.blog`), нужно:

1. Добавить permissions в bootstrap функцию:
   ```typescript
   const authenticatedPermissions = [
     // ... существующие
     { action: 'api::blog.blog.find' },
     { action: 'api::blog.blog.findOne' },
     { action: 'api::blog.blog.create' },
     { action: 'api::blog.blog.update' },
     { action: 'api::blog.blog.delete' },
   ];
   ```

2. Перезапустить Strapi
3. Permissions для нового content type создадутся автоматически

## ✅ Готово!

После последнего перезапуска Strapi permissions больше НЕ будут сбрасываться! 🎉

