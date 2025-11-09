<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 25 15" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M2.25 2.375L12.5 12.625L22.75 2.375" 
      :stroke="color" 
      stroke-width="3" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      style="transition: stroke 0.5s ease-in-out;"
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
  height: 15,
  color: 'var(--ico-color)',
  className: ''
})
</script>
