import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Flame,
  MessageCircle,
  NotebookPen,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getUserProfile } from '@/api/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { ArticleCard } from '@/components/ArticleCard'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="-mt-12 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-muted" />
              <div className="space-y-3">
                <div className="h-6 w-40 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-lg bg-muted" />
              <div className="h-10 w-28 rounded-lg bg-muted" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-64 bg-muted/50" />
        <div className="space-y-4">
          <Card className="h-40 bg-muted/50" />
          <Card className="h-40 bg-muted/50" />
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const routeProfileId = id ? Number(id) : undefined
  const profileId = !Number.isNaN(routeProfileId ?? NaN)
    ? routeProfileId
    : currentUser?.id

  useEffect(() => {
    if (!routeProfileId && currentUser?.id) {
      navigate(`/profile/${currentUser.id}`, { replace: true })
    }
  }, [routeProfileId, currentUser, navigate])

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getUserProfile(profileId!),
    enabled: !!profileId,
  })

  const isOwnProfile = profile?.user.id === currentUser?.id

  if (!profileId && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <div className="container py-24 text-center">
          <Card className="mx-auto max-w-md border-dashed bg-muted/40">
            <CardContent className="space-y-4 py-10">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">Profile not found</CardTitle>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t determine which profile to show. Try selecting an author from
                the articles list.
              </p>
              <Button onClick={() => navigate('/')}>Go home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container py-10">
        {isLoading && <ProfileSkeleton />}

        {isError && !isLoading && (
          <Card className="mx-auto max-w-lg border-dashed bg-muted/40">
            <CardContent className="space-y-4 py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">Unable to load profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Something went wrong while fetching this profile. Please refresh the page or try
                again later.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Go back
                </Button>
                <Button onClick={() => navigate('/')}>Home</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile && !isLoading && (
          <div className="space-y-10">
            <Card className="overflow-hidden border-border/60 shadow-lg">
              <div className="relative h-32 w-full bg-gradient-to-r from-primary/15 via-primary/10 to-transparent" />
              <CardContent className="-mt-16 pb-10">
                <div className="flex flex-col-reverse gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
                    <div className="flex items-center justify-center">
                      {profile.user.avatarUrl ? (
                        <img
                          src={profile.user.avatarUrl}
                          alt={profile.user.username}
                          className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-md"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary/15 text-3xl font-semibold text-primary shadow-md">
                          {profile.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                          {profile.user.username}
                        </h1>
                        <Badge variant="secondary" className="rounded-md">
                          Member since {formatDate(profile.user.memberSince)}
                        </Badge>
                      </div>
                      {profile.user.bio ? (
                        <p className="max-w-2xl text-muted-foreground">
                          {profile.user.bio}
                        </p>
                      ) : (
                        <p className="max-w-2xl text-sm text-muted-foreground">
                          This author hasn&apos;t shared a biography yet.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <NotebookPen className="h-4 w-4" />
                          {profile.stats.publishedArticles} published articles
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" />
                          {profile.stats.totalComments} comments received
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4" />
                          {profile.stats.totalLikes} total reactions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/')}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Discover more
                    </Button>
                    <Button
                      size="sm"
                      variant={isOwnProfile ? 'secondary' : 'default'}
                      className="gap-2"
                      onClick={() =>
                        isOwnProfile ? navigate('/settings/profile') : navigate('/auth')
                      }
                    >
                      {isOwnProfile ? (
                        <>
                          <Settings className="h-4 w-4" />
                          Edit profile
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Follow author
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  <Card className="border-border/50 bg-muted/40 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Published articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                      {profile.stats.publishedArticles}
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-muted/40 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Drafts in progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                      {profile.stats.draftArticles}
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-muted/40 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Community reactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                      {profile.stats.totalLikes}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
              <aside className="space-y-6">
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Signature topics
                      </h4>
                      {profile.highlights.tags.length ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.highlights.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="rounded-md px-3 py-1 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Tags will appear here once this author starts publishing articles.
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Contact
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Want to collaborate? Reach out via the community or leave a comment on one
                        of the articles.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              <section className="space-y-6">
                <Tabs defaultValue="articles" className="w-full">
                  <TabsList className="w-full justify-start gap-3">
                    <TabsTrigger value="articles" className="gap-2">
                      <NotebookPen className="h-4 w-4" />
                      Articles
                      <Badge variant="secondary" className="ml-2 rounded-md">
                        {profile.stats.publishedArticles}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="about" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      About
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-2" disabled>
                      <MessageCircle className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="articles" className="mt-6 space-y-4">
                    {profile.articles.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          This author hasn&apos;t published anything yet.
                        </CardContent>
                      </Card>
                    ) : (
                      profile.articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                          onTagClick={(tag) => navigate(`/?tag=${encodeURIComponent(tag)}`)}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="about" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">About the author</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {profile.user.bio
                            ? profile.user.bio
                            : 'This author prefers to let their writing speak for itself. Check back later for more details.'}
                        </p>
                        <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                          Interested in guest posts or collaborations? Contact the editorial team
                          and we&apos;ll help you connect.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-6">
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Activity view is coming soon.
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

