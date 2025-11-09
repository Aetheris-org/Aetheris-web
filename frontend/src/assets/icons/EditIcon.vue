<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 27 28" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M19.5417 2.44482C19.859 2.1058 20.2358 1.83688 20.6505 1.6534C21.0651 1.46992 21.5095 1.37549 21.9584 1.37549C22.4072 1.37549 22.8516 1.46992 23.2662 1.6534C23.6809 1.83688 24.0577 2.1058 24.375 2.44482C24.6924 2.78384 24.9441 3.18632 25.1159 3.62927C25.2876 4.07223 25.376 4.54698 25.376 5.02643C25.376 5.50588 25.2876 5.98063 25.1159 6.42358C24.9441 6.86653 24.6924 7.26901 24.375 7.60803L8.06252 25.0339L1.41669 26.9701L3.22919 19.8706L19.5417 2.44482Z" 
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
  height: 28,
  color: 'var(--ico-color)',
  className: ''
})
</script>
