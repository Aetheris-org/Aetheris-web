/**
 * Скрипт для публикации всех неопубликованных статей
 * Запуск: node scripts/publish-all-articles.js
 */

const strapi = require('@strapi/strapi');

async function publishAllArticles() {
  const app = await strapi().load();
  
  try {
    // Получаем все неопубликованные статьи
    const articles = await app.entityService.findMany('api::article.article', {
      filters: {
        publishedAt: { $null: true },
      },
      limit: 1000,
    });
    
    console.log(`Найдено ${articles.length} неопубликованных статей`);
    
    let published = 0;
    let failed = 0;
    
    for (const article of articles) {
      try {
        const documentId = article.documentId || article.id;
        
        // Пробуем через entityService.update
        try {
          await app.entityService.update('api::article.article', article.id, {
            data: {
              publishedAt: new Date().toISOString(),
            },
          });
          published++;
          console.log(`✅ Опубликована статья ID: ${article.id}, Title: ${article.title}`);
        } catch (updateError) {
          // Пробуем через documentService
          if (app.documents && typeof app.documents === 'function') {
            const documentService = app.documents('api::article.article');
            if (documentService && typeof documentService.publish === 'function') {
              await documentService.publish({
                documentId: String(documentId),
              });
              published++;
              console.log(`✅ Опубликована статья ID: ${article.id} (через documentService)`);
            } else {
              throw updateError;
            }
          } else {
            throw updateError;
          }
        }
      } catch (error) {
        failed++;
        console.error(`❌ Ошибка при публикации статьи ID: ${article.id}:`, error.message);
      }
    }
    
    console.log(`\n✅ Опубликовано: ${published}`);
    console.log(`❌ Ошибок: ${failed}`);
    
    await app.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Критическая ошибка:', error);
    await app.destroy();
    process.exit(1);
  }
}

publishAllArticles();

