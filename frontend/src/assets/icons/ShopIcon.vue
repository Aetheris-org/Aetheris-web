<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 27 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M23.1667 14.4272V27.3352H3.83335V14.4272M13.5 27.3352V7.97317M13.5 7.97317H8.06252C7.26135 7.97317 6.49298 7.63319 5.92647 7.02801C5.35995 6.42283 5.04169 5.60202 5.04169 4.74617C5.04169 3.89031 5.35995 3.06951 5.92647 2.46433C6.49298 1.85915 7.26135 1.51917 8.06252 1.51917C12.2917 1.51917 13.5 7.97317 13.5 7.97317ZM13.5 7.97317H18.9375C19.7387 7.97317 20.5071 7.63319 21.0736 7.02801C21.6401 6.42283 21.9584 5.60202 21.9584 4.74617C21.9584 3.89031 21.6401 3.06951 21.0736 2.46433C20.5071 1.85915 19.7387 1.51917 18.9375 1.51917C14.7084 1.51917 13.5 7.97317 13.5 7.97317ZM1.41669 7.97317H25.5834V14.4272H1.41669V7.97317Z" 
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
  height: 29,
  color: 'var(--ico-color)',
  className: ''
})
</script>
