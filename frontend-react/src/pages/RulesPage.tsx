import { SiteHeader } from '@/components/SiteHeader'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Страница правил. Используется только раздел General Rules.
 * Заголовок и текст — в locales (rules.general.title, rules.general.body).
 */
export default function RulesPage() {
  const { t } = useTranslation()
  const title = t('rules.general.title')
  const body = t('rules.general.body')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-6">
          {t('header.rules')}
        </h1>

        <section className="max-w-2xl">
          <article className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
              {body.split(/\n\n+/).map((paragraph, i) => (
                <p key={i} className="mb-3 last:mb-0">
                  {paragraph.split('\n').map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
