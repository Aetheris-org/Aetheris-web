import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import {
  developerResources,
  developerToolkits,
  developerCompatibilityMatrix,
  developerRoadmap,
  developerStarters,
  developerSnippets,
  developerOfficeHours,
  developerContributors,
  developerSupportChecklists,
} from '@/data/mockSections'
import type {
  DeveloperResource,
  DeveloperSnippet,
  DeveloperSnippetExample,
  DeveloperSupportChecklist,
} from '@/data/mockSections'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCode2,
  Gauge,
  GitBranch,
  Layers2,
  Rocket,
  ShieldCheck,
  Users,
} from 'lucide-react'

const categoryLabels: Record<DeveloperResource['category'], string> = {
  changelog: 'Changelog',
  'open-source': 'Open source',
  guideline: 'Guidelines',
  tooling: 'Tooling',
}

const categories = ['changelog', 'open-source', 'guideline', 'tooling'] as const
const statusFilters = ['all', 'stable', 'beta', 'deprecated'] as const

type CategoryFilter = (typeof categories)[number]
type StatusFilter = (typeof statusFilters)[number]

type SnippetLanguage = DeveloperSnippetExample['language']

const languageLabels: Record<SnippetLanguage, string> = {
  curl: 'cURL',
  typescript: 'TypeScript',
  bash: 'Bash',
  graphql: 'GraphQL',
}

export default function DevelopersPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('changelog')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [keyword, setKeyword] = useState('')

  const resourcesByCategory = useMemo(() => {
    return developerResources.reduce<Record<string, DeveloperResource[]>>((acc, item) => {
      const key = item.category
      acc[key] = acc[key] ? [...acc[key], item] : [item]
      return acc
    }, {})
  }, [])

  const summaryMetrics = useMemo(
    () => [
      {
        id: 'metric-1',
        label: 'Active resources',
        value: developerResources.length.toString(),
        description: 'Changelog, guides & tooling currently maintained',
        icon: FileCode2,
      },
      {
        id: 'metric-2',
        label: 'Starter templates',
        value: developerStarters.length.toString(),
        description: 'Ready-to-fork project setups for Aetheris stacks',
        icon: Rocket,
      },
      {
        id: 'metric-3',
        label: 'Office hours this month',
        value: developerOfficeHours.length.toString(),
        description: 'Live mentoring sessions with platform engineers',
        icon: Users,
      },
      {
        id: 'metric-4',
        label: 'Verified integrations',
        value: developerCompatibilityMatrix.filter((item) => item.status === 'stable').length.toString(),
        description: 'Stacks certified against the latest release',
        icon: ShieldCheck,
      },
    ],
    []
  )

  const filteredResources = useMemo(() => {
    const data = resourcesByCategory[activeCategory] ?? []
    return data.filter((resource) => {
      const matchesKeyword = keyword
        ? [resource.title, resource.summary, resource.maintainer]
            .join(' ')
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter
      return matchesKeyword && matchesStatus
    })
  }, [activeCategory, keyword, resourcesByCategory, statusFilter])

  const resetFilters = () => {
    setActiveCategory('changelog')
    setStatusFilter('all')
    setKeyword('')
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-12 pt-6">
        <section className="grid gap-6 rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
              Developer Hub
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Build, ship, and scale faster with guild-grade playbooks.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Tap into curated release notes, verified integrations, and automation kits maintained by the Aetheris
                engineering guild. Everything in one place—from sandbox-ready starters to office hours with platform mentors.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/create')} className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Publish a technical update
              </Button>
              <Button variant="outline" onClick={() => navigate('/networking')} className="gap-2">
                <Compass className="h-4 w-4" />
                Find a maintainer partner
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {summaryMetrics.map((metric) => {
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
                <CardTitle className="text-xl font-semibold">Compatibility matrix</CardTitle>
                <CardDescription>Stay on the supported path before running upgrades.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Gauge className="h-4 w-4" />
                View advisory log
              </Button>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="hidden grid-cols-[1.1fr_0.9fr_0.9fr_auto_1.4fr] gap-4 rounded-xl bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
                <span>Stack</span>
                <span>Current</span>
                <span>Recommended</span>
                <span>Status</span>
                <span>Notes</span>
              </div>
              <div className="space-y-3">
                {developerCompatibilityMatrix.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid gap-4 rounded-xl border border-border/60 bg-background/90 px-5 py-4 text-sm shadow-sm transition hover:border-border md:grid-cols-[1.1fr_0.9fr_0.9fr_auto_1.4fr]"
                  >
                    <span className="font-medium text-foreground">{entry.stack}</span>
                    <span className="text-muted-foreground">{entry.currentVersion}</span>
                    <span className="text-muted-foreground">{entry.recommendedVersion}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'w-fit min-w-[86px] justify-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
                        compatStatusClasses(entry.status)
                      )}
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground md:text-sm">{entry.notes}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Roadmap signals</CardTitle>
                <CardDescription>Track milestones across discovery, QA, and launches.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Subscribe to updates
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {developerRoadmap.map((item) => (
                <div key={item.id} className="group relative pl-6">
                  <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <Badge variant={roadmapStatusVariant(item.status)} className="capitalize">
                        {item.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target {formatDate(item.targetDate)} · {item.focus}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Starter templates</CardTitle>
                <CardDescription>Spin up production-ready projects with one command.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Layers2 className="h-4 w-4" />
                Browse templates
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {developerStarters.map((starter) => (
                <Card key={starter.id} className="border border-border/50">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-semibold">{starter.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {starter.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-3 font-mono text-xs">
                      {starter.command}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {starter.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="gap-2 px-2 text-xs">
                      <a href={starter.repoUrl} target="_blank" rel="noreferrer">
                        View repository
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Toolkit drops</CardTitle>
              <CardDescription>Automation, scripts, and integration helpers ready to use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {developerToolkits.map((toolkit) => (
                <div key={toolkit.id} className="rounded-lg border border-border/50 bg-background/80 p-4">
                  <h4 className="text-sm font-semibold leading-tight">{toolkit.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{toolkit.description}</p>
                  <Button asChild variant="ghost" size="sm" className="mt-3 gap-2 px-2 text-xs">
                    <a href={toolkit.href}>
                      {toolkit.actionLabel}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Resource library</CardTitle>
              <CardDescription>Filter by category, release status, or maintainer.</CardDescription>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-1">
                {categories.map((category) => {
                  const isActive = activeCategory === category
                  return (
                    <Button
                      key={category}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs capitalize', isActive && 'shadow-sm')}
                      onClick={() => setActiveCategory(category)}
                    >
                      {categoryLabels[category]}
                    </Button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-1">
                {statusFilters.map((status) => {
                  const isActive = statusFilter === status
                  return (
                    <Button
                      key={status}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs capitalize', isActive && 'shadow-sm')}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  )
                })}
              </div>
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search resources or maintainers"
                className="max-w-sm"
              />
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <DeveloperResourceCard key={resource.id} resource={resource} />
            ))}
            {filteredResources.length === 0 && (
              <Card className="border-dashed bg-muted/40">
                <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <span>No resources yet under these filters.</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/create')}>
                    Create update
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Integration recipes</CardTitle>
              <CardDescription>Copy-paste snippets for common workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {developerSnippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Office hours</CardTitle>
              <CardDescription>Secure a slot with guild mentors for deep technical dives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {developerOfficeHours.map((session) => (
                <div key={session.id} className="rounded-lg border border-border/40 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold leading-tight">{session.mentor}</h4>
                      <p className="text-xs text-muted-foreground">{session.role}</p>
                    </div>
                    <Badge variant={session.format === 'live' ? 'secondary' : 'outline'} className="capitalize">
                      {session.format}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{session.topic}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(session.date)}
                    </span>
                    <span>{session.slotsRemaining} slots left</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="mt-3 gap-2 px-2 text-xs">
                    <a href={session.bookingLink}>
                      Book session
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Contributor leaderboard</CardTitle>
                <CardDescription>Shout-out to the people keeping the platform resilient.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Nominate contributor
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="hidden grid-cols-4 gap-3 rounded-lg bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
                <span>Contributor</span>
                <span>Commits</span>
                <span>Issues triaged</span>
                <span>PRs merged</span>
              </div>
              {developerContributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="grid gap-3 rounded-lg border border-border/50 bg-background/80 px-4 py-3 text-sm md:grid-cols-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  </div>
                  <span>{contributor.commits}</span>
                  <span>{contributor.issuesTriaged}</span>
                  <span>{contributor.pullRequests}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Ops & support playbooks</CardTitle>
              <CardDescription>Quick checklists to keep incidents rare and calm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {developerSupportChecklists.map((checklist) => (
                <SupportChecklist key={checklist.id} checklist={checklist} />
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function DeveloperResourceCard({ resource }: { resource: DeveloperResource }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold leading-tight">{resource.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {formatDate(resource.publishedAt)} · {resource.maintainer}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md capitalize">
              {resource.category.replace('-', ' ')}
            </Badge>
            <Badge variant={resourceStatusVariant(resource.status)} className="capitalize">
              {resource.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Verified {formatDate(resource.lastVerified)}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{resource.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {resource.status === 'stable' ? 'Safe to adopt' : resource.status === 'beta' ? 'Counts as beta' : 'Sunsetting'}
          </Badge>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2 px-2 text-xs self-start">
          <a href={resource.link}>
            Open resource
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

function SnippetCard({ snippet }: { snippet: DeveloperSnippet }) {
  const [activeLanguage, setActiveLanguage] = useState<SnippetLanguage>(snippet.examples[0]?.language ?? 'typescript')

  return (
    <Card className="border border-border/60">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold leading-tight">{snippet.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {snippet.stack}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">{snippet.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as SnippetLanguage)}>
          <TabsList className="w-fit bg-muted/30">
            {snippet.examples.map((example) => (
              <TabsTrigger key={example.id} value={example.language} className="text-xs">
                {languageLabels[example.language]}
              </TabsTrigger>
            ))}
          </TabsList>
          {snippet.examples.map((example) => (
            <TabsContent key={example.id} value={example.language} className="mt-4 space-y-3">
              {example.description && (
                <p className="text-xs text-muted-foreground">{example.description}</p>
              )}
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                <pre className="max-h-60 overflow-auto p-4 text-xs font-mono text-foreground/90">
                  <code>{example.code}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SupportChecklist({ checklist }: { checklist: DeveloperSupportChecklist }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/80 p-4">
      <h4 className="text-sm font-semibold leading-tight">{checklist.title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {checklist.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function resourceStatusVariant(status: DeveloperResource['status']) {
  switch (status) {
    case 'stable':
      return 'secondary'
    case 'beta':
      return 'outline'
    case 'deprecated':
      return 'destructive'
    default:
      return 'outline'
  }
}

function compatStatusClasses(status: 'stable' | 'planned' | 'outdated') {
  switch (status) {
    case 'stable':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'planned':
      return 'border-border/60 bg-background text-muted-foreground'
    case 'outdated':
      return 'border-destructive/20 bg-destructive text-destructive-foreground'
    default:
      return ''
  }
}

function roadmapStatusVariant(status: 'in-progress' | 'qa' | 'released' | 'planned') {
  switch (status) {
    case 'released':
      return 'secondary'
    case 'in-progress':
      return 'outline'
    case 'qa':
      return 'secondary'
    case 'planned':
      return 'outline'
    default:
      return 'outline'
  }
}

