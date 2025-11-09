/**
 * Скрипт для автоматической настройки прав доступа в Strapi
 * Запуск: node setup-permissions.js
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function setupPermissions() {
  console.log('🔧 Настройка прав доступа в Strapi...\n');

  try {
    // Получаем роли без авторизации (публичный эндпоинт)
    const rolesResponse = await axios.get(`${STRAPI_URL}/users-permissions/roles`);
    const roles = rolesResponse.data.roles;

    console.log(`✅ Найдено ролей: ${roles.length}\n`);

    // Находим роли Public и Authenticated
    const publicRole = roles.find(r => r.type === 'public');
    const authenticatedRole = roles.find(r => r.type === 'authenticated');

    if (!publicRole || !authenticatedRole) {
      console.error('❌ Не найдены роли Public или Authenticated');
      return;
    }

    console.log(`📋 Public Role ID: ${publicRole.id}`);
    console.log(`📋 Authenticated Role ID: ${authenticatedRole.id}\n`);

    // Инструкции для ручной настройки
    console.log('📝 Необходимо настроить права вручную в Strapi Admin Panel:\n');
    console.log('1. Открой: http://localhost:1337/admin');
    console.log('2. Войди с admin логином');
    console.log('3. Перейди: Settings → Users & Permissions plugin → Roles\n');
    
    console.log('4. Для роли "Public":');
    console.log('   ✅ Users-permissions → connect (GET)');
    console.log('   ✅ Users-permissions → callback (GET)\n');
    
    console.log('5. Для роли "Authenticated":');
    console.log('   ✅ Users-permissions → me (GET)');
    console.log('   ✅ Users-permissions → find (GET) - опционально');
    console.log('   ✅ Users-permissions → findOne (GET) - опционально\n');
    
    console.log('6. Нажми "Save" для каждой роли\n');
    
    console.log('⚠️  ВАЖНО: Кастомный endpoint PUT /api/users/me уже настроен');
    console.log('   и требует авторизации автоматически.\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

setupPermissions();

