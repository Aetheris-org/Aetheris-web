/**
 * Скрипт для создания первого администратора
 * Запуск: npx ts-node scripts/create-first-admin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import logger from '../src/lib/logger';

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

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем первого администратора
    const admin = await prisma.user.create({
      data: {
        email,
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
    logger.info(`Email: ${email}`);
    logger.info(`Username: ${username}`);
    logger.info(`Password: ${password}`);
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

