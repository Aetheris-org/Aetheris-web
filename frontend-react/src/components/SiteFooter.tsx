import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, Twitter, Mail, Heart, Code2, MessageSquare, UsersRound, GraduationCap, ChevronUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function SiteFooter() {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  const currentYear = new Date().getFullYear()

  // Автоматическая прокрутка к футеру при открытии
  useEffect(() => {
    if (isExpanded && footerRef.current) {
      // Небольшая задержка для начала анимации
      setTimeout(() => {
        footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)
    }
  }, [isExpanded])

  const navItems = [
    { icon: MessageSquare, label: 'Форум', path: '/' },
    { icon: UsersRound, label: 'Нетворкинг', path: '/networking' },
    { icon: GraduationCap, label: 'Курсы', path: '/courses' },
    { icon: Code2, label: 'Разработчикам', path: '/developers' },
  ]

  const resourceItems = [
    { label: 'Помощь', path: '/help' },
    { label: 'Популярное', path: '/trending' },
    { label: 'Достижения', path: '/achievements' },
  ]

  const contactItems = [
    { icon: Github, label: 'GitHub', href: 'https://github.com' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: Mail, label: 'Email', href: 'mailto:contact@aetheris.com' },
  ]

  return (
    <footer ref={footerRef} className="w-full border-t border-border bg-background mt-8">
      {/* Свернутое состояние - минимальная полоска */}
      <div
        className={cn(
          'container transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-0 opacity-0 py-0' : 'max-h-20 opacity-100 py-3'
        )}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between"
          aria-label="Развернуть футер"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 flex-1">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Aetheris. Все права защищены.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Powered by</span>
              <span className="font-medium text-foreground">passion</span>
            </div>
          </div>
          <ChevronUp className="h-3 w-3 text-muted-foreground/20 ml-4 flex-shrink-0" />
        </button>
      </div>

      {/* Развернутое состояние */}
      <div
        className={cn(
          'container transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[1000px] opacity-100 py-12' : 'max-h-0 opacity-0 py-0'
        )}
      >
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Бренд - кликабельный для сворачивания */}
          <div className="space-y-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-left w-full group"
              aria-label="Свернуть футер"
            >
              <div>
                <h3 className="text-xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">Aetheris</h3>
                <Separator className="w-12" />
              </div>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа для разработчиков, где можно делиться знаниями, находить единомышленников и расти профессионально.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Heart className="h-3.5 w-3.5 text-primary fill-primary" />
              <span className="text-xs text-muted-foreground">Сделано с любовью для сообщества</span>
            </div>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Навигация</h4>
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group text-left"
                  >
                    <Icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Ресурсы */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Ресурсы</h4>
            <nav className="flex flex-col gap-2.5">
              {resourceItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Контакты</h4>
            <div className="flex flex-col gap-2.5">
              {contactItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Нижняя часть с кнопкой сворачивания */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Aetheris. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Powered by</span>
              <span className="font-medium text-foreground">passion</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              aria-label="Свернуть футер"
            >
              <ChevronUp className="h-3.5 w-3.5 rotate-180" />
              <span>Свернуть</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
