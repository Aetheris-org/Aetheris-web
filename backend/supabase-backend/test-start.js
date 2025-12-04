// Простой тест запуска сервера
console.log('🧪 Тест запуска сервера...\n');

// 1. Проверка dotenv
try {
  require('dotenv').config();
  console.log('✅ dotenv загружен');
} catch (e) {
  console.error('❌ Ошибка dotenv:', e.message);
  process.exit(1);
}

// 2. Проверка переменных
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'DATABASE_URL'];
const missing = required.filter(v => !process.env[v] || process.env[v].trim() === '');

if (missing.length > 0) {
  console.error('❌ Отсутствуют или пустые переменные:', missing.join(', '));
  console.error('\n💡 Проверьте файл .env:');
  missing.forEach(v => {
    const value = process.env[v];
    console.error(`   ${v}: ${value ? `"${value.substring(0, 20)}..." (пустое?)` : 'не найдено'}`);
  });
  console.error('\n📖 Инструкция: HOW_TO_GET_KEYS.md');
  process.exit(1);
}

console.log('✅ Переменные окружения OK');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL.substring(0, 30)}...`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);

// 3. Проверка Supabase подключения (без Prisma)
try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase Client найден');
  
  // Создаем клиент напрямую
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY не установлены');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  console.log('✅ Supabase Client создан');
  
  // Пробуем подключиться - делаем простой запрос к системной таблице
  // Используем системную таблицу, которая всегда есть
  supabase
    .rpc('version')
    .then(({ data, error }) => {
      // Если RPC не работает, пробуем простой запрос к любой таблице
      if (error) {
        // Пробуем проверить подключение через простой запрос
        return supabase.from('users').select('count').limit(0);
      }
      return { data, error: null };
    })
    .then(({ data, error }) => {
      if (error) {
        // PGRST116 или "Could not find the table" = таблица не найдена
        // Это нормально, если миграции не применены
        if (error.code === 'PGRST116' || error.message.includes('Could not find the table')) {
          console.log('⚠️  Таблицы еще не созданы (миграции не применены)');
          console.log('✅ Но подключение к Supabase работает!');
          console.log('💡 Примените миграции: см. HOW_TO_APPLY_MIGRATIONS.md');
          console.log('ℹ️  Используем Supabase напрямую (без Prisma)');
          console.log('\n✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Сервер должен запуститься.');
          console.log('⚠️  Но сначала примените миграции для создания таблиц!');
          process.exit(0);
        } else {
          console.error('❌ Ошибка подключения к БД:', error.message);
          console.error('💡 Проверьте SUPABASE_SERVICE_ROLE_KEY в .env файле');
          process.exit(1);
        }
      } else {
        console.log('✅ Подключение к Supabase успешно!');
        console.log('ℹ️  Используем Supabase напрямую (без Prisma)');
        console.log('\n✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Сервер должен запуститься.');
        process.exit(0);
      }
    })
    .catch((e) => {
      console.error('❌ Ошибка подключения к БД:', e.message);
      console.error('💡 Проверьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env файле');
      process.exit(1);
    });
} catch (e) {
  console.error('❌ Ошибка Supabase Client:', e.message);
  console.error('💡 Убедитесь, что @supabase/supabase-js установлен');
  console.error('   Выполните: npm install @supabase/supabase-js');
  process.exit(1);
}

