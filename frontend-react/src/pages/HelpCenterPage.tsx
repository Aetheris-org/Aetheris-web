import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  LifeBuoy,
  Mail,
  MessageCircle,
  Shield,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const categories = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Set up your account and publish your first story.',
    icon: Sparkles,
    articles: [
      {
        title: 'Invite teammates to collaborate',
        summary: 'Tips for running shared workspaces with unified permissions.',
      },
      {
        title: 'Create your first story',
        summary: 'A walkthrough of the editor, markdown shortcuts, and preview.',
      },
      {
        title: 'Personalize your profile',
        summary: 'Customize bio, cover image, and external profiles.',
      },
    ],
  },
  {
    id: 'writing',
    title: 'Writing & Publishing',
    description: 'Draft, review, and ship stories your readers love.',
    icon: BookOpen,
    articles: [
      {
        title: 'Structuring long-form articles',
        summary: 'Use sections, call-outs, and embeds to keep readers engaged.',
      },
      {
        title: 'Collaborative editing flow',
        summary: 'Assign reviewers, leave inline comments, and resolve feedback.',
      },
      {
        title: 'Scheduling releases',
        summary: 'Set publish windows, configure RSS, and notify subscribers.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & billing',
    description: 'Manage seats, invoices, and security options.',
    icon: Shield,
    articles: [
      {
        title: 'Upgrade to Creator Pro',
        summary: 'Unlock advanced analytics, custom domains, and priority support.',
      },
      {
        title: 'Two-factor authentication',
        summary: 'Secure your workspace with OTP apps and backup codes.',
      },
      {
        title: 'View invoices and receipts',
        summary: 'Download receipts and update billing contacts.',
      },
    ],
  },
]

const contactOptions = [
  {
    label: 'Chat with support',
    description: 'Average response under 5 minutes during business hours.',
    icon: MessageCircle,
    action: 'Open chat',
  },
  {
    label: 'Email hello@aetheris.dev',
    description: 'Detailed requests, billing questions, or roadmap feedback.',
    icon: Mail,
    action: 'Send email',
  },
  {
    label: 'Escalate priority incident',
    description: 'Critical outages affecting your publication.',
    icon: LifeBuoy,
    action: 'Escalate',
    badge: 'Pro',
  },
]

export default function HelpCenterPage() {
  const navigate = useNavigate()
  const defaultTab = useMemo(() => categories[0]?.id ?? 'getting-started', [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">Help Center</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-10">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <Badge variant="secondary" className="w-fit gap-1 text-[11px] uppercase tracking-wide">
                <Sparkles className="h-3 w-3 text-primary" />
                Knowledge base
              </Badge>
              <CardTitle className="text-2xl">How can we help?</CardTitle>
              <CardDescription className="text-sm">
                Browse guides, best practices, and release notes. Our support team is one click away if you
                get stuck.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab}>
                <TabsList className="flex w-full flex-wrap gap-2">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-6 space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">{category.title}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="grid gap-3">
                      {category.articles.map((article) => (
                        <Card
                          key={article.title}
                          className="group cursor-pointer border-border/60 bg-background/70 transition hover:border-primary hover:shadow-sm"
                          onClick={() => navigate('/')} // TODO: update to actual article link
                        >
                          <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                                {article.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{article.summary}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Read guide
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg">Contact us</CardTitle>
                <CardDescription>
                  Prefer a human? Our team is on-call 7 days a week with escalations for production incidents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactOptions.map((option) => (
                  <div
                    key={option.label}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <option.icon className={cn('h-4 w-4', option.badge ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        {option.badge ? (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {option.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        {option.action}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Release highlights
                </CardTitle>
                <CardDescription>
                  Recent improvements that may answer your question before contacting support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">Reading list sync</p>
                  <p>Saved articles now sync across web and mobile, with offline mode shipping next.</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">Appearance presets</p>
                  <p>Create and share workspace visual presets across editorial teams.</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">OAuth updates</p>
                  <p>Additional providers are in beta. Follow the release notes for Discord and Slack support.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}


