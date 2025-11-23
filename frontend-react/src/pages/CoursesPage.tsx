import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'
import {
  BookOpen,
  Clock,
  Filter,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  Award,
  Play,
  CheckCircle2,
  DollarSign,
  Lock,
  Crown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import type { Course, CourseFilters } from '@/types/courses'
import { mockCourses, mockCategories, mockAuthors } from '@/data/coursesMockData'

type ViewMode = 'all' | 'verified' | 'community'

export default function CoursesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [selectedLevel, setSelectedLevel] = useState<Course['level']>()
  const [selectedPricing, setSelectedPricing] = useState<'free' | 'paid' | 'subscription' | 'level-gated'>()
  
  // Состояние для hero секции
  const [isHeroExpanded, setIsHeroExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('courses-hero-expanded')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('courses-hero-expanded', String(isHeroExpanded))
    }
  }, [isHeroExpanded])

  // Filter courses based on current filters
  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      // View mode filter
      if (viewMode === 'verified' && !course.isVerified) return false
      if (viewMode === 'community' && course.isVerified) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.author.username.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategory && course.category !== selectedCategory) return false

      // Level filter
      if (selectedLevel && course.level !== selectedLevel) return false

      // Pricing filter
      if (selectedPricing) {
        if (course.access.pricing.type !== selectedPricing) return false
      }

      return true
    })
  }, [viewMode, searchQuery, selectedCategory, selectedLevel, selectedPricing])

  const verifiedCourses = filteredCourses.filter((c) => c.isVerified)
  const communityCourses = filteredCourses.filter((c) => !c.isVerified)

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = mockCourses.reduce((sum, course) => sum + course.stats.enrolledStudents, 0)
    const verifiedCount = mockCourses.filter((c) => c.isVerified).length
    const avgRating =
      mockCourses.reduce((sum, course) => sum + course.stats.averageRating, 0) / mockCourses.length

    return {
      totalCourses: mockCourses.length,
      totalStudents,
      verifiedCount,
      avgRating: avgRating.toFixed(1),
      activeCreators: mockAuthors.length,
    }
  }, [])

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory(undefined)
    setSelectedLevel(undefined)
    setSelectedPricing(undefined)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedLevel || selectedPricing

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <DevelopmentBanner storageKey="courses-dev-banner" />
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <HeroSection
          isExpanded={isHeroExpanded}
          onToggle={() => setIsHeroExpanded(!isHeroExpanded)}
          stats={stats}
          onCreateCourse={() => navigate('/courses/create')}
          onViewVerified={() => setViewMode('verified')}
        />

        {/* Filters Section */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{t('courses.filters.title')}</CardTitle>
                <CardDescription>
                  {t('courses.filters.description')}
                </CardDescription>
            </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {t('courses.filters.reset')}
              </Button>
          )}
            </div>
                  </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={t('courses.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
          </div>

            {/* Filter buttons */}
            <div className="space-y-4">
        <div className="space-y-2">
                <Label className="text-sm font-medium">{t('courses.filters.category')}</Label>
              <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedCategory ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(undefined)}
                  >
                    {t('courses.filters.all')}
                  </Button>
                  {mockCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSelectedCategory(selectedCategory === category.name ? undefined : category.name)
                      }
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('courses.filters.level')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setSelectedLevel(selectedLevel === level ? undefined : (level as Course['level']))
                        }
                      >
                        {level === 'beginner' && t('courses.filters.beginner')}
                        {level === 'intermediate' && t('courses.filters.intermediate')}
                        {level === 'advanced' && t('courses.filters.advanced')}
                        {level === 'expert' && t('courses.filters.expert')}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('courses.filters.access')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'free', label: t('courses.filters.free') },
                      { value: 'paid', label: t('courses.filters.paid') },
                      { value: 'subscription', label: t('courses.filters.subscription') },
                      { value: 'level-gated', label: t('courses.filters.levelGated') },
                    ].map((pricing) => (
                      <Button
                        key={pricing.value}
                        variant={selectedPricing === pricing.value ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setSelectedPricing(
                            selectedPricing === pricing.value
                              ? undefined
                              : (pricing.value as typeof selectedPricing)
                          )
                        }
                      >
                        {pricing.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t('courses.tabs.all')}
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {t('courses.tabs.verified')}
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" />
              {t('courses.tabs.community')}
                    </TabsTrigger>
                </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {verifiedCourses.length > 0 && (
              <CourseSection
                title={t('courses.sections.verified.title')}
                description={t('courses.sections.verified.description')}
                courses={verifiedCourses}
                icon={ShieldCheck}
              />
            )}

            {communityCourses.length > 0 && (
              <>
                {verifiedCourses.length > 0 && <Separator />}
                <CourseSection
                  title={t('courses.sections.community.title')}
                  description={t('courses.sections.community.description')}
                  courses={communityCourses}
                  icon={Users}
                />
              </>
            )}

            {filteredCourses.length === 0 && (
              <EmptyState
                title={t('courses.empty.title')}
                description={t('courses.empty.description')}
                onReset={resetFilters}
              />
            )}
          </TabsContent>

          <TabsContent value="verified" className="space-y-6 mt-6">
            {verifiedCourses.length > 0 ? (
              <CourseSection
                title={t('courses.sections.verified.title')}
                description={t('courses.sections.verified.description')}
                courses={verifiedCourses}
                icon={ShieldCheck}
              />
            ) : (
              <EmptyState
                title={t('courses.empty.verifiedTitle')}
                description={t('courses.empty.verifiedDescription')}
                onReset={resetFilters}
              />
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-6 mt-6">
            {communityCourses.length > 0 ? (
              <CourseSection
                title={t('courses.sections.community.title')}
                description={t('courses.sections.community.description')}
                courses={communityCourses}
                icon={Users}
              />
            ) : (
              <EmptyState
                title={t('courses.empty.communityTitle')}
                description={t('courses.empty.communityDescription')}
                onReset={resetFilters}
              />
            )}
                  </TabsContent>
              </Tabs>
      </main>
            </div>
  )
}

interface StatCardProps {
  icon: typeof BookOpen
  label: string
  value: string
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
                  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
              </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
  )
}

interface CourseSectionProps {
  title: string
  description: string
  courses: Course[]
  icon: typeof ShieldCheck
}

function CourseSection({ title, description, courses, icon: Icon }: CourseSectionProps) {
              return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
                    </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
              </div>
        <Badge variant="secondary" className="ml-auto">
          {courses.length}
                    </Badge>
                  </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
  )
}

interface CourseCardProps {
  course: Course
}

function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const getPricingBadge = () => {
    switch (course.access.pricing.type) {
      case 'free':
        return (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {t('courses.filters.free')}
          </Badge>
        )
      case 'paid':
        return (
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {course.access.pricing.price} {course.access.pricing.currency}
          </Badge>
        )
      case 'subscription':
        return (
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            {course.access.pricing.requiredTier}
          </Badge>
        )
      case 'level-gated':
        return (
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            Уровень {course.access.pricing.requiredLevel}+
          </Badge>
        )
    }
  }

  return (
    <Card
      className="group h-full cursor-pointer border-border/60 transition-all hover:border-border hover:shadow-md"
      onClick={() => navigate(`/courses/${course.slug}`)}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {course.author.username}
              {course.author.verified && (
                <CheckCircle2 className="inline-block ml-1 h-3 w-3 text-primary" />
              )}
            </CardDescription>
          </div>
          {course.isVerified && (
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDescription}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-medium">{course.stats.averageRating}</span>
            <span>({formatNumber(course.stats.totalReviews)})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{formatNumber(course.stats.enrolledStudents)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(course.totalDuration)}</span>
          </div>
        </div>

        {/* Level and Pricing */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {course.level === 'beginner' && t('courses.filters.beginner')}
            {course.level === 'intermediate' && t('courses.filters.intermediate')}
            {course.level === 'advanced' && t('courses.filters.advanced')}
            {course.level === 'expert' && t('courses.filters.expert')}
          </Badge>
          {getPricingBadge()}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {course.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{course.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Certificate badge */}
        {course.providesCertificate && (
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">{t('courses.card.certificate')}</span>
          </div>
        )}

        {/* CTA */}
        <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Play className="h-4 w-4" />
          {t('courses.card.startLearning')}
        </Button>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  onReset: () => void
}

function EmptyState({ title, description, onReset }: EmptyStateProps) {
  const { t } = useTranslation()
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Filter className="h-8 w-8 text-muted-foreground" />
      </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button variant="outline" onClick={onReset}>
          {t('courses.filters.reset')}
              </Button>
      </CardContent>
    </Card>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

interface HeroSectionProps {
  isExpanded: boolean
  onToggle: () => void
  stats: {
    totalCourses: number
    totalStudents: number
    verifiedCount: number
    avgRating: string
    activeCreators: number
  }
  onCreateCourse: () => void
  onViewVerified: () => void
}

function HeroSection({ isExpanded, onToggle, stats, onCreateCourse, onViewVerified }: HeroSectionProps) {
  const { t } = useTranslation()
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all duration-300',
        isExpanded ? 'p-8 md:p-12 max-h-[1000px]' : 'px-8 py-3 max-h-14'
      )}
    >
      {isExpanded ? (
        <div className="relative z-10 space-y-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8 rounded-full z-20"
            onClick={onToggle}
            aria-label="Collapse hero section"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('courses.hero.badge')}</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t('courses.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('courses.hero.description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={onCreateCourse}>
              <Sparkles className="h-4 w-4" />
              {t('courses.hero.createCourse')}
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={onViewVerified}>
              <ShieldCheck className="h-4 w-4" />
              {t('courses.hero.viewVerified')}
            </Button>
              </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <StatCard icon={BookOpen} label={t('courses.stats.courses')} value={stats.totalCourses.toString()} />
            <StatCard icon={Users} label={t('courses.stats.students')} value={formatNumber(stats.totalStudents)} />
            <StatCard icon={ShieldCheck} label={t('courses.stats.verified')} value={stats.verifiedCount.toString()} />
            <StatCard icon={Star} label={t('courses.stats.avgRating')} value={stats.avgRating} />
              </div>
      </div>
      ) : (
        <div className="flex items-center gap-3 w-full relative z-10">
          <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-foreground">{t('courses.hero.collapsedTitle')}</span>
          </div>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{stats.totalCourses}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Users className="h-3.5 w-3.5" />
              <span>{formatNumber(stats.totalStudents)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{stats.verifiedCount}</span>
    </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Star className="h-3.5 w-3.5" />
              <span>{stats.avgRating}</span>
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
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0" />
    </section>
  )
}
