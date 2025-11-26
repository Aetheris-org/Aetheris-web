import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import {
  startups,
  developmentJournalEntries,
  developmentTools,
  type Startup,
  type DevelopmentJournalEntry,
  type DevelopmentTool,
} from '@/data/mockSections'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'
import {
  Rocket,
  TrendingUp,
  Users,
  Heart,
  BadgeCheck,
  Calendar,
  Eye,
  MessageCircle,
  Search,
  Filter,
  Github,
  Twitter,
  Globe,
  BarChart3,
  GitBranch,
  DollarSign,
  Zap,
  Star,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Mail,
  FileText,
  FlaskConical,
  TrendingDown,
  MessageSquare,
  Bot,
  CreditCard,
  Webhook,
  Repeat,
  Layout,
  LineChart,
  Thermometer,
  Send,
  Activity,
  CalendarDays,
  UserPlus,
  Video,
  UserCheck,
  MousePointerClick,
  UsersRound,
  AlertTriangle,
  PlayCircle,
  Headphones,
  Calculator,
  Receipt,
  FileSpreadsheet,
  Wallet,
  Target,
  Award,
  Magnet,
  ScanSearch,
  MessageSquareText,
  BookOpen,
} from 'lucide-react'

type StartupCategory = Startup['category'] | 'all'
type StartupStage = Startup['stage'] | 'all'
type JournalType = DevelopmentJournalEntry['type'] | 'all'
type ToolCategory = DevelopmentTool['category'] | 'all'

const categoryLabels: Record<Startup['category'], string> = {
  'saas': 'SaaS',
  'mobile-app': 'Mobile App',
  'web-app': 'Web App',
  'ai-ml': 'AI/ML',
  'blockchain': 'Blockchain',
  'hardware': 'Hardware',
  'other': 'Other',
}

const stageLabels: Record<Startup['stage'], string> = {
  'idea': 'Idea',
  'mvp': 'MVP',
  'beta': 'Beta',
  'launched': 'Launched',
  'scaling': 'Scaling',
}

const journalTypeLabels: Record<DevelopmentJournalEntry['type'], string> = {
  'update': 'Update',
  'milestone': 'Milestone',
  'roadmap': 'Roadmap',
  'review': 'Review',
}

const toolCategoryLabels: Record<DevelopmentTool['category'], string> = {
  'promotion': 'Promotion',
  'analytics': 'Analytics',
  'integration': 'Integration',
  'monetization': 'Monetization',
}

export default function DevelopersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // Состояние для журнала разработок
  const [activeTab, setActiveTab] = useState<'startups' | 'journal'>('startups')
  const [categoryFilter, setCategoryFilter] = useState<StartupCategory>('all')
  const [stageFilter, setStageFilter] = useState<StartupStage>('all')
  const [journalTypeFilter, setJournalTypeFilter] = useState<JournalType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Состояние для инструментов
  const [toolCategoryFilter, setToolCategoryFilter] = useState<ToolCategory>('all')
  
  // Состояние для hero секции
  const [isHeroExpanded, setIsHeroExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('developers-hero-expanded')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('developers-hero-expanded', String(isHeroExpanded))
    }
  }, [isHeroExpanded])

  // Фильтрация стартапов
  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      const matchesCategory = categoryFilter === 'all' || startup.category === categoryFilter
      const matchesStage = stageFilter === 'all' || startup.stage === stageFilter
      const matchesSearch = searchQuery === '' || 
        startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        startup.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        startup.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesCategory && matchesStage && matchesSearch
    })
  }, [categoryFilter, stageFilter, searchQuery])

  // Фильтрация журналов
  const filteredJournals = useMemo(() => {
    return developmentJournalEntries.filter((entry) => {
      const matchesType = journalTypeFilter === 'all' || entry.type === journalTypeFilter
      const matchesSearch = searchQuery === '' ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.startup.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesType && matchesSearch
    })
  }, [journalTypeFilter, searchQuery])

  // Фильтрация инструментов
  const filteredTools = useMemo(() => {
    return developmentTools.filter((tool) => {
      return toolCategoryFilter === 'all' || tool.category === toolCategoryFilter
    })
  }, [toolCategoryFilter])

  const featuredStartups = startups.filter(s => s.isFeatured)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <DevelopmentBanner storageKey="developers-dev-banner" />
      <main className="container space-y-10 pb-6 pt-6">
        {/* Hero Section */}
        <HeroSection
          isExpanded={isHeroExpanded}
          onToggle={() => setIsHeroExpanded(!isHeroExpanded)}
          stats={{
            startups: startups.length,
            publications: developmentJournalEntries.length,
            followers: startups.reduce((acc, s) => acc + s.stats.followers, 0),
            donations: startups.reduce((acc, s) => acc + s.stats.totalDonations, 0),
          }}
        />

        {/* Featured Startups */}
        {featuredStartups.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('developers.featured.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('developers.featured.description')}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Star className="h-4 w-4" />
                {t('developers.featured.viewAll')}
              </Button>
                    </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredStartups.map((startup) => (
                <FeaturedStartupCard key={startup.id} startup={startup} onClick={() => navigate(`/startup/${startup.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Main Content - Tabs */}
        <section className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'startups' | 'journal')} className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="w-fit">
                <TabsTrigger value="startups" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  {t('developers.tabs.startups')}
                </TabsTrigger>
                <TabsTrigger value="journal" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('developers.tabs.journal')}
                </TabsTrigger>
              </TabsList>

              {/* Search and Filters */}
              <div className="flex flex-1 items-center gap-2 sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('developers.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="startups" className="space-y-6 mt-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as StartupCategory)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t('developers.filters.allCategories')}</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as StartupStage)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t('developers.filters.allStages')}</option>
                  {Object.entries(stageLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {(categoryFilter !== 'all' || stageFilter !== 'all' || searchQuery) && (
                    <Button
                    variant="ghost"
                      size="sm"
                    onClick={() => {
                      setCategoryFilter('all')
                      setStageFilter('all')
                      setSearchQuery('')
                    }}
                  >
                    {t('developers.filters.reset')}
                    </Button>
                )}
              </div>

              {/* Startups Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStartups.map((startup) => (
                  <StartupCard key={startup.id} startup={startup} onClick={() => navigate(`/startup/${startup.id}`)} />
                ))}
          </div>

              {filteredStartups.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Rocket className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">{t('developers.empty.startups')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('developers.empty.startupsDescription')}</p>
                </CardContent>
              </Card>
            )}
            </TabsContent>

            <TabsContent value="journal" className="space-y-6 mt-6">
              {/* Journal Type Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {(['all', 'update', 'milestone', 'roadmap', 'review'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={journalTypeFilter === type ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setJournalTypeFilter(type)}
                    className="capitalize"
                  >
                    {type === 'all' ? t('developers.filters.allTypes') : journalTypeLabels[type]}
                  </Button>
                ))}
                </div>

              {/* Journal Entries */}
              <div className="space-y-4">
                {filteredJournals.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} onClick={() => navigate(`/journal/${entry.id}`)} />
                ))}
              </div>

              {filteredJournals.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">{t('developers.empty.journal')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('developers.empty.journalDescription')}</p>
            </CardContent>
          </Card>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Development Tools Section */}
        <section className="space-y-6 rounded-2xl border border-border/60 bg-muted/20 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              {t('developers.tools.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('developers.tools.description')}
            </p>
              </div>

          {/* Tool Category Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'promotion', 'analytics', 'integration', 'monetization'] as const).map((category) => (
              <Button
                key={category}
                variant={toolCategoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToolCategoryFilter(category)}
                className="capitalize"
              >
                {category === 'all' ? t('developers.tools.allTools') : toolCategoryLabels[category]}
              </Button>
            ))}
                </div>

          {/* Tools Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <DevelopmentToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

// ==================== COMPONENTS ====================

function FeaturedStartupCard({ startup, onClick }: { startup: Startup; onClick: () => void }) {
  return (
    <Card 
      className="group relative overflow-hidden border-border/60 bg-background shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {startup.coverImage && (
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src={startup.coverImage}
            alt={startup.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}
      <CardHeader className={cn("space-y-3", startup.coverImage && "-mt-8 relative z-10")}>
        <div className="flex items-start gap-3">
          <img
            src={startup.logo}
            alt={startup.name}
            className="h-12 w-12 rounded-lg border-2 border-background shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-tight truncate">{startup.name}</h3>
              {startup.isVerified && (
                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize text-xs">
            {categoryLabels[startup.category]}
            </Badge>
          <Badge variant="outline" className="capitalize text-xs">
            {stageLabels[startup.stage]}
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{startup.stats.followers} подписчиков</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">${(startup.stats.totalDonations / 1000).toFixed(1)}K</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StartupCard({ startup, onClick }: { startup: Startup; onClick: () => void }) {
  return (
    <Card 
      className="group relative overflow-hidden border-border/60 hover:border-border transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={startup.logo}
            alt={startup.name}
            className="h-12 w-12 rounded-lg border border-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight truncate">{startup.name}</h3>
              {startup.isVerified && (
                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {startup.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{startup.stats.followers}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{startup.stats.updates} updates</span>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {stageLabels[startup.stage]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {startup.links.website && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild onClick={(e) => e.stopPropagation()}>
              <a href={startup.links.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {startup.links.github && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild onClick={(e) => e.stopPropagation()}>
              <a href={startup.links.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {startup.links.twitter && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild onClick={(e) => e.stopPropagation()}>
              <a href={startup.links.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-3.5 w-3.5" />
          </a>
        </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function JournalEntryCard({ entry, onClick }: { entry: DevelopmentJournalEntry; onClick: () => void }) {
  const typeColors = {
    update: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    milestone: 'bg-green-500/10 text-green-700 dark:text-green-400',
    roadmap: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    review: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  }

  return (
    <Card 
      className="group overflow-hidden border-border/60 hover:border-border transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {entry.previewImage && (
          <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
            <img
              src={entry.previewImage}
              alt={entry.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="flex-1 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={entry.startup.logo}
              alt={entry.startup.name}
              className="h-10 w-10 rounded-lg border border-border flex-shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                  {entry.title}
                </h3>
                <Badge className={cn("capitalize text-xs", typeColors[entry.type])}>
                  {journalTypeLabels[entry.type]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">{entry.startup.name}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(entry.publishedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <span>•</span>
                <span>{entry.author.name}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.excerpt}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{entry.stats.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{entry.stats.reactions}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{entry.stats.comments}</span>
            </div>
          </div>
          
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function DevelopmentToolCard({ tool }: { tool: DevelopmentTool }) {
  const { t } = useTranslation()
  const iconMap: Record<string, any> = {
    TrendingUp,
    BarChart3,
    GitBranch,
    DollarSign,
    BadgeCheck,
    Mail,
    Calendar,
    FileText,
    Eye,
    FlaskConical,
    TrendingDown,
    MessageSquare,
    Bot,
    CreditCard,
    Webhook,
    Repeat,
    Users,
    Heart,
    Layout,
    LineChart,
    Rocket,
    Thermometer,
    Send,
    Activity,
    Search,
    CalendarDays,
    UserPlus,
    Video,
    UserCheck,
    MousePointerClick,
    UsersRound,
    AlertTriangle,
    PlayCircle,
    Headphones,
    Calculator,
    Receipt,
    FileSpreadsheet,
    Wallet,
    Target,
    Award,
    Magnet,
    ScanSearch,
    MessageSquareText,
    BookOpen,
  }
  
  const Icon = iconMap[tool.icon] || Zap

  return (
    <Card className="relative overflow-hidden border-border/60 hover:border-border transition-all">
      {tool.isPopular && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary/10 text-primary text-xs">
            <Star className="h-3 w-3 mr-1" />
            {t('developers.tools.popular')}
          </Badge>
        </div>
      )}
      
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight">{tool.name}</h3>
            <Badge variant="outline" className="mt-1 capitalize text-xs">
              {toolCategoryLabels[tool.category]}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {tool.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            {tool.price.type === 'free' ? (
              <span className="font-semibold text-primary">{t('developers.tools.free')}</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">${tool.price.amount}</span>
                {tool.price.period && (
                  <span className="text-xs text-muted-foreground">/{tool.price.period === 'month' ? 'мес' : tool.price.period === 'year' ? 'год' : ''}</span>
                )}
              </div>
            )}
            {tool.price.type === 'freemium' && (
              <span className="text-xs text-muted-foreground">+ free tier</span>
            )}
          </div>
          
          <Button size="sm" className="gap-2">
            {t('developers.tools.learnMore')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {tool.usedBy} {t('developers.tools.teamsUse')}
        </div>
      </CardContent>
    </Card>
  )
}

interface HeroSectionProps {
  isExpanded: boolean
  onToggle: () => void
  stats: {
    startups: number
    publications: number
    followers: number
    donations: number
  }
}

function HeroSection({ isExpanded, onToggle, stats }: HeroSectionProps) {
  const { t } = useTranslation()
  return (
    <section
      className={cn(
        'rounded-3xl border border-border/60 bg-gradient-to-br from-muted/30 via-background to-muted/20 shadow-sm transition-all duration-300 overflow-hidden',
        isExpanded ? 'p-8 max-h-[1000px]' : 'px-8 py-3 max-h-14'
      )}
    >
      {isExpanded ? (
        <div className="space-y-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
            onClick={onToggle}
            aria-label="Collapse hero section"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.3em]">
            <Rocket className="mr-2 h-3.5 w-3.5" />
            {t('developers.hero.badge')}
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('developers.hero.title')}
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              {t('developers.hero.description')}
            </p>
          </div>
          
          {/* Статистика */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.startups}</p>
                  <p className="text-xs text-muted-foreground">{t('developers.stats.activeStartups')}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.publications}</p>
                  <p className="text-xs text-muted-foreground">{t('developers.stats.publications')}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.followers}</p>
                  <p className="text-xs text-muted-foreground">{t('developers.stats.followers')}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${(stats.donations / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground">{t('developers.stats.donations')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <Rocket className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-foreground">{t('developers.hero.collapsedTitle')}</span>
          </div>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Rocket className="h-3.5 w-3.5" />
              <span>{stats.startups}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{stats.publications}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Users className="h-3.5 w-3.5" />
              <span>{stats.followers}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Heart className="h-3.5 w-3.5" />
              <span>${(stats.donations / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full -mr-1"
            onClick={onToggle}
            aria-label="Expand hero section"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </section>
  )
}
