import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/hooks/useTranslation'
import { useI18nStore } from '@/stores/i18nStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'

export default function TermsOfServicePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useI18nStore((state) => state.language)
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('legal.termsOfService.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{t('legal.termsOfService.title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t('legal.termsOfService.lastUpdated')}: {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <Separator className="my-6" />

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section1.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section1.content')}</p>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section2.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('legal.termsOfService.section2.content')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('legal.termsOfService.section2.item1')}</li>
                <li>{t('legal.termsOfService.section2.item2')}</li>
                <li>{t('legal.termsOfService.section2.item3')}</li>
                <li>{t('legal.termsOfService.section2.item4')}</li>
              </ul>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section3.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('legal.termsOfService.section3.content')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('legal.termsOfService.section3.item1')}</li>
                <li>{t('legal.termsOfService.section3.item2')}</li>
                <li>{t('legal.termsOfService.section3.item3')}</li>
                <li>{t('legal.termsOfService.section3.item4')}</li>
              </ul>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section4.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section4.content')}</p>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section5.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section5.content')}</p>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section6.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section6.content')}</p>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section7.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section7.content')}</p>
            </section>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">{t('legal.termsOfService.section8.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfService.section8.content')}</p>
            </section>

            <Separator className="my-6" />

            <div className="text-sm text-muted-foreground">
              <p>{t('legal.termsOfService.contact')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

