<template>
  <div class="legal-content-rules-container">
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
            <h1 class="content-title">Правила контента Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Общие принципы</h2>
              <p>Наша платформа создана для обмена знаниями, конструктивного обсуждения и профессионального роста. Мы ожидаем от всех пользователей соблюдения высоких стандартов качества контента и уважительного отношения к сообществу.</p>
            </section>

            <section class="legal-section">
              <h2>2. Качество контента</h2>
              <h3>2.1 Статьи должны:</h3>
              <ul>
                <li>Содержать полезную и актуальную информацию</li>
                <li>Быть хорошо структурированными и читаемыми</li>
                <li>Включать ссылки на источники при необходимости</li>
                <li>Соответствовать заявленной теме</li>
                <li>Быть оригинальными или содержать четкие ссылки на источники</li>
              </ul>
              
              <h3>2.2 Запрещается публиковать:</h3>
              <ul>
                <li>Контент без смысловой нагрузки</li>
                <li>Повторяющиеся или дублирующиеся материалы</li>
                <li>Неполные или незавершенные статьи</li>
                <li>Контент с множественными ошибками</li>
                <li>Материалы, не соответствующие тематике платформы</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Технические требования</h2>
              <p>При публикации контента соблюдайте следующие требования:</p>
              <ul>
                <li>Используйте корректную разметку и форматирование</li>
                <li>Оптимизируйте изображения для веб-отображения</li>
                <li>Проверяйте работоспособность ссылок</li>
                <li>Используйте соответствующие теги и категории</li>
                <li>Соблюдайте ограничения по размеру файлов</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Языковые стандарты</h2>
              <p>Мы поддерживаем качественное общение на платформе:</p>
              <ul>
                <li>Используйте грамотный и понятный язык</li>
                <li>Избегайте избыточного использования сленга</li>
                <li>Структурируйте текст с помощью заголовков и списков</li>
                <li>Проверяйте орфографию и пунктуацию</li>
                <li>Используйте профессиональную терминологию</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Медиа-контент</h2>
              <h3>5.1 Изображения:</h3>
              <ul>
                <li>Должны быть релевантными к содержанию</li>
                <li>Иметь соответствующее разрешение и качество</li>
                <li>Не нарушать авторские права</li>
                <li>Содержать альтернативный текст для доступности</li>
              </ul>
              
              <h3>5.2 Видео и аудио:</h3>
              <ul>
                <li>Должны быть в поддерживаемых форматах</li>
                <li>Иметь разумный размер файла</li>
                <li>Содержать описание или транскрипт</li>
                <li>Соответствовать общим правилам контента</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>6. Ссылки и источники</h2>
              <p>При использовании внешних материалов:</p>
              <ul>
                <li>Указывайте первоисточники</li>
                <li>Проверяйте достоверность ссылок</li>
                <li>Используйте релевантные и авторитетные источники</li>
                <li>Избегайте ссылок на сомнительные ресурсы</li>
                <li>Соблюдайте принципы добросовестного использования</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>7. Модерация контента</h2>
              <p>Наша команда модерации проверяет контент на соответствие правилам:</p>
              <ul>
                <li>Автоматическая проверка на спам и дубликаты</li>
                <li>Ручная модерация спорных материалов</li>
                <li>Обратная связь от сообщества</li>
                <li>Система жалоб и обращений</li>
                <li>Регулярные аудиты качества</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>8. Нарушения и санкции</h2>
              <p>При нарушении правил контента могут применяться следующие меры:</p>
              <ul>
                <li>Предупреждение с указанием нарушений</li>
                <li>Требование исправления контента</li>
                <li>Временное скрытие материала</li>
                <li>Удаление неподходящего контента</li>
                <li>Временная или постоянная блокировка аккаунта</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>9. Обжалование решений</h2>
              <p>Если вы не согласны с решением модерации:</p>
              <ul>
                <li>Обратитесь в службу поддержки</li>
                <li>Предоставьте обоснование вашей позиции</li>
                <li>Укажите конкретные нарушения правил</li>
                <li>Будьте готовы к конструктивному диалогу</li>
                <li>Рассмотрение жалобы в течение 48 часов</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>10. Рекомендации по созданию контента</h2>
              <p>Для создания качественного контента:</p>
              <ul>
                <li>Исследуйте тему перед написанием</li>
                <li>Структурируйте информацию логично</li>
                <li>Используйте примеры и иллюстрации</li>
                <li>Приглашайте к обсуждению</li>
                <li>Обновляйте информацию при необходимости</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>11. Контактная информация</h2>
              <p>По вопросам контента обращайтесь: content@aetheris-community.com</p>
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
.legal-content-rules-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding: 0 16px;
  box-sizing: border-box;
  
  padding-top: calc(var(--header-height, 80px) + 60px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  @media (max-width: 768px) {
    padding: calc(var(--header-height, 60px) + 50px) 16px 100px 16px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: calc(var(--header-height, 70px) + 75px) 20px 150px 20px;
    max-width: 1000px;
  }
  
  @media (min-width: 1025px) {
    padding: calc(var(--header-height, 80px) + 60px) 24px 200px 24px;
  }
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
  
  /* Мобильные устройства */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 16px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 350px;
    height: auto;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 320px;
    height: auto;
  }
  
  @media (min-width: 1025px) {
    width: 370px;
    height: 655px;
  }
}

.sidebar-block {
  background-color: var(--bg-secondary);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 20px;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 320px;
    border-radius: 22px;
  }
  
  @media (min-width: 1025px) {
    width: 370px;
    border-radius: 25px;
  }
    
  &.legal-block {
    @media (max-width: 768px) {
      height: auto;
      min-height: 280px;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      height: 300px;
    }
    
    @media (min-width: 1025px) {
      height: 330px;
    }
  }
  
  &.community-block {
    align-items: center;
    
    @media (max-width: 768px) {
      height: 70px;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      height: 75px;
    }
    
    /* Десктоп */
    @media (min-width: 1025px) {
      height: 84px;
    }
  }
  
  &.security-block {
    @media (max-width: 768px) {
      padding: 12px;
      height: auto;
      min-height: 180px;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      padding: 14px;
      height: 200px;
    }
    
    @media (min-width: 1025px) {
      padding: 16px;
      height: 221px;
    }
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