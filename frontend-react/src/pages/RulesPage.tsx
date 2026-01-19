import { useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

/**
 * ID разделов правил. Заголовки и текст — в locales (rules.{id}.title, rules.{id}.body).
 * Чтобы добавить раздел: добавьте id в RULE_IDS и ключи rules.{id}.title, rules.{id}.body в ru.json/en.json.
 */
const RULE_IDS = ['general']

export default function RulesPage() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(RULE_IDS[0] ?? '')
  const activeIdSafe = RULE_IDS.includes(activeId) ? activeId : RULE_IDS[0]
  const title = t(`rules.${activeIdSafe}.title`)
  const body = t(`rules.${activeIdSafe}.body`)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-6">
          {t('header.rules')}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Левая панель — переключение между разделами правил */}
          <aside className="w-full sm:w-56 shrink-0">
            <nav
              className="rounded-lg border bg-card p-2"
              aria-label={t('rules.sections')}
            >
              {RULE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveId(id)}
                  className={cn(
                    'w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    activeId === id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  {t(`rules.${id}.title`)}
                </button>
              ))}
            </nav>
          </aside>

          {/* Правая часть — текст выбранного раздела */}
          <section className="flex-1 min-w-0">
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
        </div>
      </main>
    </div>
  )
}
