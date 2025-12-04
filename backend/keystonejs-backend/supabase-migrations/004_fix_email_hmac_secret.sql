-- Supabase Migration: Fix EMAIL_HMAC_SECRET storage
-- Решение проблемы с permission denied при установке параметра базы данных
-- Используем таблицу app_settings вместо ALTER DATABASE

-- Создаем таблицу для хранения настроек приложения
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем EMAIL_HMAC_SECRET в таблицу настроек
-- ВАЖНО: Замените 'YOUR-EMAIL-HMAC-SECRET-HERE' на ваш реальный секрет!
INSERT INTO public.app_settings (key, value)
VALUES ('email_hmac_secret', 'YOUR-EMAIL-HMAC-SECRET-HERE')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Защищаем таблицу настроек RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Политика: настройки доступны только через service role (backend)
CREATE POLICY "Settings are only accessible by service role"
  ON public.app_settings FOR ALL
  USING (false); -- Только через service role, не через обычные запросы

-- Обновляем функцию handle_new_user для использования таблицы настроек
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
  
  IF hmac_secret IS NULL OR hmac_secret = 'YOUR-EMAIL-HMAC-SECRET-HERE' THEN
    RAISE EXCEPTION 'EMAIL_HMAC_SECRET not configured. Please update app_settings table with your secret.';
  END IF;

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
    id,
    username,
    name,
    email_hash,
    provider,
    confirmed
  )
  VALUES (
    NEW.id,
    username_value,
    name_value,
    email_hash_value,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'local'),
    COALESCE((NEW.raw_user_meta_data->>'confirmed')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем функцию handle_user_update для использования таблицы настроек
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  hmac_secret TEXT;
  email_hash_value TEXT;
BEGIN
  -- Обновляем email_hash если email изменился
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    -- Получаем секрет из таблицы настроек
    SELECT value INTO hmac_secret
    FROM public.app_settings
    WHERE key = 'email_hmac_secret';
    
    IF hmac_secret IS NULL OR hmac_secret = 'YOUR-EMAIL-HMAC-SECRET-HERE' THEN
      RAISE EXCEPTION 'EMAIL_HMAC_SECRET not configured. Please update app_settings table with your secret.';
    END IF;

    email_hash_value := encode(
      hmac(
        lower(trim(NEW.email)),
        hmac_secret,
        'sha256'
      ),
      'hex'
    );

    UPDATE public.profiles
    SET email_hash = email_hash_value
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


