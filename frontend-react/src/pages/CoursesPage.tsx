import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import { featuredCourses } from '@/data/mockSections'

export default function CoursesPage() {
  const navigate = useNavigate()
  const [activeLevel, setActiveLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const officialCourses = useMemo(() => featuredCourses.filter((course) => course.isOfficial), [])
  const communityCourses = useMemo(() => featuredCourses.filter((course) => !course.isOfficial), [])

  const filterByLevel = (level: typeof activeLevel, courses = featuredCourses) => {
    if (level === 'all') return courses
    return courses.filter((course) => course.level === level)
  }

  const levels: Array<{ value: typeof activeLevel; label: string }> = [
    { value: 'all', label: 'All levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-12 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Courses
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Grow with the Aetheris Academy</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Curated programs from the Aetheris team and top community experts. Build production-ready skills
              in design systems, API craftsmanship, and sustainable indie development.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/create')} className="gap-2">
                Launch your course
              </Button>
              <Button variant="outline" onClick={() => setActiveLevel('all')}>
                Browse catalog
              </Button>
            </div>
          </div>

          <Card className="border border-primary/20 bg-primary/10 shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-primary">Community Course Creators</CardTitle>
              <CardDescription className="text-sm text-primary/80">
                Earn revenue, share knowledge, and grow your audience with the community hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-primary/90">
              <p>
                The submission process is lightweight—ship your roadmap, add your modules, and launch to the Aetheris
                audience in under 24 hours. Get matched with mentors and co-instructors when you need them.
              </p>
              <Button variant="secondary" className="gap-2 text-primary" asChild>
                <a href="#become-instructor">Become an instructor</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Official curriculum</h2>
              <p className="text-sm text-muted-foreground">
                Authored by the Aetheris team and updated alongside every platform release.
              </p>
            </div>
            <Tabs value={activeLevel} onValueChange={(val) => setActiveLevel(val as typeof activeLevel)}>
              <TabsList className="bg-muted/40">
                {levels.map((level) => (
                  <TabsTrigger key={level.value} value={level.value} className="text-xs sm:text-sm">
                    {level.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filterByLevel(activeLevel, officialCourses).map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-4" id="community">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Community favorites</h2>
            <Badge variant="outline" className="rounded-md text-xs uppercase">
              curated
            </Badge>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="bg-muted/40">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {levels.map((level) => (
              <TabsContent key={level.value} value={level.value} className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filterByLevel(level.value, communityCourses).map((course) => (
                    <CourseCard key={course.id} {...course} compact />
                  ))}
                  {filterByLevel(level.value, communityCourses).length === 0 && (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                        <span>No community courses yet.</span>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/create')}>
                          Submit yours
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
          <Badge variant={price === 'free' ? 'secondary' : 'outline'} className="rounded-md uppercase tracking-wide">
            {price === 'free' ? 'Free' : 'Paid'}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="px-2 text-xs self-start">
          View syllabus
        </Button>
      </CardContent>
    </Card>
  )
}

