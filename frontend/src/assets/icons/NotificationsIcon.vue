<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 25 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path 
      d="M14.5904 26.2785C14.378 26.6697 14.0731 26.9945 13.7062 27.2202C13.3393 27.4459 12.9234 27.5648 12.5 27.5648C12.0766 27.5648 11.6607 27.4459 11.2938 27.2202C10.9269 26.9945 10.622 26.6697 10.4096 26.2785M19.75 9.49811C19.75 7.44406 18.9862 5.47413 17.6265 4.0217C16.2669 2.56926 14.4228 1.7533 12.5 1.7533C10.5772 1.7533 8.73312 2.56926 7.37348 4.0217C6.01384 5.47413 5.25 7.44406 5.25 9.49811C5.25 18.5337 1.625 21.1153 1.625 21.1153H23.375C23.375 21.1153 19.75 18.5337 19.75 9.49811Z" 
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
  width: 25,
  height: 29,
  color: 'var(--ico-color)',
  className: ''
})
</script>
