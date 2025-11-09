<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 23 26" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M21.1666 24.9105V22.3289C21.1666 20.9595 20.6574 19.6463 19.751 18.678C18.8446 17.7097 17.6152 17.1657 16.3333 17.1657H6.66665C5.38477 17.1657 4.15539 17.7097 3.24896 18.678C2.34254 19.6463 1.83331 20.9595 1.83331 22.3289V24.9105M16.3333 6.83929C16.3333 9.69085 14.1694 12.0025 11.5 12.0025C8.8306 12.0025 6.66665 9.69085 6.66665 6.83929C6.66665 3.98773 8.8306 1.67609 11.5 1.67609C14.1694 1.67609 16.3333 3.98773 16.3333 6.83929Z" 
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
  height: 26,
  color: 'var(--ico-color)',
  className: ''
})
</script>
