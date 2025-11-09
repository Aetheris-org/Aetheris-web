<template>
  <div class="sidebar">
    <p class="sidebar-section-title">{{ $t('settings.sidebar.sections.display') }}</p>
    <div class="sidebar-buttons-group">
      <router-link to="/settings/appearance">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/appearance' }">
          <img class="button-icon1" src="/src/assets/imgs/eye.png" alt="eye">
          <p class="button-text">{{ $t('settings.sidebar.buttons.appearance') }}</p>
        </button>
      </router-link>
    </div>
    
    <p class="sidebar-section-title">{{ $t('settings.sidebar.sections.account') }}</p>
    <div class="sidebar-buttons-group">
      <router-link to="/settings/profile">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/profile' }">
          <svg class="svg1" width="23" height="26" viewBox="0 0 23 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.1666 24.9105V22.3289C21.1666 20.9595 20.6574 19.6463 19.751 18.678C18.8446 17.7097 17.6152 17.1657 16.3333 17.1657H6.66665C5.38477 17.1657 4.15539 17.7097 3.24896 18.678C2.34254 19.6463 1.83331 20.9595 1.83331 22.3289V24.9105M16.3333 6.83929C16.3333 9.69085 14.1694 12.0025 11.5 12.0025C8.8306 12.0025 6.66665 9.69085 6.66665 6.83929C6.66665 3.98773 8.8306 1.67609 11.5 1.67609C14.1694 1.67609 16.3333 3.98773 16.3333 6.83929Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="button-text">{{ $t('settings.sidebar.buttons.displayProfile') }}</p>
        </button>
      </router-link>
      
      <router-link to="/settings/privacy">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/privacy' }">
          <svg class="svg2" width="23" height="27" viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 25.5834C11.5 25.5834 21.1667 20.75 21.1667 13.5V5.04169L11.5 1.41669L1.83333 5.04169V13.5C1.83333 20.75 11.5 25.5834 11.5 25.5834Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="button-text">{{ $t('settings.sidebar.buttons.privacySecurity') }}</p>
        </button>
      </router-link>
      
      <router-link to="/settings/sessions">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/sessions' }">
          <svg class="svg3" width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.5833 12.5H20.75L17.125 23.375L9.875 1.625L6.25 12.5H1.41667" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg> 
          <p class="button-text">{{ $t('settings.sidebar.buttons.sessions') }}</p>
        </button>
      </router-link>
      
      <router-link to="/settings/subscription">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/subscription' }">
          <svg class="svg4" width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.1667 1.25L7.875 14.5417L1.83333 8.5" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg> 
          <p class="button-text">{{ $t('settings.sidebar.buttons.subscription') }}</p>
        </button>
      </router-link>
    </div>
    
    <p class="sidebar-section-title">{{ $t('settings.sidebar.sections.another') }}</p>
    <div class="sidebar-buttons-group">
      <router-link to="/settings/support">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/support' }">
          <svg class="svg5" width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 8.66663V13.5M13.5 18.3333H13.5121M25.5833 13.5C25.5833 20.1734 20.1734 25.5833 13.5 25.5833C6.82656 25.5833 1.41667 20.1734 1.41667 13.5C1.41667 6.82652 6.82656 1.41663 13.5 1.41663C20.1734 1.41663 25.5833 6.82652 25.5833 13.5Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="button-text">{{ $t('settings.sidebar.buttons.supportInfo') }}</p>
        </button>
      </router-link>
      
      <router-link to="/settings/another">
        <button class="sidebar-button" :class="{ active: $route.path === '/settings/another' }">
          <svg class="svg6" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.7625 6.61247C15.5411 6.83834 15.4171 7.14201 15.4171 7.4583C15.4171 7.77458 15.5411 8.07826 15.7625 8.30413L17.6958 10.2375C17.9217 10.4589 18.2254 10.5829 18.5417 10.5829C18.858 10.5829 19.1616 10.4589 19.3875 10.2375L23.9429 5.68205C24.5505 7.02474 24.7345 8.52071 24.4703 9.9706C24.2061 11.4205 23.5064 12.7554 22.4643 13.7976C21.4221 14.8397 20.0872 15.5394 18.6373 15.8036C17.1874 16.0678 15.6914 15.8838 14.3488 15.2762L5.99917 23.6258C5.51846 24.1065 4.86649 24.3766 4.18667 24.3766C3.50685 24.3766 2.85487 24.1065 2.37417 23.6258C1.89346 23.1451 1.62341 22.4931 1.62341 21.8133C1.62341 21.1335 1.89346 20.4815 2.37417 20.0008L10.7238 11.6512C10.1162 10.3085 9.93219 8.81256 10.1964 7.36267C10.4605 5.91277 11.1603 4.57782 12.2024 3.53571C13.2445 2.4936 14.5795 1.79384 16.0294 1.52966C17.4793 1.26549 18.9752 1.44946 20.3179 2.05705L15.7625 6.61247Z" stroke="var(--ico-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="button-text">{{ $t('settings.sidebar.buttons.another') }}</p>
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Компонент использует $t из vue-i18n через глобальные свойства
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

// Sidebar Styles
.sidebar {
  background-color: var(--bg-secondary);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Не сжимается под влиянием flex-контейнера */
  box-sizing: border-box; /* Включает padding и border в ширину */

  /* Мобильные устройства */
  @media (max-width: 768px) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: auto;
    min-height: 400px;
    border-radius: 20px;
    margin-bottom: 20px;
  }
  
  /* Планшеты */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 320px !important;
    max-width: 320px !important;
    min-width: 320px !important;
    height: 580px;
    border-radius: 22px;
  }
  
  /* Десктоп */
  @media (min-width: 1025px) {
    width: 395px !important;
    max-width: 395px !important;
    min-width: 395px !important;
    height: 685px;
    border-radius: 25px;
  }

  a {
    text-decoration: none;
  }
}

.sidebar-section-title {
  color: var(--text-primary);
font-size: 25px;
  font-family: var(--font-sans);
  font-weight: bold;
margin-top: 33px;
margin-left: 44px;
}

.button-icon1,
.button-icon2,
.button-icon3,
.button-icon4,
.button-icon5,
.button-icon6,
.button-icon7 {
width: 26px;
height: 19px;
margin-left: 16px;
border-radius: 2px;
}

.sidebar-buttons-group {
  display: flex;
  flex-direction: column;
margin-top: 3px;
margin-left: 44px;
gap: 8px;
}

.sidebar-button {
  width: 300px !important;
  max-width: 300px !important;
  min-width: 300px !important;
  height: 56px;
  background-color: rgba(67, 73, 86, 0);
  border-radius: 15px;
  color: var(--text-primary);
  font-size: 23px;
  font-family: var(--font-sans);
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  margin-top: 3px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(67, 73, 86, 1);
    text-decoration: none;
  }

  &.active {
    background-color: rgba(67, 73, 86, 1);
    text-decoration: none;
  }
}

.button-icon {
width: 26px;
height: 19px;
margin-left: 16px;
  background-color: var(--ico-color);
border-radius: 2px;
}

.button-text {
margin-left: 16px;
}

.svg1,
.svg2,
.svg3,
.svg4,
.svg5,
.svg6 {
margin-left: 15px;
}

.svg6 {
margin-left: 15px;
}
</style>
