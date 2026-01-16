/**
 * Cloudflare R2 Upload Utility
 * Загрузка изображений в Cloudflare R2 через AWS SDK
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

export interface R2UploadResult {
  url: string;
  path: string;
}

// Получаем переменные окружения - только самое необходимое
const r2S3Endpoint = import.meta.env.VITE_R2_S3_ENDPOINT;
const r2AccessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const r2BucketName = import.meta.env.VITE_R2_BUCKET_NAME;
const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

// Создаем S3 клиент для R2
// Cloudflare R2 использует S3-совместимый API
const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2S3Endpoint,
  credentials: r2AccessKeyId && r2SecretAccessKey
    ? {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      }
    : undefined,
});

/**
 * Проверка конфигурации R2
 */
function checkR2Config(): void {
  if (!r2S3Endpoint || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
    throw new Error(
      'R2 configuration is missing. Please set VITE_R2_S3_ENDPOINT, VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY, and VITE_R2_BUCKET_NAME environment variables.'
    );
  }
}

/**
 * Загрузить изображение в Cloudflare R2
 */
export async function uploadToR2(
  file: File,
  folder: 'avatars' | 'covers' | 'articles' = 'articles',
  userId: string,
  deleteOldFiles: boolean = true, // Удалять ли старые файлы перед загрузкой
  articleId?: string | number // ID статьи (только для folder === 'articles')
): Promise<R2UploadResult> {
  try {
    checkR2Config();

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    // Для статей с articleId используем структуру: articles/{userId}/{articleId}/preview.jpg
    // Это позволяет удалять только превью конкретной статьи
    let fileName: string;
    if (folder === 'articles' && articleId) {
      fileName = `${folder}/${userId}/${articleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    } else {
      fileName = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    }

    logger.debug('[uploadToR2] Uploading to R2:', {
      fileName,
      folder,
      size: file.size,
      type: file.type,
      bucket: r2BucketName,
      deleteOldFiles,
      articleId,
    });

    // Удаляем старые файлы перед загрузкой нового (для оптимизации хранилища)
    // Для аватаров и баннеров: удаляем все старые файлы пользователя
    // Для статей: удаляем только если передан articleId (редактирование конкретной статьи)
    // При создании новой статьи (без articleId) старые превью не удаляются
    if (deleteOldFiles) {
      if (folder === 'avatars' || folder === 'covers') {
        // Для аватаров и баннеров удаляем все старые файлы
        const deletedCount = await deleteOldFilesFromR2(folder, userId, fileName);
        logger.debug('[uploadToR2] Deleted old files before upload:', { deletedCount, folder });
      } else if (folder === 'articles' && articleId) {
        // Для статей удаляем только превью конкретной редактируемой статьи
        const deletedCount = await deleteOldFilesFromR2(folder, userId, fileName, articleId);
        logger.debug('[uploadToR2] Deleted old preview for article:', { deletedCount, articleId });
      }
    }

    // Конвертируем File в ArrayBuffer (браузерная среда)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Загружаем файл в R2
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await r2Client.send(command);

    // Формируем публичный URL
    let publicUrl: string;
    if (r2PublicUrl) {
      // Используем кастомный публичный URL (если настроен публичный домен)
      publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${fileName}`;
    } else {
      // Генерируем presigned URL для публичного доступа
      // Presigned URL действителен 1 год (максимум для R2)
      const getObjectCommand = new GetObjectCommand({
        Bucket: r2BucketName,
        Key: fileName,
      });
      
      // Генерируем presigned URL с длительным сроком действия (1 год)
      publicUrl = await getSignedUrl(r2Client, getObjectCommand, { expiresIn: 31536000 }); // 1 год в секундах
      
      logger.debug('[uploadToR2] Generated presigned URL:', {
        url: publicUrl.substring(0, 100) + '...',
      });
    }

    logger.debug('[uploadToR2] Upload successful:', {
      path: fileName,
      url: publicUrl,
    });

    return {
      url: publicUrl,
      path: fileName,
    };
  } catch (error: any) {
    logger.error('[uploadToR2] Upload failed:', error);
    throw new Error(`Failed to upload image to R2: ${error.message}`);
  }
}

/**
 * Удалить изображение из Cloudflare R2
 */
export async function deleteFromR2(path: string): Promise<boolean> {
  try {
    checkR2Config();

    logger.debug('[deleteFromR2] Deleting from R2:', {
      path,
      bucket: r2BucketName,
    });

    const command = new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: path,
    });

    await r2Client.send(command);

    logger.debug('[deleteFromR2] Delete successful:', { path });
    return true;
  } catch (error: any) {
    logger.error('[deleteFromR2] Delete failed:', error);
    return false;
  }
}

/**
 * Удалить все старые файлы пользователя из указанной папки
 * Используется для оптимизации - оставляем только последний загруженный файл
 * 
 * Для статей: если передан articleId, удаляет только превью этой статьи
 * Для аватаров и баннеров: удаляет все старые файлы пользователя
 */
export async function deleteOldFilesFromR2(
  folder: 'avatars' | 'covers' | 'articles',
  userId: string,
  excludePath?: string, // Путь к файлу, который нужно сохранить (новый файл)
  articleId?: string | number // ID статьи (только для folder === 'articles')
): Promise<number> {
  try {
    checkR2Config();

    // Для статей с articleId используем более специфичный префикс
    // Формат: articles/{userId}/{articleId}/preview.jpg
    // Если articleId не передан, удаляем все превью пользователя
    let prefix: string;
    if (folder === 'articles' && articleId) {
      prefix = `${folder}/${userId}/${articleId}/`;
    } else {
      prefix = `${folder}/${userId}/`;
    }
    
    logger.debug('[deleteOldFilesFromR2] Finding old files:', {
      prefix,
      excludePath,
      articleId,
      bucket: r2BucketName,
    });

    // Получаем список всех файлов в папке пользователя
    const listCommand = new ListObjectsV2Command({
      Bucket: r2BucketName,
      Prefix: prefix,
    });

    const listResponse = await r2Client.send(listCommand);
    const filesToDelete = (listResponse.Contents || [])
      .filter((file) => file.Key && file.Key !== excludePath)
      .map((file) => file.Key!)
      .filter(Boolean);

    if (filesToDelete.length === 0) {
      logger.debug('[deleteOldFilesFromR2] No old files to delete');
      return 0;
    }

    logger.debug('[deleteOldFilesFromR2] Deleting old files:', {
      count: filesToDelete.length,
      files: filesToDelete,
    });

    // Удаляем все старые файлы
    // R2 поддерживает удаление до 1000 объектов за раз
    const deletePromises = filesToDelete.map((key) =>
      deleteFromR2(key).catch((error) => {
        logger.warn('[deleteOldFilesFromR2] Failed to delete file:', { key, error });
        return false;
      })
    );

    const results = await Promise.all(deletePromises);
    const deletedCount = results.filter((result) => result === true).length;

    logger.debug('[deleteOldFilesFromR2] Deleted old files:', {
      deleted: deletedCount,
      total: filesToDelete.length,
    });

    return deletedCount;
  } catch (error: any) {
    logger.error('[deleteOldFilesFromR2] Error deleting old files:', error);
    // Не выбрасываем ошибку, чтобы не блокировать загрузку нового файла
    return 0;
  }
}

/**
 * Проверить, настроен ли R2
 */
export function isR2Configured(): boolean {
  return !!(
    r2S3Endpoint &&
    r2AccessKeyId &&
    r2SecretAccessKey &&
    r2BucketName
  );
}
