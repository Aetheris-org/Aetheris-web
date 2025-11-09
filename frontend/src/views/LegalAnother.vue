<template>
  <div class="legal-another-container">
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
            <h1 class="content-title">Дополнительные правовые положения Aetheris Community</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>1. Применимое право</h2>
              <p>Настоящие правовые положения регулируются законодательством Российской Федерации. Все споры подлежат рассмотрению в судах по месту нахождения Aetheris Community.</p>
            </section>

            <section class="legal-section">
              <h2>2. Ограничение ответственности</h2>
              <p>В максимальной степени, разрешенной законом, Aetheris Community не несет ответственности за:</p>
              <ul>
                <li>Косвенные, случайные или штрафные убытки</li>
                <li>Потерю данных, прибыли или деловых возможностей</li>
                <li>Действия третьих лиц или внешних сервисов</li>
                <li>Временные сбои в работе платформы</li>
                <li>Контент, созданный пользователями</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>3. Возмещение ущерба</h2>
              <p>Пользователи соглашаются возместить и защищать Aetheris Community от любых претензий, убытков и расходов, возникающих в связи с:</p>
              <ul>
                <li>Нарушением настоящих условий</li>
                <li>Нарушением прав третьих лиц</li>
                <li>Использованием платформы не по назначению</li>
                <li>Публикацией незаконного контента</li>
                <li>Действиями, причиняющими вред другим пользователям</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>4. Прекращение действия</h2>
              <p>Мы оставляем за собой право прекратить или приостановить доступ к сервису в случае:</p>
              <ul>
                <li>Нарушения условий использования</li>
                <li>Технических проблем или обновлений</li>
                <li>Требований правоохранительных органов</li>
                <li>Нарушения законодательства</li>
                <li>Прекращения деятельности платформы</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>5. Форс-мажор</h2>
              <p>Мы не несем ответственности за невыполнение обязательств в случае обстоятельств непреодолимой силы, включая:</p>
              <ul>
                <li>Стихийные бедствия</li>
                <li>Технические сбои инфраструктуры</li>
                <li>Действия государственных органов</li>
                <li>Военные действия или терроризм</li>
                <li>Пандемии или эпидемии</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>6. Налогообложение</h2>
              <p>Пользователи самостоятельно несут ответственность за:</p>
              <ul>
                <li>Соблюдение налогового законодательства</li>
                <li>Уплату налогов с доходов от использования платформы</li>
                <li>Ведение учета финансовых операций</li>
                <li>Предоставление отчетности в налоговые органы</li>
                <li>Соблюдение валютного законодательства</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>7. Экспортные ограничения</h2>
              <p>При использовании платформы соблюдайте:</p>
              <ul>
                <li>Международные санкции и эмбарго</li>
                <li>Ограничения на экспорт технологий</li>
                <li>Требования по контролю за экспортом</li>
                <li>Запреты на передачу данных в определенные страны</li>
                <li>Ограничения на использование криптографии</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>8. Согласие на обработку данных</h2>
              <p>Используя платформу, вы даете согласие на:</p>
              <ul>
                <li>Обработку персональных данных в соответствии с Политикой конфиденциальности</li>
                <li>Использование данных для улучшения сервиса</li>
                <li>Передачу данных партнерам при необходимости</li>
                <li>Хранение данных в течение установленного срока</li>
                <li>Международную передачу данных</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>9. Изменения в правовых положениях</h2>
              <p>Мы можем изменять настоящие положения в любое время. Изменения вступают в силу с момента публикации на сайте. Продолжение использования сервиса означает согласие с новыми условиями.</p>
            </section>

            <section class="legal-section">
              <h2>10. Разделимость положений</h2>
              <p>Если какое-либо положение настоящих условий будет признано недействительным, остальные положения сохраняют свою силу. Недействительное положение будет заменено на максимально близкое по смыслу действующее положение.</p>
            </section>

            <section class="legal-section">
              <h2>11. Язык документации</h2>
              <p>Основным языком правовых документов является русский. В случае противоречий между переводами приоритет имеет русскоязычная версия.</p>
            </section>

            <section class="legal-section">
              <h2>12. Контактная информация</h2>
              <p>По всем правовым вопросам обращайтесь: legal@aetheris-community.com</p>
              <p>Почтовый адрес: [Адрес компании]</p>
              <p>Телефон: [Номер телефона]</p>
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

@import '@/assets/main.scss';

.legal-another-container {
  max-width: 1920px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding-top: calc(var(--header-height, 80px) + 60px);
  padding-bottom: 200px;
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  @media screen and (min-width: 1200px) {
    max-width: 2496px;
    padding-top: calc(var(--header-height, 80px) + 90px);
    padding-bottom: 260px;
  }

  @include responsive-2k {
    max-width: 2496px;
    padding-top: calc(var(--header-height, 80px) + 90px);
    padding-bottom: 260px;
  }

  @include responsive-4k {
    max-width: 3072px;
    padding-top: calc(var(--header-height, 80px) + 120px);
    padding-bottom: 320px;
  }
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  color: var(--text-primary);
  font-size: 50px !important;
  font-family: var(--font-sans-serif);
  font-weight: bold;

  @media screen and (min-width: 1px) {
    font-size: 30px;
    color: var(--text-primary);
  }

  @media screen and (min-width: 1200px) {
    font-size: 39px;
    margin-top: 21px;
  }

  @include responsive-2k {
    font-size: 39px;
    margin-top: 21px;
  }

  @include responsive-4k {
    font-size: 48px;
    margin-top: 26px;
  }
}

.content-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;

  @include responsive-2k {
    gap: 16px;
    margin-top: 21px;
  }

  @include responsive-4k {
    gap: 19px;
    margin-top: 26px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 370px;
  height: 655px;

  @include responsive-2k {
    gap: 13px;
    width: 481px;
    height: 852px;
  }

  @include responsive-4k {
    gap: 16px;
    width: 592px;
    height: 1048px;
  }
}

.sidebar-block {
  background-color: var(--bg-secondary);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  width: 370px;

  @include responsive-2k {
    border-radius: 33px;
    width: 481px;
  }

  @include responsive-4k {
    border-radius: 40px;
    width: 592px;
  }
    
  &.legal-block {
    height: 330px;

    @include responsive-2k {
      height: 429px;
    }

    @include responsive-4k {
      height: 528px;
    }
  }
  
  &.community-block {
    align-items: center;
    height: 84px;

    @include responsive-2k {
      height: 109px;
    }

    @include responsive-4k {
      height: 134px;
    }
  }
  
  &.security-block {
    padding: 16px;
    height: 221px;

    @include responsive-2k {
      padding: 21px;
      height: 287px;
    }

    @include responsive-4k {
      padding: 26px;
      height: 354px;
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

  @include responsive-2k {
    font-size: 33px;
    margin-top: 21px;
    margin-left: 62px;
  }

  @include responsive-4k {
    font-size: 40px;
    margin-top: 26px;
    margin-left: 77px;
  }
}

.button-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
  margin-top: 8px;

  @include responsive-2k {
    gap: 10px;
    margin-top: 10px;
  }

  @include responsive-4k {
    gap: 13px;
    margin-top: 13px;
  }
  
  .security-block & {
    gap: 10px;
    margin-top: 16px;

    @include responsive-2k {
      gap: 13px;
      margin-top: 21px;
    }

    @include responsive-4k {
      gap: 16px;
      margin-top: 26px;
    }
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

  @include responsive-2k {
    width: 390px;
    height: 73px;
    border-radius: 20px;
    font-size: 30px;
  }

  @include responsive-4k {
    width: 480px;
    height: 90px;
    border-radius: 24px;
    font-size: 37px;
  }
  
  &:hover {
      background-color: var(--ui-hover-bg);
  }
  
  .community-block & {
    margin-top: 16px;

    @include responsive-2k {
      margin-top: 21px;
    }

    @include responsive-4k {
      margin-top: 26px;
    }
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

  @include responsive-2k {
    width: 1300px;
    height: 852px;
    border-radius: 26px;
    padding: 39px;
  }

  @include responsive-4k {
    width: 1600px;
    height: 1048px;
    border-radius: 32px;
    padding: 48px;
  }
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

  @include responsive-2k {
    font-size: 36px;
  }

  @include responsive-4k {
    font-size: 44px;
  }
}

.last-updated {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 30px;
  font-style: italic;
  font-family: var(--font-sans-serif);

  @include responsive-2k {
    font-size: 18px;
    margin-bottom: 39px;
  }

  @include responsive-4k {
    font-size: 22px;
    margin-bottom: 48px;
  }
}

.legal-section {
  margin-bottom: 25px;

  @include responsive-2k {
    margin-bottom: 33px;
  }

  @include responsive-4k {
    margin-bottom: 40px;
  }
}

.legal-section h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);

  @include responsive-2k {
    font-size: 26px;
    margin-bottom: 13px;
  }

  @include responsive-4k {
    font-size: 32px;
    margin-bottom: 16px;
  }
}

.legal-section p {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);

  @include responsive-2k {
    font-size: 18px;
    margin-bottom: 13px;
  }

  @include responsive-4k {
    font-size: 22px;
    margin-bottom: 16px;
  }
}

.legal-section ul {
  margin: 10px 0;
  padding-left: 20px;

  @include responsive-2k {
    margin: 13px 0;
    padding-left: 26px;
  }

  @include responsive-4k {
    margin: 16px 0;
    padding-left: 32px;
  }
}

.legal-section li {
  margin-bottom: 5px;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);

  @include responsive-2k {
    font-size: 18px;
    margin-bottom: 7px;
  }

  @include responsive-4k {
    font-size: 22px;
    margin-bottom: 8px;
  }
}
</style>