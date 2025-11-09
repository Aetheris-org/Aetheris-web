<template>
  <h1 class="component-title">{{ msg }}</h1>

  <div class="demo-card">
    <button 
      type="button" 
      @click="incrementCount"
      class="demo-button"
    >
      count is {{ count }}
    </button>
    <p class="demo-text">
      Edit
      <code class="code-snippet">components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p class="demo-text">
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" class="demo-link">
      create-vue
    </a>, the official Vue + Vite starter
  </p>
  <p class="demo-text">
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      class="demo-link"
    >
      Vue Docs Scaling up Guide
    </a>.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const count = ref(0)

const incrementCount = () => {
  count.value++
}
</script>

<style lang="scss" scoped>
.component-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.demo-card {
  background: var(--bg-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border);
  margin-bottom: 1rem;
}

.demo-button {
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-bottom: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
}

.demo-text {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.code-snippet {
  background: var(--bg-secondary);
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: var(--text-primary);
}

.demo-link {
  color: var(--accent);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.read-the-docs {
  color: var(--text-secondary);
  font-style: italic;
}
</style>
