/**
 * DASHBOARD PAGE - BACKEND INTEGRATION GUIDE
 * ===========================================
 * 
 * ⚠️ ВАЖНО: Эта страница использует мок-данные для разработки UI.
 * 
 * Для интеграции с бэкендом выполните следующие шаги:
 * 
 * 1. СОЗДАТЬ API ENDPOINTS:
 *    - GET /api/dashboard/widgets - получить конфигурацию виджетов пользователя
 *    - PUT /api/dashboard/widgets - сохранить конфигурацию виджетов
 *    - GET /api/dashboard/recent-activity - последние события пользователя
 *    - GET /api/dashboard/quick-stats - быстрая статистика
 * 
 * 2. ЗАМЕНИТЬ МОК-ДАННЫЕ на useQuery с реальными API вызовами
 * 3. УДАЛИТЬ все mock* константы после интеграции
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useTranslation } from '@/hooks/useTranslation'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'
import {
  Settings,
  Trophy,
  FileText,
  Calendar,
  Users,
  Zap,
  Clock,
  Eye,
  EyeOff,
  BarChart3,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Heart,
  Target,
  Compass,
  Network,
  GraduationCap,
  Code,
  Info,
  TrendingUp,
  Lock,
  Unlock,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// ============================================
// TYPES & CONSTANTS
// ============================================

type WidgetId =
  | 'profile'
  | 'achievements'
  | 'recent-articles'
  | 'quick-stats'
  | 'recent-activity'
  | 'upcoming-events'
  | 'quick-links'
  | 'level-progress'
  | 'forum'
  | 'networking'
  | 'courses'
  | 'developers'
  | 'explore'
  | 'about-us'
  | 'trending'
  | 'reading-list'
  | 'notifications'

type WidgetSize = 'small' | 'medium' | 'large' | 'extra-large'

const WIDGET_SIZES: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
  'extra-large': { w: 3, h: 2 },
}

const MOBILE_BREAKPOINT = 640
const DESKTOP_COLS = 4
const MOBILE_COLS = 2

// ============================================
// MOCK DATA
// ============================================

const mockRecentActivities = [
  {
    id: '1',
    type: 'article_published',
    title: 'Статья опубликована',
    description: 'Ваша статья "React Hooks Best Practices" была опубликована 30 мин назад',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: '2',
    type: 'comment_received',
    title: 'Новый комментарий',
    description: 'Пользователь @devmaster оставил комментарий к вашей статье 2 ч назад',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    icon: <MessageSquare className="h-4 w-4" />,
  },
]

const mockQuickStats = [
  { label: 'Статей опубликовано', value: 12, change: 2, icon: <FileText className="h-4 w-4" /> },
  { label: 'Всего просмотров', value: '1.2K', change: 15, icon: <Eye className="h-4 w-4" /> },
  { label: 'Комментариев получено', value: 48, change: 8, icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Лайков получено', value: 234, change: 12, icon: <Heart className="h-4 w-4" /> },
]

const mockUpcomingEvents = [
  {
    id: '1',
    title: 'Hackathon 2025',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    participants: 45,
    maxParticipants: 100,
    type: 'competition',
  },
]

const mockRecentArticles = [
  {
    id: '1',
    title: 'React Hooks Best Practices',
    views: 234,
    likes: 12,
    comments: 5,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '2',
    title: 'TypeScript Advanced Patterns',
    views: 189,
    likes: 8,
    comments: 3,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    title: 'Building Scalable React Apps',
    views: 156,
    likes: 6,
    comments: 2,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

const availableWidgets: Array<{
  id: WidgetId
  name: string
  description: string
  defaultEnabled: boolean
  defaultSize: WidgetSize
  icon: React.ReactNode
}> = [
  { id: 'profile', name: 'Профиль', description: 'Краткая информация о вашем профиле', defaultEnabled: true, defaultSize: 'medium', icon: <Users className="h-4 w-4" /> },
  { id: 'achievements', name: 'Достижения', description: 'Ваши последние достижения', defaultEnabled: true, defaultSize: 'medium', icon: <Trophy className="h-4 w-4" /> },
  { id: 'recent-articles', name: 'Последние статьи', description: 'Ваши недавно опубликованные статьи', defaultEnabled: true, defaultSize: 'large', icon: <FileText className="h-4 w-4" /> },
  { id: 'quick-stats', name: 'Статистика', description: 'Быстрая статистика вашей активности', defaultEnabled: true, defaultSize: 'extra-large', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'recent-activity', name: 'Последние события', description: 'Недавние события на платформе', defaultEnabled: true, defaultSize: 'large', icon: <Clock className="h-4 w-4" /> },
  { id: 'upcoming-events', name: 'Предстоящие события', description: 'Ближайшие ивенты и мероприятия', defaultEnabled: true, defaultSize: 'medium', icon: <Calendar className="h-4 w-4" /> },
  { id: 'quick-links', name: 'Быстрые ссылки', description: 'Быстрый доступ к разделам сайта', defaultEnabled: true, defaultSize: 'small', icon: <Zap className="h-4 w-4" /> },
  { id: 'level-progress', name: 'Прогресс уровня', description: 'Ваш текущий уровень и прогресс', defaultEnabled: true, defaultSize: 'small', icon: <Target className="h-4 w-4" /> },
  { id: 'forum', name: 'Форум', description: 'Быстрый доступ к форуму', defaultEnabled: true, defaultSize: 'medium', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'networking', name: 'Нетворкинг', description: 'Сеть контактов и возможности', defaultEnabled: true, defaultSize: 'medium', icon: <Network className="h-4 w-4" /> },
  { id: 'courses', name: 'Курсы', description: 'Образовательные курсы и материалы', defaultEnabled: true, defaultSize: 'medium', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'developers', name: 'Разработчики', description: 'Ресурсы для разработчиков', defaultEnabled: true, defaultSize: 'medium', icon: <Code className="h-4 w-4" /> },
  { id: 'explore', name: 'Исследовать', description: 'Дуэли, лидерборды, события', defaultEnabled: true, defaultSize: 'large', icon: <Compass className="h-4 w-4" /> },
  { id: 'about-us', name: 'О нас', description: 'Информация о платформе Aetheris', defaultEnabled: true, defaultSize: 'large', icon: <Info className="h-4 w-4" /> },
  { id: 'trending', name: 'Тренды', description: 'Популярные статьи и темы', defaultEnabled: false, defaultSize: 'medium', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'reading-list', name: 'Список чтения', description: 'Сохраненные статьи для чтения', defaultEnabled: false, defaultSize: 'medium', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'notifications', name: 'Уведомления', description: 'Последние уведомления', defaultEnabled: false, defaultSize: 'medium', icon: <Clock className="h-4 w-4" /> },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { level, achievements } = useGamificationStore()
  const gridContainerRef = useRef<HTMLDivElement>(null)
  // Инициализируем с примерной шириной, чтобы виджеты могли отрендериться сразу
  const [gridWidth, setGridWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= MOBILE_BREAKPOINT ? 1200 : 600
    }
    return 1200
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toast } = useToast()

  // Определяем количество колонок на основе ширины
  const isMobile = gridWidth > 0 && gridWidth < MOBILE_BREAKPOINT
  const cols = isMobile ? MOBILE_COLS : DESKTOP_COLS

  // Адаптивные параметры grid
  const margin = isMobile ? 8 : 12
  const rowHeight = useMemo(() => {
    if (gridWidth <= 0) return isMobile ? 80 : 120
    const cellWidth = (gridWidth - (cols + 1) * margin) / cols
    const minHeight = isMobile ? 80 : 100
    return Math.max(minHeight, Math.floor(cellWidth))
  }, [gridWidth, cols, margin, isMobile])

  // Инициализация layout из localStorage
  const getInitialLayout = useCallback((): Layout[] => {
    if (typeof window === 'undefined') return []
    
    const saved = localStorage.getItem('dashboard-layout')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Layout[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validLayout = parsed.filter((item) => 
            availableWidgets.some((w) => w.id === item.i) &&
            item.x >= 0 && item.y >= 0 &&
            item.w > 0 && item.h > 0
          )
          if (validLayout.length > 0) {
            return validLayout
          }
        }
      } catch {
        // Если ошибка парсинга, используем дефолт
      }
    }
    
    // Дефолтный layout - используем десктопные колонки по умолчанию
    const defaultCols = typeof window !== 'undefined' && window.innerWidth >= MOBILE_BREAKPOINT ? DESKTOP_COLS : MOBILE_COLS
    const enabledWidgets = availableWidgets.filter((w) => w.defaultEnabled)
    const layout: Layout[] = []
    let currentX = 0
    let currentY = 0
    let maxHeightInRow = 0

    enabledWidgets.forEach((widget) => {
      const size = WIDGET_SIZES[widget.defaultSize]
      const w = Math.min(size.w, defaultCols)
      const h = size.h

      if (currentX + w > defaultCols) {
        currentX = 0
        currentY += maxHeightInRow
        maxHeightInRow = 0
      }

      layout.push({
        i: widget.id,
        x: currentX,
        y: currentY,
        w,
        h,
        minW: 1,
        minH: 1,
        maxW: defaultCols,
        maxH: 4,
      })

      currentX += w
      maxHeightInRow = Math.max(maxHeightInRow, h)
    })

    return layout
  }, [])

  const [layout, setLayout] = useState<Layout[]>(getInitialLayout)

  // Убеждаемся, что layout всегда инициализирован
  useEffect(() => {
    if (layout.length === 0) {
      const defaultLayout = getInitialLayout()
      if (defaultLayout.length > 0) {
        setLayout(defaultLayout)
      }
    }
  }, []) // Только при монтировании

  // Отслеживание размера контейнера
  useEffect(() => {
    if (!gridContainerRef.current) return

    const updateWidth = () => {
      if (gridContainerRef.current) {
        const width = gridContainerRef.current.clientWidth
        if (width > 0) {
          setGridWidth(width)
        }
      }
    }

    // Немедленный расчет
    updateWidth()

    // Дополнительный расчет после следующего кадра для точности
    const rafId = requestAnimationFrame(() => {
      updateWidth()
      // Еще один кадр для гарантии
      requestAnimationFrame(updateWidth)
    })

    // Используем ResizeObserver для отслеживания изменений
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateWidth)
    })
    resizeObserver.observe(gridContainerRef.current)

    // Также слушаем изменения размера окна
    const handleResize = () => {
      requestAnimationFrame(updateWidth)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Обновление layout при изменении количества колонок (например, при изменении размера экрана)
  useEffect(() => {
    if (gridWidth > 0 && layout.length > 0) {
      setLayout((prevLayout) => {
        // Проверяем, нужно ли обновить maxW для всех виджетов
        const needsUpdate = prevLayout.some((item) => item.maxW !== cols)
        if (!needsUpdate) return prevLayout

        return prevLayout.map((item) => {
          const newW = Math.min(item.w, cols)
          return {
            ...item,
            maxW: cols,
            w: newW,
            x: Math.min(item.x, Math.max(0, cols - newW)),
          }
        })
      })
    }
  }, [cols, gridWidth])

  // Сохранение layout в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && layout.length > 0) {
      localStorage.setItem('dashboard-layout', JSON.stringify(layout))
    }
  }, [layout])

  // Получаем enabled виджеты из layout
  const enabledWidgetIds = useMemo(() => {
    return new Set(layout.map((item) => item.i))
  }, [layout])

  // Обработчик изменения layout
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (isEditMode) {
      setLayout(newLayout)
    }
  }, [isEditMode])

  // Обработчики для drag событий
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }, [])

  const handleDragStop = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false)
      dragTimeoutRef.current = null
    }, 200)
  }, [])

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

  // Обертка для onClick, которая блокирует клики после drag и в режиме редактирования
  const createSafeClickHandler = useCallback((handler: () => void) => {
    return (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (isEditMode) {
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        toast({
          title: t('dashboard.editMode'),
          description: t('dashboard.editModeDescription'),
          variant: 'default',
        })
        return
      }
      handler()
    }
  }, [isDragging, isEditMode, toast])

  // Получаем размер виджета по его ID
  const getWidgetSize = useCallback((widgetId: WidgetId): WidgetSize => {
    const widget = availableWidgets.find((w) => w.id === widgetId)
    return widget?.defaultSize || 'medium'
  }, [])

  // Обработчики для диалога настроек
  const handleToggleWidget = useCallback((widgetId: WidgetId) => {
    setLayout((prev) => {
      const exists = prev.some((item) => item.i === widgetId)
      const currentCols = gridWidth >= MOBILE_BREAKPOINT ? DESKTOP_COLS : MOBILE_COLS
      
      if (exists) {
        return prev.filter((item) => item.i !== widgetId)
      } else {
        const widget = availableWidgets.find((w) => w.id === widgetId)!
        const size = WIDGET_SIZES[widget.defaultSize]
        const w = Math.min(size.w, currentCols)
        const h = size.h
        
        const maxY = prev.length > 0 ? Math.max(...prev.map((item) => item.y + item.h)) : 0
        
        return [
          ...prev,
          {
            i: widgetId,
            x: 0,
            y: maxY,
            w,
            h,
            minW: 1,
            minH: 1,
            maxW: currentCols,
            maxH: 4,
          },
        ]
      }
    })
  }, [gridWidth])

  const handleSizeChange = useCallback((widgetId: WidgetId, newSize: WidgetSize) => {
    setLayout((prev) => {
      return prev.map((item) => {
        if (item.i === widgetId) {
          const size = WIDGET_SIZES[newSize]
          const currentCols = gridWidth >= MOBILE_BREAKPOINT ? DESKTOP_COLS : MOBILE_COLS
          return {
            ...item,
            w: Math.min(size.w, currentCols),
            h: size.h,
            maxW: currentCols,
          }
        }
        return item
      })
    })
  }, [gridWidth])

  if (!user) {
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
              <h1 className="text-lg font-semibold">{t('dashboard.pageTitle')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <DevelopmentBanner storageKey="dashboard-dev-banner" />
        <main className="container flex min-h-[60vh] items-center justify-center pb-16 pt-6">
          <Card className="w-full max-w-md border-border/60">
            <CardHeader>
              <CardTitle>{t('auth.title')}</CardTitle>
              <CardDescription>Войдите, чтобы увидеть свою домашнюю страницу</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
            <h1 className="text-lg font-semibold">{t('dashboard.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="dashboard-dev-banner" />
      <main className="container space-y-4 sm:space-y-6 pb-6 pt-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Домашняя страница</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Ваш персональный дашборд</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              size="icon"
              onClick={() => setIsEditMode(!isEditMode)}
              title={isEditMode ? 'Заблокировать перемещение' : 'Разблокировать перемещение'}
            >
              {isEditMode ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Настроить виджеты">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Настройка виджетов</DialogTitle>
                  <DialogDescription>
                    Выберите, какие виджеты отображать на вашей домашней странице и их размеры
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {availableWidgets.map((widget) => {
                    const isEnabled = enabledWidgetIds.has(widget.id)
                    const currentSize = layout.find((item) => item.i === widget.id) 
                      ? (() => {
                          const item = layout.find((item) => item.i === widget.id)!
                          if (item.w === 1 && item.h === 1) return 'small'
                          if (item.w === 2 && item.h === 1) return 'medium'
                          if (item.w === 2 && item.h === 2) return 'large'
                          if (item.w === 3 && item.h === 2) return 'extra-large'
                          return widget.defaultSize
                        })()
                      : widget.defaultSize

                    return (
                      <div
                        key={widget.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            {widget.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{widget.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{widget.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {isEnabled && (
                            <Select
                              value={currentSize}
                              onValueChange={(value) => handleSizeChange(widget.id, value as WidgetSize)}
                            >
                              <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Маленький</SelectItem>
                                <SelectItem value="medium">Средний</SelectItem>
                                <SelectItem value="large">Большой</SelectItem>
                                <SelectItem value="extra-large">Огромный</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            variant={isEnabled ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleToggleWidget(widget.id)}
                            className="shrink-0"
                          >
                            {isEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Widgets Grid */}
        <div 
          ref={gridContainerRef} 
          className="relative min-h-[200px] w-full"
          style={{ 
            margin: 0, 
            padding: 0,
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <style>{`
            .react-grid-layout {
              position: relative;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            .react-grid-layout * {
              box-sizing: border-box !important;
            }
            .react-grid-item {
              transition: all 200ms ease;
              transition-property: left, top, width, height;
            }
            .react-grid-item.cssTransforms {
              transition-property: transform, width, height;
            }
            .react-grid-item.react-draggable-dragging {
              transition: none;
              z-index: 3;
              will-change: transform;
            }
            .react-grid-item.react-grid-placeholder {
              background: hsl(var(--primary) / 0.1);
              opacity: 0.2;
              transition-duration: 100ms;
              z-index: 2;
              border-radius: calc(var(--radius) - 2px);
            }
            .react-grid-item > div {
              height: 100%;
              width: 100%;
              overflow: hidden;
              box-sizing: border-box !important;
            }
          `}</style>
          {layout.length > 0 ? (
            <GridLayout
              className="layout"
              layout={layout}
              cols={cols}
              rowHeight={rowHeight}
              width={gridWidth}
              isDraggable={isEditMode}
              isResizable={false}
              onLayoutChange={handleLayoutChange}
              onDragStart={handleDragStart}
              onDragStop={handleDragStop}
              margin={[margin, margin]}
              containerPadding={[0, 0]}
              compactType="vertical"
              preventCollision={false}
              useCSSTransforms={true}
            >
              {layout.map((item) => {
                const widgetId = item.i as WidgetId
                const size = getWidgetSize(widgetId)
                return (
                  <div key={item.i} className="h-full w-full overflow-hidden">
                    {renderWidget(widgetId, size, user, level, achievements, createSafeClickHandler)}
                  </div>
                )
              })}
            </GridLayout>
          ) : (
            <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
              Нет виджетов для отображения
            </div>
          )}
        </div>
      </main>
    </div>
  )

  // Функция рендеринга виджетов
  function renderWidget(
    widgetId: WidgetId,
    size: WidgetSize,
    user: any,
    level: number,
    achievements: any[],
    createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void
  ) {
    switch (widgetId) {
      case 'profile':
        return <ProfileWidget size={size} user={user} level={level} createSafeClickHandler={createSafeClickHandler} />
      case 'achievements':
        return <AchievementsWidget size={size} achievements={achievements} createSafeClickHandler={createSafeClickHandler} />
      case 'recent-articles':
        return <RecentArticlesWidget size={size} articles={mockRecentArticles} createSafeClickHandler={createSafeClickHandler} />
      case 'quick-stats':
        return <QuickStatsWidget size={size} stats={mockQuickStats} />
      case 'recent-activity':
        return <RecentActivityWidget size={size} activities={mockRecentActivities} />
      case 'upcoming-events':
        return <UpcomingEventsWidget size={size} events={mockUpcomingEvents} createSafeClickHandler={createSafeClickHandler} />
      case 'quick-links':
        return <QuickLinksWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'level-progress':
        return <LevelProgressWidget size={size} level={level} />
      case 'forum':
        return <ForumWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'networking':
        return <NetworkingWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'courses':
        return <CoursesWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'developers':
        return <DevelopersWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'explore':
        return <ExploreWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'about-us':
        return <AboutUsWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'trending':
        return <TrendingWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'reading-list':
        return <ReadingListWidget size={size} createSafeClickHandler={createSafeClickHandler} />
      case 'notifications':
        return <NotificationsWidget size={size} />
      default:
        return null
    }
  }
}

// ============================================
// WIDGET COMPONENTS
// ============================================

function ProfileWidget({ size, user, level, createSafeClickHandler }: { size: WidgetSize; user: any; level: number; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const { experience, xpIntoLevel, xpForLevel } = useGamificationStore()
  const progress = xpForLevel > 0 ? (xpIntoLevel / xpForLevel) * 100 : 0

  if (size === 'small') {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate(`/profile/${user.id}`))}>
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary mb-1 sm:mb-2">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xs sm:text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-xs sm:text-sm text-center px-1 truncate w-full">{user.username || 'Пользователь'}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Lv.{level}</p>
      </Card>
    )
  }

  if (size === 'medium') {
    return (
      <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate(`/profile/${user.id}`))}>
        <CardContent className="flex-1 flex items-center gap-3 sm:gap-4 p-3 sm:p-4 h-full">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs sm:text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{user.username || 'Пользователь'}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Уровень {level}</p>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="h-3 w-3 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{experience} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Профиль
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4 p-3 sm:p-6 overflow-y-auto">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-sm sm:text-base">{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg truncate">{user.username || 'Пользователь'}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Уровень {level}</p>
            <div className="flex items-center gap-2 mt-1 sm:mt-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{experience} XP</span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2 w-full flex-shrink-0" />
        <div className="flex gap-2 w-full flex-shrink-0">
          <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate(`/profile/${user.id}`))}>
            Профиль
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/settings'))}>
            Настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AchievementsWidget({ size, achievements, createSafeClickHandler }: { size: WidgetSize; achievements: any[]; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/achievements'))}>
        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Достижения</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{achievements.length}</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/achievements'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Достижения
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        {achievements.slice(0, size === 'large' ? 3 : 2).map((achievement) => (
          <div key={achievement.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm truncate">{achievement.name || 'Достижение'}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{achievement.description || ''}</p>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-auto flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/achievements'))}>
          Все достижения
        </Button>
      </CardContent>
    </Card>
  )
}

function RecentArticlesWidget({ size, articles, createSafeClickHandler }: { size: WidgetSize; articles: any[]; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/forum'))}>
        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Статьи</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            Последние статьи
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 shrink-0" onClick={createSafeClickHandler(() => navigate('/forum'))}>
            Все <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        {articles.slice(0, size === 'large' ? 3 : 2).map((article) => (
          <button
            key={article.id}
            className="text-left p-2 sm:p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={createSafeClickHandler(() => navigate(`/article/${article.id}`))}
          >
            <p className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2">{article.title}</p>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 shrink-0" />
                {article.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 shrink-0" />
                {article.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 shrink-0" />
                {article.comments}
              </span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

function QuickStatsWidget({ size, stats }: { size: WidgetSize; stats: any[] }) {
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Статистика</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        {stats.map((stat, index) => (
          <div key={index} className="p-2 sm:p-3 rounded-lg border border-border/40 bg-muted/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div className="text-primary shrink-0">{stat.icon}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{stat.label}</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
            {stat.change && (
              <p className="text-[10px] sm:text-xs text-green-500 mt-1">+{stat.change}%</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RecentActivityWidget({ size, activities }: { size: WidgetSize; activities: any[] }) {
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">События</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Последние события
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        {activities.slice(0, size === 'large' ? 3 : 2).map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border/40">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <div className="h-3 w-3 sm:h-4 sm:w-4">{activity.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm">{activity.title}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1">{activity.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function UpcomingEventsWidget({ size, events, createSafeClickHandler }: { size: WidgetSize; events: any[]; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/explore'))}>
        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">События</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Предстоящие события
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        {events.slice(0, size === 'large' ? 3 : 2).map((event) => (
          <button
            key={event.id}
            className="text-left p-2 sm:p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={createSafeClickHandler(() => navigate(`/explore/events/${event.id}`))}
          >
            <p className="font-medium text-xs sm:text-sm mb-1">{event.title}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {new Date(event.date).toLocaleDateString('ru-RU')}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {event.participants}/{event.maxParticipants} участников
            </p>
          </button>
        ))}
        <Button variant="outline" size="sm" className="mt-auto flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/explore'))}>
          Все события
        </Button>
      </CardContent>
    </Card>
  )
}

function QuickLinksWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  const links = [
    { label: 'Форум', path: '/forum', icon: MessageSquare },
    { label: 'Создать', path: '/create-article', icon: FileText },
    { label: 'Исследовать', path: '/explore', icon: Compass },
    { label: 'Тренды', path: '/trending', icon: TrendingUp },
    { label: 'Курсы', path: '/courses', icon: GraduationCap },
    { label: 'О нас', path: '/', icon: Info },
  ]

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Ссылки</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Быстрые ссылки
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-2 p-3 sm:p-6 overflow-y-auto">
        {links.slice(0, size === 'large' ? 6 : 4).map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.path}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={createSafeClickHandler(() => navigate(link.path))}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-1">{link.label}</span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

function LevelProgressWidget({ size, level }: { size: WidgetSize; level: number }) {
  const { experience, xpIntoLevel, xpForLevel } = useGamificationStore()
  const progress = xpForLevel > 0 ? (xpIntoLevel / xpForLevel) * 100 : 0
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
        <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Уровень {level}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{experience} XP</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Прогресс уровня
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-bold">Уровень {level}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{xpIntoLevel} / {xpForLevel} XP</p>
        </div>
        <Progress value={progress} className="h-2 flex-shrink-0" />
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span className="font-semibold">{experience}</span>
            <span className="text-muted-foreground">XP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ForumWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/forum'))}>
        <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Форум</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/forum'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Форум
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/forum'))}>
          Открыть форум
        </Button>
      </CardContent>
    </Card>
  )
}

function NetworkingWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/networking'))}>
        <Network className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Нетворкинг</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/networking'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Network className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Нетворкинг
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/networking'))}>
          Открыть нетворкинг
        </Button>
      </CardContent>
    </Card>
  )
}

function CoursesWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/courses'))}>
        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Курсы</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/courses'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Курсы
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/courses'))}>
          Открыть курсы
        </Button>
      </CardContent>
    </Card>
  )
}

function DevelopersWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/developers'))}>
        <Code className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Разработчики</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/developers'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Code className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Разработчики
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">Ресурсы для разработчиков</p>
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/developers'))}>
          Открыть
        </Button>
      </CardContent>
    </Card>
  )
}

function ExploreWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/explore'))}>
        <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Исследовать</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/explore'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Исследовать
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/explore'))}>
          Открыть
        </Button>
      </CardContent>
    </Card>
  )
}

function AboutUsWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/'))}>
        <Info className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">О нас</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          О нас
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/'))}>
          Узнать больше
        </Button>
      </CardContent>
    </Card>
  )
}

function TrendingWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/trending'))}>
        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Тренды</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/trending'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Тренды
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/trending'))}>
          Открыть тренды
        </Button>
      </CardContent>
    </Card>
  )
}

function ReadingListWidget({ size, createSafeClickHandler }: { size: WidgetSize; createSafeClickHandler: (handler: () => void) => (e: React.MouseEvent) => void }) {
  const navigate = useNavigate()
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/reading-list'))}>
        <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Чтение</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors overflow-hidden" onClick={createSafeClickHandler(() => navigate('/reading-list'))}>
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Список чтения
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">Сохраненные статьи</p>
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={createSafeClickHandler(() => navigate('/reading-list'))}>
          Открыть
        </Button>
      </CardContent>
    </Card>
  )
}

function NotificationsWidget({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <Card className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
        <p className="font-semibold text-xs sm:text-sm px-1">Уведомления</p>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          Уведомления
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-6 overflow-y-auto">
        <div className="text-center">
          <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-muted-foreground">Последние уведомления</p>
          <Button size="sm" className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-9">
            Открыть
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
