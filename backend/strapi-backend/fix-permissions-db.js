/**
 * Скрипт для прямого изменения permissions в SQLite базе Strapi
 * Включает публичный доступ к статьям (find, findOne)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

async function fixPermissions() {
  console.log('🔧 Исправление permissions через прямой доступ к БД...\n');

  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Не удалось подключиться к БД:', err.message);
      process.exit(1);
    }
    console.log('✅ Подключено к БД\n');
  });

  // Получаем Public роль
  db.get(
    `SELECT id, name FROM up_roles WHERE type = 'public'`,
    [],
    (err, role) => {
      if (err) {
        console.error('❌ Ошибка при получении Public роли:', err.message);
        db.close();
        return;
      }

      if (!role) {
        console.error('❌ Public роль не найдена');
        db.close();
        return;
      }

      console.log(`✅ Public роль найдена (ID: ${role.id}, Name: ${role.name})\n`);

      // Проверяем существующие permissions для Article
      db.all(
        `SELECT * FROM up_permissions WHERE role = ? AND action LIKE 'api::article.article.%'`,
        [role.id],
        (err, existingPerms) => {
          if (err) {
            console.error('❌ Ошибка при проверке permissions:', err.message);
            db.close();
            return;
          }

          console.log(`📋 Найдено существующих permissions: ${existingPerms.length}\n`);

          // Включаем find и findOne
          const actions = ['api::article.article.find', 'api::article.article.findOne'];
          let completed = 0;

          actions.forEach((action) => {
            const existing = existingPerms.find((p) => p.action === action);

            if (existing) {
              // Обновляем существующий permission
              db.run(
                `UPDATE up_permissions SET enabled = 1 WHERE id = ?`,
                [existing.id],
                (err) => {
                  if (err) {
                    console.error(`❌ Ошибка при обновлении ${action}:`, err.message);
                  } else {
                    console.log(`✅ Обновлен: ${action}`);
                  }

                  completed++;
                  if (completed === actions.length) {
                    console.log('\n🎉 Готово! Перезагрузите Strapi и React приложение.\n');
                    db.close();
                  }
                }
              );
            } else {
              // Создаем новый permission
              db.run(
                `INSERT INTO up_permissions (action, role, enabled, created_at, updated_at) VALUES (?, ?, 1, datetime('now'), datetime('now'))`,
                [action, role.id],
                (err) => {
                  if (err) {
                    console.error(`❌ Ошибка при создании ${action}:`, err.message);
                  } else {
                    console.log(`✅ Создан: ${action}`);
                  }

                  completed++;
                  if (completed === actions.length) {
                    console.log('\n🎉 Готово! Перезагрузите Strapi и React приложение.\n');
                    db.close();
                  }
                }
              );
            }
          });
        }
      );
    }
  );
}

fixPermissions();

