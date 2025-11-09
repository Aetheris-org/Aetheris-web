<template>
  <div>
    <h1 class="development-text">{{ $t('common.in_development') }}</h1>
  </div>
  
  <!-- <div class="news-container">
    <!-- News Header -->
    <!-- <div class="news-header">
      <h1 class="news-title">News</h1>
      <p class="news-subtitle">Latest updates from Aetheris Community</p>
    </div>
    
    <!-- News Content -->
    <!-- <div class="news-content">
      <div class="news-list">
        <!-- Sample news items -->
        <!-- <div class="news-item">
          <div class="news-image">
            <div class="news-image-placeholder"></div>
          </div>
          <div class="news-content-text">
            <h3 class="news-item-title">Community Update: New Features Released</h3>
            <p class="news-item-description">
              We're excited to announce the release of several new features including improved article management, 
              enhanced user profiles, and better notification system. These updates will make your experience 
              on Aetheris Community even better.
            </p>
            <div class="news-meta">
              <span class="news-author">Aetheris Team</span>
              <span class="news-date">December 15, 2024</span>
            </div>
          </div>
        </div>
        
        <div class="news-item">
          <div class="news-image">
            <div class="news-image-placeholder"></div>
          </div>
          <div class="news-content-text">
            <h3 class="news-item-title">Monthly Community Highlights</h3>
            <p class="news-item-description">
              This month we've seen incredible growth in our community with over 100 new articles published 
              and thousands of interactions. Thank you to all our contributors for making this community amazing!
            </p>
            <div class="news-meta">
              <span class="news-author">Community Manager</span>
              <span class="news-date">December 10, 2024</span>
            </div>
          </div>
        </div>
        
        <div class="news-item">
          <div class="news-image">
            <div class="news-image-placeholder"></div>
          </div>
          <div class="news-content-text">
            <h3 class="news-item-title">Welcome New Members</h3>
            <p class="news-item-description">
              A warm welcome to all our new community members! We're thrilled to have you join our growing 
              community of developers, researchers, and tech enthusiasts.
            </p>
            <div class="news-meta">
              <span class="news-author">Aetheris Team</span>
              <span class="news-date">December 5, 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.development-text {
  color: var(--text-secondary);
  font-size: 30px;
  font-family: var(--font-sans);
  margin-top: 350px;
  margin-bottom: 650px;
  text-align: center;
  font-weight: bold;
}

/* .news-container {
  max-width: 1920px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  min-height: 100vh;
  padding: 40px 180px;
}

/* News Header */
/* .news-header {
  margin-bottom: 40px;
}

.news-title {
  font-family: var(--font-sans);
  font-size: 48px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.news-subtitle {
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

/* News Content */
/* .news-content {
  width: 100%;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.news-item {
  display: flex;
  gap: 24px;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--text-secondary);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.news-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.news-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
}

.news-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--btn-primary);
  border-radius: 8px;
}

.news-content-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-item-title {
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.news-item-description {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--text-secondary);
}

.news-author {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-third);
}

.news-date {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-third);
} */
</style>