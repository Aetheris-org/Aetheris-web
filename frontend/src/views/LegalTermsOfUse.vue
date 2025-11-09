<template>
  <div class="legal-terms-of-use-container">
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
            <h1 class="content-title">Условия использования Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Принятие условий</h2>
              <p>Добро пожаловать в Aetheris Community! Используя наш сайт и сервисы, вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с какими-либо положениями, пожалуйста, не используйте наши сервисы.</p>
            </section>

            <section class="legal-section">
              <h2>2. Описание сервиса</h2>
              <p>Aetheris Community — это платформа для обмена знаниями, обсуждения технологий и создания контента. Мы предоставляем инструменты для:</p>
              <ul>
                <li>Создания и публикации статей</li>
                <li>Общения в комментариях</li>
                <li>Системы рейтингов и достижений</li>
                <li>Модерации контента</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Регистрация и аккаунт</h2>
              <p>Для использования некоторых функций вам необходимо создать аккаунт. Вы обязуетесь:</p>
              <ul>
                <li>Предоставлять точную и актуальную информацию</li>
                <li>Поддерживать безопасность своего аккаунта</li>
                <li>Нести ответственность за все действия под вашим аккаунтом</li>
                <li>Немедленно уведомлять нас о любых нарушениях безопасности</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Правила поведения</h2>
              <p>При использовании Aetheris Community вы соглашаетесь:</p>
              <ul>
                <li>Уважать других пользователей и их мнения</li>
                <li>Не публиковать незаконный, вредоносный или оскорбительный контент</li>
                <li>Не нарушать права интеллектуальной собственности</li>
                <li>Не использовать сервис для спама или нежелательной рекламы</li>
                <li>Соблюдать все применимые законы и правила</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Интеллектуальная собственность</h2>
              <p>Вы сохраняете права на контент, который создаете и публикуете. Размещая контент на нашей платформе, вы предоставляете нам неисключительную лицензию на его использование в рамках функционирования сервиса.</p>
            </section>

            <section class="legal-section">
              <h2>6. Модерация и принудительные меры</h2>
              <p>Мы оставляем за собой право модерации контента и принятия мер против пользователей, нарушающих наши правила, включая предупреждения, временную или постоянную блокировку.</p>
            </section>

            <section class="legal-section">
              <h2>7. Отказ от ответственности</h2>
              <p>Сервис предоставляется "как есть". Мы не гарантируем бесперебойную работу и не несем ответственности за ущерб, возникший в результате использования или невозможности использования сервиса.</p>
            </section>

            <section class="legal-section">
              <h2>8. Изменения условий</h2>
              <p>Мы можем изменять настоящие Условия в любое время. О существенных изменениях мы уведомим пользователей через сайт или по электронной почте.</p>
            </section>

            <section class="legal-section">
              <h2>9. Контактная информация</h2>
              <p>По вопросам, связанным с настоящими Условиями, обращайтесь к нам через систему поддержки на сайте или по адресу: support@aetheris-community.com</p>
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
.legal-terms-of-use-container {
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