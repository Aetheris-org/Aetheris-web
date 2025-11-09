<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 27 27" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M9.98371 9.87502C10.2678 9.06745 10.8285 8.38648 11.5666 7.95272C12.3046 7.51896 13.1724 7.3604 14.0161 7.50513C14.8599 7.64986 15.6252 8.08853 16.1765 8.74345C16.7278 9.39837 17.0296 10.2273 17.0283 11.0834C17.0283 13.5 13.4033 14.7084 13.4033 14.7084M13.5 19.5417H13.512M25.5833 13.5C25.5833 20.1735 20.1734 25.5834 13.5 25.5834C6.82652 25.5834 1.41663 20.1735 1.41663 13.5C1.41663 6.82658 6.82652 1.41669 13.5 1.41669C20.1734 1.41669 25.5833 6.82658 25.5833 13.5Z" 
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
  size: 27,
  color: 'var(--ico-color)',
  className: ''
})
</script>
