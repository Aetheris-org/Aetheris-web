import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle, Crop, Check, ChevronRight, ChevronLeft, FileText, Tag, Image as ImageIcon, Type, User, Clock, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
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
import { RichTextEditor } from '@/components/RichTextEditor'
import { useAuthStore } from '@/stores/authStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import apiClient from '@/lib/axios'
import { createDraftArticle, updateDraftArticle, publishArticle, getDraftArticle } from '@/api/articles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i

// TODO: Add the same character limit validation on the backend (Strapi schema)
const EXCERPT_MAX_LENGTH = 500
const TITLE_MAX_LENGTH = 200
const CONTENT_MAX_LENGTH = 20000

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
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
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
  const [draftId, setDraftId] = useState<number | null>(null)
  const [existingPreviewImageId, setExistingPreviewImageId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isExcerptFocused, setIsExcerptFocused] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const excerptTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const contentPreviewRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const originalImageUrlRef = useRef<string | null>(null)
  const selectedImageUrlRef = useRef<string | null>(null)
  const croppedImageUrlRef = useRef<string | null>(null)
  const loadedDraftIdRef = useRef<number | null>(null)

  const effectiveImageUrl = selectedImageUrl ?? originalImageUrl
  const [searchParams, setSearchParams] = useSearchParams()
  const draftParam = searchParams.get('draft')
  const draftIdFromQuery = draftParam ? Number.parseInt(draftParam, 10) || null : null

  const uploadPreviewImageAsset = useCallback(async (): Promise<string | null> => {
    if (!croppedImageBlob) {
      return existingPreviewImageId ? String(existingPreviewImageId) : null
    }

    const formData = new FormData()
    formData.append('files', croppedImageBlob, `article-preview-${Date.now()}.jpg`)

    // Используем новый эндпоинт для загрузки через imgBB
    // Retry логика для отказоустойчивости
    let lastError: any = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const uploadResponse = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
          timeout: 90000, // 90 секунд таймаут (бэкенд использует 60 секунд + запас)
    })

        const uploadedFile = uploadResponse.data?.[0]
        if (!uploadedFile || !uploadedFile.url) {
          throw new Error('Invalid response from upload service')
        }

        // Сохраняем URL изображения (imgBB возвращает URL, а не ID)
        const imageUrl = uploadedFile.url
        setExistingPreviewImageId(imageUrl)
    setCroppedImageBlob(null)
        return imageUrl
      } catch (error: any) {
        lastError = error
        
        // Если это не сетевая ошибка или таймаут, не повторяем
        if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK' && error.response?.status !== 408) {
          break
        }
        
        // Экспоненциальная задержка перед повтором
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    // Если все попытки не удались, выбрасываем последнюю ошибку
    throw lastError || new Error('Failed to upload image after multiple attempts')
  }, [croppedImageBlob, existingPreviewImageId])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
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

  // Reset agreement when leaving guidelines step
  useEffect(() => {
    if (currentStep !== 5) {
      setAgreedToTerms(false)
    }
  }, [currentStep])


  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute) || 1
  }

  const handleSaveDraft = async () => {
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

    const hasTitle = Boolean(title.trim())
    const plainText = getPlainTextFromHtml(content)
    const hasBody = plainText.length > 0
    const sanitizedContent = content.trim()

    if (!hasTitle && !hasBody) {
      toast({
        title: t('createArticle.addContentFirst'),
        description: t('createArticle.addContentFirstDescription'),
        variant: 'destructive',
      })
      return
    }

    setIsSavingDraft(true)

    try {
      let previewImageUrl: string | null = null

      try {
        previewImageUrl = await uploadPreviewImageAsset()
    } catch (error) {
        logger.error('Preview upload failed', error)
      toast({
          title: t('createArticle.imageUploadFailed'),
          description: t('createArticle.imageUploadFailedDescription'),
        variant: 'destructive',
      })
        setIsSavingDraft(false)
        return
      }

      const payload = {
        title: title.trim() || t('createArticle.untitledDraft'),
        content: sanitizedContent || (hasBody ? content : ''),
        excerpt: excerpt.trim() || null,
        tags,
        difficulty,
        previewImageUrl,
      }

      const saved = draftId
        ? await updateDraftArticle(draftId, payload)
        : await createDraftArticle(payload)

      // id - это строковое представление числового Strapi id
      const numericId = Number.parseInt(saved.id, 10)
      setDraftId(numericId)
      // Сохраняем URL изображения (теперь это строка, а не ID)
      setExistingPreviewImageId(saved.previewImage || null)
      if (saved.previewImage) {
        setCroppedImageUrl(saved.previewImage)
        croppedImageUrlRef.current = saved.previewImage
      }

      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('draft', String(numericId))
      setSearchParams(nextParams, { replace: true })
      loadedDraftIdRef.current = numericId

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

    resetPreviewImage()

    const url = URL.createObjectURL(file)
    setOriginalImageUrl(url)
    setSelectedImageUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropDialogOpen(true)
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

    if (loadedDraftIdRef.current === draftIdFromQuery) {
      return
    }

    let cancelled = false

    const loadDraft = async () => {
      setIsLoadingDraft(true)
      try {
        const draft = await getDraftArticle(draftIdFromQuery)
        if (cancelled) return

        loadedDraftIdRef.current = draftIdFromQuery
        const numericId = Number.parseInt(draft.id, 10)
        setDraftId(numericId)
        setTitle(draft.title ?? '')
        setContent(normalizeRichText(draft.content))
        setExcerpt(draft.excerpt ?? '')
        setTags(draft.tags ?? [])
        const nextDifficulty =
          draft.difficulty && ['easy', 'medium', 'hard'].includes(draft.difficulty)
            ? (draft.difficulty as typeof difficulty)
            : 'medium'
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
      } catch (error) {
        logger.error('Failed to load draft', error)
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
  }, [draftIdFromQuery, toast])

  useEffect(() => {
    originalImageUrlRef.current = originalImageUrl
  }, [originalImageUrl])

  useEffect(() => {
    selectedImageUrlRef.current = selectedImageUrl
  }, [selectedImageUrl])

  useEffect(() => {
    croppedImageUrlRef.current = croppedImageUrl
  }, [croppedImageUrl])

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
    const currentUser = useAuthStore.getState().user

    if (!currentUser) {
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
    const sanitizedContent = content.trim()

    if (!hasTitle || !hasBody) {
      toast({
        title: t('createArticle.missingInformation'),
        description: t('createArticle.missingInformationDescription'),
        variant: 'destructive',
      })
      return
    }

    setIsPublishing(true)

    try {
      let previewImageUrl: string | null = null

      try {
        previewImageUrl = await uploadPreviewImageAsset()
        } catch (error) {
        logger.error('Preview upload failed', error)
          toast({
          title: t('createArticle.imageUploadFailed'),
          description: t('createArticle.imageUploadFailedPublishDescription'),
            variant: 'destructive',
          })
          setIsPublishing(false)
          return
      }

      const payload = {
            title: title.trim(),
        content: sanitizedContent,
            excerpt: excerpt.trim() || null,
            tags,
            difficulty,
        previewImageUrl,
      }

      const publishedArticle = await publishArticle(payload, draftId)
      
      // После успешной публикации инвалидируем кэш списка и трендовых статей,
      // чтобы на HomePage новые статьи появились сразу, без жесткого перезагруза.
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] })
      
      // id - это строковое представление числового Strapi id
      const articleId = publishedArticle.id
      
      logger.debug('[CreateArticlePage] Article published:', {
        id: publishedArticle.id,
        articleId,
      })
      
      toast({
        title: t('createArticle.articlePublished'),
        description: t('createArticle.articlePublishedDescription'),
      })
      resetPreviewImage()
      setTitle('')
      setContent('')
      setExcerpt('')
      setTags([])
      setTagInput('')
      setDifficulty('medium')
      setDraftId(null)
      setExistingPreviewImageId(null)

      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('draft')
      setSearchParams(nextParams, { replace: true })
      loadedDraftIdRef.current = null

      // Небольшая задержка перед навигацией, чтобы дать время базе данных синхронизироваться
      // Это особенно важно для только что созданных статей
      await new Promise(resolve => setTimeout(resolve, 200))
      
      navigate(`/article/${articleId}`)
    } catch (error: unknown) {
      console.error('Failed to publish article:', error)
      const message =
        typeof error === 'object' && error && 'response' in error
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : error instanceof Error
            ? error.message
            : undefined
      toast({
        title: t('createArticle.publicationFailed'),
        description: message || t('createArticle.publicationFailedDescription'),
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

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return title.trim().length > 0
      case 1:
        return getPlainTextFromHtml(content).trim().length > 0
      case 2:
        return true // Tags and difficulty are optional
      case 3:
        return true // Preview image is optional
      case 4:
        return true // Review is always accessible
      case 5:
        return agreedToTerms // Guidelines requires agreement
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canGoNext()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

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
            <h1 className="text-lg font-semibold">{t('createArticle.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-8 pb-6">
        {/* Stepper - Compact and Modern */}
        <div className="mb-12">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isUpcoming = currentStep < step.id
              const stepNumber = index + 1

              return (
                <div key={step.id} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Step Circle */}
                    <button
                      type="button"
                      onClick={() => (isCompleted || isActive) && setCurrentStep(step.id)}
                      disabled={isUpcoming}
                      className={cn(
                        'relative flex items-center justify-center transition-all duration-200',
                        isActive && 'cursor-default',
                        isCompleted && 'cursor-pointer hover:scale-105',
                        isUpcoming && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <div
                        className={cn(
                          'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 z-10',
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : isCompleted
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 bg-background text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : isActive ? (
                          <StepIcon className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{stepNumber}</span>
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
                      )}
                    </button>
                    {/* Step Label */}
                    <div className="mt-3 text-center min-w-[80px] max-w-[100px]">
                      <p
                        className={cn(
                          'text-xs font-medium transition-colors leading-tight',
                          isActive
                            ? 'text-foreground font-semibold'
                            : isCompleted
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground/50'
                        )}
                      >
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mt-5 relative">
                      <div className="absolute inset-0 bg-border rounded-full" />
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full transition-all duration-500',
                          isCompleted
                            ? 'bg-primary'
                            : 'bg-transparent'
                        )}
                        style={{
                          width: isCompleted ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
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
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">{t('createArticle.articleTitle')}</Label>
            <div className="relative">
            <Input
                      placeholder={isTitleFocused || title.trim() ? '' : t('createArticle.titlePlaceholder')}
              value={title}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, TITLE_MAX_LENGTH)
                  setTitle(newValue)
                }}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                      className="text-3xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground/50 bg-transparent shadow-none break-words pr-20"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      maxLength={TITLE_MAX_LENGTH}
              />
              <div className="absolute bottom-2 right-0 text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH}
              </div>
            </div>
                  <p className="text-xs text-muted-foreground">
                    {t('createArticle.titleHint')}
                  </p>
          </div>

          <Separator />

          <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium">
                    {t('createArticle.excerpt')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
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
                }}
                onFocus={() => setIsExcerptFocused(true)}
                onBlur={() => setIsExcerptFocused(false)}
                className="text-base min-h-[80px] resize-none break-words pr-16"
                rows={3}
                maxLength={EXCERPT_MAX_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {excerpt.length}/{EXCERPT_MAX_LENGTH}
          </div>
            </div>
                  <p className="text-xs text-muted-foreground">
                    {t('createArticle.excerptHint')}
                  </p>
          </div>
              </div>
            )}

            {/* Step 1: Content */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <RichTextEditor
                  id="content-editor"
                  value={content}
                  onChange={setContent}
                  placeholder={t('createArticle.contentPlaceholder')}
                  characterLimit={20000}
                />
              </div>
            )}

            {/* Step 2: Metadata */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <Card>
            <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      {t('createArticle.tags')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('createArticle.tagsDescription')}
                    </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('createArticle.tagsPlaceholder')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag}>{t('createArticle.addTag')}</Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                            className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-xs"
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
            <CardHeader>
                    <CardTitle className="text-lg">{t('createArticle.difficultyLevel')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('createArticle.difficultyLevelDescription')}
                    </p>
            </CardHeader>
            <CardContent>
                    <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                          className="capitalize flex-1"
                          size="lg"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
              </div>
            )}

            {/* Step 3: Preview Image */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <Card>
            <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      {t('createArticle.previewImageTitle')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('createArticle.previewImageDescription')}
                    </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {croppedImageUrl ? (
                <>
                  <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                    <img
                      src={croppedImageUrl}
                      alt="Article preview"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
                      <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                        16:9
                      </Badge>
                      {t('createArticle.perfectForSocial')}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleAdjustCrop}
                      disabled={!originalImageUrl}
                    >
                      <Crop className="h-4 w-4" />
                      {t('createArticle.adjustCrop')}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('createArticle.replaceImage')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={resetPreviewImage}
                    >
                      <XCircle className="h-4 w-4" />
                      {t('createArticle.removeImage')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('createArticle.imageUploadHint')}
                  </p>
                </>
              ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10 px-6 py-16 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
                          <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  </div>
                        <h4 className="mt-6 text-lg font-semibold">{t('createArticle.addHeroImage')}</h4>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                          {t('createArticle.addHeroImageDescription')}
                  </p>
                  <Button
                    className="mt-6 gap-2"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {t('createArticle.uploadImage')}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelection}
              />
            </CardContent>
          </Card>
        </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                {/* Preview Image */}
                {croppedImageUrl && (
                  <div className="mb-8 overflow-hidden rounded-2xl border border-border/40">
                    <img
                      src={croppedImageUrl}
                      alt={title.trim() || 'Article preview'}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                {/* Article Header */}
                <div className="space-y-6">
                  {/* Title */}
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl break-words">
                    {title.trim() || <span className="text-muted-foreground italic">{t('createArticle.untitled')}</span>}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user?.nickname || user?.email || 'You'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{estimateReadTime(getPlainTextFromHtml(content))} min read</span>
                    </div>
                  </div>

                  {/* Tags and Difficulty */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t('createArticle.noTags')}</span>
                    )}
                    <Badge variant="outline" className="capitalize text-xs">
                      {difficulty}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Article Content - Collapsible */}
                <div className="space-y-4">
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {content.trim() ? (
                      <div className="relative">
                        <div
                          ref={contentPreviewRef}
                          className={cn(
                            'text-foreground leading-relaxed break-words transition-all duration-500 ease-in-out',
                            !isContentExpanded && shouldShowExpandButton && 'max-h-[600px] overflow-hidden'
                          )}
                        >
                          <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                        {!isContentExpanded && shouldShowExpandButton && (
                          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">{t('createArticle.noContentYet')}</p>
                    )}
                  </div>
                  {shouldShowExpandButton && (
                    <div className="flex justify-center -mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                        className="gap-2 relative z-10"
                      >
                        {isContentExpanded ? (
                          <>
                            <ChevronRight className="h-4 w-4 rotate-90" />
                            {t('createArticle.showLess')}
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-4 w-4 -rotate-90" />
                            {t('createArticle.showMore')}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Metadata Section - Minimal Design */}
                <div className="space-y-6">
                  {/* Excerpt Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t('createArticle.excerptLabel')}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {excerpt.length} / {EXCERPT_MAX_LENGTH}
                      </span>
                    </div>
                    {excerpt.trim() ? (
                      <p className="text-sm text-foreground leading-relaxed break-words pt-1">
                        {excerpt}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic pt-1">{t('createArticle.noExcerpt')}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{t('createArticle.words')}</p>
                      <p className="text-base font-semibold text-foreground">
                        {getPlainTextFromHtml(content).split(/\s+/).filter(Boolean).length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{t('createArticle.titleLabel')}</p>
                      <p className="text-base font-semibold text-foreground">
                        {title.length} <span className="text-xs font-normal text-muted-foreground">/ {TITLE_MAX_LENGTH}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{t('createArticle.contentLabel')}</p>
                      <p className="text-base font-semibold text-foreground">
                        {getPlainTextFromHtml(content).length.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ {CONTENT_MAX_LENGTH.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Guidelines */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold">{t('createArticle.publishingGuidelines')}</h2>
                  <p className="text-muted-foreground">
                    {t('createArticle.reviewRulesBeforePublishing')}
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Requirements Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{t('createArticle.requirements')}</h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.title')}</p>
                          <p className="text-sm text-muted-foreground">
                            10-{TITLE_MAX_LENGTH} {t('createArticle.charactersClearDescriptive')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.content')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.minWordsMaxChars', { max: CONTENT_MAX_LENGTH.toLocaleString() })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.excerpt')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.optionalUpToChars', { max: EXCERPT_MAX_LENGTH })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Guidelines Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{t('createArticle.guidelines')}</h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.originality')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.originalContentOrAttributed')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.quality')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.wellWrittenInformative')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.formatting')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.properStructureHeadings')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Prohibited Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{t('createArticle.prohibited')}</h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.harmfulContent')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.hatefulDiscriminatoryViolent')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.spamMisinformation')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.clickbaitSpamMisleading')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.copyright')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.noCopyrightViolations')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.inappropriateMedia')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.explicitViolentInappropriate')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Publishing Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{t('createArticle.publishing')}</h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.reviewProcess')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.allArticlesSubjectToReview')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.edits')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.significantChangesMayRequireReview')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.tagsCategories')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.useRelevantTagsDifficulty')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('createArticle.heroImage')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('createArticle.optionalButRecommended')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Important Notes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{t('createArticle.important')}</h3>
                    </div>
                    <p className="text-sm text-foreground pl-7">
                      {t('createArticle.byPublishingYouConfirm')}
                    </p>
                  </div>

                  <Separator />

                  {/* Agreement Checkbox */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agree-terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => {
                          setAgreedToTerms(checked === true)
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 flex-1">
                        <Label
                          htmlFor="agree-terms"
                          className="text-sm font-medium leading-tight cursor-pointer"
                        >
                          {t('createArticle.agreeToGuidelines')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('createArticle.mustAgree')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('createArticle.previous')}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('createArticle.stepCounter', { current: currentStep + 1, total: steps.length })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="gap-2"
                disabled={isSavingDraft || isPublishing || isLoadingDraft}
              >
                <Save className="h-4 w-4" />
                {isSavingDraft ? t('settings.profile.saving') : t('createArticle.saveDraft')}
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || isSavingDraft || isLoadingDraft || !canGoNext()}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isPublishing ? t('createArticle.publishing') : t('createArticle.publish')}
                </Button>
              ) : currentStep === steps.length - 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('createArticle.complete')}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="gap-2"
                >
                  {t('createArticle.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>{t('createArticle.refineHeroImage')}</DialogTitle>
            <DialogDescription>
              {t('createArticle.refineHeroImageDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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
                <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur md:flex">
                  <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                    16:9
                  </Badge>
                  {t('createArticle.balancedFraming')}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm font-medium">
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
                  className="mt-3"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Card className="h-full border-border/60 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t('createArticle.croppingTips')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.aimForClarity')}</p>
                    <p>
                      {t('createArticle.aimForClarityDescription')}
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.resolutionMatters')}</p>
                    <p>
                      {t('createArticle.resolutionMattersDescription')}
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{t('createArticle.needAdjustmentsLater')}</p>
                    <p>
                      {t('createArticle.needAdjustmentsLaterDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={handleCancelCrop} disabled={isProcessingImage}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isProcessingImage || !croppedAreaPixels}
              className="gap-2"
            >
              {isProcessingImage ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t('createArticle.processing')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
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

