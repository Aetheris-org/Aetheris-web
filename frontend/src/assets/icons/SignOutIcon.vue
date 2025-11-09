<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 25 26" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M8.875 24.9376H4.04167C3.40073 24.9376 2.78604 24.6656 2.33283 24.1815C1.87961 23.6973 1.625 23.0407 1.625 22.356V4.28476C1.625 3.60008 1.87961 2.94343 2.33283 2.45929C2.78604 1.97514 3.40073 1.70316 4.04167 1.70316H8.875M17.3333 19.7744L23.375 13.3204M23.375 13.3204L17.3333 6.86636M23.375 13.3204H8.875" 
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
  width: 25,
  height: 26,
  color: '#FF3B3B',
  className: ''
})
</script>
