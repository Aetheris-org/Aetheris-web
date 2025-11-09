<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 23 28" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M1.83333 17.9019C1.83333 17.9019 3.04166 16.6111 6.66666 16.6111C10.2917 16.6111 12.7083 19.1927 16.3333 19.1927C19.9583 19.1927 21.1667 17.9019 21.1667 17.9019V2.41226C21.1667 2.41226 19.9583 3.70306 16.3333 3.70306C12.7083 3.70306 10.2917 1.12146 6.66666 1.12146C3.04166 1.12146 1.83333 2.41226 1.83333 2.41226V17.9019ZM1.83333 17.9019V26.9375" 
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
  height: 28,
  color: 'var(--ico-color)',
  className: ''
})
</script>
