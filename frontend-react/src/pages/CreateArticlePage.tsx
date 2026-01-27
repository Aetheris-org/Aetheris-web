import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle, Crop, Check, ChevronRight, ChevronLeft, FileText, Tag, Image as ImageIcon, Type, User, Clock, AlertCircle, CheckCircle2, Link2 } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { RichTextEditor, type RichTextEditorRef } from '@/components/RichTextEditor'
import { ArticleContent } from '@/components/ArticleContent'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { createDraft, updateDraft, getDraft } from '@/api/drafts'
import { createArticle, updateArticle, getArticle } from '@/api/articles'
import type { Article } from '@/types/article'
import { uploadImage } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i

// TODO: Add the same character limit validation on the backend
const EXCERPT_MAX_LENGTH = 500
const TITLE_MAX_LENGTH = 200
const CONTENT_MAX_LENGTH = 20000
const TAG_MAX_LENGTH = 20
const MAX_TAGS = 20
const DRAFT_SAVE_COOLDOWN = 2000 // 2 секунды между сохранениями
const UPLOAD_PREVIEW_ENABLED = true // включена локальная загрузка превью
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 МБ

function normalizeRichText(value: string | null | undefined): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (HTML_DETECTION_REGEX.test(trimmed)) {
    return trimmed
  }
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeParagraph = paragraph.replace(/\n/g, '<br />')
      return `<p>${safeParagraph}</p>`
    })
    .join('')
  return paragraphs || ''
}

function getPlainTextFromHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function CreateArticlePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const registerActivity = useGamificationStore((s) => s.registerActivity)
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const prevLocationRef = useRef(location.pathname)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentJSON, setContentJSON] = useState<any>(null) // Сохраняем JSON контент для публикации
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [existingPreviewImageId, setExistingPreviewImageId] = useState<string | null>(null)
  const [lastDraftSaveTime, setLastDraftSaveTime] = useState<number>(0)
  const isUnmountingRef = useRef(false) // Флаг для предотвращения создания новых черновиков при размонтировании
  const publishedSuccessfullyRef = useRef(false) // При успешной публикации — не писать в localStorage при unmount, а очистить
  const [currentStep, setCurrentStep] = useState(0)
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isExcerptFocused, setIsExcerptFocused] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isExternalImageDialogOpen, setIsExternalImageDialogOpen] = useState(false)
  const [externalImageUrl, setExternalImageUrl] = useState('')
  const excerptTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const contentPreviewRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const editorRef = useRef<RichTextEditorRef | null>(null)
  const originalImageUrlRef = useRef<string | null>(null)
  const selectedImageUrlRef = useRef<string | null>(null)
  const croppedImageUrlRef = useRef<string | null>(null)
  const loadedDraftIdRef = useRef<string | null>(null)

  const effectiveImageUrl = selectedImageUrl ?? originalImageUrl
  const resolvePreviewUrl = useCallback(
    () => existingPreviewImageId || selectedImageUrl || originalImageUrl || null,
    [existingPreviewImageId, selectedImageUrl, originalImageUrl]
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const draftParam = searchParams.get('draft')
  // Теперь draft ID - это UUID (строка), а не число
  const draftIdFromQuery = draftParam && draftParam.trim() ? draftParam.trim() : null
  // Получаем category из URL параметра (news или changes)
  const categoryFromUrl = searchParams.get('category') || null
  const [category, setCategory] = useState<string | null>(categoryFromUrl)
  
  // Логирование категории при инициализации
  useEffect(() => {
  }, []) // Только при монтировании
  
  // Обновляем category при изменении URL параметра
  useEffect(() => {
    const newCategory = searchParams.get('category') || null
    if (newCategory !== category) {
      setCategory(newCategory)
      if (import.meta.env.DEV) {
        logger.debug('[CreateArticlePage] Category updated from URL:', { newCategory, oldCategory: category })
      }
    }
  }, [searchParams, category])
  // Фиксируем edit-id и не даём ему сбрасываться, если параметр пропал
  const initialEditId =
    (searchParams.get('edit') || searchParams.get('articleId') || searchParams.get('id') || '').trim() ||
    null
  const [editArticleId, setEditArticleId] = useState<string | null>(initialEditId)
  const editArticleIdRef = useRef<string | null>(initialEditId)
  useEffect(() => {
    const raw =
      searchParams.get('edit') ||
      searchParams.get('articleId') ||
      searchParams.get('id') ||
      null
    const normalized = raw && raw.trim() ? raw.trim() : null
    if (normalized && normalized !== editArticleIdRef.current) {
      editArticleIdRef.current = normalized
      setEditArticleId(normalized)
    }
  }, [searchParams])
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState<any>(null)
  const isEditing = Boolean(editArticleIdRef.current || articleToEdit?.id)

  // Функция для загрузки медиа в редактор через R2
  const handleUploadMedia = useCallback(async (file: File, _type: 'image' | 'video' | 'audio'): Promise<string> => {
    if (!user) {
      throw new Error('Пользователь не авторизован')
    }

    // Для медиа используем папку 'articles', но не удаляем старые файлы при добавлении в контент
    // Старые файлы удаляются только при замене превью статьи
    const currentArticleId = editArticleIdRef.current || articleToEdit?.id || (draftId ? Number(draftId) : undefined)
    const result = await uploadImage(file, 'articles', undefined, currentArticleId)
    return result.url
  }, [user, draftId, articleToEdit])
  
  // ============================================================================
  // МОДАЛЬНОЕ ОКНО ПРИ ВЫХОДЕ С НЕСОХРАНЁННЫМИ ИЗМЕНЕНИЯМИ
  // ============================================================================
  
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | number | null>(null)
  const userHasEditedRef = useRef(false)
  const allowNavigationRef = useRef(false) // Флаг для разрешения навигации после подтверждения
  
  // Проверяем, есть ли несохранённые изменения
  const hasUnsavedChanges = useCallback(() => {
    return userHasEditedRef.current && Boolean(
      title.trim() || content.trim() || excerpt.trim() || tags.length > 0 || 
      croppedImageUrl || selectedImageUrl || originalImageUrl
    )
  }, [title, content, excerpt, tags, croppedImageUrl, selectedImageUrl, originalImageUrl])
  
  // Безопасная навигация — проверяет наличие несохранённых изменений
  const safeNavigate = useCallback((to: string | number) => {
    if (hasUnsavedChanges()) {
      setPendingNavigationUrl(to)
      setShowExitDialog(true)
    } else {
      allowNavigationRef.current = true
      if (typeof to === 'number') {
        // Для кнопки Back всегда переходим на /forum (страницу статей)
        navigate('/forum')
      } else {
        navigate(to)
      }
    }
  }, [hasUnsavedChanges, navigate])
  
  // Перехватываем навигацию через pushState/replaceState
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)
    
    const interceptNavigation = (url: string | URL | null | undefined) => {
      // Если навигация разрешена — пропускаем
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false
        return false
      }
      if (!url) return false
      const urlStr = url.toString()
      // Игнорируем переходы на ту же страницу
      if (urlStr === window.location.pathname || urlStr === window.location.href) return false
      // Игнорируем внешние ссылки
      if (urlStr.startsWith('http') && !urlStr.includes(window.location.host)) return false
      return true
    }
    
    window.history.pushState = function(state, unused, url) {
      if (interceptNavigation(url) && hasUnsavedChanges()) {
        const targetUrl = url?.toString() || '/'
        setPendingNavigationUrl(targetUrl)
        setShowExitDialog(true)
        return // Не выполняем навигацию
      }
      return originalPushState(state, unused, url)
    }
    
    window.history.replaceState = function(state, unused, url) {
      if (interceptNavigation(url) && hasUnsavedChanges()) {
        const targetUrl = url?.toString() || '/'
        setPendingNavigationUrl(targetUrl)
        setShowExitDialog(true)
        return
      }
      return originalReplaceState(state, unused, url)
    }
    
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [hasUnsavedChanges])
  
  // Перехватываем клики на ссылки (для <a href>)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href) return
      
      // Игнорируем внешние ссылки и якоря
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return
      
      // Игнорируем если нет несохранённых изменений
      if (!hasUnsavedChanges()) return
      
      // Предотвращаем переход и показываем модалку
      e.preventDefault()
      e.stopPropagation()
      setPendingNavigationUrl(href)
      setShowExitDialog(true)
    }
    
    document.addEventListener('click', handleLinkClick, { capture: true })
    return () => document.removeEventListener('click', handleLinkClick, { capture: true })
  }, [hasUnsavedChanges])
  
  // Предупреждение при закрытии вкладки
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])
  
  
  // Ctrl+S для сохранения в черновики
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        
        // Получаем JSON из редактора
        let currentContentJSON = contentJSON
        if (editorRef.current) {
          try {
            currentContentJSON = editorRef.current.getJSON()
          } catch (err) {
            logger.warn('[CreateArticlePage] Failed to get JSON from editor:', err)
          }
        }
        
        // Формируем контент
        let contentDoc: any[] = []
        if (currentContentJSON?.type === 'doc' && Array.isArray(currentContentJSON.content)) {
          contentDoc = currentContentJSON.content
        } else if (Array.isArray(currentContentJSON)) {
          contentDoc = currentContentJSON
        } else if (content) {
          const text = content.replace(/<[^>]*>/g, '').trim()
          contentDoc = [{ type: 'paragraph', children: [{ text: text || '' }] }]
        } else {
          contentDoc = [{ type: 'paragraph', children: [{ text: '' }] }]
        }
        
        const draftTitle = (title || t('createArticle.untitledDraft')).trim()
        const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle
        
        const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
          beginner: 'easy',
          intermediate: 'medium',
          advanced: 'hard',
        }
        
        const draftPayload: any = {
          title: finalDraftTitle,
          content: contentDoc,
          excerpt: (excerpt || ' ').trim(),
          tags: tags,
          difficulty: difficultyMap[difficulty] || 'medium',
        }
        
        const previewImage = resolvePreviewUrl()
        if (previewImage) {
          draftPayload.previewImage = previewImage
          draftPayload.preview_image = previewImage
          draftPayload.cover_url = previewImage
        }
        
        try {
          if (draftId) {
            await updateDraft(draftId, draftPayload)
            logger.debug('[CreateArticlePage] Updated draft via Ctrl+S:', { draftId })
          } else {
            const newDraft = await createDraft(draftPayload)
            setDraftId(newDraft.id)
            logger.debug('[CreateArticlePage] Created draft via Ctrl+S:', { draftId: newDraft.id })
          }
          
          queryClient.invalidateQueries({ queryKey: ['drafts'] })
          
          // Сбрасываем флаг — изменения сохранены
          userHasEditedRef.current = false
          
          // Помечаем черновик как намеренно сохраненный, чтобы DraftRecoveryProvider не показывал панель
          try {
            const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('draft_'))
            draftKeys.forEach(k => {
              // Устанавливаем флаг в sessionStorage перед очисткой localStorage
              sessionStorage.setItem(`draft_intentionally_saved_${k}`, 'true')
              localStorage.removeItem(k)
            })
          } catch (err) {
            logger.warn('[CreateArticlePage] Failed to clear localStorage:', err)
          }
          
          toast({
            title: t('draftRecovery.saved'),
            description: t('draftRecovery.savedDescription'),
          })
        } catch (error: any) {
          logger.error('[CreateArticlePage] Failed to save draft via Ctrl+S:', error)
          toast({
            title: t('draftRecovery.saveError'),
            description: error?.message || t('draftRecovery.saveErrorDescription'),
            variant: 'destructive',
          })
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [content, contentJSON, difficulty, draftId, excerpt, queryClient, resolvePreviewUrl, t, tags, title, toast])
  
  // Обработчик: Удалить и выйти
  const handleExitDelete = useCallback(() => {
    // Очищаем localStorage - удаляем все ключи, начинающиеся с 'draft_'
    try {
      const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('draft_'))
      draftKeys.forEach(k => {
        localStorage.removeItem(k)
      })
      logger.debug('[CreateArticlePage] Cleared localStorage drafts:', { count: draftKeys.length })
      
      // Устанавливаем флаг в sessionStorage, чтобы предотвратить восстановление данных при следующем заходе
      sessionStorage.setItem('draft_deleted', 'true')
    } catch (e) {
      logger.warn('[CreateArticlePage] Failed to clear localStorage:', e)
    }
    
    // Очищаем состояние формы
    setTitle('')
    setContent('')
    setContentJSON(null)
    setExcerpt('')
    setTags([])
    setTagInput('')
    setDifficulty('intermediate')
    setOriginalImageUrl(null)
    setSelectedImageUrl(null)
    setCroppedImageUrl(null)
    setCroppedImageBlob(null)
    setExistingPreviewImageId(null)
    setDraftId(null)
    
    // Очищаем refs для изображений
    originalImageUrlRef.current = null
    selectedImageUrlRef.current = null
    croppedImageUrlRef.current = null
    
    setShowExitDialog(false)
    userHasEditedRef.current = false
    
    if (pendingNavigationUrl !== null) {
      allowNavigationRef.current = true
      if (typeof pendingNavigationUrl === 'number') {
        // Для кнопки Back всегда переходим на /forum (страницу статей)
        navigate('/forum')
      } else {
        navigate(pendingNavigationUrl)
      }
    }
  }, [navigate, pendingNavigationUrl])
  
  // Обработчик: Продолжить редактирование
  const handleExitContinue = useCallback(() => {
    setShowExitDialog(false)
    setPendingNavigationUrl(null)
  }, [])
  
  // Обработчик: Сохранить в черновик и выйти
  const handleExitSaveDraft = useCallback(async () => {
    // Закрываем диалог сразу, чтобы не мешать сохранению
    setShowExitDialog(false)
    try {
      // Получаем JSON из редактора
      let currentContentJSON = contentJSON
      if (editorRef.current) {
        try {
          currentContentJSON = editorRef.current.getJSON()
        } catch (e) {
          logger.warn('[CreateArticlePage] Failed to get JSON from editor:', e)
        }
      }
      
      // Преобразуем difficulty
      const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
        beginner: 'easy',
        intermediate: 'medium',
        advanced: 'hard',
      }
      
      // Формируем контент
      let contentDoc: any[] = []
      if (currentContentJSON?.type === 'doc' && Array.isArray(currentContentJSON.content)) {
        contentDoc = currentContentJSON.content
      } else if (Array.isArray(currentContentJSON)) {
        contentDoc = currentContentJSON
      } else if (content) {
        const text = content.replace(/<[^>]*>/g, '').trim()
        contentDoc = [{ type: 'paragraph', children: [{ text: text || '' }] }]
      } else {
        contentDoc = [{ type: 'paragraph', children: [{ text: '' }] }]
      }
      
      const draftTitle = (title || t('createArticle.untitledDraft')).trim()
      const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle
      
      const draftPayload: any = {
        title: finalDraftTitle,
        content: contentDoc,
        excerpt: (excerpt || ' ').trim(),
        tags: tags,
        difficulty: difficultyMap[difficulty] || 'medium',
      }
      
      const previewImage = resolvePreviewUrl()
      if (previewImage) {
        draftPayload.previewImage = previewImage
        draftPayload.preview_image = previewImage
        draftPayload.cover_url = previewImage
      }
      
      // Сохраняем черновик
      if (draftId) {
        await updateDraft(draftId, draftPayload)
      } else {
        await createDraft(draftPayload)
      }
      
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
      
      // Помечаем черновик как намеренно сохраненный, чтобы DraftRecoveryProvider не показывал панель
      try {
        const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('draft_'))
        draftKeys.forEach(k => {
          // Устанавливаем флаг в sessionStorage перед очисткой localStorage
          sessionStorage.setItem(`draft_intentionally_saved_${k}`, 'true')
          localStorage.removeItem(k)
        })
      } catch (e) {
        logger.warn('[CreateArticlePage] Failed to clear localStorage:', e)
      }
      
      // Очищаем localStorage после сохранения
      try {
        const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('draft_'))
        draftKeys.forEach(k => {
          sessionStorage.setItem(`draft_intentionally_saved_${k}`, 'true')
          localStorage.removeItem(k)
        })
      } catch (e) {
        logger.warn('[CreateArticlePage] Failed to clear localStorage:', e)
      }

      toast({
        title: t('draftRecovery.saved'),
        description: t('draftRecovery.savedDescription'),
      })
      
      setShowExitDialog(false)
      userHasEditedRef.current = false
      
      if (pendingNavigationUrl !== null) {
        allowNavigationRef.current = true
        if (typeof pendingNavigationUrl === 'number') {
          // Для кнопки Back всегда переходим на /forum (страницу статей)
          navigate('/forum')
        } else {
          navigate(pendingNavigationUrl)
        }
      }
    } catch (error: any) {
      logger.error('[CreateArticlePage] Failed to save draft:', error)
      toast({
        title: t('draftRecovery.saveError'),
        description: error?.message || t('draftRecovery.saveErrorDescription'),
        variant: 'destructive',
      })
    }
  }, [content, contentJSON, difficulty, draftId, excerpt, navigate, pendingNavigationUrl, queryClient, resolvePreviewUrl, t, tags, title, toast])
  
  // ============================================================================

  const uploadPreviewImageAsset = useCallback(async (): Promise<string | null> => {
    // Временно отключаем загрузку в наше хранилище
    if (!UPLOAD_PREVIEW_ENABLED) {
      // Возвращаем уже выбранный/установленный URL (включая внешний)
      return resolvePreviewUrl()
    }

    if (!croppedImageBlob) {
      return existingPreviewImageId ? String(existingPreviewImageId) : null
    }

    // Загружаем изображение в выбранное хранилище (Supabase Storage или Cloudflare R2)
    // Retry логика для отказоустойчивости
    let lastError: any = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug('[CreateArticlePage] Uploading preview image, attempt:', attempt)
        
        // Создаем File из Blob
        const file = new File([croppedImageBlob], `article-preview-${Date.now()}.jpg`, {
          type: croppedImageBlob.type || 'image/jpeg',
        })

        // Получаем ID статьи для удаления только превью этой статьи
        // Если редактируем существующую статью, используем её ID
        // Если создаём новую, используем draftId (если есть)
        const currentArticleId = editArticleIdRef.current || articleToEdit?.id || (draftId ? Number(draftId) : undefined);
        const result = await uploadImage(file, 'articles', undefined, currentArticleId)
        
        logger.debug('[CreateArticlePage] Preview image uploaded successfully:', { url: result.url })
        setExistingPreviewImageId(result.url)
        setCroppedImageBlob(null)
        return result.url
      } catch (error: any) {
        lastError = error
        logger.error(`[CreateArticlePage] Upload attempt ${attempt} failed:`, {
          error: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          response: error.response?.data,
          responseHeaders: error.response?.headers,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
        })
        
        // Если это не сетевая ошибка или таймаут, не повторяем
        if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK' && error.response?.status !== 408) {
          logger.error('[CreateArticlePage] Non-retryable error, stopping retries')
          break
        }
        
        // Экспоненциальная задержка перед повтором
        if (attempt < maxRetries) {
          const delay = 1000 * attempt
          logger.debug(`[CreateArticlePage] Retrying after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // Если все попытки не удались, выбрасываем последнюю ошибку
    throw lastError || new Error('Failed to upload image after multiple attempts')
  }, [croppedImageBlob, existingPreviewImageId, resolvePreviewUrl, editArticleIdRef, articleToEdit, draftId])

  const applyExternalImageUrl = useCallback(() => {
    const url = externalImageUrl.trim()
    if (!url.startsWith('http')) {
      toast({
        title: t('common.error') || 'Ошибка',
        description: t('createArticle.invalidImageUrl') || 'Укажите корректную ссылку (http/https)',
        variant: 'destructive',
      })
      return
    }
    setOriginalImageUrl(url)
    setSelectedImageUrl(url)
    setCroppedImageUrl(url)
    setCroppedImageBlob(null)
    setExistingPreviewImageId(url)
    setIsExternalImageDialogOpen(false)
  }, [externalImageUrl, toast, t])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return
    
    // Проверяем лимит количества тегов
    if (tags.length >= MAX_TAGS) {
      toast({
        title: t('createArticle.maxTagsReached') || 'Maximum tags reached',
        description: t('createArticle.maxTagsReachedDescription', { max: MAX_TAGS }) || `You can add up to ${MAX_TAGS} tags`,
        variant: 'destructive',
      })
      return
    }
    
    if (!tags.includes(trimmedTag)) {
      // Ограничиваем длину тега
      const limitedTag = trimmedTag.slice(0, TAG_MAX_LENGTH)
      if (limitedTag.length < trimmedTag.length) {
        toast({
          title: t('createArticle.tagTooLong') || 'Tag too long',
          description: t('createArticle.tagTooLongDescription', { max: TAG_MAX_LENGTH }) || `Tag must be no more than ${TAG_MAX_LENGTH} characters`,
          variant: 'destructive',
        })
      }
      setTags([...tags, limitedTag])
      setTagInput('')
      userHasEditedRef.current = true
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    userHasEditedRef.current = true
  }

  // Auto-resize textarea for excerpt
  const adjustTextareaHeight = useCallback(() => {
    const textarea = excerptTextareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [excerpt, adjustTextareaHeight])

  // Загрузка статьи для редактирования
  useEffect(() => {
    const targetEditId = editArticleIdRef.current
    if (targetEditId && user && !isLoadingArticle && !articleToEdit) {
      setIsLoadingArticle(true)
      getArticle(targetEditId)
        .then(async (article) => {
          if (article) {
            // Проверяем, что пользователь является автором статьи (сравниваем по id/uuid/username)
            const userIdStr = user?.id ? String(user.id) : null
            const authorIdStr = article.author?.id ? String(article.author.id) : null
            const isAuthor =
              (userIdStr && authorIdStr && userIdStr === authorIdStr) ||
              (article.author?.uuid && userIdStr && String(article.author.uuid) === userIdStr) ||
              (article.author?.username && user.nickname && article.author.username === user.nickname)

            if (!isAuthor) {
              toast({
                title: t('createArticle.editNotAuthorized') || 'Not authorized',
                description: t('createArticle.editNotAuthorizedDescription') || 'You can only edit your own articles',
                variant: 'destructive',
              })
              navigate('/forum')
              return
            }
            
            setArticleToEdit(article)
            setTitle(article.title)
            setExcerpt(article.excerpt || '')
            
            // Преобразуем теги из JSON или массива
            if (article.tags) {
              if (Array.isArray(article.tags)) {
                setTags(article.tags)
              } else if (typeof article.tags === 'string') {
                try {
                  const parsed = JSON.parse(article.tags)
                  setTags(Array.isArray(parsed) ? parsed : [])
                } catch {
                  setTags([])
                }
              } else {
                setTags([])
              }
            }
            
            // Преобразуем difficulty из backend формата в frontend
            const difficultyMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
              easy: 'beginner',
              medium: 'intermediate',
              hard: 'advanced',
            }
            if (article.difficulty && difficultyMap[article.difficulty]) {
              setDifficulty(difficultyMap[article.difficulty])
            }
            
            // Устанавливаем превью изображение
            if (article.previewImage) {
              setExistingPreviewImageId(article.previewImage)
              setOriginalImageUrl(article.previewImage)
              setSelectedImageUrl(article.previewImage)
              originalImageUrlRef.current = article.previewImage
              selectedImageUrlRef.current = article.previewImage
            }
            
            // Преобразуем контент в формат TipTap (ProseMirror type:'doc') и/или HTML для редактора
            // Редактор показывает сырой JSON, если передать Slate-массив или stringified JSON — всегда конвертируем в ProseMirror/HTML
            if (article.content) {
              try {
                const raw = article.content as any
                const { slateToProseMirror } = await import('@/lib/slate-to-prosemirror')
                const { slateToHtml } = await import('@/lib/slate-to-html')

                if (raw && typeof raw === 'object' && raw.type === 'doc') {
                  // Уже ProseMirror (TipTap)
                  setContentJSON(raw)
                } else if (raw && typeof raw === 'object' && 'document' in raw && raw.document) {
                  const doc = raw.document
                  if (doc && typeof doc === 'object' && doc.type === 'doc') {
                    setContentJSON(doc)
                  } else {
                    const pm = slateToProseMirror(raw)
                    setContentJSON(pm)
                    setContent(slateToHtml(raw))
                  }
                } else if (Array.isArray(raw)) {
                  // Slate-массив — конвертируем в ProseMirror и HTML
                  setContentJSON(slateToProseMirror(raw))
                  setContent(slateToHtml(raw))
                } else if (typeof raw === 'string') {
                  const s = raw.trim()
                  if (s.startsWith('[') || s.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(raw)
                      if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
                        setContentJSON(slateToProseMirror(parsed))
                        setContent(slateToHtml(parsed))
                      } else {
                        setContent(raw)
                      }
                    } catch {
                      setContent(raw)
                    }
                  } else {
                    // Строка-HTML
                    setContent(raw)
                  }
                } else {
                  setContentJSON(slateToProseMirror(raw))
                  setContent(slateToHtml(raw))
                }
              } catch (error) {
                logger.error('[CreateArticlePage] Failed to parse article content:', error)
                setContent('')
                setContentJSON(null)
              }
            }
            
            logger.debug('[CreateArticlePage] Article loaded for editing:', { articleId: article.id })
          } else {
            toast({
              title: t('createArticle.articleNotFound') || 'Article not found',
              description: t('createArticle.articleNotFoundDescription') || 'The article you are trying to edit does not exist',
              variant: 'destructive',
            })
            navigate('/forum')
          }
        })
        .catch((error) => {
          logger.error('[CreateArticlePage] Failed to load article for editing:', error)
          toast({
            title: t('createArticle.loadError') || 'Error loading article',
            description: t('createArticle.loadErrorDescription') || 'Failed to load article for editing',
            variant: 'destructive',
          })
          navigate('/forum')
        })
        .finally(() => {
          setIsLoadingArticle(false)
        })
    }
  }, [editArticleIdRef, user, isLoadingArticle, articleToEdit, navigate, toast, t])

  // Check if content is long enough to need collapsing
  useEffect(() => {
    if (currentStep === 4 && contentPreviewRef.current && content.trim()) {
      // Use requestAnimationFrame to ensure content is rendered
      requestAnimationFrame(() => {
        if (contentPreviewRef.current) {
          const height = contentPreviewRef.current.scrollHeight
          setShouldShowExpandButton(height > 600)
          if (height <= 600) {
            setIsContentExpanded(true)
          } else {
            setIsContentExpanded(false)
          }
        }
      })
    } else if (currentStep !== 4) {
      // Reset when leaving review step
      setIsContentExpanded(false)
    }
  }, [content, currentStep])

  // Вставляем иконки и метки в callout блоки на этапе review
  useEffect(() => {
    if (currentStep === 4 && contentPreviewRef.current) {
      // Используем setTimeout, чтобы убедиться, что HTML уже отрендерен
      const timeoutId = setTimeout(() => {
        const calloutBlocks = contentPreviewRef.current?.querySelectorAll('aside[data-type="callout"]')
        calloutBlocks?.forEach((callout) => {
          const aside = callout as HTMLElement
          const iconSvg = aside.getAttribute('data-icon-svg')
          const label = aside.getAttribute('data-label')
          
          // Вставляем иконку
          if (iconSvg) {
            const iconContainer = aside.querySelector('.callout-icon-container')
            const iconSpan = iconContainer?.querySelector('.callout-icon')
            if (iconSpan && !iconSpan.innerHTML.trim()) {
              iconSpan.innerHTML = iconSvg
            }
          }
          
          // Вставляем метку
          if (label) {
            const labelSpan = aside.querySelector('.callout-label')
            if (labelSpan && !labelSpan.textContent?.trim()) {
              labelSpan.textContent = label
            }
          }
        })
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [content, currentStep])

  // Вставляем иконки в кнопки копирования code blocks на этапе review
  useEffect(() => {
    if (currentStep === 4 && contentPreviewRef.current) {
      // Используем setTimeout, чтобы убедиться, что HTML уже отрендерен
      const timeoutId = setTimeout(() => {
        const codeBlocks = contentPreviewRef.current?.querySelectorAll('.code-block-wrapper')
        codeBlocks?.forEach((codeBlock) => {
          const wrapper = codeBlock as HTMLElement
          const copyIconSvg = wrapper.getAttribute('data-copy-icon-svg')
          const checkIconSvg = wrapper.getAttribute('data-check-icon-svg')
          const copyBtn = wrapper.querySelector('.code-block-copy-btn')
          
          // Вставляем иконки в кнопку копирования
          if (copyBtn && !copyBtn.innerHTML.trim()) {
            if (copyIconSvg && checkIconSvg) {
              copyBtn.innerHTML = copyIconSvg + checkIconSvg
            }
          }
          
          // Добавляем обработчик копирования
          if (copyBtn && !(copyBtn as any)._copyHandlerAdded) {
            const handler = async (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
              
              const codeElement = wrapper.querySelector('code')
              if (!codeElement) return
              
              const codeContent = codeElement.textContent || codeElement.innerText || ''
              
              try {
                await navigator.clipboard.writeText(codeContent)
                
                // Показываем иконку "галочка"
                const copyIcon = copyBtn.querySelector('.copy-icon')
                const checkIcon = copyBtn.querySelector('.check-icon')
                
                if (copyIcon && checkIcon) {
                  copyIcon.classList.add('hidden')
                  checkIcon.classList.remove('hidden')
                  
                  setTimeout(() => {
                    copyIcon.classList.remove('hidden')
                    checkIcon.classList.add('hidden')
                  }, 2000)
                }
              } catch (err) {
                console.error('Failed to copy code:', err)
              }
            }
            
            copyBtn.addEventListener('click', handler)
            ;(copyBtn as any)._copyHandlerAdded = true
            ;(copyBtn as any)._copyHandler = handler
          }
        })
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        // Очищаем обработчики при размонтировании
        const codeBlocks = contentPreviewRef.current?.querySelectorAll('.code-block-wrapper')
        codeBlocks?.forEach((codeBlock) => {
          const copyBtn = codeBlock.querySelector('.code-block-copy-btn')
          if (copyBtn && (copyBtn as any)._copyHandler) {
            copyBtn.removeEventListener('click', (copyBtn as any)._copyHandler)
            delete (copyBtn as any)._copyHandler
            delete (copyBtn as any)._copyHandlerAdded
          }
        })
      }
    }
  }, [content, currentStep])

  // Reset agreement when leaving guidelines step
  useEffect(() => {
    if (currentStep !== 5) {
      setAgreedToTerms(false)
    }
  }, [currentStep])

  // Автоматическое сохранение черновика при изменении контента (debounced)
  useEffect(() => {
    // Очищаем предыдущий таймаут
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    // Не сохраняем если:
    // - Пользователь не авторизован
    // - Нет контента (ни заголовка, ни текста)
    // - Идет загрузка черновика
    // - Идет сохранение черновика
    // Не сохраняем, если:
    // 1. Пользователь не авторизован
    // 2. Нет контента
    // 3. Идет загрузка черновика
    // 4. Уже идет сохранение (чтобы избежать дубликатов)
    // 5. Идет размонтирование компонента
    if (!user || (title.trim().length === 0 && getPlainTextFromHtml(content).trim().length === 0) || isLoadingDraft || isSavingDraft || isUnmountingRef.current) {
      return
    }

    // Сначала сохраняем в localStorage сразу (для быстрого восстановления)
    // Это делается независимо от сохранения на бэкенд
    try {
      const currentTitle = title
      const currentContent = content
      const currentExcerpt = excerpt
      const currentTags = tags
      const currentDifficulty = difficulty
      const currentDraftId = draftId
      
      // Получаем JSON из редактора
      let currentContentJSON = contentJSON
      if (editorRef.current) {
        try {
          currentContentJSON = editorRef.current.getJSON()
        } catch (e) {
          // Игнорируем ошибки
        }
      }
      
      const hasContent = currentTitle.trim() || currentContent.trim() || currentExcerpt.trim()
      if (hasContent) {
        const previewImage = resolvePreviewUrl()
        const localStorageKey = `draft_${currentDraftId || 'new'}`
        const localStorageData = {
          title: currentTitle,
          excerpt: currentExcerpt,
          tags: currentTags,
          difficulty: currentDifficulty,
          previewImage: previewImage || undefined,
          contentHTML: currentContent,
          contentJSON: currentContentJSON,
          draftId: currentDraftId,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(localStorageKey, JSON.stringify(localStorageData))
        logger.debug('[CreateArticlePage] Auto-saved to localStorage:', { key: localStorageKey })
      }
    } catch (localStorageError) {
      logger.warn('[CreateArticlePage] Failed to auto-save to localStorage:', localStorageError)
    }

    // Устанавливаем новый таймаут для автоматического сохранения на бэкенд (через 3 секунды после последнего изменения)
    const timeout = setTimeout(async () => {
      // Проверяем cooldown для предотвращения спама
      const now = Date.now()
      const timeSinceLastSave = now - lastDraftSaveTime
      if (timeSinceLastSave < DRAFT_SAVE_COOLDOWN) {
        logger.debug('[CreateArticlePage] Auto-save skipped due to cooldown:', {
          timeSinceLastSave,
          cooldown: DRAFT_SAVE_COOLDOWN,
        })
        return
      }
      
      try {
        // Получаем актуальные значения из refs и state
        const currentTitle = title
        const currentContent = content
        const currentContentJSON = contentJSON
        const currentExcerpt = excerpt
        const currentTags = tags
        const currentDifficulty = difficulty
        const currentPreviewImage = resolvePreviewUrl()
        const currentDraftId = draftId

        // Получаем JSON из редактора
        let editorJSON: any = null
        if (editorRef.current) {
          try {
            editorJSON = editorRef.current.getJSON()
          } catch (error) {
            logger.warn('[CreateArticlePage] Failed to get JSON for auto-save:', error)
          }
        }
        
        const finalContentJSON = editorJSON || currentContentJSON
        
        // Если нет JSON контента, создаем минимальный документ
        let contentDocument: any[] = []
        if (finalContentJSON && finalContentJSON.type === 'doc' && Array.isArray(finalContentJSON.content)) {
          // ProseMirror формат - преобразуем в Slate (упрощенная версия для автосохранения)
          contentDocument = finalContentJSON.content.map((node: any) => {
            if (node.type === 'paragraph' && Array.isArray(node.content)) {
              const children = node.content
                .filter((child: any) => child.type === 'text')
                .map((child: any) => {
                  const result: any = { text: child.text || '' }
                  if (child.marks) {
                    if (child.marks.some((m: any) => m.type === 'bold')) result.bold = true
                    if (child.marks.some((m: any) => m.type === 'italic')) result.italic = true
                    if (child.marks.some((m: any) => m.type === 'code')) result.code = true
                  }
                  return result
                })
              return {
                type: 'paragraph',
                children: children.length > 0 ? children : [{ text: '' }],
              }
            } else if (node.type === 'heading' && Array.isArray(node.content)) {
              const children = node.content
                .filter((child: any) => child.type === 'text')
                .map((child: any) => ({ text: child.text || '' }))
              return {
                type: 'heading',
                level: node.attrs?.level || 1,
                children: children.length > 0 ? children : [{ text: '' }],
              }
            } else {
              // Для других типов создаем простой paragraph
              return {
                type: 'paragraph',
                children: [{ text: '' }],
              }
            }
          }).filter((block: any) => block !== null)
        } else if (Array.isArray(finalContentJSON)) {
          // Уже массив блоков Slate
          contentDocument = finalContentJSON
        } else {
          // Создаем минимальный документ из HTML
          const plainText = getPlainTextFromHtml(currentContent)
          if (plainText.trim().length === 0 && currentTitle.trim().length === 0) {
            return // Не сохраняем пустой черновик
          }
          contentDocument = [
            {
              type: 'paragraph',
              children: [{ text: plainText || '' }],
            },
          ]
        }

        // Убеждаемся, что contentDocument - это массив
        if (!Array.isArray(contentDocument) || contentDocument.length === 0) {
          contentDocument = [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ]
        }

        // Функция для преобразования difficulty из frontend в backend формат
        const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
          const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
            beginner: 'easy',
            intermediate: 'medium',
            advanced: 'hard',
          };
          return mapping[diff] || 'medium';
        };

        // Формируем данные для сохранения (не передаем previewImage, если его нет)
        // Для черновиков используем дефолтные значения если поля пустые, чтобы избежать ошибок валидации
        const draftTitle = currentTitle.trim() || t('createArticle.untitledDraft');
        // Убеждаемся, что title имеет минимум 10 символов для черновика (если меньше, добавляем пробелы)
        const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle;
        
        const draftData: any = {
          title: finalDraftTitle,
          content: contentDocument,
          excerpt: currentExcerpt.trim() || ' ', // Используем пробел вместо null для черновиков
          tags: currentTags,
          difficulty: mapDifficultyToBackend(currentDifficulty),
        }

        // Добавляем previewImage только если он есть
        if (currentPreviewImage) {
          draftData.previewImage = currentPreviewImage
          draftData.preview_image = currentPreviewImage // snake_case
          draftData.cover_url = currentPreviewImage // полное имя поля в базе
        }

        // ВАЖНО: Сначала сохраняем в localStorage для быстрого восстановления при потере соединения
        // Это делается ВСЕГДА, даже если не будет сохранения на бэкенд
        const localStorageKey = `draft_${currentDraftId || 'new'}`
        try {
          const localStorageData = {
            title: currentTitle,
            excerpt: currentExcerpt,
            tags: currentTags,
            difficulty: currentDifficulty,
            previewImage: currentPreviewImage || undefined,
            contentHTML: currentContent, // Сохраняем HTML для быстрого восстановления
            contentJSON: finalContentJSON, // Сохраняем JSON для точного восстановления
            draftId: currentDraftId,
            savedAt: new Date().toISOString(),
          }
          localStorage.setItem(localStorageKey, JSON.stringify(localStorageData))
          logger.debug('[CreateArticlePage] Saved draft to localStorage (auto-save):', { key: localStorageKey })
        } catch (localStorageError) {
          logger.warn('[CreateArticlePage] Failed to save draft to localStorage:', localStorageError)
          // Продолжаем сохранение на бэкенд даже если localStorage не работает
        }

        // Затем сохраняем черновик на бэкенд (если не идет размонтирование)
        // НЕ создаем новый черновик, если уже идет размонтирование
        if (isUnmountingRef.current) {
          logger.debug('[CreateArticlePage] Skipping backend save on unmount during auto-save')
          return
        }
        
        let saved: Article
        if (currentDraftId) {
          try {
            // Пытаемся обновить существующий черновик
            saved = await updateDraft(currentDraftId, draftData)
            logger.debug('[CreateArticlePage] Updated existing draft:', { id: saved.id })
          } catch (error: any) {
            // Если черновик не найден, проверяем существование перед созданием нового
            if (error?.message?.includes('Draft not found') || error?.message?.includes('not found')) {
              logger.warn('[CreateArticlePage] Draft not found, checking for existing drafts before creating new one:', { currentDraftId })
              
              // Проверяем, нет ли уже черновика с таким же содержимым
              try {
                const { getDrafts } = await import('@/api/drafts')
                const existingDrafts = await getDrafts(0, 10)
                
                // Ищем черновик с таким же заголовком и автором
                const similarDraft = existingDrafts.find(d => 
                  d.title.trim() === finalDraftTitle.trim() && 
                  d.author.id === user.id
                )
                
                if (similarDraft) {
                  logger.debug('[CreateArticlePage] Found similar draft, updating it instead:', { id: similarDraft.id })
                  saved = await updateDraft(similarDraft.id, draftData)
                  setDraftId(saved.id)
                } else {
                  // Создаем новый только если нет похожего
                  logger.warn('[CreateArticlePage] Creating new draft after not found:', { currentDraftId })
                  saved = await createDraft(draftData)
                  setDraftId(saved.id)
                }
              } catch (checkError) {
                // Если проверка не удалась, создаем новый
                logger.warn('[CreateArticlePage] Failed to check existing drafts, creating new one:', checkError)
                saved = await createDraft(draftData)
                setDraftId(saved.id)
              }
              
              // Обновляем localStorage с новым ID
              try {
                const newLocalStorageKey = `draft_${saved.id}`
                const oldKey = `draft_${currentDraftId}`
                const oldData = localStorage.getItem(oldKey)
                if (oldData) {
                  const parsedData = JSON.parse(oldData)
                  parsedData.draftId = saved.id
                  localStorage.setItem(newLocalStorageKey, JSON.stringify(parsedData))
                  localStorage.removeItem(oldKey)
                }
              } catch (localStorageError) {
                logger.warn('[CreateArticlePage] Failed to update localStorage after draft recreation:', localStorageError)
              }
            } else {
              throw error
            }
          }
        } else {
          // Если нет draftId, проверяем существование похожего черновика перед созданием
          try {
            const { getDrafts } = await import('@/api/drafts')
            const existingDrafts = await getDrafts(0, 10)
            
            // Ищем черновик с таким же заголовком и автором
            const similarDraft = existingDrafts.find(d => 
              d.title.trim() === finalDraftTitle.trim() && 
              d.author.id === user.id &&
              // Проверяем, что это действительно похожий черновик (недавно обновленный)
              (d.updatedAt ? new Date(d.updatedAt).getTime() > Date.now() - 60000 : false) // В течение последней минуты
            )
            
            if (similarDraft) {
              logger.debug('[CreateArticlePage] Found similar draft, updating it instead of creating new:', { id: similarDraft.id })
              saved = await updateDraft(similarDraft.id, draftData)
              setDraftId(saved.id)
            } else {
              // Создаем новый только если нет похожего
              logger.debug('[CreateArticlePage] Creating new draft (no similar found)')
              saved = await createDraft(draftData)
              setDraftId(saved.id)
            }
          } catch (checkError) {
            // Если проверка не удалась, создаем новый
            logger.warn('[CreateArticlePage] Failed to check existing drafts, creating new one:', checkError)
            saved = await createDraft(draftData)
            setDraftId(saved.id)
          }
        }

        setDraftId(saved.id)
        setLastDraftSaveTime(Date.now())
        
        // Обновляем localStorage с актуальным ID
        if (saved.id) {
          try {
            const newLocalStorageKey = `draft_${saved.id}`
            const oldKey = currentDraftId ? `draft_${currentDraftId}` : localStorageKey
            const oldData = localStorage.getItem(oldKey)
            if (oldData) {
              const parsedData = JSON.parse(oldData)
              parsedData.draftId = saved.id
              localStorage.setItem(newLocalStorageKey, JSON.stringify(parsedData))
              if (oldKey !== newLocalStorageKey) {
                localStorage.removeItem(oldKey) // Удаляем старый ключ
              }
            }
          } catch (error) {
            logger.warn('[CreateArticlePage] Failed to update localStorage key:', error)
          }
        }
        
        // Обновляем URL в query params
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('draft', saved.id)
        setSearchParams(nextParams, { replace: true })
        loadedDraftIdRef.current = String(saved.id)

        // Инвалидируем кэш черновиков, чтобы они сразу появились в списке
        queryClient.invalidateQueries({ queryKey: ['drafts'] })

        logger.debug('[CreateArticlePage] Auto-saved draft:', { id: saved.id })
      } catch (error: any) {
        logger.error('[CreateArticlePage] Failed to auto-save draft:', error)
        // Если черновик не найден, пытаемся создать новый (только для автосохранения)
        // НЕ создаем новый черновик, если уже идет размонтирование
        if ((error?.message?.includes('Draft not found') || error?.message?.includes('not found')) && !isUnmountingRef.current) {
          try {
            logger.warn('[CreateArticlePage] Draft not found in auto-save, creating new one')
            // Пересоздаем данные для сохранения из текущего state
            const retryTitle = title
            const retryContent = content
            const retryExcerpt = excerpt
            const retryTags = tags
            const retryDifficulty = difficulty
            const retryPreviewImage = resolvePreviewUrl()
            const retryDraftId = draftId
            
            // Получаем JSON из редактора
            let retryEditorJSON: any = null
            if (editorRef.current) {
              try {
                retryEditorJSON = editorRef.current.getJSON()
              } catch (e) {
                logger.warn('[CreateArticlePage] Failed to get JSON for retry:', e)
              }
            }
            
            const retryFinalContentJSON = retryEditorJSON || contentJSON
            
            // Создаем contentDocument
            let retryContentDocument: any[] = []
            if (retryFinalContentJSON && retryFinalContentJSON.type === 'doc' && Array.isArray(retryFinalContentJSON.content)) {
              retryContentDocument = retryFinalContentJSON.content.map((node: any) => {
                if (node.type === 'paragraph' && Array.isArray(node.content)) {
                  const children = node.content
                    .filter((child: any) => child.type === 'text')
                    .map((child: any) => ({ text: child.text || '' }))
                  return {
                    type: 'paragraph',
                    children: children.length > 0 ? children : [{ text: '' }],
                  }
                }
                return {
                  type: 'paragraph',
                  children: [{ text: '' }],
                }
              }).filter((block: any) => block !== null)
            } else if (Array.isArray(retryFinalContentJSON)) {
              retryContentDocument = retryFinalContentJSON
            } else {
              const plainText = getPlainTextFromHtml(retryContent)
              retryContentDocument = [
                {
                  type: 'paragraph',
                  children: [{ text: plainText || '' }],
                },
              ]
            }
            
            if (!Array.isArray(retryContentDocument) || retryContentDocument.length === 0) {
              retryContentDocument = [
                {
                  type: 'paragraph',
                  children: [{ text: '' }],
                },
              ]
            }
            
            const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
              const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
                beginner: 'easy',
                intermediate: 'medium',
                advanced: 'hard',
              };
              return mapping[diff] || 'medium';
            };
            
            const retryDraftTitle = retryTitle.trim() || t('createArticle.untitledDraft');
            const retryFinalDraftTitle = retryDraftTitle.length < 10 ? retryDraftTitle.padEnd(10, ' ') : retryDraftTitle;
            
            const retryDraftData: any = {
              title: retryFinalDraftTitle,
              content: retryContentDocument,
              excerpt: retryExcerpt.trim() || ' ',
              tags: retryTags,
              difficulty: mapDifficultyToBackend(retryDifficulty),
            }
            
            if (retryPreviewImage) {
              retryDraftData.previewImage = retryPreviewImage
              retryDraftData.preview_image = retryPreviewImage
              retryDraftData.cover_url = retryPreviewImage
            }
            
            const newDraft = await createDraft(retryDraftData)
            setDraftId(newDraft.id)
            setLastDraftSaveTime(Date.now())
            // Обновляем localStorage с новым ID
            try {
              const newLocalStorageKey = `draft_${newDraft.id}`
              const oldKey = `draft_${retryDraftId || 'new'}`
              const oldData = localStorage.getItem(oldKey)
              if (oldData) {
                const parsedData = JSON.parse(oldData)
                parsedData.draftId = newDraft.id
                localStorage.setItem(newLocalStorageKey, JSON.stringify(parsedData))
                if (oldKey !== newLocalStorageKey) {
                  localStorage.removeItem(oldKey)
                }
              }
            } catch (localStorageError) {
              logger.warn('[CreateArticlePage] Failed to update localStorage after auto-save draft recreation:', localStorageError)
            }
            logger.debug('[CreateArticlePage] Auto-saved new draft after recreation:', { id: newDraft.id })
          } catch (createError) {
            logger.error('[CreateArticlePage] Failed to create new draft in auto-save:', createError)
          }
        }
        // Не показываем toast при ошибке автосохранения, чтобы не раздражать пользователя
      }
    }, 3000) // 3 секунды задержка

    setAutoSaveTimeout(timeout)

    // Очищаем таймаут при размонтировании
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, contentJSON, excerpt, tags, difficulty, existingPreviewImageId, draftId, user, isLoadingDraft, isSavingDraft])


  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute) || 1
  }

  const handleSaveDraft = async () => {
    // Закрываем диалог выхода сразу, чтобы он не мешал сохранению
    setShowExitDialog(false)
    
    const currentUser = useAuthStore.getState().user

    if (!currentUser) {
      toast({
        title: t('createArticle.authRequired'),
        description: t('createArticle.authRequiredToSave'),
        variant: 'destructive',
      })
      navigate('/auth')
      return
    }

    // Проверяем cooldown для предотвращения спама
    const now = Date.now()
    const timeSinceLastSave = now - lastDraftSaveTime
    if (timeSinceLastSave < DRAFT_SAVE_COOLDOWN) {
      const remainingTime = Math.ceil((DRAFT_SAVE_COOLDOWN - timeSinceLastSave) / 1000)
      toast({
        title: t('createArticle.saveCooldown') || 'Please wait',
        description: t('createArticle.saveCooldownDescription', { seconds: remainingTime }) || `Please wait ${remainingTime} second(s) before saving again`,
        variant: 'destructive',
      })
      return
    }

    const hasTitle = Boolean(title.trim())
    const plainText = getPlainTextFromHtml(content)
    const hasBody = plainText.length > 0
    const hasExcerpt = Boolean(excerpt.trim())

    if (!hasTitle && !hasBody) {
      toast({
        title: t('createArticle.addContentFirst'),
        description: t('createArticle.addContentFirstDescription'),
        variant: 'destructive',
      })
      return
    }

    if (!hasExcerpt) {
      toast({
        title: t('createArticle.excerptRequired') || 'Excerpt required',
        description: t('createArticle.excerptRequiredDescription') || 'Please add a description for your article',
        variant: 'destructive',
      })
      return
    }

    setIsSavingDraft(true)

    try {
      let previewImageUrl: string | null = null

      try {
        previewImageUrl = await uploadPreviewImageAsset()
        logger.debug('[CreateArticlePage] Preview image uploaded for draft:', { previewImageUrl })
      } catch (error) {
        logger.error('[CreateArticlePage] Preview upload failed, continuing without image:', error)
        // Продолжаем сохранение черновика даже если загрузка изображения не удалась
        // Используем existingPreviewImageId если есть
        previewImageUrl = resolvePreviewUrl()
        toast({
          title: t('createArticle.imageUploadFailed'),
          description: t('createArticle.imageUploadFailedDescription'),
          variant: 'destructive',
        })
        // НЕ прерываем сохранение - продолжаем без изображения
      }

      // Получаем JSON из редактора
      let editorJSON: any = null
      if (editorRef.current) {
        try {
          editorJSON = editorRef.current.getJSON()
        } catch (error) {
          logger.warn('[CreateArticlePage] Failed to get JSON for save draft:', error)
        }
      }
      
      const finalContentJSON = editorJSON || contentJSON
      
      // Если нет JSON контента, создаем минимальный документ
      let contentDocument: any[] = []
      if (finalContentJSON && finalContentJSON.type === 'doc' && Array.isArray(finalContentJSON.content)) {
        // ProseMirror формат - преобразуем в Slate
        // Используем упрощенную версию преобразования для черновиков
        contentDocument = finalContentJSON.content.map((node: any) => {
          if (node.type === 'paragraph' && Array.isArray(node.content)) {
            const children = node.content
              .filter((child: any) => child.type === 'text')
              .map((child: any) => {
                const result: any = { text: child.text || '' }
                if (child.marks) {
                  if (child.marks.some((m: any) => m.type === 'bold')) result.bold = true
                  if (child.marks.some((m: any) => m.type === 'italic')) result.italic = true
                  if (child.marks.some((m: any) => m.type === 'code')) result.code = true
                }
                return result
              })
            return {
              type: 'paragraph',
              children: children.length > 0 ? children : [{ text: '' }],
            }
          } else if (node.type === 'heading' && Array.isArray(node.content)) {
            const children = node.content
              .filter((child: any) => child.type === 'text')
              .map((child: any) => ({ text: child.text || '' }))
            return {
              type: 'heading',
              level: node.attrs?.level || 1,
              children: children.length > 0 ? children : [{ text: '' }],
            }
          } else {
            // Для других типов создаем простой paragraph
            return {
              type: 'paragraph',
              children: [{ text: '' }],
            }
          }
        }).filter((block: any) => block !== null)
      } else if (Array.isArray(finalContentJSON)) {
        // Уже массив блоков Slate
        contentDocument = finalContentJSON
      } else {
        // Создаем минимальный документ из HTML
        const plainText = getPlainTextFromHtml(content)
        if (plainText.trim().length === 0 && title.trim().length === 0) {
          toast({
            title: t('createArticle.addContentFirst'),
            description: t('createArticle.addContentFirstDescription'),
          variant: 'destructive',
        })
        setIsSavingDraft(false)
        return
        }
        contentDocument = [
          {
            type: 'paragraph',
            children: [{ text: plainText || '' }],
          },
        ]
      }
      
      // Убеждаемся, что contentDocument - это массив
      if (!Array.isArray(contentDocument) || contentDocument.length === 0) {
        contentDocument = [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]
      }

      // Валидация структуры блоков
      const validatedContent = contentDocument.map((block: any) => {
        if (!block || typeof block !== 'object') {
          return { type: 'paragraph', children: [{ text: '' }] }
        }
        if (!block.type) {
          return { type: 'paragraph', children: block.children || [{ text: '' }] }
        }
        if (!Array.isArray(block.children)) {
          return { ...block, children: [{ text: '' }] }
        }
        return block
      })

      logger.debug('[CreateArticlePage] Saving draft with content:', {
        contentLength: validatedContent.length,
        firstBlock: validatedContent[0],
        allBlockTypes: validatedContent.map((b: any) => b.type),
      })

      // Функция для преобразования difficulty из frontend в backend формат
      const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
        const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
          beginner: 'easy',
          intermediate: 'medium',
          advanced: 'hard',
        };
        return mapping[diff] || 'medium';
      };

      // Формируем данные для сохранения (не передаем previewImage, если его нет)
      // Для черновиков используем дефолтные значения если поля пустые, чтобы избежать ошибок валидации
      const draftTitle = title.trim() || t('createArticle.untitledDraft');
      // Убеждаемся, что title имеет минимум 10 символов для черновика (если меньше, добавляем пробелы)
      const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle;
      
      const draftData: any = {
        title: finalDraftTitle,
        content: validatedContent,
        excerpt: excerpt.trim() || ' ', // Используем пробел вместо null для черновиков
        tags,
        difficulty: mapDifficultyToBackend(difficulty),
      }

      // Добавляем previewImage только если он есть
      if (previewImageUrl) {
        draftData.previewImage = previewImageUrl
        draftData.preview_image = previewImageUrl // snake_case для бэка
        draftData.cover_url = previewImageUrl // явное поле в таблице
      }

      let saved: Article
      if (draftId) {
        try {
          // Пытаемся обновить существующий черновик
          saved = await updateDraft(draftId, draftData)
          logger.debug('[CreateArticlePage] Updated existing draft (manual save):', { id: saved.id })
        } catch (error: any) {
          // Если черновик не найден, проверяем существование похожего перед созданием
          if (error?.message?.includes('Draft not found') || error?.message?.includes('not found')) {
            logger.warn('[CreateArticlePage] Draft not found, checking for existing drafts before creating:', { draftId })
            
            try {
              const { getDrafts } = await import('@/api/drafts')
              const existingDrafts = await getDrafts(0, 10)
              
              // Ищем черновик с таким же заголовком и автором
              const similarDraft = existingDrafts.find(d => 
                d.title.trim() === finalDraftTitle.trim() && 
                d.author.id === currentUser.id
              )
              
              if (similarDraft) {
                logger.debug('[CreateArticlePage] Found similar draft, updating it instead:', { id: similarDraft.id })
                saved = await updateDraft(similarDraft.id, draftData)
                setDraftId(saved.id)
              } else {
                // Создаем новый только если нет похожего
                logger.warn('[CreateArticlePage] Creating new draft after not found:', { draftId })
                saved = await createDraft(draftData)
                setDraftId(saved.id)
              }
            } catch (checkError) {
              // Если проверка не удалась, создаем новый
              logger.warn('[CreateArticlePage] Failed to check existing drafts, creating new one:', checkError)
              saved = await createDraft(draftData)
              setDraftId(saved.id)
            }
          } else {
            throw error
          }
        }
      } else {
        // Если нет draftId, проверяем существование похожего черновика перед созданием
        try {
          const { getDrafts } = await import('@/api/drafts')
          const existingDrafts = await getDrafts(0, 10)
          
          // Ищем черновик с таким же заголовком и автором
          const similarDraft = existingDrafts.find(d => 
            d.title.trim() === finalDraftTitle.trim() && 
            d.author.id === currentUser.id
          )
          
          if (similarDraft) {
            logger.debug('[CreateArticlePage] Found similar draft, updating it instead of creating new (manual save):', { id: similarDraft.id })
            saved = await updateDraft(similarDraft.id, draftData)
            setDraftId(saved.id)
          } else {
            // Создаем новый только если нет похожего
            logger.debug('[CreateArticlePage] Creating new draft (no similar found, manual save)')
            saved = await createDraft(draftData)
            setDraftId(saved.id)
          }
        } catch (checkError) {
          // Если проверка не удалась, создаем новый
          logger.warn('[CreateArticlePage] Failed to check existing drafts, creating new one (manual save):', checkError)
          saved = await createDraft(draftData)
          setDraftId(saved.id)
        }
      }

      setDraftId(saved.id)
      setLastDraftSaveTime(Date.now())
      // Сохраняем URL изображения (теперь это строка, а не ID)
      setExistingPreviewImageId(saved.previewImage || null)
      if (saved.previewImage) {
        setCroppedImageUrl(saved.previewImage)
        croppedImageUrlRef.current = saved.previewImage
      }

      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('draft', saved.id)
      setSearchParams(nextParams, { replace: true })
      loadedDraftIdRef.current = String(saved.id)

      // Инвалидируем кэш черновиков, чтобы они сразу появились в списке
      queryClient.invalidateQueries({ queryKey: ['drafts'] })

      // Помечаем черновик как намеренно сохраненный, чтобы DraftRecoveryProvider не показывал плашку
      try {
        const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('draft_'))
        draftKeys.forEach(k => {
          sessionStorage.setItem(`draft_intentionally_saved_${k}`, 'true')
        })
        // Очищаем localStorage после сохранения в базу
        draftKeys.forEach(k => {
          localStorage.removeItem(k)
        })
      } catch (e) {
        logger.warn('[CreateArticlePage] Failed to set intentionally saved flag:', e)
      }

      // Сбрасываем флаг редактирования - это предотвратит показ диалога при навигации
      userHasEditedRef.current = false

      toast({
        title: t('createArticle.draftSaved'),
        description: t('createArticle.draftSavedDescription'),
      })
    } catch (error: unknown) {
      logger.error('Failed to save draft', error)
      const message =
        typeof error === 'object' && error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : error instanceof Error
            ? error.message
            : undefined
      toast({
        title: t('createArticle.unableToSaveDraft'),
        description: message || t('createArticle.unableToSaveDraftDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const resetPreviewImage = useCallback(() => {
    const revokeIfObjectUrl = (url: string | null) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }

    if (selectedImageUrl && selectedImageUrl !== originalImageUrl) {
      revokeIfObjectUrl(selectedImageUrl)
    }
    if (originalImageUrl) {
      revokeIfObjectUrl(originalImageUrl)
    }
    if (croppedImageUrl) {
      revokeIfObjectUrl(croppedImageUrl)
    }
    setOriginalImageUrl(null)
    setSelectedImageUrl(null)
    setCroppedImageUrl(null)
    setCroppedImageBlob(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsCropDialogOpen(false)
    setIsProcessingImage(false)
    setExistingPreviewImageId(null)
  }, [croppedImageUrl, originalImageUrl, selectedImageUrl])

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('createArticle.unsupportedFile'),
        description: t('createArticle.unsupportedFileDescription'),
        variant: 'destructive',
      })
      return
    }

    // Валидация размера файла (2 МБ)
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: t('createArticle.fileTooLarge') || 'File too large',
        description: t('createArticle.fileTooLargeDescription') || `Maximum file size is 2 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    resetPreviewImage()

    const url = URL.createObjectURL(file)
    setOriginalImageUrl(url)
    setSelectedImageUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropDialogOpen(true)
    userHasEditedRef.current = true
    event.target.value = ''
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirmCrop = useCallback(async () => {
    const sourceUrl = selectedImageUrl ?? originalImageUrl
    if (!sourceUrl || !croppedAreaPixels) {
      return
    }

    try {
      setIsProcessingImage(true)
      const blob = await createCroppedImageBlob(sourceUrl, croppedAreaPixels)
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl)
      }
      const objectUrl = URL.createObjectURL(blob)
      setCroppedImageBlob(blob)
      setCroppedImageUrl(objectUrl)
      setIsCropDialogOpen(false)
      setSelectedImageUrl(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      logger.error('Failed to crop image', error)
      toast({
        title: t('createArticle.imageProcessingFailed'),
        description: t('createArticle.imageProcessingFailedDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsProcessingImage(false)
    }
  }, [croppedAreaPixels, croppedImageUrl, originalImageUrl, selectedImageUrl, toast])

  const handleCancelCrop = useCallback(() => {
    setIsCropDialogOpen(false)
    setIsProcessingImage(false)
    if (!croppedImageUrl && originalImageUrl) {
      if (originalImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalImageUrl)
      }
      setOriginalImageUrl(null)
      setCroppedImageBlob(null)
    }
    if (selectedImageUrl && selectedImageUrl !== originalImageUrl) {
      if (selectedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
    setSelectedImageUrl(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (!croppedImageBlob && !croppedImageUrl && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [croppedImageBlob, croppedImageUrl, originalImageUrl, selectedImageUrl])

  const handleAdjustCrop = useCallback(() => {
    if (!originalImageUrl) return
    setSelectedImageUrl(originalImageUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropDialogOpen(true)
  }, [originalImageUrl])

  useEffect(() => {
    if (!draftIdFromQuery) {
      loadedDraftIdRef.current = null
      return
    }

    // Если этот черновик уже загружен, не загружаем снова
    if (loadedDraftIdRef.current === draftIdFromQuery) {
      logger.debug('[CreateArticlePage] Draft already loaded, skipping:', { draftId: draftIdFromQuery })
      return
    }

    let cancelled = false

    const loadDraft = async () => {
      setIsLoadingDraft(true)
      try {
        logger.debug('[CreateArticlePage] Loading draft from database:', { draftId: draftIdFromQuery })
        const draft = await getDraft(draftIdFromQuery)
        if (cancelled || !draft) {
          logger.warn('[CreateArticlePage] Draft not found or cancelled:', { draftId: draftIdFromQuery, draft })
          return
        }

        logger.debug('[CreateArticlePage] Draft loaded successfully, populating fields:', { 
          draftId: draft.id,
          hasTitle: !!draft.title,
          hasContent: !!draft.content,
          hasContentJSON: !!draft.contentJSON
        })

        loadedDraftIdRef.current = draftIdFromQuery
        setDraftId(draft.id)
        setTitle(draft.title ?? '')
        
        // Используем contentJSON если есть, иначе конвертируем HTML
        if (draft.contentJSON) {
          logger.debug('[CreateArticlePage] Using contentJSON for editor initialization', {
            hasType: !!draft.contentJSON.type,
            type: draft.contentJSON.type,
            isArray: Array.isArray(draft.contentJSON),
            hasDocument: !!(draft.contentJSON.document || draft.contentJSON.document)
          })
          
          // Преобразуем contentJSON в формат TipTap (type: 'doc'), если он не в правильном формате
          let tipTapContentJSON = draft.contentJSON
          
          // Если это уже формат TipTap (type: 'doc'), используем как есть
          if (tipTapContentJSON.type === 'doc' && Array.isArray(tipTapContentJSON.content)) {
            // Уже правильный формат
          } else {
            // Нужно преобразовать в формат TipTap
            try {
              const { slateToProseMirror } = await import('@/lib/slate-to-prosemirror')
              tipTapContentJSON = slateToProseMirror(draft.contentJSON)
              logger.debug('[CreateArticlePage] Converted contentJSON to TipTap format')
            } catch (e) {
              logger.warn('[CreateArticlePage] Failed to convert contentJSON to TipTap format:', e)
              // Если не удалось преобразовать, пробуем использовать как есть
            }
          }
          
          setContentJSON(tipTapContentJSON)
          // Конвертируем в HTML для отображения
          const { slateToHtml } = await import('@/lib/slate-to-html')
          const html = slateToHtml(draft.contentJSON)
          setContent(html)
        } else if (draft.content) {
          logger.debug('[CreateArticlePage] Converting content to normalized format')
          const normalized = normalizeRichText(draft.content)
          setContent(normalized)
          // Устанавливаем contentJSON как null, редактор будет использовать HTML напрямую
          setContentJSON(null)
        } else {
          logger.debug('[CreateArticlePage] No content found, clearing fields')
          setContent('')
          setContentJSON(null)
        }
        
        setExcerpt(draft.excerpt ?? '')
        setTags(draft.tags ?? [])
        const nextDifficulty =
          draft.difficulty && ['beginner', 'intermediate', 'advanced'].includes(draft.difficulty)
            ? (draft.difficulty as typeof difficulty)
            : 'intermediate'
        setDifficulty(nextDifficulty)
        setExistingPreviewImageId(draft.previewImage || null)
        setOriginalImageUrl(null)
        setSelectedImageUrl(null)
        setCroppedImageBlob(null)
        setCroppedAreaPixels(null)
        if (draft.previewImage) {
          setCroppedImageUrl(draft.previewImage)
          croppedImageUrlRef.current = draft.previewImage
        }
        
        logger.debug('[CreateArticlePage] Draft fields populated successfully')
      } catch (error) {
        logger.error('[CreateArticlePage] Failed to load draft:', error)
        if (!cancelled) {
          toast({
            title: t('createArticle.unableToLoadDraft'),
            description: t('createArticle.unableToLoadDraftDescription'),
            variant: 'destructive',
          })
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDraft(false)
        }
      }
    }

    void loadDraft()

    return () => {
      cancelled = true
    }
  }, [draftIdFromQuery, toast, t])

  // Сброс draftId при создании новой статьи (без параметров draft/edit)
  useEffect(() => {
    const hasDraftParam = Boolean(draftIdFromQuery)
    const hasEditParam = Boolean(editArticleIdRef.current || articleToEdit?.id)
    const hasRecoverParam = searchParams.get('recover') === 'true'
    
    // Если нет параметров draft/edit и нет параметра recover, сбрасываем draftId для новой статьи
    if (!hasDraftParam && !hasEditParam && !hasRecoverParam) {
      // Сбрасываем draftId только если он был установлен (не null)
      if (draftId !== null) {
        logger.debug('[CreateArticlePage] Resetting draftId for new article')
        setDraftId(null)
      }
    }
  }, [draftIdFromQuery, searchParams, draftId])

  // Восстановление данных из localStorage при загрузке страницы
  useEffect(() => {
    // Не восстанавливаем, если уже загружается черновик из БД
    if (isLoadingDraft || draftIdFromQuery) {
      return
    }

    // Проверяем, не были ли данные удалены пользователем
    const wasDeleted = sessionStorage.getItem('draft_deleted') === 'true'
    if (wasDeleted) {
      // Удаляем флаг, чтобы он не влиял на будущие заходы
      sessionStorage.removeItem('draft_deleted')
      // Очищаем localStorage на всякий случай
      try {
        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
        draftKeys.forEach(key => localStorage.removeItem(key))
        logger.debug('[CreateArticlePage] Skipping restoration - draft was deleted by user')
      } catch (e) {
        logger.warn('[CreateArticlePage] Failed to clear localStorage after deletion flag:', e)
      }
      return
    }

    // Пытаемся восстановить из localStorage
    try {
      // Проверяем все возможные ключи черновиков
      const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'))
      
      if (localStorageKeys.length === 0) {
        return
      }

      // Берем самый свежий черновик
      let latestDraft: any = null
      let latestTime = 0

      for (const key of localStorageKeys) {
        try {
          const data = localStorage.getItem(key)
          if (!data) continue

          const parsed = JSON.parse(data)
          if (parsed.savedAt) {
            const savedTime = new Date(parsed.savedAt).getTime()
            if (savedTime > latestTime) {
              latestTime = savedTime
              latestDraft = parsed
            }
          }
        } catch (error) {
          logger.warn('[CreateArticlePage] Failed to parse localStorage draft:', { key, error })
        }
      }

      if (!latestDraft) {
        return
      }

      // Восстанавливаем данные только если:
      // 1. Страница не редактирует существующую статью
      // 2. НЕТ параметра recover (если recover=true, значит мы пришли из панели восстановления и localStorage уже очищен)
      // 3. Есть данные для восстановления
      const hasRecoverParam = searchParams.get('recover') === 'true'
      const isCurrentlyEditing = Boolean(editArticleIdRef.current || articleToEdit?.id)
      
      // НЕ восстанавливаем если есть параметр recover - это значит localStorage уже очищен
      if (!isCurrentlyEditing && !hasRecoverParam && latestDraft) {
        logger.debug('[CreateArticlePage] Restoring draft from localStorage:', { draftId: latestDraft.draftId })
        
        if (latestDraft.title) setTitle(latestDraft.title)
        if (latestDraft.excerpt) setExcerpt(latestDraft.excerpt)
        if (latestDraft.tags && Array.isArray(latestDraft.tags)) setTags(latestDraft.tags)
        if (latestDraft.difficulty) setDifficulty(latestDraft.difficulty)
        if (latestDraft.previewImage) {
          setExistingPreviewImageId(latestDraft.previewImage)
          setCroppedImageUrl(latestDraft.previewImage)
        }
        
        // Восстанавливаем контент
        if (latestDraft.contentHTML) {
          setContent(latestDraft.contentHTML)
        }
        if (latestDraft.contentJSON) {
          setContentJSON(latestDraft.contentJSON)
        }
        
        // НЕ восстанавливаем draftId при восстановлении из localStorage для новой статьи
        // draftId должен быть null для новой статьи, чтобы использовался ключ draft_new
        // setDraftId(latestDraft.draftId) - убрано, чтобы всегда использовался draft_new
      }
    } catch (error) {
      logger.warn('[CreateArticlePage] Failed to restore from localStorage:', error)
    }
  }, [searchParams]) // Запускаем при монтировании и при изменении searchParams (для параметра recover)

  useEffect(() => {
    originalImageUrlRef.current = originalImageUrl
  }, [originalImageUrl])

  useEffect(() => {
    selectedImageUrlRef.current = selectedImageUrl
  }, [selectedImageUrl])

  useEffect(() => {
    croppedImageUrlRef.current = croppedImageUrl
  }, [croppedImageUrl])

  // Функция для сохранения в localStorage (используется в beforeunload и при размонтировании)
  const saveToLocalStorage = useCallback(() => {
    try {
      // Получаем актуальные значения из state
      const currentTitle = title
      const currentContent = content
      const currentExcerpt = excerpt
      const currentTags = tags
      const currentDifficulty = difficulty
      const currentDraftId = draftId
      
      // Получаем JSON из редактора, если он доступен
      let currentContentJSON = contentJSON
      if (editorRef.current) {
        try {
          currentContentJSON = editorRef.current.getJSON()
        } catch (e) {
          logger.warn('[CreateArticlePage] Failed to get JSON from editor:', e)
        }
      }
      
      const hasContent = currentTitle.trim() || currentContent.trim() || currentExcerpt.trim()
      if (!hasContent) {
        return
      }

      const previewImage = resolvePreviewUrl()
      
      const draftData = {
        title: currentTitle,
        excerpt: currentExcerpt,
        tags: currentTags,
        difficulty: currentDifficulty,
        previewImage: previewImage || undefined,
        contentHTML: currentContent,
        contentJSON: currentContentJSON,
        draftId: currentDraftId,
        savedAt: new Date().toISOString(),
      }
      
      const localStorageKey = `draft_${currentDraftId || 'new'}`
      localStorage.setItem(localStorageKey, JSON.stringify(draftData))
      logger.debug('[CreateArticlePage] Saved draft to localStorage:', { key: localStorageKey, hasContent: true })
    } catch (error) {
      logger.warn('[CreateArticlePage] Failed to save draft to localStorage:', error)
    }
  }, [title, content, excerpt, tags, difficulty, draftId, contentJSON, resolvePreviewUrl])

  // Отслеживание навигации и сохранение перед выходом со страницы
  useEffect(() => {
    // Если мы покидаем страницу /create, сохраняем данные
    if (prevLocationRef.current === '/create' && location.pathname !== '/create') {
      logger.debug('[CreateArticlePage] Navigating away from /create, saving draft')
      saveToLocalStorage()
      // Небольшая задержка для гарантии сохранения
      setTimeout(() => {
        // Триггерим кастомное событие для DraftRecoveryProvider
        // (StorageEvent не срабатывает в той же вкладке)
        window.dispatchEvent(new CustomEvent('draft-saved'))
        logger.debug('[CreateArticlePage] Dispatched draft-saved event')
      }, 50)
    }
    prevLocationRef.current = location.pathname
  }, [location.pathname, saveToLocalStorage, draftId])

  // Автосохранение перед закрытием страницы и при потере фокуса
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Синхронное сохранение перед закрытием
      saveToLocalStorage()
    }

    const handleVisibilityChange = () => {
      // Сохраняем при скрытии страницы (переключение вкладок, минимизация и т.д.)
      if (document.hidden) {
        saveToLocalStorage()
      }
    }

    const handlePageHide = () => {
      // Сохраняем при скрытии страницы (навигация, закрытие вкладки)
      saveToLocalStorage()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [saveToLocalStorage])

  // Автосохранение в localStorage при изменении контента (debounced)
  // Это гарантирует, что данные будут сохранены ДО перехода на другую страницу
  useEffect(() => {
    // Не сохраняем, если нет контента
    const hasContent = title.trim() || content.trim() || excerpt.trim()
    if (!hasContent) return

    // Debounce: сохраняем через 300ms после последнего изменения (быстрее для надёжности)
    const timeoutId = setTimeout(() => {
      saveToLocalStorage()
      logger.debug('[CreateArticlePage] Auto-saved to localStorage on content change')
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [title, content, excerpt, tags, difficulty, contentJSON, saveToLocalStorage])

  // Сохранение при любом клике на странице (перед навигацией)
  // Это гарантирует, что данные сохранятся ДО перехода на другую страницу
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Проверяем, что клик был на ссылке или кнопке навигации
      const isNavigationClick = target.closest('a[href]') || 
                                 target.closest('button[type="button"]') ||
                                 target.closest('[role="link"]')
      if (isNavigationClick) {
        // Немедленно сохраняем в localStorage
        const hasContent = title.trim() || content.trim() || excerpt.trim()
        if (hasContent) {
          saveToLocalStorage()
          // Устанавливаем флаг pending recovery
          const localStorageKey = `draft_${draftId || 'new'}`
          localStorage.setItem('draft_pending_recovery', JSON.stringify({
            key: localStorageKey,
            timestamp: Date.now()
          }))
          // Отправляем событие для DraftRecoveryProvider
          window.dispatchEvent(new CustomEvent('draft-saved'))
          logger.debug('[CreateArticlePage] Saved to localStorage on navigation click')
        }
      }
    }

    // Используем capture phase чтобы обработать событие ДО навигации
    document.addEventListener('click', handleClick, { capture: true })
    
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [title, content, excerpt, saveToLocalStorage])

  // Сохранение при размонтировании компонента (выход со страницы)
  // ВАЖНО: Этот useEffect должен быть последним, чтобы сохранить все актуальные данные
  useEffect(() => {
    return () => {
      // Устанавливаем флаг размонтирования, чтобы предотвратить создание новых черновиков
      isUnmountingRef.current = true

      // После успешной публикации — только очищаем localStorage, не пишем черновик
      if (publishedSuccessfullyRef.current) {
        try {
          Object.keys(localStorage).filter(k => k.startsWith('draft_')).forEach(k => localStorage.removeItem(k))
          localStorage.removeItem('draft_pending_recovery')
          logger.debug('[CreateArticlePage] Cleared draft localStorage on unmount (published successfully)')
        } catch (e) {
          logger.warn('[CreateArticlePage] Failed to clear localStorage on unmount after publish', e)
        }
        return
      }
      
      // Получаем актуальные значения напрямую из refs и state для надежного сохранения
      try {
        const currentTitle = title
        const currentContent = content
        const currentExcerpt = excerpt
        const currentTags = tags
        const currentDifficulty = difficulty
        const currentDraftId = draftId
        
        // Получаем JSON из редактора
        let currentContentJSON = contentJSON
        if (editorRef.current) {
          try {
            currentContentJSON = editorRef.current.getJSON()
          } catch (e) {
            // Игнорируем ошибки при размонтировании
          }
        }
        
        const hasContent = currentTitle.trim() || currentContent.trim() || currentExcerpt.trim()
        if (hasContent) {
          const previewImage = resolvePreviewUrl()
          const localStorageKey = `draft_${currentDraftId || 'new'}`
          const draftData = {
            title: currentTitle,
            excerpt: currentExcerpt,
            tags: currentTags,
            difficulty: currentDifficulty,
            previewImage: previewImage || undefined,
            contentHTML: currentContent,
            contentJSON: currentContentJSON,
            draftId: currentDraftId,
            savedAt: new Date().toISOString(),
          }
          // Синхронное сохранение в localStorage для надежности
          localStorage.setItem(localStorageKey, JSON.stringify(draftData))
          
          // Также устанавливаем флаг, что есть несохранённый черновик
          // DraftRecoveryProvider будет проверять этот флаг
          localStorage.setItem('draft_pending_recovery', JSON.stringify({
            key: localStorageKey,
            timestamp: Date.now()
          }))
          
          logger.debug('[CreateArticlePage] Saved draft to localStorage on unmount:', { 
            key: localStorageKey, 
            hasContent: true,
            pathname: window.location.pathname
          })
          
          // Отправляем событие draft-saved СИНХРОННО для DraftRecoveryProvider
          window.dispatchEvent(new CustomEvent('draft-saved'))
          logger.debug('[CreateArticlePage] Dispatched draft-saved event on unmount (sync)')
          
          // Дублируем через setTimeout для надежности
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('draft-saved'))
          }, 50)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('draft-saved'))
          }, 150)
        }
      } catch (error) {
        logger.warn('[CreateArticlePage] Failed to save draft to localStorage on unmount:', error)
      }
      
      // Также пытаемся сохранить на бэкенд асинхронно (не блокируем размонтирование)
      // ВАЖНО: Используем ТОЛЬКО updateDraft, НЕ createDraft, чтобы не создавать дубликаты
      if (user && draftId) {
        // Используем navigator.sendBeacon или fetch с keepalive для надежного сохранения
        try {
          // Получаем актуальные значения из refs (они могут быть более актуальными)
          const currentTitle = title
          const currentContent = content
          const currentExcerpt = excerpt
          const currentTags = tags
          const currentDifficulty = difficulty
          
          // Получаем JSON из редактора
          let currentContentJSON = contentJSON
          if (editorRef.current) {
            try {
              currentContentJSON = editorRef.current.getJSON()
            } catch (e) {
              // Игнорируем ошибки при размонтировании
            }
          }
          
          const hasContent = currentTitle.trim() || currentContent.trim() || currentExcerpt.trim()
          if (!hasContent) {
            return
          }

          // Создаем contentDocument
          let contentDocument: any[] = []
          if (currentContentJSON && currentContentJSON.type === 'doc' && Array.isArray(currentContentJSON.content)) {
            contentDocument = currentContentJSON.content
          } else if (Array.isArray(currentContentJSON)) {
            contentDocument = currentContentJSON
          } else if (currentContent) {
            const plainText = getPlainTextFromHtml(currentContent)
            contentDocument = [
              {
                type: 'paragraph',
                children: [{ text: plainText || '' }],
              },
            ]
          }

          if (!Array.isArray(contentDocument) || contentDocument.length === 0) {
            contentDocument = [
              {
                type: 'paragraph',
                children: [{ text: '' }],
              },
            ]
          }

          const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
            const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
              beginner: 'easy',
              intermediate: 'medium',
              advanced: 'hard',
            };
            return mapping[diff] || 'medium';
          };

          const draftTitle = currentTitle.trim() || t('createArticle.untitledDraft');
          const finalDraftTitle = draftTitle.length < 10 ? draftTitle.padEnd(10, ' ') : draftTitle;

          const draftData: any = {
            title: finalDraftTitle,
            content: contentDocument,
            excerpt: currentExcerpt.trim() || ' ',
            tags: currentTags,
            difficulty: mapDifficultyToBackend(currentDifficulty),
          }

          const previewImage = resolvePreviewUrl()
          if (previewImage) {
            draftData.previewImage = previewImage
            draftData.preview_image = previewImage
            draftData.cover_url = previewImage
          }

          // Пытаемся сохранить на бэкенд (не блокируем размонтирование)
          // ВАЖНО: Используем ТОЛЬКО updateDraft, НЕ createDraft, чтобы не создавать дубликаты
          // Используем setTimeout чтобы не блокировать размонтирование
          setTimeout(() => {
            updateDraft(draftId, draftData).catch((error) => {
              // НЕ создаем новый черновик при ошибке - просто логируем
              // Это предотвращает создание множественных копий
              logger.warn('[CreateArticlePage] Failed to save draft on unmount:', error)
            })
          }, 0)
        } catch (error) {
          logger.warn('[CreateArticlePage] Error preparing draft save on unmount:', error)
        }
      }
    }
  }, [user, draftId, title, content, excerpt, tags, difficulty, contentJSON, saveToLocalStorage, resolvePreviewUrl, t])

  useEffect(() => {
    return () => {
      const originalUrl = originalImageUrlRef.current
      const selectedUrl = selectedImageUrlRef.current
      const croppedUrl = croppedImageUrlRef.current

      if (selectedUrl && selectedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedUrl)
      }
      if (originalUrl && originalUrl !== selectedUrl && originalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalUrl)
      }
      if (
        croppedUrl &&
        croppedUrl !== originalUrl &&
        croppedUrl !== selectedUrl &&
        croppedUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(croppedUrl)
      }
    }
  }, [])

  const handlePublish = async () => {
    logger.debug('[CreateArticlePage] handlePublish called')
    
    const currentUser = useAuthStore.getState().user

    if (!currentUser) {
      logger.warn('[CreateArticlePage] Publish attempted without user')
      toast({
        title: t('createArticle.authRequired'),
        description: t('createArticle.authRequiredToPublish'),
        variant: 'destructive',
      })
      navigate('/auth')
      return
    }

    const hasTitle = Boolean(title.trim())
    const plainText = getPlainTextFromHtml(content)
    const hasBody = plainText.length > 0
    const hasExcerpt = Boolean(excerpt.trim())

    logger.debug('[CreateArticlePage] Validation check:', {
      hasTitle,
      hasBody,
      hasExcerpt,
      titleLength: title.trim().length,
      contentLength: plainText.length,
      excerptLength: excerpt.trim().length,
    })

    if (!hasTitle) {
      logger.warn('[CreateArticlePage] Validation failed: missing title')
      toast({
        title: t('createArticle.titleRequired') || 'Title required',
        description: t('createArticle.titleRequiredDescription') || 'Please add a title for your article',
        variant: 'destructive',
      })
      return
    }

    if (!hasBody) {
      logger.warn('[CreateArticlePage] Validation failed: missing content')
      toast({
        title: t('createArticle.contentRequired') || 'Content required',
        description: t('createArticle.contentRequiredDescription') || 'Please add content to your article',
        variant: 'destructive',
      })
      return
    }

    if (!hasExcerpt) {
      logger.warn('[CreateArticlePage] Validation failed: missing excerpt')
      toast({
        title: t('createArticle.excerptRequired') || 'Excerpt required',
        description: t('createArticle.excerptRequiredDescription') || 'Please add a description for your article',
        variant: 'destructive',
      })
      return
    }

    logger.debug('[CreateArticlePage] Starting publish process')
    setIsPublishing(true)

    try {
      logger.debug('[CreateArticlePage] Step 1: Uploading preview image...')
      let previewImageUrl: string | null = null

      try {
        previewImageUrl = await uploadPreviewImageAsset()
        logger.debug('[CreateArticlePage] Preview image uploaded:', { url: previewImageUrl })
      } catch (error) {
        logger.error('[CreateArticlePage] Preview upload failed, using existing or continuing without:', error)
        // Используем existingPreviewImageId если есть, иначе продолжаем без изображения
        previewImageUrl = resolvePreviewUrl()
        if (!previewImageUrl) {
        toast({
            title: t('createArticle.imageUploadFailed'),
            description: t('createArticle.imageUploadFailedPublishDescription'),
            variant: 'destructive',
          })
          // НЕ прерываем публикацию - продолжаем без изображения
        } else {
          logger.debug('[CreateArticlePage] Using existing preview image:', { url: previewImageUrl })
        }
      }

      // Получаем JSON из TipTap editor для отправки в GraphQL
      logger.debug('[CreateArticlePage] Step 2: Getting JSON from editor...')
      
      // Пытаемся получить JSON из редактора (если он смонтирован)
      let editorJSON: any = null
      if (editorRef.current) {
        try {
          editorJSON = editorRef.current.getJSON()
          logger.debug('[CreateArticlePage] Got JSON from editor ref')
          
          // Проверяем наличие blockId в узлах
          if (import.meta.env.DEV && editorJSON && editorJSON.content) {
            const nodesWithBlockId = editorJSON.content.filter((node: any) => 
              node.attrs && node.attrs.blockId
            )
            if (nodesWithBlockId.length > 0) {
              logger.debug('[CreateArticlePage] Nodes with blockId found:', nodesWithBlockId.map((n: any) => ({
                type: n.type,
                blockId: n.attrs.blockId,
              })))
            } else {
              logger.warn('[CreateArticlePage] No nodes with blockId found in editor JSON')
            }
          }
        } catch (error) {
          logger.warn('[CreateArticlePage] Failed to get JSON from editor ref:', error)
        }
      }
      
      // Используем сохраненный JSON из состояния, если редактор размонтирован
      const finalContentJSON = editorJSON || contentJSON
      
      // Проверяем наличие изображений в JSON
      const findImagesInJSON = (json: any): any[] => {
        const images: any[] = []
        if (!json || typeof json !== 'object') return images
        
        if (json.type === 'image') {
          images.push(json)
        }
        
        if (Array.isArray(json.content)) {
          json.content.forEach((node: any) => {
            images.push(...findImagesInJSON(node))
          })
        }
        
        return images
      }
      
      const imagesInJSON = findImagesInJSON(finalContentJSON)
      
      logger.debug('[CreateArticlePage] Editor JSON check:', {
        hasRef: !!editorRef.current,
        hasEditorJSON: !!editorJSON,
        hasSavedJSON: !!contentJSON,
        usingSavedJSON: !editorJSON && !!contentJSON,
        type: finalContentJSON?.type,
        hasContentArray: Array.isArray(finalContentJSON?.content),
        contentLength: Array.isArray(finalContentJSON?.content) ? finalContentJSON.content.length : 'not array',
        imagesCount: imagesInJSON.length,
        images: imagesInJSON.map(img => ({
          src: img.attrs?.src?.substring(0, 80),
          alt: img.attrs?.alt,
        })),
      })
      
      if (!finalContentJSON) {
        logger.error('[CreateArticlePage] No content JSON available - editor not initialized and no saved JSON')
        toast({
          title: t('createArticle.editorNotReady'),
          description: t('createArticle.editorNotReadyDescription'),
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }

      // Проверяем и нормализуем формат ProseMirror документа
      // KeystoneJS возвращает { document: [...] }, а TipTap ожидает { type: "doc", content: [...] }
      let normalizedContentJSON = finalContentJSON;
      if (finalContentJSON && typeof finalContentJSON === 'object') {
        // Если это формат KeystoneJS { document: [...] }
        if (finalContentJSON.document && Array.isArray(finalContentJSON.document) && !finalContentJSON.type) {
          normalizedContentJSON = {
            type: 'doc',
            content: finalContentJSON.document,
          };
          logger.debug('[CreateArticlePage] Normalized content from KeystoneJS format to TipTap format');
        }
        // Если это уже массив (старый формат)
        else if (Array.isArray(finalContentJSON) && !('type' in finalContentJSON)) {
          normalizedContentJSON = {
            type: 'doc',
            content: finalContentJSON,
          };
          logger.debug('[CreateArticlePage] Normalized content from array format to TipTap format');
        }
      }

      // Проверяем, что это валидный ProseMirror документ
      if (!normalizedContentJSON || normalizedContentJSON.type !== 'doc') {
        logger.error('[CreateArticlePage] Invalid ProseMirror document:', {
          type: normalizedContentJSON?.type,
          contentJSON: normalizedContentJSON,
          originalContentJSON: finalContentJSON,
        })
        toast({
          title: t('createArticle.invalidContentFormat'),
          description: t('createArticle.invalidContentFormatDescription'),
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }
      
      // Используем нормализованный формат
      const finalContent = normalizedContentJSON;
      
      // Проверяем, что есть контент (не пустой документ)
      const hasContent = finalContent.content && Array.isArray(finalContent.content) && finalContent.content.length > 0
      if (!hasContent) {
        logger.error('[CreateArticlePage] Editor content is empty')
        toast({
          title: t('createArticle.missingInformation'),
          description: t('createArticle.contentRequired'),
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }

      // KeystoneJS использует Slate формат (children), TipTap использует ProseMirror (content)
      // Нужно преобразовать ProseMirror → Slate
      // Функция преобразования ProseMirror узла в Slate узел
      const convertProseMirrorToSlate = (node: any): any => {
        if (!node || typeof node !== 'object') {
          return null
        }

        // Текстовый узел: { type: "text", text: "..." } → { text: "..." }
        if (node.type === 'text') {
          const result: any = {
            text: node.text || '',
          }
          
          // Обработка форматирования (bold, italic, etc.)
          if (node.marks && node.marks.length > 0) {
            // Копируем только truthy значения (не false)
            const hasBold = node.marks.some((m: any) => m.type === 'bold')
            const hasItalic = node.marks.some((m: any) => m.type === 'italic')
            const hasCode = node.marks.some((m: any) => m.type === 'code')
            
            if (hasBold) result.bold = true
            if (hasItalic) result.italic = true
            if (hasCode) result.code = true
            
            // Обрабатываем ссылки (включая якорные ссылки href="#anchor-id")
            // KeystoneJS не поддерживает url в текстовых узлах напрямую
            // Для якорных ссылок (href="#...") сохраняем href в тексте через маркер
            // Для внешних ссылок можно было бы создать отдельный link узел,
            // но для простоты сохраняем href в тексте через маркер
            const linkMark = node.marks.find((m: any) => m.type === 'link')
            if (linkMark && linkMark.attrs && linkMark.attrs.href) {
              const href = linkMark.attrs.href
              // Для якорных ссылок сохраняем href в тексте через маркер
              // Формат: \u200B\u200B\u200B[LINK:href]\u200B\u200B\u200B
              if (href.startsWith('#')) {
                const linkMarker = `\u200B\u200B\u200B[LINK:${href}]\u200B\u200B\u200B`
                result.text = linkMarker + (result.text || '')
              } else {
                // Для внешних ссылок также сохраняем через маркер
                const linkMarker = `\u200B\u200B\u200B[LINK:${href}]\u200B\u200B\u200B`
                result.text = linkMarker + (result.text || '')
              }
            }
          }
          
          return result
        }

        // Специальная обработка для listItem
        // TipTap listItem содержит content с paragraph, но KeystoneJS Slate ожидает list-item с прямыми children
        if (node.type === 'listItem' && Array.isArray(node.content)) {
          if (import.meta.env.DEV) {
            logger.debug('[convertProseMirrorToSlate] Processing listItem:', {
              contentLength: node.content.length,
              content: JSON.stringify(node.content).substring(0, 300),
            });
          }
          
          // Преобразуем content listItem в children
          // listItem в TipTap обычно содержит paragraph, который нужно "развернуть"
          const convertedChildren = node.content
            .map(convertProseMirrorToSlate)
            .filter((child: any) => child !== null)
          
          if (import.meta.env.DEV) {
            logger.debug('[convertProseMirrorToSlate] Converted listItem children:', {
              count: convertedChildren.length,
              children: JSON.stringify(convertedChildren).substring(0, 300),
            });
          }
          
          // Если внутри listItem есть paragraph, извлекаем его children
          // KeystoneJS Slate ожидает: { type: 'list-item', children: [{ text: '...' }] }
          // или { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: '...' }] }] }
          let finalChildren = convertedChildren
          
          // Если все children - это paragraph, можно оставить как есть или развернуть
          // KeystoneJS поддерживает оба варианта, но лучше оставить paragraph для совместимости
          
          const result: any = {
            type: 'list-item',
            children: finalChildren.length > 0 ? finalChildren : [{ text: '' }],
          };
          
          // Сохраняем blockId для anchor блоков (BlockAnchor extension)
          if (node.attrs && node.attrs.blockId) {
            result.blockId = node.attrs.blockId
          }
          
          if (import.meta.env.DEV) {
            logger.debug('[convertProseMirrorToSlate] Final listItem result:', {
              result: JSON.stringify(result).substring(0, 300),
            });
          }
          
          return result;
        }

        // Обработка изображений: { type: "image", attrs: { src: "...", alt: "..." } } → Slate формат
        if (node.type === 'image' && node.attrs) {
          const result: any = {
            type: 'image',
            url: node.attrs.src || '',
            alt: node.attrs.alt || '',
          }
          
          // Сохраняем blockId если есть
          if (node.attrs.blockId) {
            result.blockId = node.attrs.blockId
          }
          
          if (import.meta.env.DEV) {
            logger.debug('[convertProseMirrorToSlate] Converting image:', {
              src: node.attrs.src?.substring(0, 100),
              alt: node.attrs.alt,
            })
          }
          
          return result
        }

        // Обработка callout - конвертируем в blockquote с сохранением variant
        // KeystoneJS не поддерживает кастомный тип 'callout', поэтому используем blockquote
        // Сохраняем variant в первом дочернем элементе для надежности
        if (node.type === 'callout' && Array.isArray(node.content)) {
          const calloutChildren = node.content
            .map(convertProseMirrorToSlate)
            .filter((child: any) => child !== null)
          
          // Если нет children, создаем пустой paragraph
          const finalChildren = calloutChildren.length > 0 
            ? calloutChildren 
            : [{ type: 'paragraph', children: [{ text: '' }] }]
          
          // Сохраняем variant через маркер в тексте первого paragraph
          // KeystoneJS не принимает кастомные поля, поэтому используем маркер в тексте
          if (node.attrs && node.attrs.variant && finalChildren.length > 0) {
            const firstChild = finalChildren[0]
            if (firstChild && firstChild.type === 'paragraph' && firstChild.children && firstChild.children.length > 0) {
              // Добавляем невидимый маркер в начало первого текстового узла
              // Формат: \u200B\u200B\u200B[CALLOUT:variant]\u200B\u200B\u200B
              const marker = `\u200B\u200B\u200B[CALLOUT:${node.attrs.variant}]\u200B\u200B\u200B`
              const firstTextNode = firstChild.children[0]
              if (firstTextNode && typeof firstTextNode === 'object' && firstTextNode.text !== undefined) {
                // Добавляем маркер в начало текста
                firstTextNode.text = marker + (firstTextNode.text || '')
              } else {
                // Если нет текстового узла, создаем его
                firstChild.children.unshift({ text: marker })
              }
            }
          }
          
          const result: any = {
            type: 'blockquote',
            children: finalChildren,
          }
          
          // Сохраняем blockId для anchor блоков (BlockAnchor extension)
          if (node.attrs && node.attrs.blockId) {
            result.blockId = node.attrs.blockId
          }
          
          // НЕ сохраняем variant в самом blockquote, так как KeystoneJS не примет его
          // Variant сохранен через маркер в тексте первого paragraph
          // Это будет восстановлено при рендеринге в slate-to-html.ts
          
          return result
        }

        // Обработка columns - конвертируем в layout
        if (node.type === 'columns' && Array.isArray(node.content)) {
          const columns = node.content || []
          const columnCount = columns.length
          
          // Определяем layout на основе количества колонок
          let layout: number[] = [1, 1]
          if (columnCount === 3) {
            layout = [1, 1, 1]
          } else if (columnCount > 3) {
            layout = [1, 1, 1]
            columns.splice(3)
          }
          
          // Конвертируем каждую колонку в layout-area
          const layoutAreas = columns.map((column: any) => {
            const columnContent = column.content || []
            const convertedChildren = columnContent
              .map(convertProseMirrorToSlate)
              .filter((child: any) => child !== null)
            
            return {
              type: 'layout-area',
              children: convertedChildren.length > 0 ? convertedChildren : [{ type: 'paragraph', children: [{ text: '' }] }],
            }
          })
          
          return {
            type: 'layout',
            layout: layout,
            children: layoutAreas,
          }
        }

        // Блоки: { type: "paragraph", content: [...] } → { type: "paragraph", children: [...] }
        if (node.type && Array.isArray(node.content)) {
          const children = node.content
            .map(convertProseMirrorToSlate)
            .filter((child: any) => child !== null)

          // Преобразуем типы блоков TipTap в типы KeystoneJS Slate
          // KeystoneJS поддерживает: 'paragraph', 'heading', 'blockquote', 'code', 'divider', 'list-item', 'ordered-list', 'unordered-list', 'layout', 'layout-area'
          let slateType = node.type
          const typeMapping: Record<string, string> = {
            'orderedList': 'ordered-list',
            'bulletList': 'unordered-list', // Важно: bulletList → unordered-list (не bulleted-list!)
            'codeBlock': 'code', // Важно: codeBlock → code (не code-block!)
            // TipTap использует те же названия для базовых блоков
            'paragraph': 'paragraph',
            'heading': 'heading',
            'blockquote': 'blockquote',
            'horizontalRule': 'divider',
          }
          if (typeMapping[node.type]) {
            slateType = typeMapping[node.type]
          }

          // ВАЖНО: Для параграфов, если есть несколько текстовых узлов или hardBreak,
          // разделяем их на отдельные параграфы для правильного сохранения структуры
          if (node.type === 'paragraph') {
            const textNodes = children.filter((child: any) => 
              child && typeof child === 'object' && child.text !== undefined && !child.type
            )
            
            // Если есть несколько текстовых узлов, создаем отдельные параграфы
            if (textNodes.length > 1) {
              const paragraphs: any[] = []
              textNodes.forEach((textNode: any, index: number) => {
                const paragraph: any = {
                  type: 'paragraph',
                  children: [textNode],
                }
                // Добавляем blockId только к первому параграфу
                if (node.attrs?.blockId && index === 0) {
                  paragraph.blockId = node.attrs.blockId
                }
                // Добавляем textAlign ко всем параграфам (если есть)
                if (node.attrs?.textAlign) {
                  paragraph.textAlign = node.attrs.textAlign
                }
                paragraphs.push(paragraph)
              })
              
              // Возвращаем массив параграфов (будет обработан специально в вызывающем коде)
              return paragraphs.length > 0 ? paragraphs : { type: 'paragraph', children: [{ text: '' }] }
            }
            
            // Если есть hardBreak в children, разделяем параграф на несколько
            const hasHardBreak = children.some((child: any) => 
              child && typeof child === 'object' && (child.type === 'hardBreak' || child.type === 'hard_break')
            )
            
            if (hasHardBreak) {
              const paragraphs: any[] = []
              let currentParagraphChildren: any[] = []
              
              children.forEach((child: any) => {
                if (child && typeof child === 'object' && (child.type === 'hardBreak' || child.type === 'hard_break')) {
                  // При встрече hardBreak, завершаем текущий параграф и начинаем новый
                  if (currentParagraphChildren.length > 0) {
                    paragraphs.push({
                      type: 'paragraph',
                      children: currentParagraphChildren,
                      ...(node.attrs?.textAlign && { textAlign: node.attrs.textAlign }),
                    })
                  }
                  currentParagraphChildren = []
                } else {
                  currentParagraphChildren.push(child)
                }
              })
              
              // Добавляем последний параграф
              if (currentParagraphChildren.length > 0) {
                paragraphs.push({
                  type: 'paragraph',
                  children: currentParagraphChildren,
                  ...(node.attrs?.textAlign && { textAlign: node.attrs.textAlign }),
                })
              } else if (paragraphs.length === 0) {
                // Если все было hardBreak, создаем пустой параграф
                paragraphs.push({ type: 'paragraph', children: [{ text: '' }] })
              }
              
              // Добавляем blockId только к первому параграфу
              if (node.attrs?.blockId && paragraphs.length > 0) {
                paragraphs[0].blockId = node.attrs.blockId
              }
              
              return paragraphs.length > 0 ? paragraphs : { type: 'paragraph', children: [{ text: '' }] }
            }
          }

          const result: any = {
            type: slateType,
            children: children.length > 0 ? children : [{ text: '' }],
          }

          // Добавляем дополнительные свойства блока
          if (node.attrs) {
            if (node.type === 'heading' && node.attrs.level) {
              result.level = node.attrs.level
            }
            if (node.attrs.textAlign) {
              result.textAlign = node.attrs.textAlign
            }
            // Сохраняем язык для code blocks (будет сохранен через маркер в тексте)
            // KeystoneJS не поддерживает кастомные поля, поэтому language будет сохранен через маркер
            // if ((node.type === 'codeBlock' || slateType === 'code') && node.attrs.language) {
            //   result.language = node.attrs.language
            // }
            // Сохраняем blockId для anchor блоков (BlockAnchor extension)
            if (node.attrs.blockId) {
              result.blockId = node.attrs.blockId
            }
            // Сохраняем variant для callout (который конвертируется в blockquote)
            // Это обрабатывается выше в специальной обработке callout
          }

          // Для hardBreak создаем пустой paragraph
          if (node.type === 'hardBreak') {
            return {
              type: 'paragraph',
              children: [{ text: '' }],
            }
          }

          return result
        }

        // Если это уже Slate формат (есть children), нормализуем типы
        if (node.type && Array.isArray(node.children)) {
          // Нормализуем типы блоков
          const typeMapping: Record<string, string> = {
            'orderedList': 'ordered-list',
            'bulletList': 'unordered-list', // Важно: bulletList → unordered-list (не bulleted-list!)
            'codeBlock': 'code', // Важно: codeBlock → code (не code-block!)
            'code-block': 'code', // Также нормализуем уже преобразованный тип
            'bulleted-list': 'unordered-list', // Также нормализуем уже преобразованный тип
            'listItem': 'list-item', // Важно: listItem → list-item
          }
          if (typeMapping[node.type]) {
            return {
              ...node,
              type: typeMapping[node.type],
            }
          }
          return node
        }

        return null
      }

      // Преобразуем ProseMirror JSON в Slate формат
      let contentDocument: any[] = []
      if (finalContent && typeof finalContent === 'object') {
        if (finalContent.type === 'doc' && Array.isArray(finalContent.content)) {
          // Извлекаем массив блоков из ProseMirror doc и преобразуем в Slate
          // Важно: разворачиваем массивы параграфов, если convertProseMirrorToSlate вернул массив
          const convertedBlocks: any[] = []
          finalContent.content.forEach((node: any) => {
            const converted = convertProseMirrorToSlate(node)
            if (converted) {
              // Если вернулся массив (несколько параграфов), разворачиваем его
              if (Array.isArray(converted)) {
                convertedBlocks.push(...converted.filter((block: any) => block !== null))
              } else {
                convertedBlocks.push(converted)
              }
            }
          })
          contentDocument = convertedBlocks
          
          logger.debug('[CreateArticlePage] Converted ProseMirror to Slate:', {
            contentLength: contentDocument.length,
            firstBlock: contentDocument[0],
          })
        } else if (Array.isArray(finalContent)) {
          // Уже массив блоков - проверяем формат и преобразуем если нужно
          // Важно: разворачиваем массивы параграфов, если convertProseMirrorToSlate вернул массив
          const convertedBlocks: any[] = []
          finalContent.forEach((node: any) => {
            const converted = convertProseMirrorToSlate(node)
            if (converted) {
              // Если вернулся массив (несколько параграфов), разворачиваем его
              if (Array.isArray(converted)) {
                convertedBlocks.push(...converted.filter((block: any) => block !== null))
              } else {
                convertedBlocks.push(converted)
              }
            }
          })
          contentDocument = convertedBlocks
          
          logger.debug('[CreateArticlePage] Converted array to Slate:', {
            contentLength: contentDocument.length,
          })
        } else {
          // Fallback: создаем пустой параграф
          logger.warn('[CreateArticlePage] Unexpected content format, creating empty paragraph:', finalContent)
          contentDocument = [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ]
        }
      } else {
        // Пустой документ - создаем пустой параграф
        logger.warn('[CreateArticlePage] Empty or invalid content JSON, creating empty paragraph')
        contentDocument = [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]
      }

      // Валидация: убеждаемся, что contentDocument - это массив
      if (!Array.isArray(contentDocument) || contentDocument.length === 0) {
        logger.error('[CreateArticlePage] contentDocument is not a valid array:', contentDocument)
        toast({
          title: t('createArticle.invalidContentFormat'),
          description: t('createArticle.invalidContentFormatDescription'),
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }

      // Фильтруем неподдерживаемые типы блоков (например, columns)
      // KeystoneJS document field поддерживает: 'paragraph', 'heading', 'blockquote', 'code', 'divider', 'list-item', 'ordered-list', 'unordered-list', 'layout', 'layout-area'
      // callout конвертируется в blockquote с сохранением variant
      // image поддерживается и должен быть сохранен
      const supportedTypes = ['paragraph', 'heading', 'blockquote', 'code', 'unordered-list', 'ordered-list', 'list-item', 'divider', 'layout', 'layout-area', 'image']
      
      // Рекурсивная функция для нормализации типов блоков в children
      const normalizeBlockTypes = (block: any): any => {
        if (!block || typeof block !== 'object') {
          return block
        }

        // Нормализуем тип блока
        // KeystoneJS использует: 'code' (не 'code-block'), 'unordered-list' (не 'bulleted-list')
        const typeMapping: Record<string, string> = {
          'listItem': 'list-item',
          'orderedList': 'ordered-list',
          'bulletList': 'unordered-list', // Важно: bulletList → unordered-list
          'bulleted-list': 'unordered-list', // Также нормализуем уже преобразованный тип
          'codeBlock': 'code', // Важно: codeBlock → code
          'code-block': 'code', // Также нормализуем уже преобразованный тип
        }
        
        if (block.type && typeMapping[block.type]) {
          block = {
            ...block,
            type: typeMapping[block.type],
          }
        }

        // Рекурсивно нормализуем children
        if (Array.isArray(block.children)) {
          block = {
            ...block,
            children: block.children.map(normalizeBlockTypes),
          }
        }

        return block
      }

      // Функция для конвертации columns в layout
      const convertColumnsToLayout = (block: any): any => {
        if (block.type === 'columns' && Array.isArray(block.content)) {
          // TipTap columns: { type: 'columns', content: [column, column, ...] }
          // Конвертируем в KeystoneJS layout: { type: 'layout', layout: [1, 1] или [1, 1, 1], children: [layout-area, layout-area, ...] }
          const columns = block.content || []
          const columnCount = columns.length
          
          // Определяем layout на основе количества колонок
          let layout: number[] = [1, 1]
          if (columnCount === 3) {
            layout = [1, 1, 1]
          } else if (columnCount > 3) {
            // Если больше 3 колонок, ограничиваем до 3
            layout = [1, 1, 1]
            columns.splice(3)
          }
          
          // Конвертируем каждую колонку в layout-area
          const layoutAreas = columns.map((column: any) => {
            // TipTap column: { type: 'column', content: [...] }
            // KeystoneJS layout-area: { type: 'layout-area', children: [...] }
            const columnContent = column.content || []
            const convertedChildren = columnContent
              .map(convertProseMirrorToSlate)
              .filter((child: any) => child !== null)
            
            return {
              type: 'layout-area',
              children: convertedChildren.length > 0 ? convertedChildren : [{ type: 'paragraph', children: [{ text: '' }] }],
            }
          })
          
          return {
            type: 'layout',
            layout: layout,
            children: layoutAreas,
          }
        }
        return block
      }

      contentDocument = contentDocument
        .map((block: any) => {
          // Сначала нормализуем типы блоков (listItem → list-item)
          block = normalizeBlockTypes(block)
          
          // Конвертируем columns в layout
          if (block.type === 'columns') {
            const converted = convertColumnsToLayout(block)
            if (converted.type === 'layout') {
              return converted
            }
          }
          
          // Если тип не поддерживается, преобразуем в paragraph
          if (block.type && !supportedTypes.includes(block.type)) {
            logger.warn('[CreateArticlePage] Unsupported block type, converting to paragraph:', block.type)
            // Извлекаем текст из неподдерживаемого блока
            const extractText = (node: any): string => {
              if (node.text) return node.text
              if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractText).join(' ')
              }
              return ''
            }
            const text = extractText(block)
            return {
              type: 'paragraph',
              children: text ? [{ text }] : [{ text: '' }],
            }
          }
          return block
        })
        .filter((block: any) => block !== null)

      // Дополнительная валидация и нормализация структуры блоков
      // Убеждаемся, что все блоки имеют правильную структуру
      const validateAndNormalizeBlock = (block: any): any => {
        if (!block || typeof block !== 'object') {
          return null
        }

        // Убеждаемся, что у блока есть type
        if (!block.type) {
          logger.warn('[CreateArticlePage] Block without type, skipping:', block)
          return null
        }

        // Убеждаемся, что у блока есть children (даже если пустой массив)
        if (!Array.isArray(block.children)) {
          logger.warn('[CreateArticlePage] Block without children array, adding empty children:', block.type)
          block.children = [{ text: '' }]
        }

        // Для code убеждаемся, что children содержат текст
        // KeystoneJS использует 'code', а не 'code-block'
        if (block.type === 'code' || block.type === 'code-block') {
          // Нормализуем тип
          if (block.type === 'code-block') {
            block.type = 'code'
          }
          if (block.children.length === 0) {
            block.children = [{ text: '' }]
          }
          
          // Сохраняем language через маркер в тексте (KeystoneJS не поддерживает кастомные поля)
          // Формат: \u200B\u200B\u200B[LANGUAGE:language]\u200B\u200B\u200B
          const language = block.language || 'plaintext'
          if (block.children && block.children.length > 0) {
            const firstTextNode = block.children.find((child: any) => 
              child && typeof child === 'object' && child.text !== undefined && !child.type
            )
            
            if (firstTextNode) {
              // Добавляем маркер языка в начало текста
              const marker = `\u200B\u200B\u200B[LANGUAGE:${language}]\u200B\u200B\u200B`
              if (!firstTextNode.text.includes(`[LANGUAGE:${language}]`)) {
                const existingText = firstTextNode.text || ''
                firstTextNode.text = marker + (existingText.trim() === '' ? ' ' : existingText)
              }
            } else {
              // Если нет текстового узла, создаем его с маркером
              const marker = `\u200B\u200B\u200B[LANGUAGE:${language}]\u200B\u200B\u200B `
              block.children.unshift({ text: marker })
            }
          } else {
            // Если нет children, создаем текстовый узел с маркером
            const marker = `\u200B\u200B\u200B[LANGUAGE:${language}]\u200B\u200B\u200B `
            block.children = [{ text: marker }]
          }
          
          // Убеждаемся, что все children - это текстовые узлы
          block.children = block.children.map((child: any) => {
            if (typeof child === 'string') {
              return { text: child }
            }
            if (child && typeof child === 'object' && child.text !== undefined) {
              return child
            }
            return { text: String(child || '') }
          })
          
          // Удаляем language из блока - KeystoneJS не поддерживает это поле
          delete block.language
        }

        // Обрабатываем blockId (для anchor блоков)
        // KeystoneJS не принимает кастомные поля, поэтому сохраняем blockId через специальный маркер в тексте
        if (block.blockId) {
          const blockId = block.blockId
          if (import.meta.env.DEV) {
            logger.debug('[validateAndNormalizeBlock] Processing blockId:', { blockId, blockType: block.type })
          }
          if (block.children && block.children.length > 0) {
            // Ищем первый текстовый узел (может быть напрямую в children или в paragraph)
            let firstTextNode: any = null
            
            // Проверяем, есть ли текстовый узел напрямую в children
            const directTextNode = block.children.find((child: any) => 
              child && typeof child === 'object' && child.text !== undefined && !child.type
            )
            
            if (directTextNode) {
              firstTextNode = directTextNode
            } else {
              // Ищем в первом paragraph
              const firstChild = block.children[0]
              if (firstChild && firstChild.type === 'paragraph' && firstChild.children && firstChild.children.length > 0) {
                firstTextNode = firstChild.children.find((child: any) => 
                  child && typeof child === 'object' && child.text !== undefined
                )
              } else if (firstChild && firstChild.text !== undefined) {
                // Если первый child - это текстовый узел
                firstTextNode = firstChild
              }
            }
            
            if (firstTextNode) {
              // Добавляем невидимый маркер в начало текста
              // Формат: \u200B\u200B\u200B[ANCHOR:blockId]\u200B\u200B\u200B
              // Используем zero-width space (\u200B) чтобы маркер был невидим, но сохранился в БД
              const marker = `\u200B\u200B\u200B[ANCHOR:${blockId}]\u200B\u200B\u200B`
              if (firstTextNode.text !== undefined) {
                // Проверяем, нет ли уже маркера (чтобы не дублировать)
                if (!firstTextNode.text.includes(`[ANCHOR:${blockId}]`)) {
                  const existingText = firstTextNode.text || ''
                  // Если текст пустой или содержит только пробелы, добавляем пробел после маркера
                  // чтобы узел не был полностью пустым (KeystoneJS может отклонить пустые узлы)
                  firstTextNode.text = marker + (existingText.trim() === '' ? ' ' : existingText)
                }
              }
            } else {
              // Если нет текстового узла, создаем его в начале
              if (block.children[0] && block.children[0].type === 'paragraph') {
                // Добавляем текстовый узел с маркером в начало paragraph
                // Добавляем пробел после маркера, чтобы узел не был пустым
                const marker = `\u200B\u200B\u200B[ANCHOR:${blockId}]\u200B\u200B\u200B `
                if (!Array.isArray(block.children[0].children)) {
                  block.children[0].children = []
                }
                block.children[0].children.unshift({ text: marker })
              } else {
                // Добавляем текстовый узел с маркером в начало children
                // Добавляем пробел после маркера, чтобы узел не был пустым
                const marker = `\u200B\u200B\u200B[ANCHOR:${blockId}]\u200B\u200B\u200B `
                block.children.unshift({ text: marker })
              }
            }
          } else {
            // Если нет children, создаем paragraph с текстовым узлом, содержащим маркер
            // Добавляем пробел после маркера, чтобы узел не был пустым
            const marker = `\u200B\u200B\u200B[ANCHOR:${blockId}]\u200B\u200B\u200B `
            block.children = [{ type: 'paragraph', children: [{ text: marker }] }]
          }
        }

        // Для blockquote обрабатываем variant (для callout)
        // KeystoneJS не принимает кастомные поля, поэтому сохраняем variant через специальный маркер в тексте
        if (block.type === 'blockquote') {
          // Если variant есть в blockquote, сохраняем его через маркер в тексте первого paragraph
          if (block.variant || block['data-callout-variant']) {
            const variant = block.variant || block['data-callout-variant']
            if (block.children && block.children.length > 0) {
              const firstChild = block.children[0]
              if (firstChild && firstChild.type === 'paragraph' && firstChild.children && firstChild.children.length > 0) {
                // Добавляем невидимый маркер в начало первого текстового узла
                // Формат: \u200B\u200B\u200B[CALLOUT:variant]\u200B\u200B\u200B
                // Используем zero-width space (\u200B) чтобы маркер был невидим, но сохранился в БД
                const marker = `\u200B\u200B\u200B[CALLOUT:${variant}]\u200B\u200B\u200B`
                const firstTextNode = firstChild.children[0]
                if (firstTextNode && typeof firstTextNode === 'object' && firstTextNode.text !== undefined) {
                  // Проверяем, нет ли уже маркера (чтобы не дублировать)
                  if (!firstTextNode.text.includes(`[CALLOUT:${variant}]`)) {
                    // Добавляем маркер в начало текста
                    firstTextNode.text = marker + (firstTextNode.text || '')
                  }
                } else if (firstTextNode && typeof firstTextNode === 'string') {
                  // Если это строка, создаем текстовый узел
                  firstChild.children[0] = { text: marker + firstTextNode }
                } else {
                  // Если нет текстового узла, создаем его
                  firstChild.children.unshift({ text: marker })
                }
              }
            }
          }
          // Удаляем variant с самого blockquote, так как KeystoneJS не примет его
          // Variant будет восстановлен при рендеринге из маркера в тексте
        }

        // Для списков убеждаемся, что все children - это list-item
        // KeystoneJS использует 'unordered-list', а не 'bulleted-list'
        if (block.type === 'ordered-list' || block.type === 'unordered-list' || block.type === 'bulleted-list') {
          // Нормализуем тип
          if (block.type === 'bulleted-list') {
            block.type = 'unordered-list'
          }
          block.children = block.children.map((child: any) => {
            if (!child || typeof child !== 'object') {
              return null
            }
            // Нормализуем тип list-item
            if (child.type === 'listItem' || child.type === 'list-item') {
              return {
                ...child,
                type: 'list-item',
                children: Array.isArray(child.children) ? child.children : [{ text: '' }],
              }
            }
            // Если это не list-item, создаем обертку
            return {
              type: 'list-item',
              children: [child],
            }
          }).filter((child: any) => child !== null)
        }

        // Рекурсивно валидируем children
        if (Array.isArray(block.children)) {
          block.children = block.children.map((child: any) => {
            if (child && typeof child === 'object' && child.type) {
              return validateAndNormalizeBlock(child)
            }
            // Очищаем текстовые узлы от полей с false значениями и недопустимых полей
            if (child && typeof child === 'object' && child.text !== undefined) {
              const cleanedChild: any = { text: child.text }
              // Копируем только поля с truthy значениями (кроме text)
              if (child.bold === true) cleanedChild.bold = true
              if (child.italic === true) cleanedChild.italic = true
              if (child.code === true) cleanedChild.code = true
              if (child.underline === true) cleanedChild.underline = true
              if (child.strikethrough === true) cleanedChild.strikethrough = true
              // НЕ сохраняем url в текстовых узлах - KeystoneJS не поддерживает это поле
              // Ссылки сохраняются через маркеры в тексте (см. convertProseMirrorToSlate)
              return cleanedChild
            }
            return child
          }).filter((child: any) => child !== null)
        }

        // Сохраняем все кастомные поля (language и т.д.), но НЕ variant для blockquote
        // Создаем новый объект с сохранением всех полей
        const result: any = {
          type: block.type,
          children: block.children,
        }
        
        // Копируем все кастомные поля, кроме variant, data-callout-variant и blockId
        // (они уже сохранены через маркеры в тексте)
        Object.keys(block).forEach(key => {
          if (key !== 'type' && key !== 'children' && !key.startsWith('_')) {
            // НЕ копируем blockId (сохранен через маркер в тексте)
            if (key === 'blockId') {
              return // Пропускаем это поле, так как blockId сохранен через маркер в тексте
            }
            // Для blockquote не копируем variant и data-callout-variant
            // (variant сохранен через маркер в тексте первого paragraph)
            if (block.type === 'blockquote' && (key === 'variant' || key === 'data-callout-variant')) {
              return // Пропускаем эти поля для blockquote
            }
            // Для paragraph НЕ сохраняем data-callout-variant (используем маркер в тексте)
            if (block.type === 'paragraph' && key === 'data-callout-variant') {
              return // Пропускаем это поле, так как variant сохранен через маркер в тексте
            }
            // Для code НЕ сохраняем language (используем маркер в тексте)
            if (block.type === 'code' && key === 'language') {
              return // Пропускаем это поле, так как language сохранен через маркер в тексте
            }
            // Для остальных типов копируем все поля
            result[key] = block[key]
          }
        })

        return result
      }

      // Применяем валидацию ко всем блокам
      contentDocument = contentDocument
        .map(validateAndNormalizeBlock)
        .filter((block: any) => block !== null)

      // Ссылки (включая якорные ссылки href="#anchor-id") сохраняются в поле url текстовых узлов
      // KeystoneJS Slate поддерживает url в текстовых узлах

      // Логируем преобразованный контент для отладки
      logger.debug('[CreateArticlePage] Converted content document:', {
        length: contentDocument.length,
        firstBlock: JSON.stringify(contentDocument[0]).substring(0, 300),
        allBlocks: contentDocument.map((block: any) => ({
          type: block.type,
          hasChildren: Array.isArray(block.children),
          childrenCount: Array.isArray(block.children) ? block.children.length : 0,
        })),
      })

      // Финальная проверка: убеждаемся, что все блоки имеют правильную структуру
      // KeystoneJS ожидает, что каждый блок имеет:
      // - type: string
      // - children: array (даже если пустой)
      const finalValidation = contentDocument.every((block: any) => {
        if (!block || typeof block !== 'object') return false
        if (!block.type || typeof block.type !== 'string') return false
        if (!Array.isArray(block.children)) return false
        return true
      })

      if (!finalValidation) {
        logger.error('[CreateArticlePage] Invalid block structure after validation:', {
          blocks: contentDocument.map((block: any) => ({
            hasType: !!block?.type,
            type: block?.type,
            hasChildren: Array.isArray(block?.children),
            childrenType: typeof block?.children,
          })),
        })
      toast({
          title: t('createArticle.invalidContentStructure'),
          description: t('createArticle.invalidContentStructureDescription'),
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }

      // KeystoneJS document field ожидает массив блоков напрямую
      // inputResolver принимает массив блоков, а не объект { document: [...] }
      // zEditorCodec = zod.z.array(zBlock) - ожидает массив блоков
      // В GraphQL mutation нужно передавать массив напрямую в поле content
      const keystoneContent = contentDocument

      // Логируем финальную структуру для отладки
      logger.debug('[CreateArticlePage] Final KeystoneJS content structure:', {
        isArray: Array.isArray(keystoneContent),
        length: Array.isArray(keystoneContent) ? keystoneContent.length : 0,
        firstBlockType: Array.isArray(keystoneContent) && keystoneContent[0] ? keystoneContent[0].type : 'N/A',
        allBlockTypes: Array.isArray(keystoneContent) ? keystoneContent.map((b: any) => b.type) : [],
        preview: JSON.stringify(keystoneContent).substring(0, 1000),
        fullStructure: JSON.stringify(keystoneContent),
      })

      // Функция для преобразования difficulty из frontend в backend формат
      const mapDifficultyToBackend = (diff: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' => {
        const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
          beginner: 'easy',
          intermediate: 'medium',
          advanced: 'hard',
        };
        return mapping[diff] || 'medium';
      };

      // Используем GraphQL API для создания/обновления статьи
      // ВАЖНО: excerpt обязателен, поэтому всегда передаем строку (не undefined)
      // Используем category из state, но если его нет, проверяем URL напрямую
      const currentCategory = category || searchParams.get('category') || null
      const articleData: any = {
        title: title.trim(),
        content: keystoneContent, // KeystoneJS ожидает массив блоков напрямую
        excerpt: excerpt.trim(), // excerpt обязателен, всегда передаем строку
        tags,
        difficulty: mapDifficultyToBackend(difficulty), // Преобразуем difficulty в backend формат
        category: currentCategory, // Категория статьи (news или changes)
      }
      
      // Добавляем previewImage только если он есть (опциональное поле)
      if (previewImageUrl) {
        articleData.previewImage = previewImageUrl
        articleData.preview_image = previewImageUrl // snake_case для бэка
        articleData.cover_url = previewImageUrl // поле в таблице
      }

      // Article data logging removed for cleaner console
      
      let publishedArticle
      let wasUpdated = false

      // Жёстко: если есть edit-id, только обновляем существующую запись (не создаём новую)
      const editFromUrl = (searchParams.get('edit') || searchParams.get('articleId') || searchParams.get('id') || '')?.trim() || null
      const editingTargetId =
        editArticleIdRef.current ||
        (articleToEdit?.id ? String(articleToEdit.id) : null) ||
        editArticleId ||
        editFromUrl ||
        null

      const isEditMode = Boolean(editingTargetId)

      if (isEditMode) {
        if (!editingTargetId) {
          toast({
            title: t('createArticle.articleNotFound') || 'Article not found',
            description: t('createArticle.articleNotFoundDescription') || 'The article you are trying to edit does not exist',
            variant: 'destructive',
          })
          setIsPublishing(false)
          return
        }
        publishedArticle = await updateArticle(editingTargetId!, {
          ...articleData,
          publishedAt: articleToEdit?.publishedAt || new Date().toISOString(),
        })
        wasUpdated = true
      } else if (draftId) {
        // Обновляем по draftId (обратная совместимость)
        publishedArticle = await updateArticle(String(draftId), {
                ...articleData,
                publishedAt: new Date().toISOString(),
        })
        wasUpdated = true
      } else {
        // Создаем новую статью
        publishedArticle = await createArticle({
            ...articleData,
            publishedAt: new Date().toISOString(),
          })
      }
      
      // После успешной публикации инвалидируем кэш списка и трендовых статей,
      // чтобы на HomePage новые статьи появились сразу, без жесткого перезагруза.
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] })
      // Сбрасываем кэш страницы статьи, чтобы при переходе на /article/:id подтянулась новая версия
      queryClient.removeQueries({ queryKey: ['article', String(publishedArticle.id)] })

      registerActivity('publish_article')
      
      // id - это строковое представление числового Strapi id
      const articleId = publishedArticle.id

      // Не даём unmount-эффекту записать черновик в localStorage после успешной публикации
      publishedSuccessfullyRef.current = true
      
      logger.debug('[CreateArticlePage] Article published:', {
        id: publishedArticle.id,
        articleId,
      })

      toast({
        title: wasUpdated
          ? t('createArticle.success.updated') || 'Article updated'
          : t('createArticle.articlePublished'),
        description: wasUpdated
          ? t('createArticle.success.updatedDescription') || 'Your article has been successfully updated'
          : t('createArticle.articlePublishedDescription'),
      })
      resetPreviewImage()
      setTitle('')
      setContent('')
      setExcerpt('')
      setTags([])
      setTagInput('')
      setDifficulty('intermediate')
      setDraftId(null)
      setExistingPreviewImageId(null)

      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('draft')
      setSearchParams(nextParams, { replace: true })
      loadedDraftIdRef.current = null

      // Небольшая задержка перед навигацией, чтобы дать время базе данных синхронизироваться
      // Это особенно важно для только что созданных статей
      await new Promise(resolve => setTimeout(resolve, 200))

      // Очищаем localStorage после задержки, чтобы unmount-эффект не перезаписал; replace — чтобы Back с статьи вёл на ленту, а не в редактор
      try {
        Object.keys(localStorage).filter(k => k.startsWith('draft_')).forEach(k => localStorage.removeItem(k))
        localStorage.removeItem('draft_pending_recovery')
        logger.debug('[CreateArticlePage] Cleared draft localStorage after publish')
      } catch (e) {
        logger.warn('[CreateArticlePage] Failed to clear localStorage after publish:', e)
      }
      
      navigate(`/article/${articleId}`, { replace: true })
    } catch (error: unknown) {
      // Логируем полную информацию об ошибке
      logger.error('[CreateArticlePage] Failed to publish article:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        response: (error as any)?.response,
        responseData: (error as any)?.response?.data,
        responseErrors: (error as any)?.response?.errors,
      });
      
      // Извлекаем сообщение об ошибке из GraphQL ответа
      let message: string | undefined = undefined
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response
        if (response?.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          // GraphQL ошибки
          message = response.errors.map((e: any) => e.message).join(', ')
        } else if (response?.data?.error?.message) {
          message = response.data.error.message
        } else if (response?.data?.message) {
          message = response.data.message
        }
      }
      
      if (!message && error instanceof Error) {
        message = error.message
      }
      
      if (!message) {
        message = t('createArticle.publicationFailedDescription')
      }
      
      toast({
        title: t('createArticle.publicationFailed'),
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const steps = [
    {
      id: 0,
      label: t('createArticle.steps.basicInfo'),
      icon: Type,
      description: t('createArticle.steps.basicInfoDescription'),
    },
    {
      id: 1,
      label: t('createArticle.steps.content'),
      icon: FileText,
      description: t('createArticle.steps.contentDescription'),
    },
    {
      id: 2,
      label: t('createArticle.steps.metadata'),
      icon: Tag,
      description: t('createArticle.steps.metadataDescription'),
    },
    {
      id: 3,
      label: t('createArticle.steps.preview'),
      icon: ImageIcon,
      description: t('createArticle.steps.previewDescription'),
    },
    {
      id: 4,
      label: t('createArticle.steps.review'),
      icon: Eye,
      description: t('createArticle.steps.reviewDescription'),
    },
    {
      id: 5,
      label: t('createArticle.steps.guidelines'),
      icon: AlertCircle,
      description: t('createArticle.steps.guidelinesDescription'),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Циклическое переключение: с последнего шага переходим на первый
      setCurrentStep(0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      // Циклическое переключение: с первого шага переходим на последний
      setCurrentStep(steps.length - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => safeNavigate(-1)}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-base sm:text-lg font-semibold truncate">
              {isEditing
                ? t('createArticle.editingTitle') || t('article.edit') || 'Editing article'
                : t('createArticle.title')}
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-4 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
        {/* Navigation Strip - Modern Design */}
        <div className="mb-6 sm:mb-12">
          {/* Step Name - Above the navigation */}
          <div className="mb-3 text-center">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {steps[currentStep]?.label || ''}
            </h2>
            {steps[currentStep]?.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Navigation Strip with Arrows and Progress Bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrevious}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-primary/40 bg-background text-primary hover:bg-primary/10 hover:border-primary cursor-pointer transition-all duration-200"
              aria-label={t('common.previous')}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Progress Bar Container */}
            <div className="flex-1 max-w-md h-2 sm:h-3 bg-muted rounded-full overflow-hidden relative">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-primary/40 bg-background text-primary hover:bg-primary/10 hover:border-primary cursor-pointer transition-all duration-200"
              aria-label={t('common.next')}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Current Step Indicator - Below the navigation */}
          <div className="mt-3 text-center">
            <span className="text-sm sm:text-base text-muted-foreground font-medium">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Content Area - Full Width with Steps */}
        <div className="w-full">
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              opacity: 1,
              transform: 'translateX(0)',
            }}
          >
            {/* Step 0: Basic Info (Title and Excerpt) */}
            {currentStep === 0 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {t('createArticle.articleTitle')}
                    {!title.trim() && <span className="text-destructive">*</span>}
                  </Label>
            <div className="relative">
            <Input
                      placeholder={isTitleFocused || title.trim() ? '' : t('createArticle.titlePlaceholder')}
              value={title}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, TITLE_MAX_LENGTH)
                  setTitle(newValue)
                  userHasEditedRef.current = true
                }}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                      className="text-xl sm:text-2xl lg:text-3xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground/50 bg-transparent shadow-none break-words pr-16 sm:pr-20"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      maxLength={TITLE_MAX_LENGTH}
              />
              <div className="absolute bottom-2 right-0 text-[10px] sm:text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH}
              </div>
            </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('createArticle.titleHint')}
                  </p>
          </div>

          <Separator />

          <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="excerpt" className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    {t('createArticle.excerpt')}
                    {!excerpt.trim() && <span className="text-destructive">*</span>}
                  </Label>
            <div className="relative">
              <Textarea
              id="excerpt"
                ref={excerptTextareaRef}
                placeholder={isExcerptFocused || excerpt.trim() ? '' : t('createArticle.excerptPlaceholder')}
              value={excerpt}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, EXCERPT_MAX_LENGTH)
                  setExcerpt(newValue)
                  adjustTextareaHeight()
                  userHasEditedRef.current = true
                }}
                onFocus={() => setIsExcerptFocused(true)}
                onBlur={() => setIsExcerptFocused(false)}
                className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px] resize-none break-words pr-12 sm:pr-16"
                rows={3}
                maxLength={EXCERPT_MAX_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-[10px] sm:text-xs text-muted-foreground">
                {excerpt.length}/{EXCERPT_MAX_LENGTH}
          </div>
            </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('createArticle.excerptHint')}
                  </p>
          </div>
              </div>
            )}

            {/* Step 1: Content */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <RichTextEditor
                  ref={editorRef}
                  id="content-editor"
              value={content}
                  jsonValue={contentJSON}
                  onChange={(html) => {
                    setContent(html)
                    userHasEditedRef.current = true
                    // Сохраняем JSON контент при каждом изменении, чтобы он был доступен при публикации
                    // даже если редактор размонтирован на других шагах
                    // Используем requestAnimationFrame для более плавного обновления
                    requestAnimationFrame(() => {
                      if (editorRef.current) {
                        try {
                          const json = editorRef.current.getJSON()
                          if (json && json.type === 'doc') {
                            setContentJSON(json)
                            if (import.meta.env.DEV) {
                              const codeBlocks = json.content?.filter((node: any) => node.type === 'codeBlock') || []
                              if (codeBlocks.length > 0) {
                                logger.debug('[CreateArticlePage] Saved JSON with code blocks:', {
                                  count: codeBlocks.length,
                                  languages: codeBlocks.map((cb: any) => cb.attrs?.language || 'plaintext'),
                                })
                              }
                            }
                          }
                        } catch (error) {
                          logger.warn('[CreateArticlePage] Failed to get JSON on change:', error)
                        }
                      }
                    })
                  }}
                  placeholder={t('createArticle.contentPlaceholder')}
                  characterLimit={20000}
                  onUploadMedia={handleUploadMedia}
                  articleId={editArticleIdRef.current || articleToEdit?.id || (draftId ? Number(draftId) : undefined)}
            />
          </div>
            )}

            {/* Step 2: Metadata */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <Card>
            <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t('createArticle.tags')}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('createArticle.tagsDescription', { max: MAX_TAGS })}
                    </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                <Input
                      placeholder={t('createArticle.tagsPlaceholder')}
                  value={tagInput}
                      onChange={(e) => {
                        const newValue = e.target.value.slice(0, TAG_MAX_LENGTH)
                        setTagInput(newValue)
                      }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                      maxLength={TAG_MAX_LENGTH}
                      className="h-9 sm:h-10 text-sm pr-12 sm:pr-16"
                    />
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground pointer-events-none">
                      {tagInput.length}/{TAG_MAX_LENGTH}
                    </div>
                  </div>
                  <Button onClick={handleAddTag} disabled={tags.length >= MAX_TAGS} className="h-9 sm:h-10 text-xs sm:text-sm">
                    {t('createArticle.addTag')}
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('createArticle.tagsCounter', { count: tags.length, max: MAX_TAGS }) || `${tags.length}/${MAX_TAGS} tags`}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap items-start gap-1.5 sm:gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                            className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-[10px] sm:text-xs break-words overflow-wrap-anywhere"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">{t('createArticle.difficultyLevel')}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('createArticle.difficultyLevelDescription')}
                    </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                          className="capitalize flex-1 h-9 sm:h-10 text-xs sm:text-sm sm:size-lg"
                  >
                    {t(`createArticle.difficultyOptions.${level}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
              </div>
            )}

            {/* Step 3: Preview Image */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <Card>
            <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t('createArticle.previewImageTitle')}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('createArticle.previewImageDescription')}
                    </p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-0">
              {croppedImageUrl ? (
                <>
                  <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                    <img
                      src={croppedImageUrl}
                      alt="Article preview"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="pointer-events-none absolute bottom-2 sm:bottom-4 left-2 sm:left-4 hidden items-center gap-1.5 sm:gap-2 rounded-full border border-border/50 bg-background/80 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
                      <Badge variant="secondary" className="rounded-sm px-1.5 sm:px-2 py-0.5 uppercase tracking-wide text-[9px] sm:text-[10px]">
                        16:9
                      </Badge>
                      {t('createArticle.perfectForSocial')}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      onClick={handleAdjustCrop}
                      disabled={!originalImageUrl || !UPLOAD_PREVIEW_ENABLED}
                    >
                      <Crop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('createArticle.adjustCrop')}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!UPLOAD_PREVIEW_ENABLED}
                    >
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('createArticle.replaceImage')}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      onClick={() => setIsExternalImageDialogOpen(true)}
                    >
                      <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('createArticle.useExternalImage') || 'Use external URL'}
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm text-destructive hover:text-destructive"
                      onClick={resetPreviewImage}
                    >
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('createArticle.removeImage')}
                    </Button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('createArticle.imageUploadHint')}
                  </p>
                </>
              ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10 px-4 sm:px-6 py-12 sm:py-16 text-center">
                        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted/40">
                          <ImagePlus className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                        <h4 className="mt-4 sm:mt-6 text-base sm:text-lg font-semibold">{t('createArticle.addHeroImage')}</h4>
                        <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground">
                          {t('createArticle.addHeroImageDescription')}
                  </p>
                  <Button
                    className="mt-4 sm:mt-6 gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!UPLOAD_PREVIEW_ENABLED}
                  >
                    <ImagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t('createArticle.uploadImage')}
                  </Button>
                  <Button
                    className="mt-2 gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
                    variant="ghost"
                    onClick={() => setIsExternalImageDialogOpen(true)}
                  >
                    <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t('createArticle.useExternalImage') || 'Use external URL'}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelection}
                disabled={!UPLOAD_PREVIEW_ENABLED}
              />
              <Dialog open={isExternalImageDialogOpen} onOpenChange={setIsExternalImageDialogOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t('createArticle.externalImageTitle') || 'Use external image URL'}</DialogTitle>
                    <DialogDescription>
                      {t('createArticle.externalImageDescription') ||
                        'Paste a direct image link (https) from a trusted host. The image will be displayed without uploading to our storage.'}
                      {!UPLOAD_PREVIEW_ENABLED && (
                        <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                          {t('createArticle.uploadDisabledNotice') || 'Direct uploads are temporarily disabled. Use an external image URL.'}
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="external-image-url">{t('createArticle.externalImageLabel') || 'Image URL'}</Label>
                      <Input
                        id="external-image-url"
                        placeholder="https://example.com/image.jpg"
                        value={externalImageUrl}
                        onChange={(e) => setExternalImageUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {t('createArticle.externalImagePresets') || 'Popular hosts:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'https://i.imgur.com/example.jpg',
                          'https://res.cloudinary.com/<cloud>/image/upload/v123/sample.jpg',
                          'https://images.unsplash.com/photo-123?w=1200',
                          'https://your-supabase-project.supabase.co/storage/v1/object/public/bucket/path.jpg',
                        ].map((url) => (
                          <Button
                            key={url}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-[11px] sm:text-xs"
                            onClick={() => setExternalImageUrl(url)}
                          >
                            {url.replace(/^https?:\/\//, '')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsExternalImageDialogOpen(false)}>
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button onClick={applyExternalImageUrl}>{t('common.apply') || 'Apply'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                {/* Preview Image */}
                {croppedImageUrl && (
                  <div className="mb-6 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border border-border/40">
                    <img
                      src={croppedImageUrl}
                      alt={title.trim() || 'Article preview'}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                {/* Article Header */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {title.trim() || <span className="text-muted-foreground italic">{t('createArticle.untitled')}</span>}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-medium">{user?.nickname || user?.email || 'You'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{estimateReadTime(getPlainTextFromHtml(content))} min read</span>
                    </div>
                  </div>

                  {/* Tags and Difficulty */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary text-[10px] sm:text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{t('createArticle.noTags')}</span>
                    )}
                    <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                      {t(`createArticle.difficultyOptions.${difficulty}`)}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6 sm:my-8" />

                {/* Article Content - Collapsible */}
                <div className="space-y-4">
                    {content.trim() ? (
                      <div className="relative">
                        <div
                          ref={contentPreviewRef}
                          className={cn(
                            'text-foreground leading-relaxed break-words transition-all duration-500 ease-in-out',
                            !isContentExpanded && shouldShowExpandButton && 'max-h-[600px] overflow-hidden'
                          )}
                        >
                        {contentJSON ? (
                          // Используем TipTap для отображения (сохраняет все атрибуты узлов)
                          <ArticleContent content={contentJSON} />
                        ) : (
                          // Fallback на HTML
                          <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: content }} />
                          </div>
                        )}
                        </div>
                        {!isContentExpanded && shouldShowExpandButton && (
                          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">{t('createArticle.noContentYet')}</p>
                    )}
                  {shouldShowExpandButton && (
                    <div className="flex justify-center -mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                        className="gap-1.5 sm:gap-2 relative z-10 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      >
                        {isContentExpanded ? (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90" />
                            {t('createArticle.showLess')}
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 -rotate-90" />
                            {t('createArticle.showMore')}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Metadata Section - Minimal Design */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Excerpt Section */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t('createArticle.excerptLabel')}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                        {excerpt.length} / {EXCERPT_MAX_LENGTH}
                      </span>
                    </div>
                    {excerpt.trim() ? (
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words pt-1" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {excerpt}
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-muted-foreground italic pt-1">{t('createArticle.noExcerpt')}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t('createArticle.words')}</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {getPlainTextFromHtml(content).split(/\s+/).filter(Boolean).length}
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t('createArticle.titleLabel')}</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {title.length} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">/ {TITLE_MAX_LENGTH}</span>
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t('createArticle.contentLabel')}</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {getPlainTextFromHtml(content).length.toLocaleString()} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">/ {CONTENT_MAX_LENGTH.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Guidelines */}
            {currentStep === 5 && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold">{t('createArticle.publishingGuidelines')}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('createArticle.reviewRulesBeforePublishing')}
                  </p>
                </div>

                <Card className="border-border/60 bg-muted/20">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6">
                    <p className="text-sm text-foreground">{t('createArticle.readRulesBeforePublish')}</p>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
                      <Link to="/rules">
                        <Link2 className="h-3.5 w-3.5" />
                        {t('createArticle.goToRules')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-semibold">{t('createArticle.important')}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground pl-5 sm:pl-7 break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {t('createArticle.byPublishingYouConfirm')}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Checkbox
                      id="agree-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => {
                        setAgreedToTerms(checked === true)
                      }}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 shrink-0"
                    />
                    <div className="space-y-1 flex-1 min-w-0 pt-0.5">
                      <Label
                        htmlFor="agree-terms"
                        className="text-xs sm:text-sm font-medium leading-relaxed cursor-pointer break-words block"
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      >
                        {t('createArticle.agreeToGuidelines')}
                      </Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                        {t('createArticle.mustAgree')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t('createArticle.previous')}
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
              disabled={isSavingDraft || isPublishing || isLoadingDraft}
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {isSavingDraft ? t('settings.profile.saving') : t('createArticle.saveDraft')}
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handlePublish}
                disabled={isPublishing || isSavingDraft || isLoadingDraft}
                className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isPublishing ? t('createArticle.publishing') : t('createArticle.publish')}
              </Button>
            ) : currentStep === steps.length - 2 ? (
              <Button
                onClick={handleNext}
                className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
              >
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t('createArticle.complete')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto"
              >
                {t('createArticle.next')}
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно при выходе с несохранёнными изменениями */}
      <Dialog open={showExitDialog} onOpenChange={(open) => {
        if (!open) handleExitContinue()
      }}>
        <DialogContent
          className="max-w-[min(500px,calc(100vw-2rem))] w-[calc(100vw-2rem)] sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto gap-3 sm:gap-4"
          aria-describedby="exit-unsaved-description"
        >
          <DialogHeader className="flex flex-row items-start sm:items-center justify-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-border/60">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0 mt-0.5 sm:mt-0" aria-hidden />
            <DialogTitle className="text-base sm:text-lg leading-tight text-left pr-10">
              {t('draftRecovery.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription
            id="exit-unsaved-description"
            className="text-sm sm:text-base text-left pt-2 sm:pt-3 space-y-2"
          >
            <p>{t('createArticle.unsavedChangesWarning') || 'У вас есть несохранённые изменения. Что вы хотите сделать?'}</p>
            {title && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-2.5 sm:p-2 rounded-lg border border-border/40">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <p className="font-medium text-foreground truncate flex-1 min-w-0">{title || t('createArticle.untitledDraft')}</p>
              </div>
            )}
          </DialogDescription>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 pt-3 sm:pt-4">
            <Button
              variant="outline"
              onClick={handleExitDelete}
              className="w-full sm:w-auto min-h-11 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive focus-visible:ring-destructive/30"
            >
              <XCircle className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              {t('draftRecovery.delete')}
            </Button>
            <Button
              variant="outline"
              onClick={handleExitContinue}
              className="w-full sm:w-auto min-h-11"
            >
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              {t('draftRecovery.continue')}
            </Button>
            <Button
              onClick={handleExitSaveDraft}
              className="w-full sm:w-auto min-h-11"
            >
              <Save className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              {t('draftRecovery.saveToDraft')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="space-y-1.5 sm:space-y-2 text-left">
            <DialogTitle className="text-base sm:text-lg">{t('createArticle.refineHeroImage')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('createArticle.refineHeroImageDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/70 bg-muted/40">
                {effectiveImageUrl ? (
                  <>
              <Cropper
                      image={effectiveImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
                    <div className="pointer-events-none absolute inset-0 border border-white/20" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/10" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    {t('createArticle.waitingForImage')}
                  </div>
                )}
                <div className="pointer-events-none absolute left-2 sm:left-4 top-2 sm:top-4 hidden items-center gap-1.5 sm:gap-2 rounded-full border border-border/40 bg-background/80 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground shadow-sm backdrop-blur md:flex">
                  <Badge variant="secondary" className="rounded-sm px-1.5 sm:px-2 py-0.5 uppercase tracking-wide text-[9px] sm:text-[10px]">
                    16:9
                  </Badge>
                  {t('createArticle.balancedFraming')}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/80 p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span>{t('createArticle.zoom')}</span>
                  <span className="text-muted-foreground">{zoom.toFixed(1)}×</span>
          </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
                  disabled={isProcessingImage}
                  className="mt-2 sm:mt-3"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Card className="h-full border-border/60 bg-muted/30">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base font-semibold">{t('createArticle.croppingTips')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground p-3 sm:p-4 pt-0">
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.aimForClarity')}</p>
                    <p className="break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {t('createArticle.aimForClarityDescription')}
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.resolutionMatters')}</p>
                    <p className="break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {t('createArticle.resolutionMattersDescription')}
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.needAdjustmentsLater')}</p>
                    <p className="break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {t('createArticle.needAdjustmentsLaterDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleCancelCrop} disabled={isProcessingImage} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isProcessingImage || !croppedAreaPixels}
              className="gap-1.5 sm:gap-2 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
            >
              {isProcessingImage ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  {t('createArticle.processing')}
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('createArticle.useImage')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

async function createCroppedImageBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create canvas context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      },
      'image/jpeg',
      0.92
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })
}

