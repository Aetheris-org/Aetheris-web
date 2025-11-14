import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle, Crop, Check, ChevronRight, ChevronLeft, FileText, Tag, Image as ImageIcon, Type, User, Calendar, Clock, Heart, Bookmark, Share2, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
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
  const [existingPreviewImageId, setExistingPreviewImageId] = useState<number | null>(null)
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

  const uploadPreviewImageAsset = useCallback(async (): Promise<number | null> => {
    if (!croppedImageBlob) {
      return existingPreviewImageId ?? null
    }

    const formData = new FormData()
    formData.append('files', croppedImageBlob, `article-preview-${Date.now()}.jpg`)

    const uploadResponse = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const newId = uploadResponse.data?.[0]?.id ?? null
    setExistingPreviewImageId(newId)
    setCroppedImageBlob(null)
    return newId
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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
      let previewImageId: number | null = null

      try {
        previewImageId = await uploadPreviewImageAsset()
    } catch (error) {
        console.error('Preview upload failed', error)
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
        previewImageId,
      }

      const saved = draftId
        ? await updateDraftArticle(draftId, payload)
        : await createDraftArticle(payload)

      setDraftId(saved.databaseId)
      setExistingPreviewImageId(saved.previewImageId ?? null)
      if (saved.previewImage) {
        setCroppedImageUrl(saved.previewImage)
        croppedImageUrlRef.current = saved.previewImage
      }

      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('draft', String(saved.databaseId))
      setSearchParams(nextParams, { replace: true })
      loadedDraftIdRef.current = saved.databaseId

      toast({
        title: t('createArticle.draftSaved'),
        description: t('createArticle.draftSavedDescription'),
      })
    } catch (error: unknown) {
      console.error('Failed to save draft', error)
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
      console.error('Failed to crop image', error)
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
        setDraftId(draft.databaseId)
        setTitle(draft.title ?? '')
        setContent(normalizeRichText(draft.content))
        setExcerpt(draft.excerpt ?? '')
        setTags(draft.tags ?? [])
        const nextDifficulty =
          draft.difficulty && ['easy', 'medium', 'hard'].includes(draft.difficulty)
            ? (draft.difficulty as typeof difficulty)
            : 'medium'
        setDifficulty(nextDifficulty)
        setExistingPreviewImageId(draft.previewImageId ?? null)
        setOriginalImageUrl(null)
        setSelectedImageUrl(null)
        setCroppedImageBlob(null)
        setCroppedAreaPixels(null)
        if (draft.previewImage) {
          setCroppedImageUrl(draft.previewImage)
          croppedImageUrlRef.current = draft.previewImage
        }
      } catch (error) {
        console.error('Failed to load draft', error)
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
      let previewImageId: number | null = null

      try {
        previewImageId = await uploadPreviewImageAsset()
        } catch (error) {
        console.error('Preview upload failed', error)
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
        previewImageId,
      }

      const publishedArticle = await publishArticle(payload, draftId)
      
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

      navigate(`/article/${publishedArticle.databaseId}`)
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
              Back
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
                <div className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Label id="content-editor-label" htmlFor="content-editor" className="text-base font-medium">
                      {t('createArticle.content')}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {t('createArticle.contentHint')}
                    </span>
                  </div>
                  <RichTextEditor
                    id="content-editor"
                    ariaLabelledBy="content-editor-label"
              value={content}
                    onChange={setContent}
                    placeholder={t('createArticle.contentPlaceholder')}
                    characterLimit={20000}
            />
          </div>
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
                <Button onClick={handleAddTag}>Add</Button>
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
                    <CardTitle className="text-lg">Difficulty Level</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select the difficulty level that best matches your article content.
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
                      Preview Image
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload a hero image that appears on article cards, homepage, and social shares. Recommended size
                      1200×630px.
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
                      Perfect for social previews
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
                      Adjust crop
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Replace image
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={resetPreviewImage}
                    >
                      <XCircle className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload JPG, PNG, or WEBP up to 5MB. You can always readjust the crop later.
                  </p>
                </>
              ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10 px-6 py-16 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
                          <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  </div>
                        <h4 className="mt-6 text-lg font-semibold">Add a hero image</h4>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                          The preview appears on article cards, the homepage, and social shares. Recommended size
                          1200×630px.
                  </p>
                  <Button
                    className="mt-6 gap-2"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload image
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
                    {title.trim() || <span className="text-muted-foreground italic">Untitled</span>}
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
                      <p className="text-muted-foreground italic">No content yet</p>
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
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-4 w-4 -rotate-90" />
                            Show more content
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Metadata Section - Visually Separated */}
                <Card className="border-border/60 bg-muted/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Article Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Tags */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                        {tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags</p>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
                        <div>
                          <Badge variant="outline" className="capitalize w-fit">
                            {difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {excerpt.trim() && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Excerpt</Label>
                          <p className="text-sm text-foreground leading-relaxed break-words">{excerpt}</p>
                          <p className="text-xs text-muted-foreground">
                            {excerpt.length} / {EXCERPT_MAX_LENGTH} characters
                          </p>
                        </div>
                      </>
                    )}

                    {/* Statistics */}
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Statistics</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Words</p>
                          <p className="text-base font-semibold">
                            {getPlainTextFromHtml(content).split(/\s+/).filter(Boolean).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Title</p>
                          <p className="text-base font-semibold">
                            {title.length} / {TITLE_MAX_LENGTH}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Content</p>
                          <p className="text-base font-semibold">
                            {getPlainTextFromHtml(content).length} / {CONTENT_MAX_LENGTH}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Guidelines */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold">Publishing Guidelines</h2>
                  <p className="text-muted-foreground">
                    Review the rules and requirements before publishing your article
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Content Requirements */}
                  <Card className="border-green-200 dark:border-green-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Title</p>
                            <p className="text-xs text-muted-foreground">
                              10-{TITLE_MAX_LENGTH} characters, clear and descriptive
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Content</p>
                            <p className="text-xs text-muted-foreground">
                              Min 100 words, max {CONTENT_MAX_LENGTH.toLocaleString()} characters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Excerpt</p>
                            <p className="text-xs text-muted-foreground">
                              Optional, up to {EXCERPT_MAX_LENGTH} characters
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Guidelines */}
                  <Card className="border-blue-200 dark:border-blue-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Originality</p>
                            <p className="text-xs text-muted-foreground">
                              Original content or properly attributed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Quality</p>
                            <p className="text-xs text-muted-foreground">
                              Well-written, informative, valuable content
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Formatting</p>
                            <p className="text-xs text-muted-foreground">
                              Proper structure, headings, readability
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prohibited Content */}
                  <Card className="border-red-200 dark:border-red-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        Prohibited
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Harmful Content</p>
                            <p className="text-xs text-muted-foreground">
                              Hateful, discriminatory, or violent content
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Spam & Misinformation</p>
                            <p className="text-xs text-muted-foreground">
                              Clickbait, spam, misleading information
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Copyright</p>
                            <p className="text-xs text-muted-foreground">
                              No copyright or IP violations
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Inappropriate Media</p>
                            <p className="text-xs text-muted-foreground">
                              Explicit, violent, or inappropriate images
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Publishing Rules */}
                  <Card className="border-amber-200 dark:border-amber-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Publishing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Review Process</p>
                            <p className="text-xs text-muted-foreground">
                              All articles are subject to review
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Edits</p>
                            <p className="text-xs text-muted-foreground">
                              Significant changes may require re-review
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Tags & Categories</p>
                            <p className="text-xs text-muted-foreground">
                              Use relevant tags and difficulty levels
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Hero Image</p>
                            <p className="text-xs text-muted-foreground">
                              Optional but recommended for visibility
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Important Notes */}
                <div className="rounded-lg border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Important</p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        By publishing, you confirm that you have read and agree to follow all guidelines. 
                        Violations may result in content removal or account restrictions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className={cn(
                  "flex items-start space-x-4 rounded-lg border-2 p-5 transition-all",
                  agreedToTerms 
                    ? "border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-950/20" 
                    : "border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                )}>
                  <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => {
                      setAgreedToTerms(checked === true)
                    }}
                    className={cn(
                      "mt-0.5 h-5 w-5",
                      agreedToTerms 
                        ? "border-green-500 dark:border-green-400 data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-400" 
                        : "border-red-500 dark:border-red-400"
                    )}
                  />
                  <div className="space-y-2 flex-1">
                    <Label
                      htmlFor="agree-terms"
                      className={cn(
                        "text-base font-semibold leading-tight cursor-pointer block flex items-center",
                        agreedToTerms 
                          ? "text-green-700 dark:text-green-300" 
                          : "text-red-700 dark:text-red-300"
                      )}
                    >
                      <div 
                        className="transition-all duration-500 overflow-visible flex items-center flex-shrink-0 justify-end"
                        style={{
                          width: agreedToTerms ? '0' : '32px',
                          opacity: agreedToTerms ? 0 : 1,
                          marginRight: agreedToTerms ? '0' : '8px',
                          paddingLeft: agreedToTerms ? '0' : '4px',
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        {!agreedToTerms && (
                          <ChevronLeft className="h-4 w-4 animate-point-to-checkbox text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <span 
                        className="transition-all duration-500 inline-block"
                        style={{
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        I confirm that I have read and agree to follow all publishing guidelines and rules
                      </span>
                    </Label>
                    <p className={cn(
                      "text-sm",
                      agreedToTerms 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      You must check this box to proceed with publishing your article.
                    </p>
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
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
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
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || isSavingDraft || isLoadingDraft || !canGoNext()}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              ) : currentStep === steps.length - 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="gap-2"
                >
                  Next
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
            <DialogTitle>Refine your hero image</DialogTitle>
            <DialogDescription>
              Drag to reframe the focus area. The preview below keeps a cinematic 16:9 ratio for article cards
              and social sharing.
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
                    Waiting for image...
                  </div>
                )}
                <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur md:flex">
                  <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                    16:9
                  </Badge>
                  Balanced framing
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Zoom</span>
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
                  <CardTitle className="text-base font-semibold">Cropping tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Aim for clarity</p>
                    <p>
                      Keep the subject centered and avoid placing important details near the frame edges. The crop is
                      responsive and scales across devices.
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Resolution matters</p>
                    <p>
                      Higher resolution assets deliver sharper cards. For best results use images at least{' '}
                      <span className="font-medium text-foreground">1200×630px</span>.
                    </p>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Need adjustments later?</p>
                    <p>
                      You can reopen this editor anytime after uploading. The original image stays intact until you
                      confirm the crop.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={handleCancelCrop} disabled={isProcessingImage}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isProcessingImage || !croppedAreaPixels}
              className="gap-2"
            >
              {isProcessingImage ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Use image
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

