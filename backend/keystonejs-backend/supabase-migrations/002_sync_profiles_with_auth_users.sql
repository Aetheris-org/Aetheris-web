-- Supabase Migration: Sync profiles with auth.users
-- Автоматическое создание профиля при регистрации пользователя в Supabase Auth

-- Function to automatically create profile when user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_hash_value TEXT;
  username_value TEXT;
  name_value TEXT;
  hmac_secret TEXT;
BEGIN
  -- Хешируем email используя HMAC-SHA256
  -- Используем EMAIL_HMAC_SECRET из переменных окружения Supabase
  -- В production это должно быть настроено через Supabase secrets
  -- Для миграции используем значение из current_setting или fallback
  BEGIN
    -- Пытаемся получить секрет из настроек Supabase
    hmac_secret := current_setting('app.settings.email_hmac_secret', true);
  EXCEPTION WHEN OTHERS THEN
    -- Если секрет не настроен, используем fallback (должен быть заменен в production)
    hmac_secret := 'default-secret-change-in-production-please-set-email-hmac-secret';
    -- Логируем предупреждение (в production это должно быть настроено)
    RAISE WARNING 'EMAIL_HMAC_SECRET not configured, using default. Please set app.settings.email_hmac_secret';
  END;

  email_hash_value := encode(
    hmac(
      lower(trim(NEW.email)),
      hmac_secret,
      'sha256'
    ),
    'hex'
  );

  -- Генерируем username из email или metadata
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(NEW.id::text, 1, 8)
  );

  -- Генерируем name из metadata
  name_value := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Создаем профиль для нового пользователя
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
  ON CONFLICT (id) DO NOTHING; -- Защита от дубликатов

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
-- Используем IF NOT EXISTS для безопасности (если триггер уже существует, не создаем заново)
DO $$
BEGIN
  -- Удаляем триггер, если он существует
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
  
  -- Создаем новый триггер
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;

-- Function to sync profile updates when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  hmac_secret TEXT;
  email_hash_value TEXT;
BEGIN
  -- Обновляем email_hash если email изменился
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    BEGIN
      -- Пытаемся получить секрет из настроек Supabase
      hmac_secret := current_setting('app.settings.email_hmac_secret', true);
    EXCEPTION WHEN OTHERS THEN
      -- Если секрет не настроен, используем fallback
      hmac_secret := 'default-secret-change-in-production-please-set-email-hmac-secret';
      RAISE WARNING 'EMAIL_HMAC_SECRET not configured, using default. Please set app.settings.email_hmac_secret';
    END;

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

-- Trigger to sync profile when auth.users is updated
-- Используем DO блок для безопасного удаления и создания триггера
DO $$
BEGIN
  -- Удаляем триггер, если он существует
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_updated' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    DROP TRIGGER on_auth_user_updated ON auth.users;
  END IF;
  
  -- Создаем новый триггер
  CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
END $$;

