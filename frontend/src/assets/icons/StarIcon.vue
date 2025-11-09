<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 26 27" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M7.45835 7.57529H7.47044M23.8796 15.8493L15.2159 25.1044C14.9914 25.3444 14.7249 25.5348 14.4315 25.6647C14.1381 25.7947 13.8236 25.8615 13.5061 25.8615C13.1885 25.8615 12.874 25.7947 12.5806 25.6647C12.2872 25.5348 12.0207 25.3444 11.7963 25.1044L1.41669 14.0293V1.12128H13.5L23.8796 12.2093C24.3297 12.693 24.5824 13.3473 24.5824 14.0293C24.5824 14.7113 24.3297 15.3656 23.8796 15.8493Z" 
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
  width: 26,
  height: 27,
  color: 'var(--ico-color)',
  className: ''
})
</script>
