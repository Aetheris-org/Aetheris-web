/**
 * Скрипт для автоматической настройки прав доступа к статьям
 * Запуск: node setup-article-permissions.js
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

async function setupArticlePermissions() {
  console.log('🔧 Настройка прав доступа к статьям...\n');

  try {
    // 1. Авторизация админа
    console.log('1️⃣ Авторизация админа...');
    const loginResponse = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const { data: loginData } = loginResponse;
    if (!loginData.data?.token) {
      console.error('❌ Не удалось авторизоваться');
      return;
    }

    const adminToken = loginData.data.token;
    console.log('✅ Авторизация успешна\n');

    // 2. Получаем роли
    console.log('2️⃣ Получение ролей...');
    const rolesResponse = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const roles = rolesResponse.data.roles;
    const publicRole = roles.find(r => r.type === 'public');
    
    if (!publicRole) {
      console.error('❌ Роль Public не найдена');
      return;
    }

    console.log(`✅ Найдена роль Public (ID: ${publicRole.id})\n`);

    // 3. Настраиваем permissions для Public роли
    console.log('3️⃣ Настройка permissions для Public роли...');
    
    // Получаем текущие permissions
    const currentPermissions = publicRole.permissions || {};
    
    // Обновляем permissions для Article
    const updatedPermissions = {
      ...currentPermissions,
      'api::article.article': {
        controllers: {
          article: {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            count: { enabled: true, policy: '' },
          },
        },
      },
    };

    console.log('📋 Текущие permissions:', JSON.stringify(currentPermissions, null, 2));
    console.log('📋 Обновленные permissions:', JSON.stringify(updatedPermissions, null, 2));

    // 4. Обновляем роль
    console.log('4️⃣ Обновление роли...');
    const updateResponse = await axios.put(
      `${STRAPI_URL}/users-permissions/roles/${publicRole.id}`,
      {
        name: publicRole.name,
        description: publicRole.description,
        type: publicRole.type,
        permissions: updatedPermissions,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📋 Ответ от сервера:', JSON.stringify(updateResponse.data, null, 2));

    console.log('✅ Permissions успешно настроены!\n');
    console.log('📋 Настроенные permissions для Public роли:');
    console.log('   ✅ Article → find (GET /api/articles)');
    console.log('   ✅ Article → findOne (GET /api/articles/:id)');
    console.log('   ✅ Article → count (GET /api/articles/count)\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\n💡 Попробуйте настроить permissions вручную:');
    console.log('   1. Откройте: http://localhost:1337/admin');
    console.log('   2. Settings → Users & Permissions → Roles');
    console.log('   3. Выберите роль "Public"');
    console.log('   4. Включите permissions для Article:');
    console.log('      - find');
    console.log('      - findOne');
    console.log('      - count');
    console.log('   5. Нажмите "Save"\n');
  }
}

setupArticlePermissions();

