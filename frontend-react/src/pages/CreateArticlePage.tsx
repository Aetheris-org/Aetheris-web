import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, ImagePlus, RefreshCw, XCircle } from 'lucide-react'
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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const resetPreviewImage = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl)
    }
    setSelectedImageUrl(null)
    setCroppedImageUrl(null)
    setCroppedImageBlob(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }

    const url = URL.createObjectURL(file)
    setSelectedImageUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropDialogOpen(true)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirmCrop = useCallback(async () => {
    if (!selectedImageUrl || !croppedAreaPixels) {
      return
    }

    try {
      const blob = await createCroppedImageBlob(selectedImageUrl, croppedAreaPixels)
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl)
      }
      const objectUrl = URL.createObjectURL(blob)
      setCroppedImageBlob(blob)
      setCroppedImageUrl(objectUrl)
      URL.revokeObjectURL(selectedImageUrl)
      setSelectedImageUrl(null)
      setIsCropDialogOpen(false)
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
    }
  }, [croppedAreaPixels, croppedImageUrl, selectedImageUrl, toast])

  const handleCancelCrop = useCallback(() => {
    setIsCropDialogOpen(false)
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
      setSelectedImageUrl(null)
    }
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (!croppedImageBlob && !croppedImageUrl && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [croppedImageBlob, croppedImageUrl, selectedImageUrl])

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl)
      }
    }
  }, [selectedImageUrl, croppedImageUrl])

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
            <CardContent className="space-y-4">
              {croppedImageUrl ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border bg-muted/20">
                    <img
                      src={croppedImageUrl}
                      alt="Article preview"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click()
                        }
                      }}
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10 py-12 text-center">
                  <ImagePlus className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Add a hero image to make your article stand out. Recommended size 1200×630px.
                  </p>
                  <Button
                    className="mt-4 gap-2"
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adjust preview image</DialogTitle>
            <DialogDescription>
              Drag to reframe the shot. Use the slider to zoom. We’ll crop it to a 16:9 ratio.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl bg-muted/40">
            {selectedImageUrl && (
              <Cropper
                image={selectedImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            )}
          </div>
          <div className="mt-6 space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
            />
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={handleCancelCrop}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCrop}>Use image</Button>
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

