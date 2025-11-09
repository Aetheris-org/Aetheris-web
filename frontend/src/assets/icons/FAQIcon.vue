<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 29 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M14.5 9.66669V14.5M14.5 19.3334H14.512M9.49746 2.41669H19.5025L26.5833 9.49752V19.5025L19.5025 26.5834H9.49746L2.41663 19.5025V9.49752L9.49746 2.41669Z" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  color?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 29,
  color: 'var(--ico-color)',
  className: ''
})
</script>
