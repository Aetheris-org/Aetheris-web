import { useState, useEffect } from 'react'
import { X, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface DevelopmentBannerProps {
  /** Уникальный ключ для localStorage (например, 'achievements-dev-banner') */
  storageKey: string
  /** Дополнительные классы для контейнера */
  className?: string
}

export function DevelopmentBanner({ storageKey, className = '' }: DevelopmentBannerProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${storageKey}-dismissed`) !== 'true'
    }
    return true
  })

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-dismissed`, 'true')
    }
  }

  if (!isVisible) return null

  return (
    <div className={`relative border-b border-dashed border-muted-foreground/30 bg-muted/10 py-1.5 ${className}`}>
      <div className="container flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
        <Wrench className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        <span>{t('settings.inDevelopment')}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6"
        onClick={handleDismiss}
        aria-label={t('common.close')}
      >
        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      </Button>
    </div>
  )
}


