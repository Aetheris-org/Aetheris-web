import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle, Crop, Check, ChevronRight, ChevronLeft, FileText, Tag, Image as ImageIcon, Type, User, Calendar, Clock, Heart, Bookmark, Share2 } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i

// TODO: Add the same character limit validation on the backend (Strapi schema)
const EXCERPT_MAX_LENGTH = 500

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
  const excerptTextareaRef = useRef<HTMLTextAreaElement | null>(null)
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
        title: 'Authentication required',
        description: 'Sign in to save drafts.',
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
        title: 'Add content first',
        description: 'Start by adding a title or some content before saving.',
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
          title: 'Image upload failed',
          description: 'We could not upload the preview image. Try again or continue without it.',
          variant: 'destructive',
        })
        setIsSavingDraft(false)
        return
      }

      const payload = {
        title: title.trim() || 'Untitled draft',
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
        title: 'Draft saved',
        description: 'Your latest changes are safe.',
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
        title: 'Unable to save draft',
        description: message || 'Please try again or copy your content before leaving.',
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
        title: 'Unsupported file',
        description: 'Please choose an image file (JPG, PNG, WEBP).',
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
        title: 'Image processing failed',
        description: 'We could not process this image. Try another one.',
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
            title: 'Unable to load draft',
            description: 'We could not open this draft. It may have been removed.',
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
        title: 'Authentication required',
        description: 'You must be logged in to publish articles',
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
        title: 'Missing information',
        description: 'Add a title and the main content before publishing.',
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
          title: 'Image upload failed',
          description: 'Preview upload did not complete. You can retry or publish without it.',
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
        title: 'Article published!',
        description: 'Your article is now live.',
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
        title: 'Publication failed',
        description: message || 'Something went wrong while publishing your article.',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const steps = [
    {
      id: 0,
      label: 'Basic Info',
      icon: Type,
      description: 'Title and excerpt',
    },
    {
      id: 1,
      label: 'Content',
      icon: FileText,
      description: 'Article content',
    },
    {
      id: 2,
      label: 'Metadata',
      icon: Tag,
      description: 'Tags and difficulty',
    },
    {
      id: 3,
      label: 'Preview',
      icon: ImageIcon,
      description: 'Hero image',
    },
    {
      id: 4,
      label: 'Review',
      icon: Eye,
      description: 'Final preview',
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
            <h1 className="text-lg font-semibold">Create Article</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="gap-2"
              disabled={isSavingDraft || isPublishing || isLoadingDraft}
            >
              <Save className="h-4 w-4" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || isSavingDraft || isLoadingDraft}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stepper - Compact and Modern */}
        <div className="mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isUpcoming = currentStep < step.id
              const stepNumber = index + 1

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex flex-1 items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        type="button"
                        onClick={() => (isCompleted || isActive) && setCurrentStep(step.id)}
                        disabled={isUpcoming}
                        className={cn(
                          'relative flex items-center justify-center transition-all duration-300',
                          isActive && 'cursor-default',
                          isCompleted && 'cursor-pointer',
                          isUpcoming && 'cursor-not-allowed'
                        )}
                      >
                        <div
                          className={cn(
                            'relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground scale-110'
                              : isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-muted text-muted-foreground'
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-semibold">{stepNumber}</span>
                          )}
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        )}
                      </button>
                      {/* Step Label */}
                      <div className="mt-3 text-center">
                        <p
                          className={cn(
                            'text-xs font-medium transition-colors',
                            isActive
                              ? 'text-foreground'
                              : isCompleted
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground/60'
                          )}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="mx-2 flex-1 h-px relative">
                        <div
                          className={cn(
                            'absolute inset-0 transition-all duration-500',
                            isCompleted
                              ? 'bg-primary'
                              : isActive
                                ? 'bg-primary/30'
                                : 'bg-border'
                          )}
                          style={{
                            width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                          }}
                        />
                      </div>
                    )}
                  </div>
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
                  <Label className="text-sm font-medium text-muted-foreground">Article Title</Label>
            <Input
                    placeholder={isTitleFocused || title.trim() ? '' : 'Enter your article title...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
                    className="text-3xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none placeholder:text-muted-foreground/50 bg-transparent shadow-none break-words"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            />
                  <p className="text-xs text-muted-foreground">
                    Choose a clear, descriptive title that captures the essence of your article.
                  </p>
          </div>

          <Separator />

          <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium">
                    Excerpt <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
            <div className="relative">
              <Textarea
                id="excerpt"
                ref={excerptTextareaRef}
                placeholder={isExcerptFocused || excerpt.trim() ? '' : 'Brief description of your article...'}
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
                    A short summary that appears in article previews and search results.
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
                      Article Content
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Rich text editor with formatting, shortcuts, and live previews
                    </span>
                  </div>
                  <RichTextEditor
                    id="content-editor"
                    ariaLabelledBy="content-editor-label"
              value={content}
                    onChange={setContent}
                    placeholder="Start writing your article content here..."
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
                      Tags
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add tags to help readers find your article. Press Enter to add.
                    </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
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
                            className="cursor-pointer hover:bg-secondary/80 transition-colors"
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
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
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

                {/* Article Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {content.trim() ? (
                    <div
                      className="text-foreground leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">No content yet</p>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Metadata Section - Visually Separated */}
                <Card className="border-border/60 bg-muted/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Article Metadata</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete information about your article
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Excerpt */}
                    {excerpt.trim() ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Excerpt</Label>
                        <p className="text-base text-muted-foreground leading-relaxed">{excerpt}</p>
                        <p className="text-xs text-muted-foreground">
                          {excerpt.length} / {EXCERPT_MAX_LENGTH} characters
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Excerpt</Label>
                        <p className="text-sm text-muted-foreground italic">No excerpt provided</p>
                      </div>
                    )}

                    <Separator />

                    {/* Tags and Difficulty */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Tags</Label>
                        {tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No tags added</p>
                        )}
                        <p className="text-xs text-muted-foreground">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Difficulty Level</Label>
                        <Badge variant="outline" className="capitalize text-base px-3 py-1">
                          {difficulty}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Preview Image Info */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Preview Image</Label>
                      {croppedImageUrl ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600 dark:text-green-400">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                          <p className="text-sm text-muted-foreground">Hero image is ready</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No preview image</p>
                      )}
                    </div>

                    <Separator />

                    {/* Detailed Statistics */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Content Statistics</Label>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Title</p>
                          <p className="text-lg font-semibold">{title.length}</p>
                          <p className="text-xs text-muted-foreground">characters</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Content</p>
                          <p className="text-lg font-semibold">
                            {getPlainTextFromHtml(content).length}
                          </p>
                          <p className="text-xs text-muted-foreground">characters</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Words</p>
                          <p className="text-lg font-semibold">
                            {getPlainTextFromHtml(content).split(/\s+/).filter(Boolean).length}
                          </p>
                          <p className="text-xs text-muted-foreground">total</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Reading Time</p>
                          <p className="text-lg font-semibold">
                            {estimateReadTime(getPlainTextFromHtml(content))}
                          </p>
                          <p className="text-xs text-muted-foreground">minutes</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">Author</Label>
                        <p className="text-sm text-muted-foreground">
                          {user?.nickname || user?.email || 'Not specified'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">Status</Label>
                        <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                          Draft
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

            <Button
              onClick={handleNext}
              disabled={!canGoNext() || currentStep === steps.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
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

