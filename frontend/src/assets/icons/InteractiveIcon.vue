<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 27 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M13.5 27.6735C20.1734 27.6735 25.5833 21.8943 25.5833 14.7654C25.5833 7.63654 20.1734 1.85742 13.5 1.85742C6.82656 1.85742 1.41667 7.63654 1.41667 14.7654C1.41667 21.8943 6.82656 27.6735 13.5 27.6735Z" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
    <path 
      d="M18.6233 9.29244L16.0617 17.5019L8.37667 20.2384L10.9383 12.0289L18.6233 9.29244Z" 
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
  width: 27,
  height: 29,
  color: 'var(--ico-color)',
  className: ''
})
</script>
