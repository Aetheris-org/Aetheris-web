<template>
  <div 
    class="notification-item" 
    :class="{ 'unread': !notification.is_read }"
    @click="handleClick"
  >
    <!-- Левая полоса для непрочитанных -->
    <div v-if="!notification.is_read" class="unread-bar"></div>
    
    <!-- Иконка уведомления -->
    <div class="notification-icon">
      <div class="icon-circle" :class="getIconClass()">
        <svg v-if="notification.type === 'comment_reply'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="notification.type === 'article_comment'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16l4-4h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
        <svg v-else-if="notification.type === 'article_like_threshold'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
        <svg v-else-if="notification.type === 'daily_summary'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M3 3h18v18H3zM21 9H3M21 15H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <!-- Контент уведомления -->
    <div class="notification-content">
      <div class="notification-header">
        <h3 class="notification-title">{{ notification.title }}</h3>
        <div v-if="!notification.is_read" class="unread-badge">NEW</div>
      </div>
      
      <p class="notification-message">{{ notification.message }}</p>
      
      <div class="notification-footer">
        <span class="notification-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ formatTime(notification.created_at) }}
        </span>
        <button 
          v-if="!notification.is_read" 
          @click.stop="handleMarkAsRead"
          class="mark-read-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Отметить прочитанным
        </button>
      </div>
    </div>

    <!-- Стрелка для перехода -->
    <div class="notification-arrow">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { type Notification } from '@/api/notifications'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()
const router = useRouter()

const emit = defineEmits<{
  markAsRead: [id: number]
  navigate: [id: number]
}>()

const handleClick = () => {
  console.log('Notification clicked:', props.notification)
  console.log('Related article ID:', props.notification.related_article_id)
  console.log('Related comment ID:', props.notification.related_comment_id)
  
  // Если есть связанная статья, переходим к ней
  if (props.notification.related_article_id) {
    const articlePath = `/article/${props.notification.related_article_id}`
    const fullPath = props.notification.related_comment_id 
      ? `${articlePath}#comment-${props.notification.related_comment_id}`
      : articlePath
    
    console.log('Navigating to:', fullPath)
    
    // Переходим к статье с якорем на комментарий, если есть
    router.push(fullPath)
    
    // Уведомляем родительский компонент о навигации
    emit('navigate', props.notification.id)
  } else {
    console.log('No related article ID found')
  }
}

const handleMarkAsRead = () => {
  emit('markAsRead', props.notification.id)
}

       const getIconClass = () => {
         switch (props.notification.type) {
           case 'comment_reply':
             return 'icon-reply'
           case 'article_comment':
             return 'icon-comment'
           case 'article_like_threshold':
             return 'icon-like'
           case 'daily_summary':
             return 'icon-summary'
           case 'weekly_summary':
             return 'icon-summary'
           default:
             return 'icon-default'
         }
       }

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'только что'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} ч назад`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} дн назад`
  }
}
</script>

<style scoped lang="scss">
.notification-item {
  display: flex;
  gap: 20px;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: 16px;
  padding: 24px;
  width: 100%;
  min-height: 120px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, transparent, transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: var(--text-third);
    
    &::before {
      opacity: 0;
    }

    .notification-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.unread {
    background-color: var(--btn-primary);
    border-color: var(--text-third);
    opacity: 0.98;
  }
}

.unread-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: var(--text-secondary);
  border-radius: 16px 0 0 16px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  svg {
    position: relative;
    z-index: 1;
  }
}

.icon-reply {
  background: var(--btn-primary);
}

.icon-comment {
  background: var(--btn-primary);
}

       .icon-like {
  background: var(--btn-primary);
       }

       .icon-summary {
  background: var(--btn-primary);
       }

       .icon-default {
  background: var(--btn-primary);
       }

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.notification-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  font-family: var(--font-sans);
  letter-spacing: -0.01em;
}

.unread-badge {
  background: var(--text-secondary);
  color: var(--bg-primary);
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  font-family: var(--font-sans);
}

.notification-message {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
  font-family: var(--font-sans);
  font-weight: 500;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  gap: 16px;
  flex-wrap: wrap;
}

.notification-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-third);
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
  font-family: var(--font-sans);

  svg {
    opacity: 0.7;
  }
}

.mark-read-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid var(--text-secondary);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-sans);
  letter-spacing: 0.02em;

  &:hover {
    background: var(--text-secondary);
    color: var(--bg-secondary);
    border-color: var(--text-secondary);
  }

  svg {
    transition: transform 0.2s ease;
  }
}

.notification-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-third);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  margin-left: -10px;

  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .notification-item {
    padding: 20px;
    min-height: 110px;
  }
  
  .icon-circle {
    width: 52px;
    height: 52px;
  }
  
  .notification-title {
    font-size: 17px;
  }
  
  .notification-message {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .notification-item {
    padding: 16px;
    min-height: 100px;
    gap: 16px;
  }
  
  .icon-circle {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
  
  .notification-title {
    font-size: 16px;
  }
  
  .notification-message {
    font-size: 14px;
  }
  
  .notification-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .mark-read-btn {
    width: 100%;
    justify-content: center;
  }

  .notification-arrow {
    display: none;
  }
}

@media (max-width: 480px) {
  .notification-item {
    padding: 14px;
    gap: 12px;
  }

  .icon-circle {
    width: 44px;
    height: 44px;
  }

  .notification-title {
    font-size: 15px;
  }

  .notification-message {
    font-size: 13px;
  }
}
</style>
