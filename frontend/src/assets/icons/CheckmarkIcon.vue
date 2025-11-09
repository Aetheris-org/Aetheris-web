<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 23 17" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M21.1666 1.31439L7.87498 15.5132L1.83331 9.0592" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  height?: number
  color?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  width: 23,
  height: 17,
  color: 'var(--ico-color)',
  className: ''
})
</script>
