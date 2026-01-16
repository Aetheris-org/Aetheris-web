/**
 * Image Upload Utility
 * Загрузка изображений в Supabase Storage или Cloudflare R2
 */
import { supabase } from './supabase';
import { logger } from './logger';
import { uploadToR2, deleteFromR2, isR2Configured } from './r2-upload';

export type StorageProvider = 'supabase' | 'r2';

export interface UploadResult {
  url: string;
  path: string;
  provider?: StorageProvider;
}

/**
 * Получить провайдер хранилища из переменных окружения или использовать по умолчанию
 */
function getStorageProvider(): StorageProvider {
  const envProvider = import.meta.env.VITE_STORAGE_PROVIDER as StorageProvider | undefined;
  
  if (envProvider === 'r2' || envProvider === 'supabase') {
    return envProvider;
  }
  
  // Если R2 настроен, используем его, иначе Supabase
  return isR2Configured() ? 'r2' : 'supabase';
}

/**
 * Сохранить метаданные загруженного изображения в базу данных
 */
async function saveImageMetadata(
  userId: string,
  provider: StorageProvider,
  filePath: string,
  fileUrl: string,
  fileSize: number,
  mimeType: string,
  folder: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('image_uploads')
      .insert({
        user_id: userId,
        storage_provider: provider,
        file_path: filePath,
        file_url: fileUrl,
        file_size: fileSize,
        mime_type: mimeType,
        folder: folder,
      });

    if (error) {
      logger.warn('[saveImageMetadata] Failed to save metadata:', error);
      // Не выбрасываем ошибку, так как загрузка уже успешна
    } else {
      logger.debug('[saveImageMetadata] Metadata saved successfully');
    }
  } catch (error: any) {
    logger.warn('[saveImageMetadata] Error saving metadata:', error);
    // Не выбрасываем ошибку, так как загрузка уже успешна
  }
}

/**
 * Загрузить изображение в выбранное хранилище (Supabase Storage или Cloudflare R2)
 */
export async function uploadImage(
  file: File,
  folder: 'avatars' | 'covers' | 'articles' = 'articles',
  provider?: StorageProvider
): Promise<UploadResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    // Определяем провайдер хранилища
    const storageProvider = provider || getStorageProvider();

    logger.debug('[uploadImage] Starting upload:', {
      folder,
      size: file.size,
      type: file.type,
      provider: storageProvider,
    });

    let result: UploadResult;

    if (storageProvider === 'r2') {
      // Загрузка в Cloudflare R2
      const r2Result = await uploadToR2(file, folder, user.id);
      result = {
        url: r2Result.url,
        path: r2Result.path,
        provider: 'r2',
      };

      // Сохраняем метаданные в базу данных
      await saveImageMetadata(
        user.id,
        'r2',
        r2Result.path,
        r2Result.url,
        file.size,
        file.type,
        folder
      );
    } else {
      // Загрузка в Supabase Storage (старый способ)
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      logger.debug('[uploadImage] Uploading to Supabase Storage:', {
        fileName,
        folder,
        size: file.size,
        type: file.type,
      });

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        logger.error('[uploadImage] Upload failed:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      result = {
        url: urlData.publicUrl,
        path: data.path,
        provider: 'supabase',
      };

      // Сохраняем метаданные в базу данных
      await saveImageMetadata(
        user.id,
        'supabase',
        data.path,
        urlData.publicUrl,
        file.size,
        file.type,
        folder
      );
    }

    logger.debug('[uploadImage] Upload successful:', {
      path: result.path,
      url: result.url,
      provider: result.provider,
    });

    return result;
  } catch (error: any) {
    logger.error('[uploadImage] Error:', error);
    throw error;
  }
}

/**
 * Удалить изображение из хранилища
 */
export async function deleteImage(path: string, provider?: StorageProvider): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete images');
    }

    // Проверяем, что пользователь удаляет свой файл
    if (!path.includes(user.id)) {
      throw new Error('Cannot delete images that do not belong to you');
    }

    // Определяем провайдер хранилища
    let storageProvider = provider;

    // Если провайдер не указан, пытаемся определить из базы данных
    if (!storageProvider) {
      const { data: imageData } = await supabase
        .from('image_uploads')
        .select('storage_provider')
        .eq('file_path', path)
        .eq('user_id', user.id)
        .single();

      if (imageData) {
        storageProvider = imageData.storage_provider as StorageProvider;
      } else {
        // Если не найдено в базе, используем дефолтный провайдер
        storageProvider = getStorageProvider();
      }
    }

    let deleteSuccess = false;

    if (storageProvider === 'r2') {
      // Удаление из R2
      deleteSuccess = await deleteFromR2(path);
    } else {
      // Удаление из Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .remove([path]);

      if (error) {
        logger.error('[deleteImage] Delete failed:', error);
        return false;
      }
      deleteSuccess = true;
    }

    // Удаляем метаданные из базы данных
    if (deleteSuccess) {
      await supabase
        .from('image_uploads')
        .delete()
        .eq('file_path', path)
        .eq('user_id', user.id);
    }

    return deleteSuccess;
  } catch (error: any) {
    logger.error('[deleteImage] Error:', error);
    return false;
  }
}

