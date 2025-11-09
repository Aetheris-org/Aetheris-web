/**
 * Простой скрипт для настройки публичного доступа к статьям
 * Использует Strapi Admin API
 */

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'fluy1337@gmail.com';
const ADMIN_PASSWORD = 'Admin123!';

async function fixPermissions() {
  console.log('🔧 Исправление permissions для публичного доступа к статьям...\n');

  try {
    // 1. Логин
    console.log('1️⃣ Авторизация...');
    const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginRes.data.data.token;
    console.log('✅ Авторизован\n');

    // 2. Получаем Public роль
    console.log('2️⃣ Получение Public роли...');
    const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const roles = rolesRes.data.roles || rolesRes.data;
    const publicRole = Array.isArray(roles) ? roles.find(r => r.type === 'public') : null;
    if (!publicRole) {
      console.error('❌ Public роль не найдена');
      return;
    }

    console.log(`✅ Public роль найдена (ID: ${publicRole.id})\n`);

    // 3. Обновляем permissions
    console.log('3️⃣ Обновление permissions...');
    
    // Включаем find и findOne для Article
    const updatedPermissions = {
      ...publicRole.permissions,
      'api::article.article': {
        controllers: {
          article: {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
    };

    await axios.put(
      `${STRAPI_URL}/users-permissions/roles/${publicRole.id}`,
      {
        name: publicRole.name,
        description: publicRole.description,
        type: publicRole.type,
        permissions: updatedPermissions,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Permissions обновлены!\n');
    console.log('📋 Включены permissions:');
    console.log('   ✅ Article → find (GET /api/articles)');
    console.log('   ✅ Article → findOne (GET /api/articles/:id)\n');
    
    console.log('🎉 Готово! Перезагрузите страницу React приложения.\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response?.data) {
      console.error('Детали:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

fixPermissions();

