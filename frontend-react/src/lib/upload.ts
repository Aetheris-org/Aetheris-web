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
 * Удалить старые метаданные изображений из базы данных
 */
async function deleteOldImageMetadata(
  userId: string,
  folder: string,
  excludePath: string,
  articleId?: string | number
): Promise<void> {
  try {
    let query = supabase
      .from('image_uploads')
      .delete()
      .eq('user_id', userId)
      .eq('folder', folder)
      .neq('file_path', excludePath);

    // Для статей с articleId удаляем только метаданные превью этой статьи
    if (folder === 'articles' && articleId) {
      // Фильтруем по пути, который содержит articleId
      query = query.like('file_path', `%/${articleId}/%`);
    }

    const { error } = await query;

    if (error) {
      logger.warn('[deleteOldImageMetadata] Failed to delete old metadata:', error);
    } else {
      logger.debug('[deleteOldImageMetadata] Old metadata deleted successfully', { articleId });
    }
  } catch (error: any) {
    logger.warn('[deleteOldImageMetadata] Error deleting old metadata:', error);
  }
}

/**
 * Удалить старые файлы из Supabase Storage
 */
async function deleteOldSupabaseFiles(
  folder: 'avatars' | 'covers' | 'articles',
  userId: string,
  excludePath: string,
  articleId?: string | number
): Promise<void> {
  try {
    // Для статей с articleId используем более специфичный префикс
    let prefix: string;
    if (folder === 'articles' && articleId) {
      prefix = `${folder}/${userId}/${articleId}/`;
    } else {
      prefix = `${folder}/${userId}/`;
    }
    
    // Получаем список всех файлов в папке пользователя
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list(prefix, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError) {
      logger.warn('[deleteOldSupabaseFiles] Failed to list files:', listError);
      return;
    }

    if (!files || files.length === 0) {
      return;
    }

    // Фильтруем файлы, исключая новый файл
    const filesToDelete = files
      .filter((file) => {
        const fullPath = `${prefix}${file.name}`;
        return fullPath !== excludePath;
      })
      .map((file) => `${prefix}${file.name}`);

    if (filesToDelete.length === 0) {
      return;
    }

    logger.debug('[deleteOldSupabaseFiles] Deleting old files:', {
      count: filesToDelete.length,
      folder,
      userId,
      articleId,
    });

    // Удаляем старые файлы
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove(filesToDelete);

    if (deleteError) {
      logger.warn('[deleteOldSupabaseFiles] Failed to delete old files:', deleteError);
    } else {
      logger.debug('[deleteOldSupabaseFiles] Deleted old files:', {
        deleted: filesToDelete.length,
      });
    }
  } catch (error: any) {
    logger.warn('[deleteOldSupabaseFiles] Error deleting old files:', error);
    // Не выбрасываем ошибку, чтобы не блокировать загрузку нового файла
  }
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
  provider?: StorageProvider,
  articleId?: string | number // ID статьи (только для folder === 'articles')
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
      // Для avatars и covers: удаляем все старые файлы пользователя
      // Для articles: удаляем только если передан articleId (редактирование конкретной статьи)
      const deleteOld = folder === 'avatars' || folder === 'covers' || (folder === 'articles' && !!articleId);
      const r2Result = await uploadToR2(file, folder, user.id, deleteOld, articleId);
      result = {
        url: r2Result.url,
        path: r2Result.path,
        provider: 'r2',
      };

      // Удаляем старые метаданные из базы данных
      if (deleteOld) {
        await deleteOldImageMetadata(user.id, folder, r2Result.path, articleId);
      }

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
      // Для статей с articleId используем структуру: articles/{userId}/{articleId}/preview.jpg
      let fileName: string;
      if (folder === 'articles' && articleId) {
        fileName = `${folder}/${user.id}/${articleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      } else {
        fileName = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      }

    logger.debug('[uploadImage] Uploading to Supabase Storage:', {
      fileName,
      folder,
      size: file.size,
      type: file.type,
        articleId,
    });

      // Удаляем старые файлы перед загрузкой нового (для оптимизации)
      // Для avatars и covers: удаляем все старые
      // Для articles: удаляем только если передан articleId (редактирование конкретной статьи)
      if (folder === 'avatars' || folder === 'covers' || (folder === 'articles' && articleId)) {
        await deleteOldSupabaseFiles(folder, user.id, fileName, articleId);
      }

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

      // Удаляем старые метаданные из базы данных
      // Для avatars и covers: удаляем все старые
      // Для articles: удаляем только если передан articleId (редактирование конкретной статьи)
      if (folder === 'avatars' || folder === 'covers' || (folder === 'articles' && articleId)) {
        await deleteOldImageMetadata(user.id, folder, data.path, articleId);
      }

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

