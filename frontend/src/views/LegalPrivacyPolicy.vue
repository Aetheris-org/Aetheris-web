<template>
  <div class="legal-privacy-policy-container">
    <!-- Body -->
    <h2 class="page-title">{{ $t('legal.sidebar.pageTitle') }}</h2>
    <div class="content-wrapper">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Legal block -->
        <div class="sidebar-block legal-block">
          <h3 class="block-title">{{ $t('legal.sidebar.legal') }}</h3>
          <div class="button-column">
            <router-link to="/legal/content-rules">
              <button class="sidebar-button">{{ $t('legal.sidebar.contentRules') }}</button>
            </router-link>
            <router-link to="/legal/terms-of-use">
              <button class="sidebar-button">{{ $t('legal.sidebar.termsOfUse') }}</button>
            </router-link>
            <router-link to="/legal/copyright-policy">
              <button class="sidebar-button">{{ $t('legal.sidebar.copyrightPolicy') }}</button>
            </router-link>
            <router-link to="/legal/another">
              <button class="sidebar-button">{{ $t('legal.sidebar.another') }}</button>
            </router-link>
          </div>
        </div>
        
        <!-- Community rules block -->
        <div class="sidebar-block community-block">
          <router-link to="/legal/community-rules">
            <button class="sidebar-button">{{ $t('legal.sidebar.communityRules') }}</button>
          </router-link>
        </div>
        
        <!-- Security block -->
        <div class="sidebar-block security-block">
          <h3 class="block-title">{{ $t('legal.sidebar.security') }}</h3>
          <div class="button-column">
            <router-link to="/legal/privacy-policy">
              <button class="sidebar-button">{{ $t('legal.sidebar.privacyPolicy') }}</button>
            </router-link>
            <router-link to="/legal/security">
              <button class="sidebar-button">{{ $t('legal.sidebar.another') }}</button>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="content">
        <div class="content-block">
          <div class="legal-content">
            <h1 class="content-title">Политика конфиденциальности Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Введение</h2>
              <p>В Aetheris Community мы серьезно относимся к защите вашей конфиденциальности. Данная Политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу личную информацию при использовании нашего сервиса.</p>
            </section>

            <section class="legal-section">
              <h2>2. Информация, которую мы собираем</h2>
              <h3>2.1 Информация, предоставляемая вами:</h3>
              <ul>
                <li>Имя пользователя и адрес электронной почты</li>
                <li>Профильная информация (аватар, биография)</li>
                <li>Контент, который вы создаете (статьи, комментарии)</li>
                <li>Сообщения в системе поддержки</li>
              </ul>
              
              <h3>2.2 Информация, собираемая автоматически:</h3>
              <ul>
                <li>IP-адрес и данные о браузере</li>
                <li>Информация об использовании сайта (страницы, время посещения)</li>
                <li>Файлы cookie и аналогичные технологии</li>
                <li>Данные о производительности и ошибках</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Как мы используем вашу информацию</h2>
              <p>Мы используем собранную информацию для:</p>
              <ul>
                <li>Предоставления и улучшения наших сервисов</li>
                <li>Персонализации вашего опыта</li>
                <li>Обработки транзакций и уведомлений</li>
                <li>Обеспечения безопасности платформы</li>
                <li>Анализа использования и улучшения функциональности</li>
                <li>Соблюдения правовых обязательств</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Обмен информацией</h2>
              <p>Мы не продаем, не сдаем в аренду и не передаем вашу личную информацию третьим лицам, за исключением случаев:</p>
              <ul>
                <li>Когда вы даете явное согласие</li>
                <li>Для выполнения наших обязательств перед вами</li>
                <li>Для соблюдения правовых требований</li>
                <li>Для защиты наших прав и безопасности</li>
                <li>При слиянии, поглощении или продаже активов</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Безопасность данных</h2>
              <p>Мы применяем соответствующие технические и организационные меры для защиты вашей информации:</p>
              <ul>
                <li>Шифрование данных при передаче и хранении</li>
                <li>Регулярные проверки безопасности</li>
                <li>Ограниченный доступ к персональным данным</li>
                <li>Обучение сотрудников вопросам конфиденциальности</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>6. Ваши права</h2>
              <p>В соответствии с применимым законодательством вы имеете право:</p>
              <ul>
                <li>Получать копию ваших персональных данных</li>
                <li>Исправлять неточную информацию</li>
                <li>Удалять ваши данные</li>
                <li>Ограничивать обработку</li>
                <li>Переносить данные</li>
                <li>Возражать против обработки</li>
                <li>Отзывать согласие</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>7. Файлы cookie</h2>
              <p>Мы используем файлы cookie для улучшения функциональности сайта, аналитики и персонализации. Вы можете управлять настройками cookie через ваш браузер.</p>
            </section>

            <section class="legal-section">
              <h2>8. Хранение данных</h2>
              <p>Мы храним вашу информацию только в течение времени, необходимого для достижения целей, описанных в данной политике, или в соответствии с требованиями законодательства.</p>
            </section>

            <section class="legal-section">
              <h2>9. Изменения в политике</h2>
              <p>Мы можем обновлять данную Политику конфиденциальности. О существенных изменениях мы уведомим вас через сайт или по электронной почте.</p>
            </section>

            <section class="legal-section">
              <h2>10. Контактная информация</h2>
              <p>По вопросам конфиденциальности обращайтесь к нам: privacy@aetheris-community.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.legal-privacy-policy-container {
  width: 100%; max-width: 1400px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding-top: calc(var(--header-height, 80px) + 60px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  color: var(--text-primary);
  font-size: 30px;
  font-family: var(--font-sans-serif);
  font-weight: bold;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 370px;
  height: 655px;
}

.sidebar-block {
  background-color: var(--bg-secondary);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  width: 370px;
    
  &.legal-block {
    height: 330px;
  }
  
  &.community-block {
    align-items: center;
    height: 84px;
  }
  
  &.security-block {
    padding: 16px;
    height: 221px;
  }
}

.block-title {
  color: var(--text-primary);
  font-size: 25px;
  font-family: var(--font-sans-serif);
  font-weight: bold;
  margin-top: 16px;
  margin-left: 48px;
}

.button-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
  margin-top: 8px;
  
  .security-block & {
    gap: 10px;
    margin-top: 16px;
  }
}

.sidebar-button {
  width: 300px;
  height: 56px;
  background-color: rgba(67, 73, 86, 0);
  border: none;
  border-radius: 15px;
  color: var(--text-primary);
  font-size: 23px;
  font-family: var(--font-sans-serif);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  
  &:hover {
      background-color: var(--ui-hover-bg);
  }
  
  .community-block & {
    margin-top: 16px;
  }
}

.content {
  display: flex;
  justify-content: center;
}

.content-block {
  width: 1000px;
  height: 655px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  overflow-y: auto;
}

.legal-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-family: var(--font-sans-serif);
}

.content-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}

.last-updated {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 30px;
  font-style: italic;
  font-family: var(--font-sans-serif);
}

.legal-section {
  margin-bottom: 25px;
}

.legal-section h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}

.legal-section h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 8px 0;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}

.legal-section p {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}

.legal-section ul {
  margin: 10px 0;
  padding-left: 20px;
}

.legal-section li {
  margin-bottom: 5px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}
</style>