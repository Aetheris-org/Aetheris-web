<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 27 26" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M18.3333 24.7506V4.09781C18.3333 3.41312 18.0787 2.75648 17.6255 2.27234C17.1723 1.78819 16.5576 1.5162 15.9167 1.5162H11.0833C10.4424 1.5162 9.82771 1.78819 9.3745 2.27234C8.92128 2.75648 8.66667 3.41312 8.66667 4.09781V24.7506M3.83334 6.67941H23.1667C24.5014 6.67941 25.5833 7.83524 25.5833 9.26102V22.169C25.5833 23.5948 24.5014 24.7506 23.1667 24.7506H3.83334C2.49865 24.7506 1.41667 23.5948 1.41667 22.169V9.26102C1.41667 7.83524 2.49865 6.67941 3.83334 6.67941Z" 
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
  height: 26,
  color: 'var(--ico-color)',
  className: ''
})
</script>
