/**
 * Скрипт для создания первого администратора
 * Запуск: npx ts-node scripts/create-first-admin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import logger from '../src/lib/logger';
import { hashEmail } from '../src/lib/email-hash';

const prisma = new PrismaClient();

async function createFirstAdmin() {
  try {
    // Проверяем, есть ли уже пользователи
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      logger.warn('Users already exist in database. Skipping first admin creation.');
      process.exit(0);
    }

    // Запрашиваем данные администратора
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const username = process.env.ADMIN_USERNAME || 'admin';
    const name = process.env.ADMIN_NAME || 'Admin';

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Хешируем email перед сохранением
    const hashedEmail = hashEmail(email);

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем первого администратора
    const admin = await prisma.user.create({
      data: {
        email: hashedEmail, // Сохраняем хеш email вместо оригинального
        password: hashedPassword,
        username,
        name,
        role: 'admin',
        provider: 'local',
        confirmed: true,
        blocked: false,
      },
    });

    logger.info(`✅ First admin created successfully!`);
    logger.info(`Username: ${username}`);
    logger.info(`⚠️  Please change the default password after first login!`);

    process.exit(0);
  } catch (error) {
    logger.error('Failed to create first admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createFirstAdmin();

