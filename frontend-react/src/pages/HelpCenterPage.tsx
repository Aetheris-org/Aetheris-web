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
import { useTranslation } from '@/hooks/useTranslation'

export default function HelpCenterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const categories = [
    {
      id: 'getting-started',
      title: t('help.categories.gettingStarted'),
      description: t('help.categories.gettingStartedDescription'),
      icon: Sparkles,
      articles: [
        {
          title: t('help.articles.inviteTeammates'),
          summary: t('help.articles.inviteTeammatesSummary'),
        },
        {
          title: t('help.articles.createFirstStory'),
          summary: t('help.articles.createFirstStorySummary'),
        },
        {
          title: t('help.articles.personalizeProfile'),
          summary: t('help.articles.personalizeProfileSummary'),
        },
      ],
    },
    {
      id: 'writing',
      title: t('help.categories.writing'),
      description: t('help.categories.writingDescription'),
      icon: BookOpen,
      articles: [
        {
          title: t('help.articles.structuringArticles'),
          summary: t('help.articles.structuringArticlesSummary'),
        },
        {
          title: t('help.articles.collaborativeEditing'),
          summary: t('help.articles.collaborativeEditingSummary'),
        },
        {
          title: t('help.articles.schedulingReleases'),
          summary: t('help.articles.schedulingReleasesSummary'),
        },
      ],
    },
    {
      id: 'account',
      title: t('help.categories.account'),
      description: t('help.categories.accountDescription'),
      icon: Shield,
      articles: [
        {
          title: t('help.articles.upgradePro'),
          summary: t('help.articles.upgradeProSummary'),
        },
        {
          title: t('help.articles.twoFactor'),
          summary: t('help.articles.twoFactorSummary'),
        },
        {
          title: t('help.articles.viewInvoices'),
          summary: t('help.articles.viewInvoicesSummary'),
        },
      ],
    },
  ]

  const contactOptions = [
    {
      label: t('help.contactOptions.chat'),
      description: t('help.contactOptions.chatDescription'),
      icon: MessageCircle,
      action: t('help.contactOptions.chatAction'),
    },
    {
      label: t('help.contactOptions.email'),
      description: t('help.contactOptions.emailDescription'),
      icon: Mail,
      action: t('help.contactOptions.emailAction'),
    },
    {
      label: t('help.contactOptions.escalate'),
      description: t('help.contactOptions.escalateDescription'),
      icon: LifeBuoy,
      action: t('help.contactOptions.escalateAction'),
      badge: t('help.contactOptions.proBadge'),
    },
  ]

  const defaultTab = useMemo(() => categories[0]?.id ?? 'getting-started', [categories])

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
              {t('help.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('help.title')}</h1>
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
                {t('help.knowledgeBase')}
              </Badge>
              <CardTitle className="text-2xl">{t('help.howCanWeHelp')}</CardTitle>
              <CardDescription className="text-sm">
                {t('help.description')}
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
                              {t('help.readGuide')}
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
                <CardTitle className="text-lg">{t('help.contactUs')}</CardTitle>
                <CardDescription>
                  {t('help.contactDescription')}
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
                  {t('help.releaseHighlights')}
                </CardTitle>
                <CardDescription>
                  {t('help.releaseDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">{t('help.releases.readingList.title')}</p>
                  <p>{t('help.releases.readingList.description')}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">{t('help.releases.appearancePresets.title')}</p>
                  <p>{t('help.releases.appearancePresets.description')}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                  <p className="font-medium text-foreground">{t('help.releases.oauthUpdates.title')}</p>
                  <p>{t('help.releases.oauthUpdates.description')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}


