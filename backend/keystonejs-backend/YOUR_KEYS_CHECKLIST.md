# Чеклист ваших ключей

## ✅ У вас уже есть:

1. **SUPABASE_ANON_KEY** ✅
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs9lBSwoSESQ9d_G2PVBqHM
   ```

2. **SUPABASE_SERVICE_ROLE_KEY** ✅
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1MTMwNSwiZXhwIjoyMDc5NzI3MzA1fQ.yGnLijPqC2cdJkJQYkhpj2rIzg9ld2DNQri9KBIGpwo
   ```

## ❌ Что еще нужно получить:

### 1. SUPABASE_URL

**Где найти:**
- Settings → API → Project URL

**Должен быть примерно таким:**
```
https://lublvnvoawndnmkgndct.supabase.co
```

(Судя по вашему ref `lublvnvoawndnmkgndct`, URL должен быть именно таким)

---

### 2. SUPABASE_DATABASE_URL

**Где найти:**
- Settings → Database → Connection string → вкладка "URI"

**Формат:**
```
postgresql://postgres:[ВАШ-ПАРОЛЬ]@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
```

**Важно:**
- Замените `[ВАШ-ПАРОЛЬ]` на реальный пароль базы данных
- Если не знаете пароль: Settings → Database → "Reset database password"

---

### 3. SESSION_SECRET

**Нужно сгенерировать** (не берется из Supabase):

```bash
openssl rand -base64 64
```

Или через Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Требования:**
- Минимум 32 символа
- Криптографически стойкий случайный ключ

---

### 4. EMAIL_HMAC_SECRET

**Нужно сгенерировать** (не берется из Supabase):

```bash
openssl rand -base64 64
```

(Выполните команду еще раз, чтобы получить другой секрет)

**Требования:**
- Минимум 32 символа
- Должен быть другим, чем SESSION_SECRET
- Этот же секрет нужно будет настроить в Supabase (см. ниже)

---

## 📝 Итоговый .env файл

После получения всех значений, ваш `.env` файл должен выглядеть так:

```bash
# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=https://lublvnvoawndnmkgndct.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTEzMDUsImV4cCI6MjA3OTcyNzMwNX0.Hcm7vuV3NCmI1cptohrHBs9lBSwoSESQ9d_G2PVBqHM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Ymx2bnZvYXduZG5ta2duZGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1MTMwNSwiZXhwIjoyMDc5NzI3MzA1fQ.yGnLijPqC2cdJkJQYkhpj2rIzg9ld2DNQri9KBIGpwo
SUPABASE_DATABASE_URL=postgresql://postgres:ВАШ-ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres

# Для обратной совместимости
DATABASE_URL=${SUPABASE_DATABASE_URL}

# ============================================
# Authentication Secrets
# ============================================
SESSION_SECRET=ваш-сгенерированный-секрет-здесь
EMAIL_HMAC_SECRET=ваш-сгенерированный-секрет-здесь

# ============================================
# Application URLs
# ============================================
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:1337
PORT=1337
NODE_ENV=development
```

---

## 🔐 Дополнительный шаг: Настройка EMAIL_HMAC_SECRET в Supabase

После генерации `EMAIL_HMAC_SECRET`, его нужно также настроить в Supabase:

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните:

```sql
ALTER DATABASE postgres SET app.settings.email_hmac_secret = 'ваш-email-hmac-secret-здесь';
```

**Важно:** Используйте тот же секрет, что и в `.env` файле!

---

## ✅ Чеклист готовности

- [ ] SUPABASE_URL получен
- [ ] SUPABASE_DATABASE_URL получен (с паролем)
- [ ] SESSION_SECRET сгенерирован
- [ ] EMAIL_HMAC_SECRET сгенерирован
- [ ] EMAIL_HMAC_SECRET настроен в Supabase (через SQL)
- [ ] Файл `.env` создан и заполнен
- [ ] Все значения проверены

---

## 🚀 После заполнения

Когда все ключи будут получены:
1. Сохраните `.env` файл
2. Выполните: `npm install` (если еще не делали)
3. Запустите: `npm run dev`
4. Проверьте, что backend подключается к Supabase


