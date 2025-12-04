# Решение проблемы с EMAIL_HMAC_SECRET

Ошибка `permission denied to set parameter` возникает потому, что в Supabase нельзя напрямую изменять параметры базы данных через `ALTER DATABASE`.

## ✅ Решение: Использовать Supabase Vault (Secrets)

Самый правильный способ - использовать Supabase Vault для хранения секретов.

### Шаг 1: Сохранить секрет в Supabase Vault

1. Откройте Supabase Dashboard
2. Перейдите в **Settings > Vault** (или **Settings > Secrets**)
3. Нажмите **Create new secret**
4. Заполните:
   - **Name**: `EMAIL_HMAC_SECRET`
   - **Value**: `KgzGr8mTY1wMfKMIxCpGUi8ojYvKL7396q4JivhoaZ9rWYqv/f6CMptuwPBp2dIHoS+nuSkGJcF6d2A/WSn06A==`
5. Сохраните

### Шаг 2: Обновить функции для использования Vault

Выполните этот SQL в Supabase SQL Editor:

```sql
-- Обновляем функцию handle_new_user для использования Vault
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_hash_value TEXT;
  username_value TEXT;
  name_value TEXT;
  hmac_secret TEXT;
BEGIN
  -- Получаем секрет из Vault
  BEGIN
    SELECT decrypted_secret INTO hmac_secret
    FROM vault.secrets
    WHERE name = 'EMAIL_HMAC_SECRET';
    
    IF hmac_secret IS NULL THEN
      RAISE EXCEPTION 'EMAIL_HMAC_SECRET not found in Vault. Please create it in Settings > Vault';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback на переменную окружения (если Vault недоступен)
    BEGIN
      hmac_secret := current_setting('app.settings.email_hmac_secret', true);
    EXCEPTION WHEN OTHERS THEN
      hmac_secret := 'default-secret-change-in-production-please-set-email-hmac-secret';
      RAISE WARNING 'EMAIL_HMAC_SECRET not configured, using default. Please set it in Vault';
    END;
  END;

  email_hash_value := encode(
    hmac(
      lower(trim(NEW.email)),
      hmac_secret,
      'sha256'
    ),
    'hex'
  );

  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(NEW.id::text, 1, 8)
  );

  name_value := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id, username, name, email_hash, provider, confirmed
  )
  VALUES (
    NEW.id, username_value, name_value, email_hash_value,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'local'),
    COALESCE((NEW.raw_user_meta_data->>'confirmed')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем функцию handle_user_update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  hmac_secret TEXT;
  email_hash_value TEXT;
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    BEGIN
      -- Получаем секрет из Vault
      SELECT decrypted_secret INTO hmac_secret
      FROM vault.secrets
      WHERE name = 'EMAIL_HMAC_SECRET';
      
      IF hmac_secret IS NULL THEN
        BEGIN
          hmac_secret := current_setting('app.settings.email_hmac_secret', true);
        EXCEPTION WHEN OTHERS THEN
          hmac_secret := 'default-secret-change-in-production-please-set-email-hmac-secret';
        END;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      hmac_secret := 'default-secret-change-in-production-please-set-email-hmac-secret';
    END;

    email_hash_value := encode(
      hmac(lower(trim(NEW.email)), hmac_secret, 'sha256'),
      'hex'
    );

    UPDATE public.profiles
    SET email_hash = email_hash_value
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 Альтернативное решение: Использовать переменные окружения

Если Vault недоступен, можно использовать другой подход - передавать секрет через параметры или использовать таблицу настроек.

### Вариант 1: Таблица настроек

Создайте таблицу для хранения секрета:

```sql
-- Создаем таблицу для настроек (только для секретов, которые нужны в БД)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем секрет (выполните один раз)
INSERT INTO public.app_settings (key, value)
VALUES ('email_hmac_secret', 'KgzGr8mTY1wMfKMIxCpGUi8ojYvKL7396q4JivhoaZ9rWYqv/f6CMptuwPBp2dIHoS+nuSkGJcF6d2A/WSn06A==')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Обновляем функции для использования таблицы
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_hash_value TEXT;
  username_value TEXT;
  name_value TEXT;
  hmac_secret TEXT;
BEGIN
  -- Получаем секрет из таблицы настроек
  SELECT value INTO hmac_secret
  FROM public.app_settings
  WHERE key = 'email_hmac_secret';
  
  IF hmac_secret IS NULL THEN
    RAISE EXCEPTION 'EMAIL_HMAC_SECRET not found in app_settings. Please insert it.';
  END IF;

  email_hash_value := encode(
    hmac(lower(trim(NEW.email)), hmac_secret, 'sha256'),
    'hex'
  );

  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(NEW.id::text, 1, 8)
  );

  name_value := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id, username, name, email_hash, provider, confirmed
  )
  VALUES (
    NEW.id, username_value, name_value, email_hash_value,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'local'),
    COALESCE((NEW.raw_user_meta_data->>'confirmed')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Аналогично для handle_user_update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  hmac_secret TEXT;
  email_hash_value TEXT;
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    SELECT value INTO hmac_secret
    FROM public.app_settings
    WHERE key = 'email_hmac_secret';
    
    IF hmac_secret IS NULL THEN
      RAISE EXCEPTION 'EMAIL_HMAC_SECRET not found in app_settings';
    END IF;

    email_hash_value := encode(
      hmac(lower(trim(NEW.email)), hmac_secret, 'sha256'),
      'hex'
    );

    UPDATE public.profiles
    SET email_hash = email_hash_value
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Защищаем таблицу настроек RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are only accessible by service role"
  ON public.app_settings FOR ALL
  USING (false); -- Только через service role (backend)
```

---

## ✅ Рекомендуемое решение: Вариант 1 (Таблица настроек)

Это самый простой и надежный способ. Выполните:

1. **Создайте таблицу и вставьте секрет:**
```sql
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.app_settings (key, value)
VALUES ('email_hmac_secret', 'KgzGr8mTY1wMfKMIxCpGUi8ojYvKL7396q4JivhoaZ9rWYqv/f6CMptuwPBp2dIHoS+nuSkGJcF6d2A/WSn06A==')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

2. **Обновите функции** (используйте SQL из варианта 1 выше)

3. **Защитите таблицу RLS:**
```sql
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are only accessible by service role"
  ON public.app_settings FOR ALL
  USING (false);
```

---

## 🎯 Итог

**Не нужно** выполнять `ALTER DATABASE SET app.settings.email_hmac_secret`.

Вместо этого:
- ✅ Используйте таблицу `app_settings` (рекомендуется)
- ✅ Или используйте Supabase Vault (если доступен)

Секрет будет храниться в таблице и использоваться функциями автоматически.


