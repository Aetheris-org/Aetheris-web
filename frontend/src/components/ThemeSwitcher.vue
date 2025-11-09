<template>
  <div class="theme-switcher">
    <div class="theme-controls">
      <span class="theme-label">Тема:</span>
      <div class="theme-buttons">
        <button
          v-for="theme in availableThemes"
          :key="theme"
          @click="setTheme(theme)"
          :class="[
            'theme-button',
            currentTheme === theme ? 'theme-button--active' : ''
          ]"
        >
          {{ getThemeLabel(theme) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { setTheme, getAvailableThemes, getCurrentTheme, currentTheme } = useTheme()

const availableThemes = getAvailableThemes()

const getThemeLabel = (theme: string) => {
  const labels: Record<string, string> = {
    light: 'Светлая',
    dark: 'Темная',
    custom: 'Кастомная'
  }
  return labels[theme] || theme
}
</script>

<style lang="scss" scoped>
.theme-switcher {
  .theme-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .theme-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .theme-buttons {
      display: flex;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
      padding: 0.25rem;
      
      .theme-button {
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        
        &:hover {
          color: var(--text-primary);
          background: var(--bg-primary);
        }
        
        &--active {
          background: var(--accent);
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
