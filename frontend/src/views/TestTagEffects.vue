<template>
  <div class="test-container">
    <h1>Тест эффектов тегов</h1>
    
    <div class="test-section">
      <h2>Обычные теги с эффектом заполнения:</h2>
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
      <h2>Теги в разных состояниях:</h2>
      <div class="tags-container">
        <button class="tag">
          <span>Обычный</span>
        </button>
        <button class="tag" disabled>
          <span>Отключенный</span>
        </button>
        <button class="tag" style="border-color: var(--btn-primary);">
          <span>С фокусом</span>
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>Длинные теги:</h2>
      <div class="tags-container">
        <button class="tag">
          <span>Очень длинный тег</span>
        </button>
        <button class="tag">
          <span>Web Development</span>
        </button>
        <button class="tag">
          <span>Machine Learning</span>
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>Сравнение эффектов:</h2>
      <div class="comparison">
        <div class="comparison-item">
          <h3>Старый эффект (мгновенный):</h3>
          <button class="tag-old">
            <span>Старый стиль</span>
          </button>
        </div>
        <div class="comparison-item">
          <h3>Новый эффект (заполнение + выход):</h3>
          <button class="tag">
            <span>Новый стиль</span>
          </button>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>Инструкция по тестированию:</h2>
      <div class="instructions">
        <p>1. Наведите курсор на тег - фон заполнится слева направо</p>
        <p>2. Отведите курсор - фон плавно уйдет вправо</p>
        <p>3. Попробуйте с разными тегами</p>
        <p>4. Чистый эффект без лагов!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Простой компонент для демонстрации эффектов
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

h3 {
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 18px;
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

.comparison {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: flex-start;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* Новый стиль с эффектом заполнения */
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
  z-index: 1;

  // Псевдоэлемент для эффекта заполнения
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
  }

  // Текст должен быть поверх псевдоэлемента
  span {
    position: relative;
    z-index: 2;
    transition: color 0.3s ease;
  }

  &:hover {
    color: #000000;
    
    &::before {
      left: 0;
    }
  }

  &:active {
    &::before {
      background-color: var(--btn-primary);
    }
    color: var(--text-primary);
  }

  &:focus {
    outline: none;
    border: 2px solid var(--btn-primary);
  }

  &:disabled {
    background-color: var(--btn-primary);
    color: var(--text-primary);
    cursor: not-allowed;
    
    &::before {
      display: none;
    }
  }
}

/* Старый стиль для сравнения */
.tag-old {
  border: 2px solid #FFFFFF;
  background-color: transparent;
  width: 160px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--text-primary);
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  span {
    transition: color 0.2s ease-in-out;
  }

  &:hover {
    background-color: #FFFFFF;
    color: #000000;
  }
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
</style>
