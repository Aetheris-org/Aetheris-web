<template>
  <div class="editor-icons">
    <!-- Eraser Icon -->
    <svg v-if="type === 'eraser'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2L34 18L18 34L2 18L18 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12L24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Italic Icon -->
    <svg v-else-if="type === 'italic'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6H22M18 6V30M14 30H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Bold Icon -->
    <svg v-else-if="type === 'bold'" class="icon" width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6H18C20.2091 6 22 7.79086 22 10C22 12.2091 20.2091 14 18 14H6V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 14H20C22.2091 14 24 15.7909 24 18C24 20.2091 22.2091 22 20 22H6V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 22H18C20.2091 22 22 23.7909 22 26C22 28.2091 20.2091 30 18 30H6V22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Left Align Icon -->
    <svg v-else-if="type === 'left-align'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8H30M6 14H24M6 20H30M6 26H24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Center Align Icon -->
    <svg v-else-if="type === 'center-align'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8H30M9 14H27M6 20H30M9 26H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Right Align Icon -->
    <svg v-else-if="type === 'right-align'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8H30M12 14H30M6 20H30M12 26H30" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Link Icon -->
    <svg v-else-if="type === 'link'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13C10 13 10 9 14 9C18 9 18 13 18 13M18 23C18 23 18 27 14 27C10 27 10 23 10 23M14 9C14 9 22 9 22 13C22 17 14 17 14 17M14 27C14 27 22 27 22 23C22 19 14 19 14 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Code Icon -->
    <svg v-else-if="type === 'code'" class="icon" width="50" height="33" viewBox="0 0 50 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L6 16.5L20 27M30 6L44 16.5L30 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Image Icon -->
    <svg v-else-if="type === 'image'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="24" height="24" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 22L20 16L14 22L6 14V28H30V22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Hide Icon -->
    <svg v-else-if="type === 'hide'" class="icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6C24 6 30 12 30 18C30 24 24 30 18 30C12 30 6 24 6 18C6 12 12 6 18 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12L24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- File Icon -->
    <svg v-else-if="type === 'file'" class="icon" width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2H24L32 10V38H2V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 2V10H32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Book Icon -->
    <svg v-else-if="type === 'book'" class="icon" width="40" height="35" viewBox="0 0 40 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2H36V32H4V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 2V32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36 2V32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Zoom Icon -->
    <svg v-else-if="type === 'zoom'" class="icon" width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 25L33 33" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Edit Icon -->
    <svg v-else-if="type === 'edit'" class="icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C2.89543 4 2 4.89543 2 6V26C2 27.1046 2.89543 28 4 28H24C25.1046 28 26 27.1046 26 26V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.5 2.5C18.5 2.5 21.5 5.5 21.5 5.5C21.5 5.5 8.5 18.5 8.5 18.5C8.5 18.5 5.5 15.5 5.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.5 5.5L24.5 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Eye Icon -->
    <svg v-else-if="type === 'eye'" class="icon" width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12.5C1 12.5 7 2.5 17.5 2.5C28 2.5 34 12.5 34 12.5C34 12.5 28 22.5 17.5 22.5C7 22.5 1 12.5 1 12.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="17.5" cy="12.5" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Archive Icon -->
    <svg v-else-if="type === 'archive'" class="icon" width="34" height="30" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8H32V26C32 27.1046 31.1046 28 30 28H4C2.89543 28 2 27.1046 2 26V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 8L4 2H30L32 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 18H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'eraser' | 'italic' | 'bold' | 'left-align' | 'center-align' | 'right-align' | 'link' | 'code' | 'image' | 'hide' | 'file' | 'book' | 'zoom' | 'edit' | 'eye' | 'archive'
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.editor-icons {
  display: inline-block;
}

.icon {
  color: var(--text-third);
  transition: color 0.3s ease-in-out;
  
  &:hover {
    color: var(--text-primary);
  }
}
</style>
