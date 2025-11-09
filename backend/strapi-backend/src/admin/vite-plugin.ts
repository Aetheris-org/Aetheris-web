/**
 * Workaround для Strapi v5 админки - отключаем проблемный CSS плагин
 */
import type { Plugin } from 'vite';

export const adminFixPlugin = (): Plugin => {
  return {
    name: 'admin-fix-plugin',
    apply: 'serve',
    
    configResolved(config) {
      // Отключаем problematic CSS post-processing плагин
      if (config.plugins) {
        const index = config.plugins.findIndex(
          p => p.name === 'vite:css-post'
        );
        if (index !== -1) {
          // Оставляем плагин но деактивируем его трансформацию
          const plugin = config.plugins[index] as any;
          if (plugin.transform) {
            const originalTransform = plugin.transform;
            plugin.transform = function(code: string, id: string) {
              // Пропускаем трансформацию для HTML proxy CSS
              if (id.includes('html-proxy') && id.includes('.css')) {
                return code;
              }
              return originalTransform?.call(this, code, id);
            };
          }
        }
      }
    },
  };
};


