#!/usr/bin/env node

/**
 * Скрипт для проверки и генерации Prisma клиента для KeystoneJS
 * 
 * ПРОБЛЕМА: KeystoneJS использует вложенный Prisma клиент в 
 * @keystone-6/core/node_modules/.prisma/client/, а обычный 
 * prisma generate генерирует клиент в ./node_modules/@prisma/client
 * 
 * РЕШЕНИЕ: KeystoneJS должен сам генерировать Prisma клиент через 
 * keystone build или keystone start. Этот скрипт только проверяет 
 * наличие клиента и выводит предупреждения.
 */

const path = require('path');
const fs = require('fs');

console.log('🔄 Checking Prisma Client for KeystoneJS...');

const schemaPath = path.join(__dirname, '../schema.prisma');
const keystonePrismaPath = path.join(
  __dirname,
  '../node_modules/@keystone-6/core/node_modules/.prisma/client'
);

// Проверяем наличие schema.prisma
if (!fs.existsSync(schemaPath)) {
  console.log('⚠️  schema.prisma not found.');
  console.log('   KeystoneJS will generate it during keystone build.');
  console.log('   This is normal if you haven\'t run "keystone build" yet.');
  process.exit(0);
}

// Проверяем, существует ли клиент в правильном месте
if (fs.existsSync(keystonePrismaPath)) {
  console.log('✅ Prisma Client found in @keystone-6/core/node_modules/.prisma/client/');
  process.exit(0);
}

console.log('⚠️  Prisma Client not found in @keystone-6/core/node_modules/.prisma/client/');
console.log('   This is expected if keystone build hasn\'t run yet.');
console.log('   KeystoneJS will generate it automatically during:');
console.log('   - keystone build (recommended for production)');
console.log('   - keystone start (will generate if missing)');
console.log('   - keystone dev (development mode)');

// Не падаем с ошибкой - keystone start/build может сам сгенерировать клиент
process.exit(0);

