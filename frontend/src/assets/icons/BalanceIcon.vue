<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 29 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <!-- Balance/Coin icon -->
    <circle 
      cx="14.5" 
      cy="14.5" 
      r="12" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
    <path 
      d="M14.5 6.5V22.5M10.5 10.5H18.5M10.5 18.5H18.5" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
    <circle 
      cx="14.5" 
      cy="14.5" 
      r="3" 
      :stroke="color" 
      stroke-width="1.5" 
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
