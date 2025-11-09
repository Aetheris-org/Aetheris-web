<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 17 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M8.5 22.1244V9.21637M15.75 22.1244V1.47156M1.25 22.1244V16.9612" 
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
  width: 17,
  height: 24,
  color: 'var(--ico-color)',
  className: ''
})
</script>
