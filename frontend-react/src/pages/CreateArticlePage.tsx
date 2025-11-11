import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle, Crop, Check } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
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

export default function CreateArticlePage() {
  const navigate = useNavigate()
  const { toast } = useToast()

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const originalImageUrlRef = useRef<string | null>(null)
  const selectedImageUrlRef = useRef<string | null>(null)
  const croppedImageUrlRef = useRef<string | null>(null)

  const effectiveImageUrl = selectedImageUrl ?? originalImageUrl

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSaveDraft = async () => {
    try {
      // TODO: Implement save draft logic
      toast({
        title: 'Draft saved',
        description: 'Your article has been saved as a draft.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive',
      })
    }
  }

  const resetPreviewImage = useCallback(() => {
    if (selectedImageUrl && selectedImageUrl !== originalImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl)
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl)
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
      URL.revokeObjectURL(originalImageUrl)
      setOriginalImageUrl(null)
      setCroppedImageBlob(null)
    }
    if (selectedImageUrl && selectedImageUrl !== originalImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
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

      if (selectedUrl) {
        URL.revokeObjectURL(selectedUrl)
      }
      if (originalUrl && originalUrl !== selectedUrl) {
        URL.revokeObjectURL(originalUrl)
      }
      if (croppedUrl && croppedUrl !== originalUrl && croppedUrl !== selectedUrl) {
        URL.revokeObjectURL(croppedUrl)
      }
    }
  }, [])

  const handlePublish = async () => {
    console.log('🚀 handlePublish called')
    const currentUser = useAuthStore.getState().user
    console.log('🚀 Current state:', {
      title: title.trim(),
      content: content.trim(),
      hasImage: !!croppedImageBlob,
      user: currentUser?.nickname
    })

    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to publish articles',
        variant: 'destructive',
      })
      navigate('/auth')
      return
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and content',
        variant: 'destructive',
      })
      return
    }

    setIsPublishing(true)

    try {
      console.log('📝 Publishing article...', { title, tags, difficulty })
      let previewImageId: number | null = null

      if (croppedImageBlob) {
        try {
          console.log('🖼️ Starting preview upload...')
          console.log('🖼️ Cropped image blob size:', croppedImageBlob.size, 'bytes')

          const formData = new FormData()
          formData.append('files', croppedImageBlob, `article-preview-${Date.now()}.jpg`)

          console.log('🖼️ FormData created, sending upload request...')

          const uploadResponse = await apiClient.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })

          console.log('🖼️ Upload response:', uploadResponse)
          previewImageId = uploadResponse.data?.[0]?.id ?? null
          console.log('🖼️ Preview image ID:', previewImageId)
        } catch (error) {
          console.error('❌ Preview upload failed:', error)
          toast({
            title: 'Image upload failed',
            description: 'Preview upload did not complete. You can retry or proceed without it.',
            variant: 'destructive',
          })
          setIsPublishing(false)
          return
        }
      }

      const response = await apiClient.post(
        '/api/articles',
        {
          data: {
            title: title.trim(),
            content: content.trim(),
            excerpt: excerpt.trim() || null,
            tags,
            difficulty,
            publishedAt: new Date().toISOString(),
            preview_image: previewImageId,
          },
        },
        {
          headers: {
            'X-Require-Auth': 'true',
          },
        }
      )

      console.log('✅ Article published successfully:', response.data)
      
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

      navigate('/')
    } catch (error: any) {
      console.error('❌ Failed to publish article:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to publish article',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
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
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
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
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Input
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
          </div>

          <Separator />

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Input
              id="excerpt"
              placeholder="Brief description of your article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              placeholder="Write your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[400px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
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
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview image</CardTitle>
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
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10 px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="mt-4 text-base font-semibold">Add a hero image</h4>
                  <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                    The preview appears on article cards, the homepage, and social shares. Recommended size 1200×630px.
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

