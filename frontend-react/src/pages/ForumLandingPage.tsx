import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Heart,
  Star,
  Target,
  Gamepad2,
  BookOpen,
  Briefcase,
  DollarSign,
  Lock,
  Palette,
  Boxes,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Feature {
  icon: typeof Sparkles
  title: string
  description: string
  color: string
}

interface Stat {
  value: string
  label: string
  icon: typeof Users
}

const mainFeatures: Feature[] = [
  {
    icon: Gamepad2,
    title: 'Advanced Gamification',
    description: 'Levels, achievements, battle passes, clans, and ranks. Your journey matters.',
    color: 'text-purple-500',
  },
  {
    icon: Users,
    title: 'Networking Hub',
    description: 'Connect with scientists, developers, gamers, and professionals worldwide.',
    color: 'text-blue-500',
  },
  {
    icon: GraduationCap,
    title: 'Learning Platform',
    description: 'Comprehensive courses, interactive articles, and educational content.',
    color: 'text-green-500',
  },
  {
    icon: Store,
    title: 'Marketplace',
    description: 'Trade cards, decorations, widgets, and exclusive NFT items.',
    color: 'text-amber-500',
  },
  {
    icon: Code,
    title: 'Developer Tools',
    description: 'Q&A platform, code sharing, and collaborative development space.',
    color: 'text-cyan-500',
  },
  {
    icon: DollarSign,
    title: 'Monetization',
    description: 'Earn from content creation, ads revenue, donations, and partnerships.',
    color: 'text-emerald-500',
  },
  {
    icon: Brain,
    title: 'AI Features',
    description: 'AI assistant, smart recommendations, and advanced content tools.',
    color: 'text-indigo-500',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'OAuth2 only, email hashing, no personal data collection. Your privacy matters.',
    color: 'text-red-500',
  },
]

const gamificationFeatures: Feature[] = [
  {
    icon: Trophy,
    title: 'Achievements System',
    description: 'Unlock hundreds of achievements across different categories',
    color: 'text-yellow-500',
  },
  {
    icon: Target,
    title: 'Daily Quests',
    description: 'Complete challenges and earn rewards every day',
    color: 'text-orange-500',
  },
  {
    icon: Star,
    title: 'Clan Wars',
    description: 'Join clans, compete with others, and climb the leaderboards',
    color: 'text-purple-500',
  },
  {
    icon: Zap,
    title: 'Battle Pass',
    description: 'Seasonal content with exclusive rewards and cosmetics',
    color: 'text-pink-500',
  },
]

const platformFeatures: Feature[] = [
  {
    icon: BookOpen,
    title: 'Rich Text Editor',
    description: 'Advanced editor with countless formatting options',
    color: 'text-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Community Chat',
    description: 'Global and country-specific chats, groups, and channels',
    color: 'text-green-500',
  },
  {
    icon: Briefcase,
    title: 'Job Board',
    description: 'Find collaborators, clients, and opportunities',
    color: 'text-indigo-500',
  },
  {
    icon: Palette,
    title: 'Customization',
    description: 'Widgets, decorations, themes, and profile customization',
    color: 'text-pink-500',
  },
]

const stats: Stat[] = [
  { value: '50+', label: 'Features', icon: Boxes },
  { value: '∞', label: 'Possibilities', icon: Sparkles },
  { value: '100%', label: 'Privacy', icon: Shield },
  { value: '24/7', label: 'Community', icon: Users },
]

export default function ForumLandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const gamificationRef = useRef<HTMLDivElement>(null)
  const platformRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })

      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      })

      gsap.from('.hero-description', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.4,
        ease: 'power2.out',
      })

      gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.6,
        ease: 'power2.out',
      })

      // Floating animation for hero elements
      gsap.to('.hero-float', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Features grid animation
      const featureCards = gsap.utils.toArray('.feature-card')
      featureCards.forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 0,
          y: 40,
          duration: 0.6,
          delay: index * 0.08,
          ease: 'power2.out',
        })
      })

      // Gamification section
      gsap.from('.gamification-header', {
        scrollTrigger: {
          trigger: gamificationRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      })

      const gamificationCards = gsap.utils.toArray('.gamification-card')
      gamificationCards.forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 0,
          y: 40,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power2.out',
        })
      })

      // Platform features
      const platformCards = gsap.utils.toArray('.platform-card')
      platformCards.forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 0,
          y: 40,
          scale: 0.9,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power2.out',
        })
      })

      // Stats animation
      const statsItems = gsap.utils.toArray('.stat-item')
      statsItems.forEach((item, index) => {
        gsap.from(item as HTMLElement, {
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
        })
      })

      // CTA section
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
      })

      // Parallax effect for backgrounds
      gsap.to('.parallax-bg', {
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
        y: (_i, target) => ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: 'none',
      })
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden pt-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="parallax-bg absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" data-speed="0.3" />
          <div className="parallax-bg absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" data-speed="0.5" />
          <div className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" data-speed="0.4" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <Badge className="hero-badge text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              The Ultimate Multi-Platform Experience
            </Badge>

            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Aetheris
              </span>
              <br />
              <span className="text-foreground">Where Minds Connect</span>
            </h1>

            <p className="hero-description text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A powerful ecosystem for scientists, developers, gamers, and learners.
              <br />
              <span className="font-semibold text-foreground">Gamification. Networking. Learning. Earning.</span>
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6 group" onClick={() => navigate('/auth')}>
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Explore Features
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="hero-float pt-12">
              <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Privacy first</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-float">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section ref={statsRef} className="py-16 border-y border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="stat-item text-center space-y-2">
                  <Icon className="w-8 h-8 mx-auto text-primary" />
                  <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section ref={featuresRef} className="py-24 relative overflow-hidden">
        <div className="parallax-bg absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" data-speed="0.2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge className="text-sm px-4 py-2">Core Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need,
              <br />
              <span className="text-primary">All In One Place</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to meet all your professional and personal growth needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="feature-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section ref={gamificationRef} className="py-24 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
        <div className="parallax-bg absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" data-speed="0.3" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="gamification-header text-center mb-16 space-y-4">
            <Badge className="text-sm px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
              <Gamepad2 className="w-4 h-4 mr-2 inline" />
              Gamification
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Level Up Your
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Professional Journey
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Earn XP, unlock achievements, join clans, and compete in seasonal battle passes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {gamificationFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="gamification-card relative overflow-hidden border-border/50 bg-card/80 backdrop-blur group hover:border-primary/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <Icon className={`w-10 h-10 ${feature.color} mb-3`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="w-8 h-8 text-amber-500" />
                  <CardTitle className="text-2xl">Internal Currency System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Earn rewards through activities, trade in marketplace, support creators, and unlock premium features.
                  Future crypto integration planned for seamless transactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section ref={platformRef} className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="text-sm px-4 py-2">Platform Capabilities</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Powerful Tools For
              <br />
              <span className="text-primary">Every Creator</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="platform-card border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur"
                >
                  <CardHeader>
                    <Icon className={`w-10 h-10 ${feature.color} mb-3`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional features list */}
          <div className="max-w-5xl mx-auto">
            <Card className="bg-muted/20 border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">And So Much More...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Interactive branching articles',
                    'Advanced rich text editor',
                    'Personal blog & wall posts',
                    'Groups & channels',
                    'Global & local chats',
                    'Q&A platform',
                    'Ask Me Anything sessions',
                    'Job board & freelancing',
                    'Course platform',
                    'NFT collectibles',
                    'Widgets & decorations',
                    'Partnership opportunities',
                    'Merchandise store',
                    'Content monetization',
                    'Ad revenue sharing',
                    'Donation system',
                    'Collaboration tools',
                    'AI assistant (coming soon)',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Privacy First, Always</CardTitle>
                <CardDescription className="text-lg">
                  Your data belongs to you. We don't collect, sell, or misuse your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <Lock className="w-8 h-8 mx-auto text-green-500" />
                    <h4 className="font-semibold">OAuth2 Only</h4>
                    <p className="text-sm text-muted-foreground">
                      Secure authentication through trusted providers
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Globe className="w-8 h-8 mx-auto text-blue-500" />
                    <h4 className="font-semibold">Email Hashing</h4>
                    <p className="text-sm text-muted-foreground">
                      Your email is hashed, never stored in plain text
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Heart className="w-8 h-8 mx-auto text-red-500" />
                    <h4 className="font-semibold">Zero Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      No ads tracking, no data selling, ever
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-32 relative overflow-hidden">
        <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 -z-10" data-speed="0.1" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="cta-content max-w-4xl mx-auto text-center space-y-8">
            <Badge className="text-sm px-4 py-2 bg-primary text-primary-foreground">
              <Rocket className="w-4 h-4 mr-2 inline" />
              Join The Community
            </Badge>

            <h2 className="text-5xl md:text-6xl font-bold">
              Ready To Start
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Your Journey?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals, learners, and creators building their future on Aetheris
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="text-lg px-10 py-7 group" onClick={() => navigate('/auth')}>
                Create Free Account
                <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7" onClick={() => navigate('/')}>
                Explore Platform
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live now</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Growing fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Active community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2025 Aetheris. Built with <Heart className="w-4 h-4 inline text-red-500" /> for the community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

