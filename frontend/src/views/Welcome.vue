<template>
  <div class="home-container">
    <!-- Slide1 -->
    <div data-element="slide1" class="slide1">
      <img src="/logo.svg" alt="Logo" class="slide1-logo">
      <h1 class="slide1-title">Aetheris</h1>
      <h2 class="slide1-subtitle">{{ $t('home.subtitle') }}</h2>
    </div>
    
    <div class="divider"></div>
    
    <!-- Slide2 -->
    <div class="slide2">
      <!-- Background blur effects -->
      <div class="blur-effect blur-1"></div>
      <div class="blur-effect blur-2"></div>
      <div class="blur-effect blur-3"></div>
      <div class="blur-effect blur-4"></div>
      
      <!-- Images -->
      <img src="/src/assets/svgs/slide_img1.png" alt="Slide Image 1" class="slide-img-1">
      
      
      <h1 class="slide2-title slide2-title-1">{{ $t('home.h1') }}</h1>
      <h2 class="slide2-subtitle slide2-subtitle-1">{{ $t('home.subtitle2') }}</h2>
      
      <img src="/src/assets/svgs/slide_img3.png" alt="Slide Image 3" class="slide-img-3">
      
      <h1 class="slide2-title slide2-title-2">{{ $t('home.h2') }}</h1>
      <h2 class="slide2-subtitle slide2-subtitle-2">{{ $t('home.subtitle3') }}</h2>
      
      <!-- Cubes -->
      <img src="/src/assets/svgs/cubes1.png" alt="Cubes 1" class="cubes-1">
      <img src="/src/assets/svgs/cubes2.png" alt="Cubes 2" class="cubes-2">
      
      <img src="/src/assets/imgs/slide_img4.png" alt="Slide Image 4" class="slide-img-4">
      
      <h1 class="slide2-title slide2-title-3">{{ $t('home.h3') }}</h1>
      <h2 class="slide2-subtitle slide2-subtitle-3">{{ $t('home.subtitle4') }}</h2>
      
      <img src="/src/assets/svgs/cubes4.png" alt="Cubes 4" class="cubes-4">
      <img src="/src/assets/svgs/cubes3.png" alt="Cubes 3" class="cubes-3">
      <img src="/src/assets/svgs/cubes5.png" alt="Cubes 5" class="cubes-5">
      <img src="/src/assets/svgs/cubes6.png" alt="Cubes 6" class="cubes-6">
      <img src="/src/assets/svgs/slide_img5.png" alt="Slide Image 5" class="slide-img-5">
      
      <h1 class="slide2-title slide2-title-4">{{ $t('home.h4') }}</h1>
      <h2 class="slide2-subtitle slide2-subtitle-4">{{ $t('home.subtitle5') }}</h2>
      
      <h2 class="slide2-cta">{{ $t('home.h5') }}</h2>
      
      <router-link to="/signin" class="register-link">
        <button class="register-button pulse">
          <p class="register-text">{{ $t('home.register') }}</p>
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>


.home-container {
  width: 100%;
  margin: 0 auto;
  background-color: var(--bg-primary);
  padding: 0;
  box-sizing: border-box;
}


.slide1 {
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
}

.slide1-logo {
  position: absolute;
  width: clamp(300px, 50vw, 1200px);
  height: clamp(310px, 52vw, 1250px);
  top: 0;
  left: 0;
  z-index: 10;
}

.slide1-title {
  font-family: var(--font-sans);
  font-weight: normal;
  font-size: clamp(2rem, 10vw, 8rem);
  margin-left: auto;
  margin-right: clamp(15rem, 25vw, 35rem);
  margin-top: clamp(8rem, 20vw, 15rem);
  color: var(--text-primary);
}

.slide1-subtitle {
  font-family: var(--font-sans);
  font-weight: normal;
  font-size: clamp(1.25rem, 6vw, 5rem);
  text-align: center;
  margin-left: auto;
  margin-right: clamp(6rem, 12vw, 15rem);
  margin-top: clamp(1rem, 2vw, 2rem);
  width: clamp(300px, 70vw, 1200px);
  color: var(--text-primary);
}

.divider {
  height: 4px;
  width: 100%;
  background-color: white;
}

.slide2 {
  background: linear-gradient(180deg, #16181C 0%, #21003d 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 13rem;
  position: relative;
}

.blur-effect {
  width: 1000px;
  filter: blur(900px);
  opacity: 0.1;
  background-color: var(--primary-violet);
  position: absolute;
}

.blur-1 {
  margin-left: 600px;
  margin-top: 100px;
  padding-top: 600px;
}

.blur-2 {
  margin-left: -100px;
  margin-top: 1200px;
  padding-top: 600px;
}

.blur-3 {
  margin-left: 700px;
  margin-top: 2500px;
  padding-top: 700px;
}

.blur-4 {
  margin-left: 10px;
  margin-top: 3500px;
  padding-top: 700px;
}

.slide-img-1,
.slide-img-2,
.slide-img-3,
.slide-img-4,
.slide-img-5,
.cubes-1,
.cubes-2,
.cubes-3,
.cubes-4,
.cubes-5,
.cubes-6 {
  position: absolute;
}


.slide2-title {
  font-family: var(--font-sans);
  font-weight: normal;
  font-size: 50px;
  text-align: center;
  color: var(--text-primary);
}

.slide2-title-1 {
  margin-left: auto;
  margin-right: 150px;
  margin-top: 380px;
  width: 650px;
}

.slide2-title-2 {
  margin-left: auto;
  margin-right: 150px;
  margin-top: 650px;
  width: 650px;
}

.slide2-title-3 {
  margin-left: 160px;
  margin-right: 150px;
  margin-top: 700px;
  width: 650px;
}

.slide2-title-4 {
  margin-left: auto;
  margin-right: 150px;
  margin-top: 800px;
  width: 650px;
}

.slide2-subtitle {
  font-family: var(--font-sans);
  font-weight: normal;
  color: var(--text-secondary);
  font-size: 33px;
  text-align: center;
}

.slide2-subtitle-1 {
  margin-left: auto;
  margin-right: 11rem;
  margin-top: 20px;
  width: 600px;
}

.slide2-subtitle-2 {
  margin-left: auto;
  margin-right: 11rem;
  margin-top: 20px;
  width: 600px;
}

.slide2-subtitle-3 {
  margin-left: 190px;
  margin-right: 11rem;
  margin-top: 20px;
  width: 600px;
}

.slide2-subtitle-4 {
  margin-left: auto;
  margin-right: 11rem;
  margin-top: 20px;
  width: 600px;
}

.slide2-cta {
  font-family: var(--font-sans);
  font-weight: normal;
  color: var(--text-primary);
  font-size: 45px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  margin-top: 470px;
  width: 700px;
}

.register-button {
  width: 370px;
  height: 80px;
  border-radius: 25px;
  background-color: var(--primary-blue);
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  filter: brightness(1);
}

.register-button:hover {
  filter: brightness(0.8);
}

/* Attention pulse animation */
.pulse {
  animation: pulseGlow 2s ease-in-out infinite;
  box-shadow: 0 0 0 rgba(139, 92, 246, 0.7);
}

@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); transform: translateY(0); }
  50% { box-shadow: 0 0 30px 8px rgba(139, 92, 246, 0.35); transform: translateY(-2px); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); transform: translateY(0); }
}

.register-link {
  text-decoration: none;
}

.register-text {
  font-family: var(--font-sans);
  color: var(--text-primary);
  font-size: 33px;
  font-weight: bold;
}

/* ===== Responsive: below 1920px (Full HD and smaller) ===== */
@media (max-width: 1919px) {
  /* Keep layout, scale proportionally using vw based on 1920 reference */
  /* Slide 1 adjustments */
  .slide1 { min-height: 60vw; }
  .slide1-logo { width: 45vw; height: auto; top: 1vw; left: 4vw; z-index: 1; }
  .slide1-title { font-size: clamp(1.6rem, 4.32vw, 4.96rem); margin-right: 27vw; margin-top: 12vw; position: relative; z-index: 2; }
  .slide1-subtitle { font-size: clamp(1rem, 2.6vw, 3.2rem); width: min(76vw, 900px); margin-right: 10vw; position: relative; z-index: 2; }

  .slide2 { padding-bottom: 13vw; }

  .slide2-title { font-size: 2.86vw; }
  .slide2-subtitle { font-size: 1.875vw; }
  .slide2-cta { font-size: 2.60vw; width: 41.67vw; margin-top: 27.08vw; }

  /* Title blocks */
  .slide2-title-1 { margin-right: 7.81vw; margin-top: 19.79vw; width: 33.85vw; }
  .slide2-title-2 { margin-right: 7.81vw; margin-top: 33.85vw; width: 33.85vw; }
  .slide2-title-3 { margin-left: 8.33vw; margin-right: 7.81vw; margin-top: 36.46vw; width: 33.85vw; }
  .slide2-title-4 { margin-right: 7.81vw; margin-top: 41.67vw; width: 33.85vw; }

  /* Subtitle blocks */
  .slide2-subtitle-1 { margin-right: 11rem; margin-top: 1.04vw; width: 31.25vw; }
  .slide2-subtitle-2 { margin-right: 11rem; margin-top: 1.04vw; width: 31.25vw; }
  .slide2-subtitle-3 { margin-left: 9.90vw; margin-right: 11rem; margin-top: 1.04vw; width: 31.25vw; }
  .slide2-subtitle-4 { margin-right: 11rem; margin-top: 1.04vw; width: 31.25vw; }

  /* Images (scaled from Full HD specs) */
  .slide-img-1 { width: 37.50vw; height: 24.48vw; margin-left: 6.25vw; margin-top: 14.32vw; }
  .slide-img-3 { width: 31.25vw; height: 20.83vw; margin-left: 10.42vw; margin-top: 63.54vw; }
  .slide-img-4 { width: 26.04vw; height: 23.44vw; margin-left: 57.29vw; margin-top: 115.63vw; }
  .slide-img-5 { width: 26.04vw; height: 19.79vw; margin-left: 13.02vw; margin-top: 174.48vw; }

  /* Cubes (scaled from Full HD specs) */
  .cubes-1 { width: 26.04vw; height: 26.04vw; margin-left: 14.58vw; margin-top: 47.40vw; }
  .cubes-2 { width: 20.83vw; height: 52.08vw; margin-left: 52.08vw; margin-top: 34.38vw; }
  .cubes-3 { width: 41.67vw; height: 41.67vw; margin-left: 39.06vw; margin-top: 117.71vw; }
  .cubes-4 { width: 20.83vw; height: 20.83vw; margin-left: 5.21vw; margin-top: 107.29vw; }
  .cubes-5 { width: 20.83vw; height: 10.42vw; margin-left: 13.02vw; margin-top: 175.00vw; }
  .cubes-6 { width: 20.83vw; height: 31.25vw; margin-left: 52.08vw; margin-top: 171.88vw; }

  /* Register button */
  .register-button { width: 19.27vw; height: 4.17vw; border-radius: 1.46vw; margin-top: 1.04vw; }
  .register-text { font-size: 1.72vw; }
}

/* ===== Tablets and below ===== */
@media (max-width: 1024px) {
  .slide2 { padding: 8vw 2.5vw 10vw 2.5vw; }
}

/* ===== Mobile ===== */
@media (max-width: 640px) {
  .register-button { height: 9.0vw; }
}

/* Медиа-запросы для больших экранов */

/* Для экранов Full HD (1920x1080) */
@media (min-width: 1920px) and (max-width: 2559px) {
  /* Стили для Full HD экранов */
  
}

/* Для экранов 1440p (2560x1440) */
@media (min-width: 2560px) and (max-width: 3439px) {
  /* Стили для 2K экранов */
  
}

/* Для экранов 4K (3840x2160) */
@media (min-width: 3840px) and (max-width: 5119px) {
  /* Стили для 4K экранов */
  
}

/* Для экранов 5K+ (5120x2880 и выше) */
@media (min-width: 5120px) {
  /* Стили для 5K+ экранов */
  
}

/* Адаптивность для элементов Home */
@media (min-width: 1920px) {
  .slide1-logo {
    width: 900px;
    height: 920px;
  }
  
  .slide1-title {
    font-size: 85px;
    margin-right: 600px;
    margin-top: 250px;
  }
  
  .slide1-subtitle {
    font-size: 55px;
    margin-right: 14rem;
    margin-top: 25px;
    width: 1000px;
  }
  
  .slide2-title {
    font-size: 55px;
  }
  
  .slide2-subtitle {
    font-size: 36px;
  }
  
  .slide2-cta {
    font-size: 50px;
    width: 800px;
    margin-top: 520px;
  }
  
  .register-button {
    width: 420px;
    height: 90px;
    border-radius: 28px;
    margin-top: 25px;
  }
  
  .register-text {
    font-size: 36px;
  }
  
  /* Изображения для Full HD */
  .slide-img-1 {
    width: 720px;
    height: 470px;
    margin-left: 120px;
    margin-top: 275px;
  }

  .slide-img-3 {
    width: 600px;
    height: 400px;
    margin-left: 200px;
    margin-top: 1220px;
  }

  .slide-img-4 {
    width: 500px;
    height: 450px;
    margin-left: 1100px;
    margin-top: 2220px;
  }

  .slide-img-5 {
    width: 500px;
    height: 380px;
    margin-left: 250px;
    margin-top: 3350px;
  }

  /* Кубы для Full HD */
  .cubes-1 {
    width: 500px;
    height: 500px;
    margin-left: 280px;
    margin-top: 910px;
  }

  .cubes-2 {
    width: 400px;
    height: 1000px;
    margin-left: 1000px;
    margin-top: 660px;
  }

  .cubes-3 {
    width: 800px;
    height: 800px;
    margin-left: 750px;
    margin-top: 2260px;
  }

  .cubes-4 {
    width: 400px;
    height: 400px;
    margin-left: 100px;
    margin-top: 2060px;
  }

  .cubes-5 {
    width: 400px;
    height: 200px;
    margin-left: 250px;
    margin-top: 3360px;
  }

  .cubes-6 {
    width: 400px;
    height: 600px;
    margin-left: 1000px;
    margin-top: 3300px;
  }
}

@media (min-width: 2560px) {
  .slide1-logo {
    width: 1100px;
    height: 1270px;
    margin-left: 150px
  }
  
  .slide1-title {
    font-size: 110px;
    margin-right: 750px;
    margin-top: 450px;
  }
  
  .slide1-subtitle {
    font-size: 70px;
    margin-right: 16rem;
    margin-top: 30px;
    width: 1400px;
  }
  
  .slide2-title {
    font-size: 65px;
  }
  
  .slide2-subtitle {
    font-size: 42px;
  }
  
  .slide2-cta {
    font-size: 60px;
    width: 950px;
    margin-top: 620px;
  }
  
  .register-button {
    width: 480px;
    height: 105px;
    border-radius: 32px;
    margin-top: 30px;
  }
  
  .register-text {
    font-size: 42px;
  }
  
  
  /* Позиционирование текста для 2K */
  .slide2-title-1 {
    margin-left: auto;
    margin-right: 200px;
    margin-top: 430px;
    width: 750px;
  }

  .slide2-title-2 {
    margin-left: auto;
    margin-right: 340px;
    margin-top: 750px;
    width: 750px;
  }

  .slide2-title-3 {
    margin-left: 200px;
    margin-right: 200px;
    margin-top: 800px;
    width: 750px;
  }

  .slide2-title-4 {
    margin-left: auto;
    margin-right: 300px;
    margin-top: 900px;
    width: 750px;
  }

  .slide2-subtitle-1 {
    margin-left: auto;
    margin-right: 13rem;
    margin-top: 25px;
    width: 700px;
  }

  .slide2-subtitle-2 {
    margin-left: auto;
    margin-right: 23rem;
    margin-top: 25px;
    width: 700px;
  }

  .slide2-subtitle-3 {
    margin-left: 230px;
    margin-right: 13rem;
    margin-top: 25px;
    width: 700px;
  }

  .slide2-subtitle-4 {
    margin-left: auto;
    margin-right: 20rem;
    margin-top: 25px;
    width: 700px;
  }
  
  /* Изображения для 2K */
  .slide-img-1 {
    width: 950px;
    height: 620px;
    margin-left: 200px;
    margin-top: 270px;
  }
  
  .slide-img-3 {
    width: 780px;
    height: 520px;
    margin-left: 250px;
    margin-top: 1470px;
  }
  
  .slide-img-4 {
    width: 650px;
    height: 580px;
    margin-left: 1450px;
    margin-top: 2500px;
  }
  
  .slide-img-5 {
    width: 650px;
    height: 490px;
    margin-left: 200px;
    margin-top: 3870px;
  }
  
  /* Кубы для 2K */
  .cubes-1 {
    width: 650px;
    height: 650px;
    margin-left: 40px;
    margin-top: 1700px;
  }
  
  .cubes-2 {
    width: 520px;
    height: 1280px;
    margin-left: 1700px;
    margin-top: 280px;
  }
  
  .cubes-3 {
    width: 1050px;
    height: 1050px;
    margin-left: 1250px;
    margin-top: 2100px;
  }
  
  .cubes-4 {
    width: 520px;
    height: 520px;
    margin-left: 260px;
    margin-top: 2900px;
  }
  
  .cubes-5 {
    width: 520px;
    height: 260px;
    margin-left: 70px;
    margin-top: 3700px; 
  }
  
  .cubes-6 {
    width: 520px;
    height: 780px;
    margin-left: 1700px;
    margin-top: 3750px;
  }
}

@media (min-width: 3440px) {
  .slide1-logo {
    width: 1450px;
    height: 1470px;
  }
  
  .slide1-title {
    font-size: 140px;
    margin-right: 940px;
    margin-top: 500px;
  }
  
  .slide1-subtitle {
    font-size: 100px;
    margin-right: 22rem;
    margin-top: 35px;
    width: 1700px;
  }
  
  .slide2-title {
    font-size: 80px;
  }
  
  .slide2-subtitle {
    font-size: 52px;
  }
  
  .slide2-cta {
    font-size: 75px;
    width: 1150px;
    margin-top: 750px;
  }
  
  .register-button {
    width: 550px;
    height: 120px;
    border-radius: 38px;
    margin-top: 35px;
  }
  
  .register-text {
    font-size: 52px;
  }
  
  
  /* Позиционирование текста для 4K */
  .slide2-title-1 {
    margin-left: auto;
    margin-right: 250px;
    margin-top: 500px;
    width: 1200px;
    font-size: 100px;
  }

  .slide2-title-2 {
    margin-left: auto;
    margin-right: 250px;
    margin-top: 900px;
    width: 1200px;
    font-size: 100px;
  }

  .slide2-title-3 {
    margin-left: 250px;
    margin-right: 250px;
    margin-top: 950px;
    width: 1200px;
    font-size: 100px;
  }

  .slide2-title-4 {
    margin-left: auto;
    margin-right: 250px;
    margin-top: 1100px;
    width: 1200px;
    font-size: 100px;
  }

  .slide2-subtitle-1 {
    margin-left: auto;
    margin-right: 15rem;
    margin-top: 30px;
    width: 1200px;
    font-size: 70px;
  }

  .slide2-subtitle-2 {
    margin-left: auto;
    margin-right: 15rem;
    margin-top: 30px;
    width: 1200px;
    font-size: 70px;
  }

  .slide2-subtitle-3 {
    margin-left: 280px;
    margin-right: 15rem;
    margin-top: 30px;
    width: 1200px;
    font-size: 70px;
  }

  .slide2-subtitle-4 {
    margin-left: auto;
    margin-right: 15rem;
    margin-top: 30px;
    width: 1200px;
    font-size: 70px;
  }
  
  /* Изображения для 4K */
  .slide-img-1 {
    width: 1150px;
    height: 770px;
    margin-left: 310px;
    margin-top: 400px;
  }
  
  .slide-img-3 {
    width: 950px;
    height: 650px;
    margin-left: 280px;
    margin-top: 1800px;
  }
  
  .slide-img-4 {
    width: 850px;
    height: 770px;
    margin-left: 2180px;
    margin-top: 3150px;
  }
  
  .slide-img-5 {
    width: 850px;
    height: 670px;
    margin-left: 270px;
    margin-top: 4700px;
  }
  
  /* Кубы для 4K */
  .cubes-1 {
    width: 800px;
    height: 750px;
    margin-left: 350px;
    margin-top: 2200px;
  }
  
  .cubes-2 {
    width: 650px;
    height: 1480px;
    margin-left: 1950px;
    margin-top: 1300px;
  }
  
  .cubes-3 {
    width: 1250px;
    height: 1250px;
    margin-left: 1450px;
    margin-top: 3700px;
  }
  
  .cubes-4 {
    width: 650px;
    height: 650px;
    margin-left: 300px;
    margin-top: 3700px;
  }
  
  .cubes-5 {
    width: 650px;
    height: 350px;
    margin-left: 80px;
    margin-top: 5700px;
  }
  
  .cubes-6 {
    width: 650px;
    height: 950px;
    margin-left: 1950px;
    margin-top: 5400px;
  }
}
</style>
