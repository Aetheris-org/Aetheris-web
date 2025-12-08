import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { uploadImage } from '@/lib/upload'
import { updateProfile } from '@/api/profile'
import { useThemeStore } from '@/stores/themeStore'
import { logger } from '@/lib/logger'

const NICKNAME_MIN = 3
const TAG_REGEX = /^[a-zA-Z0-9_]{3,24}$/

const uuidToNumber = (uuid: string): number => {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setUser = useAuthStore((s) => s.setUser)
  const authUser = useAuthStore((s) => s.user)
  const { setTheme } = useThemeStore()

  const [nickname, setNickname] = useState('')
  const [tag, setTag] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [coverUrlInput, setCoverUrlInput] = useState('')
  const [themeChoice, setThemeChoice] = useState<'light' | 'dark' | 'system'>('system')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authUser) {
      navigate('/auth', { replace: true })
    }
  }, [authUser, navigate])

  const isValid = useMemo(() => {
    return nickname.trim().length >= NICKNAME_MIN && TAG_REGEX.test(tag.trim())
  }, [nickname, tag])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    setAvatarUrlInput('')
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    } else {
      setAvatarPreview(null)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCoverFile(file)
    setCoverUrlInput('')
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverPreview(url)
    } else {
      setCoverPreview(null)
    }
  }

  const applyAvatarUrl = () => {
    const url = avatarUrlInput.trim()
    if (!url.startsWith('http')) {
      toast({
        title: 'Invalid avatar URL',
        description: 'Use a full http/https link',
        variant: 'destructive',
      })
      return
    }
    setAvatarFile(null)
    setAvatarPreview(url)
  }

  const applyCoverUrl = () => {
    const url = coverUrlInput.trim()
    if (!url.startsWith('http')) {
      toast({
        title: 'Invalid cover URL',
        description: 'Use a full http/https link',
        variant: 'destructive',
      })
      return
    }
    setCoverFile(null)
    setCoverPreview(url)
  }

  const uploadIfNeeded = async (file: File | null, bucket: 'avatars' | 'covers') => {
    if (!file) return null
    const { url } = await uploadImage(file, bucket)
    return url
  }

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: 'Fill required fields',
        description: 'Nickname (>=3) and tag (3-24 letters/numbers/underscore) are required.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const nicknameTrimmed = nickname.trim()
      const tagTrimmed = tag.trim()
      const bioValue = bio.trim()

      const [avatarUrl, coverUrl] = await Promise.all([
        uploadIfNeeded(avatarFile, 'avatars'),
        uploadIfNeeded(coverFile, 'covers'),
      ])

      const profile = await updateProfile({
        username: nicknameTrimmed,
        bio: bioValue || undefined,
        avatar: avatarUrl || undefined,
        coverImage: coverUrl || undefined,
        tag: tagTrimmed,
      })

      const userIdNumber = (() => {
        if (typeof profile.user.id === 'number') return profile.user.id
        if (profile.user.uuid) return uuidToNumber(profile.user.uuid)
        if (profile.user.id) return uuidToNumber(String(profile.user.id))
        if (authUser?.id) return uuidToNumber(String(authUser.id))
        return 0
      })()

      // обновляем юзера в сторах (минимально)
      setUser({
        id: userIdNumber,
        uuid: profile.user.uuid || (typeof profile.user.id === 'string' ? profile.user.id : undefined),
        nickname: profile.user.username,
        email: authUser?.email || '',
        avatar: profile.user.avatarUrl || undefined,
        bio: profile.user.bio || undefined,
        role: authUser?.role || 'user',
        articlesCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        viewsReceived: 0,
        createdAt: profile.user.memberSince || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        isVerified: false,
        isProfilePublic: true,
        showEmail: false,
        showLastSeen: false,
        reputation: 0,
        level: 1,
        experience: 0,
        tag: profile.user.tag,
      })

      setTheme(themeChoice)

      // Помечаем локально, что онбординг пройден
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true')
      }
      // Ставим флаг в user_metadata, чтобы не показывать онбординг повторно даже без localStorage
      try {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        })
      } catch (err) {
        logger.warn('Failed to set onboarding flag in user metadata', err)
      }

      toast({
        title: 'Profile saved',
        description: 'Welcome aboard!',
      })
      navigate('/forum', { replace: true })
    } catch (error: any) {
      logger.error('Onboarding submit failed', error)
      toast({
        title: 'Failed to save profile',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <Card className="p-6 sm:p-8 bg-muted/30 border-border">
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Welcome!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Complete your profile to get started. Fields are empty — fill them with your info.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="onboarding-nickname">Nickname</Label>
                <Input
                  id="onboarding-nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="onboarding-tag">Tag</Label>
                <Input
                  id="onboarding-tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="your_tag"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="onboarding-bio">Bio</Label>
                <Textarea
                  id="onboarding-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as const).map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant={themeChoice === opt ? 'default' : 'outline'}
                      onClick={() => {
                        setThemeChoice(opt)
                        setTheme(opt)
                      }}
                      className="w-full"
                    >
                      {opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'Auto'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="avatar-url">Avatar URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar-url"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <Button type="button" variant="secondary" onClick={applyAvatarUrl}>
                      Use URL
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 aspect-square rounded-full border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarPreview}
                          alt="avatar preview"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground text-center leading-tight px-1">No avatar</span>
                      )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cover-url">Cover URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover-url"
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                    />
                    <Button type="button" variant="secondary" onClick={applyCoverUrl}>
                      Use URL
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Profile cover</Label>
                  <div className="w-full h-28 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                    {coverPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverPreview} alt="cover preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm text-muted-foreground">No cover</span>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleCoverChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving…' : 'Save and continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

