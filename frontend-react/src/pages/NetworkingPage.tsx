import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import type { NetworkingOpportunity } from '@/data/mockSections'
import {
  networkingOpportunities,
  networkingHighlights,
  networkingSavedSearches,
  featuredCompanies,
  talentSignals,
  networkingEvents,
} from '@/data/mockSections'
import { cn } from '@/lib/utils'

const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'hiring', label: 'Hiring' },
] as const

type CategoryFilter = (typeof categoryTabs)[number]['id']

type EngagementFilter = 'all' | 'remote' | 'hybrid' | 'onsite'

const engagementFilters: Array<{ id: EngagementFilter; label: string }> = [
  { id: 'all', label: 'Any format' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'Onsite' },
]

export default function NetworkingPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [activeEngagement, setActiveEngagement] = useState<EngagementFilter>('all')
  const [keyword, setKeyword] = useState('')

  const filteredOpportunities = useMemo(() => {
    return networkingOpportunities.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesEngagement = activeEngagement === 'all' || item.engagement === activeEngagement
      const matchesKeyword = keyword
        ? [item.title, item.summary, item.tags.join(' ')].some((field) =>
            field.toLowerCase().includes(keyword.toLowerCase())
          )
        : true
      return matchesCategory && matchesEngagement && matchesKeyword
    })
  }, [activeCategory, activeEngagement, keyword])

  const handleResetFilters = () => {
    setActiveCategory('all')
    setActiveEngagement('all')
    setKeyword('')
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-12 pt-6">
        <section className="grid gap-6 rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
              Networking marketplace
            </Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Match with collaborators, clients, and engineering mentors.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Discover verified experts, design partners, and product teams looking for their next collaborator. Every
                listing is curated by the Aetheris guild to keep conversations focused and respectful.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/create')} className="gap-2">
                Submit an opportunity
              </Button>
              <Button variant="outline" onClick={() => navigate('/developers')}>
                Browse integrator resources
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {networkingHighlights.map((highlight) => (
              <Card key={highlight.id} className="border-border/60 bg-background shadow-sm">
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                    {highlight.label}
                  </CardDescription>
                  <CardTitle className="flex items-baseline gap-2 text-2xl font-semibold">
                    {highlight.value}
                    {highlight.delta && (
                      <span className="text-xs font-medium text-emerald-500">{highlight.delta}</span>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as CategoryFilter)}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="w-fit bg-muted/40">
                {categoryTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-xs sm:text-sm">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-1">
                  {engagementFilters.map((filter) => {
                    const isActive = activeEngagement === filter.id
                    return (
                      <Button
                        key={filter.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn('text-xs', isActive && 'shadow-sm')}
                        onClick={() => setActiveEngagement(filter.id)}
                      >
                        {filter.label}
                      </Button>
                    )
                  })}
                </div>
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by skills, title, or summary"
                  className="max-w-sm"
                />
              </div>
            </div>

            <TabsContent value={activeCategory} className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredOpportunities.map((item) => (
                  <OpportunityCard key={item.id} {...item} />
                ))}
                {filteredOpportunities.length === 0 && (
                  <Card className="border-dashed bg-muted/40">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                      <span>No opportunities match your filters yet.</span>
                      <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                        Reset filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Saved searches</CardTitle>
                <CardDescription>Curate searches and receive weekly updates in your inbox.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Manage alerts
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {networkingSavedSearches.map((search) => (
                <Card key={search.id} className="border-border/50 bg-muted/30">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-sm font-semibold">{search.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {search.criteria.map((criterion) => (
                        <Badge key={criterion} variant="outline" className="rounded-md text-xs">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      Open search
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                      Set reminder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upcoming sessions</CardTitle>
              <CardDescription>Join live or async events curated by the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {networkingEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold leading-tight">{event.title}</h4>
                    <Badge variant={event.format === 'live' ? 'secondary' : 'outline'} className="rounded-md text-xs">
                      {event.format === 'live' ? 'Live' : 'Async drop'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {event.host}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Featured companies</CardTitle>
                <CardDescription>Studios and teams actively partnering with Aetheris members.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View hiring guide
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {featuredCompanies.map((company) => (
                <Card key={company.id} className="border border-border/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base font-semibold">{company.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {company.focus}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Badge variant="outline" className="rounded-md px-2">
                        {company.openings} openings
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {company.hiringFormats.map((format) => (
                          <Badge key={format} variant="secondary" className="rounded-md text-[10px] uppercase">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="px-2 text-xs" asChild>
                      <a href={`https://${company.contact}`} target="_blank" rel="noreferrer">
                        View open roles
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Talent signals</CardTitle>
              <CardDescription>High-signal members currently taking on new collaborations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {talentSignals.map((signal) => (
                <div key={signal.id} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold leading-tight">{signal.name}</h4>
                      <p className="text-xs text-muted-foreground">{signal.role}</p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-xs">
                      {signal.responseTime}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {signal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 px-2 text-xs">
                    Start intro
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function OpportunityCard({
  title,
  summary,
  tags,
  contact,
  availability,
  location,
  status,
  category,
  engagement,
  responseTime,
  budgetRange,
}: NetworkingOpportunity) {
  return (
    <Card className="flex h-full flex-col border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
          <Badge variant="secondary" className="rounded-md capitalize">
            {category}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{availability}</span>
          <span>•</span>
          <span>{location}</span>
          <span>•</span>
          <span className="capitalize">{engagement}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">{summary}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              #{tag}
            </Badge>
          ))}
        </div>
        <Separator className="my-1" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{responseTime}</span>
          {budgetRange && <span>{budgetRange}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Badge variant="outline" className="rounded-md text-xs capitalize">
            {status}
          </Badge>
          <Button variant="ghost" size="sm" className="px-2 text-xs" asChild>
            <a href={`mailto:${contact}`} aria-label={`Contact ${contact}`}>
              Request intro
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

