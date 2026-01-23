
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Heart,
  ThumbsDown,
  Share2,
  Bookmark,
  Copy,
  Check,
  Twitter,
  Send,
  Linkedin,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CornerUpLeft,
  CornerDownRight,
  Minimize2,
  MoreHorizontal,
  Plus,
  Minus,
  Info,
  Flag,
  Pencil,
  Trash2,
  Facebook,
  MessageCircle,
  Mail,
  Link2,
  TrendingUp,
} from 'lucide-react'
import { getArticle, reactArticle, deleteArticle, incrementArticleView, incrementArticleViews } from '@/api/articles'
import type { Article } from '@/types/article'
import { 
  getArticleComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  reactToComment 
} from '@/api/comments'
import type { Comment as RemoteComment } from '@/api/comments'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { RateLimitError } from '@/lib/errors'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { addBookmark, removeBookmark, isBookmarked } from '@/api/bookmarks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  selectLocalComments,
  useLocalCommentsStore,
} from '@/stores/localCommentsStore'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { logger } from '@/lib/logger'
import { ArticleContent } from '@/components/ArticleContent'

function DiscordIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.317 4.37A17.643 17.643 0 0 0 16.61 3c-.18.32-.386.75-.53 1.09a16.14 16.14 0 0 0-4.16 0c-.144-.34-.35-.77-.53-1.09a17.64 17.64 0 0 0-3.71 1.37C4.275 8.14 3.76 11.81 4.07 15.43a17.94 17.94 0 0 0 4.43 2.18c.36-.52.68-1.07.96-1.65-.52-.19-1.01-.42-1.47-.68l.34-.27c2.82 1.31 5.89 1.31 8.69 0l.34.27c-.46.26-.95.5-1.47.68.28.58.6 1.13.96 1.65a17.94 17.94 0 0 0 4.43-2.18c.31-3.23-.27-6.86-1.96-11.06ZM9.35 13.48c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Zm5.29 0c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Z" />
    </svg>
  )
}

function RedditIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function InstagramIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function YoutubeIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function GithubIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

type CommentSource = 'remote' | 'local'

interface UnifiedComment extends RemoteComment {
  source: CommentSource
}

interface CommentNode extends UnifiedComment {
  replies: CommentNode[]
}

// CommentReactionState interface removed - not used

const MAX_VISIBLE_STRIPE_DEPTH = 6
const STRIPE_WIDTH = 2
const STRIPE_GAP = 4
const BASE_COMMENT_PADDING_MOBILE = 12
const MAX_COMMENT_LENGTH = 2000
const STRIPE_CLASSNAMES = [
  'bg-border/80',
  'bg-border/70',
  'bg-border/60',
  'bg-border/50',
  'bg-border/40',
  'bg-border/30',
]

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const registerActivity = useGamificationStore((s) => s.registerActivity)
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()

  // Helper функция для обработки RateLimitError
  const handleRateLimitError = (error: any) => {
    if (error instanceof RateLimitError) {
      const waitTime = error.waitTime
      if (waitTime > 0) {
        toast({
          title: t('common.rateLimitExceeded') || 'Слишком много запросов',
          description: waitTime === 1
            ? t('common.waitOneSecond') || 'Подождите 1 секунду перед следующим действием'
            : t('common.waitSeconds', { seconds: waitTime }) || `Подождите ${waitTime} секунд перед следующим действием`,
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      } else {
        toast({
          title: t('common.rateLimitExceeded') || 'Слишком много запросов',
          description: t('common.waitAMoment') || 'Вы слишком часто отправляете запросы. Подождите немного.',
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      }
      return true
    }
    return false
  }

  const [commentText, setCommentText] = useState('')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [sharePage, setSharePage] = useState(0)
  const [activeReply, setActiveReply] = useState<{ parentId: string; parentAuthor: string } | null>(
    null
  )
  const [replyText, setReplyText] = useState('')
  const [highlightDepth, setHighlightDepth] = useState<number | null>(null)
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})
  const [threadRootId, setThreadRootId] = useState<string | null>(null)
  const replyHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [infoComment, setInfoComment] = useState<CommentNode | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [isDeleteArticleDialogOpen, setIsDeleteArticleDialogOpen] = useState(false)
  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const replyInputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const editInputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const articleContentRef = useRef<HTMLDivElement | null>(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const [smoothedProgress, setSmoothedProgress] = useState(0)


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // Fetch article с оптимизированными настройками
  // Включаем userId в queryKey, чтобы при изменении пользователя данные обновлялись
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id, user?.id],
    queryFn: () => getArticle(id as string),
    enabled: !!id,
    // Статьи кэшируем на 10 минут (контент меняется редко)
    staleTime: 10 * 60 * 1000,
    // Храним в кэше 1 час
    gcTime: 60 * 60 * 1000,
    // Используем кеш при повторном входе (рефетч выполнит эффект ниже при необходимости)
    refetchOnMount: false,
    // Retry логика
    retry: (failureCount, error: any) => {
      // Не ретраить на 404 (статья не найдена)
      if (error?.response?.status === 404) {
        return false
      }
      // Не ретраить на другие 4xx ошибки
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      // Максимум 3 попытки для сетевых/серверных ошибок
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Простой инкремент просмотров через 10 секунд
  useEffect(() => {
    if (!article) {
      return
    }

    const timer = setTimeout(() => {
      incrementArticleViews(article.id, user?.id).then(() => {
        // Обновляем данные статьи в кеше, чтобы отобразить новые просмотры
        queryClient.invalidateQueries({ queryKey: ['article', id, user?.id] })
      }).catch((error) => {
        logger.warn('[ArticlePage] Failed to increment views:', error)
      })
    }, 10000) // 10 секунд - стандартное время для засчета просмотра

    return () => {
      clearTimeout(timer)
    }
  }, [article?.id, user?.id])

  const authorName = useMemo(
    () =>
      article?.author?.username?.trim() ||
      (article as any)?.author_username ||
      (article as any)?.username ||
      'User',
    [article?.author?.username, article?.id]
  )

  // Засчитываем просмотр спустя 10 секунд пребывания на странице
  useEffect(() => {
    const articleId = article?.id
    if (!articleId) {
      return;
    }

    const viewUserId = user?.id ? String(user.id) : undefined

    const timer = setTimeout(() => {
      incrementArticleView(articleId, viewUserId).catch((error) => {
        logger.warn('[ArticlePage] Failed to increment article view:', error);
      })
    }, 10_000)
    return () => {
      clearTimeout(timer);
    }
  }, [article?.id, user?.id])

  // Рефетчим статью и комментарии после загрузки пользователя, чтобы получить userReaction
  useEffect(() => {
    if (user?.id && id) {
      // Небольшая задержка, чтобы убедиться, что пользователь полностью загружен
      const timeoutId = setTimeout(() => {
        const articleData = queryClient.getQueryData(['article', id, user.id]) as any
        const commentsData = queryClient.getQueryData(['article-comments', id, user.id]) as any
        
        // Рефетчим статью, если:
        // 1. Данных нет
        // 2. userReaction не определен (undefined) - значит данные были загружены до загрузки пользователя
        // 3. Или если статья была загружена без userId в queryKey (старая версия кеша)
        const articleDataWithoutUser = queryClient.getQueryData(['article', id]) as any
        // Проверяем, была ли статья загружена с userId - если нет, нужно рефетчить
        const wasLoadedWithUser = articleData && 'userReaction' in articleData
        const needsArticleRefetch = !articleData || 
          !wasLoadedWithUser ||
          (!!articleDataWithoutUser && !articleData)
        const needsCommentsRefetch = !commentsData
        
        if (needsArticleRefetch) {
          // Инвалидируем старый кеш без userId и рефетчим с userId
          queryClient.invalidateQueries({ queryKey: ['article', id] })
          queryClient.refetchQueries({ queryKey: ['article', id, user.id] })
        }
        
        if (needsCommentsRefetch) {
          queryClient.refetchQueries({ queryKey: ['article-comments', id, user.id] })
        }
      }, 100) // Небольшая задержка для стабилизации
      
      return () => clearTimeout(timeoutId)
    }
  }, [user?.id, id, queryClient])

  // Обработка кнопок копирования кода
  useEffect(() => {
    if (!article || !articleContentRef.current) return

    const handleCopyCode = async (button: HTMLElement) => {
      const codeBlock = button.closest('.code-block-wrapper')
      if (!codeBlock) return

      const codeElement = codeBlock.querySelector('code')
      if (!codeElement) return

      // Получаем текст из code элемента (учитываем HTML entities)
      const codeContent = codeElement.textContent || codeElement.innerText || ''

      try {
        await navigator.clipboard.writeText(codeContent)
        
        // Показываем иконку "галочка"
        const copyIcon = button.querySelector('.copy-icon')
        const checkIcon = button.querySelector('.check-icon')
        
        if (copyIcon && checkIcon) {
          copyIcon.classList.add('hidden')
          checkIcon.classList.remove('hidden')
          
          setTimeout(() => {
            copyIcon.classList.remove('hidden')
            checkIcon.classList.add('hidden')
          }, 2000)
        }
      } catch (err) {
        logger.warn('Failed to copy code:', err)
      }
    }

    // Добавляем обработчики для всех кнопок копирования
    // Используем setTimeout, чтобы убедиться, что HTML уже отрендерен
    const timeoutId = setTimeout(() => {
      const copyButtons = articleContentRef.current?.querySelectorAll('.code-block-copy-btn')
      copyButtons?.forEach((button) => {
        const handler = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          handleCopyCode(button as HTMLElement)
        }
        button.addEventListener('click', handler)
        
        // Сохраняем обработчик для последующего удаления
        ;(button as any)._copyHandler = handler
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      // Очищаем обработчики при размонтировании
      const copyButtons = articleContentRef.current?.querySelectorAll('.code-block-copy-btn')
      copyButtons?.forEach((button) => {
        const handler = (button as any)._copyHandler
        if (handler) {
          button.removeEventListener('click', handler)
          delete (button as any)._copyHandler
        }
      })
    }
  }, [article])

  // Track reading progress
  useEffect(() => {
    if (!article) {
      setReadingProgress(0)
      return
    }

    const handleScroll = () => {
      if (!articleContentRef.current) {
        setReadingProgress(0)
        return
      }

      const element = articleContentRef.current
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      // Get the absolute position of the element from the top of the document
      const elementTop = scrollTop + rect.top
      // Get element height - use scrollHeight for content that may overflow
      const elementHeight = element.scrollHeight || element.offsetHeight || rect.height
      const elementBottom = elementTop + elementHeight
      
      // Calculate progress: how much of the article has been scrolled through
      let progress = 0
      
      // Calculate the viewport boundaries
      const viewportTop = scrollTop
      const viewportBottom = scrollTop + windowHeight
      
      // If article hasn't been reached yet
      if (viewportBottom < elementTop) {
        progress = 0
      }
      // If article has been completely scrolled past
      else if (viewportTop >= elementBottom) {
        progress = 100
      }
      // Article is being read - calculate progress
      else {
        // How much of the article has been scrolled through
        // Progress = (how far we've scrolled into the article) / (total scrollable distance)
        const scrolledIntoArticle = Math.max(0, viewportTop - elementTop)
        const totalScrollable = Math.max(1, elementHeight - windowHeight) // Use 1 to avoid division by zero
        progress = Math.min(100, Math.max(0, (scrolledIntoArticle / totalScrollable) * 100))
      }
      
      setReadingProgress(progress)
    }

    // Use requestAnimationFrame for smoother updates
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    
    // Initial calculation after content is rendered
    // Use longer delay to ensure content is fully loaded
    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 800)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [article])

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = readingProgress
    const currentProgress = smoothedProgress
    const difference = targetProgress - currentProgress
    
    // If difference is small, update immediately
    if (Math.abs(difference) < 0.1) {
      setSmoothedProgress(targetProgress)
      return
    }
    
    // Smooth interpolation using requestAnimationFrame
    let animationFrameId: number
    const startTime = performance.now()
    const duration = 150 // 150ms for smooth transition
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease-out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const newProgress = currentProgress + difference * easeOut
      
      setSmoothedProgress(newProgress)
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setSmoothedProgress(targetProgress)
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [readingProgress, smoothedProgress])

  const {
    data: commentsResponse,
    isLoading: isCommentsLoading,
    isRefetching: isCommentsRefetching,
  } = useQuery({
    queryKey: ['article-comments', id, user?.id],
    queryFn: () => getArticleComments(id as string),
    enabled: !!id,
    staleTime: 0, // Всегда считаем данные устаревшими для комментариев
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnMount: true, // Всегда обновляем при монтировании
  })


  // React to article с оптимистичными обновлениями
  const reactMutation = useMutation({
    mutationFn: ({ reaction }: { reaction: 'like' | 'dislike' }) => {
      if (!article) {
        throw new Error('Статья ещё не загружена')
      }
      return reactArticle(article.id, reaction)
    },
    onMutate: async ({ reaction }) => {
      // Оптимистичное обновление: сразу обновляем UI
      if (!article || !user) return

      const currentArticle = queryClient.getQueryData<Article>(['article', id, user.id])
      if (!currentArticle) return

      const previousReaction = currentArticle.userReaction
      const previousLikes = currentArticle.likes || 0
      const previousDislikes = currentArticle.dislikes || 0

      // Определяем новое состояние
      let newUserReaction: 'like' | 'dislike' | null = null
      let newLikes = previousLikes
      let newDislikes = previousDislikes

      if (previousReaction === reaction) {
        // Удаляем реакцию (toggle off)
        newUserReaction = null
        if (reaction === 'like') {
          newLikes = Math.max(0, previousLikes - 1)
        } else {
          newDislikes = Math.max(0, previousDislikes - 1)
        }
      } else {
        // Добавляем или изменяем реакцию
        newUserReaction = reaction
        if (reaction === 'like') {
          // Если была дизлайк, убираем её
          if (previousReaction === 'dislike') {
            newDislikes = Math.max(0, previousDislikes - 1)
          }
          // Добавляем лайк (если его не было)
          if (previousReaction !== 'like') {
            newLikes = previousLikes + 1
          }
        } else {
          // Если был лайк, убираем его
          if (previousReaction === 'like') {
            newLikes = Math.max(0, previousLikes - 1)
          }
          // Добавляем дизлайк (если его не было)
          if (previousReaction !== 'dislike') {
            newDislikes = previousDislikes + 1
          }
        }
      }

      // Моментально обновляем кеш для мгновенного отображения
      const optimisticArticle = {
        ...currentArticle,
        userReaction: newUserReaction,
        likes: newLikes,
        dislikes: newDislikes,
      }

      queryClient.setQueryData(['article', id, user.id], optimisticArticle)

      return { previousArticle: currentArticle }
    },
    onSuccess: (updatedArticle, _variables, context) => {
      // Синхронизируем с сервером после успешного ответа
      const currentArticle = queryClient.getQueryData<Article>(['article', id, user?.id])
      const articleWithPreservedFields = {
        ...updatedArticle,
        author: currentArticle?.author || updatedArticle.author,
        content: currentArticle?.content || updatedArticle.content || '',
        contentJSON: currentArticle?.contentJSON || updatedArticle.contentJSON,
        // Используем userReaction с сервера для точности
        userReaction: updatedArticle.userReaction ?? null,
        likes: updatedArticle.likes ?? currentArticle?.likes ?? 0,
        dislikes: updatedArticle.dislikes ?? currentArticle?.dislikes ?? 0,
      }
      queryClient.setQueryData(['article', id, user?.id], articleWithPreservedFields)
    },
    gcTime: 0,
    onError: (error: any, _variables, context) => {
      // Откатываем оптимистичное обновление при ошибке
      if (context?.previousArticle && user?.id) {
        queryClient.setQueryData(['article', id, user.id], context.previousArticle)
      }
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to react to article:', error)
      toast({
        title: t('article.reactionError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.reactionErrorDescription') || 'Не удалось поставить реакцию',
        variant: 'destructive',
      })
    },
  })


  const handleReaction = (reaction: 'like' | 'dislike') => {
    if (!user) {
      setIsAuthRequiredDialogOpen(true)
      return
    }
    if (!article) {
      toast({
        title: t('article.wait'),
        description: t('article.waitDescription'),
        variant: 'destructive',
      })
      return
    }
    reactMutation.mutate({ reaction })
  }

  // Check if article is bookmarked
  const { data: isSaved = false } = useQuery({
    queryKey: ['bookmark', article?.id, user?.id],
    queryFn: () => article?.id ? isBookmarked(article.id) : Promise.resolve(false),
    enabled: !!article?.id && !!user,
    staleTime: 0, // Всегда проверяем свежесть данных
    refetchOnMount: 'always', // Всегда обновляем при монтировании компонента
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnReconnect: true, // Обновляем при переподключении
    gcTime: 5 * 60 * 1000, // Кешируем 5 минут для оптимизации
  })

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ articleId, currentlySaved }: { articleId: string; currentlySaved: boolean }) => {
      if (currentlySaved) {
        return await removeBookmark(articleId)
      } else {
        return await addBookmark(articleId)
      }
    },
    onMutate: async ({ currentlySaved, articleId }) => {
      // Optimistic update: сразу обновляем состояние в кеше
      const queryKey = ['bookmark', articleId, user?.id]
      await queryClient.cancelQueries({ queryKey })
      const previousValue = queryClient.getQueryData(queryKey) ?? false
      // Инвертируем текущее состояние
      const newValue = !currentlySaved
      queryClient.setQueryData(queryKey, newValue)
      return { previousValue, queryKey, newValue }
    },
    onSuccess: async (_data, variables, context) => {
      const queryKey = ['bookmark', variables.articleId, user?.id]
      const newValue = context?.newValue ?? !variables.currentlySaved

      if (variables.currentlySaved === false) registerActivity('add_bookmark')
      
      
      // Инвалидируем список закладок
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      
      // Устанавливаем новое значение в кеш для немедленного обновления UI
      queryClient.setQueryData(queryKey, newValue)
      
      // Помечаем query как stale, чтобы при следующем монтировании он обновился
      await queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
    },
    onError: (error, _variables, context) => {
      // Откатываем optimistic update при ошибке
      logger.error('[Bookmark] Mutation error:', error)
      if (context?.previousValue !== undefined && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousValue)
      }
    },
  })
  const articleCommentKey = useMemo(() => {
    if (article?.id) {
      // id - это строковое представление числового Strapi id
      return String(article.id)
    }
    return typeof id === 'string' ? id : ''
  }, [article, id])

  const localCommentsSelector = useMemo(
    () => selectLocalComments(articleCommentKey),
    [articleCommentKey]
  )
  const localComments = useLocalCommentsStore(localCommentsSelector)
  // const _addLocalComment = useLocalCommentsStore((state) => state.addComment) // Unused, but may be needed in future

  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Защита от спама - debounce и проверка isPending
  const bookmarkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (bookmarkTimeoutRef.current) {
        clearTimeout(bookmarkTimeoutRef.current)
      }
    }
  }, [])
  
  const handleBookmark = useCallback(() => {
    // Если мутация уже выполняется, игнорируем клик
    if (bookmarkMutation.isPending) {
      return
    }

    // Очищаем предыдущий таймер, если он есть
    if (bookmarkTimeoutRef.current) {
      clearTimeout(bookmarkTimeoutRef.current)
      bookmarkTimeoutRef.current = null
    }

    // Debounce: ждем 300ms перед выполнением
    bookmarkTimeoutRef.current = setTimeout(() => {
    if (!user) {
      toast({
          title: t('article.authRequired'),
          description: t('article.authRequiredToBookmark'),
        variant: 'destructive',
      })
        navigate('/auth')
      return
    }

      if (!article?.id) {
    toast({
          title: t('article.wait'),
          description: t('article.waitDescription'),
        variant: 'destructive',
      })
      return
    }

      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем текущее состояние ДО optimistic update
    const wasSaved = isSaved

      bookmarkMutation.mutate(
        { articleId: article.id, currentlySaved: wasSaved },
        {
          onSuccess: () => {
            // Используем сохраненное значение wasSaved для правильного toast
    toast({
              title: wasSaved ? t('article.removedFromReadingList') : t('article.savedForLater'),
      description: wasSaved
                ? t('article.removedFromReadingListDescription')
                : t('article.savedForLaterDescription'),
            })
          },
          onError: (error) => {
            if (handleRateLimitError(error)) {
              return
            }
            logger.error('Failed to toggle bookmark:', error)
            toast({
              title: t('common.error'),
              description: t('article.bookmarkError'),
              variant: 'destructive',
            })
          },
        }
      )
    }, 300)
  }, [user, article?.id, isSaved, bookmarkMutation, navigate, t, toast])

  const ensureCommentAuth = () => {
    if (!user) {
      setIsAuthRequiredDialogOpen(true)
      return false
    }
    return true
  }

  // Mutations для комментариев
  const createCommentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string | null }) => {
      if (!id) {
        throw new Error('Article ID is missing')
      }
      // Используем id из URL, а не article.id, чтобы избежать рассинхронизации
      return createComment({ articleId: id, text, parentId: parentId || null })
    },
    onSuccess: (newComment, variables) => {

      registerActivity('add_comment')
      
      // Очищаем текст только при успешном создании комментария
      if (variables.parentId) {
        // Это был ответ на комментарий
        setReplyText('')
        setActiveReply(null)
      } else {
        // Это был обычный комментарий
        setCommentText('')
      }
      
      // Инвалидируем кэш для получения актуальных данных с сервера
      queryClient.invalidateQueries({ queryKey: ['article-comments', id, user?.id] })
      
      toast({
        title: t('article.commentSaved'),
        description: t('article.commentSavedDescription'),
      })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to create comment:', error)
      // Откатываем оптимистичное обновление при ошибке
      queryClient.invalidateQueries({ queryKey: ['article-comments', id, user?.id] })
      toast({
        title: t('article.commentError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.commentErrorDescription') || 'Не удалось создать комментарий',
        variant: 'destructive',
      })
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) => {
      return updateComment(commentId, { text })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', id, user?.id] })
      toast({
        title: t('article.commentUpdated') || 'Комментарий обновлен',
        description: t('article.commentUpdatedDescription') || 'Комментарий успешно обновлен',
      })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to update comment:', error)
      toast({
        title: t('article.commentError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.commentErrorDescription') || 'Не удалось обновить комментарий',
        variant: 'destructive',
      })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return deleteComment(commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', id, user?.id] })
      toast({
        title: t('article.commentDeleted') || 'Комментарий удален',
        description: t('article.commentDeletedDescription') || 'Комментарий успешно удален',
      })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to delete comment:', error)
      toast({
        title: t('article.commentError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.commentErrorDescription') || 'Не удалось удалить комментарий',
        variant: 'destructive',
      })
    },
  })

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) => {
      return deleteArticle(articleId)
    },
    onSuccess: () => {
      // Инвалидируем кэш статей и редиректим на главную
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] })
      toast({
        title: t('article.deleted') || 'Статья удалена',
        description: t('article.deletedDescription') || 'Статья успешно удалена',
        variant: 'default',
      })
      setIsDeleteArticleDialogOpen(false)
      navigate('/forum')
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to delete article:', error)
      toast({
        title: t('article.articleError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.articleErrorDescription') || 'Не удалось удалить статью',
        variant: 'destructive',
      })
    },
  })

  const handleDeleteArticle = () => {
    if (!article?.id || deleteArticleMutation.isPending) {
      return
    }
    deleteArticleMutation.mutate(String(article.id))
  }

  const reactCommentMutation = useMutation({
    mutationFn: ({ commentId, reaction }: { commentId: string; reaction: 'like' | 'dislike' }) => {
      return reactToComment(commentId, reaction)
    },
    onSuccess: (updatedComment) => {
      // Обновляем кэш комментариев (включая userReaction)
      // Сохраняем author и parentId из существующего комментария, так как мутация не возвращает эти поля
      // Важно: сохраняем parentId (строка), а не parent (объект), так как commentGraph использует parentId для построения дерева
      queryClient.setQueryData(['article-comments', id, user?.id], (old: any) => {
        if (!old) return old
        const updateCommentInList = (comments: RemoteComment[]): RemoteComment[] => {
          return comments.map((comment) => {
            if (comment.id === updatedComment.id) {
              // Сохраняем все критичные поля для иерархии из существующего комментария
              const existingParentId = comment.parentId !== undefined ? comment.parentId : null
              return {
                ...updatedComment,
                author: comment.author || updatedComment.author, // Сохраняем author из существующего комментария
                parentId: existingParentId, // Критично: всегда используем parentId из существующего комментария для сохранения иерархии
                createdAt: comment.createdAt || updatedComment.createdAt, // Сохраняем createdAt для правильной сортировки
              }
            }
            return comment
          })
        }
        return {
          ...old,
          comments: updateCommentInList(old.comments || []),
        }
      })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to react to comment:', error)
      toast({
        title: t('article.reactionError') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('article.reactionErrorDescription') || 'Не удалось поставить реакцию',
        variant: 'destructive',
      })
    },
  })

  const handleSubmitComment = () => {
    if (!ensureCommentAuth()) return
    const trimmedText = commentText.trim()
    if (!trimmedText) {
      toast({
        title: t('article.emptyComment'),
        description: t('article.emptyCommentDescription'),
        variant: 'destructive',
      })
      return
    }
    if (trimmedText.length > MAX_COMMENT_LENGTH) {
      toast({
        title: t('article.commentTooLong') || 'Комментарий слишком длинный',
        description: t('article.commentTooLongDescription', { maxLength: MAX_COMMENT_LENGTH }) || `Максимальная длина комментария: ${MAX_COMMENT_LENGTH} символов`,
        variant: 'destructive',
      })
      return
    }
    createCommentMutation.mutate({ text: trimmedText, parentId: null })
  }

  const handleReplyClick = (commentId: string, authorName: string) => {
    if (!ensureCommentAuth()) return
    setActiveReply({ parentId: commentId, parentAuthor: authorName })
    setReplyText('')
  }

  const handleCancelReply = () => {
    setActiveReply(null)
    setReplyText('')
  }

  const handleSubmitReply = () => {
    if (!activeReply) return
    if (!ensureCommentAuth()) return
    const trimmedText = replyText.trim()
    if (!trimmedText) {
      toast({
        title: t('article.emptyComment'),
        description: t('article.emptyCommentDescription'),
        variant: 'destructive',
      })
      return
    }
    if (trimmedText.length > MAX_COMMENT_LENGTH) {
      toast({
        title: t('article.commentTooLong') || 'Комментарий слишком длинный',
        description: t('article.commentTooLongDescription', { maxLength: MAX_COMMENT_LENGTH }) || `Максимальная длина комментария: ${MAX_COMMENT_LENGTH} символов`,
        variant: 'destructive',
      })
      return
    }
    createCommentMutation.mutate({ text: trimmedText, parentId: activeReply.parentId })
  }

  const handleShare = () => {
    setIsShareOpen(true)
  }

  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleNativeShare = async () => {
    if (!article || !shareUrl || !canUseNativeShare) return
    try {
      await navigator.share({
        title: article.title,
        url: shareUrl,
      })
      setIsShareOpen(false)
      toast({
        title: t('article.shared'),
        description: t('article.sharedDescription'),
      })
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return
      }
      toast({
        title: t('article.shareFailed'),
        description: t('article.shareFailedDescription'),
        variant: 'destructive',
      })
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      if (!('clipboard' in navigator)) {
        throw new Error('Clipboard API is not available')
      }
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = setTimeout(() => setCopySuccess(false), 2000)
      toast({
        title: t('article.linkCopied'),
        description: t('article.linkCopiedDescription'),
      })
    } catch (error) {
      toast({
        title: t('article.copyError'),
        description: t('article.copyErrorDescription'),
        variant: 'destructive',
      })
    }
  }

  const handleExternalShare = (targetUrl: string) => {
    if (!shareUrl) return
    // If it's the copy link option, use the copy handler instead
    if (targetUrl === shareUrl) {
      handleCopyLink()
      return
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setIsShareOpen(false)
  }

  const combinedComments = useMemo<UnifiedComment[]>(() => {
    const remote: UnifiedComment[] = (commentsResponse?.comments ?? []).map((comment) => ({
      ...comment,
      source: 'remote' as const,
    }))

    const local: UnifiedComment[] = localComments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: undefined,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        avatar: comment.author.avatar,
      },
      parentId: comment.parentId ?? null,
      source: 'local' as const,
      likes: 0,
      dislikes: 0,
      userReaction: null,
    }))

    const merged = [...remote, ...local]
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [commentsResponse?.comments, localComments])

  const commentGraph = useMemo(() => {
    const nodes = new Map<string, CommentNode>()
    const parentById = new Map<string, string | null>()

    combinedComments.forEach((comment) => {
      nodes.set(comment.id, { ...comment, replies: [] })
      parentById.set(comment.id, comment.parentId ?? null)
    })

    const roots: CommentNode[] = []

    nodes.forEach((node) => {
      const parentId = node.parentId
      if (parentId && nodes.has(parentId)) {
        nodes.get(parentId)!.replies.push(node)
      } else {
        roots.push(node)
      }
    })

    const sortBranch = (branch: CommentNode[]) => {
      branch.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      branch.forEach((child) => sortBranch(child.replies))
    }

    sortBranch(roots)

    const depthById = new Map<string, number>()
    const descendantCountById = new Map<string, number>()
    let maxDepth = 0

    const computeMeta = (node: CommentNode, depth: number): number => {
      depthById.set(node.id, depth)
      maxDepth = Math.max(maxDepth, depth)
      let total = 0
      node.replies.forEach((child) => {
        total += 1 + computeMeta(child, depth + 1)
      })
      descendantCountById.set(node.id, total)
      return total
    }

    roots.forEach((root) => computeMeta(root, 0))

    return {
      roots,
      lookup: nodes,
      parentById,
      depthById,
      descendantCountById,
      maxDepth,
    }
  }, [combinedComments])

  const commentTree = commentGraph.roots
  const nodeLookup = commentGraph.lookup
  const parentById = commentGraph.parentById
  const depthById = commentGraph.depthById
  const descendantCountById = commentGraph.descendantCountById
  // const _maxCommentDepth = commentGraph.maxDepth // Unused, but may be needed in future

  const infoReactions = infoComment ? {
    score: (infoComment.likes || 0) - (infoComment.dislikes || 0),
    positive: infoComment.likes || 0,
    negative: infoComment.dislikes || 0,
    userReaction: infoComment.userReaction || null,
  } : undefined
  const infoParent = infoComment?.parentId ? nodeLookup.get(infoComment.parentId) : undefined

  useEffect(() => {
    setCollapsedMap((prev) => {
      const next: Record<string, boolean> = {}
      nodeLookup.forEach((_, id) => {
        if (prev[id]) {
          next[id] = true
        }
      })
      return next
    })
    if (threadRootId && !nodeLookup.has(threadRootId)) {
      setThreadRootId(null)
    }
    return () => {
      if (replyHighlightTimeoutRef.current) {
        clearTimeout(replyHighlightTimeoutRef.current)
        replyHighlightTimeoutRef.current = null
      }
    }
  }, [nodeLookup, threadRootId])

  useEffect(() => {
    if (!activeReply?.parentId) return
    const target = replyInputRefs.current.get(activeReply.parentId)
    if (target) {
      requestAnimationFrame(() => {
        target.focus()
        target.selectionStart = target.selectionEnd = target.value.length
      })
    }
  }, [activeReply])

  const formatCommentTimestamp = (date: string) =>
    new Date(date).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleCommentReaction = (commentId: string, reaction: 'up' | 'down') => {
    if (!user) {
      setIsAuthRequiredDialogOpen(true)
      return
    }

    // Преобразуем 'up'/'down' в 'like'/'dislike' для API
    const apiReaction = reaction === 'up' ? 'like' : 'dislike'
    reactCommentMutation.mutate({ commentId, reaction: apiReaction })
  }

  const handleCommentAction = (
    comment: CommentNode,
    action: 'report' | 'edit' | 'delete' | 'info'
  ) => {
    switch (action) {
      case 'report':
        toast({
          title: t('article.reportSubmitted'),
          description: t('article.reportSubmittedDescription', { username: comment.author.username }),
        })
        break
      case 'edit':
        setEditingCommentId(comment.id)
        setEditingText(comment.text)
        // Фокус на textarea после рендера
        setTimeout(() => {
          const textarea = editInputRefs.current.get(comment.id)
          if (textarea) {
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
          }
        }, 0)
        break
      case 'delete':
        setDeletingCommentId(comment.id)
        break
      case 'info':
        setInfoComment(comment)
        setIsInfoOpen(true)
        break
    }
  }

  const handleSaveEdit = () => {
    if (!editingCommentId || !editingText.trim()) {
      toast({
        title: t('article.commentError') || 'Ошибка',
        description: t('article.commentEmpty') || 'Комментарий не может быть пустым',
        variant: 'destructive',
      })
      return
    }
    const trimmedText = editingText.trim()
    if (trimmedText.length > MAX_COMMENT_LENGTH) {
      toast({
        title: t('article.commentTooLong') || 'Комментарий слишком длинный',
        description: t('article.commentTooLongDescription', { maxLength: MAX_COMMENT_LENGTH }) || `Максимальная длина комментария: ${MAX_COMMENT_LENGTH} символов`,
        variant: 'destructive',
      })
      return
    }

    updateCommentMutation.mutate(
      { commentId: editingCommentId, text: trimmedText },
      {
        onSuccess: () => {
          setEditingCommentId(null)
          setEditingText('')
        },
      }
    )
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  const handleConfirmDelete = () => {
    if (deletingCommentId) {
      deleteCommentMutation.mutate(deletingCommentId, {
        onSuccess: () => {
          setDeletingCommentId(null)
        },
      })
    }
  }

  const renderCommentThread = (
    nodes: CommentNode[],
    depth = 0,
    options: { showConnectors?: boolean; threadMode?: boolean } = {}
  ): JSX.Element[] => {
    const { showConnectors = true, threadMode = false } = options

    return nodes.flatMap((node) => {
      const initials = (node.author.username ?? 'U').slice(0, 2).toUpperCase()

      const commentDepth = depth
      const stripeCount = showConnectors ? Math.min(depth, MAX_VISIBLE_STRIPE_DEPTH) : 0
      const overflowDepth = Math.max(depth - MAX_VISIBLE_STRIPE_DEPTH, 0)
      const gutterWidth = stripeCount * (STRIPE_WIDTH + STRIPE_GAP)
      const paddingLeft = showConnectors
        ? depth > 0
          ? BASE_COMMENT_PADDING_MOBILE + gutterWidth
          : 0
        : depth > 0
          ? BASE_COMMENT_PADDING_MOBILE + depth * 8
          : 0

      const containerStyle: CSSProperties = {
        paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
        boxSizing: 'border-box',
      }

      const matchesHighlightDepth =
        highlightDepth !== null ? commentDepth >= highlightDepth : false
      const isCollapsed = collapsedMap[node.id] ?? false
      const parentId = parentById.get(node.id) ?? null
      const parentNode = parentId ? nodeLookup.get(parentId) : undefined
      const replyDescendants = descendantCountById.get(node.id) ?? node.replies.length
      const isOwnComment = user
        ? String(node.author.id) === String(user.id) ||
          (node.author.uuid && String(node.author.uuid) === String(user.id)) ||
          (node.author.username && node.author.username === user.nickname)
        : false
      const isDimmedByDepth =
        highlightDepth !== null &&
        commentDepth < highlightDepth
      const dimClass = isDimmedByDepth ? 'opacity-60' : undefined

      const commentElement = (
        <div
          key={`comment-${node.id}`}
          id={`comment-${node.id}`}
          className="relative space-y-3"
          style={containerStyle}
        >
          {showConnectors && stripeCount > 0 && (
            <>
              <div aria-hidden className="pointer-events-auto absolute left-0 top-0 bottom-0 flex">
              {Array.from({ length: stripeCount }).map((_, stripeIndex) => {
                const stripeDepth = stripeIndex + 1
                const stripeActive =
                  highlightDepth !== null ? stripeDepth >= highlightDepth : true
                  const isLastStripe = stripeIndex === stripeCount - 1
                return (
                  <span
                    key={`stripe-${node.id}-${stripeIndex}`}
                    className={cn(
                      'h-full cursor-pointer rounded-full transition-opacity',
                      STRIPE_CLASSNAMES[stripeIndex % STRIPE_CLASSNAMES.length],
                      stripeActive ? 'opacity-60 hover:opacity-90' : 'opacity-20'
                    )}
                    style={{
                      width: STRIPE_WIDTH,
                        marginRight: isLastStripe ? 0 : STRIPE_GAP,
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      setHighlightDepth((prev) =>
                        prev === stripeDepth ? null : stripeDepth
                      )
                    }}
                  />
                )
              })}
            </div>
            </>
          )}
          {overflowDepth > 0 && (
            <span className="pointer-events-none absolute left-0 top-2 inline-flex -translate-x-3 select-none rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{overflowDepth}
            </span>
          )}
          <Card
            className={cn(
              'border-none bg-transparent shadow-none transition-all duration-[800ms]',
              dimClass
            )}
          >
            <CardContent className="pt-3 sm:pt-4 space-y-2 sm:space-y-3 p-3 sm:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <button
                  onClick={() => navigate(`/profile/${node.author.uuid || node.author.id}`)}
                  className="hover:opacity-80 transition-opacity shrink-0"
                >
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                  {node.author.avatar ? (
                    <AvatarImage src={node.author.avatar} alt={node.author.username} />
                  ) : null}
                    <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
                </Avatar>
                </button>
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => navigate(`/profile/${node.author.uuid || node.author.id}`)}
                      className="text-xs sm:text-sm font-semibold text-foreground hover:underline"
                    >
                      {node.author.username}
                    </button>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatCommentTimestamp(node.createdAt)}
                    </span>
                    {matchesHighlightDepth && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase tracking-wide px-1 py-0">
                        {t('article.depth')} {commentDepth}
                      </Badge>
                    )}
                  </div>
                  {parentNode && (
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const anchor = document.getElementById(`comment-${parentNode.id}`)
                        if (anchor) {
                          anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          if (replyHighlightTimeoutRef.current) {
                            clearTimeout(replyHighlightTimeoutRef.current)
                          }
                          const parentDepth = depthById.get(parentNode.id) ?? null
                          setHighlightDepth(parentDepth)
                          replyHighlightTimeoutRef.current = setTimeout(() => {
                            setHighlightDepth((prev) =>
                              prev === parentDepth ? null : prev
                            )
                          }, 2500)
                        }
                      }}
                        className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full border border-border/60 bg-muted/60 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium transition hover:bg-muted hover:text-foreground"
                    >
                        <CornerUpLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden xs:inline">{t('article.inReplyTo', { username: '' })}</span>
                    </button>
                      <button
                        onClick={() => navigate(`/profile/${parentNode.author.uuid || parentNode.author.id}`)}
                        className="text-[10px] sm:text-[11px] font-medium hover:underline"
                      >
                        {parentNode.author.username}
                      </button>
                    </div>
                  )}
                  {editingCommentId === node.id ? (
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        <textarea
                          value={editingText}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= MAX_COMMENT_LENGTH) {
                              setEditingText(value)
                            }
                          }}
                          ref={(el) => {
                            if (el) {
                              editInputRefs.current.set(node.id, el)
                            } else {
                              editInputRefs.current.delete(node.id)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleCancelEdit()
                            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault()
                              handleSaveEdit()
                            }
                          }}
                          maxLength={MAX_COMMENT_LENGTH}
                          className={cn(
                            "w-full min-h-[80px] sm:min-h-[100px] rounded-lg border bg-background p-2 sm:p-3 text-xs sm:text-sm leading-relaxed break-words break-all whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-ring",
                            editingText.length > MAX_COMMENT_LENGTH && "border-destructive focus:ring-destructive"
                          )}
                          placeholder={t('article.editComment') || 'Редактировать комментарий...'}
                        />
                        <div className="flex items-center justify-between px-1">
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {editingText.length > MAX_COMMENT_LENGTH * 0.9 && (
                              <span className={cn(
                                "transition-colors",
                                editingText.length > MAX_COMMENT_LENGTH ? "text-destructive font-medium" : "text-muted-foreground"
                              )}>
                                {editingText.length > MAX_COMMENT_LENGTH 
                                  ? t('article.commentExceedsLimit') || `Превышен лимит на ${editingText.length - MAX_COMMENT_LENGTH} символов`
                                  : t('article.commentApproachingLimit') || `Осталось ${MAX_COMMENT_LENGTH - editingText.length} символов`}
                              </span>
                            )}
                          </div>
                          <div className={cn(
                            "text-[10px] sm:text-xs transition-colors",
                            editingText.length > MAX_COMMENT_LENGTH 
                              ? "text-destructive font-medium" 
                              : editingText.length > MAX_COMMENT_LENGTH * 0.9
                              ? "text-orange-500"
                              : "text-muted-foreground"
                          )}>
                            {editingText.length} / {MAX_COMMENT_LENGTH}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateCommentMutation.isPending}
                          className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          {t('common.cancel') || 'Отмена'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateCommentMutation.isPending || !editingText.trim() || editingText.trim().length > MAX_COMMENT_LENGTH}
                          className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          {updateCommentMutation.isPending
                            ? t('common.saving') || 'Сохранение...'
                            : t('common.save') || 'Сохранить'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
                    {node.text}
                  </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs"
                    onClick={() => handleReplyClick(node.id, node.author.username)}
                  >
                    <CornerUpLeft className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">{t('article.reply')}</span>
                  </Button>
                  {node.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs"
                      onClick={() =>
                        setCollapsedMap((prev) => ({
                          ...prev,
                          [node.id]: !isCollapsed,
                        }))
                      }
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          <span className="hidden sm:inline">{t('article.showReplies', { count: replyDescendants })}</span>
                          <span className="sm:hidden">{replyDescendants}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          <span className="hidden sm:inline">{t('article.collapse', { count: replyDescendants })}</span>
                          <span className="sm:hidden">{replyDescendants}</span>
                        </>
                      )}
                    </Button>
                  )}
                  {node.replies.length > 0 && (!threadMode || node.id !== threadRootId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs"
                      onClick={() => setThreadRootId(node.id)}
                    >
                      <CornerDownRight className="h-3 w-3" />
                      <span className="hidden sm:inline">{t('article.openThread')}</span>
                    </Button>
                  )}
                  {threadMode && threadRootId === node.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs"
                      onClick={() => setThreadRootId(null)}
                    >
                      <Minimize2 className="h-3 w-3" />
                      <span className="hidden sm:inline">{t('article.exit')}</span>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-0 rounded-[calc(var(--radius)*1.2)] bg-background/35 shadow-sm ring-1 ring-border/60 backdrop-blur-sm overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6 sm:h-7 sm:w-7 rounded-none text-foreground transition hover:bg-background/70',
                            (() => {
                              return node.userReaction === 'like' && 'bg-primary text-primary-foreground hover:bg-primary/90'
                            })()
                          )}
                          onClick={() => handleCommentReaction(node.id, 'up')}
                          disabled={!user || reactCommentMutation.isPending}
                          aria-label={t('article.support')}
                        >
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <span
                          className={cn(
                            'min-w-[28px] sm:min-w-[36px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-center text-[10px] sm:text-xs font-semibold tabular-nums',
                            ((node.likes || 0) - (node.dislikes || 0)) > 0 && 'text-emerald-400',
                            ((node.likes || 0) - (node.dislikes || 0)) < 0 && 'text-destructive',
                            ((node.likes || 0) - (node.dislikes || 0)) === 0 && 'text-foreground/70'
                          )}
                        >
                          {(node.likes || 0) - (node.dislikes || 0)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6 sm:h-7 sm:w-7 rounded-none text-foreground transition hover:bg-background/70',
                            node.userReaction === 'dislike' &&
                              'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                          onClick={() => handleCommentReaction(node.id, 'down')}
                          disabled={!user || reactCommentMutation.isPending}
                          aria-label={t('article.against')}
                        >
                      <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={28}
                      className="flex items-center gap-3 rounded-[calc(var(--radius)*1.05)] border border-border/70 bg-popover/95 px-3 py-1.5 text-xs font-semibold tabular-nums shadow-lg backdrop-blur-sm"
                    >
                      <span className="text-emerald-400">
                        +{node.likes || 0}
                      </span>
                      <span className="text-destructive">
                        -{node.dislikes || 0}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" aria-label={t('article.actions')}>
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-60 rounded-[calc(var(--radius)*1.05)] border border-border/60 bg-popover/95 p-2 shadow-lg backdrop-blur"
                    >
                      <DropdownMenuLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        @{node.author.tag || node.author.username}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigate(`/profile/${node.author.uuid || node.author.id}`)}
                        className="flex items-center gap-2 px-2 py-2 text-sm"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t('article.viewProfile')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-start gap-2 px-2 py-2 text-xs text-muted-foreground"
                        disabled
                      >
                        <Clock className="mt-0.5 h-3.5 w-3.5" />
                        <span>{formatCommentTimestamp(node.createdAt)}</span>
                      </DropdownMenuItem>
                      {!isOwnComment && user && (
                        <DropdownMenuSeparator className="my-1" />
                      )}
                      {!isOwnComment && user && (
                        <DropdownMenuItem
                          onClick={() => handleCommentAction(node, 'report')}
                          className="flex items-center gap-2 px-2 py-2 text-sm"
                        >
                          <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{t('article.report')}</span>
                        </DropdownMenuItem>
                      )}
                      {isOwnComment && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleCommentAction(node, 'edit')}
                            className="flex items-center gap-2 px-2 py-2 text-sm"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{t('common.edit')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCommentAction(node, 'delete')}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{t('common.delete')}</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user && <DropdownMenuSeparator className="my-1" />}
                      <DropdownMenuItem
                        onClick={() => handleCommentAction(node, 'info')}
                        className="flex items-center gap-2 px-2 py-2 text-sm"
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t('article.info')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {activeReply?.parentId === node.id && (
                <div className="space-y-2 rounded-lg border border-dashed border-border/60 bg-muted/20 p-2 sm:p-3">
                  <div className="space-y-1.5">
                    <textarea
                      placeholder={t('article.writeReply', { username: node.author.username })}
                      className={cn(
                        "w-full min-h-[80px] sm:min-h-[100px] rounded-lg border bg-background p-2 sm:p-3 text-xs sm:text-sm leading-relaxed break-words break-all whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-ring",
                        replyText.length > MAX_COMMENT_LENGTH && "border-destructive focus:ring-destructive"
                      )}
                      value={replyText}
                      onChange={(event) => {
                        const value = event.target.value
                        if (value.length <= MAX_COMMENT_LENGTH) {
                          setReplyText(value)
                        }
                      }}
                      ref={(el) => {
                        if (el) {
                          replyInputRefs.current.set(node.id, el)
                        } else {
                          replyInputRefs.current.delete(node.id)
                        }
                      }}
                      maxLength={MAX_COMMENT_LENGTH}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          handleSubmitReply()
                        }
                      }}
                    />
                    <div className="flex items-center justify-between px-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {replyText.length > MAX_COMMENT_LENGTH * 0.9 && (
                          <span className={cn(
                            "transition-colors",
                            replyText.length > MAX_COMMENT_LENGTH ? "text-destructive font-medium" : "text-muted-foreground"
                          )}>
                            {replyText.length > MAX_COMMENT_LENGTH 
                              ? t('article.commentExceedsLimit') || `Превышен лимит на ${replyText.length - MAX_COMMENT_LENGTH} символов`
                              : t('article.commentApproachingLimit') || `Осталось ${MAX_COMMENT_LENGTH - replyText.length} символов`}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "text-[10px] sm:text-xs transition-colors",
                        replyText.length > MAX_COMMENT_LENGTH 
                          ? "text-destructive font-medium" 
                          : replyText.length > MAX_COMMENT_LENGTH * 0.9
                          ? "text-orange-500"
                          : "text-muted-foreground"
                      )}>
                        {replyText.length} / {MAX_COMMENT_LENGTH}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 sm:gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelReply} className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                      {t('common.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim() || replyText.trim().length > MAX_COMMENT_LENGTH}
                      className="h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      {t('article.send')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )

      if (node.replies.length === 0 || isCollapsed) {
        if (isCollapsed && node.replies.length > 0) {
          return [
            commentElement,
            <div
              key={`collapsed-${node.id}`}
              className="ml-3 sm:ml-4 text-[10px] sm:text-xs text-muted-foreground"
            >
              {t('article.repliesHidden')}
            </div>,
          ]
        }
        return [commentElement]
      }

      return [
        commentElement,
        ...renderCommentThread(node.replies, depth + 1, { showConnectors, threadMode }),
      ]
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Функция для извлечения текста из Slate document
  const extractTextFromSlate = (content: any): string => {
    if (typeof content === 'string') {
      return content
    }
    
    // Если это объект Slate document
    if (content && typeof content === 'object') {
      // Проверяем формат Slate: { document: [...] }
      const document = content.document || content
      
      if (Array.isArray(document)) {
        const extractText = (node: any): string => {
          if (typeof node === 'string') {
            return node
          }
          if (node?.text) {
            return node.text
          }
          if (node?.children && Array.isArray(node.children)) {
            return node.children.map(extractText).join(' ')
          }
          if (node?.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(' ')
          }
          return ''
        }
        return document.map(extractText).join(' ')
      }
    }
    
    return ''
  }

  const getReadMinutes = () => {
    if (!article) return 1
    const apiMinutesRaw =
      article.readTimeMinutes ??
      (article as any).read_time_minutes ??
      (article as any).read_time ??
      (article as any).read_minutes ??
      (article as any).readTime ??
      undefined
    const apiMinutesNum = Number(apiMinutesRaw)
    return Number.isFinite(apiMinutesNum) && apiMinutesNum > 0
      ? Math.max(1, Math.round(apiMinutesNum * 2) / 2)
      : 1 // fallback to 1 minute if API doesn't provide value
  }

  const formatReadMinutes = (minutes: number) => (Number.isInteger(minutes) ? minutes : minutes.toFixed(1))

  // Map old difficulty values to new ones for backward compatibility
  const getDifficultyKey = (difficulty: string | undefined): string => {
    if (!difficulty) return ''
    const difficultyMap: Record<string, string> = {
      'easy': 'beginner',
      'medium': 'intermediate',
      'hard': 'advanced',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
    }
    return difficultyMap[difficulty.toLowerCase()] || difficulty
  }

  const shareTitle = article ? t('article.shareTitle', { title: article.title }) : t('article.shareTitleDefault')

  const shareTargets = useMemo<Array<{ label: string; description: string; icon: LucideIcon | React.ComponentType<{ className?: string }>; href: string }>>(() => {
    if (!shareUrl) return []
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)
    return [
      {
        label: t('article.shareOnX'),
        description: t('article.shareOnXDescription'),
        icon: Twitter,
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      },
      {
        label: t('article.shareOnFacebook'),
        description: t('article.shareOnFacebookDescription'),
        icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        label: t('article.shareOnLinkedIn'),
        description: t('article.shareOnLinkedInDescription'),
        icon: Linkedin,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      },
      {
        label: t('article.sendViaTelegram'),
        description: t('article.sendViaTelegramDescription'),
        icon: Send,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        label: t('article.shareViaWhatsApp'),
        description: t('article.shareViaWhatsAppDescription'),
        icon: MessageCircle,
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      },
      {
        label: t('article.shareViaEmail'),
        description: t('article.shareViaEmailDescription'),
        icon: Mail,
        href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20${encodedUrl}`,
      },
      {
        label: t('article.shareOnReddit'),
        description: t('article.shareOnRedditDescription'),
        icon: RedditIcon,
        href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      },
      {
        label: t('article.shareOnDiscord'),
        description: t('article.shareOnDiscordDescription'),
        icon: DiscordIcon,
        href: `https://discord.com/`,
      },
      {
        label: t('article.shareOnInstagram'),
        description: t('article.shareOnInstagramDescription'),
        icon: InstagramIcon,
        href: `https://www.instagram.com/`,
      },
      {
        label: t('article.shareOnYouTube'),
        description: t('article.shareOnYouTubeDescription'),
        icon: YoutubeIcon,
        href: `https://www.youtube.com/`,
      },
      {
        label: t('article.shareOnGitHub'),
        description: t('article.shareOnGitHubDescription'),
        icon: GithubIcon,
        href: `https://github.com/`,
      },
      {
        label: t('article.copyLink'),
        description: t('article.copyLinkDescription'),
        icon: Link2,
        href: shareUrl,
      },
    ]
  }, [shareUrl, shareTitle, t])

  const SHARE_ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(shareTargets.length / SHARE_ITEMS_PER_PAGE)
  const currentPageItems = shareTargets.slice(
    sharePage * SHARE_ITEMS_PER_PAGE,
    (sharePage + 1) * SHARE_ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Обработка ошибок с retry кнопкой
  if (error) {
    const isNotFound = (error as any)?.response?.status === 404
    const isRateLimit = (error as any)?.response?.status === 429
    // const _isServerError = (error as any)?.response?.status >= 500 // Unused, but may be needed in future

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {isNotFound 
                ? t('article.notFound')
                : isRateLimit
                ? t('article.rateLimit') || 'Rate Limit Exceeded'
                : t('article.error') || 'Error'}
            </h2>
            <p className="text-muted-foreground">
              {isNotFound
                ? t('article.notFoundDescription')
                : isRateLimit
                ? t('article.rateLimitDescription') || 'Too many requests. Please try again later.'
                : t('article.errorDescription') || 'An error occurred while loading the article.'}
            </p>
            <div className="flex gap-2 justify-center">
              {!isNotFound && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['article', id, user?.id] })
                  }}
                >
                  {t('article.retry') || 'Retry'}
                </Button>
              )}
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('article.backToHome')}
            </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!article) {
  return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const previewSrc =
    article.previewImage ||
    (article as any)?.preview_image ||
    (article as any)?.cover_url ||
    null

  return (
    <TooltipProvider delayDuration={150}>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Reading Progress Bar */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300 ease-in-out",
            smoothedProgress > 0 && smoothedProgress < 100 ? "opacity-30" : "opacity-0"
          )}
        >
          <Progress 
            value={smoothedProgress} 
            className="h-[1px] rounded-none transition-all duration-150 ease-out" 
          />
        </div>
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t('common.back')}</span>
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-4 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
        <article className="w-full">
          {(previewSrc || true) && (
            <div className="mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border border-border/40 bg-muted/10">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={article.title}
                  onError={(e) => {
                    // Показываем заглушку при ошибке загрузки
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const placeholder = target.nextElementSibling as HTMLDivElement | null
                    if (placeholder) {
                      placeholder.style.display = 'flex'
                    }
                  }}
                  className="w-full h-auto object-contain"
                />
              ) : null}
              <div
                className={`${previewSrc ? 'hidden' : 'flex'} min-h-[200px] sm:min-h-[260px] items-center justify-center bg-muted text-muted-foreground text-sm`}
              >
                {t('article.previewNotAvailable') || 'Preview image is not available'}
              </div>
            </div>
          )}

          {/* Article Header */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title */}
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight break-words overflow-wrap-anywhere leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              <span className="break-words overflow-wrap-anywhere">{article.title}</span>
              {(() => {
                const created = article.createdAt ? new Date(article.createdAt).getTime() : 0
                const updated = article.updatedAt ? new Date(article.updatedAt).getTime() : 0
                const isEdited = updated - created > 60_000 // показываем "edited" только если прошло больше минуты
                return isEdited ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-muted p-2.5 text-muted-foreground">
                    <Pencil className="h-5 w-5" />
                  </span>
                ) : null
              })()}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
              <button
                onClick={() => navigate(`/profile/${article.author.uuid || article.author.id}`)}
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  {article.author.avatar ? (
                    <AvatarImage src={article.author.avatar} alt={authorName} />
                  ) : null}
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    {authorName
                      .split(' ')
                      .map((word: string) => (word ? word[0] : ''))
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium hover:underline text-xs sm:text-sm">{authorName}</span>
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>
                  {formatReadMinutes(getReadMinutes())} {t('article.readTime')}
                </span>
              </div>
              {(() => {
                const viewsCount =
                  article.views ??
                  (article as any).views_count ??
                  (article as any).view_count ??
                  (article as any).viewsCount ??
                  (article as any).stats?.views ??
                  0
                return (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="font-medium text-xs sm:text-sm">{viewsCount}</span>
                  </div>
                )
              })()}
              {article.difficulty && (
                <Badge variant="outline" className="rounded-md font-normal capitalize text-[10px] sm:text-xs px-1.5 py-0.5">
                  {t(`createArticle.difficultyOptions.${getDifficultyKey(article.difficulty)}`)}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary text-[10px] sm:text-xs px-2 py-0.5 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button
                variant={article.userReaction === 'like' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction('like')}
                disabled={reactMutation.isPending}
                className={cn(
                  "gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
                  article.userReaction === 'like' && "bg-primary hover:bg-primary/90"
                )}
                aria-pressed={article.userReaction === 'like'}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
                    article.userReaction === 'like' && "fill-current text-primary-foreground"
                  )}
                />
                <span>{article.likes || 0}</span>
              </Button>
              <Button
                variant={article.userReaction === 'dislike' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction('dislike')}
                disabled={reactMutation.isPending}
                className={cn(
                  "gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
                  article.userReaction === 'dislike' && "bg-primary hover:bg-primary/90"
                )}
                aria-pressed={article.userReaction === 'dislike'}
              >
                <ThumbsDown
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
                    article.userReaction === 'dislike' && "fill-current text-primary-foreground"
                  )}
                />
                <span>{article.dislikes || 0}</span>
              </Button>
              <Button
                variant={isSaved ? 'default' : 'outline'}
                size="sm"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                aria-pressed={isSaved}
              >
                <Bookmark className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isSaved ? t('article.saved') : t('article.readLater')}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('article.share')}</span>
              </Button>
              {/* Кнопки редактирования/удаления для автора статьи */}
              {(() => {
                if (!user || !article) {
                  return null
                }

                const authorId = article.author?.id ? String(article.author.id) : null
                const userIdStr = user?.id ? String(user.id) : null
                const isAuthor =
                  (authorId && userIdStr && authorId === userIdStr) ||
                  (article.author.uuid && userIdStr && String(article.author.uuid) === userIdStr) ||
                  (article.author.username && user.nickname && article.author.username === user.nickname)

                if (!isAuthor) {
                  return null
                }

                return (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/create?edit=${article.id}`)}
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                    >
                      <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('article.edit') || 'Редактировать'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteArticleDialogOpen(true)}
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('article.deleteArticle') || 'Удалить'}</span>
                    </Button>
                  </>
                )
              })()}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Article Content */}
          <div ref={articleContentRef}>
            {(() => {
              return article.contentJSON ? (
                // Используем TipTap для отображения (сохраняет все атрибуты узлов)
                <ArticleContent content={article.contentJSON} />
              ) : (
              // Fallback на HTML для обратной совместимости
          <div className="prose prose-neutral dark:prose-invert max-w-none">
                {import.meta.env.DEV && (
                  <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-xs">
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">Debug Info:</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Content type: {typeof article.content === 'string' ? 'string' : 'object (Slate)'}
                    </p>
                    {typeof article.content === 'string' ? (
                      <>
                        <p className="text-yellow-700 dark:text-yellow-300">Content length: {article.content.length}</p>
                        <p className="text-yellow-700 dark:text-yellow-300">Content preview: {article.content.substring(0, 200)}...</p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-yellow-600 dark:text-yellow-400">Full HTML</summary>
                          <pre className="mt-2 max-h-40 overflow-auto rounded bg-yellow-50 dark:bg-yellow-950 p-2 text-[10px]">
                            {article.content}
                          </pre>
                        </details>
                      </>
                    ) : (
                      <>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          Content preview: {extractTextFromSlate(article.content).substring(0, 200)}...
                        </p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-yellow-600 dark:text-yellow-400">Full Slate JSON</summary>
                          <pre className="mt-2 max-h-40 overflow-auto rounded bg-yellow-50 dark:bg-yellow-950 p-2 text-[10px]">
                            {JSON.stringify(article.content, null, 2)}
                          </pre>
                        </details>
                      </>
                    )}
                  </div>
                )}
            {typeof article.content === 'string' ? (
              <div
                className="text-foreground leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            ) : (
              <div className="text-foreground leading-relaxed break-words">
                <p className="text-muted-foreground text-sm">
                  {t('article.contentNotAvailable') || 'Content is not available in HTML format. Please use contentJSON.'}
                </p>
              </div>
            )}
              </div>
              )
            })()}
          </div>

          <Separator className="my-8" />

          {/* Comments Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t('article.comments', { count: combinedComments.length })}
            </h2>

            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {threadRootId && nodeLookup.has(threadRootId) && (
                <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-xs">
                  <span className="text-muted-foreground">{t('article.threadFocus')}:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {(() => {
                      const chain: CommentNode[] = []
                      let cursor: string | null = threadRootId
                      while (cursor) {
                        const node = nodeLookup.get(cursor)
                        if (!node) break
                        chain.unshift(node)
                        cursor = parentById.get(cursor) ?? null
                      }
                      return chain.map((node, index) => (
                        <div key={`crumb-${node.id}`} className="flex items-center gap-1">
                          <button
                            type="button"
                            className={cn(
                              'rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium transition hover:bg-muted hover:text-foreground',
                              node.id === threadRootId && 'border-primary/40 text-primary'
                            )}
                            onClick={() => {
                              setThreadRootId(node.id)
                              navigate(`/profile/${node.author.id}`)
                            }}
                          >
                    @{node.author.tag || node.author.username}
                          </button>
                          {index !== chain.length - 1 && (
                            <span className="text-muted-foreground/60">/</span>
                          )}
                        </div>
                      ))
                    })()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-full px-2 text-xs"
                    onClick={() => setThreadRootId(null)}
                  >
                    {t('article.exitFocus')}
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/30 bg-muted/20 p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Comment Input Form */}
                <div className="space-y-3">
                <div className="space-y-1.5">
                  <textarea
                    placeholder={user ? t('article.writeComment') : t('article.signInToComment')}
                    className={cn(
                      "w-full min-h-[100px] sm:min-h-[120px] rounded-lg border bg-background p-2.5 sm:p-3 text-sm leading-relaxed break-words break-all whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-ring",
                      commentText.length > MAX_COMMENT_LENGTH && "border-destructive focus:ring-destructive"
                    )}
                    value={commentText}
                    onChange={(event) => {
                      const value = event.target.value
                      if (value.length <= MAX_COMMENT_LENGTH) {
                        setCommentText(value)
                      }
                    }}
                    disabled={!user}
                    ref={commentInputRef}
                    maxLength={MAX_COMMENT_LENGTH}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSubmitComment()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between px-1">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      {commentText.length > MAX_COMMENT_LENGTH * 0.9 && (
                        <span className={cn(
                          "transition-colors",
                          commentText.length > MAX_COMMENT_LENGTH ? "text-destructive font-medium" : "text-muted-foreground"
                        )}>
                          {commentText.length > MAX_COMMENT_LENGTH 
                            ? t('article.commentExceedsLimit') || `Превышен лимит на ${commentText.length - MAX_COMMENT_LENGTH} символов`
                            : t('article.commentApproachingLimit') || `Осталось ${MAX_COMMENT_LENGTH - commentText.length} символов`}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "text-[10px] sm:text-xs transition-colors",
                      commentText.length > MAX_COMMENT_LENGTH 
                        ? "text-destructive font-medium" 
                        : commentText.length > MAX_COMMENT_LENGTH * 0.9
                        ? "text-orange-500"
                        : "text-muted-foreground"
                    )}>
                      {commentText.length} / {MAX_COMMENT_LENGTH}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 sm:gap-2">
                  {!user && (
                    <Button variant="outline" onClick={() => navigate('/auth')} className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                      {t('auth.signIn')}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!user || !commentText.trim() || commentText.trim().length > MAX_COMMENT_LENGTH}
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    {t('article.sendComment')}
                  </Button>
                </div>
                </div>

                {/* Separator */}
                <Separator />

            {/* Comments List */}
            {isCommentsLoading || isCommentsRefetching ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full shrink-0" />
                          <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                              <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
                            </div>
                            <Skeleton className="h-3 sm:h-4 w-full" />
                            <Skeleton className="h-3 sm:h-4 w-3/4" />
                            <div className="flex items-center gap-2 sm:gap-4 pt-1">
                              <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              ) : combinedComments.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center text-xs sm:text-sm text-muted-foreground">
                  {t('article.noComments')} {t('article.beFirst')}
                  </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                  {renderCommentThread(
                    threadRootId && nodeLookup.has(threadRootId)
                      ? [nodeLookup.get(threadRootId)!]
                      : commentTree,
                    0,
                    {
                        showConnectors: !(threadRootId && nodeLookup.has(threadRootId)),
                      threadMode: !!(threadRootId && nodeLookup.has(threadRootId)),
                    }
                  )}
              </div>
            )}
            </div>
          </div>
        </article>
      </div>

      <Dialog
        open={isInfoOpen && !!infoComment}
        onOpenChange={(open) => {
          setIsInfoOpen(open)
          if (!open) {
            setInfoComment(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-1.5">
            <DialogTitle>{t('article.commentInfo')}</DialogTitle>
            <DialogDescription>
              {t('article.commentInfoDescription')}
            </DialogDescription>
          </DialogHeader>
          {infoComment && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/30 p-3">
                <button
                  onClick={() => navigate(`/profile/${infoComment.author.uuid || infoComment.author.id}`)}
                  className="hover:opacity-80 transition-opacity"
                >
                <Avatar className="h-10 w-10">
                  {infoComment.author.avatar ? (
                    <AvatarImage src={infoComment.author.avatar} alt={infoComment.author.username} />
                  ) : null}
                  <AvatarFallback>
                    {infoComment.author.username
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                </button>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate(`/profile/${infoComment.author.uuid || infoComment.author.id}`)}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    @{infoComment.author.username}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {formatCommentTimestamp(infoComment.createdAt)} · ID {infoComment.id}
                  </p>
                  {infoParent && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{t('article.replyTo', { username: '' })}</span>
                      <button
                        onClick={() => navigate(`/profile/${infoParent.author.uuid || infoParent.author.id}`)}
                        className="hover:underline"
                      >
                        {infoParent.author.username}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('article.commentText')}
                </p>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-background/70 p-3 text-sm leading-relaxed break-words" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
                  {infoComment.text}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">{t('article.source')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {infoComment.source === 'local' ? t('article.localStorage') : t('article.source')}
                  </p>
                </div>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">{t('article.replies')}</p>
                  <p className="text-sm font-medium text-foreground">{infoComment.replies.length}</p>
                </div>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">{t('article.reactions')}</p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (infoReactions?.score ?? 0) > 0 && 'text-emerald-500',
                      (infoReactions?.score ?? 0) < 0 && 'text-destructive'
                    )}
                  >
                    {infoReactions?.score ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{infoReactions?.positive ?? 0} / -{infoReactions?.negative ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setIsInfoOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingCommentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCommentId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('article.deleteComment') || 'Удалить комментарий'}</DialogTitle>
            <DialogDescription>
              {t('article.deleteCommentDescription') || 'Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingCommentId(null)}
              disabled={deleteCommentMutation.isPending}
            >
              {t('common.cancel') || 'Отмена'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending
                ? t('common.deleting') || 'Удаление...'
                : t('common.delete') || 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isShareOpen}
        onOpenChange={(open) => {
          setIsShareOpen(open)
          if (!open) {
            setCopySuccess(false)
            setSharePage(0)
            if (copyTimeoutRef.current) {
              clearTimeout(copyTimeoutRef.current)
              copyTimeoutRef.current = null
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('article.shareArticle')}</DialogTitle>
            <DialogDescription className="text-base">
              {t('article.shareArticleDescription', { title: article ? article.title : t('article.thisArticle') })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Share link section */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">{t('article.shareLink')}</label>
              <div className="relative flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="pr-24 font-mono text-xs border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  size="sm"
                  variant={copySuccess ? 'default' : 'outline'}
                  className="absolute right-1.5 h-7 px-2.5 gap-1.5 shrink-0"
                  onClick={handleCopyLink}
                  disabled={!shareUrl}
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-xs">{t('article.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">{t('article.copyLink')}</span>
                    </>
                  )}
                </Button>
    </div>
            </div>

            {/* Social sharing buttons */}
            {shareTargets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">{t('article.shareOnSocial')}</label>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {sharePage + 1} / {totalPages}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setSharePage((prev) => Math.max(0, prev - 1))}
                          disabled={sharePage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setSharePage((prev) => Math.min(totalPages - 1, prev + 1))}
                          disabled={sharePage === totalPages - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              <div className="grid gap-2 sm:grid-cols-2">
                  {currentPageItems.map((target) => {
                  const Icon = target.icon
                  return (
                    <Button
                      key={target.label}
                        variant="outline"
                        className="h-auto justify-start gap-3 p-3.5 hover:bg-accent/50 transition-colors overflow-hidden"
                      onClick={() => handleExternalShare(target.href)}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left overflow-hidden">
                          <span className="text-sm font-medium leading-tight truncate w-full">
                            {target.label}
                      </span>
                          <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                            {target.description}
                          </span>
                        </div>
                    </Button>
                  )
                })}
                </div>
              </div>
            )}

            {/* Native share button */}
            {canUseNativeShare && (
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground">{t('article.deviceSharing')}</label>
                <Button
                  variant="outline"
                  className="w-full h-auto justify-start gap-3 p-3.5 hover:bg-accent/50 transition-colors overflow-hidden"
                  onClick={handleNativeShare}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Share2 className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left overflow-hidden">
                    <span className="text-sm font-medium leading-tight truncate w-full">{t('article.shareViaDevice')}</span>
                    <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                      {t('article.useDeviceSharing')}
                    </span>
                  </div>
              </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления статьи */}
      <Dialog open={isDeleteArticleDialogOpen} onOpenChange={setIsDeleteArticleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('article.deleteArticle') || 'Удалить статью'}</DialogTitle>
            <DialogDescription>
              {t('article.deleteMessage') || 'Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteArticleDialogOpen(false)}
              disabled={deleteArticleMutation.isPending}
            >
              {t('common.cancel') || 'Отмена'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteArticle}
              disabled={deleteArticleMutation.isPending}
            >
              {deleteArticleMutation.isPending
                ? t('common.deleting') || 'Удаление...'
                : t('article.deleteArticle') || 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AuthRequiredDialog
        open={isAuthRequiredDialogOpen}
        onOpenChange={setIsAuthRequiredDialogOpen}
      />
      </div>
    </TooltipProvider>
  )
}