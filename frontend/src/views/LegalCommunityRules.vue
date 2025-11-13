<template>
  <div class="legal-community-rules-container">
    <!-- Body -->
    <h2 class="page-title">{{ $t('legal.sidebar.communityRules') }}</h2>
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
            <h1 class="content-title">{{ $t('legal.communityRules.title') }}</h1>
            <p class="last-updated">{{ $t('legal.common.lastUpdated') }} {{ new Date().toLocaleDateString() }}</p>
            
            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.philosophy.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.philosophy.content') }}</p>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.principles.title') }}</h2>
              <ul>
                <li><strong>{{ $t('legal.communityRules.sections.principles.respect') }}</strong></li>
                <li><strong>{{ $t('legal.communityRules.sections.principles.constructiveness') }}</strong></li>
                <li><strong>{{ $t('legal.communityRules.sections.principles.professionalism') }}</strong></li>
                <li><strong>{{ $t('legal.communityRules.sections.principles.openness') }}</strong></li>
                <li><strong>{{ $t('legal.communityRules.sections.principles.tolerance') }}</strong></li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.communication.title') }}</h2>
              <h3>{{ $t('legal.communityRules.sections.communication.allowed.title') }}</h3>
              <ul>
                <li>{{ $t('legal.communityRules.sections.communication.allowed.constructiveCriticism') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.allowed.questions') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.allowed.sharing') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.allowed.support') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.allowed.professionalDiscussions') }}</li>
              </ul>
              
              <h3>{{ $t('legal.communityRules.sections.communication.prohibited.title') }}</h3>
              <ul>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.insults') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.discrimination') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.spam') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.trolling') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.falseInfo') }}</li>
                <li>{{ $t('legal.communityRules.sections.communication.prohibited.privacyViolation') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.moderation.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.moderation.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.moderation.monitoring') }}</li>
                <li>{{ $t('legal.communityRules.sections.moderation.complaints') }}</li>
                <li>{{ $t('legal.communityRules.sections.moderation.warnings') }}</li>
                <li>{{ $t('legal.communityRules.sections.moderation.restrictions') }}</li>
                <li>{{ $t('legal.communityRules.sections.moderation.explanations') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.reputation.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.reputation.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.reputation.ratings') }}</li>
                <li>{{ $t('legal.communityRules.sections.reputation.bonuses') }}</li>
                <li>{{ $t('legal.communityRules.sections.reputation.recognition') }}</li>
                <li>{{ $t('legal.communityRules.sections.reputation.privileges') }}</li>
                <li>{{ $t('legal.communityRules.sections.reputation.transparency') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.conflictResolution.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.conflictResolution.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.conflictResolution.direct') }}</li>
                <li>{{ $t('legal.communityRules.sections.conflictResolution.moderators') }}</li>
                <li>{{ $t('legal.communityRules.sections.conflictResolution.examples') }}</li>
                <li>{{ $t('legal.communityRules.sections.conflictResolution.dialogue') }}</li>
                <li>{{ $t('legal.communityRules.sections.conflictResolution.decisions') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.privacySecurity.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.privacySecurity.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.privacySecurity.personalInfo') }}</li>
                <li>{{ $t('legal.communityRules.sections.privacySecurity.suspicious') }}</li>
                <li>{{ $t('legal.communityRules.sections.privacySecurity.passwords') }}</li>
                <li>{{ $t('legal.communityRules.sections.privacySecurity.account') }}</li>
                <li>{{ $t('legal.communityRules.sections.privacySecurity.data') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.intellectualProperty.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.intellectualProperty.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.intellectualProperty.copying') }}</li>
                <li>{{ $t('legal.communityRules.sections.intellectualProperty.sources') }}</li>
                <li>{{ $t('legal.communityRules.sections.intellectualProperty.licenses') }}</li>
                <li>{{ $t('legal.communityRules.sections.intellectualProperty.violations') }}</li>
                <li>{{ $t('legal.communityRules.sections.intellectualProperty.original') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.specialPrograms.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.specialPrograms.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.specialPrograms.mentoring') }}</li>
                <li>{{ $t('legal.communityRules.sections.specialPrograms.workshops') }}</li>
                <li>{{ $t('legal.communityRules.sections.specialPrograms.contests') }}</li>
                <li>{{ $t('legal.communityRules.sections.specialPrograms.research') }}</li>
                <li>{{ $t('legal.communityRules.sections.specialPrograms.volunteer') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.violations.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.violations.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.violations.warning') }}</li>
                <li>{{ $t('legal.communityRules.sections.violations.restriction') }}</li>
                <li>{{ $t('legal.communityRules.sections.violations.temporaryBan') }}</li>
                <li>{{ $t('legal.communityRules.sections.violations.permanentBan') }}</li>
                <li>{{ $t('legal.communityRules.sections.violations.removal') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.appeals.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.appeals.content') }}</p>
              <ul>
                <li>{{ $t('legal.communityRules.sections.appeals.appeal') }}</li>
                <li>{{ $t('legal.communityRules.sections.appeals.evidence') }}</li>
                <li>{{ $t('legal.communityRules.sections.appeals.seniorModerator') }}</li>
                <li>{{ $t('legal.communityRules.sections.appeals.investigation') }}</li>
                <li>{{ $t('legal.communityRules.sections.appeals.decision') }}</li>
              </ul>
            </section>

            <section class="legal-section">
              <h2>{{ $t('legal.communityRules.sections.contact.title') }}</h2>
              <p>{{ $t('legal.communityRules.sections.contact.content') }}</p>
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
.legal-community-rules-container {
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

.legal-section strong {
  font-weight: bold;
  color: var(--text-primary);
  font-family: var(--font-sans-serif);
}
</style>