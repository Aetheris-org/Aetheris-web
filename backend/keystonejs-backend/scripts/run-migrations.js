#!/usr/bin/env node

require('dotenv/config');

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.join(__dirname, '..');
const schemaPath = path.join(backendDir, 'schema.prisma');
const migrationsDir = path.join(backendDir, 'prisma', 'migrations');

function getDirectConnectionUrl() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (process.env.MIGRATION_DATABASE_URL) {
    console.log('ℹ️  Using MIGRATION_DATABASE_URL for migrations');
    return process.env.MIGRATION_DATABASE_URL;
  }
  

  if (dbUrl.includes('pooler.supabase.com') || dbUrl.includes(':6543')) {
    console.log('ℹ️  Detected Supabase pooler connection');
    console.log('ℹ️  Using pooler (tables should already exist, created via Supabase MCP)');
    return dbUrl; 
  }
  
  return dbUrl;
}

console.log('🔄 Running Prisma database setup...');

try {
  const hasMigrations = fs.existsSync(migrationsDir) && 
    fs.readdirSync(migrationsDir).length > 0;

  // Используем прямое подключение для миграций (pooler не поддерживает создание схемы)
  const directDbUrl = getDirectConnectionUrl();
  const migrationEnv = { 
    ...process.env, 
    DATABASE_URL: directDbUrl,
    PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary' 
  };

  if (hasMigrations) {
    console.log('📦 Migrations found, deploying...');
    execSync('npx prisma migrate deploy --schema=' + schemaPath, {
      stdio: 'inherit',
      timeout: 10 * 60 * 1000, // Увеличиваем до 10 минут
      cwd: backendDir,
      env: migrationEnv,
    });
    console.log('✅ Migrations deployed successfully');
  } else {
    console.log('🆕 No migrations found...');
    

    const isPooler = directDbUrl.includes('pooler.supabase.com:6543');
    
    if (isPooler) {
      console.log('ℹ️  Using Supabase pooler - tables should already exist');
      console.log('ℹ️  Skipping db push (pooler doesn\'t support schema creation)');
      console.log('ℹ️  If tables don\'t exist, they will be created by KeystoneJS on startup');
    } else {
      console.log('⚠️  Pushing schema directly (this may take several minutes)...');
      try {
        execSync('npx prisma db push --schema=' + schemaPath + ' --accept-data-loss --skip-generate', {
          stdio: 'inherit',
          timeout: 10 * 60 * 1000, // Увеличиваем до 10 минут
          cwd: backendDir,
          env: migrationEnv,
        });
        console.log('✅ Database schema created successfully');
      } catch (pushError) {
        if (pushError.code === 'ETIMEDOUT') {
          console.warn('⚠️  db push timed out, but tables might have been created');
          console.warn('⚠️  KeystoneJS will attempt to create tables on startup if needed');
        } else {
          console.error('❌ db push failed:', pushError.message);
          console.warn('⚠️  KeystoneJS will attempt to create tables on startup if needed');
          // Не бросаем ошибку, позволяем KeystoneJS попробовать создать таблицы
        }
      }
    }
  }
  

  console.log('🔧 Generating Prisma Client...');
  execSync('npx prisma generate --schema=' + schemaPath, {
    stdio: 'inherit',
    timeout: 2 * 60 * 1000, 
    cwd: backendDir,
  });
  console.log('✅ Prisma Client generated successfully');
  
  process.exit(0);
} catch (error) {

  if (error.code === 'ETIMEDOUT') {
    console.warn('⚠️  Database setup timed out after timeout period, continuing anyway...');
    process.exit(0);
  } else if (error.signal === 'SIGTERM') {
    console.warn('⚠️  Database setup was terminated, continuing anyway...');
    process.exit(0);
  } else {
    console.error('❌ Database setup failed:', error.message);
    console.error('⚠️  Continuing anyway - Keystone might handle migrations automatically...');
    process.exit(0);
  }
}
