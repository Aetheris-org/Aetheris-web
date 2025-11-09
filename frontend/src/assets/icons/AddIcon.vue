<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 38 38" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M19 7.91666V30.0833M7.91663 19H30.0833" 
      :stroke="color" 
      stroke-width="3" 
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
  size: 38,
  color: 'var(--ico-color)',
  className: ''
})
</script>
