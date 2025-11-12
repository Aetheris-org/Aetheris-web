import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Users,
  GraduationCap,
  Code,
  Trophy,
  Coins,
  Network,
  MessageSquare,
  Sparkles,
  Shield,
  Brain,
  Layers,
  Globe,
  Gift,
  Target,
  Award,
  BarChart3,
  Users2,
  MessageCircle,
  Hash,
  FileText,
  PenTool,
  Store,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Mail,
  Flame,
  Gamepad2,
  BookOpen,
  Rocket,
  ShoppingBag,
  Zap,
  TrendingUp,
  Heart,
  Image as ImageIcon,
  Video,
  Music,
  Palette,
  Wand2,
  Bot,
  Database,
  Cloud,
  Microscope,
  Terminal,
  Bookmark,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Settings,
  Share,
  Download,
  Upload,
  Activity,
  Compass,
  Map,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/SiteHeader'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export default function ForumLandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title split animation
      if (heroTitleRef.current) {
        const text = heroTitleRef.current.textContent || ''
        heroTitleRef.current.innerHTML = text
          .split('')
          .map((char, i) => `<span class="hero-char" style="display: inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
          .join('')

        gsap.from('.hero-char', {
          y: 100,
          opacity: 0,
          rotationX: -90,
          duration: 0.8,
          ease: 'back.out(1.2)',
          stagger: 0.02,
        })
      }

      // Hero subtitle animation
      if (heroSubtitleRef.current) {
        gsap.from(heroSubtitleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.5,
        })
      }

      // Floating particles
      if (particlesRef.current) {
        const particles = Array.from({ length: 50 }, () => {
          const particle = document.createElement('div')
          particle.className = 'absolute w-1 h-1 rounded-full bg-primary/30'
          particle.style.left = `${Math.random() * 100}%`
          particle.style.top = `${Math.random() * 100}%`
          particlesRef.current?.appendChild(particle)
          return particle
        })

        particles.forEach((particle, i) => {
          gsap.to(particle, {
            y: `+=${Math.random() * 200 + 100}`,
            x: `+=${Math.random() * 100 - 50}`,
            opacity: Math.random() * 0.5 + 0.2,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.1,
          })
        })
      }

      // Magnetic buttons
      const buttons = document.querySelectorAll('.magnetic-btn')
      buttons.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2

          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.5,
            ease: 'power2.out',
          })
        })

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
          })
        })
      })

      // 3D tilt cards
      const cards = document.querySelectorAll('.tilt-card')
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const rotateX = (y - centerY) / 10
          const rotateY = (centerX - x) / 10

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: 'power2.out',
          })
        })

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.5,
            ease: 'power2.out',
          })
        })
      })

      // Text reveal on scroll
      ScrollTrigger.batch('.reveal-text', {
        onEnter: (elements) => {
          elements.forEach((el) => {
            const text = el.textContent || ''
            el.innerHTML = text
              .split(' ')
              .map((word) => `<span class="reveal-word" style="display: inline-block; overflow: hidden;"><span style="display: inline-block;">${word}</span></span>`)
              .join(' ')

            gsap.from(el.querySelectorAll('.reveal-word span'), {
              y: '100%',
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.05,
            })
          })
        },
        once: true,
      })

      // Stagger cards animation
      ScrollTrigger.batch('.stagger-card', {
        onEnter: (elements) => {
          gsap.from(elements, {
            y: 100,
            opacity: 0,
            scale: 0.8,
            rotation: -10,
            duration: 0.8,
            ease: 'back.out(1.2)',
            stagger: 0.1,
          })
        },
        once: true,
      })

      // Parallax sections
      gsap.utils.toArray<HTMLElement>('.parallax-section').forEach((section) => {
        gsap.to(section, {
          y: (i, el) => {
            return -el.offsetHeight * 0.5
          },
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

      // Counter animation
      ScrollTrigger.batch('.counter', {
        onEnter: (elements) => {
          elements.forEach((el) => {
            const target = parseInt(el.getAttribute('data-target') || '0')
            const duration = 2
            const obj = { value: 0 }
            gsap.to(obj, {
              value: target,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = Math.floor(obj.value).toString()
              },
            })
          })
        },
        once: true,
      })

      // Morphing background
      const morphBg = document.querySelector('.morph-bg')
      if (morphBg) {
        gsap.to(morphBg, {
          morphSVG: 'M0,0 Q250,100 500,0 T1000,0',
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Interactive cursor follower
      const cursor = document.querySelector('.cursor-follower')
      if (cursor) {
        gsap.to(cursor, {
          x: mousePosition.x,
          y: mousePosition.y,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    })

    return () => ctx.revert()
  }, [mousePosition])

  const targetAudience = [
    { icon: Microscope, label: 'Ученые', color: 'text-blue-500' },
    { icon: Code, label: 'Разработчики', color: 'text-green-500' },
    { icon: Terminal, label: 'IT специалисты', color: 'text-purple-500' },
    { icon: Gamepad2, label: 'Геймеры', color: 'text-pink-500' },
    { icon: GraduationCap, label: 'Учителя', color: 'text-orange-500' },
    { icon: BookOpen, label: 'Студенты', color: 'text-cyan-500' },
    { icon: Rocket, label: 'Начинающие', color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'Предприниматели', color: 'text-red-500' },
  ]

  const gamificationFeatures = [
    { icon: Trophy, title: 'Достижения', desc: 'Система достижений с различными редкостями', color: 'from-yellow-500 to-orange-500' },
    { icon: Target, title: 'Уровни', desc: 'Прогрессия уровней с наградами и бонусами', color: 'from-blue-500 to-cyan-500' },
    { icon: Flame, title: 'Стрики', desc: 'Ежедневные активности и стрики для мотивации', color: 'from-red-500 to-pink-500' },
    { icon: Award, title: 'Ранги', desc: 'Система рангов и статусов в сообществе', color: 'from-purple-500 to-indigo-500' },
    { icon: Users2, title: 'Кланы', desc: 'Участие в кланах и соревнования между ними', color: 'from-green-500 to-emerald-500' },
    { icon: BarChart3, title: 'Баттлпассы', desc: 'Сезонные баттлпассы с эксклюзивными наградами', color: 'from-violet-500 to-purple-500' },
  ]

  const platforms = [
    {
      icon: GraduationCap,
      title: 'Платформа для курсов',
      desc: 'Создавай и проходи курсы с интерактивными материалами',
      features: ['Интерактивные уроки', 'Прогресс трекинг', 'Сертификаты', 'Когорты'],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Network,
      title: 'Нетворкинг',
      desc: 'Находи партнеров, клиентов и единомышленников',
      features: ['Поиск по навыкам', 'Рекомендации', 'События', 'Верификация'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Code,
      title: 'Для разработчиков',
      desc: 'Инструменты, чейнджлоги и ресурсы для разработчиков',
      features: ['API документация', 'SDK', 'Интеграции', 'DevTools'],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'Q&A платформа',
      desc: 'Задавай вопросы и получай экспертные ответы',
      features: ['Экспертные ответы', 'Рейтинг вопросов', 'База знаний', 'Награды'],
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Hash,
      title: 'Ask Me Anything',
      desc: 'AMA сессии с экспертами и лидерами индустрии',
      features: ['Прямые трансляции', 'Архив сессий', 'Интерактив', 'Записи'],
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Store,
      title: 'Доска объявлений',
      desc: 'Находи людей для любых целей в рамках правил',
      features: ['Фильтры', 'Рекомендации', 'Безопасность', 'Модерация'],
      gradient: 'from-pink-500 to-rose-500',
    },
  ]

  const monetizationFeatures = [
    {
      icon: DollarSign,
      title: 'Заработок на контенте',
      desc: 'Процент с рекламы на твоей странице отчисляется тебе в виде внутренней валюты или денег',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Gift,
      title: 'Донаты',
      desc: 'Поддерживай любимых контент-криейтеров и получай эксклюзивный контент',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Coins,
      title: 'Внутренняя валюта',
      desc: 'Валюта похожая по функционалу на звезды в Telegram, имеет такой же вес как реальные деньги',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: ShoppingBag,
      title: 'Маркетплейс',
      desc: 'Торговая площадка где люди могут продавать украшения, карточки и прочее',
      gradient: 'from-purple-500 to-indigo-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="cursor-follower fixed w-6 h-6 rounded-full bg-primary/20 pointer-events-none z-50 mix-blend-difference" />
      <SiteHeader />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-pulse">
            <Sparkles className="h-4 w-4" />
            Многосторонняя платформа нового поколения
          </div>

          <h1 ref={heroTitleRef} className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Aetheris
          </h1>

          <p ref={heroSubtitleRef} className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto">
            Экосистема для роста: обучение, нетворкинг, геймификация, заработок и сообщество
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="magnetic-btn text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Начать бесплатно
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="magnetic-btn text-lg px-8 py-6" onClick={() => navigate('/courses')}>
              Изучить возможности
            </Button>
          </div>

          {/* Target Audience Icons */}
          <div className="mt-20 grid grid-cols-4 md:grid-cols-8 gap-4 max-w-5xl mx-auto">
            {targetAudience.map((item, i) => (
              <div
                key={i}
                className="stagger-card flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/20 border border-border/60 hover:bg-muted/40 transition-colors"
              >
                <item.icon className={cn('h-8 w-8', item.color)} />
                <span className="text-xs text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Мощные возможности
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Все инструменты для профессионального роста в одном месте
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Помощник', desc: 'Продвинутый AI помощник и множество AI фич', gradient: 'from-cyan-500 to-blue-500' },
              { icon: Layers, title: 'Интерактивные статьи', desc: 'Ветвящиеся интерактивные статьи с богатым контентом', gradient: 'from-green-500 to-emerald-500' },
              { icon: FileText, title: 'Rich Text редактор', desc: 'Продвинутый редактор с огромной кучей возможностей', gradient: 'from-orange-500 to-red-500' },
              { icon: Sparkles, title: 'NFT и украшения', desc: 'NFT плюшки, украшения для разных целей и виджетов', gradient: 'from-pink-500 to-rose-500' },
              { icon: Bot, title: 'AI Фичи', desc: 'Множество AI возможностей для повышения продуктивности', gradient: 'from-purple-500 to-indigo-500' },
              { icon: Wand2, title: 'Виджеты', desc: 'Кастомизируемые виджеты для персонализации', gradient: 'from-violet-500 to-purple-500' },
              { icon: Database, title: 'Криптовалюта', desc: 'Возможность интеграции с криптовалютой в будущем', gradient: 'from-yellow-500 to-orange-500' },
              { icon: Cloud, title: 'Облачные решения', desc: 'Масштабируемая инфраструктура для всех нужд', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Zap, title: 'Высокая производительность', desc: 'Оптимизированная платформа для максимальной скорости', gradient: 'from-amber-500 to-yellow-500' },
            ].map((feature, i) => (
              <Card
                key={i}
                className="tilt-card stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', feature.gradient)} />
                <CardHeader>
                  <div className={cn('mb-4 w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center', feature.gradient)}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-32 px-4 bg-muted/30 relative parallax-section">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Продвинутая геймификация
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Зарабатывай награды, повышай уровень и соревнуйся с другими
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gamificationFeatures.map((item, i) => (
              <Card
                key={i}
                className="tilt-card stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden relative"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity blur-xl', item.color)} />
                <CardHeader className="relative z-10">
                  <div className={cn('mb-4 w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center', item.color)}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Множество платформ
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Специализированные платформы для разных целей
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platforms.map((platform, i) => (
              <Card
                key={i}
                className="tilt-card stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden relative"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', platform.gradient)} />
                <CardHeader className="relative z-10">
                  <div className={cn('mb-4 w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center', platform.gradient)}>
                    <platform.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{platform.title}</CardTitle>
                  <CardDescription className="text-base">{platform.desc}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    {platform.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0', platform.gradient)}>
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-32 px-4 bg-muted/30 relative parallax-section">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Сообщество
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Общайся, создавай группы и находи единомышленников
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: 'Общий чат', desc: 'Чат с фильтрами по странам или глобальный', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Users2, title: 'Группы', desc: 'Создавай и управляй группами по интересам', gradient: 'from-purple-500 to-pink-500' },
              { icon: Hash, title: 'Каналы', desc: 'Публичные каналы для обсуждений', gradient: 'from-green-500 to-emerald-500' },
              { icon: PenTool, title: 'Блог и посты', desc: 'Веди блог и делись постами как в VK', gradient: 'from-orange-500 to-red-500' },
            ].map((item, i) => (
              <Card
                key={i}
                className="tilt-card stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden relative"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', item.gradient)} />
                <CardHeader className="relative z-10">
                  <div className={cn('mb-4 w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center', item.gradient)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Зарабатывай на контенте
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Монетизируй свой контент и получай доход от рекламы
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {monetizationFeatures.map((item, i) => (
              <Card
                key={i}
                className="tilt-card stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden relative"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', item.gradient)} />
                <CardHeader className="relative z-10">
                  <div className={cn('mb-4 w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center', item.gradient)}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-32 px-4 bg-muted/30 relative parallax-section">
        <div className="container mx-auto max-w-7xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Дополнительные возможности
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-20">
            Еще больше функций для максимального комфорта
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { icon: Calendar, label: 'События' },
              { icon: Bell, label: 'Уведомления' },
              { icon: Search, label: 'Поиск' },
              { icon: Filter, label: 'Фильтры' },
              { icon: Settings, label: 'Настройки' },
              { icon: Share, label: 'Шаринг' },
              { icon: Bookmark, label: 'Закладки' },
              { icon: Heart, label: 'Лайки' },
              { icon: Download, label: 'Скачивание' },
              { icon: Upload, label: 'Загрузка' },
              { icon: Video, label: 'Видео' },
              { icon: ImageIcon, label: 'Изображения' },
              { icon: Music, label: 'Музыка' },
              { icon: Palette, label: 'Дизайн' },
              { icon: Compass, label: 'Навигация' },
              { icon: Map, label: 'Карты' },
              { icon: Clock, label: 'Время' },
              { icon: Activity, label: 'Активность' },
            ].map((item, i) => (
              <div
                key={i}
                className="stagger-card flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/20 border border-border/60 hover:bg-muted/40 transition-colors group"
              >
                <item.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="reveal-text text-5xl md:text-6xl font-bold text-center mb-4">
            Приватность и безопасность
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-20">
            Мы не используем твои персональные данные
          </p>

          <div className="space-y-6">
            {[
              { icon: Shield, title: 'OAuth2', desc: 'Исключительно OAuth2 авторизация', gradient: 'from-green-500 to-emerald-500' },
              { icon: Mail, title: 'Хеш почты', desc: 'Вместо почты используем хеш от неё', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Globe, title: 'Много провайдеров', desc: 'Поддержка огромного количества провайдеров', gradient: 'from-purple-500 to-pink-500' },
            ].map((item, i) => (
              <Card
                key={i}
                className="stagger-card border-border/60 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden relative"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', item.gradient)} />
                <CardContent className="flex items-start gap-4 p-6 relative z-10">
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', item.gradient)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-4 bg-muted/30 relative parallax-section">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '1000+', label: 'Активных пользователей', icon: Users },
              { value: '500+', label: 'Курсов', icon: GraduationCap },
              { value: '10000+', label: 'Статей', icon: FileText },
              { value: '50+', label: 'Интеграций', icon: Code },
            ].map((stat, i) => (
              <Card
                key={i}
                className="stagger-card border-border/60 bg-muted/20 text-center p-8"
              >
                <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="counter text-4xl font-bold mb-2" data-target={stat.value.replace(/\D/g, '')}>
                  0
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <Card className="stagger-card border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-5xl md:text-6xl font-bold mb-4">
                Готов начать?
              </CardTitle>
              <CardDescription className="text-xl">
                Присоединяйся к сообществу и начни свой путь к успеху
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button size="lg" className="magnetic-btn text-lg px-8 py-6" onClick={() => navigate('/auth')}>
                Создать аккаунт
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="magnetic-btn text-lg px-8 py-6" onClick={() => navigate('/courses')}>
                Узнать больше
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
