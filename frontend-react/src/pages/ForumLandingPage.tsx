import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SiteHeader } from '@/components/SiteHeader'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Trophy,
  Users,
  GraduationCap,
  Code,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  TrendingUp,
  Coins,
  Store,
  Rocket,
  Brain,
  Star,
  Target,
  Gamepad2,
  BookOpen,
  Briefcase,
  DollarSign,
  Lock,
  Palette,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Network,
  Flame,
  Crown,
  Gift,
  Megaphone,
  Video,
  Heart,
  ChevronDown,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ForumLandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const themeParams = useThemeStore((state) => ({
    motion: state.motion,
    depth: state.depth,
    contrast: state.contrast,
    accent: state.accent,
    surface: state.surface,
    radius: state.radius,
    typography: state.typography,
    density: state.density,
    resolvedTheme: state.resolvedTheme,
  }))
  
  const heroRef = useRef<HTMLDivElement>(null)
  const horizontalRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const squaresContainerRef = useRef<HTMLDivElement>(null)

  // Прокрутка в начало страницы при загрузке
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Создаем уникальный ключ для принудительной переинициализации при изменении темы
  const themeKey = `${themeParams.accent}-${themeParams.surface}-${themeParams.radius}-${themeParams.typography}-${themeParams.density}-${themeParams.contrast}-${themeParams.resolvedTheme}`

  useEffect(() => {
    // Убиваем все существующие ScrollTrigger
    ScrollTrigger.getAll().forEach((t) => t.kill())
    
    let ctx: gsap.Context | null = null

    ctx = gsap.context(() => {
          // Hero fade in
          gsap.from('.hero-content', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power2.out',
          })

          // Scroll indicator - скрывается при скролле
          if (scrollIndicatorRef.current) {
            gsap.to(scrollIndicatorRef.current, {
              opacity: 0,
              y: -20,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            })
          }

          // Animated geometric background parallax - движение без размытия
          const bgElements = [
            // Геометрические формы - медленное движение
            { selector: '.bg-shape-1', x: -200, y: 150, rotation: 25, scale: 1.3, scrub: 3 },
            { selector: '.bg-shape-2', x: 250, y: -200, rotation: -30, scale: 1.2, scrub: 3 },
            { selector: '.bg-shape-3', x: -150, y: 300, scale: 1.5, scrub: 3 },
            
            // Вертикальные линии - движение в стороны
            { selector: '.bg-line-1', x: 100, scrub: 2.5 },
            { selector: '.bg-line-2', x: -80, scrub: 2.5 },
            { selector: '.bg-line-3', x: 120, scrub: 2.5 },
            
            // Горизонтальные линии - движение вверх-вниз
            { selector: '.bg-line-h1', y: -150, scrub: 2.5 },
            { selector: '.bg-line-h2', y: 200, scrub: 2.5 },
            { selector: '.bg-line-h3', y: -180, scrub: 2.5 },
            
            // Сетка - легкое движение (будет обработано отдельно)
            { selector: '.bg-grid', isGrid: true, scrub: 4 },
          ]

          bgElements.forEach((element) => {
            const el = document.querySelector(element.selector) as HTMLElement
            if (el) {
              // Специальная обработка для сетки - эффект перспективы, где границы сдвигаются друг к другу
              if ((element as any).isGrid) {
                // Комбинируем backgroundPosition и transform для создания эффекта глубины
                gsap.fromTo(el, 
                  { 
                    backgroundPosition: '0px 0px',
                    x: 0,
                    y: 0,
                    scale: 1,
                  },
                  {
                    backgroundPosition: '120px 120px',
                    x: 40,
                    y: 40,
                    scale: 1.05,
                    ease: 'none',
                    scrollTrigger: {
                      trigger: document.body,
                      start: 'top top',
                      end: 'max',
                      scrub: element.scrub || 4,
                      invalidateOnRefresh: true,
                    },
                  }
                )
                return
              }
              
              const animProps: any = {
                ease: 'none',
                scrollTrigger: {
                  trigger: document.body,
                  start: 'top top',
                  end: 'max',
                  scrub: element.scrub || 2,
                  invalidateOnRefresh: true,
                },
              }
              
              if (element.x !== undefined) animProps.x = element.x
              if (element.y !== undefined) animProps.y = element.y
              if (element.rotation !== undefined) animProps.rotation = element.rotation
              if (element.scale !== undefined) animProps.scale = element.scale
              
              gsap.to(el, animProps)
            }
          })

          // Легкая анимация нижней линии при скролле
          const bottomLine = document.querySelector('.bg-bottom-line') as HTMLElement
          if (bottomLine) {
            gsap.to(bottomLine, {
              opacity: 0.5,
              scaleX: 1.1,
              ease: 'none',
              scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'max',
                scrub: 2,
                invalidateOnRefresh: true,
              },
            })
          }

          // HORIZONTAL SCROLL - вертикальный скролл = горизонтальное движение
          const horizontalSection = horizontalRef.current
          if (horizontalSection) {
            const sections = gsap.utils.toArray<HTMLElement>('.h-section')
            const totalWidth = sections.reduce((acc, section) => {
              return acc + section.offsetWidth
            }, 0)
            
            gsap.to(sections, {
              xPercent: -100 * (sections.length - 1),
              ease: 'none',
              scrollTrigger: {
                trigger: horizontalSection,
                pin: true,
                scrub: 1,
                end: () => `+=${totalWidth}`,
                invalidateOnRefresh: true,
              },
            })
          }

          // Feature cards fade in
          const featureCards = gsap.utils.toArray<HTMLElement>('.feature-card')
          
          featureCards.forEach((card, index) => {
            gsap.set(card, {
              opacity: 0,
              scale: 0.8,
              y: 20,
            })
            
            gsap.fromTo(card, 
              {
                opacity: 0,
                scale: 0.8,
                y: 20,
              },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 90%',
                  end: 'bottom 10%',
                  once: true,
                  toggleActions: 'play none none none',
                  invalidateOnRefresh: true,
                },
                delay: (index % 6) * 0.05,
              }
            )
          })
          
          // Fallback: если карточки уже в viewport при загрузке, показываем их сразу
          const checkInitialVisibility = () => {
            featureCards.forEach((card, index) => {
              const rect = card.getBoundingClientRect()
              const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
              if (isInViewport) {
                gsap.to(card, {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.4,
                  ease: 'power2.out',
                  delay: (index % 6) * 0.05,
                })
              }
            })
          }
          
          // Проверяем после небольшой задержки, чтобы ScrollTrigger успел инициализироваться
          setTimeout(() => {
            checkInitialVisibility()
            ScrollTrigger.refresh()
          }, 200)

          // Создание и анимация квадратиков с реакцией на скролл
          if (squaresContainerRef.current) {
            const container = squaresContainerRef.current
            
            // Очищаем предыдущие квадратики
            container.innerHTML = ''
            
            // Определяем мобильное устройство и настраиваем параметры
            const isMobile = window.innerWidth < 768
            const squaresCount = isMobile ? 8 : 15 // Оптимальное количество квадратиков
            const squares: HTMLElement[] = []

            // Разные оттенки акцентного цвета (разная прозрачность для создания оттенков)
            const opacityVariants = [
              0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60
            ]

            // Создаем квадратики с обертками для разделения анимаций
            for (let i = 0; i < squaresCount; i++) {
              // Обертка для скролла
              const wrapper = document.createElement('div')
              wrapper.className = 'absolute'
              wrapper.style.left = `${Math.random() * 100}%`
              wrapper.style.top = `${Math.random() * 100}%`
              wrapper.style.transform = 'translateZ(0)'
              wrapper.style.willChange = 'transform'
              
              // Сам квадратик
              const square = document.createElement('div')
              const size = isMobile 
                ? Math.random() * 6 + 4 // От 4px до 10px на мобильных
                : Math.random() * 8 + 5 // От 5px до 13px на десктопе
              
              // Выбираем случайный оттенок из вариантов
              const baseOpacity = opacityVariants[Math.floor(Math.random() * opacityVariants.length)]
              const glowOpacity = baseOpacity * 0.8 // Немного меньше для свечения
              
              square.className = 'bg-primary'
              square.style.width = `${size}px`
              square.style.height = `${size}px`
              square.style.opacity = `${baseOpacity}`
              square.style.boxShadow = `0 0 ${size * 2}px hsl(var(--primary) / ${glowOpacity})`
              square.style.willChange = 'transform, opacity'
              square.style.transform = 'translateZ(0)' // Аппаратное ускорение
              
              wrapper.appendChild(square)
              container.appendChild(wrapper)
              squares.push({ wrapper, square })
            }

            // Анимация квадратиков с реакцией на скролл
            squares.forEach(({ wrapper, square }, index) => {
              // Параметры для скролла (на обертке)
              const scrollSpeed = (Math.random() * 0.3 + 0.4) * (index % 2 === 0 ? 1 : -1)
              const scrollX = scrollSpeed * 200
              const scrollY = scrollSpeed * 150
              const scrollRotation = scrollSpeed * 40
              
              // Реакция на скролл - анимируем обертку
              gsap.to(wrapper, {
                x: scrollX,
                y: scrollY,
                rotation: scrollRotation,
                ease: 'none',
                scrollTrigger: {
                  trigger: document.body,
                  start: 'top top',
                  end: 'max',
                  scrub: 1, // Плавная привязка
                  invalidateOnRefresh: true,
                },
              })
              
              // Плавающее движение - анимируем сам квадратик (относительно обертки)
              const floatDuration = Math.random() * 3 + 6 // От 6 до 9 секунд
              const floatRange = 80
              const startX = (Math.random() - 0.5) * floatRange
              const startY = (Math.random() - 0.5) * floatRange
              const startRotation = (Math.random() - 0.5) * 40
              
              // Плавающая анимация
              const floatTL = gsap.timeline({
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
              })
              
              floatTL.to(square, {
                x: startX + (Math.random() - 0.5) * floatRange,
                y: startY + (Math.random() - 0.5) * floatRange,
                rotation: startRotation + (Math.random() - 0.5) * 40,
                duration: floatDuration,
              })
              
              // Отдельная анимация opacity и scale
              gsap.to(square, {
                opacity: opacityVariants[Math.floor(Math.random() * opacityVariants.length)],
                scale: Math.random() * 0.4 + 0.85,
                duration: floatDuration * 1.5,
                delay: Math.random() * 2,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
              })
            })
          }
    })

    return () => {
      if (ctx) {
        ctx.revert()
      }
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [themeKey])

  const features = [
    {
      icon: Gamepad2,
      title: t('forumLanding.features.gameLevels.title'),
      description: t('forumLanding.features.gameLevels.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Brain,
      title: t('forumLanding.features.ai.title'),
      description: t('forumLanding.features.ai.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Store,
      title: t('forumLanding.features.store.title'),
      description: t('forumLanding.features.store.description'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Network,
      title: t('forumLanding.features.network.title'),
      description: t('forumLanding.features.network.description'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: GraduationCap,
      title: t('forumLanding.features.learning.title'),
      description: t('forumLanding.features.learning.description'),
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: DollarSign,
      title: t('forumLanding.features.money.title'),
      description: t('forumLanding.features.money.description'),
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Code,
      title: t('forumLanding.features.code.title'),
      description: t('forumLanding.features.code.description'),
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: MessageSquare,
      title: t('forumLanding.features.blog.title'),
      description: t('forumLanding.features.blog.description'),
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Briefcase,
      title: t('forumLanding.features.jobs.title'),
      description: t('forumLanding.features.jobs.description'),
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: BookOpen,
      title: t('forumLanding.features.editor.title'),
      description: t('forumLanding.features.editor.description'),
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Star,
      title: t('forumLanding.features.tokens.title'),
      description: t('forumLanding.features.tokens.description'),
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Shield,
      title: t('forumLanding.features.anonymity.title'),
      description: t('forumLanding.features.anonymity.description'),
      color: 'from-red-500 to-pink-500',
    },
  ]

  const stats = [
    { value: '∞', label: t('forumLanding.stats.possibilities'), icon: Sparkles },
    { value: '100%', label: t('forumLanding.stats.privacy'), icon: Shield },
    { value: '24/7', label: t('forumLanding.stats.community'), icon: Users },
    { value: '0₽', label: t('forumLanding.stats.forever'), icon: Gift },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated geometric background - No blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Базовый градиент */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
        
        {/* Анимированная сетка */}
        <div className="bg-grid absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />
        
        {/* Геометрические линии - вертикальные */}
        <div className="bg-line-1 absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="bg-line-2 absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-primary/18 to-transparent" />
        <div className="bg-line-3 absolute top-0 left-[80%] w-px h-full bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
        
        {/* Геометрические линии - горизонтальные */}
        <div className="bg-line-h1 absolute top-[25%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="bg-line-h2 absolute top-[50%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
        <div className="bg-line-h3 absolute top-[75%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        
        {/* Большие геометрические формы - градиенты без размытия */}
        <div className="bg-shape-1 absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 via-transparent to-transparent" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        <div className="bg-shape-2 absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/6 via-transparent to-transparent" style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%, 0% 50%)' }} />
        <div className="bg-shape-3 absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-primary/5 via-transparent to-transparent" style={{ clipPath: 'circle(50% at 50% 50%)' }} />
        
        {/* Анимированные квадратики с GSAP */}
        <div ref={squaresContainerRef} className="absolute inset-0" />
        
        {/* Простая градиентная линия внизу */}
        <div className="bg-bottom-line absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative" style={{ zIndex: 10 }}>
        <SiteHeader transparent />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-12 sm:pt-24 sm:pb-16 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="hero-content container max-w-7xl mx-auto text-center space-y-8 sm:space-y-12 relative" style={{ zIndex: 10 }}>

          {/* Main heading */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {t('forumLanding.hero.title')}
              </span>
            </h1>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('forumLanding.hero.subtitle')}
            </p>
            <p className="text-xl sm:text-2xl bg-gradient-to-r from-foreground/90 via-foreground/80 to-muted-foreground bg-clip-text text-transparent max-w-3xl mx-auto leading-relaxed">
              {t('forumLanding.hero.description')}
            </p>
          </div>

          {/* Simple subtitle */}
          <p className="text-lg bg-gradient-to-r from-foreground/80 via-muted-foreground to-foreground/60 bg-clip-text text-transparent max-w-2xl mx-auto">
            {t('forumLanding.hero.audience')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto"
              onClick={() => navigate('/forum')}
            >
              {t('forumLanding.hero.startFree')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto border-dashed border-muted-foreground/40 opacity-40 hover:opacity-100 transition-opacity"
              onClick={() => navigate('/pricing')}
            >
              {t('forumLanding.hero.pricing')}
              <ChevronDown className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('forumLanding.hero.noCard')}</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('forumLanding.hero.privacy')}</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('forumLanding.hero.freeForever')}</span>
            </span>
          </div>
        </div>

        {/* Scroll indicator - fixed внизу экрана */}
        <div ref={scrollIndicatorRef} className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-50">
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-primary/50 animate-bounce" />
        </div>
      </section>

      {/* HORIZONTAL SCROLL CONTAINER - скроллишь вниз, едет вправо */}
      <div ref={horizontalRef} className="horizontal-wrapper" style={{ zIndex: 1, position: 'relative' }}>
        <div className="horizontal-sections flex min-h-screen">
          
          {/* Section 1: Stats */}
          <section className="h-section w-screen min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 flex-shrink-0">
            <div className="container max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">{t('forumLanding.stats.title')}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center space-y-1 sm:space-y-2">
                    <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-primary mb-2 sm:mb-4" />
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Gamification */}
          <section className="h-section w-screen min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 flex-shrink-0">
            <div className="container max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                    <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {t('forumLanding.gamification.badge')}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                    {t('forumLanding.gamification.title')}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {t('forumLanding.gamification.titleHighlight')}
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent">
                    {t('forumLanding.gamification.description')}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Badge className="px-4 py-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/40 transition-all">
                      <Trophy className="w-4 h-4 mr-2" />
                      {t('forumLanding.gamification.achievements')}
                    </Badge>
                    <Badge className="px-4 py-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/40 transition-all">
                      <Crown className="w-4 h-4 mr-2" />
                      {t('forumLanding.gamification.levels')}
                    </Badge>
                    <Badge className="px-4 py-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/40 transition-all">
                      <Flame className="w-4 h-4 mr-2" />
                      {t('forumLanding.gamification.clans')}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">{t('forumLanding.gamification.achievementsCount')}</div>
                      <div className="text-xs sm:text-sm bg-gradient-to-r from-foreground/70 to-muted-foreground bg-clip-text text-transparent">{t('forumLanding.gamification.achievementsLabel')}</div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">{t('forumLanding.gamification.levelsCount')}</div>
                      <div className="text-xs sm:text-sm bg-gradient-to-r from-foreground/70 to-muted-foreground bg-clip-text text-transparent">{t('forumLanding.gamification.levelsLabel')}</div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">{t('forumLanding.gamification.clansCount')}</div>
                      <div className="text-xs sm:text-sm bg-gradient-to-r from-foreground/70 to-muted-foreground bg-clip-text text-transparent">{t('forumLanding.gamification.clansLabel')}</div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Star className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">{t('forumLanding.gamification.seasons')}</div>
                      <div className="text-xs sm:text-sm bg-gradient-to-r from-foreground/70 to-muted-foreground bg-clip-text text-transparent">{t('forumLanding.gamification.seasonsLabel')}</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Monetization */}
          <section className="h-section w-screen min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 flex-shrink-0">
            <div className="container max-w-6xl mx-auto">
              <div className="text-center space-y-4 sm:space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('forumLanding.monetization.badge')}
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  {t('forumLanding.monetization.title')}
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t('forumLanding.monetization.titleHighlight')}
                  </span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-4">
                  {t('forumLanding.monetization.description')}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto pt-6 sm:pt-8">
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300 text-left">{t('forumLanding.monetization.ads.title')}</h3>
                        <p className="text-xs sm:text-sm bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent leading-relaxed text-left">{t('forumLanding.monetization.ads.description')}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300 text-left">{t('forumLanding.monetization.donations.title')}</h3>
                        <p className="text-xs sm:text-sm bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent leading-relaxed text-left">{t('forumLanding.monetization.donations.description')}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300 text-left">{t('forumLanding.monetization.currency.title')}</h3>
                        <p className="text-xs sm:text-sm bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent leading-relaxed text-left">{t('forumLanding.monetization.currency.description')}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5 sm:p-6 border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                        <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300 text-left">{t('forumLanding.monetization.partnerships.title')}</h3>
                        <p className="text-xs sm:text-sm bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent leading-relaxed text-left">{t('forumLanding.monetization.partnerships.description')}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Privacy */}
          <section className="h-section w-screen min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 flex-shrink-0">
            <div className="container max-w-5xl mx-auto">
              <Card className="p-6 sm:p-8 md:p-12 border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-all">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                    {t('forumLanding.privacy.title')}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-2">
                    {t('forumLanding.privacy.description')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <Badge variant="secondary" className="px-4 py-2">
                      <Lock className="w-4 h-4 mr-2" />
                      {t('forumLanding.privacy.oauth2')}
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-2">
                      <Shield className="w-4 h-4 mr-2" />
                      {t('forumLanding.privacy.hash')}
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t('forumLanding.privacy.zeroData')}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </section>

        </div>
      </div>

      {/* Features Grid - обычный скролл */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
            <Badge className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">{t('forumLanding.features.badge')}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold px-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('forumLanding.features.title')}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('forumLanding.features.titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-4">
              {t('forumLanding.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              // Используем primary с разными opacity для визуального разнообразия
              const opacityLevels = [20, 25, 30, 35, 40, 45]
              const opacity = opacityLevels[i % opacityLevels.length]
              const color = {
                border: `border-primary/${opacity}`,
                hoverBorder: `hover:border-primary/50`,
                hoverBg: 'hover:bg-primary/5',
                icon: 'text-primary',
                iconBg: 'bg-primary/5',
              }
              return (
                <Card
                  key={i}
                  className={`feature-card p-4 sm:p-6 border ${color.border} bg-card/40 backdrop-blur-sm ${color.hoverBorder} ${color.hoverBg} hover:bg-card/60 transition-all duration-300 group`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border ${color.border} ${color.iconBg} p-2 sm:p-3 mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color.icon}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
        <div className="container max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <Badge className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 bg-primary">
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            {t('forumLanding.finalCta.badge')}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold px-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {t('forumLanding.finalCta.title')}
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {t('forumLanding.finalCta.titleHighlight')}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-4">
            {t('forumLanding.finalCta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
            <Button
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto"
              onClick={() => navigate(isAuthenticated ? '/forum' : '/auth')}
            >
              {t('forumLanding.finalCta.registerFree')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 w-full sm:w-auto border-dashed border-muted-foreground/40 opacity-40 hover:opacity-100 transition-opacity">
              {t('forumLanding.finalCta.watchDemo')}
              <Video className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 pb-16 sm:pb-20 px-4 relative" style={{ zIndex: 1 }}>
        <div className="container max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="text-sm sm:text-base">{t('forumLanding.footer.text')}</p>
        </div>
      </footer>
    </div>
  )
}

