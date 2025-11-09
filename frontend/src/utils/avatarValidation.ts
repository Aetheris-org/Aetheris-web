/**
 * Безопасная валидация URL аватара
 * Проверяет, что URL:
 * 1. Начинается с https:// (безопасный протокол) или http:// для localhost
 * 2. Является валидным URL
 * 3. Не является javascript: или data: URL (защита от XSS)
 */
export function validateAvatarUrl(url: string | null | undefined): string | null {
  console.log('🔐 [validateAvatarUrl] Input:', url, 'Type:', typeof url);
  
  if (!url || typeof url !== 'string') {
    console.log('❌ [validateAvatarUrl] URL is null/undefined or not string');
    return null
  }
  
  const trimmed = url.trim()
  if (trimmed === '') {
    console.log('❌ [validateAvatarUrl] URL is empty after trim');
    return null
  }
  
  // Защита от javascript: и data: URL (XSS защита)
  const lowerTrimmed = trimmed.toLowerCase()
  
  // Разрешаем blob: URL для локальных превью (безопасно для img src)
  // blob: URL не могут быть проверены через new URL(), поэтому разрешаем их сразу
  if (lowerTrimmed.startsWith('blob:')) {
    console.log('✅ [validateAvatarUrl] Blob URL allowed:', trimmed);
    return trimmed
  }
  
  // Разрешаем data: URL для изображений (base64) - безопасно для img src
  // data:image/ URL также не могут быть проверены через new URL(), разрешаем их сразу
  if (lowerTrimmed.startsWith('data:image/')) {
    console.log('✅ [validateAvatarUrl] Data image URL allowed:', trimmed);
    return trimmed
  }
  
  // Блокируем опасные протоколы
  if (lowerTrimmed.startsWith('javascript:') || 
      lowerTrimmed.startsWith('vbscript:') ||
      lowerTrimmed.startsWith('file:')) {
    console.warn('❌ [validateAvatarUrl] Invalid URL protocol blocked:', trimmed)
    return null
  }
  
  // Блокируем data: URL (кроме data:image/, которые уже обработаны выше)
  if (lowerTrimmed.startsWith('data:')) {
    console.warn('❌ [validateAvatarUrl] Non-image data: URL blocked:', trimmed)
    return null
  }
  
  // ВАЖНО: Разрешаем относительные URL для Strapi uploads (например /uploads/...)
  if (trimmed.startsWith('/')) {
    console.log('✅ [validateAvatarUrl] Relative URL allowed:', trimmed);
    return trimmed
  }
  
  // Проверяем что это валидный URL (для http/https)
  try {
    const urlObj = new URL(trimmed)
    
    // Разрешаем HTTPS для всех хостов
    if (urlObj.protocol === 'https:') {
      console.log('✅ [validateAvatarUrl] HTTPS URL allowed:', trimmed);
      return trimmed
    }
    
    // Для разработки разрешаем HTTP с localhost
    const isLocalhost = urlObj.hostname === 'localhost' || 
                       urlObj.hostname === '127.0.0.1' ||
                       urlObj.hostname.startsWith('192.168.') ||
                       urlObj.hostname.startsWith('10.')
    
    if (urlObj.protocol === 'http:' && isLocalhost) {
      console.log('✅ [validateAvatarUrl] HTTP localhost URL allowed:', trimmed);
      return trimmed
    }
    
    // Если не HTTPS и не localhost - блокируем
    console.warn('❌ [validateAvatarUrl] URL must use HTTPS (except localhost):', trimmed)
    return null
  } catch (e) {
    // Не валидный URL - логируем только в dev
    console.warn('❌ [validateAvatarUrl] Invalid URL format:', trimmed, e)
    return null
  }
}

/**
 * Проверяет, что URL безопасен для использования в img src
 * Возвращает безопасный URL или null
 */
export function sanitizeAvatarUrl(url: string | null | undefined): string | null {
  return validateAvatarUrl(url)
}

/**
 * Безопасная валидация URL превью изображения статьи
 * Использует те же правила безопасности, что и для аватаров
 */
export function validatePreviewUrl(url: string | null | undefined): string | null {
  console.log('🔍 [validatePreviewUrl] Input:', url, 'Type:', typeof url);
  const result = validateAvatarUrl(url);
  console.log('✅ [validatePreviewUrl] Result:', result);
  return result;
}

/**
 * Проверяет, что URL превью безопасен для использования в img src
 * Возвращает безопасный URL или null
 */
export function sanitizePreviewUrl(url: string | null | undefined): string | null {
  console.log('🧹 [sanitizePreviewUrl] Input:', url);
  const result = validatePreviewUrl(url);
  console.log('✅ [sanitizePreviewUrl] Result:', result);
  return result;
}
