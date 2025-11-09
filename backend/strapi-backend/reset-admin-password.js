/**
 * Скрипт для сброса пароля админа в Strapi
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

async function resetAdminPassword() {
  console.log('🔐 Сброс пароля админа...\n');

  const db = new sqlite3.Database(DB_PATH);

  const newPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.run(
    `UPDATE admin_users SET password = ? WHERE id = 2`,
    [hashedPassword],
    function(err) {
      if (err) {
        console.error('❌ Ошибка при обновлении пароля:', err.message);
        db.close();
        return;
      }

      if (this.changes === 0) {
        console.error('❌ Админ с ID 2 не найден');
        db.close();
        return;
      }

      console.log('✅ Пароль админа успешно обновлен!\n');
      console.log('📋 Данные для входа:');
      console.log('   Email: fluy1337@gmail.com');
      console.log('   Password: Admin123!\n');
      console.log('🔗 Войдите в админку: http://localhost:1337/admin\n');

      db.close();
    }
  );
}

resetAdminPassword().catch(console.error);


