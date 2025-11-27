#!/usr/bin/env node

/**
 * Скрипт для генерации Prisma клиента для Keystone
 * Генерирует клиент в правильном месте через symlink
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Generating Prisma Client for Keystone...');

const schemaPath = path.join(__dirname, '../schema.prisma');
const generatedPrismaDir = path.join(__dirname, '../node_modules/@prisma/client');
const keystonePrismaDir = path.join(
  __dirname,
  '../node_modules/@keystone-6/core/node_modules/.prisma/client'
);
const keystonePrismaParent = path.dirname(keystonePrismaDir);

// Проверяем наличие schema.prisma
if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma not found at', schemaPath);
  process.exit(1);
}

try {
  // Создаем директорию для Keystone Prisma если её нет
  if (!fs.existsSync(keystonePrismaParent)) {
    fs.mkdirSync(keystonePrismaParent, { recursive: true });
  }

  // Удаляем существующий клиент или symlink если они есть
  if (fs.existsSync(keystonePrismaDir)) {
    try {
      // Проверяем, это директория или symlink
      const stats = fs.lstatSync(keystonePrismaDir);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(keystonePrismaDir);
      } else if (stats.isDirectory()) {
        // Рекурсивно удаляем директорию
        const rmCmd = `rm -rf ${keystonePrismaDir}`;
        execSync(rmCmd, { stdio: 'inherit' });
      }
    } catch (e) {
      console.warn('⚠️  Warning: Could not remove existing Prisma client:', e.message);
    }
  }

  // Генерируем Prisma клиент в стандартное место
  const cmd = `npx prisma generate --schema=${schemaPath}`;
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  
  // Создаем symlink вместо копирования
  if (fs.existsSync(generatedPrismaDir)) {
    console.log(`� Creating symlink from ${keystonePrismaDir} to ${generatedPrismaDir}`);
    try {
      fs.symlinkSync(generatedPrismaDir, keystonePrismaDir, 'dir');
      console.log('✅ Prisma Client symlink created successfully');
      process.exit(0);
    } catch (symlinkError) {
      console.warn('⚠️  Failed to create symlink, trying copy instead:', symlinkError.message);
      // Fallback: копируем если symlink не сработал
      try {
        const cpCmd = `cp -r ${generatedPrismaDir}/* ${keystonePrismaDir}/`;
        execSync(cpCmd, { stdio: 'inherit' });
        console.log('✅ Prisma Client copied successfully');
        process.exit(0);
      } catch (copyError) {
        console.error('❌ Failed to copy Prisma Client:', copyError.message);
        process.exit(1);
      }
    }
  } else {
    console.error('❌ Generated Prisma Client not found at', generatedPrismaDir);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
