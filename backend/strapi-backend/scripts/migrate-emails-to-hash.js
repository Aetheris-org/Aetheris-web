/**
 * Скрипт миграции существующих пользователей: замена реального email на псевдо-email (HMAC-хеш)
 * 
 * Использование:
 * 1. Убедитесь что EMAIL_HASH_SECRET задан в .env
 * 2. Остановите Strapi сервер
 * 3. Запустите: node scripts/migrate-emails-to-hash.js
 * 
 * ВАЖНО: Сделайте бэкап БД перед запуском!
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Загружаем .env файл
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Генерирует псевдо-email из реального email
 * Использует HMAC-SHA256 для безопасного хеширования
 */
function generatePseudoEmail(realEmail) {
  const secret = process.env.EMAIL_HASH_SECRET || process.env.APP_KEYS?.split(',')[0];
  
  if (!secret || secret.length < 32) {
    throw new Error('EMAIL_HASH_SECRET is not set or too short. Set it in .env file.');
  }
  
  // Нормализуем email: lowercase и trim
  const normalizedEmail = String(realEmail || '').toLowerCase().trim();
  
  // Генерируем HMAC-SHA256 хеш
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(normalizedEmail)
    .digest('hex');
  
  // Берём первые 16 символов хеша для псевдо-email
  const pseudoEmail = `hash-${hmac.substring(0, 16)}@internal.local`;
  
  return pseudoEmail;
}

/**
 * Проверяет, является ли email уже псевдо-email
 */
function isPseudoEmail(email) {
  return email && email.startsWith('hash-') && email.endsWith('@internal.local');
}

async function migrateUsers() {
  console.log('🔵 Starting email migration to pseudo-emails...\n');
  
  // Проверяем наличие EMAIL_HASH_SECRET
  if (!process.env.EMAIL_HASH_SECRET) {
    console.error('❌ ERROR: EMAIL_HASH_SECRET not found in .env file!');
    console.error('Please add EMAIL_HASH_SECRET to your .env file before running migration.');
    process.exit(1);
  }
  
  console.log(`✅ EMAIL_HASH_SECRET found (length: ${process.env.EMAIL_HASH_SECRET.length} chars)\n`);
  
  // Путь к БД SQLite
  const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database not found at ${dbPath}`);
    console.error('Make sure Strapi has been initialized at least once.');
    process.exit(1);
  }
  
  console.log(`🔵 Opening database: ${dbPath}`);
  const db = new Database(dbPath);
  
  try {
    // Находим всех пользователей с провайдером Google
    const users = db.prepare(`
      SELECT id, email, username, provider
      FROM up_users
      WHERE provider = 'google'
    `).all();
    
    console.log(`📊 Found ${users.length} Google users\n`);
    
    if (users.length === 0) {
      console.log('ℹ️  No users to migrate.');
      db.close();
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    const migrationLog = [];
    
    const updateStmt = db.prepare(`
      UPDATE up_users
      SET email = ?, username = ?
      WHERE id = ?
    `);
    
    for (const user of users) {
      const realEmail = user.email;
      
      // Пропускаем если уже хеширован
      if (isPseudoEmail(realEmail)) {
        console.log(`⏭️  User ID ${user.id}: Already hashed, skipping`);
        skippedCount++;
        continue;
      }
      
      try {
        // Генерируем псевдо-email
        const pseudoEmail = generatePseudoEmail(realEmail);
        
        // Определяем новый username
        let newUsername = user.username;
        if (user.username === realEmail) {
          newUsername = pseudoEmail;
        }
        
        // Обновляем пользователя
        updateStmt.run(pseudoEmail, newUsername, user.id);
        
        console.log(`✅ User ID ${user.id}: Migrated`);
        console.log(`   Old email: ${realEmail}`);
        console.log(`   New email: ${pseudoEmail}`);
        if (newUsername !== user.username) {
          console.log(`   Username also updated: ${user.username} → ${newUsername}`);
        }
        console.log('');
        
        migrationLog.push({
          userId: user.id,
          oldEmail: realEmail,
          newEmail: pseudoEmail,
          oldUsername: user.username,
          newUsername: newUsername,
          usernameUpdated: newUsername !== user.username,
        });
        
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating user ID ${user.id}:`, error.message);
      }
    }
    
    // Сохраняем лог миграции
    const logPath = path.join(__dirname, `migration-log-${Date.now()}.json`);
    fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 Migration Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Total users found: ${users.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already hashed): ${skippedCount}`);
    console.log(`\nMigration log saved to: ${logPath}`);
    console.log('═══════════════════════════════════════\n');
    
    if (migratedCount > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('\nIMPORTANT: Real emails are now replaced with pseudo-emails.');
      console.log('Users can still login via Google OAuth2 - the same pseudo-email will be generated.');
      console.log('\n⚠️  You can now restart Strapi server.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
    console.log('\n🔵 Database connection closed');
  }
}

// Запускаем миграцию
migrateUsers()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
