/**
 * Утилиты для сжатия и оптимизации изображений
 */

/**
 * Сжимает изображение до указанного размера и качества
 * @param file - Исходный файл изображения
 * @param maxWidth - Максимальная ширина (по умолчанию 800px)
 * @param maxHeight - Максимальная высота (по умолчанию 800px)
 * @param quality - Качество JPEG (0.0 - 1.0, по умолчанию 0.85)
 * @returns Promise с Blob сжатого изображения
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Создаем canvas для сжатия
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        // Конвертируем в Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Преобразует Blob в File
 * @param blob - Blob объект
 * @param filename - Имя файла
 * @returns File объект
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

/**
 * Оптимизирует изображение для аватара до размера <10KB
 * Использует агрессивное сжатие для маленьких аватарок
 * @param file - Исходный файл
 * @returns Promise с оптимизированным File
 */
export async function optimizeAvatar(file: File): Promise<File> {
  const targetSizeKB = 10 // Целевой размер в KB
  const maxDimension = 120 // Максимальный размер для аватара (120x120 достаточно для маленьких кружков)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let width = img.width
        let height = img.height
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        // Создаем canvas для сжатия
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Улучшаем качество рендеринга (сглаживание)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        // Функция для итеративного сжатия до целевого размера
        const compressToTarget = (quality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              
              // ВАЖНО: Проверяем что blob не пустой
              if (blob.size === 0) {
                console.error('❌ Canvas produced empty blob, retrying with higher quality')
                if (quality < 0.95) {
                  compressToTarget(Math.min(0.95, quality + 0.1))
                } else {
                  reject(new Error('Failed to compress image: empty blob'))
                }
                return
              }
              
              // Проверяем что изображение на canvas валидно
              // ВАЖНО: Проверяем не только первые 10 пикселей, но и размер canvas
              if (width === 0 || height === 0) {
                console.error('❌ Canvas has invalid dimensions:', { width, height })
                reject(new Error('Failed to compress image: invalid canvas dimensions'))
                return
              }
              
              // Проверяем что canvas содержит данные (проверяем центр изображения)
              try {
                const centerX = Math.floor(width / 2)
                const centerY = Math.floor(height / 2)
                const checkSize = Math.min(10, Math.min(width, height))
                const imageData = ctx.getImageData(
                  Math.max(0, centerX - checkSize / 2), 
                  Math.max(0, centerY - checkSize / 2), 
                  checkSize, 
                  checkSize
                )
                const hasData = imageData.data.some((pixel, index) => index % 4 !== 3 && pixel !== 0) // Проверяем RGB, не alpha
                
                if (!hasData) {
                  console.error('❌ Canvas center appears to be empty, retrying with higher quality')
                  if (quality < 0.95) {
                    compressToTarget(Math.min(0.95, quality + 0.1))
                  } else {
                    reject(new Error('Failed to compress image: empty canvas'))
                  }
                  return
                }
              } catch (dataError) {
                console.warn('⚠️  Could not check canvas data, continuing anyway:', dataError)
              }
              
              const sizeKB = blob.size / 1024
              
              // Если размер больше целевого и качество позволяет уменьшить
              if (sizeKB > targetSizeKB && quality > 0.5) {
                // Уменьшаем качество на 0.05 и пробуем снова
                compressToTarget(Math.max(0.5, quality - 0.05))
              } else {
                // Достигли целевого размера или минимального качества
                const filename = file.name.replace(/\.[^/.]+$/, '.jpg') || 'avatar.jpg'
                const optimizedFile = new File([blob], filename, { type: 'image/jpeg' })
                
                // Финальная проверка: создаем Image объект для проверки валидности
                const testImg = new Image()
                testImg.onload = () => {
                  if (testImg.naturalWidth > 0 && testImg.naturalHeight > 0) {
                console.log(`✅ Avatar optimized: ${sizeKB.toFixed(2)}KB (${width}x${height}, quality: ${quality.toFixed(2)})`)
                resolve(optimizedFile)
                  } else {
                    console.error('❌ Optimized image is invalid (0x0), retrying')
                    if (quality < 0.95) {
                      compressToTarget(Math.min(0.95, quality + 0.1))
                    } else {
                      reject(new Error('Failed to compress image: invalid result'))
                    }
                  }
                }
                testImg.onerror = () => {
                  console.error('❌ Optimized image failed to load, retrying')
                  if (quality < 0.95) {
                    compressToTarget(Math.min(0.95, quality + 0.1))
                  } else {
                    reject(new Error('Failed to compress image: invalid format'))
                  }
                }
                testImg.src = URL.createObjectURL(blob)
              }
            },
            'image/jpeg',
            quality
          )
        }
        
        // Начинаем с качества 0.7 для баланса между качеством и размером
        compressToTarget(0.7)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

