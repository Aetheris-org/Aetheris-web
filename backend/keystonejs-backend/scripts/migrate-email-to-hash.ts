/**
 * Миграция: Хеширование существующих email в базе данных
 * 
 * Этот скрипт хеширует все существующие email адреса в базе данных
 * Используйте этот скрипт один раз после обновления кода для хеширования email
 * 
 * Запуск: 
 *   npx tsx scripts/migrate-email-to-hash.ts          - хеширует нехешированные email
 *   npx tsx scripts/migrate-email-to-hash.ts --rehash - перехеширует нехешированные email (HMAC-SHA256)
 * 
 * ВАЖНО: Уже хешированные email (SHA-256) не могут быть перехешированы без оригинального email.
 * Перехеширование произойдет автоматически при следующем OAuth входе пользователя.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashEmail, isEmailHash } from '../src/lib/email-hash';
import logger from '../src/lib/logger';

async function migrateEmailsToHash() {
  const prisma = new PrismaClient();

  try {
    // Проверяем аргументы командной строки
    const shouldRehash = process.argv.includes('--rehash');
    
    if (shouldRehash) {
      logger.info('🚀 Starting email rehashing migration (HMAC-SHA256)...');
      logger.info('⚠️  Note: Already hashed emails (SHA-256) will be skipped.');
      logger.info('   They will be automatically rehashed on next OAuth login.');
    } else {
      logger.info('🚀 Starting email migration to hash (HMAC-SHA256)...');
    }

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    logger.info(`Found ${users.length} users to process`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    let alreadyHashed = 0;

    for (const user of users) {
      try {
        // Проверяем, является ли email уже хешем
        if (isEmailHash(user.email)) {
          if (shouldRehash) {
            logger.debug(`User ${user.id}: Email already hashed (SHA-256 or HMAC-SHA256), cannot rehash without original email`);
            logger.debug(`   Email will be automatically rehashed on next OAuth login`);
            alreadyHashed++;
          } else {
            logger.debug(`User ${user.id}: Email already hashed, skipping`);
          }
          skipped++;
          continue;
        }

        // Хешируем email с новым алгоритмом (HMAC-SHA256)
        const hashedEmail = hashEmail(user.email);

        // Обновляем пользователя
        await prisma.user.update({
          where: { id: user.id },
          data: { email: hashedEmail },
        });

        logger.info(`User ${user.id}: Email hashed successfully with HMAC-SHA256`);
        migrated++;
      } catch (error: any) {
        logger.error(`User ${user.id}: Failed to hash email:`, error);
        errors++;
      }
    }

    logger.info('✅ Email migration completed', {
      total: users.length,
      migrated,
      skipped,
      alreadyHashed: shouldRehash ? alreadyHashed : undefined,
      errors,
    });

    if (shouldRehash && alreadyHashed > 0) {
      logger.info(`ℹ️  ${alreadyHashed} users have already hashed emails (SHA-256)`);
      logger.info('   These will be automatically rehashed to HMAC-SHA256 on next OAuth login');
    }

    if (errors > 0) {
      logger.warn(`⚠️  ${errors} users failed to migrate`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
migrateEmailsToHash()
  .then(() => {
    logger.info('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Migration script failed:', error);
    process.exit(1);
  });

