import { useEffect, useMemo, useRef, useState, type ReactNode, type ChangeEvent } from 'react'
import type { KeyboardEvent } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Bell,
  BellRing,
  Briefcase,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Crop,
  Download,
  Eye,
  EyeOff,
  Github,
  Globe,
  ImagePlus,
  Laptop,
  LayoutGrid,
  Linkedin,
  List,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Rows,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Twitter,
  User,
  Wallet,
  Users,
  Sparkles,
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
import { useProfileDetailsStore, type PreferredContactMethod } from '@/stores/profileDetailsStore'
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
  TYPOGRAPHY_SCALES,
  type ThemeMode,
  type AppearancePreset,
  type TypographyScale,
  type ContrastMode,
  type DepthStyle,
  type MotionPreference,
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
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces with crisp contrast.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-light friendly palette.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device preference automatically.',
    icon: Monitor,
  },
]

const viewModeOptions: Array<{
  value: 'default' | 'line' | 'square'
  label: string
  description: string
  icon: typeof Rows
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
    description: 'Dense list optimized for scanning',
    icon: List,
  },
  {
    value: 'square',
    label: 'Grid view',
    description: 'Visual tiles for inspiration',
    icon: LayoutGrid,
  },
]

interface AppearanceOptionCardProps {
  active: boolean
  leading: ReactNode
  label: string
  description: string
  onSelect: () => void
  preview?: ReactNode
  footer?: ReactNode
  disabled?: boolean
}

function AppearanceOptionCard({
  active,
  leading,
  label,
  description,
  onSelect,
  preview,
  footer,
  disabled,
}: AppearanceOptionCardProps) {
  const handleActivate = () => {
    if (disabled) return
    onSelect()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled && 'pointer-events-none opacity-60',
        active && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm">
            {leading}
          </div>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {active && <Check className="h-4 w-4 text-primary" />}
      </div>
      {preview ? (
        <div className="rounded-md border border-dashed bg-background/60 p-3 text-xs text-muted-foreground">
          {preview}
        </div>
      ) : null}
      {footer ? <div className="text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  )
}

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
  const { details: profileDetails, setDetails: setProfileDetails } = useProfileDetailsStore((state) => ({
    details: state.details,
    setDetails: state.setDetails,
  }))

  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [contactEmail, setContactEmail] = useState(profileDetails.contactEmail || user?.email || '')
  const [website, setWebsite] = useState(profileDetails.website || user?.website || '')
  const [locationValue, setLocationValue] = useState(profileDetails.location || user?.location || '')
  const [headline, setHeadline] = useState(profileDetails.headline)
  const [availability, setAvailability] = useState(profileDetails.availability)
  const [currentRole, setCurrentRole] = useState(profileDetails.currentRole)
  const [currentCompany, setCurrentCompany] = useState(profileDetails.currentCompany)
  const [experienceLevel, setExperienceLevel] = useState(profileDetails.yearsExperience)
  const [timezone, setTimezone] = useState(profileDetails.timezone)
  const [pronouns, setPronouns] = useState(profileDetails.pronouns)
  const [languages, setLanguages] = useState(profileDetails.languages)
  const [focusAreas, setFocusAreas] = useState(profileDetails.focusAreas)
  const [currentlyLearning, setCurrentlyLearning] = useState(profileDetails.currentlyLearning)
  const [openToMentoring, setOpenToMentoring] = useState(profileDetails.openToMentoring)
  const [openToConsulting, setOpenToConsulting] = useState(profileDetails.openToConsulting)
  const [openToSpeaking, setOpenToSpeaking] = useState(profileDetails.openToSpeaking)
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>(
    profileDetails.preferredContactMethod
  )
  const [newsletterName, setNewsletterName] = useState(profileDetails.newsletterName)
  const [newsletterUrl, setNewsletterUrl] = useState(profileDetails.newsletterUrl)
  const [officeHours, setOfficeHours] = useState(profileDetails.officeHours)
  const [collaborationNotes, setCollaborationNotes] = useState(profileDetails.collaborationNotes)
  const [twitterHandle, setTwitterHandle] = useState(profileDetails.social.twitter)
  const [githubHandle, setGithubHandle] = useState(profileDetails.social.github)
  const [linkedinUrl, setLinkedinUrl] = useState(profileDetails.social.linkedin)
  const [portfolioUrl, setPortfolioUrl] = useState(profileDetails.social.portfolio)
  const [contactSaving, setContactSaving] = useState(false)
  const [socialSaving, setSocialSaving] = useState(false)
  const [professionalSaving, setProfessionalSaving] = useState(false)
  const [insightsSaving, setInsightsSaving] = useState(false)
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
  const initialFirstName = user?.firstName ?? ''
  const initialLastName = user?.lastName ?? ''
  const initialContactEmail = profileDetails.contactEmail || user?.email || ''
  const initialWebsite = profileDetails.website || user?.website || ''
  const initialLocation = profileDetails.location || user?.location || ''
  const initialHeadline = profileDetails.headline
  const initialAvailability = profileDetails.availability
  const initialCurrentRole = profileDetails.currentRole
  const initialCurrentCompany = profileDetails.currentCompany
  const initialExperienceLevel = profileDetails.yearsExperience
  const initialTimezone = profileDetails.timezone
  const initialPronouns = profileDetails.pronouns
  const initialLanguages = profileDetails.languages
  const initialFocusAreas = profileDetails.focusAreas
  const initialCurrentlyLearning = profileDetails.currentlyLearning
  const initialPreferredContact = profileDetails.preferredContactMethod
  const initialNewsletterName = profileDetails.newsletterName
  const initialNewsletterUrl = profileDetails.newsletterUrl
  const initialOfficeHours = profileDetails.officeHours
  const initialCollaborationNotes = profileDetails.collaborationNotes

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
  const contactInitialRef = useRef({
    firstName: initialFirstName,
    lastName: initialLastName,
    contactEmail: initialContactEmail,
    website: initialWebsite,
    location: initialLocation,
  })
  const socialInitialRef = useRef({
    twitterHandle: profileDetails.social.twitter,
    githubHandle: profileDetails.social.github,
    linkedinUrl: profileDetails.social.linkedin,
    portfolioUrl: profileDetails.social.portfolio,
  })
  const professionalInitialRef = useRef({
    headline: initialHeadline,
    availability: initialAvailability,
    currentRole: initialCurrentRole,
    currentCompany: initialCurrentCompany,
    experienceLevel: initialExperienceLevel,
    timezone: initialTimezone,
    pronouns: initialPronouns,
  })
  const insightsInitialRef = useRef({
    languages: initialLanguages,
    focusAreas: initialFocusAreas,
    currentlyLearning: initialCurrentlyLearning,
    openToMentoring: profileDetails.openToMentoring,
    openToConsulting: profileDetails.openToConsulting,
    openToSpeaking: profileDetails.openToSpeaking,
    preferredContactMethod: initialPreferredContact,
    newsletterName: initialNewsletterName,
    newsletterUrl: initialNewsletterUrl,
    officeHours: initialOfficeHours,
    collaborationNotes: initialCollaborationNotes,
  })

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

    contactInitialRef.current = {
      firstName: initialFirstName,
      lastName: initialLastName,
      contactEmail: initialContactEmail,
      website: initialWebsite,
      location: initialLocation,
    }
    socialInitialRef.current = {
      twitterHandle: profileDetails.social.twitter,
      githubHandle: profileDetails.social.github,
      linkedinUrl: profileDetails.social.linkedin,
      portfolioUrl: profileDetails.social.portfolio,
    }
    professionalInitialRef.current = {
      headline: initialHeadline,
      availability: initialAvailability,
      currentRole: initialCurrentRole,
      currentCompany: initialCurrentCompany,
      experienceLevel: initialExperienceLevel,
      timezone: initialTimezone,
      pronouns: initialPronouns,
    }
    insightsInitialRef.current = {
      languages: initialLanguages,
      focusAreas: initialFocusAreas,
      currentlyLearning: initialCurrentlyLearning,
      openToMentoring: profileDetails.openToMentoring,
      openToConsulting: profileDetails.openToConsulting,
      openToSpeaking: profileDetails.openToSpeaking,
      preferredContactMethod: initialPreferredContact,
      newsletterName: initialNewsletterName,
      newsletterUrl: initialNewsletterUrl,
      officeHours: initialOfficeHours,
      collaborationNotes: initialCollaborationNotes,
    }

    setFirstName(contactInitialRef.current.firstName)
    setLastName(contactInitialRef.current.lastName)
    setContactEmail(contactInitialRef.current.contactEmail)
    setWebsite(contactInitialRef.current.website)
    setLocationValue(contactInitialRef.current.location)

    setHeadline(professionalInitialRef.current.headline)
    setAvailability(professionalInitialRef.current.availability)
    setCurrentRole(professionalInitialRef.current.currentRole)
    setCurrentCompany(professionalInitialRef.current.currentCompany)
    setExperienceLevel(professionalInitialRef.current.experienceLevel)
    setTimezone(professionalInitialRef.current.timezone)
    setPronouns(professionalInitialRef.current.pronouns)

    setLanguages(insightsInitialRef.current.languages)
    setFocusAreas(insightsInitialRef.current.focusAreas)
    setCurrentlyLearning(insightsInitialRef.current.currentlyLearning)
    setOpenToMentoring(insightsInitialRef.current.openToMentoring)
    setOpenToConsulting(insightsInitialRef.current.openToConsulting)
    setOpenToSpeaking(insightsInitialRef.current.openToSpeaking)
    setPreferredContactMethod(insightsInitialRef.current.preferredContactMethod)
    setNewsletterName(insightsInitialRef.current.newsletterName)
    setNewsletterUrl(insightsInitialRef.current.newsletterUrl)
    setOfficeHours(insightsInitialRef.current.officeHours)
    setCollaborationNotes(insightsInitialRef.current.collaborationNotes)

    setTwitterHandle(socialInitialRef.current.twitterHandle)
    setGithubHandle(socialInitialRef.current.githubHandle)
    setLinkedinUrl(socialInitialRef.current.linkedinUrl)
    setPortfolioUrl(socialInitialRef.current.portfolioUrl)

    setContactSaving(false)
    setSocialSaving(false)
    setProfessionalSaving(false)
    setInsightsSaving(false)

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

    setAvatarCropSource((prev) => {
      if (prev && prev.startsWith('blob:')) {
        revokeObjectUrl(prev)
      }
      return null
    })
    setCoverCropSource((prev) => {
      if (prev && prev.startsWith('blob:')) {
        revokeObjectUrl(prev)
      }
      return null
    })
    setAvatarCrop({ x: 0, y: 0 })
    setCoverCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setCoverZoom(1)
    setAvatarCroppedArea(null)
    setCoverCroppedArea(null)
  }, [
    initialNickname,
    initialBio,
    initialAvatar,
    initialCover,
    initialFirstName,
    initialLastName,
    initialContactEmail,
    initialWebsite,
    initialLocation,
    initialHeadline,
    initialAvailability,
    initialCurrentRole,
    initialCurrentCompany,
    initialExperienceLevel,
    initialTimezone,
    initialPronouns,
    initialLanguages,
    initialFocusAreas,
    initialCurrentlyLearning,
    initialPreferredContact,
    initialNewsletterName,
    initialNewsletterUrl,
    initialOfficeHours,
    initialCollaborationNotes,
    profileDetails.openToMentoring,
    profileDetails.openToConsulting,
    profileDetails.openToSpeaking,
    profileDetails.social.github,
    profileDetails.social.linkedin,
    profileDetails.social.portfolio,
    profileDetails.social.twitter,
  ])

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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    handleContactReset()
    handleSocialReset()
    handleProfessionalReset()
    handleInsightsReset()
    setContactSaving(false)
    setSocialSaving(false)
    setProfessionalSaving(false)
    setInsightsSaving(false)
  }

  const contactHasChanges =
    firstName.trim() !== contactInitialRef.current.firstName ||
    lastName.trim() !== contactInitialRef.current.lastName ||
    contactEmail.trim() !== contactInitialRef.current.contactEmail ||
    website.trim() !== contactInitialRef.current.website ||
    locationValue.trim() !== contactInitialRef.current.location

  const socialHasChanges =
    twitterHandle.trim() !== socialInitialRef.current.twitterHandle ||
    githubHandle.trim() !== socialInitialRef.current.githubHandle ||
    linkedinUrl.trim() !== socialInitialRef.current.linkedinUrl ||
    portfolioUrl.trim() !== socialInitialRef.current.portfolioUrl

  const professionalHasChanges =
    headline.trim() !== professionalInitialRef.current.headline ||
    availability.trim() !== professionalInitialRef.current.availability ||
    currentRole.trim() !== professionalInitialRef.current.currentRole ||
    currentCompany.trim() !== professionalInitialRef.current.currentCompany ||
    experienceLevel.trim() !== professionalInitialRef.current.experienceLevel ||
    timezone.trim() !== professionalInitialRef.current.timezone ||
    pronouns.trim() !== professionalInitialRef.current.pronouns

  const insightsHasChanges =
    languages.trim() !== insightsInitialRef.current.languages ||
    focusAreas.trim() !== insightsInitialRef.current.focusAreas ||
    currentlyLearning.trim() !== insightsInitialRef.current.currentlyLearning ||
    openToMentoring !== insightsInitialRef.current.openToMentoring ||
    openToConsulting !== insightsInitialRef.current.openToConsulting ||
    openToSpeaking !== insightsInitialRef.current.openToSpeaking ||
    preferredContactMethod !== insightsInitialRef.current.preferredContactMethod ||
    newsletterName.trim() !== insightsInitialRef.current.newsletterName ||
    newsletterUrl.trim() !== insightsInitialRef.current.newsletterUrl ||
    officeHours.trim() !== insightsInitialRef.current.officeHours ||
    collaborationNotes.trim() !== insightsInitialRef.current.collaborationNotes

  const contactMethodOptions: Array<{ value: PreferredContactMethod; label: string; helper: string }> = [
    { value: 'email', label: 'Email', helper: 'Reply within 1-2 business days' },
    { value: 'direct-message', label: 'Direct messages', helper: 'Connect via the built-in messenger' },
    { value: 'schedule', label: 'Scheduling link', helper: 'Share a Calendly or other booking link' },
    { value: 'social', label: 'Social first', helper: 'Reach out via social handles' },
    { value: 'not-specified', label: 'No preference', helper: 'Decide together as needed' },
  ]

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

  const handleContactReset = () => {
    setFirstName(contactInitialRef.current.firstName)
    setLastName(contactInitialRef.current.lastName)
    setContactEmail(contactInitialRef.current.contactEmail)
    setWebsite(contactInitialRef.current.website)
    setLocationValue(contactInitialRef.current.location)
  }

  const handleContactSave = async () => {
    setContactSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    contactInitialRef.current = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contactEmail: contactEmail.trim(),
      website: website.trim(),
      location: locationValue.trim(),
    }
    setProfileDetails({
      contactEmail: contactInitialRef.current.contactEmail,
      website: contactInitialRef.current.website,
      location: contactInitialRef.current.location,
    })
    setContactSaving(false)
    toast({
      title: 'Contact details saved',
      description:
        'Contact information will sync with Strapi once corresponding fields are implemented.',
    })
  }

  const handleSocialReset = () => {
    setTwitterHandle(socialInitialRef.current.twitterHandle)
    setGithubHandle(socialInitialRef.current.githubHandle)
    setLinkedinUrl(socialInitialRef.current.linkedinUrl)
    setPortfolioUrl(socialInitialRef.current.portfolioUrl)
  }

  const handleSocialSave = async () => {
    setSocialSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    socialInitialRef.current = {
      twitterHandle: twitterHandle.trim(),
      githubHandle: githubHandle.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
    }
    setSocialSaving(false)
    toast({
      title: 'Social links saved',
      description: 'TODO: connect social profiles with backend once it supports them.',
    })
  }

  const handleProfessionalReset = () => {
    setHeadline(professionalInitialRef.current.headline)
    setAvailability(professionalInitialRef.current.availability)
    setCurrentRole(professionalInitialRef.current.currentRole)
    setCurrentCompany(professionalInitialRef.current.currentCompany)
    setExperienceLevel(professionalInitialRef.current.experienceLevel)
    setTimezone(professionalInitialRef.current.timezone)
    setPronouns(professionalInitialRef.current.pronouns)
  }

  const handleProfessionalSave = async () => {
    setProfessionalSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    professionalInitialRef.current = {
      headline: headline.trim(),
      availability: availability.trim(),
      currentRole: currentRole.trim(),
      currentCompany: currentCompany.trim(),
      experienceLevel: experienceLevel.trim(),
      timezone: timezone.trim(),
      pronouns: pronouns.trim(),
    }
    setProfileDetails({
      headline: professionalInitialRef.current.headline,
      availability: professionalInitialRef.current.availability,
      currentRole: professionalInitialRef.current.currentRole,
      currentCompany: professionalInitialRef.current.currentCompany,
      yearsExperience: professionalInitialRef.current.experienceLevel,
      timezone: professionalInitialRef.current.timezone,
      pronouns: professionalInitialRef.current.pronouns,
    })
    setProfessionalSaving(false)
    toast({
      title: 'Professional profile saved',
      description: 'These details appear across your public profile header and author cards.',
    })
  }

  const handleInsightsReset = () => {
    setLanguages(insightsInitialRef.current.languages)
    setFocusAreas(insightsInitialRef.current.focusAreas)
    setCurrentlyLearning(insightsInitialRef.current.currentlyLearning)
    setOpenToMentoring(insightsInitialRef.current.openToMentoring)
    setOpenToConsulting(insightsInitialRef.current.openToConsulting)
    setOpenToSpeaking(insightsInitialRef.current.openToSpeaking)
    setPreferredContactMethod(insightsInitialRef.current.preferredContactMethod)
    setNewsletterName(insightsInitialRef.current.newsletterName)
    setNewsletterUrl(insightsInitialRef.current.newsletterUrl)
    setOfficeHours(insightsInitialRef.current.officeHours)
    setCollaborationNotes(insightsInitialRef.current.collaborationNotes)
  }

  const handleInsightsSave = async () => {
    setInsightsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    insightsInitialRef.current = {
      languages: languages.trim(),
      focusAreas: focusAreas.trim(),
      currentlyLearning: currentlyLearning.trim(),
      openToMentoring,
      openToConsulting,
      openToSpeaking,
      preferredContactMethod,
      newsletterName: newsletterName.trim(),
      newsletterUrl: newsletterUrl.trim(),
      officeHours: officeHours.trim(),
      collaborationNotes: collaborationNotes.trim(),
    }
    setProfileDetails({
      languages: insightsInitialRef.current.languages,
      focusAreas: insightsInitialRef.current.focusAreas,
      currentlyLearning: insightsInitialRef.current.currentlyLearning,
      openToMentoring: insightsInitialRef.current.openToMentoring,
      openToConsulting: insightsInitialRef.current.openToConsulting,
      openToSpeaking: insightsInitialRef.current.openToSpeaking,
      preferredContactMethod: insightsInitialRef.current.preferredContactMethod,
      newsletterName: insightsInitialRef.current.newsletterName,
      newsletterUrl: insightsInitialRef.current.newsletterUrl,
      officeHours: insightsInitialRef.current.officeHours,
      collaborationNotes: insightsInitialRef.current.collaborationNotes,
    })
    setInsightsSaving(false)
    toast({
      title: 'Focus & visibility saved',
      description: 'Your availability preferences will now show on the profile page.',
    })
  }

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
    } catch (error: unknown) {
      console.error('Failed to update profile', error)
      toast({
        title: 'Update failed',
        description:
          (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
          'Something went wrong while saving your profile.',
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
        <CardDescription>
          Update how your profile appears to other readers.
        </CardDescription>
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

        <Separator className="border-dashed" />

        <section className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Contact details</Label>
            <p className="text-sm text-muted-foreground">
              Share how editors and collaborators can reach you. These fields will sync with the backend in a future release.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-first-name">First name</Label>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Alex"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-last-name">Last name</Label>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Rivera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-contact-email">Contact email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-contact-email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="hello@aetheris.dev"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Shown to editors only. Account login email remains unchanged.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://aetheris.dev"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-location"
                  value={locationValue}
                  onChange={(event) => setLocationValue(event.target.value)}
                  placeholder="Valencia, Spain"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContactReset}
              disabled={!contactHasChanges || contactSaving}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleContactSave}
              disabled={!contactHasChanges || contactSaving}
              className="gap-2"
            >
              {contactSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save contact info'
              )}
            </Button>
          </div>
        </section>

        <Separator className="border-dashed" />

        <section className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Social profiles</Label>
            <p className="text-sm text-muted-foreground">
              Display external profiles on your public page. Add full URLs for best results.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-twitter">Twitter / X</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-twitter"
                  value={twitterHandle}
                  onChange={(event) => setTwitterHandle(event.target.value)}
                  placeholder="@aetheris"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-github">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-github"
                  value={githubHandle}
                  onChange={(event) => setGithubHandle(event.target.value)}
                  placeholder="github.com/aetheris"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-linkedin"
                  value={linkedinUrl}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                  placeholder="linkedin.com/in/aetheris"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-portfolio">Portfolio</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-portfolio"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="dribbble.com/aetheris"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSocialReset}
              disabled={!socialHasChanges || socialSaving}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSocialSave}
              disabled={!socialHasChanges || socialSaving}
              className="gap-2"
            >
              {socialSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save social links'
              )}
            </Button>
          </div>
        </section>

        <Separator className="border-dashed" />

        <section className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Focus & visibility</Label>
            <p className="text-sm text-muted-foreground">
              Highlight the work you are excited about and how collaborators should reach out.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-languages">Languages & locales</Label>
              <Input
                id="settings-languages"
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder="English, Spanish (ES), Catalan"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-focus">Focus areas</Label>
              <textarea
                id="settings-focus"
                value={focusAreas}
                onChange={(event) => setFocusAreas(event.target.value)}
                placeholder="Calm product strategy, accessibility systems, editorial tooling, long-form craft."
                className="min-h-[120px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={320}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-learning">Currently exploring</Label>
              <textarea
                id="settings-learning"
                value={currentlyLearning}
                onChange={(event) => setCurrentlyLearning(event.target.value)}
                placeholder="Studying tactile motion systems and authoring workflows for multi-sensory mediums."
                className="min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={280}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-office-hours">Office hours / response window</Label>
              <Input
                id="settings-office-hours"
                value={officeHours}
                onChange={(event) => setOfficeHours(event.target.value)}
                placeholder="Replies within 48h · Best between 10:00 and 16:00 CET"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-collaboration">Collaboration notes</Label>
              <textarea
                id="settings-collaboration"
                value={collaborationNotes}
                onChange={(event) => setCollaborationNotes(event.target.value)}
                placeholder="Open to paired writing, guest lectures, and design audits for creator platforms."
                className="min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={240}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-dashed bg-muted/20 p-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={openToMentoring ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setOpenToMentoring((value) => !value)}
                  aria-pressed={openToMentoring}
                >
                  <Users className="h-4 w-4" />
                  Mentoring
                </Button>
                <Button
                  type="button"
                  variant={openToConsulting ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setOpenToConsulting((value) => !value)}
                  aria-pressed={openToConsulting}
                >
                  <Briefcase className="h-4 w-4" />
                  Consulting
                </Button>
                <Button
                  type="button"
                  variant={openToSpeaking ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setOpenToSpeaking((value) => !value)}
                  aria-pressed={openToSpeaking}
                >
                  <Sparkles className="h-4 w-4" />
                  Speaking
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred contact method</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {contactMethodOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={preferredContactMethod === option.value ? 'default' : 'outline'}
                    className={cn(
                      'h-full justify-start gap-1 py-3 text-left',
                      preferredContactMethod === option.value && 'border-primary'
                    )}
                    onClick={() => setPreferredContactMethod(option.value)}
                    aria-pressed={preferredContactMethod === option.value}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.helper}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-newsletter-name">Newsletter name</Label>
                <Input
                  id="settings-newsletter-name"
                  value={newsletterName}
                  onChange={(event) => setNewsletterName(event.target.value)}
                  placeholder="Field Notes by Noelle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-newsletter-url">Newsletter link</Label>
                <Input
                  id="settings-newsletter-url"
                  value={newsletterUrl}
                  onChange={(event) => setNewsletterUrl(event.target.value)}
                  placeholder="https://newsletter.aetheris.dev"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-dashed pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInsightsReset}
              disabled={!insightsHasChanges || insightsSaving}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleInsightsSave}
              disabled={!insightsHasChanges || insightsSaving}
              className="gap-2"
            >
              {insightsSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save focus & visibility'
              )}
            </Button>
          </div>
        </section>

        <Separator className="border-dashed" />

        <section className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Professional profile</Label>
            <p className="text-sm text-muted-foreground">
              Curate how Aetheris introduces you in newsletters, listings, and profile summaries.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-headline">Headline</Label>
              <Input
                id="settings-headline"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Design director crafting calm, accessible publishing tools"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-role">Current role</Label>
              <Input
                id="settings-role"
                value={currentRole}
                onChange={(event) => setCurrentRole(event.target.value)}
                placeholder="Design Director"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-company">Organisation</Label>
              <Input
                id="settings-company"
                value={currentCompany}
                onChange={(event) => setCurrentCompany(event.target.value)}
                placeholder="Aetheris Studio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-experience">Experience</Label>
              <Input
                id="settings-experience"
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                placeholder="8+ years in product design"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-timezone">Timezone</Label>
              <Input
                id="settings-timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="UTC+1 · CET"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-pronouns">Pronouns</Label>
              <Input
                id="settings-pronouns"
                value={pronouns}
                onChange={(event) => setPronouns(event.target.value)}
                placeholder="she/they"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-availability">Availability note</Label>
              <textarea
                id="settings-availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                placeholder="Open for fractional design leadership, UX critiques, and conference talks."
                className="min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={200}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfessionalReset}
              disabled={!professionalHasChanges || professionalSaving}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleProfessionalSave}
              disabled={!professionalHasChanges || professionalSaving}
              className="gap-2"
            >
              {professionalSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save professional info'
              )}
            </Button>
          </div>
        </section>

        <Separator className="border-dashed" />

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
  const { toast } = useToast()
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
    typography,
    setTypography,
    contrast,
    setContrast,
    density,
    setDensity,
    depth,
    setDepth,
    motion,
    setMotion,
    presets,
    savePreset,
    deletePreset,
    applyPreset,
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
    typography: state.typography,
    setTypography: state.setTypography,
    contrast: state.contrast,
    setContrast: state.setContrast,
    density: state.density,
    setDensity: state.setDensity,
    depth: state.depth,
    setDepth: state.setDepth,
    motion: state.motion,
    setMotion: state.setMotion,
    presets: state.presets,
    savePreset: state.savePreset,
    deletePreset: state.deletePreset,
    applyPreset: state.applyPreset,
  }))
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()

  const accentOptions = useMemo(() => {
    const base = ACCENT_COLOR_PRESETS.map((preset) => ({
      value: preset.value,
      label: preset.label,
      description: preset.description,
      gradient: `linear-gradient(135deg, hsl(${preset.preview}) 0%, hsl(${preset.values.dark.primary}) 100%)`,
      tone: preset.values[resolvedTheme].primary,
      values: preset.values,
    }))
    const custom = buildCustomAccentOption(customAccent)
    base.push({
      value: custom.value,
      label: custom.label,
      description: custom.description,
      gradient: `linear-gradient(135deg, hsl(${custom.values.light.primary}) 0%, hsl(${custom.values.dark.primary}) 100%)`,
      tone: custom.values[resolvedTheme].primary,
      values: custom.values,
    })
    return base
  }, [customAccent, resolvedTheme])

  const typographyOptions = useMemo(
    () => [
      {
        value: 'default' as TypographyScale,
        label: TYPOGRAPHY_SCALES.default.label,
        description: TYPOGRAPHY_SCALES.default.description,
        icon: Rows,
      },
      {
        value: 'comfortable' as TypographyScale,
        label: TYPOGRAPHY_SCALES.comfortable.label,
        description: TYPOGRAPHY_SCALES.comfortable.description,
        icon: Monitor,
      },
      {
        value: 'compact' as TypographyScale,
        label: TYPOGRAPHY_SCALES.compact.label,
        description: TYPOGRAPHY_SCALES.compact.description,
        icon: Smartphone,
      },
    ],
    []
  )

  const contrastOptions = useMemo(
    () => [
      {
        value: 'standard' as ContrastMode,
        label: 'Standard contrast',
        description: 'Balanced tone for everyday reading.',
        icon: Eye,
      },
      {
        value: 'bold' as ContrastMode,
        label: 'Bold contrast',
        description: 'Higher contrast for more dramatic separation.',
        icon: AlertTriangle,
      },
    ],
    []
  )

  const motionOptions = useMemo(
    () => [
      {
        value: 'default' as MotionPreference,
        label: 'Animated',
        description: 'Retain smooth transitions and micro-interactions.',
        icon: RefreshCw,
      },
      {
        value: 'reduced' as MotionPreference,
        label: 'Reduced motion',
        description: 'Minimize motion for people sensitive to animation.',
        icon: EyeOff,
      },
    ],
    []
  )

  const depthOptions = useMemo(
    () => [
      {
        value: 'flat' as DepthStyle,
        label: 'Flat',
        description: 'Minimal outlines with no drop shadows.',
        icon: Shield,
      },
      {
        value: 'soft' as DepthStyle,
        label: 'Soft',
        description: 'Gentle ambient shadows for subtle depth.',
        icon: ShieldCheck,
      },
      {
        value: 'elevated' as DepthStyle,
        label: 'Elevated',
        description: 'Pronounced shadows suited for hero moments.',
        icon: Crown,
      },
    ],
    []
  )

  const [presetName, setPresetName] = useState('')

  const presetList = useMemo<AppearancePreset[]>(
    () => [...presets].sort((a, b) => b.createdAt - a.createdAt),
    [presets]
  )

  const radiusIsDefault = Math.abs(radius - DEFAULT_RADIUS) < 0.005
  const densityIsDefault = Math.abs(density - 1) < 0.001

  const densityPercent = Math.round((density - 1) * 100)
  const densityLabel =
    densityPercent === 0
      ? 'Standard spacing'
      : densityPercent > 0
        ? `Expanded by ${densityPercent}%`
        : `Condensed by ${Math.abs(densityPercent)}%`
  const previewScale = TYPOGRAPHY_SCALES[typography]?.scale ?? 1
  const previewShadowMap: Record<DepthStyle, string> = {
    flat: '0 1px 2px rgba(15, 23, 42, 0.05)',
    soft: '0 18px 40px rgba(15, 23, 42, 0.12)',
    elevated: '0 30px 70px rgba(15, 23, 42, 0.22)',
  }
  const previewShadow = previewShadowMap[depth]
  const previewBackground = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff'
  const previewGap = 18 * density
  const previewPadding = 24 * density
  const previewBadgeClass = contrast === 'bold' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
  const previewMotionNote = motion === 'reduced' ? 'Motion minimized' : 'Animations enabled'

  const handleSavePreset = () => {
    const preset = savePreset(presetName)
    if (!preset) {
      toast({
        title: 'Preset name required',
        description: 'Give your preset a name before saving it.',
        variant: 'destructive',
      })
      return
    }
    setPresetName('')
    toast({
      title: 'Preset saved',
      description: `"${preset.name}" is ready to use.`,
    })
  }

  const handleApplyPreset = (preset: AppearancePreset) => {
    applyPreset(preset.id)
    toast({
      title: 'Preset applied',
      description: `Appearance updated to "${preset.name}".`,
    })
  }

  const handleDeletePreset = (preset: AppearancePreset) => {
    deletePreset(preset.id)
    toast({
      title: 'Preset removed',
      description: `Deleted "${preset.name}".`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Fine-tune theme, accent colors, backgrounds, and layout preferences.
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
            {themeModeOptions.map((option) => (
              <AppearanceOptionCard
                  key={option.value}
                active={theme === option.value}
                leading={<option.icon className="h-5 w-5" />}
                label={option.label}
                description={option.description}
                onSelect={() => setTheme(option.value)}
              />
            ))}
                      </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Accent color</Label>
            <p className="text-sm text-muted-foreground">
              Set the brand hue used for primary actions and highlights.
            </p>
                    </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {accentOptions.map((option) => {
              const isCustom = option.value === 'custom'
              return (
                <AppearanceOptionCard
                  key={option.value}
                  active={accent === option.value}
                  leading={
                    <span
                      className="h-7 w-7 rounded-full shadow-sm ring-1 ring-border/40"
                      style={{ background: `hsl(${option.tone})` }}
                    />
                  }
                  label={option.label}
                  description={option.description}
                  onSelect={() => setAccent(option.value)}
                  preview={<div className="h-2 w-full rounded-full" style={{ background: option.gradient }} />}
                  footer={
                    isCustom ? (
                      <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase tracking-wide">Light</span>
                            <input
                              type="color"
                              value={customAccent.light}
                              onChange={(event) => {
                                setAccent('custom')
                                setCustomAccentColor('light', event.target.value)
                              }}
                              className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                              aria-label="Pick accent color for light theme"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase tracking-wide">Dark</span>
                            <input
                              type="color"
                              value={customAccent.dark}
                              onChange={(event) => {
                                setAccent('custom')
                                setCustomAccentColor('dark', event.target.value)
                              }}
                              className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                              aria-label="Pick accent color for dark theme"
                            />
                          </label>
                  </div>
                    </div>
                    ) : undefined
                  }
                />
              )
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Typography scale</Label>
            <p className="text-sm text-muted-foreground">
              Adjust reading size to fit your preferred density and display.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {typographyOptions.map((option) => (
              <AppearanceOptionCard
                  key={option.value}
                active={typography === option.value}
                leading={<option.icon className="h-5 w-5" />}
                label={option.label}
                description={option.description}
                onSelect={() => setTypography(option.value)}
                preview={
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Sample</div>
                    <p className="text-sm font-medium">Typography adapts responsively.</p>
                  </div>
                }
              />
            ))}
                      </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Contrast & motion</Label>
            <p className="text-sm text-muted-foreground">
              Tune clarity for different environments and accessibility preferences.
            </p>
                    </div>
          <div className="grid gap-3 md:grid-cols-2">
            {contrastOptions.map((option) => (
              <AppearanceOptionCard
                key={option.value}
                active={contrast === option.value}
                leading={<option.icon className="h-5 w-5" />}
                label={option.label}
                description={option.description}
                onSelect={() => setContrast(option.value)}
              />
            ))}
                  </div>
          <div className="grid gap-3 md:grid-cols-2">
            {motionOptions.map((option) => (
              <AppearanceOptionCard
                key={option.value}
                active={motion === option.value}
                leading={<option.icon className="h-5 w-5" />}
                label={option.label}
                description={option.description}
                onSelect={() => setMotion(option.value)}
              />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Depth & shadows</Label>
            <p className="text-sm text-muted-foreground">
              Choose how pronounced surface shadows should appear.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {depthOptions.map((option) => (
              <AppearanceOptionCard
                key={option.value}
                active={depth === option.value}
                leading={<option.icon className="h-5 w-5" />}
                label={option.label}
                description={option.description}
                onSelect={() => setDepth(option.value)}
              />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Interface shape</Label>
            <p className="text-sm text-muted-foreground">
              Adjust corner rounding for cards, dialogs, and buttons.
            </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRadius(DEFAULT_RADIUS)}
              disabled={radiusIsDefault}
              aria-label="Reset radius to default"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex flex-1 items-center justify-between text-xs text-muted-foreground sm:text-sm">
              <span>Sharper</span>
              <span>{Math.round(radius * 16)}px radius</span>
              <span>Softer</span>
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
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Content density</Label>
              <p className="text-sm text-muted-foreground">
                Control vertical rhythm for lists, cards, and navigation.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDensity(1)}
              disabled={densityIsDefault}
              aria-label="Reset density to default"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <Slider
              value={[density]}
              min={0.85}
              max={1.15}
              step={0.05}
              onValueChange={(value) => setDensity(value[0] ?? density)}
              aria-label="Adjust interface density"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-15%</span>
              <span>Baseline</span>
              <span>+15%</span>
            </div>
            <p className="text-xs text-muted-foreground">{densityLabel}</p>
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
            <Badge variant="secondary">{resolvedTheme === 'dark' ? 'Dark theme' : 'Light theme'}</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div
              className="rounded-xl border transition-all"
              style={{
                background: previewBackground,
                boxShadow: previewShadow,
                padding: `${previewPadding}px`,
                borderColor: contrast === 'bold' ? 'rgba(15, 23, 42, 0.22)' : undefined,
                fontSize: `${previewScale}rem`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide', previewBadgeClass)}>
                  Featured
                </div>
                <span className="text-xs text-muted-foreground">{densityLabel}</span>
              </div>
              <h4 className="mt-4 text-lg font-semibold">Designing a calmer reading experience</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Accent colors, typography, spacing, and depth adapt instantly so you can discover the mood that fits your publication.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2" style={{ gap: `${previewGap}px` }}>
                <div className="rounded-lg border bg-background p-4 shadow-sm transition-all" style={{ boxShadow: previewShadow }}>
                  <p className="text-sm font-medium">Primary action</p>
                  <p className="mt-1 text-xs text-muted-foreground">{previewMotionNote}</p>
                  <Button size="sm" className="mt-4 w-full">
                    Publish
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed bg-background/60 p-4 transition-all" style={{ boxShadow: depth === 'flat' ? 'none' : previewShadow }}>
                  <p className="text-sm font-medium">Article digest</p>
                  <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                    <li>• Visual hierarchy stays clear.</li>
                    <li>• Shadows reinforce emphasis.</li>
                    <li>• Contrast supports accessibility.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Tips</p>
              <ul className="mt-3 space-y-2">
                <li>• Combine comfortable typography with higher density for large screens.</li>
                <li>• Use bold contrast with flat depth to keep things airy but legible.</li>
                <li>• Save presets for different contexts like "Writing mode" or "Presentation".</li>
              </ul>
            </div>
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
                <AppearanceOptionCard
                  key={option.value}
                  active={isActive}
                  leading={<Icon className="h-5 w-5" />}
                  label={option.label}
                  description={option.description}
                  onSelect={() => setViewMode(option.value)}
                  preview={
                    <div className="rounded-md border border-dashed bg-muted/10 p-2 text-muted-foreground" aria-hidden>
                      {option.value === 'default' ? (
                        <div className="space-y-1.5">
                          <div className="h-10 rounded-md bg-muted/40" />
                          <div className="space-y-0.5">
                            <span className="block h-1.5 w-10/12 rounded-full bg-muted/70" />
                            <span className="block h-1.5 w-8/12 rounded-full bg-muted/50" />
                          </div>
                        </div>
                      ) : option.value === 'line' ? (
                        <div className="space-y-1">
                          <span className="block h-1.5 w-full rounded-full bg-muted/70" />
                          <span className="block h-1.5 w-11/12 rounded-full bg-muted/60" />
                          <span className="block h-1.5 w-9/12 rounded-full bg-muted/50" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1.5">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="h-6 rounded-sm bg-muted/50" />
                          ))}
                        </div>
                      )}
                    </div>
                  }
                />
              )
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Presets</Label>
              <p className="text-sm text-muted-foreground">
              Save and recall appearance combinations for different workflows.
              </p>
            </div>
          <Card className="border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Save current appearance</CardTitle>
              <CardDescription>Capture your current theme mix to reuse later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="Focus Mode"
                  maxLength={40}
                  className="sm:flex-1"
                />
                <Button onClick={handleSavePreset} className="sm:w-auto">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save preset
                </Button>
              </div>
              {presetList.length > 0 ? (
                <div className="space-y-3">
                  {presetList.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved {new Date(preset.createdAt).toLocaleString()}
                        </p>
                      </div>
          <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleApplyPreset(preset)}
                        >
                          <Download className="h-4 w-4" />
                          Apply
                </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePreset(preset)}
                          aria-label={`Delete preset ${preset.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                </Button>
          </div>
        </div>
                  ))}
            </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  You haven&apos;t saved any appearance presets yet. Tune a look you love, give it a name, and save it for instant switching.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </CardContent>
    </Card>
  )
}

type PrivacyState = {
  profilePublic: boolean
  showEmail: boolean
  showLastSeen: boolean
  allowMessages: boolean
  allowSearch: boolean
  shareActivity: boolean
  enableTwoFactor: boolean
}

function PrivacySettings() {
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const { toast } = useToast()

  const baseSettings = useMemo<PrivacyState>(
    () => ({
      profilePublic: user?.isProfilePublic ?? true,
      showEmail: user?.showEmail ?? false,
      showLastSeen: user?.showLastSeen ?? false,
      allowMessages: true,
      allowSearch: true,
      shareActivity: true,
      enableTwoFactor: false,
    }),
    [user?.id, user?.isProfilePublic, user?.showEmail, user?.showLastSeen]
  )

  const [privacy, setPrivacy] = useState<PrivacyState>(baseSettings)
  const initialRef = useRef(baseSettings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    initialRef.current = baseSettings
    setPrivacy(baseSettings)
  }, [baseSettings])

  const hasChanges = useMemo(
    () =>
      (Object.keys(privacy) as Array<keyof PrivacyState>).some(
        (key) => privacy[key] !== initialRef.current[key]
      ),
    [privacy]
  )

  const handleToggle = (key: keyof PrivacyState) => (next: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: next }))
  }

  const handleReset = () => {
    setPrivacy(initialRef.current)
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    initialRef.current = privacy
    setSaving(false)
    toast({
      title: 'Privacy preferences saved',
      description: 'TODO: wire these toggles into Strapi privacy settings.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Decide how visible your profile is and what information you share with the community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <ToggleRow
            label="Public profile"
            description="Allow readers who are not signed in to view your profile."
            icon={Shield}
            value={privacy.profilePublic}
            onChange={handleToggle('profilePublic')}
          />
          <ToggleRow
            label="Show contact email"
            description="Display your contact email on your profile page."
            icon={Mail}
            value={privacy.showEmail}
            onChange={handleToggle('showEmail')}
          />
          <ToggleRow
            label="Show last seen"
            description="Display the last time you were active to other members."
            icon={CalendarClock}
            value={privacy.showLastSeen}
            onChange={handleToggle('showLastSeen')}
          />
          <ToggleRow
            label="Allow direct messages"
            description="Let other authors reach out to you through the built-in messenger."
            icon={MessageCircle}
            value={privacy.allowMessages}
            onChange={handleToggle('allowMessages')}
          />
          <ToggleRow
            label="Allow search indexing"
            description="Permit search engines to index your profile for discoverability."
            icon={Search}
            value={privacy.allowSearch}
            onChange={handleToggle('allowSearch')}
            meta={
              privacy.allowSearch ? (
                <Badge variant="secondary" className="mt-1 w-fit">
                  Recommended
                </Badge>
              ) : undefined
            }
          />
          <ToggleRow
            label="Show reading activity"
            description="Let followers know which articles you read and bookmark."
            icon={Eye}
            value={privacy.shareActivity}
            onChange={handleToggle('shareActivity')}
          />
          <ToggleRow
            label="Two-factor authentication"
            description="Protect your account with a secondary verification step at sign in."
            icon={ShieldCheck}
            value={privacy.enableTwoFactor}
            onChange={handleToggle('enableTwoFactor')}
            meta={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Coming soon
              </span>
            }
          />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Data export & account deletion</p>
              <p>
                Need a copy of your data or want to schedule account deletion? Request it and the editorial
                team will reach out within 48 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit gap-2"
                onClick={() =>
                  toast({
                    title: 'Request submitted',
                    description: 'TODO: connect export/deletion requests to support workflow.',
                  })
                }
              >
                <Download className="h-4 w-4" />
                Request export
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleReset} disabled={!hasChanges || saving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save privacy settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type NotificationState = {
  emailMentions: boolean
  emailFollows: boolean
  emailDigest: boolean
  pushComments: boolean
  pushReactions: boolean
  productAnnouncements: boolean
  securityAlerts: boolean
  digestFrequency: 'daily' | 'weekly' | 'monthly'
}

function NotificationsSettings() {
  const { toast } = useToast()
  const baseState = useMemo<NotificationState>(
    () => ({
      emailMentions: true,
      emailFollows: true,
      emailDigest: true,
      pushComments: true,
      pushReactions: true,
      productAnnouncements: false,
      securityAlerts: true,
      digestFrequency: 'weekly',
    }),
    []
  )
  const [preferences, setPreferences] = useState<NotificationState>(baseState)
  const initialRef = useRef(baseState)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    initialRef.current = baseState
    setPreferences(baseState)
  }, [baseState])

  const hasChanges = useMemo(
    () =>
      (Object.keys(preferences) as Array<keyof NotificationState>).some(
        (key) => preferences[key] !== initialRef.current[key]
      ),
    [preferences]
  )

  const handleToggle = (key: keyof NotificationState) => (next: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: next }))
  }

  const handleDigestChange = (frequency: NotificationState['digestFrequency']) => {
    setPreferences((prev) => ({ ...prev, digestFrequency: frequency }))
  }

  const handleReset = () => setPreferences(initialRef.current)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    initialRef.current = preferences
    setSaving(false)
    toast({
      title: 'Notification preferences saved',
      description: 'TODO: sync notification toggles with user preferences in Strapi.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose how and when you hear about new activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email updates
          </h3>
          <ToggleRow
            label="Mentions & replies"
            description="Get an email when someone mentions you or replies to your article."
            icon={Mail}
            value={preferences.emailMentions}
            onChange={handleToggle('emailMentions')}
          />
          <ToggleRow
            label="New followers"
            description="Receive a short note when someone follows your profile."
            icon={BellRing}
            value={preferences.emailFollows}
            onChange={handleToggle('emailFollows')}
          />
          <ToggleRow
            label="Digest summary"
            description="A curated summary of comments, reactions, and saved articles."
            icon={CalendarClock}
            value={preferences.emailDigest}
            onChange={handleToggle('emailDigest')}
            meta={
              <div className="flex items-center gap-2">
                {(['daily', 'weekly', 'monthly'] as NotificationState['digestFrequency'][]).map(
                  (option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={preferences.digestFrequency === option ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-3 text-xs capitalize"
                      onClick={() => handleDigestChange(option)}
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
            }
          />
        </div>

        <Separator className="border-dashed" />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Push notifications
          </h3>
          <ToggleRow
            label="Comments on my articles"
            description="Instant alerts when readers leave feedback on your stories."
            icon={MessageCircle}
            value={preferences.pushComments}
            onChange={handleToggle('pushComments')}
          />
          <ToggleRow
            label="Reactions & bookmarks"
            description="Know when your stories resonate with the community."
            icon={BellRing}
            value={preferences.pushReactions}
            onChange={handleToggle('pushReactions')}
          />
          <ToggleRow
            label="Product announcements"
            description="Hear about new features and beta programs before anyone else."
            icon={Laptop}
            value={preferences.productAnnouncements}
            onChange={handleToggle('productAnnouncements')}
          />
          <ToggleRow
            label="Security alerts"
            description="Critical alerts if someone signs in from a new device or location."
            icon={AlertTriangle}
            value={preferences.securityAlerts}
            onChange={handleToggle('securityAlerts')}
            meta={
              <Badge variant="destructive" className="mt-1 w-fit px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Recommended
              </Badge>
            }
          />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Quiet hours</p>
          <p className="mt-1">
            Notifications are paused between <span className="font-semibold">22:00</span> and{' '}
            <span className="font-semibold">08:00</span> in your local timezone.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-fit gap-2"
            onClick={() =>
              toast({
                title: 'Quiet hours updated',
                description: 'TODO: expose a time range picker for quiet hours.',
              })
            }
          >
            <Clock className="h-4 w-4" />
            Adjust quiet hours
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleReset} disabled={!hasChanges || saving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save notification settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type SessionItem = {
  id: string
  device: string
  platform: 'desktop' | 'mobile'
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

const DEFAULT_SESSIONS: SessionItem[] = [
  {
    id: 'session-1',
    device: 'MacBook Pro',
    platform: 'desktop',
    browser: 'Arc 1.38 · macOS 15.1',
    location: 'Valencia, Spain',
    ip: '193.42.12.18',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15 Pro',
    platform: 'mobile',
    browser: 'Aetheris iOS',
    location: 'Barcelona, Spain',
    ip: '82.19.44.21',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 'session-3',
    device: 'Surface Laptop',
    platform: 'desktop',
    browser: 'Edge 130 · Windows 11',
    location: 'Berlin, Germany',
    ip: '91.202.17.55',
    lastActive: 'Yesterday · 22:17',
    current: false,
  },
]

function SessionsSettings() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<SessionItem[]>(DEFAULT_SESSIONS)
  const [signingOutId, setSigningOutId] = useState<string | null>(null)

  const handleSignOut = async (sessionId: string) => {
    setSigningOutId(sessionId)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    setSigningOutId(null)
    toast({
      title: 'Session revoked',
      description: 'TODO: connect session revocation with the authentication service.',
    })
  }

  const handleSignOutOthers = async () => {
    setSigningOutId('all')
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSessions((prev) => prev.filter((session) => session.current))
    setSigningOutId(null)
    toast({
      title: 'Other sessions signed out',
      description: 'TODO: revoke sessions server-side and notify connected devices.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Keep an eye on where you&apos;re signed in and revoke access you don&apos;t recognise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {sessions.map((session) => {
            const Icon = session.platform === 'mobile' ? Smartphone : Laptop
            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/10 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{session.device}</span>
                    {session.current ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Current session
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <LogOut className="h-3 w-3" />
                      {session.browser}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Shield className="h-3 w-3" />
                      {session.ip}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {session.lastActive}
                    </span>
                  </div>
                </div>

                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 md:w-auto"
                    onClick={() => handleSignOut(session.id)}
                    disabled={signingOutId === session.id || signingOutId === 'all'}
                  >
                    {signingOutId === session.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <Separator className="border-dashed" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="text-sm font-medium text-foreground">Secure your account</p>
            <p>
              Remove sessions you don&apos;t recognise and enable two-factor authentication in the
              privacy tab.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleSignOutOthers}
            disabled={signingOutId === 'all' || sessions.length <= 1}
          >
            {signingOutId === 'all' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Sign out of other sessions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type Invoice = {
  id: string
  period: string
  amount: string
  status: 'Paid' | 'Refunded' | 'Pending'
  downloadUrl: string
}

function BillingSettings() {
  const { toast } = useToast()
  const [processingAction, setProcessingAction] = useState<'manage' | 'payment' | null>(null)
  const invoices: Invoice[] = useMemo(
    () => [
      {
        id: 'INV-2025-003',
        period: 'November 2025',
        amount: '$18.00',
        status: 'Paid',
        downloadUrl: '#',
      },
      {
        id: 'INV-2025-002',
        period: 'October 2025',
        amount: '$18.00',
        status: 'Paid',
        downloadUrl: '#',
      },
      {
        id: 'INV-2025-001',
        period: 'September 2025',
        amount: '$12.00',
        status: 'Refunded',
        downloadUrl: '#',
      },
    ],
    []
  )

  const handlePlanAction = async (type: 'manage' | 'payment') => {
    setProcessingAction(type)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setProcessingAction(null)
    toast({
      title: type === 'manage' ? 'Subscription portal' : 'Payment method',
      description: 'TODO: connect billing actions to the Stripe customer portal.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Review your current plan, payment method, and download past invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Crown className="h-4 w-4 text-primary" />
                Creator Pro
              </div>
              <p className="text-xs text-muted-foreground">
                Unlimited drafts, advanced analytics, and priority support.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              Active · $18/month
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              Next invoice: <span className="font-medium text-foreground">December 10, 2025</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Trial credits applied
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handlePlanAction('manage')}
              disabled={processingAction !== null}
            >
              {processingAction === 'manage' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening portal...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  Manage subscription
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment method
              </div>
              <p className="text-xs text-muted-foreground">
                Visa ending in 4242 · Expires 08/27 · Billing email invoices@aetheris.dev
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-[11px] uppercase tracking-wide">
              Primary
            </Badge>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => handlePlanAction('payment')}
              disabled={processingAction !== null}
            >
              {processingAction === 'payment' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Update payment method
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Invoices
            </h3>
            <Badge variant="secondary" className="px-3 py-1 text-[11px] uppercase tracking-wide">
              Latest 12 months
            </Badge>
          </div>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-foreground">{invoice.period}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{invoice.id}</span>
                    <span className="font-medium text-foreground">{invoice.amount}</span>
                    <Badge
                      variant={invoice.status === 'Paid' ? 'secondary' : 'outline'}
                      className={cn(
                        'px-2 py-0.5 text-[10px] uppercase tracking-wide',
                        invoice.status === 'Refunded' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Need help with billing?</p>
          <p className="mt-1">
            Email <span className="font-medium text-foreground">billing@aetheris.dev</span> and we&apos;ll
            respond within one business day.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  icon?: LucideIcon
  value: boolean
  onChange: (next: boolean) => void
  meta?: ReactNode
  disabled?: boolean
}

function ToggleRow({ label, description, icon: Icon, value, onChange, meta, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background p-4 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {meta && <div className="pt-1 text-xs text-muted-foreground/90">{meta}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !disabled && onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
          value ? 'border-primary bg-primary/80' : 'border-border bg-muted',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform',
            value ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </button>
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
