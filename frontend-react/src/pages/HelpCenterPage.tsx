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
import { DevelopmentBanner } from '@/components/DevelopmentBanner'

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
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('help.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold truncate">{t('help.title')}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="help-center-dev-banner" />
      <main className="container py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6">
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.5fr_1fr] min-w-0 w-full">
          <Card className="border-border/60 min-w-0">
            <CardHeader className="space-y-2 p-4 sm:p-6">
              <Badge variant="secondary" className="w-fit gap-1 text-[10px] sm:text-[11px] uppercase tracking-wide">
                <Sparkles className="h-3 w-3 text-primary" />
                {t('help.knowledgeBase')}
              </Badge>
              <CardTitle className="text-xl sm:text-2xl">{t('help.howCanWeHelp')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('help.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 min-w-0">
              <Tabs defaultValue={defaultTab}>
                <div className="w-full min-w-0">
                  <TabsList className="flex h-auto items-center justify-start rounded-lg bg-transparent p-0 w-full border-0 gap-1.5 sm:gap-2">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id} 
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial max-w-[110px] sm:max-w-none"
                      >
                        <category.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate min-w-0">{category.title}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold break-words">{category.title}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{category.description}</p>
                    </div>
                    <div className="grid gap-2.5 sm:gap-3 min-w-0">
                      {category.articles.map((article) => (
                        <Card
                          key={article.title}
                          className="group cursor-pointer border-border/60 bg-background/70 transition hover:border-primary hover:shadow-sm min-w-0"
                          onClick={() => navigate('/')} // TODO: update to actual article link
                        >
                          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 min-w-0">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                              <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary break-words">
                                {article.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 break-words">{article.summary}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1 h-8 sm:h-9 text-xs sm:text-sm shrink-0 w-full sm:w-auto">
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

          <div className="space-y-4 sm:space-y-6 min-w-0">
            <Card className="border-border/60 bg-muted/20 min-w-0">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg break-words">{t('help.contactUs')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  {t('help.contactDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 p-4 sm:p-6 pt-0 min-w-0">
                {contactOptions.map((option) => (
                  <div
                    key={option.label}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background p-2.5 sm:p-3 min-w-0"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 w-full sm:w-auto">
                        <option.icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0', option.badge ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate min-w-0">{option.label}</p>
                        {option.badge ? (
                          <Badge variant="secondary" className="text-[9px] sm:text-[10px] uppercase tracking-wide shrink-0">
                            {option.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm shrink-0 w-full sm:w-auto">
                        {option.action}
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{option.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 min-w-0">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg break-words">
                  <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                  {t('help.releaseHighlights')}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  {t('help.releaseDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-muted-foreground p-4 sm:p-6 pt-0 min-w-0">
                <div className="rounded-lg border border-border/50 bg-background/70 p-2.5 sm:p-3 min-w-0">
                  <p className="font-medium text-foreground text-xs sm:text-sm break-words">{t('help.releases.readingList.title')}</p>
                  <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 break-words">{t('help.releases.readingList.description')}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2.5 sm:p-3 min-w-0">
                  <p className="font-medium text-foreground text-xs sm:text-sm break-words">{t('help.releases.appearancePresets.title')}</p>
                  <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 break-words">{t('help.releases.appearancePresets.description')}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2.5 sm:p-3 min-w-0">
                  <p className="font-medium text-foreground text-xs sm:text-sm break-words">{t('help.releases.oauthUpdates.title')}</p>
                  <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 break-words">{t('help.releases.oauthUpdates.description')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}


