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
  

  // Проверяем все варианты pooler Supabase
  const isPooler = dbUrl.includes('pooler.supabase.com') || 
                   dbUrl.includes('aws-1-eu-central-1.pooler.supabase.com') ||
                   (dbUrl.includes('pooler') && dbUrl.includes(':6543'));
  
  if (isPooler) {
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

  const directDbUrl = getDirectConnectionUrl();
  

  const maskedUrl = directDbUrl.replace(/:[^:@]+@/, ':****@');
  console.log('🔍 Debug: Using DATABASE_URL:', maskedUrl);

  let shadowDbUrl = process.env.SHADOW_DATABASE_URL;
  if (!shadowDbUrl || shadowDbUrl.includes('db.') && shadowDbUrl.includes(':5432')) {

    shadowDbUrl = directDbUrl;
    console.log('🔍 Debug: Using pooler for SHADOW_DATABASE_URL (direct connection not available)');
  }
  
  const migrationEnv = { 
    ...process.env, 
    DATABASE_URL: directDbUrl,
    SHADOW_DATABASE_URL: shadowDbUrl,
    PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary' 
  };

  if (hasMigrations) {
    console.log('📦 Migrations found, deploying...');
    execSync('npx prisma migrate deploy --schema=' + schemaPath, {
      stdio: 'inherit',
      timeout: 10 * 60 * 1000, 
      cwd: backendDir,
      env: migrationEnv,
    });
    console.log('✅ Migrations deployed successfully');
  } else {
    console.log('🆕 No migrations found...');
    

    const isPooler = directDbUrl.includes('pooler.supabase.com') || 
                     directDbUrl.includes('aws-1-eu-central-1.pooler.supabase.com') ||
                     (directDbUrl.includes('pooler') && directDbUrl.includes(':6543'));
    
    console.log('🔍 Debug: DATABASE_URL contains pooler:', isPooler);
    console.log('🔍 Debug: DATABASE_URL host:', directDbUrl.replace(/:[^:@]+@/, ':****@').split('@')[1]?.split('/')[0]);
    
    if (isPooler) {
      console.log('ℹ️  Using Supabase pooler - tables should already exist');
      console.log('ℹ️  Skipping db push (pooler doesn\'t support schema creation)');
      console.log('ℹ️  If tables don\'t exist, they will be created by KeystoneJS on startup');
    } else {
      console.log('⚠️  Pushing schema directly (this may take several minutes)...');
      try {
        execSync('npx prisma db push --schema=' + schemaPath + ' --accept-data-loss --skip-generate', {
          stdio: 'inherit',
          timeout: 10 * 60 * 1000, 
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
