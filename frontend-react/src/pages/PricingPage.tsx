import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Rocket, Crown, Zap, Shield, Globe, Users, BookOpen, TrendingUp, Coins, Star, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const pricingPlans = [
  {
    name: 'Free',
    description: 'Идеально для начала пути',
    price: '0₽',
    period: 'навсегда',
    badge: null,
    icon: Sparkles,
    features: [
      'Доступ к форуму и обсуждениям',
      'Базовые достижения и уровни',
      'Создание до 5 статей в месяц',
      'Базовые статистики профиля',
      'Участие в кланах',
      'Чтение всех публикаций',
    ],
    cta: 'Начать бесплатно',
    popular: false,
    gradient: 'from-muted to-muted/50',
  },
  {
    name: 'Voyager',
    description: 'Для тех, кто исследует новые горизонты',
    price: '379₽',
    period: 'в месяц',
    badge: 'Популярный',
    icon: Rocket,
    features: [
      'Всё из Free плана',
      'Неограниченное создание статей',
      'Расширенная аналитика и статистика',
      'Приоритетная поддержка',
      'Эксклюзивные достижения',
      'Ранний доступ к новым функциям',
      'Монетизация контента',
      'Кастомные темы профиля',
    ],
    cta: 'Начать путешествие',
    popular: true,
    gradient: 'from-primary/20 via-primary/10 to-background',
  },
  {
    name: 'Architect',
    description: 'Для тех, кто строит будущее',
    price: '999₽',
    period: 'в месяц',
    badge: 'Премиум',
    icon: Crown,
    features: [
      'Всё из Voyager плана',
      'Приватные кланы и сообщества',
      'Продвинутая аналитика и инсайты',
      'Персональный менеджер аккаунта',
      'Эксклюзивные события и встречи',
      'API доступ для интеграций',
      'Кастомные бейджи и награды',
      'Приоритет в модерации',
      'Белый лейбл для организаций',
    ],
    cta: 'Стать архитектором',
    popular: false,
    gradient: 'from-primary/30 via-primary/15 to-background',
  },
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('pricing.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm px-4 py-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Выбери свой путь
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Тарифы
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                для каждого
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto leading-relaxed">
              От бесплатного старта до премиум возможностей. Выбери план, который подходит именно тебе.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 sm:gap-8 lg:gap-10">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.name}
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 mb-4 md:mb-0 ${
                    plan.popular
                      ? 'border-primary/50 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg shadow-primary/5 scale-105 md:scale-110'
                      : 'border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                      <Badge className="bg-primary text-primary-foreground border-primary/50 px-4 py-1 text-xs font-semibold whitespace-nowrap">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="space-y-4 pb-6 p-6 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center ${
                        plan.popular ? 'border-primary/40 bg-primary/20' : ''
                      }`}>
                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 text-primary`} />
                      </div>
                      {plan.badge && plan.popular && (
                        <Star className="w-5 h-5 text-primary fill-primary" />
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base bg-gradient-to-r from-foreground/80 via-foreground/70 to-muted-foreground bg-clip-text text-transparent">
                        {plan.description}
                      </CardDescription>
                    </div>
                    
                    <div className="pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        <span className="text-sm sm:text-base text-muted-foreground">
                          /{plan.period}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 p-6 sm:p-6 pt-0">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      size="lg"
                      onClick={() => navigate('/auth')}
                    >
                      {plan.cta}
                    </Button>
                    
                    <Separator />
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/20">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Что получаешь
            </h2>
            <p className="text-base sm:text-lg bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto">
              Все планы включают базовые возможности, а премиум открывает новые горизонты
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Безопасность', description: 'OAuth2 аутентификация, защита данных' },
              { icon: Globe, title: 'Доступ везде', description: 'Синхронизация на всех устройствах' },
              { icon: Users, title: 'Сообщество', description: 'Общение с единомышленниками' },
              { icon: BookOpen, title: 'Обучение', description: 'Курсы, туториалы, материалы' },
              { icon: TrendingUp, title: 'Аналитика', description: 'Статистика и инсайты' },
              { icon: Coins, title: 'Монетизация', description: 'Зарабатывай на контенте' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Частые вопросы
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: 'Можно ли изменить план позже?',
                answer: 'Да, ты можешь перейти на другой план в любой момент. Изменения вступят в силу сразу.',
              },
              {
                question: 'Что происходит при отмене подписки?',
                answer: 'Ты сохраняешь доступ к функциям до конца оплаченного периода, затем переходишь на Free план.',
              },
              {
                question: 'Есть ли скидки для студентов?',
                answer: 'Да, мы предлагаем специальные условия для студентов. Свяжись с нами для получения скидки.',
              },
              {
                question: 'Можно ли оплатить годом?',
                answer: 'Да, при годовой оплате ты получаешь 2 месяца бесплатно. Это экономия 16%.',
              },
            ].map((faq, index) => (
              <Card key={index} className="border border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Готов начать?
          </h2>
          <p className="text-base sm:text-lg bg-gradient-to-r from-foreground/90 via-foreground/70 to-muted-foreground bg-clip-text text-transparent max-w-2xl mx-auto">
            Присоединяйся к тысячам пользователей, которые уже создают будущее на Aetheris
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base sm:text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Начать бесплатно
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base sm:text-lg px-8 py-6"
              onClick={() => navigate('/forum')}
            >
              Посмотреть форум
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

