import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Palette,
  Shield,
  Monitor,
  Bell,
  CreditCard,
  Camera,
  ImagePlus,
  Trash2,
  Loader2,
  Crop,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Rows,
  List,
  LayoutGrid,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { updateUserProfile, uploadProfileMedia } from '@/api/profile'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  useThemeStore,
  ACCENT_COLOR_PRESETS,
  buildCustomAccentOption,
  DEFAULT_RADIUS,
  type ThemeMode,
  type ResolvedTheme,
} from '@/stores/themeStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { cn } from '@/lib/utils'

const settingsNav = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

const themeModeOptions: Array<{
  value: ThemeMode
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces with crisp contrast',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-light friendly interface',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match your OS preference automatically',
    icon: Monitor,
  },
]

const viewModeOptions: Array<{
  value: 'default' | 'line' | 'square'
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    value: 'default',
    label: 'Standard cards',
    description: 'Balanced layout with imagery',
    icon: Rows,
  },
  {
    value: 'line',
    label: 'Compact list',
    description: 'Dense layout, great for scanning',
    icon: List,
  },
  {
    value: 'square',
    label: 'Grid view',
    description: 'Visual tiles for inspiration',
    icon: LayoutGrid,
  },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const entryPathRef = useRef<string | null>(null)
  
  const currentSection = location.pathname.split('/').pop() || 'profile'

  useEffect(() => {
    if (!entryPathRef.current) {
      const state = location.state as { from?: string } | null
      entryPathRef.current = state?.from ?? '/'
    }
  }, [location.state])

  const handleBack = () => {
    const fallback = entryPathRef.current ?? '/'
    navigate(fallback, { replace: true })
  }

  const handleSectionNavigate = (sectionId: string) => {
    const targetPath = `/settings/${sectionId}`
    if (location.pathname !== targetPath) {
      navigate(targetPath, {
        replace: true,
        state: { from: entryPathRef.current ?? '/' },
      })
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
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon
              const isActive = currentSection === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => handleSectionNavigate(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {currentSection === 'profile' && <ProfileSettings />}
            {currentSection === 'appearance' && <AppearanceSettings />}
            {currentSection === 'privacy' && <PrivacySettings />}
            {currentSection === 'notifications' && <NotificationsSettings />}
            {currentSection === 'sessions' && <SessionsSettings />}
            {currentSection === 'billing' && <BillingSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

const BIO_LIMIT = 280

function ProfileSettings() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }))

  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null)
  const [coverPreview, setCoverPreview] = useState<string | null>(user?.coverImage ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAvatarProcessing, setIsAvatarProcessing] = useState(false)
  const [isCoverProcessing, setIsCoverProcessing] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const initialNickname = user?.nickname ?? ''
  const initialBio = user?.bio ?? ''
  const initialAvatar = user?.avatar ?? null
  const initialCover = user?.coverImage ?? null

  const [avatarCropSource, setAvatarCropSource] = useState<string | null>(null)
  const [coverCropSource, setCoverCropSource] = useState<string | null>(null)
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false)
  const [isCoverCropOpen, setIsCoverCropOpen] = useState(false)
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 })
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 })
  const [avatarZoom, setAvatarZoom] = useState(1)
  const [coverZoom, setCoverZoom] = useState(1)
  const [avatarCroppedArea, setAvatarCroppedArea] = useState<Area | null>(null)
  const [coverCroppedArea, setCoverCroppedArea] = useState<Area | null>(null)

  const revokeObjectUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  useEffect(() => {
    setNickname(initialNickname)
    setBio(initialBio ?? '')
    setAvatarRemoved(false)
    setCoverRemoved(false)
    setAvatarFile(null)
    setCoverFile(null)

    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        revokeObjectUrl(prev)
      }
      return initialAvatar
    })

    setCoverPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        revokeObjectUrl(prev)
      }
      return initialCover
    })

    revokeObjectUrl(avatarCropSource)
    revokeObjectUrl(coverCropSource)
    setAvatarCropSource(null)
    setCoverCropSource(null)
    setAvatarCrop({ x: 0, y: 0 })
    setCoverCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setCoverZoom(1)
    setAvatarCroppedArea(null)
    setCoverCroppedArea(null)
  }, [initialNickname, initialBio, initialAvatar, initialCover])

  useEffect(() => {
    return () => {
      revokeObjectUrl(avatarPreview)
      revokeObjectUrl(coverPreview)
      revokeObjectUrl(avatarCropSource)
      revokeObjectUrl(coverCropSource)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Unsupported file',
        description: 'Please choose an image (JPG, PNG, or WEBP).',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    revokeObjectUrl(avatarCropSource)
    const objectUrl = URL.createObjectURL(file)
    setAvatarCropSource(objectUrl)
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setAvatarCroppedArea(null)
    setIsAvatarCropOpen(true)
    event.target.value = ''
  }

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Unsupported file',
        description: 'Please choose an image (JPG, PNG, or WEBP).',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    revokeObjectUrl(coverCropSource)
    const objectUrl = URL.createObjectURL(file)
    setCoverCropSource(objectUrl)
    setCoverCrop({ x: 0, y: 0 })
    setCoverZoom(1)
    setCoverCroppedArea(null)
    setIsCoverCropOpen(true)
    event.target.value = ''
  }

  const handleAdjustAvatarCrop = () => {
    if (!avatarPreview || !avatarPreview.startsWith('blob:')) return
    setAvatarCropSource(avatarPreview)
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setAvatarCroppedArea(null)
    setIsAvatarCropOpen(true)
  }

  const handleAdjustCoverCrop = () => {
    if (!coverPreview || !coverPreview.startsWith('blob:')) return
    setCoverCropSource(coverPreview)
    setCoverCrop({ x: 0, y: 0 })
    setCoverZoom(1)
    setCoverCroppedArea(null)
    setIsCoverCropOpen(true)
  }

  const handleCancelAvatarCrop = () => {
    setIsAvatarProcessing(false)
    setIsAvatarCropOpen(false)
    if (avatarCropSource && avatarCropSource !== avatarPreview) {
      revokeObjectUrl(avatarCropSource)
    }
    setAvatarCropSource(avatarPreview)
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setAvatarCroppedArea(null)
  }

  const handleCancelCoverCrop = () => {
    setIsCoverProcessing(false)
    setIsCoverCropOpen(false)
    if (coverCropSource && coverCropSource !== coverPreview) {
      revokeObjectUrl(coverCropSource)
    }
    setCoverCropSource(coverPreview)
    setCoverCrop({ x: 0, y: 0 })
    setCoverZoom(1)
    setCoverCroppedArea(null)
  }

  const handleAvatarCropComplete = (_: Area, cropped: Area) => {
    setAvatarCroppedArea(cropped)
  }

  const handleCoverCropComplete = (_: Area, cropped: Area) => {
    setCoverCroppedArea(cropped)
  }

  const handleConfirmAvatarCrop = async () => {
    if (!avatarCropSource || !avatarCroppedArea) return
    setIsAvatarProcessing(true)
    try {
      const blob = await createCroppedImageBlob(avatarCropSource, avatarCroppedArea)
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)

      if (avatarPreview && avatarPreview !== avatarCropSource) {
        revokeObjectUrl(avatarPreview)
      }
      if (avatarCropSource && avatarCropSource !== previewUrl) {
        revokeObjectUrl(avatarCropSource)
      }

      setAvatarPreview(previewUrl)
      setAvatarFile(file)
      setAvatarRemoved(false)
      setAvatarCropSource(previewUrl)
      setAvatarCrop({ x: 0, y: 0 })
      setAvatarZoom(1)
      setAvatarCroppedArea(null)
      setIsAvatarCropOpen(false)
    } catch (error) {
      console.error('Failed to crop avatar image', error)
      toast({
        title: 'Image processing failed',
        description: 'We could not process this avatar. Try another image.',
        variant: 'destructive',
      })
    } finally {
      setIsAvatarProcessing(false)
    }
  }

  const handleConfirmCoverCrop = async () => {
    if (!coverCropSource || !coverCroppedArea) return
    setIsCoverProcessing(true)
    try {
      const blob = await createCroppedImageBlob(coverCropSource, coverCroppedArea)
      const file = new File([blob], `cover-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)

      if (coverPreview && coverPreview !== coverCropSource) {
        revokeObjectUrl(coverPreview)
      }
      if (coverCropSource && coverCropSource !== previewUrl) {
        revokeObjectUrl(coverCropSource)
      }

      setCoverPreview(previewUrl)
      setCoverFile(file)
      setCoverRemoved(false)
      setCoverCropSource(previewUrl)
      setCoverCrop({ x: 0, y: 0 })
      setCoverZoom(1)
      setCoverCroppedArea(null)
      setIsCoverCropOpen(false)
    } catch (error) {
      console.error('Failed to crop cover image', error)
      toast({
        title: 'Image processing failed',
        description: 'We could not process this cover image. Try another one.',
        variant: 'destructive',
      })
    } finally {
      setIsCoverProcessing(false)
    }
  }

  const handleRemoveAvatar = () => {
    revokeObjectUrl(avatarPreview)
    revokeObjectUrl(avatarCropSource)
    setAvatarPreview(null)
    setAvatarCropSource(null)
    setAvatarFile(null)
    setAvatarRemoved(true)
    setAvatarCroppedArea(null)
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
  }

  const handleRemoveCover = () => {
    revokeObjectUrl(coverPreview)
    revokeObjectUrl(coverCropSource)
    setCoverPreview(null)
    setCoverCropSource(null)
    setCoverFile(null)
    setCoverRemoved(true)
    setCoverCroppedArea(null)
    setCoverCrop({ x: 0, y: 0 })
    setCoverZoom(1)
  }

  const handleCancel = () => {
    revokeObjectUrl(avatarPreview)
    revokeObjectUrl(coverPreview)
    revokeObjectUrl(avatarCropSource)
    revokeObjectUrl(coverCropSource)
    setNickname(initialNickname)
    setBio(initialBio ?? '')
    setAvatarPreview(initialAvatar)
    setCoverPreview(initialCover)
    setAvatarFile(null)
    setCoverFile(null)
    setAvatarRemoved(false)
    setCoverRemoved(false)
    setAvatarCropSource(null)
    setCoverCropSource(null)
    setAvatarCrop({ x: 0, y: 0 })
    setCoverCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setCoverZoom(1)
    setAvatarCroppedArea(null)
    setCoverCroppedArea(null)
  }

  const hasTextChanges =
    nickname.trim() !== initialNickname || (bio ?? '').trim() !== (initialBio ?? '')
  const hasImageChanges =
    avatarFile !== null ||
    coverFile !== null ||
    avatarRemoved !== false ||
    coverRemoved !== false

  const hasChanges = hasTextChanges || hasImageChanges
  const bioLength = bio?.length ?? 0
  const bioRemaining = BIO_LIMIT - bioLength

  const handleSave = async () => {
    if (!user) return

    const trimmedNickname = nickname.trim()
    if (trimmedNickname.length < 3) {
      toast({
        title: 'Nickname too short',
        description: 'Nickname must be at least 3 characters long.',
        variant: 'destructive',
      })
      return
    }

    if (bioLength > BIO_LIMIT) {
      toast({
        title: 'Bio is too long',
        description: `Bio must be ${BIO_LIMIT} characters or less.`,
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      let avatarId: number | null | undefined
      let coverImageId: number | null | undefined

      if (avatarFile) {
        const upload = await uploadProfileMedia(avatarFile)
        avatarId = upload.id
      } else if (avatarRemoved) {
        avatarId = null
      }

      if (coverFile) {
        const upload = await uploadProfileMedia(coverFile)
        coverImageId = upload.id
      } else if (coverRemoved) {
        coverImageId = null
      }

      const updatedUser = await updateUserProfile(user.id, {
        username: trimmedNickname,
        bio: bio.trim() || null,
        avatarId,
        coverImageId,
      })

      setUser({
        ...updatedUser,
        bio: updatedUser.bio ?? undefined,
      })

      setAvatarFile(null)
      setCoverFile(null)
      setAvatarRemoved(false)
      setCoverRemoved(false)
      setNickname(updatedUser.nickname)
      setBio(updatedUser.bio ?? '')

      revokeObjectUrl(avatarPreview)
      revokeObjectUrl(coverPreview)
      setAvatarPreview(updatedUser.avatar ?? null)
      setCoverPreview(updatedUser.coverImage ?? null)
      setAvatarCropSource(null)
      setCoverCropSource(null)
      setAvatarCrop({ x: 0, y: 0 })
      setCoverCrop({ x: 0, y: 0 })
      setAvatarZoom(1)
      setCoverZoom(1)
      setAvatarCroppedArea(null)
      setCoverCroppedArea(null)

      await queryClient.invalidateQueries({ queryKey: ['profile', user.id] })

      toast({
        title: 'Profile updated',
        description: 'Your profile information was saved successfully.',
      })
    } catch (error: any) {
      console.error('Failed to update profile', error)
      toast({
        title: 'Update failed',
        description:
          error?.response?.data?.error?.message ?? 'Something went wrong while saving your profile.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update how your profile appears to other readers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold tracking-wide text-muted-foreground">
              Profile cover
            </Label>
            <span className="text-xs text-muted-foreground">Recommended 1600 × 400px</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-dashed bg-muted/20">
            <div className="aspect-[3/1] w-full">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Profile cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">No cover image yet</p>
                  <p className="text-xs text-muted-foreground">
                    Add a banner to personalize your profile.
                  </p>
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-end gap-2 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => coverInputRef.current?.click()}
                disabled={isSaving || isCoverProcessing}
              >
                <Camera className="h-4 w-4" />
                {coverPreview ? 'Change cover' : 'Upload cover'}
              </Button>
              {coverPreview?.startsWith('blob:') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleAdjustCoverCrop}
                  disabled={isSaving || isCoverProcessing}
                >
                  <Crop className="h-4 w-4" />
                  Adjust crop
                </Button>
              )}
              {coverPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleRemoveCover}
                  disabled={isSaving || isCoverProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-sm font-semibold tracking-wide text-muted-foreground">
            Avatar
          </Label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted/60">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {(nickname || initialNickname).charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isSaving || isAvatarProcessing}
              >
                <Camera className="h-4 w-4" />
                {avatarPreview ? 'Change avatar' : 'Upload avatar'}
              </Button>
              {avatarPreview?.startsWith('blob:') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleAdjustAvatarCrop}
                  disabled={isSaving || isAvatarProcessing}
                >
                  <Crop className="h-4 w-4" />
                  Adjust crop
                </Button>
              )}
              {avatarPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={isSaving || isAvatarProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="settings-nickname">Nickname</Label>
            <Input
              id="settings-nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="fluy1337"
              maxLength={60}
              disabled={isSaving}
            />
        </div>
        <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="settings-bio">Bio</Label>
              <span className="text-xs text-muted-foreground">
                {bioRemaining} characters left
              </span>
            </div>
            <textarea
              id="settings-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Share a short introduction to let readers know who you are."
              className="min-h-[140px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={BIO_LIMIT + 10}
              disabled={isSaving}
            />
          </div>
        </section>

        <div className="flex flex-col gap-2 border-t border-dashed pt-6 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isSaving || !hasChanges}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        <Dialog open={isCoverCropOpen} onOpenChange={(open) => (open ? setIsCoverCropOpen(true) : handleCancelCoverCrop())}>
          <DialogContent className="max-w-4xl">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle>Adjust profile cover</DialogTitle>
              <DialogDescription>
                Drag to frame the banner. The cover displays on your profile and author highlights.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-border/70 bg-muted/40">
                  {coverCropSource ? (
                    <>
                      <Cropper
                        image={coverCropSource}
                        crop={coverCrop}
                        zoom={coverZoom}
                        aspect={3 / 1}
                        onCropChange={setCoverCrop}
                        onZoomChange={setCoverZoom}
                        onCropComplete={handleCoverCropComplete}
                        restrictPosition={false}
                      />
                      <div className="pointer-events-none absolute inset-0 border border-white/20" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Waiting for image...
                    </div>
                  )}
                  <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur md:flex">
                    <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                      3:1
                    </Badge>
                    Wide banner
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Zoom</span>
                    <span className="text-muted-foreground">{coverZoom.toFixed(1)}×</span>
                  </div>
                  <Slider
                    value={[coverZoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setCoverZoom(value[0] ?? 1)}
                    disabled={isCoverProcessing}
                    className="mt-3"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Card className="h-full border-border/60 bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Cover guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Keep focus centered</p>
                      <p>Important artwork and text should sit comfortably within the central area.</p>
                    </div>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Use large images</p>
                      <p>For best results pick images at least <span className="font-medium text-foreground">1600×600px</span>.</p>
                    </div>
                    <Separator className="bg-border/60" />
        <div className="space-y-2">
                      <p className="font-medium text-foreground">Re-edit anytime</p>
                      <p>You can reopen this editor before saving changes to fine-tune the crop.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={handleCancelCoverCrop} disabled={isCoverProcessing}>
                Cancel
              </Button>
              <Button onClick={handleConfirmCoverCrop} disabled={isCoverProcessing || !coverCroppedArea} className="gap-2">
                {isCoverProcessing ? (
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

        <Dialog open={isAvatarCropOpen} onOpenChange={(open) => (open ? setIsAvatarCropOpen(true) : handleCancelAvatarCrop())}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle>Adjust avatar</DialogTitle>
              <DialogDescription>
                Make sure your face or logo stays centered. This avatar appears across the platform.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border/70 bg-muted/40">
                {avatarCropSource ? (
                  <>
                    <Cropper
                      image={avatarCropSource}
                      crop={avatarCrop}
                      zoom={avatarZoom}
                      aspect={1}
                      onCropChange={setAvatarCrop}
                      onZoomChange={setAvatarZoom}
                      onCropComplete={handleAvatarCropComplete}
                      restrictPosition={false}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20" />
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Waiting for image...
                  </div>
                )}
                <div className="pointer-events-none absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
                  <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                    1:1
                  </Badge>
                  Square crop
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Zoom</span>
                  <span className="text-muted-foreground">{avatarZoom.toFixed(1)}×</span>
                </div>
                <Slider
                  value={[avatarZoom]}
                  min={1}
                  max={4}
                  step={0.1}
                  onValueChange={(value) => setAvatarZoom(value[0] ?? 1)}
                  disabled={isAvatarProcessing}
                  className="mt-3"
          />
        </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={handleCancelAvatarCrop} disabled={isAvatarProcessing}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAvatarCrop} disabled={isAvatarProcessing || !avatarCroppedArea} className="gap-2">
                {isAvatarProcessing ? (
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
      </CardContent>
    </Card>
  )
}

function AppearanceSettings() {
  const {
    theme,
    resolvedTheme,
    setTheme,
    accent,
    setAccent,
    radius,
    setRadius,
    customAccent,
    setCustomAccentColor,
  } = useThemeStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
    accent: state.accent,
    setAccent: state.setAccent,
    radius: state.radius,
    setRadius: state.setRadius,
    customAccent: state.customAccent,
    setCustomAccentColor: state.setCustomAccentColor,
  }))
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()

  const accentOptions = useMemo(
    () => [...ACCENT_COLOR_PRESETS, buildCustomAccentOption(customAccent)],
    [customAccent]
  )

  const radiusInPixels = Math.round(radius * 16)
  const radiusIsDefault = Math.abs(radius - DEFAULT_RADIUS) < 0.005
  const activeAccent =
    accentOptions.find((option) => option.value === accent) ?? accentOptions[0]
  const previewAccentHsl = activeAccent.values[resolvedTheme].primary

  const handleAccentKeyDown = (event: KeyboardEvent<HTMLDivElement>, value: AccentColor) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setAccent(value)
    }
  }

  const handleCustomAccentChange = (mode: ResolvedTheme, value: string) => {
    if (accent !== 'custom') {
      setAccent('custom')
    }
    setCustomAccentColor(mode, value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Fine-tune theme, accent colors, and reading layout preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Theme mode</Label>
              <p className="text-sm text-muted-foreground">
                Decide how the interface adapts to bright or low-light environments.
              </p>
            </div>
            <Badge variant="outline" className="self-start">
              {theme === 'system' ? `System (${resolvedTheme})` : `${theme} mode`}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {themeModeOptions.map((option) => {
              const Icon = option.icon
              const isActive = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'group relative flex h-full flex-col gap-4 rounded-lg border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary transition group-hover:bg-primary/10">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div
                    className="rounded-lg border border-dashed bg-background p-3 text-xs text-muted-foreground"
                    aria-hidden
                  >
          <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-16 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Headline
            </span>
                      <span className="h-1.5 flex-1 rounded-full bg-muted" />
          </div>
                    <div className="mt-2 space-y-2">
                      <div className="h-1.5 w-full rounded-full bg-muted" />
                      <div className="h-1.5 w-5/6 rounded-full bg-muted/80" />
                      <div className="h-1.5 w-2/3 rounded-full bg-muted/70" />
        </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Accent color</Label>
            <p className="text-sm text-muted-foreground">
              Set the brand hue used for primary actions and highlights across the UI.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {accentOptions.map((option) => {
              const isActive = accent === option.value
              const isCustom = option.value === 'custom'
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => setAccent(option.value)}
                  onKeyDown={(event) => handleAccentKeyDown(event, option.value)}
                  className={cn(
                    'flex h-full flex-col gap-3 rounded-lg border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background">
                        <span
                          className="h-7 w-7 rounded-full shadow-sm"
                          style={{ background: `hsl(${option.preview})` }}
                        />
                        {isActive && (
                          <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-primary ring-1 ring-primary" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, hsl(${option.preview}) 0%, hsl(${option.values.dark.primary}) 100%)`,
                    }}
                    aria-hidden
                  />
                  {isCustom && (
                    <div className="mt-1 space-y-3 rounded-md border border-dashed bg-background/80 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Light theme
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Primary accent in light mode
                          </p>
                        </div>
                        <input
                          type="color"
                          value={customAccent.light}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => handleCustomAccentChange('light', event.target.value)}
                          className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent p-1"
                          aria-label="Pick accent color for light theme"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Dark theme
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Primary accent in dark mode
                          </p>
                        </div>
                        <input
                          type="color"
                          value={customAccent.dark}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => handleCustomAccentChange('dark', event.target.value)}
                          className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent p-1"
                          aria-label="Pick accent color for dark theme"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Foreground and highlight colors adapt automatically for readability.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Interface shape</Label>
            <p className="text-sm text-muted-foreground">
              Adjust corner rounding for cards, dialogs, and buttons.
            </p>
          </div>
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 items-center justify-between text-xs text-muted-foreground sm:text-sm">
                <span>Sharper</span>
                <span>{radiusInPixels}px radius</span>
                <span>Softer</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRadius(DEFAULT_RADIUS)}
                disabled={radiusIsDefault}
              >
                Reset
              </Button>
            </div>
            <Slider
              value={[radius]}
              min={0.25}
              max={1}
              step={0.05}
              onValueChange={(value) => setRadius(value[0] ?? radius)}
              aria-label="Adjust global border radius"
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Article layout</Label>
            <p className="text-sm text-muted-foreground">
              Select the default view for browsing articles on the home feed.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {viewModeOptions.map((option) => {
              const Icon = option.icon
              const isActive = viewMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewMode(option.value)}
                  className={cn(
                    'flex h-full flex-col gap-3 rounded-lg border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="rounded-md border border-dashed bg-background p-3" aria-hidden>
                    <div
                      className={cn(
                        'grid gap-2',
                        option.value === 'square' ? 'grid-cols-2' : 'grid-cols-1'
                      )}
                    >
                      <div className="space-y-2 rounded-md border bg-card p-2">
                        <span className="block h-1.5 rounded-full bg-muted" />
                        <span className="block h-1.5 w-3/4 rounded-full bg-muted/80" />
                        {option.value !== 'line' && (
                          <span className="block h-16 rounded-md bg-muted/70" />
                        )}
                      </div>
                      {option.value === 'square' && (
                        <div className="space-y-2 rounded-md border bg-card p-2">
                          <span className="block h-1.5 rounded-full bg-muted" />
                          <span className="block h-1.5 w-3/4 rounded-full bg-muted/80" />
                          <span className="block h-16 rounded-md bg-muted/70" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Live preview</p>
              <p className="text-sm text-muted-foreground">
                Review how your appearance choices influence the interface.
              </p>
            </div>
            <Badge variant="secondary">
              {resolvedTheme === 'dark' ? 'Dark theme' : 'Light theme'}
            </Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: `hsl(${previewAccentHsl})` }}
                  />
                  Accent
                </span>
                <span>Preview</span>
              </div>
              <h4 className="mt-4 text-lg font-semibold">
                Designing a calmer reading experience
              </h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Accent colors and layout preferences update instantly so you can find the style that matches your flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1">
                  Primary action
                </Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
                <Button size="sm" variant="ghost">
                  Minimal
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Tips</p>
              <ul className="mt-3 space-y-2">
                <li>• Use system mode to stay in sync with your OS theme.</li>
                <li>• Adjust corner radius to match your brand&apos;s shapes.</li>
                <li>• Pick the article layout that suits how you browse content.</li>
              </ul>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

function PrivacySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your privacy and data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Privacy settings coming soon...
        </p>
      </CardContent>
    </Card>
  )
}

function NotificationsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Notification settings coming soon...
        </p>
      </CardContent>
    </Card>
  )
}

function SessionsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions and devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Sessions management coming soon...
        </p>
      </CardContent>
    </Card>
  )
}

function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Billing settings coming soon...
        </p>
      </CardContent>
    </Card>
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

