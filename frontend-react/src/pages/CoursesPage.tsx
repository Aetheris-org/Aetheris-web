import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import {
  featuredCourses,
  courseTracks,
  courseSkills,
  courseBundles,
  courseCohorts,
  courseTestimonials,
  courseFaq,
  courseCatalogSections,
} from '@/data/mockSections'
import type {
  CourseItem,
  CourseBundle,
  CourseFaqEntry,
  CourseSkill,
  CourseTestimonial,
} from '@/data/mockSections'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Compass,
  GraduationCap,
  Layers2,
  LineChart,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'
type PriceFilter = 'all' | 'free' | 'paid'

type FaqOpenState = Record<string, boolean>

export default function CoursesPage() {
  const navigate = useNavigate()
  const [activeLevel, setActiveLevel] = useState<LevelFilter>('all')
  const [activePrice, setActivePrice] = useState<PriceFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [activeBundleId, setActiveBundleId] = useState<string>(courseBundles[0]?.id ?? '')
  const [faqOpenState, setFaqOpenState] = useState<FaqOpenState>({})

  const coursesById = useMemo(() => {
    return featuredCourses.reduce<Record<string, CourseItem>>((acc, course) => {
      acc[course.id] = course
      return acc
    }, {})
  }, [])

  const officialCourses = useMemo(
    () => featuredCourses.filter((course) => course.isOfficial),
    []
  )
  const communityCourses = useMemo(
    () => featuredCourses.filter((course) => !course.isOfficial),
    []
  )

  const filterCourses = (courses: CourseItem[]) => {
    return courses.filter((course) => {
      const matchesLevel = activeLevel === 'all' || course.level === activeLevel
      const matchesPrice = activePrice === 'all' || course.price === activePrice
      const matchesKeyword = keyword
        ? [course.title, course.shortDescription, course.author]
            .join(' ')
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true
      return matchesLevel && matchesPrice && matchesKeyword
    })
  }

  const metrics = useMemo(() => {
    const totalLearners = featuredCourses.reduce((sum, course) => sum + course.students, 0)
    const averageRating = featuredCourses.reduce((sum, course) => sum + course.rating, 0) / featuredCourses.length
    return [
      {
        id: 'metric-1',
        label: 'Learners enrolled',
        value: formatNumber(totalLearners),
        description: 'Across official and community programs',
        icon: Users,
      },
      {
        id: 'metric-2',
        label: 'Average course rating',
        value: averageRating.toFixed(1),
        description: 'Based on recent learner feedback',
        icon: Star,
      },
      {
        id: 'metric-3',
        label: 'Active learning paths',
        value: courseBundles.length.toString(),
        description: 'Goal-based bundles curated by the guild',
        icon: Target,
      },
      {
        id: 'metric-4',
        label: 'Upcoming cohorts',
        value: courseCohorts.length.toString(),
        description: 'Live and hybrid batches this quarter',
        icon: CalendarDays,
      },
    ]
  }, [])

  const recommendedCourses = useMemo(() => {
    if (selectedSkills.length === 0) {
      return [...featuredCourses].sort((a, b) => b.rating - a.rating).slice(0, 3)
    }

    const courseIdSet = new Set<string>()
    courseSkills
      .filter((skill) => selectedSkills.includes(skill.id))
      .forEach((skill) => skill.courseIds.forEach((id) => courseIdSet.add(id)))

    const matched = featuredCourses.filter((course) => courseIdSet.has(course.id))
    if (matched.length > 0) {
      return matched.slice(0, 3)
    }
    return [...featuredCourses].sort((a, b) => b.rating - a.rating).slice(0, 3)
  }, [selectedSkills])

  const activeBundle = useMemo(() => courseBundles.find((bundle) => bundle.id === activeBundleId) ?? courseBundles[0], [activeBundleId])

  const comparisonCourses = useMemo(() => {
    return [...featuredCourses].sort((a, b) => b.rating - a.rating).slice(0, 4)
  }, [])

  const catalogDefault = courseCatalogSections[0]?.id ?? 'catalog-1'

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  const resetFilters = () => {
    setActiveLevel('all')
    setActivePrice('all')
    setKeyword('')
  }

  const toggleFaq = (faqId: string) => {
    setFaqOpenState((prev) => ({ ...prev, [faqId]: !prev[faqId] }))
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-12 pt-6">
        <section className="grid gap-6 rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
              Courses & Tracks
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Grow from idea to launch-ready cohorts with the Aetheris Guild.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Combine shadcn-powered UI, Strapi workflows, and mentorship automations. Pick a skill, join a cohort, or
                follow a curated bundle—everything is built to help you ship faster.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/create')} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Launch your course
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setSelectedSkills([])}>
                <Compass className="h-4 w-4" />
                Clear personalisation
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.id} className="border-border/60 bg-background/90 shadow-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
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

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Personalize your journey</CardTitle>
                <CardDescription>Select focus areas to refresh recommendations.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedSkills([])}>
                Reset skills
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {courseSkills.map((skill) => {
                  const isActive = selectedSkills.includes(skill.id)
                  return (
                    <Button
                      key={skill.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('gap-2 rounded-full px-3 text-xs', isActive && 'shadow-sm')}
                      onClick={() => toggleSkill(skill.id)}
                    >
                      <Layers2 className="h-3.5 w-3.5" />
                      {skill.label}
                    </Button>
                  )
                })}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {selectedSkills.length === 0 ? (
                  <p>Choose up to three topics to adapt the suggestions below.</p>
                ) : (
                  <p>
                    Showing matches for{' '}
                    <span className="font-medium text-foreground">{selectedSkills.map((id) => skillLabel(id)).join(', ')}</span>.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <CourseCard key={`recommended-${course.id}`} {...course} compact />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Goal-based bundles</CardTitle>
              <CardDescription>Step-by-step paths curated by the guild.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeBundle?.id ?? activeBundleId} onValueChange={setActiveBundleId}>
                <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30">
                  {courseBundles.map((bundle) => (
                    <TabsTrigger key={bundle.id} value={bundle.id} className="flex-1 whitespace-normal text-xs">
                      {bundle.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {courseBundles.map((bundle) => (
                  <TabsContent key={bundle.id} value={bundle.id} className="mt-4 space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{bundle.goal}</p>
                      <p>{bundle.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-md text-xs uppercase">
                          {bundle.duration}
                        </Badge>
                        <Badge variant="outline" className="rounded-md text-xs uppercase">
                          {bundle.focus}
                        </Badge>
                        <Badge variant="outline" className="rounded-md text-xs uppercase">
                          {bundle.bestFor}
                        </Badge>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {bundle.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-3.5 w-3.5 text-primary" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid gap-3">
                      {bundle.courseIds.map((courseId) => {
                        const course = coursesById[courseId]
                        if (!course) return null
                        return <CourseSummaryRow key={`${bundle.id}-${course.id}`} course={course} />
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Refine catalog</CardTitle>
              <CardDescription>Filter courses by level, price, or keywords to tailor your learning path.</CardDescription>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-1">
                {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((level) => {
                  const isActive = activeLevel === level
                  return (
                    <Button
                      key={level}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs capitalize', isActive && 'shadow-sm')}
                      onClick={() => setActiveLevel(level)}
                    >
                      {level}
                    </Button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-1">
                {(['all', 'free', 'paid'] as PriceFilter[]).map((filter) => {
                  const isActive = activePrice === filter
                  return (
                    <Button
                      key={filter}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs capitalize', isActive && 'shadow-sm')}
                      onClick={() => setActivePrice(filter)}
                    >
                      {filter}
                    </Button>
                  )
                })}
              </div>
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search courses or instructors"
                className="max-w-sm"
              />
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filterCourses(officialCourses).map((course) => (
              <CourseCard key={`official-${course.id}`} {...course} />
            ))}
            {filterCourses(officialCourses).length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <span>No courses match your filters yet.</span>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 rounded-xl border border-border/60 bg-muted/10 p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-semibold">Cohort calendar</CardTitle>
            <CardDescription>Reserve a seat in upcoming live and hybrid batches.</CardDescription>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {courseCohorts.map((cohort) => {
              const course = coursesById[cohort.courseId]
              return (
                <Card key={cohort.id} className="border border-border/60">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base font-semibold">{cohort.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {course?.title ?? 'Course'} · {cohort.format.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{cohort.seats} seats · {cohort.status === 'enrolling' ? 'Enrolling now' : cohort.status === 'waitlist' ? 'Join waitlist' : 'Closed'}</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      Join cohort
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Course comparison</CardTitle>
              <CardDescription>Evaluate delivery formats, difficulty, and outcomes side-by-side.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.6fr_0.8fr] gap-4 rounded-xl bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
                <span>Course</span>
                <span>Level</span>
                <span>Format</span>
                <span>Duration</span>
                <span>Price</span>
                <span>Rating</span>
              </div>
              <div className="space-y-3">
                {comparisonCourses.map((course) => (
                  <div
                    key={`comparison-${course.id}`}
                    className="grid gap-4 rounded-xl border border-border/60 bg-background/90 px-5 py-4 text-sm shadow-sm transition hover:border-border md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.6fr_0.8fr]"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{course.title}</span>
                      <span className="text-xs text-muted-foreground">{course.author}</span>
                    </div>
                    <span className="capitalize text-muted-foreground">{course.level}</span>
                    <span className="capitalize text-muted-foreground">{course.format}</span>
                    <span className="text-muted-foreground">{course.duration}</span>
                    <Badge variant={course.price === 'free' ? 'secondary' : 'outline'} className="w-fit rounded-md uppercase">
                      {course.price}
                    </Badge>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-4 w-4 text-primary" />
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Instructor spotlight</CardTitle>
              <CardDescription>Meet the creators behind our most-loved courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseTracks.slice(0, 2).map((track) => (
                <div key={`spotlight-${track.id}`} className="rounded-lg border border-border/40 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold leading-tight">{track.mentor ?? 'Aetheris Studio'}</h4>
                      <p className="text-xs text-muted-foreground">{track.title}</p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-xs">
                      {track.modules.length} modules
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{track.description}</p>
                  <Button variant="ghost" size="sm" className="mt-3 gap-2 px-2 text-xs">
                    View track
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-semibold">Course catalog</CardTitle>
            <CardDescription>Preview the full library by focus area.</CardDescription>
          </div>
          <Tabs defaultValue={catalogDefault}>
            <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30">
              {courseCatalogSections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="flex-1 whitespace-normal text-xs">
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {courseCatalogSections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-6 space-y-6">
                <p className="max-w-2xl text-sm text-muted-foreground">{section.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.courseIds.map((courseId) => {
                    const course = coursesById[courseId]
                    if (!course) return null
                    return <CourseCard key={`catalog-${section.id}-${course.id}`} {...course} compact />
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Learner stories</CardTitle>
              <CardDescription>Real output from creators and teams shipping with Aetheris.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {courseTestimonials.map((testimonial) => {
                const course = coursesById[testimonial.courseId]
                return (
                  <Card key={testimonial.id} className="border border-border/50">
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-base font-semibold leading-tight">{testimonial.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">{testimonial.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p className="leading-relaxed">“{testimonial.quote}”</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{course?.title ?? 'Course'}</span>
                        <Badge variant="outline" className="rounded-md text-xs uppercase">
                          {testimonial.outcome}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Become a mentor</CardTitle>
              <CardDescription>Share expertise, review projects, and host paid sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Mentors earn revenue shares, access async tooling, and join the guild feedback roster. Tell us about your
                background and weʼll match you with a pilot cohort.
              </p>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Submit mentor profile
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 rounded-xl border border-border/60 bg-muted/10 p-6 shadow-sm">
          <CardTitle className="text-xl font-semibold">Frequently asked</CardTitle>
          <div className="space-y-3">
            {courseFaq.map((faq) => (
              <Card key={faq.id} className="border-border/40">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="text-sm font-semibold text-foreground">{faq.question}</span>
                  <LineChart
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      faqOpenState[faq.id] && 'rotate-90'
                    )}
                  />
                </button>
                {faqOpenState[faq.id] && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

interface CourseCardProps {
  id: string
  title: string
  shortDescription: string
  author: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: 'free' | 'paid'
  isOfficial: boolean
  format: 'async' | 'live' | 'hybrid'
  rating: number
  students: number
  skills: string[]
  compact?: boolean
}

function CourseCard({
  title,
  shortDescription,
  author,
  level,
  duration,
  price,
  isOfficial,
  format,
  rating,
  students,
  skills,
  compact,
}: CourseCardProps) {
  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
          <Badge variant={isOfficial ? 'secondary' : 'outline'} className="rounded-md text-xs uppercase">
            {isOfficial ? 'Official' : 'Community'}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {author} · {duration}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p className={compact ? 'line-clamp-3' : ''}>{shortDescription}</p>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="rounded-md capitalize">
            {level}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-md capitalize">
              {format}
            </Badge>
            <Badge variant={price === 'free' ? 'secondary' : 'outline'} className="rounded-md uppercase tracking-wide">
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
        {!compact && (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-md text-xs capitalize">
                {skill.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        )}
        <Button variant="ghost" size="sm" className="px-2 text-xs self-start">
          View syllabus
        </Button>
      </CardContent>
    </Card>
  )
}

function CourseSummaryRow({ course }: { course: CourseItem }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-background/80 px-3 py-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{course.title}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" className="rounded-md capitalize">
          {course.level}
        </Badge>
        <Badge variant="outline" className="rounded-md capitalize">
          {course.format}
        </Badge>
        <span>{course.duration}</span>
      </div>
    </div>
  )
}

function skillLabel(skillId: string) {
  const skill = courseSkills.find((item) => item.id === skillId)
  return skill ? skill.label : skillId
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

