<template>
  <div class="legal-security-container">
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
            <h1 class="content-title">Политика безопасности Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Наш подход к безопасности</h2>
              <p>Безопасность данных наших пользователей — наш приоритет. Мы применяем многоуровневый подход к защите информации и используем современные технологии безопасности для обеспечения конфиденциальности и целостности данных.</p>
            </section>

            <section class="legal-section">
              <h2>2. Технические меры безопасности</h2>
              <h3>2.1 Шифрование данных:</h3>
              <ul>
                <li>HTTPS/TLS 1.3 для всех соединений</li>
                <li>Шифрование данных в покое (AES-256)</li>
                <li>Хеширование паролей с использованием bcrypt</li>
                <li>Защищенная передача файлов</li>
              </ul>
              
              <h3>2.2 Защита инфраструктуры:</h3>
              <ul>
                <li>Регулярные обновления безопасности</li>
                <li>Системы обнаружения вторжений (IDS)</li>
                <li>Мониторинг в реальном времени</li>
                <li>Резервное копирование данных</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Контроль доступа</h2>
              <p>Мы реализуем строгие меры контроля доступа:</p>
              <ul>
                <li>Принцип минимальных привилегий</li>
                <li>Двухфакторная аутентификация для администраторов</li>
                <li>Регулярный аудит прав доступа</li>
                <li>Сессионное управление и автоматический выход</li>
                <li>Логирование всех действий пользователей</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Мониторинг и обнаружение угроз</h2>
              <p>Наша система безопасности включает:</p>
              <ul>
                <li>Автоматическое обнаружение подозрительной активности</li>
                <li>Анализ поведения пользователей</li>
                <li>Системы предотвращения DDoS-атак</li>
                <li>Мониторинг целостности данных</li>
                <li>Алерты о потенциальных угрозах</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Обработка инцидентов</h2>
              <p>В случае нарушения безопасности мы:</p>
              <ul>
                <li>Немедленно оцениваем масштаб инцидента</li>
                <li>Принимаем меры по сдерживанию угрозы</li>
                <li>Уведомляем затронутых пользователей</li>
                <li>Проводим расследование и анализ</li>
                <li>Улучшаем меры безопасности</li>
                <li>Предоставляем отчеты регуляторам при необходимости</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>6. Безопасность разработки</h2>
              <p>Мы следуем лучшим практикам безопасной разработки:</p>
              <ul>
                <li>Код-ревью всех изменений</li>
                <li>Автоматизированное тестирование безопасности</li>
                <li>Анализ уязвимостей в зависимостях</li>
                <li>Обучение разработчиков вопросам безопасности</li>
                <li>Регулярные пентесты</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>7. Физическая безопасность</h2>
              <p>Наши серверы размещены в сертифицированных дата-центрах с:</p>
              <ul>
                <li>Контролируемым физическим доступом</li>
                <li>Системами видеонаблюдения</li>
                <li>Резервным питанием и охлаждением</li>
                <li>Защитой от стихийных бедствий</li>
                <li>Регулярными проверками безопасности</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>8. Соответствие стандартам</h2>
              <p>Мы стремимся соответствовать международным стандартам безопасности:</p>
              <ul>
                <li>ISO 27001 (Системы управления информационной безопасностью)</li>
                <li>GDPR (Общий регламент по защите данных)</li>
                <li>SOC 2 Type II</li>
                <li>OWASP Top 10</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>9. Обучение и осведомленность</h2>
              <p>Мы регулярно обучаем нашу команду:</p>
              <ul>
                <li>Основам информационной безопасности</li>
                <li>Распознаванию фишинговых атак</li>
                <li>Обработке персональных данных</li>
                <li>Процедурам реагирования на инциденты</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>10. Сообщение о уязвимостях</h2>
              <p>Если вы обнаружили уязвимость в безопасности, пожалуйста:</p>
              <ul>
                <li>Сообщите нам по адресу: security@aetheris-community.com</li>
                <li>Не разглашайте информацию публично до исправления</li>
                <li>Предоставьте детальное описание проблемы</li>
                <li>Мы рассмотрим ваш отчет в течение 48 часов</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>11. Контактная информация</h2>
              <p>По вопросам безопасности обращайтесь: security@aetheris-community.com</p>
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
.legal-security-container {
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