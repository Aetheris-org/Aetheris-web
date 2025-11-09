<template>
  <div class="test-container">
    <h1>ФИНАЛЬНЫЙ ТЕСТ ЭФФЕКТА ТЕГОВ</h1>
    
    <div class="test-section">
      <h2>Тестируем кубик:</h2>
      <div class="tags-container">
        <button 
          v-for="(tag, index) in tags" 
          :key="index"
          class="tag"
          :class="{ 'tag-hovered': hoveredTags.includes(index) }"
          @mouseenter="onTagHover(index)"
          @mouseleave="onTagLeave(index)"
        >
          <span>{{ tag }}</span>
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>Что должно происходить:</h2>
      <div class="instructions">
        <p>1. Наведите курсор - КУБИК ВХОДИТ СЛЕВА</p>
        <p>2. Отведите курсор - КУБИК УХОДИТ ВПРАВО</p>
        <p>3. Если не работает - значит проблема в CSS</p>
      </div>
    </div>

    <div class="test-section">
      <h2>Состояние тегов:</h2>
      <div class="state-info">
        <p>Наведенные теги: {{ hoveredTags.join(', ') || 'Нет' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tags = ['Vue.js', 'TypeScript', 'Frontend', 'React', 'JavaScript']
const hoveredTags = ref<number[]>([])

const onTagHover = (index: number) => {
  hoveredTags.value.push(index)
}

const onTagLeave = (index: number) => {
  hoveredTags.value = hoveredTags.value.filter((i: number) => i !== index)
}
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
  font-size: 32px;
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
  font-weight: bold;
}

.state-info {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  text-align: center;
}

.state-info p {
  color: var(--text-primary);
  margin: 0;
  font-size: 16px;
}

/* Копируем стили из ArticleCard */
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

  /* Псевдоэлемент для эффекта */
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

  /* Текст поверх псевдоэлемента */
  span {
    position: relative;
    z-index: 2;
    transition: color 0.3s ease;
  }

  /* Эффект при наведении - кубик входит слева */
  &.tag-hovered {
    color: #000000;
    
    &::before {
      left: 0;
    }
  }

  /* Эффект при отведении - кубик уходит вправо */
  &:not(.tag-hovered) {
    &::before {
      left: 100%;
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