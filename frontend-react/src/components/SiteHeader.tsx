import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Compass, MessageSquare, UsersRound, GraduationCap, Code2, PenSquare, Swords, MessageCircle, Send, Share2, Newspaper, GitBranch, Scale, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// destinations будут динамическими через useTranslation
const destinationKeys = [
  { key: 'forum', icon: MessageSquare, path: '/forum' },
  { key: 'explore', icon: Swords, path: '/explore' },
  { key: 'networking', icon: UsersRound, path: '/networking' },
  { key: 'courses', icon: GraduationCap, path: '/courses' },
  { key: 'developers', icon: Code2, path: '/developers' },
]

const communityLinks = [
  { key: 'discord', icon: MessageCircle, href: 'https://discord.gg/9aR7KyjAYX' },
  { key: 'telegram', icon: Send, href: 'https://t.me/AetherisNews' },
]

interface SiteHeaderProps {
  transparent?: boolean
}

export function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { t } = useTranslation()
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false)

  // На лендинге (/) не показываем навигацию
  const isLandingPage = location.pathname === '/'

  const destinations = destinationKeys.map(item => ({
    ...item,
    label: t(`header.${item.key}`),
    description: t(`header.${item.key}Description`),
  }))

  const activeDestination = destinations.find((item) => {
    return location.pathname.startsWith(item.path)
  })
  const ActiveIcon = activeDestination?.icon ?? Compass

  // Кнопка создания статьи показывается только на странице форума и только для авторизованных пользователей
  const showCreateButton = location.pathname === '/forum' && user

  const headerClasses = transparent
    ? 'sticky top-0 z-50 w-full'
    : 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'

  return (
    <header className={headerClasses}>
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            className="text-lg sm:text-xl font-semibold tracking-tight shrink-0"
            onClick={() => navigate('/')}
            aria-label="Go to Aetheris home"
          >
            Aetheris
          </button>

          {!isLandingPage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
                aria-label="Select section"
              >
                <ActiveIcon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{activeDestination?.label ?? t('header.explore')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="start">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('header.navigateToSection')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {destinations
              .filter((item) =>
                activeDestination ? item.path !== activeDestination.path : true
              )
              .map((item) => {
                const Icon = item.icon
                const isInDevelopment = ['explore', 'networking', 'courses', 'developers'].includes(item.key)
                return (
                  <DropdownMenuItem
                    key={item.path}
                    className={`flex items-start gap-3 rounded-lg py-3 focus:bg-muted ${
                      isInDevelopment ? 'opacity-20' : ''
                    }`}
                    onSelect={(event) => {
                      event.preventDefault()
                      navigate(item.path)
                    }}
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-foreground" />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold leading-tight text-foreground">{item.label}</span>
                      {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isLandingPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
                  aria-label={t('header.community')}
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t('header.community')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('header.communityLinks')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSocialModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
                  <Share2 className="h-4 w-4" />
                  <span>{t('header.socialNetworks')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/news')} className="flex items-center gap-2 cursor-pointer">
                  <Newspaper className="h-4 w-4" />
                  <span>{t('header.news')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/changes')} className="flex items-center gap-2 cursor-pointer">
                  <GitBranch className="h-4 w-4" />
                  <span>{t('header.changes')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/rules')} className="flex items-center gap-2 cursor-pointer">
                  <Scale className="h-4 w-4" />
                  <span>{t('header.rules')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/faq')} className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>{t('header.faq')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isLandingPage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
            >
              Pricing
            </Button>
          )}
          {showCreateButton && (
            <Button
              size="sm"
              onClick={() => navigate('/create')}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <PenSquare className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('header.create')}</span>
            </Button>
          )}
          <ThemeToggle />
          <AccountSheet />
        </div>
      </div>

      {/* Модальное окно с соц.сетями */}
      <Dialog open={isSocialModalOpen} onOpenChange={setIsSocialModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('header.socialNetworks')}</DialogTitle>
            <DialogDescription>
              {t('header.socialNetworksDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            {communityLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{t(`header.${link.key}`)}</span>
                </a>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

