<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 30 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M15.0013 28.3333C22.3651 28.3333 28.3346 22.3638 28.3346 15C28.3346 7.63619 22.3651 1.66666 15.0013 1.66666C7.63751 1.66666 1.66797 7.63619 1.66797 15C1.66797 22.3638 7.63751 28.3333 15.0013 28.3333Z" 
      :stroke="color" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
    <path 
      d="M20.6546 9.34666L17.828 17.8267L9.34797 20.6533L12.1746 12.1733L20.6546 9.34666Z" 
      :stroke="color" 
      stroke-width="2" 
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
  size: 30,
  color: 'var(--ico-color)',
  className: ''
})
</script>
