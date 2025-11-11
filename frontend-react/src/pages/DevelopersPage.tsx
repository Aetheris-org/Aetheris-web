import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/SiteHeader'
import { developerResources } from '@/data/mockSections'

const categoryLabels: Record<string, string> = {
  changelog: 'Changelog',
  'open-source': 'Open source',
  guideline: 'Guidelines',
  tooling: 'Tooling',
}

export default function DevelopersPage() {
  const navigate = useNavigate()

  const resourcesByCategory = useMemo(() => {
    return developerResources.reduce<Record<string, typeof developerResources>>((acc, item) => {
      const key = item.category
      acc[key] = acc[key] ? [...acc[key], item] : [item]
      return acc
    }, {})
  }, [])

  const categories = ['changelog', 'open-source', 'guideline', 'tooling'] as const

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-12 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Developer Hub
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Tools, changelog, and deep-dives for builders
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Track the Aetheris platform roadmap, explore integration kits, and learn best practices from the
              community engineering guild.
            </p>
          </div>

          <Card className="border-border/60 bg-muted/40">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Need something shipped fast?</CardTitle>
              <CardDescription>
                Drop into the networking section to find certified maintainers who specialize in Aetheris deployments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={() => navigate('/networking')}>
                Find a maintainer
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Latest resources</h2>
              <p className="text-sm text-muted-foreground">
                Quick access to the newest changelog entries, OSS drops, and integration toolkits.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/create')}>
              Publish a technical update
            </Button>
          </div>

          <Tabs defaultValue="changelog">
            <TabsList className="flex w-full flex-wrap gap-1 bg-muted/40 p-1">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs sm:text-sm capitalize">
                  {categoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6 space-y-4">
                {resourcesByCategory[category]?.length ? (
                  resourcesByCategory[category].map((resource) => (
                    <DeveloperCard key={resource.id} {...resource} />
                  ))
                ) : (
                  <Card className="border-dashed bg-muted/40">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                      <span>No updates yet.</span>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/create')}>
                        Create post
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <Separator />

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Platform SDK & tooling</CardTitle>
              <CardDescription>
                Generate client SDKs, manage webhooks, and sync schema changes straight from your command line.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Aetheris CLI scaffolds new experiences with shadcn-based dashboards, adds Storybook stories, and
                bootstraps Strapi content types with sensible defaults.
              </p>
              <Button variant="outline">View CLI docs</Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Community engineering guild</CardTitle>
              <CardDescription>
                Pair with other maintainers, co-author guides, or run live debugging sessions twice a month.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The guild operates a rotating mentorship roster, open office hours, and shared knowledge base. Perfect
                for first-time integrators and seasoned architects alike.
              </p>
              <Button variant="outline">Join the guild</Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

interface DeveloperCardProps {
  id: string
  title: string
  category: 'changelog' | 'open-source' | 'guideline' | 'tooling'
  summary: string
  link: string
  publishedAt: string
  maintainer: string
}

function DeveloperCard({ title, summary, link, publishedAt, maintainer, category }: DeveloperCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant="outline" className="rounded-md text-xs capitalize">
            {categoryLabels[category]}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {formattedDate} · {maintainer}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{summary}</p>
        <Button variant="ghost" size="sm" className="px-2 text-xs self-start" asChild>
          <a href={link}>Open resource</a>
        </Button>
      </CardContent>
    </Card>
  )
}

