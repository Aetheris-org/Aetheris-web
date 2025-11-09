<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 27 27" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M13.5 6.94345C13.5 5.57408 12.9908 4.2608 12.0844 3.29251C11.1779 2.32422 9.94855 1.78024 8.66667 1.78024H1.41667V21.1423H9.87501C10.8364 21.1423 11.7584 21.5503 12.4383 22.2765C13.1181 23.0027 13.5 23.9876 13.5 25.0147M13.5 6.94345V25.0147M13.5 6.94345C13.5 5.57408 14.0092 4.2608 14.9157 3.29251C15.8221 2.32422 17.0515 1.78024 18.3333 1.78024H25.5833V21.1423H17.125C16.1636 21.1423 15.2416 21.5503 14.5617 22.2765C13.8819 23.0027 13.5 23.9876 13.5 25.0147" 
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
  size: 27,
  color: 'var(--ico-color)',
  className: ''
})
</script>
