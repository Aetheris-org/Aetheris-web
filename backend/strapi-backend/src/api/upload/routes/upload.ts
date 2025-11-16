/**
 * Upload routes для загрузки изображений через imgBB API
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/upload/image',
      handler: 'upload.uploadImage',
      config: {
        auth: false, // Отключаем стандартную проверку прав, используем наш jwt-auth middleware
        // parse не указываем - используем встроенный body middleware для парсинга файлов
      },
    },
  ],
};

