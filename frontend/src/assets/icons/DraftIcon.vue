<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 29 27" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M25.375 8.26669V25.0471H3.62498V8.26669M12.0833 13.4299H16.9166M1.20831 1.81268H27.7916V8.26669H1.20831V1.81268Z" 
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
  width: 29,
  height: 27,
  color: 'var(--ico-color)',
  className: ''
})
</script>
