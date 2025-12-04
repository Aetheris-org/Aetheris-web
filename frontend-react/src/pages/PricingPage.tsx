import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Rocket, Crown, Shield, Globe, Users, BookOpen, TrendingUp, Coins, Star, ArrowLeft, FileText, BarChart3, Zap, Settings, Gift, Code, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'

type FeatureCategory = {
  title: string
  icon: typeof FileText
  features: string[]
}

type PricingPlan = {
  name: string
  description: string
  price: string
  period: string
  badge: string | null
  icon: typeof Sparkles
  mainFeatures: string[]
  featureCategories: FeatureCategory[]
  cta: string
  popular: boolean
  gradient: string
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const pricingPlans: PricingPlan[] = useMemo(() => [
  {
    name: t('pricing.plans.free.name'),
    description: t('pricing.plans.free.description'),
    price: t('pricing.plans.free.price'),
    period: t('pricing.plans.free.period'),
    badge: null,
    icon: Sparkles,
    mainFeatures: [
      t('pricing.plans.free.mainFeatures.forum'),
      t('pricing.plans.free.mainFeatures.achievements'),
      t('pricing.plans.free.mainFeatures.articles'),
      t('pricing.plans.free.mainFeatures.stats'),
      t('pricing.plans.free.mainFeatures.clans'),
      t('pricing.plans.free.mainFeatures.reading'),
    ],
    featureCategories: [
      {
        title: t('pricing.plans.free.featureCategories.content.title'),
        icon: FileText,
        features: [
          t('pricing.plans.free.featureCategories.content.features.comments'),
          t('pricing.plans.free.featureCategories.content.features.reactions'),
          t('pricing.plans.free.featureCategories.content.features.bookmarks'),
          t('pricing.plans.free.featureCategories.content.features.trending'),
        ],
      },
      {
        title: t('pricing.plans.free.featureCategories.personalization.title'),
        icon: Settings,
        features: [
          t('pricing.plans.free.featureCategories.personalization.features.themes'),
          t('pricing.plans.free.featureCategories.personalization.features.profile'),
          t('pricing.plans.free.featureCategories.personalization.features.settings'),
        ],
      },
      {
        title: t('pricing.plans.free.featureCategories.learning.title'),
        icon: BookOpen,
        features: [
          t('pricing.plans.free.featureCategories.learning.features.courses'),
          t('pricing.plans.free.featureCategories.learning.features.communities'),
          t('pricing.plans.free.featureCategories.learning.features.docs'),
          t('pricing.plans.free.featureCategories.learning.features.voting'),
        ],
      },
      {
        title: t('pricing.plans.free.featureCategories.search.title'),
        icon: Globe,
        features: [
          t('pricing.plans.free.featureCategories.search.features.contentSearch'),
          t('pricing.plans.free.featureCategories.search.features.filtering'),
        ],
      },
      {
        title: t('pricing.plans.free.featureCategories.notifications.title'),
        icon: Zap,
        features: [
          t('pricing.plans.free.featureCategories.notifications.features.basic'),
        ],
      },
    ],
    cta: t('pricing.plans.free.cta'),
    popular: false,
    gradient: 'from-muted to-muted/50',
  },
  {
    name: t('pricing.plans.voyager.name'),
    description: t('pricing.plans.voyager.description'),
    price: t('pricing.plans.voyager.price'),
    period: t('pricing.plans.voyager.period'),
    badge: t('pricing.plans.voyager.badge'),
    icon: Rocket,
    mainFeatures: [
      t('pricing.plans.voyager.mainFeatures.allFree'),
      t('pricing.plans.voyager.mainFeatures.unlimited'),
      t('pricing.plans.voyager.mainFeatures.analytics'),
      t('pricing.plans.voyager.mainFeatures.support'),
      t('pricing.plans.voyager.mainFeatures.exclusive'),
      t('pricing.plans.voyager.mainFeatures.early'),
      t('pricing.plans.voyager.mainFeatures.monetization'),
      t('pricing.plans.voyager.mainFeatures.themes'),
    ],
    featureCategories: [
      {
        title: t('pricing.plans.voyager.featureCategories.editor.title'),
        icon: FileText,
        features: [
          t('pricing.plans.voyager.featureCategories.editor.features.advancedEditor'),
          t('pricing.plans.voyager.featureCategories.editor.features.unlimitedDrafts'),
          t('pricing.plans.voyager.featureCategories.editor.features.customPreview'),
          t('pricing.plans.voyager.featureCategories.editor.features.exclusiveTemplates'),
          t('pricing.plans.voyager.featureCategories.editor.features.formatting'),
          t('pricing.plans.voyager.featureCategories.editor.features.customUrls'),
          t('pricing.plans.voyager.featureCategories.editor.features.scheduling'),
        ],
      },
      {
        title: t('pricing.plans.voyager.featureCategories.analytics.title'),
        icon: BarChart3,
        features: [
          t('pricing.plans.voyager.featureCategories.analytics.features.views'),
          t('pricing.plans.voyager.featureCategories.analytics.features.articleStats'),
          t('pricing.plans.voyager.featureCategories.analytics.features.audience'),
          t('pricing.plans.voyager.featureCategories.analytics.features.conversions'),
          t('pricing.plans.voyager.featureCategories.analytics.features.comments'),
          t('pricing.plans.voyager.featureCategories.analytics.features.export'),
        ],
      },
      {
        title: t('pricing.plans.voyager.featureCategories.personalization.title'),
        icon: Settings,
        features: [
          t('pricing.plans.voyager.featureCategories.personalization.features.profileSettings'),
          t('pricing.plans.voyager.featureCategories.personalization.features.badges'),
          t('pricing.plans.voyager.featureCategories.personalization.features.themes'),
          t('pricing.plans.voyager.featureCategories.personalization.features.privacy'),
          t('pricing.plans.voyager.featureCategories.personalization.features.notifications'),
        ],
      },
      {
        title: t('pricing.plans.voyager.featureCategories.organization.title'),
        icon: Gift,
        features: [
          t('pricing.plans.voyager.featureCategories.organization.features.bookmarks'),
          t('pricing.plans.voyager.featureCategories.organization.features.collections'),
          t('pricing.plans.voyager.featureCategories.organization.features.backup'),
        ],
      },
      {
        title: t('pricing.plans.voyager.featureCategories.integrations.title'),
        icon: Code,
        features: [
          t('pricing.plans.voyager.featureCategories.integrations.features.metaTags'),
          t('pricing.plans.voyager.featureCategories.integrations.features.social'),
        ],
      },
      {
        title: t('pricing.plans.voyager.featureCategories.privileges.title'),
        icon: Star,
        features: [
          t('pricing.plans.voyager.featureCategories.privileges.features.search'),
          t('pricing.plans.voyager.featureCategories.privileges.features.moderation'),
          t('pricing.plans.voyager.featureCategories.privileges.features.beta'),
        ],
      },
    ],
    cta: t('pricing.plans.voyager.cta'),
    popular: true,
    gradient: 'from-primary/20 via-primary/10 to-background',
  },
  {
    name: t('pricing.plans.architect.name'),
    description: t('pricing.plans.architect.description'),
    price: t('pricing.plans.architect.price'),
    period: t('pricing.plans.architect.period'),
    badge: t('pricing.plans.architect.badge'),
    icon: Crown,
    mainFeatures: [
      t('pricing.plans.architect.mainFeatures.allVoyager'),
      t('pricing.plans.architect.mainFeatures.privateClans'),
      t('pricing.plans.architect.mainFeatures.advanced'),
      t('pricing.plans.architect.mainFeatures.manager'),
      t('pricing.plans.architect.mainFeatures.events'),
      t('pricing.plans.architect.mainFeatures.api'),
      t('pricing.plans.architect.mainFeatures.badges'),
      t('pricing.plans.architect.mainFeatures.whitelabel'),
    ],
    featureCategories: [
      {
        title: t('pricing.plans.architect.featureCategories.analytics.title'),
        icon: BarChart3,
        features: [
          t('pricing.plans.architect.featureCategories.analytics.features.trends'),
          t('pricing.plans.architect.featureCategories.analytics.features.audience'),
          t('pricing.plans.architect.featureCategories.analytics.features.abTesting'),
          t('pricing.plans.architect.featureCategories.analytics.features.multiChannel'),
          t('pricing.plans.architect.featureCategories.analytics.features.dashboards'),
          t('pricing.plans.architect.featureCategories.analytics.features.reports'),
          t('pricing.plans.architect.featureCategories.analytics.features.export'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.api.title'),
        icon: Code,
        features: [
          t('pricing.plans.architect.featureCategories.api.features.automation'),
          t('pricing.plans.architect.featureCategories.api.features.webhooks'),
          t('pricing.plans.architect.featureCategories.api.features.external'),
          t('pricing.plans.architect.featureCategories.api.features.custom'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.content.title'),
        icon: FileText,
        features: [
          t('pricing.plans.architect.featureCategories.content.features.editor'),
          t('pricing.plans.architect.featureCategories.content.features.collaborations'),
          t('pricing.plans.architect.featureCategories.content.features.drafts'),
          t('pricing.plans.architect.featureCategories.content.features.domains'),
          t('pricing.plans.architect.featureCategories.content.features.seo'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.monetization.title'),
        icon: Coins,
        features: [
          t('pricing.plans.architect.featureCategories.monetization.features.subscriptions'),
          t('pricing.plans.architect.featureCategories.monetization.features.settings'),
          t('pricing.plans.architect.featureCategories.monetization.features.partnership'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.personalization.title'),
        icon: Settings,
        features: [
          t('pricing.plans.architect.featureCategories.personalization.features.themes'),
          t('pricing.plans.architect.featureCategories.personalization.features.colors'),
          t('pricing.plans.architect.featureCategories.personalization.features.widgets'),
          t('pricing.plans.architect.featureCategories.personalization.features.notifications'),
          t('pricing.plans.architect.featureCategories.personalization.features.interface'),
          t('pricing.plans.architect.featureCategories.personalization.features.customization'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.learning.title'),
        icon: BookOpen,
        features: [
          t('pricing.plans.architect.featureCategories.learning.features.privateCourses'),
          t('pricing.plans.architect.featureCategories.learning.features.masterclasses'),
          t('pricing.plans.architect.featureCategories.learning.features.channels'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.storage.title'),
        icon: Shield,
        features: [
          t('pricing.plans.architect.featureCategories.storage.features.media'),
          t('pricing.plans.architect.featureCategories.storage.features.support'),
          t('pricing.plans.architect.featureCategories.storage.features.consultations'),
        ],
      },
      {
        title: t('pricing.plans.architect.featureCategories.privileges.title'),
        icon: Star,
        features: [
          t('pricing.plans.architect.featureCategories.privileges.features.recommendations'),
          t('pricing.plans.architect.featureCategories.privileges.features.moderation'),
          t('pricing.plans.architect.featureCategories.privileges.features.tools'),
          t('pricing.plans.architect.featureCategories.privileges.features.support'),
          t('pricing.plans.architect.featureCategories.privileges.features.content'),
          t('pricing.plans.architect.featureCategories.privileges.features.search'),
          t('pricing.plans.architect.featureCategories.privileges.features.filters'),
          t('pricing.plans.architect.featureCategories.privileges.features.development'),
          t('pricing.plans.architect.featureCategories.privileges.features.roadmap'),
          t('pricing.plans.architect.featureCategories.privileges.features.features'),
          t('pricing.plans.architect.featureCategories.privileges.features.early'),
        ],
      },
    ],
    cta: t('pricing.plans.architect.cta'),
    popular: false,
    gradient: 'from-primary/30 via-primary/15 to-background',
  },
  ], [t])

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
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold truncate">{t('pricing.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="pricing-dev-banner" />
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 max-w-3xl mx-auto">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs md:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t('pricing.chooseYourPath')}
            </Badge>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {t('pricing.title')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {t('pricing.forEveryone')}
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto leading-relaxed px-2">
              {t('pricing.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.name}
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 mb-4 md:mb-0 ${
                    plan.popular
                      ? 'border-primary/50 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg shadow-primary/5 md:scale-105 lg:scale-110'
                      : 'border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-2.5 sm:-top-3 left-0 right-0 flex justify-center z-10">
                      <Badge className="bg-primary text-primary-foreground border-primary/50 px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center ${
                        plan.popular ? 'border-primary/40 bg-primary/20' : ''
                      }`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary`} />
                      </div>
                      {plan.badge && plan.popular && (
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-primary" />
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent">
                        {plan.description}
                      </CardDescription>
                    </div>
                    
                    <div className="pt-3 sm:pt-4">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        <span className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          /{plan.period}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                    <Button
                      className={`w-full h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={() => navigate('/auth')}
                    >
                      {plan.cta}
                    </Button>
                    
                    <Separator />
                    
                    <div className="space-y-2.5 sm:space-y-3">
                      {/* Основные функции - показываем все */}
                      <ul className="space-y-1.5 sm:space-y-2">
                        {plan.mainFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 sm:gap-2.5">
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary" />
                            </div>
                            <span className="text-[10px] sm:text-xs md:text-sm text-foreground/85 leading-snug">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Кнопка для просмотра дополнительных функций */}
                      {plan.featureCategories.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <button
                            onClick={() => setOpenDialog(plan.name)}
                            className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 text-xs sm:text-sm font-medium text-primary transition-all group"
                          >
                            <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                              <span className="truncate">{t('pricing.viewAllFeatures')}</span>
                              <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 bg-primary/10 text-primary border-primary/20 shrink-0">
                                {plan.featureCategories.reduce((acc, cat) => acc + cat.features.length, 0)}
                              </Badge>
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {/* Модальное окно со всеми функциями */}
                  <Dialog open={openDialog === plan.name} onOpenChange={(open) => !open && setOpenDialog(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-xl md:text-2xl">
                          {plan.name} - {t('pricing.allFeatures')}
                        </DialogTitle>
                        <DialogDescription>
                          {t('pricing.allFeaturesDescription') || 'Полный список функций и возможностей этого тарифного плана'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
                        {/* Основные функции */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-foreground/90">
                            {t('pricing.mainFeatures')}
                          </h3>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {plan.mainFeatures.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 sm:gap-2.5">
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary" />
                                </div>
                                <span className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Дополнительные функции по категориям */}
                        {plan.featureCategories.length > 0 && (
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-foreground/90">
                              {t('pricing.additionalFeatures')}
                            </h3>
                            <Accordion type="multiple" className="w-full">
                              {plan.featureCategories.map((category, categoryIndex) => {
                                const CategoryIcon = category.icon
                                return (
                                  <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`} className="border-b">
                                    <AccordionTrigger className="py-2 sm:py-3 hover:no-underline">
                                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground/80">
                                        <CategoryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                                        <span className="truncate">{category.title}</span>
                                        <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs shrink-0">
                                          {category.features.length}
                                        </Badge>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1.5 sm:pt-2 pb-2 sm:pb-3">
                                      <ul className="space-y-1.5 sm:space-y-2 pl-4 sm:pl-6">
                                        {category.features.map((feature, featureIndex) => (
                                          <li key={featureIndex} className="flex items-start gap-2 sm:gap-2.5">
                                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <Check className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-primary" />
                                            </div>
                                            <span className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                              {feature}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </AccordionContent>
                                  </AccordionItem>
                                )
                              })}
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-muted/20">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('pricing.whatYouGet.title')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-2">
              {t('pricing.whatYouGet.subtitle')}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: t('pricing.whatYouGet.security.title'), description: t('pricing.whatYouGet.security.description') },
              { icon: Globe, title: t('pricing.whatYouGet.access.title'), description: t('pricing.whatYouGet.access.description') },
              { icon: Users, title: t('pricing.whatYouGet.community.title'), description: t('pricing.whatYouGet.community.description') },
              { icon: BookOpen, title: t('pricing.whatYouGet.learning.title'), description: t('pricing.whatYouGet.learning.description') },
              { icon: TrendingUp, title: t('pricing.whatYouGet.analytics.title'), description: t('pricing.whatYouGet.analytics.description') },
              { icon: Coins, title: t('pricing.whatYouGet.monetization.title'), description: t('pricing.whatYouGet.monetization.description') },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('pricing.faq.title')}
            </h2>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[
              {
                question: t('pricing.faq.changePlan.question'),
                answer: t('pricing.faq.changePlan.answer'),
              },
              {
                question: t('pricing.faq.cancel.question'),
                answer: t('pricing.faq.cancel.answer'),
              },
              {
                question: t('pricing.faq.student.question'),
                answer: t('pricing.faq.student.answer'),
              },
              {
                question: t('pricing.faq.yearly.question'),
                answer: t('pricing.faq.yearly.answer'),
              },
            ].map((faq, index) => (
              <Card key={index} className="border border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto px-2">
            {t('pricing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-3 sm:pt-4">
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base px-6 sm:px-8 py-4 sm:py-5 md:py-6 w-full sm:w-auto"
              onClick={() => navigate('/auth')}
            >
              {t('pricing.cta.startFree')}
            </Button>
            <Button
              variant="outline"
              className="h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base px-6 sm:px-8 py-4 sm:py-5 md:py-6 w-full sm:w-auto"
              onClick={() => navigate('/forum')}
            >
              {t('pricing.cta.viewForum')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

