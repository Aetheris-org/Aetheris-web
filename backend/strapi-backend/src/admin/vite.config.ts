import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    server: {
      // Используем другой порт для админ-панели Strapi, чтобы не конфликтовать с фронтендом на 5173
      port: 5174,
      strictPort: false, // Если порт занят, попробует следующий
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};




