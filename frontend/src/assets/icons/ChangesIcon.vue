<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 29 13" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M1.2688 6.50002H8.45838M20.5538 6.50002H27.7434M19.3334 6.50002C19.3334 9.1694 17.1694 11.3334 14.5 11.3334C11.8307 11.3334 9.66672 9.1694 9.66672 6.50002C9.66672 3.83064 11.8307 1.66669 14.5 1.66669C17.1694 1.66669 19.3334 3.83064 19.3334 6.50002Z" 
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
  height: 13,
  color: 'var(--ico-color)',
  className: ''
})
</script>
