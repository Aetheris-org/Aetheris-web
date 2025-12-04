/**
 * Image Upload Utility
 * Загрузка изображений в Supabase Storage
 */
import { supabase } from './supabase';
import { logger } from './logger';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Загрузить изображение в Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder: 'avatars' | 'covers' | 'articles' = 'articles'
): Promise<UploadResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    logger.debug('[uploadImage] Uploading to Supabase Storage:', {
      fileName,
      folder,
      size: file.size,
      type: file.type,
    });

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabase.storage
      .from('images') // Bucket name - нужно создать в Supabase Dashboard
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.error('[uploadImage] Upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    logger.debug('[uploadImage] Upload successful:', {
      path: data.path,
      url: urlData.publicUrl,
    });

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    logger.error('[uploadImage] Error:', error);
    throw error;
  }
}

/**
 * Удалить изображение из Supabase Storage
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete images');
    }

    // Проверяем, что пользователь удаляет свой файл
    if (!path.includes(user.id)) {
      throw new Error('Cannot delete images that do not belong to you');
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      logger.error('[deleteImage] Delete failed:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    logger.error('[deleteImage] Error:', error);
    return false;
  }
}

