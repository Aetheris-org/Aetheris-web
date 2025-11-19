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
import { RichTextEditor, type RichTextEditorRef } from '@/components/RichTextEditor'
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
import { createDraftArticle, updateDraftArticle, getDraftArticle } from '@/api/articles'
import { createArticle, updateArticle } from '@/api/articles-graphql'
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
  const [contentJSON, setContentJSON] = useState<any>(null) // Сохраняем JSON контент для публикации
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
  const editorRef = useRef<RichTextEditorRef | null>(null)
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
          const variant = aside.getAttribute('data-variant') || 'info'
          
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
    const sanitizedContent = content.trim()

    logger.debug('[CreateArticlePage] Validation check:', {
      hasTitle,
      hasBody,
      titleLength: title.trim().length,
      contentLength: plainText.length,
    })

    if (!hasTitle || !hasBody) {
      logger.warn('[CreateArticlePage] Validation failed:', { hasTitle, hasBody })
      toast({
        title: t('createArticle.missingInformation'),
        description: t('createArticle.missingInformationDescription'),
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
        logger.error('[CreateArticlePage] Preview upload failed:', error)
          toast({
          title: t('createArticle.imageUploadFailed'),
          description: t('createArticle.imageUploadFailedPublishDescription'),
            variant: 'destructive',
          })
          setIsPublishing(false)
          return
      }

      // Получаем JSON из TipTap editor для отправки в GraphQL
      logger.debug('[CreateArticlePage] Step 2: Getting JSON from editor...')
      
      // Пытаемся получить JSON из редактора (если он смонтирован)
      let editorJSON: any = null
      if (editorRef.current) {
        try {
          editorJSON = editorRef.current.getJSON()
          logger.debug('[CreateArticlePage] Got JSON from editor ref')
        } catch (error) {
          logger.warn('[CreateArticlePage] Failed to get JSON from editor ref:', error)
        }
      }
      
      // Используем сохраненный JSON из состояния, если редактор размонтирован
      const finalContentJSON = editorJSON || contentJSON
      
      logger.debug('[CreateArticlePage] Editor JSON check:', {
        hasRef: !!editorRef.current,
        hasEditorJSON: !!editorJSON,
        hasSavedJSON: !!contentJSON,
        usingSavedJSON: !editorJSON && !!contentJSON,
        type: finalContentJSON?.type,
        hasContentArray: Array.isArray(finalContentJSON?.content),
        contentLength: Array.isArray(finalContentJSON?.content) ? finalContentJSON.content.length : 'not array',
      })
      
      if (!finalContentJSON) {
        logger.error('[CreateArticlePage] No content JSON available - editor not initialized and no saved JSON')
        toast({
          title: t('createArticle.missingInformation'),
          description: 'Editor is not ready or content is empty. Please add content and try again.',
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }
      
      // Проверяем, что это валидный ProseMirror документ
      if (finalContentJSON.type !== 'doc') {
        logger.error('[CreateArticlePage] Invalid ProseMirror document:', {
          type: finalContentJSON.type,
          contentJSON: finalContentJSON,
        })
        toast({
          title: t('createArticle.missingInformation'),
          description: 'Invalid editor content format. Please try refreshing the page.',
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }
      
      // Проверяем, что есть контент (не пустой документ)
      const hasContent = finalContentJSON.content && Array.isArray(finalContentJSON.content) && finalContentJSON.content.length > 0
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
            
            // НЕ добавляем url в текстовый узел - KeystoneJS не поддерживает это поле
            // Ссылки должны быть обработаны как отдельные узлы типа 'link' на уровне paragraph
            // Это будет обработано позже при нормализации структуры
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
            // Сохраняем язык для code blocks
            if ((node.type === 'codeBlock' || slateType === 'code') && node.attrs.language) {
              result.language = node.attrs.language
            }
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
      if (finalContentJSON && typeof finalContentJSON === 'object') {
        if (finalContentJSON.type === 'doc' && Array.isArray(finalContentJSON.content)) {
          // Извлекаем массив блоков из ProseMirror doc и преобразуем в Slate
          contentDocument = finalContentJSON.content
            .map(convertProseMirrorToSlate)
            .filter((block: any) => block !== null)
          
          logger.debug('[CreateArticlePage] Converted ProseMirror to Slate:', {
            contentLength: contentDocument.length,
            firstBlock: contentDocument[0],
          })
        } else if (Array.isArray(finalContentJSON)) {
          // Уже массив блоков - проверяем формат и преобразуем если нужно
          contentDocument = finalContentJSON
            .map(convertProseMirrorToSlate)
            .filter((block: any) => block !== null)
          
          logger.debug('[CreateArticlePage] Converted array to Slate:', {
            contentLength: contentDocument.length,
          })
        } else {
          // Fallback: создаем пустой параграф
          logger.warn('[CreateArticlePage] Unexpected content format, creating empty paragraph:', finalContentJSON)
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
          title: t('createArticle.missingInformation'),
          description: 'Invalid content format',
          variant: 'destructive',
        })
        setIsPublishing(false)
        return
      }

      // Фильтруем неподдерживаемые типы блоков (например, columns)
      // KeystoneJS document field поддерживает: 'paragraph', 'heading', 'blockquote', 'code', 'divider', 'list-item', 'ordered-list', 'unordered-list', 'layout', 'layout-area'
      // callout конвертируется в blockquote с сохранением variant
      const supportedTypes = ['paragraph', 'heading', 'blockquote', 'code', 'unordered-list', 'ordered-list', 'list-item', 'divider', 'layout', 'layout-area']
      
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
          // Сохраняем кастомные поля (language и т.д.)
          const customFields: any = {}
          if (block.language) customFields.language = block.language
          if (block['data-callout-variant']) customFields['data-callout-variant'] = block['data-callout-variant']
          
          // Нормализуем тип
          if (block.type === 'code-block') {
            block.type = 'code'
          }
          if (block.children.length === 0) {
            block.children = [{ text: '' }]
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
          
          // Восстанавливаем кастомные поля
          Object.assign(block, customFields)
        }

        // Обрабатываем blockId (для anchor блоков)
        // KeystoneJS не принимает кастомные поля, поэтому сохраняем blockId через специальный маркер в тексте
        if (block.blockId) {
          const blockId = block.blockId
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
              // Явно НЕ копируем url - KeystoneJS не поддерживает поле url в текстовых узлах
              // Ссылки должны быть обработаны отдельно как узлы типа 'link'
              // Если url присутствует, просто игнорируем его (ссылка будет потеряна, но структура будет валидной)
              // TODO: Преобразовать ссылки в узлы типа 'link' на этапе convertProseMirrorToSlate
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

      // Финальная очистка: удаляем url из всех текстовых узлов (KeystoneJS не поддерживает это поле)
      const removeUrlFromTextNodes = (node: any): any => {
        if (!node || typeof node !== 'object') return node
        
        // Если это текстовый узел, удаляем url
        if (node.text !== undefined && !node.type) {
          const cleaned = { ...node }
          delete cleaned.url
          return cleaned
        }
        
        // Рекурсивно обрабатываем children
        if (Array.isArray(node.children)) {
          return {
            ...node,
            children: node.children.map(removeUrlFromTextNodes),
          }
        }
        
        return node
      }
      
      contentDocument = contentDocument.map(removeUrlFromTextNodes)

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
          title: t('createArticle.missingInformation'),
          description: 'Invalid content structure. Please try again.',
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

      // Используем GraphQL API для создания/обновления статьи
      const articleData = {
            title: title.trim(),
        content: keystoneContent, // KeystoneJS ожидает массив блоков напрямую
            excerpt: excerpt.trim() || null,
            tags,
            difficulty,
        previewImage: previewImageUrl || undefined,
      }

      logger.debug('[CreateArticlePage] Article data prepared:', {
        title: articleData.title,
        contentLength: contentDocument.length,
        excerpt: articleData.excerpt,
        tags: articleData.tags,
        difficulty: articleData.difficulty,
        hasPreviewImage: !!articleData.previewImage,
      })

      const publishedArticle = draftId
        ? await updateArticle(String(draftId), {
            ...articleData,
            publishedAt: new Date().toISOString(),
          })
        : await createArticle({
            ...articleData,
            publishedAt: new Date().toISOString(),
          })
      
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
      // Определяем articleData и contentDocument для логирования
      let articleDataForLog: any = {}
      let contentDocumentLength = 0
      
      try {
        // Пытаемся получить данные из области видимости выше
        if (typeof contentDocument !== 'undefined' && Array.isArray(contentDocument)) {
          contentDocumentLength = contentDocument.length
        }
        // articleData может быть не определен, если ошибка произошла до его создания
      } catch (e) {
        // Игнорируем ошибки при логировании
      }
      
      logger.error('[CreateArticlePage] Failed to publish article:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        contentDocumentLength,
        articleData: articleDataForLog,
      });
      
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
                  ref={editorRef}
                  id="content-editor"
                  value={content}
                  onChange={(html) => {
                    setContent(html)
                    // Сохраняем JSON контент при каждом изменении, чтобы он был доступен при публикации
                    // даже если редактор размонтирован на других шагах
                    if (editorRef.current) {
                      try {
                        const json = editorRef.current.getJSON()
                        if (json && json.type === 'doc') {
                          setContentJSON(json)
                        }
                      } catch (error) {
                        logger.warn('[CreateArticlePage] Failed to get JSON on change:', error)
                      }
                    }
                  }}
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

