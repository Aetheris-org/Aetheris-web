import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  courseBundles,
  courseCohorts,
  courseFaq,
  courseSkills,
  courseTestimonials,
  featuredCourses,
} from '@/data/mockSections'
import type { CourseBundle, CourseFaqEntry, CourseItem } from '@/data/mockSections'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Compass,
  Sparkles,
  Star,
  Target,
  Users,
} from 'lucide-react'

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'
type PriceFilter = 'all' | 'free' | 'paid'

export default function CoursesPage() {
  const navigate = useNavigate()
  const [activeLevel, setActiveLevel] = useState<LevelFilter>('all')
  const [activePrice, setActivePrice] = useState<PriceFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const heroMetrics = useMemo(() => {
    const totalLearners = featuredCourses.reduce((sum, course) => sum + course.students, 0)
    const officialCount = featuredCourses.filter((course) => course.isOfficial).length
    const topRating =
      featuredCourses.reduce((sum, course) => sum + course.rating, 0) / featuredCourses.length

    return [
      {
        id: 'metric-1',
        label: 'Learners',
        value: formatNumber(totalLearners),
        description: 'Creators enrolled across the guild',
        icon: Users,
      },
      {
        id: 'metric-2',
        label: 'Official programs',
        value: officialCount.toString(),
        description: 'Certificate-ready cohorts curated by Aetheris',
        icon: Target,
      },
      {
        id: 'metric-3',
        label: 'Avg. rating',
        value: topRating.toFixed(1),
        description: 'Learner feedback across all tracks',
        icon: Star,
      },
    ]
  }, [])

  const filteredCourses = useMemo(() => {
    return featuredCourses.filter((course) => {
      const matchesLevel = activeLevel === 'all' || course.level === activeLevel
      const matchesPrice = activePrice === 'all' || course.price === activePrice
      const matchesKeyword = keyword
        ? [course.title, course.shortDescription, course.author]
            .join(' ')
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) => course.skills.includes(skill))

      return matchesLevel && matchesPrice && matchesKeyword && matchesSkills
    })
  }, [activeLevel, activePrice, keyword, selectedSkills])

  const officialResults = filteredCourses.filter((course) => course.isOfficial)
  const communityResults = filteredCourses.filter((course) => !course.isOfficial)

  const recommendedCourses = useMemo(() => {
    if (selectedSkills.length === 0) {
      return [...featuredCourses].sort((a, b) => b.rating - a.rating).slice(0, 3)
    }

    const courseIdScore = new Map<string, number>()
    selectedSkills.forEach((skillId) => {
      const skill = courseSkills.find((item) => item.id === skillId)
      skill?.courseIds.forEach((courseId) => {
        courseIdScore.set(courseId, (courseIdScore.get(courseId) ?? 0) + 1)
      })
    })

    const scored = featuredCourses
      .map((course) => ({
        course,
        score: courseIdScore.get(course.id) ?? 0,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.course.rating - a.course.rating)
      .map((item) => item.course)

    if (scored.length > 0) {
      return scored.slice(0, 3)
    }

    return [...featuredCourses].sort((a, b) => b.rating - a.rating).slice(0, 3)
  }, [selectedSkills])

  const resetFilters = () => {
    setActiveLevel('all')
    setActivePrice('all')
    setKeyword('')
    setSelectedSkills([])
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container flex flex-col gap-10 pb-16 pt-6">
        <HeroSection
          metrics={heroMetrics}
          onLaunchClick={() => navigate('/create')}
          onExploreClick={() => resetFilters()}
          selectedSkills={selectedSkills}
          onClearSkills={() => setSelectedSkills([])}
        />

        <FiltersPanel
          activeLevel={activeLevel}
          onLevelChange={setActiveLevel}
          activePrice={activePrice}
          onPriceChange={setActivePrice}
          keyword={keyword}
          onKeywordChange={setKeyword}
          selectedSkills={selectedSkills}
          onToggleSkill={toggleSkill}
          onResetFilters={resetFilters}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Courses</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'result' : 'results'} based on
                  your filters
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>

            <CourseResultsSection
              title="Official programs"
              description="Certificate-backed experiences curated by the Aetheris team."
              courses={officialResults}
              onResetFilters={resetFilters}
            />

            <CourseResultsSection
              title="Community courses"
              description="Peer-led workshops and on-demand series from guild creators."
              courses={communityResults}
              onResetFilters={resetFilters}
            />
          </div>

          <aside className="space-y-6">
            <RecommendedCard courses={recommendedCourses} />
            <LearningPathsCard bundles={courseBundles} />
            <CohortsCard cohorts={courseCohorts} />
            <TestimonialsCard testimonials={courseTestimonials.slice(0, 2)} />
            <QuickFaqCard faqs={courseFaq.slice(0, 3)} />
          </aside>
        </div>
      </main>
    </div>
  )
}

interface HeroSectionProps {
  metrics: Array<{
    id: string
    label: string
    value: string
    description: string
    icon: typeof Users
  }>
  onLaunchClick: () => void
  onExploreClick: () => void
  selectedSkills: string[]
  onClearSkills: () => void
}

function HeroSection({
  metrics,
  onLaunchClick,
  onExploreClick,
  selectedSkills,
  onClearSkills,
}: HeroSectionProps) {
  return (
    <section className="grid gap-6 rounded-3xl border border-border/60 bg-muted/20 p-6 shadow-sm md:p-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
          Courses · Cohorts
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Build, launch, and grow with Aetheris learning paths.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Choose a verified program or fast-track with community-built workshops. Every cohort blends shadcn/ui
            foundations, Strapi automation, and real operator tactics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onLaunchClick} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Launch your course
          </Button>
          <Button variant="outline" className="gap-2" onClick={onExploreClick}>
            <Compass className="h-4 w-4" />
            Explore catalog
          </Button>
          {selectedSkills.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearSkills}>
              Clear focus areas
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card
              key={metric.id}
              className="border-border/60 bg-background/90 shadow-sm transition hover:border-border"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                    {metric.label}
                  </CardDescription>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <CardTitle className="text-2xl font-semibold">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                {metric.description}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

interface FiltersPanelProps {
  activeLevel: LevelFilter
  onLevelChange: (value: LevelFilter) => void
  activePrice: PriceFilter
  onPriceChange: (value: PriceFilter) => void
  keyword: string
  onKeywordChange: (value: string) => void
  selectedSkills: string[]
  onToggleSkill: (skillId: string) => void
  onResetFilters: () => void
}

function FiltersPanel({
  activeLevel,
  onLevelChange,
  activePrice,
  onPriceChange,
  keyword,
  onKeywordChange,
  selectedSkills,
  onToggleSkill,
  onResetFilters,
}: FiltersPanelProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-semibold">Refine your search</CardTitle>
            <CardDescription>Combine filters to narrow the catalog in a couple of clicks.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-search" className="text-xs uppercase tracking-wide text-muted-foreground">
              Keyword
            </Label>
            <Input
              id="course-search"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Search by course, instructor, or outcome"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FilterToggleGroup
              label="Level"
              options={['all', 'beginner', 'intermediate', 'advanced']}
              activeValue={activeLevel}
              onChange={(value) => onLevelChange(value as LevelFilter)}
            />
            <FilterToggleGroup
              label="Price"
              options={['all', 'free', 'paid']}
              activeValue={activePrice}
              onChange={(value) => onPriceChange(value as PriceFilter)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Focus areas</Label>
            {selectedSkills.length > 0 && (
              <span className="text-xs text-muted-foreground">{selectedSkills.length} selected</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {courseSkills.map((skill) => {
              const isActive = selectedSkills.includes(skill.id)
              return (
                <Button
                  key={skill.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2 rounded-full px-3 text-xs transition',
                    isActive && 'shadow-sm'
                  )}
                  onClick={() => onToggleSkill(skill.id)}
                >
                  {skill.label}
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface FilterToggleGroupProps {
  label: string
  options: string[]
  activeValue: string
  onChange: (value: string) => void
}

function FilterToggleGroup({ label, options, activeValue, onChange }: FilterToggleGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2 rounded-lg border border-border/60 bg-muted/20 p-1">
        {options.map((option) => {
          const isActive = activeValue === option
          return (
            <Button
              key={option}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('text-xs capitalize', isActive && 'shadow-sm')}
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface CourseResultsSectionProps {
  title: string
  description: string
  courses: CourseItem[]
  onResetFilters: () => void
}

function CourseResultsSection({
  title,
  description,
  courses,
  onResetFilters,
}: CourseResultsSectionProps) {
  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} match your filters right now.
          </p>
          <Button size="sm" variant="outline" onClick={onResetFilters}>
            Reset filters
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="rounded-md text-xs uppercase">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}

function CourseCard({ course }: { course: CourseItem }) {
  const { title, shortDescription, author, level, duration, price, isOfficial, format, rating, students, skills } =
    course

  return (
    <Card className="h-full border-border/60 shadow-sm transition hover:border-border">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {author} · {duration}
            </CardDescription>
          </div>
          <Badge variant={isOfficial ? 'secondary' : 'outline'} className="rounded-md text-xs uppercase">
            {isOfficial ? 'Official' : 'Community'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p className="line-clamp-3">{shortDescription}</p>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="rounded-md capitalize">
            {level}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-md capitalize">
              {format}
            </Badge>
            <Badge
              variant={price === 'free' ? 'secondary' : 'outline'}
              className="rounded-md uppercase tracking-wide"
            >
              {price === 'free' ? 'Free' : 'Paid'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-primary" />
            {rating.toFixed(1)}
          </span>
          <span>{formatNumber(students)} learners</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="rounded-md text-xs capitalize">
              {skill.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="px-2 text-xs">
          View syllabus
        </Button>
      </CardContent>
    </Card>
  )
}

function RecommendedCard({ courses }: { courses: CourseItem[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Suggested for you</CardTitle>
        <CardDescription>Curated with your focus areas and learner ratings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.map((course) => (
          <div
            key={`recommended-${course.id}`}
            className="rounded-lg border border-border/40 bg-background/90 p-3 text-sm text-muted-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.author}</p>
              </div>
              <Badge variant="outline" className="rounded-md text-xs capitalize">
                {course.level}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-primary" />
                {course.rating.toFixed(1)}
              </span>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                View
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function LearningPathsCard({ bundles }: { bundles: CourseBundle[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Learning paths</CardTitle>
        <CardDescription>Follow a structured sprint with defined outcomes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {bundles.map((bundle) => (
            <AccordionItem key={bundle.id} value={bundle.id} className="border-border/40">
              <AccordionTrigger className="text-left text-sm font-medium">
                {bundle.title}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{bundle.goal}</p>
                <p>{bundle.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="rounded-md uppercase">
                    {bundle.duration}
                  </Badge>
                  <Badge variant="outline" className="rounded-md uppercase">
                    {bundle.focus}
                  </Badge>
                  <Badge variant="outline" className="rounded-md uppercase">
                    {bundle.bestFor}
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function CohortsCard({ cohorts }: { cohorts: typeof courseCohorts }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Upcoming cohorts</CardTitle>
        <CardDescription>Reserve a seat before enrollment closes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {cohorts.map((cohort) => (
          <div
            key={cohort.id}
            className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm text-muted-foreground"
          >
            <p className="font-medium text-foreground">{cohort.title}</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {cohort.seats} seats · {formatCohortStatus(cohort.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function TestimonialsCard({
  testimonials,
}: {
  testimonials: typeof courseTestimonials
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Learner stories</CardTitle>
        <CardDescription>Proof from teams shipping real outcomes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="space-y-2 rounded-lg border border-border/40 bg-background/90 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">“{testimonial.quote}”</p>
            <Badge variant="outline" className="rounded-md text-xs uppercase">
              {testimonial.outcome}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function QuickFaqCard({ faqs }: { faqs: CourseFaqEntry[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">FAQ</CardTitle>
        <CardDescription>Fast answers before you join a cohort.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-border/40">
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatCohortStatus(status: 'enrolling' | 'waitlist' | 'closed') {
  if (status === 'enrolling') return 'Enrolling'
  if (status === 'waitlist') return 'Waitlist open'
  return 'Closed'
}