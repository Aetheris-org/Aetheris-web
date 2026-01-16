/**
 * R2 URL Helper
 * Утилита для преобразования R2 URLs в правильный формат
 */

const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
const r2BucketName = import.meta.env.VITE_R2_BUCKET_NAME;

/**
 * Преобразовать старый R2 URL в новый формат с Public Development URL
 * Если URL уже в правильном формате или не является R2 URL, возвращает исходный URL
 */
export function normalizeR2Url(url: string | null | undefined): string | null {
  if (!url) return null;

  // Если уже используется правильный публичный URL, возвращаем как есть
  if (r2PublicUrl && url.includes(r2PublicUrl)) {
    return url;
  }

  // Если URL содержит старый формат R2 (S3 endpoint)
  // Преобразуем его в новый формат с Public Development URL
  if (r2PublicUrl && r2BucketName) {
    // Паттерн для старого формата: https://{account-id}.r2.cloudflarestorage.com/{bucket}/{path}
    // Также обрабатываем формат с bucket в пути: https://{account-id}.r2.cloudflarestorage.com/{bucket}/{path}
    const oldR2Pattern = /https?:\/\/[^/]+\.r2\.cloudflarestorage\.com\/([^/]+)\/(.+)/;
    const match = url.match(oldR2Pattern);
    
    if (match) {
      const bucketInUrl = match[1];
      const filePath = match[2];
      
      // Если bucket в URL совпадает с нашим bucket, преобразуем URL
      if (bucketInUrl === r2BucketName) {
        // Формируем новый URL с Public Development URL
        return `${r2PublicUrl.replace(/\/$/, '')}/${filePath}`;
      }
    }
    
    // Также обрабатываем случай, когда bucket уже есть в пути
    // Формат: https://{account-id}.r2.cloudflarestorage.com/aetheris-media/avatars/...
    if (url.includes(`/${r2BucketName}/`)) {
      const pathMatch = url.match(/https?:\/\/[^/]+\.r2\.cloudflarestorage\.com\/[^/]+\/(.+)/);
      if (pathMatch) {
        const filePath = pathMatch[1];
        return `${r2PublicUrl.replace(/\/$/, '')}/${filePath}`;
      }
    }
  }

  // Если это не R2 URL или формат не распознан, возвращаем исходный URL
  return url;
}

/**
 * Проверить, является ли URL R2 URL
 */
export function isR2Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('.r2.cloudflarestorage.com') || (r2PublicUrl ? url.includes(r2PublicUrl) : false);
}
