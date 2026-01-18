import { useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

/**
 * Правила сообщества.
 * Редактируйте массив и текст content — блок справа подстроится под высоту.
 */
const COMMUNITY_RULES: { id: string; title: string; content: string }[] = [
  {
    id: 'general',
    title: 'Общие правила',
    content: `Уважайте других участников. Запрещены оскорбления, травля и дискриминация.

Спам, реклама и оффтоп в не предназначенных для этого разделах не допускаются.`,
  },
  {
    id: 'content',
    title: 'Контент',
    content: `Публикуйте только тот контент, на распространение которого у вас есть права.

Запрещён контент, нарушающий законодательство или правила платформы.`,
  },
  {
    id: 'behavior',
    title: 'Поведение',
    content: `Создавайте дружелюбную среду: критикуйте идеи, а не людей.

При возникновении конфликтов обращайтесь к модераторам.`,
  },
]

export default function RulesPage() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(COMMUNITY_RULES[0]?.id ?? '')
  const active = COMMUNITY_RULES.find((r) => r.id === activeId) ?? COMMUNITY_RULES[0]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-6">
          {t('header.rules')}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Левая панель — переключение между правилами */}
          <aside className="w-full sm:w-56 shrink-0">
            <nav
              className="rounded-lg border bg-card p-2"
              aria-label={t('rules.sections') || 'Разделы правил'}
            >
              {COMMUNITY_RULES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className={cn(
                    'w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    activeId === r.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  {r.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Правый блок — текст правил (авто-высота: без фиксированной высоты, подстраивается под контент) */}
          <section className="flex-1 min-w-0">
            <article className="rounded-lg border bg-card p-4 sm:p-6">
              {active && (
                <>
                  <h2 className="text-lg font-semibold mb-4">{active.title}</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                    {active.content.split(/\n\n+/).map((paragraph, i) => (
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
                </>
              )}
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
