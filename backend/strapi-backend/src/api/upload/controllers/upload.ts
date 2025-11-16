/**
 * Upload controller для загрузки изображений через imgBB API
 * Использует внешний сервис imgBB для хостинга изображений
 * 
 * Безопасность:
 * - Валидация типа файла (только изображения)
 * - Валидация размера файла (максимум 10MB)
 * - Проверка MIME типа
 * - Rate limiting через middleware
 */
export default {
  /**
   * Загрузка изображения через imgBB API
   * Требует аутентификации
   */
  async uploadImage(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    try {
      const fs = await import('fs/promises');
      
      // Логирование для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('📤 Upload request received');
        strapi.log.info('📦 Content-Type:', ctx.request.headers['content-type']);
        strapi.log.info('📦 Request files:', ctx.request.files ? Object.keys(ctx.request.files) : 'none');
        strapi.log.info('📦 Request body:', ctx.request.body ? Object.keys(ctx.request.body) : 'none');
      }
      
      // Используем upload service Strapi для парсинга и обработки файлов
      // Он сам парсит multipart/form-data если файлы еще не распарсены
      const uploadService = strapi.plugin('upload').service('upload');
      
      let fileBuffer: Buffer;
      let fileInfo: { buffer: Buffer; type: string; size: number; name: string };
      let localFileInfo: {
        id: number | string;
        url: string;
        path: string;
        name: string;
        mime: string;
        size: number;
        file?: any;
      } | null = null;
      
      try {
        // Upload service ожидает файлы в ctx.request.files
        // Если файлы уже распарсены body middleware - используем их
        // Если нет - upload service попытается их распарсить сам
        const filesToUpload = ctx.request.files?.files || ctx.request.files;
        
        if (!filesToUpload) {
          strapi.log.warn('⚠️ No files in request');
          return ctx.badRequest('No file provided');
        }
        
        // Используем upload service для обработки файлов
        // Он вернет массив загруженных файлов
        const uploadedFiles = await uploadService.upload({
          data: {},
          files: filesToUpload,
        });
        
        if (!uploadedFiles || uploadedFiles.length === 0) {
          strapi.log.warn('⚠️ No files uploaded via upload service');
          return ctx.badRequest('No file provided');
        }
        
        const uploadedFile = uploadedFiles[0];
        
        // Логирование для отладки (только в development)
        if (process.env.NODE_ENV === 'development') {
          strapi.log.info('📄 File uploaded via service:', uploadedFile.name);
          strapi.log.info('📄 File size:', uploadedFile.size);
          strapi.log.info('📄 File mime:', uploadedFile.mime);
          strapi.log.info('📄 File url:', uploadedFile.url);
        }
        
        // Получаем путь к файлу в Strapi storage
        // Файл сохранен в public/uploads
        // uploadedFile.url обычно в формате "/uploads/..."
        const path = await import('path');
        let filePath: string | null = null;
        
        if (uploadedFile.url) {
          // Убираем ведущий слэш и добавляем путь к public директории
          const urlPath = uploadedFile.url.startsWith('/') ? uploadedFile.url.slice(1) : uploadedFile.url;
          filePath = path.join(strapi.dirs.static.public, urlPath);
        } else if (uploadedFile.path) {
          // Если есть прямой путь
          filePath = uploadedFile.path;
        }
        
        if (!filePath) {
          strapi.log.error('Failed to get file path from uploaded file');
          // Пытаемся удалить файл из Strapi storage
          await uploadService.remove(uploadedFile).catch(() => {});
          return ctx.badRequest('Failed to process uploaded file');
        }
        
        // Читаем файл
        fileBuffer = await fs.readFile(filePath);
        
        fileInfo = {
          buffer: fileBuffer,
          type: uploadedFile.mime || 'image/jpeg',
          size: uploadedFile.size || fileBuffer.length,
          name: uploadedFile.name || 'image.jpg',
        };
        
        // Сохраняем информацию о загруженном файле для fallback
        // НЕ удаляем файл из Strapi storage до тех пор, пока не убедимся, что imgBB работает
        localFileInfo = {
          id: uploadedFile.id,
          url: uploadedFile.url,
          path: filePath,
          name: uploadedFile.name,
          mime: uploadedFile.mime,
          size: uploadedFile.size,
          file: uploadedFile, // Сохраняем объект файла для возможного удаления позже
        };
      } catch (uploadError: any) {
        strapi.log.error('Upload service error:', uploadError);
        
        // Если upload service не работает, возвращаем понятную ошибку
        if (process.env.NODE_ENV === 'development') {
          return ctx.badRequest(`Failed to process file upload: ${uploadError.message || uploadError}`);
        }
        return ctx.badRequest('Failed to process file upload');
      }

      // ВАЛИДАЦИЯ ТИПА ФАЙЛА
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!fileInfo.type || !allowedMimeTypes.includes(fileInfo.type)) {
        strapi.log.warn(`⚠️ Invalid file type: ${fileInfo.type || 'unknown'}`);
        return ctx.badRequest(
          `Invalid file type: ${fileInfo.type || 'unknown'}. Allowed types: ${allowedMimeTypes.join(', ')}`
        );
      }

      // ВАЛИДАЦИЯ РАЗМЕРА ФАЙЛА (максимум 8MB для base64, так как base64 увеличивает размер на ~33%)
      // imgBB рекомендует максимум 32MB, но для base64 лучше ограничиться 8MB исходного файла
      const maxFileSize = 8 * 1024 * 1024; // 8MB
      if (fileInfo.size > maxFileSize) {
        return ctx.badRequest(`File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB. Please use a smaller image.`);
      }
      
      // Предупреждение для больших файлов
      if (fileInfo.size > 5 * 1024 * 1024) { // > 5MB
        strapi.log.warn(`⚠️ Large file detected: ${(fileInfo.size / 1024 / 1024).toFixed(2)}MB. Upload may take longer.`);
      }

      /**
       * ВАЖНО:
       * На данный момент imgBB с вашей машины фактически недоступен (таймауты/SSL ошибки),
       * что приводит к минутным ожиданиям и 408/500 на фронтенде.
       *
       * Чтобы вернуть нормальную работу создания статей,
       * мы ДЕЛАЕМ ЗАГРУЗКУ ЧИСТО ЛОКАЛЬНО В STRAPI и сразу возвращаем URL,
       * не дожидаясь внешнего сервиса.
       *
       * Когда imgBB / внешний CDN понадобятся и будут стабильно доступны,
       * этот блок можно будет переключить обратно на внешний upload.
       */
      if (!localFileInfo || !localFileInfo.url) {
        strapi.log.error('❌ localFileInfo is not available after upload, cannot build image URL');
        return ctx.internalServerError('Failed to process uploaded image');
      }

      const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
      const fileUrl = localFileInfo.url.startsWith('http')
        ? localFileInfo.url
        : `${publicUrl}${localFileInfo.url.startsWith('/') ? '' : '/'}${localFileInfo.url}`;

      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('✅ Image stored locally in Strapi (no external imgBB):', {
          id: localFileInfo.id,
          url: fileUrl,
          sizeMB: (localFileInfo.size / 1024 / 1024).toFixed(2),
        });
      }

      // Возвращаем данные в формате, совместимом с фронтендом
      ctx.body = [
        {
          id: localFileInfo.id || Date.now().toString(),
          url: fileUrl,
          display_url: fileUrl,
          delete_url: null,
          size: localFileInfo.size || fileInfo.size,
          width: null,
          height: null,
          mime: fileInfo.type,
          name: fileInfo.name,
          formats: undefined,
        },
      ];

      // На этом всё, внешний imgBB не трогаем, чтобы не было минутных таймаутов
      return;

      // ===== Ниже остался код интеграции с imgBB (сейчас не используется) =====
      // Получаем API ключ imgBB из переменных окружения
      // КРИТИЧЕСКИ ВАЖНО: Никогда не хардкодить API ключи в коде!
      const imgbbApiKey = process.env.IMGBB_API_KEY;
      
      if (!imgbbApiKey) {
        strapi.log.error('IMGBB_API_KEY not configured in environment variables');
        return ctx.internalServerError('Image upload service not configured');
      }

      // Конвертируем файл в base64 для imgBB API
      const base64Image = fileInfo.buffer.toString('base64');

      // Загружаем изображение через imgBB API
      const formData = new URLSearchParams();
      formData.append('key', imgbbApiKey);
      formData.append('image', base64Image);
      
      // Опционально: можно добавить имя файла
      if (fileInfo.name) {
        formData.append('name', fileInfo.name);
      }

      // Отправляем запрос к imgBB API с retry логикой
      // Используем встроенный https модуль Node.js для более надежной работы
      // Если imgBB недоступен - используем локальное хранилище Strapi (fallback)
      const https = await import('https');
      const maxRetries = 2; // Уменьшаем до 2 попыток для быстрого fallback
      const timeoutMs = 30000; // 30 секунд таймаут (уменьшено для быстрого fallback)
      let lastError: any = null;
      let imgbbAvailable = false;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Логирование для отладки (только в development)
          if (process.env.NODE_ENV === 'development') {
            strapi.log.info(`📤 Sending request to imgBB (attempt ${attempt + 1}/${maxRetries}):`, {
              url: 'https://api.imgbb.com/1/upload',
              bodyLength: formData.toString().length,
              hasApiKey: !!imgbbApiKey,
              fileSize: fileInfo.size,
              fileSizeMB: (fileInfo.size / 1024 / 1024).toFixed(2) + ' MB',
              timeout: timeoutMs,
            });
          }
          
          // Используем встроенный https модуль для более надежной работы
          const requestBody = formData.toString();
          const startTime = Date.now();
          
          const imgbbResponse = await new Promise<{ statusCode: number; statusMessage: string; data: any }>((resolve, reject) => {
            let timeout: NodeJS.Timeout;
            let req: any;
            let responseStarted = false;
            
            timeout = setTimeout(() => {
              if (req) {
                req.destroy();
              }
              const elapsed = Date.now() - startTime;
              strapi.log.error(`⏱️ Request timeout after ${elapsed}ms (attempt ${attempt + 1})`);
              reject(new Error(`Request timeout after ${elapsed}ms`));
            }, timeoutMs);
            
            req = https.request(
              {
                hostname: 'api.imgbb.com',
                path: '/1/upload',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(requestBody),
                  'User-Agent': 'Strapi/5.0',
                },
                timeout: timeoutMs,
              },
              (res) => {
                responseStarted = true;
                const elapsed = Date.now() - startTime;
                strapi.log.info(`📥 Response received after ${elapsed}ms, status: ${res.statusCode}`);
                
                let data = '';
                
                res.on('data', (chunk) => {
                  data += chunk;
                });
                
                res.on('end', () => {
                  clearTimeout(timeout);
                  const totalElapsed = Date.now() - startTime;
                  strapi.log.info(`✅ Response complete after ${totalElapsed}ms, data length: ${data.length}`);
                  try {
                    const jsonData = JSON.parse(data);
                    resolve({
                      statusCode: res.statusCode || 500,
                      statusMessage: res.statusMessage || 'Unknown',
                      data: jsonData,
                    });
                  } catch (parseError: any) {
                    strapi.log.error(`❌ Failed to parse response: ${parseError.message}, data: ${data.substring(0, 200)}`);
                    reject(new Error(`Failed to parse response: ${parseError.message}`));
                  }
                });
              }
            );
            
            req.on('error', (error: any) => {
              clearTimeout(timeout);
              const elapsed = Date.now() - startTime;
              strapi.log.error(`❌ Request error after ${elapsed}ms:`, {
                code: error.code,
                message: error.message,
                syscall: error.syscall,
                address: error.address,
                port: error.port,
              });
              reject(error);
            });
            
            req.on('timeout', () => {
              req.destroy();
              clearTimeout(timeout);
              const elapsed = Date.now() - startTime;
              strapi.log.error(`⏱️ Request timeout event after ${elapsed}ms`);
              reject(new Error(`Request timeout after ${elapsed}ms`));
            });
            
            req.on('connect', () => {
              const elapsed = Date.now() - startTime;
              strapi.log.info(`🔌 Connected to imgBB after ${elapsed}ms`);
            });
            
            // Логируем начало отправки
            strapi.log.info(`📤 Starting request to imgBB, body size: ${Buffer.byteLength(requestBody)} bytes`);
            const writeStart = Date.now();
            req.write(requestBody, (writeError?: Error) => {
              if (writeError) {
                clearTimeout(timeout);
                strapi.log.error(`❌ Write error:`, writeError);
                reject(writeError);
              } else {
                const writeElapsed = Date.now() - writeStart;
                strapi.log.info(`✅ Request body written in ${writeElapsed}ms`);
              }
            });
            req.end(() => {
              const endElapsed = Date.now() - startTime;
              strapi.log.info(`📤 Request sent, waiting for response (elapsed: ${endElapsed}ms)`);
            });
          });

          if (imgbbResponse.statusCode < 200 || imgbbResponse.statusCode >= 300) {
            const errorText = typeof imgbbResponse.data === 'string' ? imgbbResponse.data : JSON.stringify(imgbbResponse.data);
            strapi.log.error('imgBB API error:', {
              status: imgbbResponse.statusCode,
              statusText: imgbbResponse.statusMessage,
              error: errorText,
              attempt: attempt + 1,
            });
            
            // Если это 4xx ошибка (кроме 429), не повторяем
            if (imgbbResponse.statusCode >= 400 && imgbbResponse.statusCode < 500 && imgbbResponse.statusCode !== 429) {
              if (process.env.NODE_ENV === 'development') {
                return ctx.badRequest(`Image upload failed: ${errorText}`);
              } else {
                return ctx.badRequest('Image upload failed. Please check your image file.');
              }
            }
            
            // Для 429 (rate limit) и 5xx ошибок - повторяем
            if (attempt < maxRetries - 1) {
              const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
              strapi.log.warn(`⚠️ Retrying imgBB upload after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // Не раскрываем детали ошибки в production
            if (process.env.NODE_ENV === 'development') {
              return ctx.internalServerError(`Image upload failed: ${errorText}`);
            } else {
              return ctx.internalServerError('Image upload failed. Please try again.');
            }
          }

          const imgbbData = imgbbResponse.data as {
            success?: boolean;
            data?: {
              id?: string;
              url?: string;
              display_url?: string;
              delete_url?: string;
              size?: number;
              width?: number;
              height?: number;
            };
            error?: {
              message?: string;
              code?: number;
            };
          };

          if (!imgbbData.success || !imgbbData.data) {
            const errorMessage = imgbbData.error?.message || 'Unknown error';
            const errorCode = imgbbData.error?.code;
            strapi.log.error('imgBB upload failed:', {
              message: errorMessage,
              code: errorCode,
              response: imgbbData,
              attempt: attempt + 1,
            });
            
            // Если это 4xx ошибка (кроме 429), не повторяем
            if (errorCode && errorCode >= 400 && errorCode < 500 && errorCode !== 429) {
              if (errorCode === 400) {
                return ctx.badRequest(`Invalid image: ${errorMessage}`);
              }
              if (errorCode === 403) {
                return ctx.forbidden('Image upload service access denied. Please check API key.');
              }
              return ctx.badRequest(`Image upload failed: ${errorMessage}`);
            }
            
            // Для других ошибок - повторяем
            if (attempt < maxRetries - 1) {
              const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
              strapi.log.warn(`⚠️ Retrying imgBB upload after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            return ctx.internalServerError(`Image upload failed: ${errorMessage}`);
          }

          // Успешная загрузка на imgBB!
          imgbbAvailable = true;
          
          // Теперь можно удалить файл из локального хранилища Strapi
          // (он уже загружен на imgBB)
          if (localFileInfo.file) {
            await uploadService.remove(localFileInfo.file).catch((removeError) => {
              strapi.log.warn('⚠️ Failed to remove local file after imgBB upload:', removeError);
            });
          }
          
          if (process.env.NODE_ENV === 'development') {
            strapi.log.info('✅ Image uploaded successfully to imgBB:', {
              url: imgbbData.data.url,
              size: imgbbData.data.size,
              attempt: attempt + 1,
            });
          }

          // Возвращаем данные в формате, совместимом с фронтендом
          // Фронтенд ожидает формат Strapi media: { id, url }
          ctx.body = [
            {
              id: imgbbData.data.id || Date.now().toString(),
              url: imgbbData.data.url || imgbbData.data.display_url,
              display_url: imgbbData.data.display_url,
              delete_url: imgbbData.data.delete_url,
              size: imgbbData.data.size || fileInfo.size,
              width: imgbbData.data.width,
              height: imgbbData.data.height,
              mime: fileInfo.type,
              name: fileInfo.name,
              // Дополнительные поля для совместимости со Strapi media
              formats: imgbbData.data.width && imgbbData.data.height ? {
                thumbnail: {
                  url: imgbbData.data.url,
                  width: imgbbData.data.width,
                  height: imgbbData.data.height,
                },
              } : undefined,
            },
          ];
          
          // Успешно загружено на imgBB, выходим из цикла
          return;
        } catch (httpsError: any) {
          lastError = httpsError;
          
          // Детальное логирование ошибки
          strapi.log.error(`Failed to upload image to imgBB (attempt ${attempt + 1}/${maxRetries}):`, {
            name: httpsError?.name,
            message: httpsError?.message,
            code: httpsError?.code,
            cause: httpsError?.cause,
            stack: process.env.NODE_ENV === 'development' ? httpsError?.stack : undefined,
          });
          
          // Если это таймаут или сетевая ошибка - повторяем
          const isRetryableError = 
            httpsError?.message?.includes('timeout') ||
            httpsError?.message?.includes('Request timeout') ||
            httpsError?.code === 'ENOTFOUND' || 
            httpsError?.code === 'ECONNREFUSED' || 
            httpsError?.code === 'ETIMEDOUT' ||
            httpsError?.code === 'ECONNRESET' ||
            httpsError?.code === 'EAI_AGAIN' ||
            httpsError?.code === 'EHOSTUNREACH';
          
          if (isRetryableError && attempt < maxRetries - 1) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
            strapi.log.warn(`⚠️ Retrying imgBB upload after ${delay}ms due to ${httpsError?.code || httpsError?.message || 'network error'} (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Если это последняя попытка или не retryable ошибка - возвращаем ошибку
          if (attempt === maxRetries - 1 || !isRetryableError) {
            // Специальная обработка для разных типов ошибок
            if (httpsError?.message?.includes('timeout') || httpsError?.message?.includes('Request timeout')) {
              return ctx.requestTimeout('Image upload timeout. Please try again with a smaller file or check your internet connection.');
            }
            
            if (httpsError?.code === 'ENOTFOUND' || httpsError?.code === 'ECONNREFUSED' || httpsError?.code === 'ETIMEDOUT' || httpsError?.code === 'EAI_AGAIN') {
              return ctx.serviceUnavailable('Image upload service unavailable. Please check your internet connection and try again later.');
            }
            
            // Общая ошибка
            if (process.env.NODE_ENV === 'development') {
              return ctx.internalServerError(`Image upload failed: ${httpsError?.message || httpsError?.code || 'Unknown error'}`);
            } else {
              return ctx.internalServerError('Image upload failed. Please try again.');
            }
          }
        }
      }
      
      // Если дошли сюда - все попытки исчерпаны, imgBB недоступен
      // Используем fallback на локальное хранилище Strapi
      // Файл уже загружен в Strapi, просто возвращаем его URL
      strapi.log.warn('⚠️ imgBB unavailable after all attempts, using local storage fallback');
      strapi.log.warn('⚠️ Last error:', lastError?.message || lastError?.code || 'Unknown error');
      
      // Файл уже загружен в Strapi через upload service (мы его не удаляли)
      // Просто возвращаем его URL
      if (localFileInfo && localFileInfo.url) {
        // Формируем полный URL для локального файла
        const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
        const fileUrl = localFileInfo.url.startsWith('http') 
          ? localFileInfo.url 
          : `${publicUrl}${localFileInfo.url.startsWith('/') ? '' : '/'}${localFileInfo.url}`;
        
        strapi.log.info('✅ Image saved to local storage (fallback):', {
          url: fileUrl,
          id: localFileInfo.id,
        });
        
        // Возвращаем данные в формате, совместимом с фронтендом
        ctx.body = [
          {
            id: localFileInfo.id || Date.now().toString(),
            url: fileUrl,
            display_url: fileUrl,
            delete_url: null,
            size: localFileInfo.size || fileInfo.size,
            width: null,
            height: null,
            mime: fileInfo.type,
            name: fileInfo.name,
            formats: undefined,
          },
        ];
        
        return;
      } else {
        // Если по какой-то причине файл не сохранился, пытаемся загрузить заново
        try {
          const filesToUpload = ctx.request.files?.files || ctx.request.files;
          if (!filesToUpload) {
            throw new Error('No files available for fallback');
          }
          
          const uploadedFiles = await uploadService.upload({
            data: {},
            files: filesToUpload,
          });
          
          if (!uploadedFiles || uploadedFiles.length === 0) {
            throw new Error('Failed to upload file to local storage');
          }
          
          const localFile = uploadedFiles[0];
          
          // Формируем полный URL для локального файла
          const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
          const fileUrl = localFile.url?.startsWith('http') 
            ? localFile.url 
            : `${publicUrl}${localFile.url?.startsWith('/') ? '' : '/'}${localFile.url || ''}`;
          
          strapi.log.info('✅ Image saved to local storage (fallback, re-uploaded):', {
            url: fileUrl,
            id: localFile.id,
          });
          
          // Возвращаем данные в формате, совместимом с фронтендом
          ctx.body = [
            {
              id: localFile.id || Date.now().toString(),
              url: fileUrl,
              display_url: fileUrl,
              delete_url: null,
              size: localFile.size || fileInfo.size,
              width: null,
              height: null,
              mime: fileInfo.type,
              name: fileInfo.name,
              formats: undefined,
            },
          ];
          
          return;
        } catch (fallbackError: any) {
          strapi.log.error('❌ Fallback to local storage also failed:', fallbackError);
          if (process.env.NODE_ENV === 'development') {
            return ctx.internalServerError(`Image upload failed: imgBB unavailable and local storage failed: ${fallbackError.message || 'Unknown error'}`);
          } else {
            return ctx.internalServerError('Image upload failed. Please try again later.');
          }
        }
      }
    } catch (error: any) {
      strapi.log.error('Image upload failed:', error);
      
      if (error.message?.includes('timeout') || error.message?.includes('Parse timeout')) {
        return ctx.requestTimeout('Upload request timeout. Please try again with a smaller file.');
      }
      
      if (error.status) {
        return ctx.status(error.status, error.message);
      }
      
      // В development показываем детали ошибки
      if (process.env.NODE_ENV === 'development') {
        return ctx.internalServerError(`Failed to upload image: ${error.message || error}`);
      }
      
      return ctx.internalServerError('Failed to upload image. Please try again.');
    }
  },
};
