<template>
  <div class="unauthorized-container">
    <div class="unauthorized-content">
      <div class="icon-wrapper">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="title">Вы не зарегестрированы</h1>
      <p class="message">Эта страница доступна только для авторизованных пользователей.</p>
      <div class="actions">
        <router-link to="/login" class="btn-primary">
          Войти
        </router-link>
        <router-link to="/home" class="btn-secondary">
          На главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.unauthorized-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  padding: 20px;
  padding-top: calc(var(--header-height, 80px) + 20px);
}

.unauthorized-content {
  text-align: center;
  max-width: 500px;
  padding: 60px 40px;
  background-color: var(--bg-secondary);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.icon-wrapper {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  color: var(--primary-violet);
}

.title {
  color: var(--text-primary);
  font-size: 36px;
  font-family: var(--font-sans-serif);
  font-weight: 700;
  margin: 0 0 20px 0;
}

.message {
  color: var(--text-secondary);
  font-size: 18px;
  font-family: var(--font-sans-serif);
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-family: var(--font-sans-serif);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background-color: var(--primary-violet);
  color: white;
  
  &:hover {
    background-color: var(--primary-blue);
    transform: translateY(-2px);
  }
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 2px solid var(--text-secondary);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: var(--text-primary);
  }
}

@media (max-width: 768px) {
  .unauthorized-content {
    padding: 40px 24px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .message {
    font-size: 16px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

