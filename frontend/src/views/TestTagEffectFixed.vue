<template>
  <div class="test-container">
    <h1>Тест исправленного эффекта тегов</h1>
    
    <div class="test-section">
      <h2>Проверка эффекта:</h2>
      <div class="tags-container">
        <button class="tag">
          <span>Vue.js</span>
        </button>
        <button class="tag">
          <span>TypeScript</span>
        </button>
        <button class="tag">
          <span>Frontend</span>
        </button>
        <button class="tag">
          <span>React</span>
        </button>
        <button class="tag">
          <span>JavaScript</span>
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>Инструкция по тестированию:</h2>
      <div class="instructions">
        <p>1. Наведите курсор на тег - фон заполнится слева направо</p>
        <p>2. Отведите курсор - фон уйдет вправо</p>
        <p>3. Попробуйте с разными тегами</p>
        <p>4. Эффект должен работать плавно в обе стороны!</p>
      </div>
    </div>

    <div class="test-section">
      <h2>Техническая информация:</h2>
      <div class="tech-info">
        <p><strong>Исходное состояние:</strong> transform: translateX(-100%)</p>
        <p><strong>При наведении:</strong> transform: translateX(0)</p>
        <p><strong>При отведении:</strong> transform: translateX(-100%)</p>
        <p><strong>Transition:</strong> transform 0.3s ease-out</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Простой компонент для демонстрации исправленного эффекта
</script>

<style scoped>
.test-container {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  margin-top: 40px;
}

.test-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.instructions {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  text-align: left;
}

.instructions p {
  color: var(--text-secondary);
  margin: 10px 0;
  font-size: 16px;
}

.tech-info {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  text-align: left;
}

.tech-info p {
  color: var(--text-secondary);
  margin: 8px 0;
  font-size: 14px;
  font-family: monospace;
}

/* Стили тегов - копируем из ArticleCard */
.tag {
  position: relative;
  border: 2px solid #FFFFFF;
  background-color: transparent;
  width: 160px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  overflow: hidden;

  /* Псевдоэлемент для эффекта заполнения */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    transform: translateX(-100%);
    transition: transform 0.3s ease-out;
    z-index: -1;
  }

  /* Текст поверх псевдоэлемента */
  span {
    position: relative;
    z-index: 2;
    transition: color 0.2s ease;
  }

  /* Эффект при наведении */
  &:hover {
    color: #000000;
    
    &::before {
      transform: translateX(0);
    }
  }

  /* Эффект при клике */
  &:active {
    &::before {
      background-color: var(--btn-primary);
    }
    color: var(--text-primary);
  }

  /* Фокус */
  &:focus {
    outline: none;
    border: 2px solid var(--btn-primary);
  }

  /* Отключенное состояние */
  &:disabled {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    cursor: not-allowed;
    
    &::before {
      display: none;
    }
  }
}
</style>
