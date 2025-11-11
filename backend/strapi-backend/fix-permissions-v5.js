/**
 * Скрипт для настройки публичного доступа к статьям в Strapi v5
 * Работает напрямую с SQLite базой данных
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function fixPermissions() {
  console.log('🔧 Настройка публичного доступа к статьям (Strapi v5)...\n');

  const db = new sqlite3.Database(DB_PATH);

  try {
    // 1. Получаем Public роль
    console.log('1️⃣ Поиск Public роли...');
    const publicRole = await getAsync(db, `SELECT id, name FROM up_roles WHERE type = 'public'`);
    
    if (!publicRole) {
      console.error('❌ Public роль не найдена');
      db.close();
      return;
    }
    
    console.log(`✅ Public роль найдена (ID: ${publicRole.id}, Name: ${publicRole.name})\n`);

    // 2. Создаем permissions для Article
    console.log('2️⃣ Создание permissions...');
    
    const actions = [
      'api::article.article.find',
      'api::article.article.findOne',
      'api::article.article.count',
      'api::article.article.search',
      'api::profile.profile.findOne',
      'api::comment.comment.findForArticle'
    ];

    for (const action of actions) {
      // Проверяем, существует ли уже permission
      const existing = await getAsync(
        db,
        `SELECT p.id FROM up_permissions p 
         JOIN up_permissions_role_lnk l ON p.id = l.permission_id 
         WHERE p.action = ? AND l.role_id = ?`,
        [action, publicRole.id]
      );

      if (existing) {
        console.log(`⏭️  Permission уже существует: ${action}`);
        continue;
      }

      // Создаем новый permission
      const result = await runAsync(
        db,
        `INSERT INTO up_permissions (action, created_at, updated_at, published_at) 
         VALUES (?, datetime('now'), datetime('now'), datetime('now'))`,
        [action]
      );

      const permissionId = result.lastID;

      // Связываем permission с Public ролью
      await runAsync(
        db,
        `INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord) 
         VALUES (?, ?, ?)`,
        [permissionId, publicRole.id, permissionId]
      );

      console.log(`✅ Создан: ${action} (ID: ${permissionId})`);
    }

    console.log('\n🔐 Настройка прав для Authenticated роли (upload)...\n');

    const authenticatedRole = await getAsync(
      db,
      `SELECT id, name FROM up_roles WHERE type = 'authenticated'`
    );

    if (!authenticatedRole) {
      console.error('❌ Authenticated роль не найдена');
    } else {
      console.log(`✅ Authenticated роль найдена (ID: ${authenticatedRole.id}, Name: ${authenticatedRole.name})\n`);

      const uploadActions = [
        'plugin::upload.content-api.upload',
        'api::article.article.create',
        'api::article.article.update',
        'api::article.article.delete',
        'api::comment.comment.createForArticle'
      ];

      for (const action of uploadActions) {
        const existing = await getAsync(
          db,
          `SELECT p.id FROM up_permissions p 
           JOIN up_permissions_role_lnk l ON p.id = l.permission_id 
           WHERE p.action = ? AND l.role_id = ?`,
          [action, authenticatedRole.id]
        );

        if (existing) {
          console.log(`⏭️  Permission уже существует: ${action}`);
          continue;
        }

        const result = await runAsync(
          db,
          `INSERT INTO up_permissions (action, created_at, updated_at, published_at) 
           VALUES (?, datetime('now'), datetime('now'), datetime('now'))`,
          [action]
        );

        const permissionId = result.lastID;

        await runAsync(
          db,
          `INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord) 
           VALUES (?, ?, ?)`,
          [permissionId, authenticatedRole.id, permissionId]
        );

        console.log(`✅ Создан: ${action} (ID: ${permissionId})`);
      }
    }

    console.log('\n🎉 Готово! Permissions настроены.\n');
    console.log('📋 Включены permissions:');
    console.log('   ✅ Article → find (GET /api/articles)');
    console.log('   ✅ Article → findOne (GET /api/articles/:id)');
    console.log('   ✅ Article → count (GET /api/articles/count)\n');
    console.log('   ✅ Upload → content-api.upload (POST /api/upload)');
    console.log('   ✅ Article → create (POST /api/articles)');
    console.log('   ✅ Article → update (PUT /api/articles/:id)');
    console.log('   ✅ Article → delete (DELETE /api/articles/:id)');
    console.log('   ✅ Comment → findForArticle (GET /api/articles/:documentId/comments)');
    console.log('   ✅ Comment → createForArticle (POST /api/articles/:documentId/comments)\n');
    console.log('⚠️  Перезапустите Strapi для применения изменений!\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    db.close();
  }
}

fixPermissions();

