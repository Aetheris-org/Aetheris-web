#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'schema.prisma');

console.log('🔄 Running Prisma migrations...');

try {
  // Run migrations with a timeout of 5 minutes
  execSync('prisma migrate deploy', {
    stdio: 'inherit',
    timeout: 5 * 60 * 1000, // 5 minutes
    cwd: path.dirname(schemaPath),
  });
  console.log('✅ Migrations completed successfully');
  process.exit(0);
} catch (error) {
  // If migrations fail, log but don't exit - Keystone might still work
  if (error.code === 'ETIMEDOUT') {
    console.warn('⚠️  Migrations timed out after 5 minutes, continuing anyway...');
    process.exit(0);
  } else if (error.signal === 'SIGTERM') {
    console.warn('⚠️  Migrations were terminated, continuing anyway...');
    process.exit(0);
  } else {
    console.warn('⚠️  Migrations failed, but continuing anyway:', error.message);
    process.exit(0);
  }
}
