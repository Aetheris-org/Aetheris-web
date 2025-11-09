<template>
  <div class="admin-layout">
    <aside ref="sidebarRef" class="admin-sidebar">
      <div class="admin-sidebar-header">Admin panel</div>
      <router-link to="/admin/articles" class="admin-link" :class="{ active: isActive('/admin/articles') }">Articles</router-link>
      <router-link to="/admin/comments" class="admin-link" :class="{ active: isActive('/admin/comments') }">Comments</router-link>
      <router-link to="/admin/profiles" class="admin-link" :class="{ active: isActive('/admin/profiles') }">Profiles</router-link>
    </aside>
    <main class="admin-content">
      <div class="admin-content-inner">
        <div class="admin-right-column">
          <router-view />
        </div>
      </div>
    </main>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarRef = ref<HTMLElement | null>(null)
let rafId: number | null = null

function isActive(path: string) {
  return route.path.startsWith(path)
}

// Управление sticky позиционированием боковой панели при приближении к футеру
const updateSidebarSticky = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    if (!sidebarRef.value) return
    
    const sidebar = sidebarRef.value
    const footer = document.querySelector('.footer-wrapper') as HTMLElement
    
    if (!footer) {
      // Если футера нет, просто делаем sticky с отступом от хедера
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${headerHeight + 20}px`
      sidebar.style.bottom = 'auto'
      return
    }
    
    const footerRect = footer.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const footerTop = footerRect.top
    
    // Получаем высоту хедера из CSS переменной
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
    
    // Константы
    const footerGap = 20
    const minTopOffset = headerHeight + 20 // Учитываем высоту хедера
    
    // Если футер еще не достиг viewport
    if (footerTop > windowHeight) {
      // Обычный sticky без ограничений, но с учетом хедера
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = 'auto'
      return
    }
    
    // Футер достиг viewport - устанавливаем bottom чтобы sidebar упирался в футер с отступом
    if (footerTop < windowHeight) {
      const bottomOffset = windowHeight - footerTop + footerGap
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = `${bottomOffset}px`
    } else {
      // Футер еще далеко - обычный sticky
      sidebar.style.position = 'sticky'
      sidebar.style.top = `${minTopOffset}px`
      sidebar.style.bottom = 'auto'
    }
  })
}

onMounted(async () => {
  // Инициализируем позицию sidebar
  await nextTick()
  setTimeout(() => {
    updateSidebarSticky()
  }, 100)
  
  window.addEventListener('scroll', updateSidebarSticky, { passive: true })
  
  // Слушаем изменения высоты хедера
  window.addEventListener('header:heightChanged', updateSidebarSticky)
})

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  window.removeEventListener('scroll', updateSidebarSticky)
  window.removeEventListener('header:heightChanged', updateSidebarSticky)
})
</script>

<style lang="scss" scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  padding: 0 0 40px 0; /* space from footer only */
  width: 100%;
}

.admin-sidebar {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  height: fit-content;
  min-height: 300px;
  flex-direction: column;
  gap: 8px;
  align-self: start; /* Выравниваем по верхнему краю контента */
  transition: top 0.3s ease-out, bottom 0.3s ease-out; /* Плавное изменение позиции */
  will-change: top, bottom; /* Оптимизация для анимации */
}

.admin-sidebar-header {
  font-weight: bold;
  font-size: 23px;
  font-family: var(--font-sans);
  margin-bottom: 8px;
}

.admin-link {
  display: block;
  padding: 12px 14px;
  border-radius: 12px;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: bold;
  font-family: var(--font-sans);
  font-size: 20px;
}

.admin-link:hover { background: rgba(67,73,86,1); }
.admin-link.active { background: var(--btn-primary); }

.admin-content {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 130px 0 0 0; /* space from header */
  width: 100%;
  display: flex;
}

.admin-content-inner {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: var(--font-sans);
}

.admin-right-column {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>


