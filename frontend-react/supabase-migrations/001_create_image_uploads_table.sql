-- Миграция: Создание таблицы image_uploads для отслеживания загруженных изображений
-- Дата создания: 2024-12-XX
-- Описание: Таблица для хранения метаданных изображений, загруженных в Supabase Storage или Cloudflare R2

-- Создание таблицы image_uploads
CREATE TABLE IF NOT EXISTS image_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'r2')),
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  folder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_id ON image_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_image_uploads_storage_provider ON image_uploads(storage_provider);
CREATE INDEX IF NOT EXISTS idx_image_uploads_file_path ON image_uploads(file_path);
CREATE INDEX IF NOT EXISTS idx_image_uploads_created_at ON image_uploads(created_at);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_image_uploads_updated_at
  BEFORE UPDATE ON image_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице и колонкам
COMMENT ON TABLE image_uploads IS 'Метаданные загруженных изображений';
COMMENT ON COLUMN image_uploads.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN image_uploads.user_id IS 'ID пользователя, загрузившего изображение';
COMMENT ON COLUMN image_uploads.storage_provider IS 'Провайдер хранилища: supabase или r2';
COMMENT ON COLUMN image_uploads.file_path IS 'Путь к файлу в хранилище';
COMMENT ON COLUMN image_uploads.file_url IS 'Публичный URL файла';
COMMENT ON COLUMN image_uploads.file_size IS 'Размер файла в байтах';
COMMENT ON COLUMN image_uploads.mime_type IS 'MIME тип файла';
COMMENT ON COLUMN image_uploads.folder IS 'Папка, в которую загружен файл (avatars, covers, articles)';



