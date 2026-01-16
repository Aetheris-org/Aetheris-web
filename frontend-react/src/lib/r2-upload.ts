/**
 * Cloudflare R2 Upload Utility
 * Загрузка изображений в Cloudflare R2 через AWS SDK
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
 * Извлечь Account ID из S3 endpoint для формирования публичного URL
 */
function extractAccountIdFromEndpoint(endpoint: string): string | null {
  // Формат: https://{account-id}.r2.cloudflarestorage.com
  const match = endpoint.match(/https?:\/\/([^.]+)\.r2\.cloudflarestorage\.com/);
  return match ? match[1] : null;
}

/**
 * Загрузить изображение в Cloudflare R2
 */
export async function uploadToR2(
  file: File,
  folder: 'avatars' | 'covers' | 'articles' = 'articles',
  userId: string
): Promise<R2UploadResult> {
  try {
    checkR2Config();

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    logger.debug('[uploadToR2] Uploading to R2:', {
      fileName,
      folder,
      size: file.size,
      type: file.type,
      bucket: r2BucketName,
    });

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
