<template>
  <div class="legal-copyright-policy-container">
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
            <h1 class="content-title">Политика авторских прав Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Уважение к интеллектуальной собственности</h2>
              <p>Aetheris Community уважает права интеллектуальной собственности и ожидает того же от наших пользователей. Мы придерживаемся принципов честного использования и соблюдения авторских прав.</p>
            </section>

            <section class="legal-section">
              <h2>2. Ваши права на контент</h2>
              <p>Вы сохраняете все права на контент, который создаете и публикуете на нашей платформе, включая:</p>
              <ul>
                <li>Статьи и блоги</li>
                <li>Комментарии и обсуждения</li>
                <li>Изображения и медиафайлы</li>
                <li>Код и технические решения</li>
                <li>Другие оригинальные материалы</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Лицензия на использование</h2>
              <p>Размещая контент на Aetheris Community, вы предоставляете нам неисключительную, безвозмездную лицензию на:</p>
              <ul>
                <li>Отображение контента на платформе</li>
                <li>Распространение контента среди пользователей</li>
                <li>Модификацию для технических нужд (форматирование, сжатие)</li>
                <li>Создание резервных копий</li>
                <li>Использование в маркетинговых целях (с указанием авторства)</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Запрещенный контент</h2>
              <p>Строго запрещается публиковать контент, который:</p>
              <ul>
                <li>Нарушает авторские права третьих лиц</li>
                <li>Является плагиатом или копированием без разрешения</li>
                <li>Содержит незаконно полученные материалы</li>
                <li>Нарушает торговые марки или патенты</li>
                <li>Является спамом или рекламой без разрешения</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Процедура DMCA</h2>
              <p>Если вы считаете, что ваш контент был использован без разрешения, вы можете подать жалобу по процедуре DMCA:</p>
              <ul>
                <li>Отправьте уведомление на: copyright@aetheris-community.com</li>
                <li>Укажите описание нарушенного материала</li>
                <li>Предоставьте доказательства ваших прав</li>
                <li>Включите контактную информацию</li>
                <li>Подпишите уведомление</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>6. Ответные меры</h2>
              <p>При получении валидной жалобы о нарушении авторских прав мы:</p>
              <ul>
                <li>Немедленно удалим спорный контент</li>
                <li>Уведомим пользователя о нарушении</li>
                <li>Ведем учет повторных нарушений</li>
                <li>Можем заблокировать аккаунт при систематических нарушениях</li>
                <li>Предоставим информацию правообладателю при необходимости</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>7. Добросовестное использование</h2>
              <p>Мы поддерживаем принципы добросовестного использования, включая:</p>
              <ul>
                <li>Цитирование с указанием источника</li>
                <li>Образовательные и исследовательские цели</li>
                <li>Критику и обзоры</li>
                <li>Пародии и сатиру</li>
                <li>Новостные репортажи</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>8. Открытые лицензии</h2>
              <p>Мы поддерживаем использование открытых лицензий:</p>
              <ul>
                <li>Creative Commons (CC BY, CC BY-SA, CC BY-NC)</li>
                <li>MIT License для программного кода</li>
                <li>GNU GPL для свободного ПО</li>
                <li>Apache License 2.0</li>
                <li>Другие совместимые лицензии</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>9. Ответственность пользователей</h2>
              <p>Пользователи несут полную ответственность за:</p>
              <ul>
                <li>Соблюдение авторских прав при публикации</li>
                <li>Получение необходимых разрешений</li>
                <li>Правильное указание источников</li>
                <li>Соблюдение лицензионных соглашений</li>
                <li>Возмещение ущерба при нарушениях</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>10. Контактная информация</h2>
              <p>По вопросам авторских прав обращайтесь: copyright@aetheris-community.com</p>
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
.legal-copyright-policy-container {
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