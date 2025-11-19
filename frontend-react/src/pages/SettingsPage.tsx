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
  CornerDownRight,
  Flame,
  Settings,
  Copy,
  ChevronUp,
  ChevronDown,
  Languages,
  Info,
  Sliders,
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
  SURFACE_PRESETS,
  type ThemeMode,
  type TypographyScale,
  type ContrastMode,
  type DepthStyle,
  type MotionPreference,
  type SurfaceStyle,
  type AccentColor,
} from '@/stores/themeStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { useI18nStore, type Language } from '@/stores/i18nStore'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// settingsNav будет динамическим через useTranslation
const settingsNavItems = [
  { id: 'profile', icon: User },
  { id: 'appearance', icon: Palette },
  { id: 'language', icon: Languages },
  { id: 'privacy', icon: Shield },
  { id: 'notifications', icon: Bell },
  { id: 'sessions', icon: Monitor },
  { id: 'billing', icon: CreditCard },
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
}> = (t: (key: string) => string) => [
  {
    value: 'default',
    label: t('settings.appearance.standardCards') || 'Standard cards',
    description: t('settings.appearance.standardCardsDescription') || 'Balanced layout with imagery',
    icon: Rows,
  },
  {
    value: 'line',
    label: t('settings.appearance.compactList') || 'Compact list',
    description: t('settings.appearance.compactListDescription') || 'Dense list optimized for scanning',
    icon: List,
  },
  {
    value: 'square',
    label: t('settings.appearance.gridView') || 'Grid view',
    description: t('settings.appearance.gridViewDescription') || 'Visual tiles for inspiration',
    icon: LayoutGrid,
  },
]

const getAccentGroups = (t: (key: string) => string): Array<{ id: string; label: string; description: string; accents: AccentColor[] }> => [
  {
    id: 'vivid',
    label: t('settings.appearance.accentGroups.vivid.label') || 'Vivid energy',
    description: t('settings.appearance.accentGroups.vivid.description') || 'High-contrast tones that stand out in busy layouts.',
    accents: ['red', 'crimson', 'magenta', 'fuchsia', 'violet', 'indigo', 'cobalt', 'azure'],
  },
  {
    id: 'botanical',
    label: t('settings.appearance.accentGroups.botanical.label') || 'Fresh & botanical',
    description: t('settings.appearance.accentGroups.botanical.description') || 'Nature-inspired greens and blues suited to calm products.',
    accents: ['cyan', 'turquoise', 'seafoam', 'teal', 'emerald', 'mint', 'green', 'forest', 'sage', 'olive'],
  },
  {
    id: 'warm',
    label: t('settings.appearance.accentGroups.warm.label') || 'Warm & welcoming',
    description: t('settings.appearance.accentGroups.warm.description') || 'Sunset oranges and blush tones for storytelling moments.',
    accents: ['rose', 'peach', 'coral', 'sunset', 'brown', 'bronze', 'amber', 'saffron', 'gold', 'salmon'],
  },
  {
    id: 'cool',
    label: t('settings.appearance.accentGroups.cool.label') || 'Cool & calm',
    description: t('settings.appearance.accentGroups.cool.description') || 'Serene blues and purples for peaceful interfaces.',
    accents: ['orchid', 'plum', 'lavender', 'purple', 'navy', 'blue', 'ocean', 'sky'],
  },
  {
    id: 'muted',
    label: t('settings.appearance.accentGroups.muted.label') || 'Sophisticated neutrals',
    description: t('settings.appearance.accentGroups.muted.description') || 'Soft plums and greys that stay out of the way.',
    accents: ['pure', 'silver', 'mono', 'graphite'],
  },
  {
    id: 'playful',
    label: t('settings.appearance.accentGroups.playful.label') || 'Playful & vibrant',
    description: t('settings.appearance.accentGroups.playful.description') || 'Bright, fun colors for energetic and creative spaces.',
    accents: ['pink', 'lime', 'yellow', 'orange'],
  },
]

const getSurfaceGroups = (t: (key: string) => string): Array<{ id: string; label: string; description: string; palettes: SurfaceStyle[] }> => [
  {
    id: 'luminous',
    label: t('settings.appearance.surfaceGroups.luminous.label') || 'Bright & airy',
    description: t('settings.appearance.surfaceGroups.luminous.description') || 'High-key canvases for daylight dashboards and editorial homes.',
    palettes: ['snow', 'ivory', 'cream', 'daylight', 'geometrydash', 'glacier', 'zenith', 'harbor', 'lumen', 'pearl', 'cloud'],
  },
  {
    id: 'earthy',
    label: t('settings.appearance.surfaceGroups.earthy.label') || 'Warm & grounded',
    description: t('settings.appearance.surfaceGroups.earthy.description') || 'Organic neutrals that pair well with writing-led experiences.',
    palettes: ['canyon', 'terracotta', 'csgo', 'ember', 'terraria', 'sunset', 'sand', 'minecraft', 'moss'],
  },
  {
    id: 'expressive',
    label: t('settings.appearance.surfaceGroups.expressive.label') || 'Soft & expressive',
    description: t('settings.appearance.surfaceGroups.expressive.description') || 'Gradient-ready palettes with gentle colour cast for calm products.',
    palettes: ['aurora', 'mist', 'fog', 'smoke', 'nebula', 'twilight', 'cyberpunk', 'solstice'],
  },
  {
    id: 'neutral',
    label: t('settings.appearance.surfaceGroups.neutral.label') || 'Neutral greys',
    description: t('settings.appearance.surfaceGroups.neutral.description') || 'Versatile grey tones for balanced, professional interfaces.',
    palettes: ['ash', 'slate', 'charcoal', 'stone'],
  },
  {
    id: 'deep',
    label: t('settings.appearance.surfaceGroups.deep.label') || 'Deep focus',
    description: t('settings.appearance.surfaceGroups.deep.description') || 'Immersive dark surfaces for reading in low light.',
    palettes: ['midnight', 'obsidian', 'noir', 'dota', 'onyx', 'shadow', 'storm', 'abyss', 'deep', 'pitch', 'coal', 'jet', 'carbon', 'void', 'nightfall', 'inkwell', 'eclipse', 'cosmos'],
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
        'group relative flex h-full cursor-pointer flex-col gap-3 border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0 focus-visible:ring-0',
        disabled && 'pointer-events-none opacity-60',
        active && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
      )}
      style={{
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex size-11 shrink-0 items-center justify-center border border-border/60 bg-background shadow-sm"
            style={{
              borderRadius: 'var(--radius-sm)',
            }}
          >
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
        <div 
          className="mt-auto border border-dashed bg-background/60 p-3 text-xs text-muted-foreground"
          style={{
            borderRadius: 'var(--radius-sm)',
          }}
        >
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
  const { t } = useTranslation()
  
  const currentSection = location.pathname.split('/').pop() || 'profile'
  
  const settingsNav = settingsNavItems.map(item => ({
    ...item,
    label: t(`settings.${item.id}.title`) || item.id.charAt(0).toUpperCase() + item.id.slice(1),
  }))

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
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-8 pb-6">
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
            {currentSection === 'language' && <LanguageSettings />}
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
  const { t } = useTranslation()
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
        title: t('settings.profile.unsupportedFile'),
        description: t('settings.profile.unsupportedFileDescription'),
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
        title: t('settings.profile.unsupportedFile'),
        description: t('settings.profile.unsupportedFileDescription'),
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
        title: t('settings.profile.imageProcessingFailed'),
        description: t('settings.profile.imageProcessingFailedDescription'),
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
        title: t('settings.profile.imageProcessingFailed'),
        description: t('settings.profile.imageProcessingFailedDescription'),
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

  const contactMethodOptions: Array<{ value: PreferredContactMethod; label: string; helper: string }> = useMemo(() => [
    { value: 'email', label: t('settings.profile.preferredContactMethodEmail'), helper: t('settings.profile.preferredContactMethodEmailDescription') },
    { value: 'direct-message', label: t('settings.profile.preferredContactMethodDirectMessage'), helper: t('settings.profile.preferredContactMethodDirectMessageDescription') },
    { value: 'schedule', label: t('settings.profile.preferredContactMethodSchedule'), helper: t('settings.profile.preferredContactMethodScheduleDescription') },
    { value: 'social', label: t('settings.profile.preferredContactMethodSocial'), helper: t('settings.profile.preferredContactMethodSocialDescription') },
    { value: 'not-specified', label: t('settings.profile.preferredContactMethodNotSpecified'), helper: t('settings.profile.preferredContactMethodNotSpecifiedDescription') },
  ], [t])

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
      title: t('settings.profile.contactDetailsSaved'),
      description: t('settings.profile.description'),
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
      title: t('settings.profile.socialLinksSaved'),
      description: t('settings.profile.description'),
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
      title: t('settings.profile.professionalProfileSaved'),
      description: t('settings.profile.description'),
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
      title: t('settings.profile.focusVisibilitySaved'),
      description: t('settings.profile.description'),
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
        title: t('settings.profile.profileUpdated'),
        description: t('settings.profile.description'),
      })
    } catch (error: unknown) {
      console.error('Failed to update profile', error)
      toast({
        title: t('settings.profile.profileUpdateFailed'),
        description:
          (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
          t('settings.profile.profileUpdateFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.profile.title')}</CardTitle>
        <CardDescription>
          {t('settings.profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="basics" className="text-xs sm:text-sm py-2">
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.profile.basics')}</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">
              <Mail className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.profile.contact')}</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="text-xs sm:text-sm py-2">
              <Briefcase className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.profile.professional')}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm py-2">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.profile.social')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6 mt-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold tracking-wide text-muted-foreground">
              {t('settings.profile.cover')}
            </Label>
            <span className="text-xs text-muted-foreground">{t('settings.profile.coverRecommended')}</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-dashed bg-card/50">
            <div className="aspect-[4/1] w-full">
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
                  <p className="text-sm font-medium">{t('settings.profile.noCover')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.profile.addCover')}
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
                {coverPreview ? t('settings.profile.changeCover') : t('settings.profile.uploadCover')}
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
                  {t('settings.profile.adjustCrop')}
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
                  {t('settings.profile.remove')}
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-sm font-semibold tracking-wide text-muted-foreground">
            {t('settings.profile.avatar')}
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
                {avatarPreview ? t('settings.profile.changeAvatar') : t('settings.profile.uploadAvatar')}
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
                  {t('settings.profile.adjustCrop')}
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
                  {t('settings.profile.remove')}
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="settings-nickname">{t('settings.profile.nickname')}</Label>
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
              <Label htmlFor="settings-bio">{t('settings.profile.bio')}</Label>
              <span className="text-xs text-muted-foreground">
                {bioRemaining} {t('settings.profile.charactersLeft')}
              </span>
            </div>
            <textarea
              id="settings-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t('settings.profile.bioPlaceholder')}
              className="min-h-[140px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={BIO_LIMIT + 10}
              disabled={isSaving}
            />
          </div>
        </section>

        <div className="flex flex-col gap-2 border-t border-dashed pt-6 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isSaving || !hasChanges}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('settings.profile.saving')}
              </>
            ) : (
              t('settings.profile.saveChanges')
            )}
          </Button>
        </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('settings.profile.contactDetails')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.profile.contactDetailsDescription')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
              <Label htmlFor="settings-first-name">{t('settings.profile.firstName')}</Label>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Alex"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-last-name">{t('settings.profile.lastName')}</Label>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Rivera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-contact-email">{t('settings.profile.contactEmail')}</Label>
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
                {t('settings.profile.contactEmailDescription')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-website">{t('settings.profile.website')}</Label>
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
              <Label htmlFor="settings-location">{t('settings.profile.location')}</Label>
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
              {t('common.reset')}
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
                  {t('settings.profile.saving')}
                </>
              ) : (
                t('settings.profile.saveContactInfo')
              )}
            </Button>
          </div>
            </section>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('settings.profile.socialProfiles')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.profile.socialProfilesDescription')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-twitter">{t('settings.profile.twitter')}</Label>
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
              <Label htmlFor="settings-github">{t('settings.profile.github')}</Label>
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
              <Label htmlFor="settings-linkedin">{t('settings.profile.linkedin')}</Label>
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
              <Label htmlFor="settings-portfolio">{t('settings.profile.portfolio')}</Label>
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
              {t('common.reset')}
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
                  {t('settings.profile.saving')}
                </>
              ) : (
                t('settings.profile.saveSocialLinks')
              )}
            </Button>
          </div>
            </section>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6 mt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('settings.profile.professionalProfile')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.profile.professionalProfileDescription')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-headline">{t('settings.profile.headline')}</Label>
                  <Input
                    id="settings-headline"
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                    placeholder={t('settings.profile.headlinePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-role">{t('settings.profile.currentRole')}</Label>
                  <Input
                    id="settings-role"
                    value={currentRole}
                    onChange={(event) => setCurrentRole(event.target.value)}
                    placeholder="Design Director"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-company">{t('settings.profile.currentCompany')}</Label>
                  <Input
                    id="settings-company"
                    value={currentCompany}
                    onChange={(event) => setCurrentCompany(event.target.value)}
                    placeholder="Aetheris Studio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-experience">{t('settings.profile.experience')}</Label>
                  <Input
                    id="settings-experience"
                    value={experienceLevel}
                    onChange={(event) => setExperienceLevel(event.target.value)}
                    placeholder="8+ years in product design"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-timezone">{t('settings.profile.timezone')}</Label>
                  <Input
                    id="settings-timezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    placeholder="UTC+1 · CET"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-pronouns">{t('settings.profile.pronouns')}</Label>
                  <Input
                    id="settings-pronouns"
                    value={pronouns}
                    onChange={(event) => setPronouns(event.target.value)}
                    placeholder="she/they"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-availability">{t('settings.profile.availabilityNote')}</Label>
                  <textarea
                    id="settings-availability"
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                    placeholder={t('settings.profile.availabilityPlaceholder')}
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
                  className="shrink-0"
                >
                  {t('common.reset')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleProfessionalSave}
                  disabled={!professionalHasChanges || professionalSaving}
                  className="gap-2 shrink-0"
                >
                  {professionalSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>{t('settings.profile.saving')}</span>
                    </>
                  ) : (
                    <span>{t('settings.profile.saveProfessionalInfo')}</span>
                  )}
                </Button>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('settings.profile.focusVisibility')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.profile.focusVisibilityDescription')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-languages">{t('settings.profile.languages')}</Label>
              <Input
                id="settings-languages"
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder="English, Spanish (ES), Catalan"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-focus">{t('settings.profile.focusAreas')}</Label>
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
              <Label htmlFor="settings-learning">{t('settings.profile.currentlyLearning')}</Label>
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
              <Label htmlFor="settings-office-hours">{t('settings.profile.officeHours')}</Label>
              <Input
                id="settings-office-hours"
                value={officeHours}
                onChange={(event) => setOfficeHours(event.target.value)}
                placeholder="Replies within 48h · Best between 10:00 and 16:00 CET"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-collaboration">{t('settings.profile.collaborationNotes')}</Label>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('settings.profile.availability')}</p>
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
                  {t('settings.profile.openToMentoring')}
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
                  {t('settings.profile.openToConsulting')}
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
                  {t('settings.profile.openToSpeaking')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('settings.profile.preferredContactMethod')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {contactMethodOptions.map((option) => {
                  const isSelected = preferredContactMethod === option.value
                  return (
                    <TooltipProvider key={option.value}>
                      <Tooltip>
                        <TooltipTrigger>
                  <Button
                    type="button"
                            variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                              'h-full justify-start gap-1 py-3 text-left min-w-0 w-full',
                              isSelected && 'border-primary'
                    )}
                    onClick={() => setPreferredContactMethod(option.value)}
                            aria-pressed={isSelected}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
                              <span className={cn(
                                'text-sm font-semibold truncate',
                                isSelected ? 'text-primary-foreground' : 'text-foreground'
                              )}>
                                {option.label}
                              </span>
                              <span className={cn(
                                'text-xs truncate',
                                isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              )}>
                                {option.helper}
                              </span>
                            </div>
                  </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{option.label}</span>
                            <span className="text-muted-foreground">{option.helper}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
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
              {t('common.reset')}
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
                  {t('settings.profile.saving')}
                </>
              ) : (
                t('settings.profile.saveFocusVisibility')
              )}
            </Button>
          </div>
            </section>
          </TabsContent>
        </Tabs>

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
              <DialogTitle>{t('settings.profile.adjustProfileCover')}</DialogTitle>
              <DialogDescription>
                {t('settings.profile.adjustProfileCoverDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="relative aspect-[4/1] w-full overflow-hidden rounded-xl border border-border/70 bg-muted/40">
                  {coverCropSource ? (
                    <>
                      <Cropper
                        image={coverCropSource}
                        crop={coverCrop}
                        zoom={coverZoom}
                        aspect={4 / 1}
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
                      {t('settings.profile.waitingForImage')}
                    </div>
                  )}
                  <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur md:flex">
                    <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                      4:1
                    </Badge>
                    {t('settings.profile.wideBanner')}
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{t('settings.profile.zoom')}</span>
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
                    <CardTitle className="text-base font-semibold">{t('settings.profile.coverGuidelines')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{t('settings.profile.keepFocusCentered')}</p>
                      <p>{t('settings.profile.keepFocusCenteredDescription')}</p>
                    </div>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{t('settings.profile.useLargeImages')}</p>
                      <p>{t('settings.profile.useLargeImagesDescription', { size: '1600×600px' })}</p>
                    </div>
                    <Separator className="bg-border/60" />
        <div className="space-y-2">
                      <p className="font-medium text-foreground">{t('settings.profile.reEditAnytime')}</p>
                      <p>{t('settings.profile.reEditAnytimeDescription')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={handleCancelCoverCrop} disabled={isCoverProcessing}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmCoverCrop} disabled={isCoverProcessing || !coverCroppedArea} className="gap-2">
                {isCoverProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('settings.profile.processing')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t('settings.profile.useImage')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAvatarCropOpen} onOpenChange={(open) => (open ? setIsAvatarCropOpen(true) : handleCancelAvatarCrop())}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle>{t('settings.profile.adjustAvatar')}</DialogTitle>
              <DialogDescription>
                {t('settings.profile.adjustAvatarDescription')}
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
                      {t('settings.profile.waitingForImage')}
                  </div>
                )}
                <div className="pointer-events-none absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
                  <Badge variant="secondary" className="rounded-sm px-2 py-0.5 uppercase tracking-wide">
                    1:1
                  </Badge>
                  {t('settings.profile.squareCrop')}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{t('settings.profile.zoom')}</span>
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
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmAvatarCrop} disabled={isAvatarProcessing || !avatarCroppedArea} className="gap-2">
                {isAvatarProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('settings.profile.processing')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t('settings.profile.useImage')}
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
  const { t } = useTranslation()
  const {
    theme,
    resolvedTheme,
    setTheme,
    accent,
    setAccent,
    secondaryAccent,
    setSecondaryAccent,
    tertiaryAccent,
    setTertiaryAccent,
    surface,
    setSurface,
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
  } = useThemeStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
    accent: state.accent,
    setAccent: state.setAccent,
    secondaryAccent: state.secondaryAccent,
    setSecondaryAccent: state.setSecondaryAccent,
    tertiaryAccent: state.tertiaryAccent,
    setTertiaryAccent: state.setTertiaryAccent,
    surface: state.surface,
    setSurface: state.setSurface,
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
  }))
  const { mode: viewMode, setMode: setViewMode } = useViewModeStore()

  const surfaceOptions = useMemo(() => {
    return Object.entries(SURFACE_PRESETS).map(([value, config]) => {
      const tone = config.values[resolvedTheme]
      return {
        value: value as SurfaceStyle,
        label: t(`settings.appearance.surfaces.${value}.name`) || config.label,
        description: t(`settings.appearance.surfaces.${value}.description`) || config.description,
        tone,
      }
    })
  }, [resolvedTheme, t])

  const surfaceOptionsByValue = useMemo(() => {
    return surfaceOptions.reduce((acc, option) => {
      acc[option.value] = option
      return acc
    }, {} as Record<SurfaceStyle, (typeof surfaceOptions)[number]>)
  }, [surfaceOptions])

  const accentOptions = useMemo(() => {
    const base = ACCENT_COLOR_PRESETS.map((preset) => ({
      value: preset.value as AccentColor,
      label: t(`settings.appearance.accents.${preset.value}.name`) || preset.label,
      description: t(`settings.appearance.accents.${preset.value}.description`) || preset.description,
      gradient: `linear-gradient(135deg, hsl(${preset.preview}) 0%, hsl(${preset.values.dark.primary}) 100%)`,
      tone: preset.values[resolvedTheme].primary,
      values: preset.values,
    }))
    const custom = buildCustomAccentOption(customAccent)
    base.push({
      value: custom.value,
      label: t('settings.appearance.custom') || custom.label,
      description: custom.description,
      gradient: `linear-gradient(135deg, hsl(${custom.values.light.primary}) 0%, hsl(${custom.values.dark.primary}) 100%)`,
      tone: custom.values[resolvedTheme].primary,
      values: custom.values,
    })
    return base
  }, [customAccent, resolvedTheme, t])

  const accentOptionsByValue = useMemo(() => {
    return accentOptions.reduce<Record<string, (typeof accentOptions)[number]>>((acc, option) => {
      acc[option.value] = option
      return acc
    }, {})
  }, [accentOptions])

  const activeAccent = accentOptions.find((option) => option.value === accent)
  const activeSurface = surfaceOptions.find((option) => option.value === surface)
  const typographyLabel = t(`settings.appearance.typographyScales.${typography}.label`) || (TYPOGRAPHY_SCALES[typography]?.label ?? 'Default')

  const typographyOptions = useMemo(
    () => [
      {
        value: 'default' as TypographyScale,
        label: t('settings.appearance.typographyScales.default.label') || TYPOGRAPHY_SCALES.default.label,
        description: t('settings.appearance.typographyScales.default.description') || TYPOGRAPHY_SCALES.default.description,
        icon: Rows,
      },
      {
        value: 'comfortable' as TypographyScale,
        label: t('settings.appearance.typographyScales.comfortable.label') || TYPOGRAPHY_SCALES.comfortable.label,
        description: t('settings.appearance.typographyScales.comfortable.description') || TYPOGRAPHY_SCALES.comfortable.description,
        icon: Monitor,
      },
      {
        value: 'compact' as TypographyScale,
        label: t('settings.appearance.typographyScales.compact.label') || TYPOGRAPHY_SCALES.compact.label,
        description: t('settings.appearance.typographyScales.compact.description') || TYPOGRAPHY_SCALES.compact.description,
        icon: Smartphone,
      },
    ],
    [t]
  )

  const contrastOptions = useMemo(
    () => [
      {
        value: 'standard' as ContrastMode,
        label: t('settings.appearance.contrast.standard'),
        description: t('settings.appearance.contrast.standardDescription'),
        icon: Eye,
      },
      {
        value: 'bold' as ContrastMode,
        label: t('settings.appearance.contrast.bold'),
        description: t('settings.appearance.contrast.boldDescription'),
        icon: AlertTriangle,
      },
    ],
    [t]
  )

  const motionOptions = useMemo(
    () => [
      {
        value: 'default' as MotionPreference,
        label: t('settings.appearance.motion.animated'),
        description: t('settings.appearance.motion.animatedDescription'),
        icon: RefreshCw,
      },
      {
        value: 'reduced' as MotionPreference,
        label: t('settings.appearance.motion.reduced'),
        description: t('settings.appearance.motion.reducedDescription'),
        icon: EyeOff,
      },
    ],
    [t]
  )

  const depthOptions = useMemo(
    () => [
      {
        value: 'flat' as DepthStyle,
        label: t('settings.appearance.depthOptions.flat'),
        description: t('settings.appearance.depthOptions.flatDescription'),
        icon: Shield,
      },
      {
        value: 'soft' as DepthStyle,
        label: t('settings.appearance.depthOptions.soft'),
        description: t('settings.appearance.depthOptions.softDescription'),
        icon: ShieldCheck,
      },
      {
        value: 'elevated' as DepthStyle,
        label: t('settings.appearance.depthOptions.elevated'),
        description: t('settings.appearance.depthOptions.elevatedDescription'),
        icon: Crown,
      },
    ],
    [t]
  )

  const [themeName, setThemeName] = useState('')
  const [importValue, setImportValue] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [isAccentDropdownOpen, setIsAccentDropdownOpen] = useState(false)
  const [isSurfaceDropdownOpen, setIsSurfaceDropdownOpen] = useState(false)
  const [themeDescriptionDialog, setThemeDescriptionDialog] = useState<{ open: boolean; theme: { name: string; description: string } | null }>({ open: false, theme: null })
  const accentDropdownRef = useRef<HTMLDivElement>(null)
  const surfaceDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accentDropdownRef.current && !accentDropdownRef.current.contains(event.target as Node)) {
        setIsAccentDropdownOpen(false)
      }
      if (surfaceDropdownRef.current && !surfaceDropdownRef.current.contains(event.target as Node)) {
        setIsSurfaceDropdownOpen(false)
      }
    }

    if (isAccentDropdownOpen || isSurfaceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccentDropdownOpen, isSurfaceDropdownOpen])

  // Collapsed groups state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('aetheris-theme-groups-collapsed')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const toggleGroup = (groupKey: string) => {
    const newState = { ...collapsedGroups, [groupKey]: !collapsedGroups[groupKey] }
    setCollapsedGroups(newState)
    localStorage.setItem('aetheris-theme-groups-collapsed', JSON.stringify(newState))
  }

  const handleShowDescription = (e: React.MouseEvent | undefined, theme: { name: string; description: string }) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setThemeDescriptionDialog({ open: true, theme })
  }

  // Optimized 3D hover effect with requestAnimationFrame
  const cardRefs = useRef<Map<string, { element: HTMLElement; rafId: number | null; isHovering: boolean }>>(new Map())

  const handleCardMouseEnter = (themeId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const target = e.target as HTMLElement
    
    // Don't apply effect if hovering over any button (same as Apply button logic)
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }
    
    const ref = cardRefs.current.get(themeId)
    
    // If not already hovering, add smooth transition for initial hover
    if (!ref?.isHovering) {
      card.style.transition = 'transform 0.1s ease-out, z-index 0.1s ease-out'
      cardRefs.current.set(themeId, { element: card, rafId: null, isHovering: true })
      
      // After transition, remove it for instant response
      setTimeout(() => {
        card.style.transition = 'none'
      }, 100)
    }
    
    // Lift card above others on hover
    card.style.zIndex = '10'
  }

  const handleCardMouseMove = (themeId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const target = e.target as HTMLElement
    
    // Don't apply 3D effect if hovering over any button (same as Apply button logic)
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }
    
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // More responsive: divide by 4 for faster response (like reduced motion)
    const rotateX = Math.max(-15, Math.min(15, (y - centerY) / 4))
    const rotateY = Math.max(-15, Math.min(15, (centerX - x) / 4))
    
    // Cancel previous animation frame if exists
    const ref = cardRefs.current.get(themeId)
    if (ref?.rafId) {
      cancelAnimationFrame(ref.rafId)
    }
    
    // Use requestAnimationFrame for smooth performance
    const rafId = requestAnimationFrame(() => {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
    })
    
    cardRefs.current.set(themeId, { element: card, rafId, isHovering: true })
  }

  const handleCardMouseLeave = (themeId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    
    // Cancel animation frame
    const ref = cardRefs.current.get(themeId)
    if (ref?.rafId) {
      cancelAnimationFrame(ref.rafId)
    }
    
    // Mark as not hovering
    cardRefs.current.set(themeId, { element: card, rafId: null, isHovering: false })
    
    // Add smooth transition for fade-out effect
    card.style.transition = 'transform 0.3s ease-out, z-index 0.3s ease-out'
    // Reset z-index
    card.style.zIndex = ''
    
    // Smooth reset with transition
    requestAnimationFrame(() => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
    })
  }

  // Official themes grouped
  const officialThemesGroups = useMemo(
    () => ({
      basic: [
      {
        id: 'default-theme',
          name: t('settings.appearance.themes.defaultTheme.name'),
          description: t('settings.appearance.themes.defaultTheme.description'),
        accent: 'pure' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 15 / 16, // 15px
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'midnight-blue',
          name: t('settings.appearance.themes.midnightBlue.name'),
          description: t('settings.appearance.themes.midnightBlue.description'),
        accent: 'cobalt' as AccentColor,
        secondaryAccent: 'azure' as AccentColor, // Небесный оттенок
        tertiaryAccent: 'cyan' as AccentColor, // Яркий акцент
        surface: 'midnight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
        {
          id: 'sunset-warm',
          name: t('settings.appearance.themes.sunsetWarm.name'),
          description: t('settings.appearance.themes.sunsetWarm.description'),
        accent: 'amber' as AccentColor,
          secondaryAccent: 'orange' as AccentColor, // Закат
          tertiaryAccent: 'coral' as AccentColor, // Коралловый закат
        surface: 'sunset' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
        {
          id: 'forest-green',
          name: t('settings.appearance.themes.forestGreen.name'),
          description: t('settings.appearance.themes.forestGreen.description'),
        accent: 'emerald' as AccentColor,
          secondaryAccent: 'forest' as AccentColor, // Лес
          tertiaryAccent: 'lime' as AccentColor, // Свежая зелень
        surface: 'moss' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'minimal-light',
          name: t('settings.appearance.themes.minimalLight.name'),
          description: t('settings.appearance.themes.minimalLight.description'),
        accent: 'mono' as AccentColor,
        surface: 'daylight' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
        {
          id: 'cosmic-dark',
          name: t('settings.appearance.themes.cosmicDark.name'),
          description: t('settings.appearance.themes.cosmicDark.description'),
        accent: 'violet' as AccentColor,
          secondaryAccent: 'plum' as AccentColor, // Космический фиолетовый
          tertiaryAccent: 'magenta' as AccentColor, // Космический розовый
        surface: 'cosmos' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.15,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'ocean-breeze',
          name: t('settings.appearance.themes.oceanBreeze.name'),
          description: t('settings.appearance.themes.oceanBreeze.description'),
          accent: 'azure' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor, // Океан
          tertiaryAccent: 'teal' as AccentColor, // Бирюза
          surface: 'harbor' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'autumn-warmth',
          name: t('settings.appearance.themes.autumnWarmth.name'),
          description: t('settings.appearance.themes.autumnWarmth.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Осенний желтый
          tertiaryAccent: 'coral' as AccentColor, // Теплый коралл
          surface: 'ember' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'snow-white',
          name: t('settings.appearance.themes.snowWhite.name'),
          description: t('settings.appearance.themes.snowWhite.description'),
          accent: 'mono' as AccentColor,
          surface: 'snow' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'deep-purple',
          name: t('settings.appearance.themes.deepPurple.name'),
          description: t('settings.appearance.themes.deepPurple.description'),
          accent: 'violet' as AccentColor,
          secondaryAccent: 'plum' as AccentColor, // Слива
          tertiaryAccent: 'fuchsia' as AccentColor, // Яркая фуксия
          surface: 'midnight' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
    ],
      games: [
        {
          id: 'cyberpunk',
          name: t('settings.appearance.themes.cyberpunk.name'),
          description: t('settings.appearance.themes.cyberpunk.description'),
          accent: 'fuchsia' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor, // Неоновый синий
          tertiaryAccent: 'lime' as AccentColor, // Неоновый зеленый
          surface: 'cyberpunk' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'minecraft',
        name: t('settings.appearance.themes.minecraft.name'),
        description: t('settings.appearance.themes.minecraft.description'),
        accent: 'forest' as AccentColor,
        secondaryAccent: 'emerald' as AccentColor, // Трава
        tertiaryAccent: 'brown' as AccentColor, // Земля
        surface: 'minecraft' as SurfaceStyle,
        radius: 0.25,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'csgo',
        name: t('settings.appearance.themes.csgo.name'),
        description: t('settings.appearance.themes.csgo.description'),
        accent: 'orange' as AccentColor,
        secondaryAccent: 'amber' as AccentColor, // Золото
        tertiaryAccent: 'gold' as AccentColor, // Премиум золото
        surface: 'csgo' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'dota',
        name: t('settings.appearance.themes.dota.name'),
        description: t('settings.appearance.themes.dota.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'red' as AccentColor, // Враги
        surface: 'dota' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'terraria',
        name: 'Terraria',
        description: t('settings.appearance.themes.terraria.description'),
        accent: 'brown' as AccentColor,
        secondaryAccent: 'amber' as AccentColor, // Золото
        surface: 'terraria' as SurfaceStyle,
        radius: 0.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'geometry-dash',
        name: 'Geometry Dash',
        description: t('settings.appearance.themes.geometryDash.description'),
        accent: 'lime' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor, // Неоновый синий
        tertiaryAccent: 'magenta' as AccentColor, // Неоновый розовый
        surface: 'geometrydash' as SurfaceStyle,
        radius: 0,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'valorant',
        name: 'VALORANT',
        description: t('settings.appearance.themes.valorant.description'),
        accent: 'red' as AccentColor,
        secondaryAccent: 'crimson' as AccentColor, // Яркий красный
        tertiaryAccent: 'amber' as AccentColor, // Золотой акцент
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'league-of-legends',
        name: 'League of Legends',
        description: t('settings.appearance.themes.leagueOfLegends.description'),
        accent: 'gold' as AccentColor,
        secondaryAccent: 'blue' as AccentColor, // Мана
        tertiaryAccent: 'amber' as AccentColor, // Золотой оттенок
        surface: 'midnight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'overwatch',
        name: 'Overwatch',
        description: t('settings.appearance.themes.overwatch.description'),
        accent: 'azure' as AccentColor,
        secondaryAccent: 'orange' as AccentColor, // Враги
        tertiaryAccent: 'cyan' as AccentColor, // Яркий синий
        surface: 'nightfall' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'apex-legends',
        name: 'Apex Legends',
        description: t('settings.appearance.themes.apexLegends.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'orange' as AccentColor, // Огонь
        tertiaryAccent: 'amber' as AccentColor, // Золотой акцент
        surface: 'void' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'fortnite',
        name: 'Fortnite',
        description: t('settings.appearance.themes.fortnite.description'),
        accent: 'magenta' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor, // Яркий синий
        tertiaryAccent: 'fuchsia' as AccentColor, // Яркая фуксия
        surface: 'twilight' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
        {
          id: 'among-us',
        name: 'Among Us',
          description: t('settings.appearance.themes.amongUs.description'),
        accent: 'red' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor, // Голубой космонавт
        tertiaryAccent: 'lime' as AccentColor, // Зеленый космонавт
          surface: 'daylight' as SurfaceStyle,
          radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
        official: true,
        },
      {
        id: 'pokemon',
        name: 'Pokémon',
        description: t('settings.appearance.themes.pokemon.description'),
        accent: 'yellow' as AccentColor,
        secondaryAccent: 'blue' as AccentColor, // Вода
        tertiaryAccent: 'red' as AccentColor, // Покебол
        surface: 'daylight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'zelda',
        name: 'The Legend of Zelda',
        description: t('settings.appearance.themes.zelda.description'),
        accent: 'gold' as AccentColor,
        secondaryAccent: 'emerald' as AccentColor, // Природа
        tertiaryAccent: 'amber' as AccentColor, // Сокровища
        surface: 'moss' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'portal',
        name: 'Portal',
        description: t('settings.appearance.themes.portal.description'),
        accent: 'orange' as AccentColor,
        secondaryAccent: 'azure' as AccentColor, // Синий портал
        tertiaryAccent: 'cyan' as AccentColor, // Яркий синий акцент
        surface: 'noir' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'half-life',
        name: 'Half-Life',
        description: t('settings.appearance.themes.halfLife.description'),
        accent: 'amber' as AccentColor,
        secondaryAccent: 'orange' as AccentColor, // Огонь
        tertiaryAccent: 'crimson' as AccentColor, // Опасность
        surface: 'eclipse' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'undertale',
        name: 'Undertale',
        description: t('settings.appearance.themes.undertale.description'),
        accent: 'rose' as AccentColor,
        secondaryAccent: 'yellow' as AccentColor, // Золото
        tertiaryAccent: 'gold' as AccentColor, // Премиум золото
        surface: 'sand' as SurfaceStyle,
        radius: 0.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'hollow-knight',
        name: 'Hollow Knight',
        description: t('settings.appearance.themes.hollowKnight.description'),
        accent: 'silver' as AccentColor,
        secondaryAccent: 'orange' as AccentColor, // Огонь
        tertiaryAccent: 'amber' as AccentColor, // Свет
        surface: 'void' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
        {
          id: 'stardew-valley',
          name: 'Stardew Valley',
          description: t('settings.appearance.themes.stardewValley.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'brown' as AccentColor, // Земля
          tertiaryAccent: 'amber' as AccentColor, // Золото урожая
          surface: 'terraria' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'balatro',
          name: 'Balatro',
          description: t('settings.appearance.themes.balatro.description'),
          accent: 'gold' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Золотой оттенок
          tertiaryAccent: 'yellow' as AccentColor, // Яркое золото
          surface: 'noir' as SurfaceStyle,
          radius: 0.75,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'metro-last-light',
          name: 'Metro Last Light',
          description: t('settings.appearance.themes.metroLastLight.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Свет фонаря
          tertiaryAccent: 'crimson' as AccentColor, // Опасность
          surface: 'eclipse' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'metro-exodus',
          name: 'Metro Exodus',
          description: t('settings.appearance.themes.metroExodus.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'orange' as AccentColor, // Огонь
          tertiaryAccent: 'amber' as AccentColor, // Свет
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'war-thunder',
          name: 'War Thunder',
          description: t('settings.appearance.themes.warThunder.description'),
          accent: 'blue' as AccentColor,
          secondaryAccent: 'cobalt' as AccentColor, // Военный синий
          tertiaryAccent: 'azure' as AccentColor, // Небо
          surface: 'slate' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'warhammer',
          name: 'Warhammer',
          description: t('settings.appearance.themes.warhammer.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'crimson' as AccentColor, // Кровь
          tertiaryAccent: 'gold' as AccentColor, // Имперское золото
          surface: 'obsidian' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'clash-royale',
          name: 'Clash Royale',
          description: t('settings.appearance.themes.clashRoyale.description'),
          accent: 'magenta' as AccentColor,
          secondaryAccent: 'gold' as AccentColor, // Золото
          tertiaryAccent: 'fuchsia' as AccentColor, // Яркая фуксия
          surface: 'twilight' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'block-strike',
          name: 'Block Strike',
          description: t('settings.appearance.themes.blockStrike.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'red' as AccentColor, // Враги
          tertiaryAccent: 'lime' as AccentColor, // Союзники
          surface: 'minecraft' as SurfaceStyle,
          radius: 0.25,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      ],
      extraordinary: [
        {
          id: 'scp',
          name: 'SCP Foundation',
          description: t('settings.appearance.themes.scp.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Предупреждение
          tertiaryAccent: 'crimson' as AccentColor, // Опасность
          surface: 'noir' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'backrooms',
          name: t('settings.appearance.themes.backrooms.name'),
          description: t('settings.appearance.themes.backrooms.description'),
          accent: 'yellow' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Тусклый свет
          surface: 'ivory' as SurfaceStyle,
          radius: 0.25,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'soft' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
        {
          id: 'ussr',
          name: t('settings.appearance.themes.ussr.name'),
          description: t('settings.appearance.themes.ussr.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'gold' as AccentColor, // Звезда
          tertiaryAccent: 'amber' as AccentColor, // Серп и молот
          surface: 'charcoal' as SurfaceStyle,
          radius: 0.75,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'china',
          name: t('settings.appearance.themes.china.name'),
          description: t('settings.appearance.themes.china.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'gold' as AccentColor, // Императорское золото
          tertiaryAccent: 'amber' as AccentColor, // Драконье золото
          surface: 'midnight' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'banana',
          name: t('settings.appearance.themes.banana.name'),
          description: t('settings.appearance.themes.banana.description'),
          accent: 'yellow' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Зрелый банан
          tertiaryAccent: 'saffron' as AccentColor, // Яркий желтый
          surface: 'daylight' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'apple-inc',
          name: 'Apple Inc.',
          description: t('settings.appearance.themes.appleInc.description'),
          accent: 'mono' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
        {
          id: 'arasaka',
          name: 'Arasaka Inc.',
          description: t('settings.appearance.themes.arasaka.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'crimson' as AccentColor, // Корпоративный красный
          tertiaryAccent: 'amber' as AccentColor, // Золотой акцент
          surface: 'obsidian' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'aliexpress',
          name: 'Aliexpress',
          description: t('settings.appearance.themes.aliexpress.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'red' as AccentColor, // Брендовый красный
          tertiaryAccent: 'amber' as AccentColor, // Золотой акцент
          surface: 'daylight' as SurfaceStyle,
          radius: 0.75,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'alien',
          name: t('settings.appearance.themes.alien.name'),
          description: t('settings.appearance.themes.alien.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor, // Инопланетный синий
          tertiaryAccent: 'lime' as AccentColor, // Яркий зеленый
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'predator',
          name: t('settings.appearance.themes.predator.name'),
          description: t('settings.appearance.themes.predator.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'emerald' as AccentColor, // Камуфляж
          tertiaryAccent: 'crimson' as AccentColor, // Кровь
          surface: 'moss' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'anime',
          name: 'Anime',
          description: t('settings.appearance.themes.anime.description'),
          accent: 'magenta' as AccentColor,
          secondaryAccent: 'fuchsia' as AccentColor, // Яркая фуксия
          tertiaryAccent: 'pink' as AccentColor, // Розовый акцент
          surface: 'twilight' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'demon-slayer',
          name: 'Demon Slayer',
          description: t('settings.appearance.themes.demonSlayer.description'),
          accent: 'azure' as AccentColor,
          secondaryAccent: 'crimson' as AccentColor, // Кровь
          tertiaryAccent: 'cyan' as AccentColor, // Водное дыхание
          surface: 'nightfall' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'one-piece',
          name: t('settings.appearance.themes.onePiece.name'),
          description: t('settings.appearance.themes.onePiece.description'),
          accent: 'blue' as AccentColor,
          secondaryAccent: 'red' as AccentColor, // Флаг пиратов
          tertiaryAccent: 'yellow' as AccentColor, // Золото
          surface: 'harbor' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
        {
          id: 'truffle',
          name: t('settings.appearance.themes.truffle.name'),
          description: t('settings.appearance.themes.truffle.description'),
          accent: 'brown' as AccentColor,
          secondaryAccent: 'amber' as AccentColor, // Золотой трюфель
          tertiaryAccent: 'coral' as AccentColor, // Розовый оттенок
          surface: 'sand' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'calamity',
          name: 'Calamity',
          description: t('settings.appearance.themes.calamity.description'),
          accent: 'violet' as AccentColor,
          secondaryAccent: 'magenta' as AccentColor, // Катастрофический розовый
          tertiaryAccent: 'plum' as AccentColor, // Темный фиолетовый
          surface: 'cosmos' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'berserk',
          name: t('settings.appearance.themes.berserk.name'),
          description: t('settings.appearance.themes.berserk.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'crimson' as AccentColor, // Кровь
          tertiaryAccent: 'amber' as AccentColor, // Огонь
          surface: 'obsidian' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'vagabond',
          name: t('settings.appearance.themes.vagabond.name'),
          description: t('settings.appearance.themes.vagabond.description'),
        accent: 'mono' as AccentColor,
          surface: 'noir' as SurfaceStyle,
          radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'chainsaw-man',
          name: t('settings.appearance.themes.chainsawMan.name'),
          description: t('settings.appearance.themes.chainsawMan.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'yellow' as AccentColor, // Огонь цепной пилы
          tertiaryAccent: 'orange' as AccentColor, // Яркий огонь
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'hunter-x-hunter',
          name: t('settings.appearance.themes.hunterXHunter.name'),
          description: t('settings.appearance.themes.hunterXHunter.description'),
          accent: 'azure' as AccentColor,
          secondaryAccent: 'emerald' as AccentColor, // Природа
        surface: 'daylight' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
          density: 1.05,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
        {
          id: 'manga',
          name: t('settings.appearance.themes.manga.name'),
          description: t('settings.appearance.themes.manga.description'),
          accent: 'mono' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 0,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
          id: 'made-in-abyss',
          name: t('settings.appearance.themes.madeInAbyss.name'),
          description: t('settings.appearance.themes.madeInAbyss.description'),
        accent: 'violet' as AccentColor,
          surface: 'midnight' as SurfaceStyle,
          radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
          density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
    ],
    }),
    [t]
  )

  // Flatten official themes for compatibility
  const officialThemes = useMemo(
    () => [...officialThemesGroups.basic, ...officialThemesGroups.games, ...officialThemesGroups.extraordinary],
    [officialThemesGroups]
  )

  // Custom themes (stored in localStorage)
  const [customThemes, setCustomThemes] = useState<Array<{
    id: string
    name: string
    description?: string
    accent: AccentColor
    surface: SurfaceStyle
    radius: number
    typography: TypographyScale
    contrast: ContrastMode
    density: number
    depth: DepthStyle
    motion: MotionPreference
    createdAt: number
    official?: boolean
  }>>(() => {
    try {
      const stored = localStorage.getItem('aetheris-custom-themes')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const allThemes = useMemo(
    () => [...officialThemes, ...customThemes].sort((a, b) => {
      if (a.official && !b.official) return -1
      if (!a.official && b.official) return 1
      // Для кастомных тем сортируем по дате создания, для официальных - по id
      const aDate = !a.official && 'createdAt' in a ? ((a as any).createdAt || 0) : 0
      const bDate = !b.official && 'createdAt' in b ? ((b as any).createdAt || 0) : 0
      return bDate - aDate
    }),
    [officialThemes, customThemes]
  )

  const radiusIsDefault = Math.abs(radius - DEFAULT_RADIUS) < 0.005
  const densityIsDefault = Math.abs(density - 1) < 0.001

  const densityPercent = Math.round((density - 1) * 100)
  const densityLabel =
    densityPercent === 0
      ? t('settings.appearance.standardSpacing')
      : densityPercent > 0
        ? `${t('settings.appearance.expandedBy')} ${densityPercent}%`
        : `${t('settings.appearance.condensedBy')} ${Math.abs(densityPercent)}%`
  const previewScale = TYPOGRAPHY_SCALES[typography]?.scale ?? 1
  const previewShadowMap: Record<DepthStyle, string> = {
    flat: '0 1px 2px rgba(15, 23, 42, 0.05)',
    soft: '0 18px 40px rgba(15, 23, 42, 0.12)',
    elevated: '0 30px 70px rgba(15, 23, 42, 0.22)',
  }
  const previewShadow = previewShadowMap[depth]
  const previewBackground = 'hsl(var(--background))'
  const previewGap = 18 * density
  const previewPadding = 24 * density
  const previewMotionNote = motion === 'reduced' ? 'Motion minimized' : 'Animations enabled'

  const handleCreateTheme = () => {
    if (!themeName.trim()) {
      toast({
        title: t('settings.appearance.themeNameRequired'),
        description: t('settings.appearance.themeNameRequiredDescription'),
        variant: 'destructive',
      })
      return
    }

    const newTheme = {
      id: `theme-${Date.now()}`,
      name: themeName.trim(),
      description: t('settings.appearance.customThemeDescription', { accent: activeAccent?.label ?? t('settings.appearance.custom'), surface: activeSurface?.label ?? t('settings.appearance.custom') }),
      accent,
      surface,
      radius,
      typography,
      contrast,
      density,
      depth,
      motion,
      createdAt: Date.now(),
      official: false,
    }

    const updated = [...customThemes, newTheme]
    setCustomThemes(updated)
    localStorage.setItem('aetheris-custom-themes', JSON.stringify(updated))
    setThemeName('')
    toast({
      title: 'Theme created',
      description: `"${newTheme.name}" has been saved.`,
    })
  }

  const handleApplyTheme = (theme: typeof allThemes[number]) => {
    setAccent(theme.accent)
    // Устанавливаем дополнительные акцентные цвета, если они есть в теме
    const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
    setSecondaryAccent(themeWithAccents.secondaryAccent)
    setTertiaryAccent(themeWithAccents.tertiaryAccent)
    setSurface(theme.surface)
    setRadius(theme.radius)
    setTypography(theme.typography)
    setContrast(theme.contrast)
    // Don't change density - keep user's current setting
    setDepth(theme.depth)
    setMotion(theme.motion)
    toast({
      title: 'Theme applied',
      description: `"${theme.name}" is now active.`,
    })
  }

  const handleDeleteTheme = (themeId: string) => {
    const updated = customThemes.filter((t) => t.id !== themeId)
    setCustomThemes(updated)
    localStorage.setItem('aetheris-custom-themes', JSON.stringify(updated))
    toast({
      title: 'Theme deleted',
      description: 'Theme has been removed.',
    })
  }

  const handleImportTheme = () => {
    try {
      const parsed = JSON.parse(importValue)
      if (
        parsed.accent &&
        parsed.surface &&
        typeof parsed.radius === 'number' &&
        parsed.typography &&
        parsed.contrast &&
        typeof parsed.density === 'number' &&
        parsed.depth &&
        parsed.motion
      ) {
        setAccent(parsed.accent)
        setSurface(parsed.surface)
        setRadius(parsed.radius)
        setTypography(parsed.typography)
        setContrast(parsed.contrast)
        setDensity(parsed.density)
        setDepth(parsed.depth)
        setMotion(parsed.motion)
        setImportValue('')
        setShowImportDialog(false)
        toast({
          title: t('settings.appearance.themeImported'),
          description: t('settings.appearance.themeImportedDescription'),
        })
      } else {
        throw new Error('Invalid theme format')
      }
    } catch (error) {
      toast({
        title: t('settings.appearance.importFailed'),
        description: t('settings.appearance.importFailedDescription'),
        variant: 'destructive',
      })
    }
  }

  const handleResetToDefault = () => {
    setAccent('pure')
    setSurface('obsidian')
    setTypography('comfortable')
    setRadius(15 / 16) // 15px = 0.9375
    setContrast('standard')
    setDensity(1)
    setDepth('soft')
    setMotion('default')
    toast({
      title: 'Theme reset',
      description: 'Theme has been reset to default settings.',
    })
  }

  const feedPreviewItems = [
    {
      title: 'Collaborative editing spaces',
      meta: 'Mentor thread · 24 replies',
      status: 'Saved',
    },
    {
      title: 'Async rituals that actually work',
      meta: 'Course cohort · 18 learners',
      status: 'Followed',
    },
    {
      title: 'Starter kit: API-first newsroom',
      meta: 'Developer hub · Updated today',
      status: 'Pinned',
    },
  ]
  const trendingPreviewItems = [
    {
      title: 'Staging calm product launches',
      subtitle: 'Nova Rivera · 4.8k reads',
    },
    {
      title: 'Composable newsroom workflows',
      subtitle: 'Aetheris Labs · 3.9k reads',
    },
    {
      title: 'From idea to shipped in 48 hours',
      subtitle: 'Community panel · 3.1k reads',
    },
  ]

  const customAccentOption = accentOptionsByValue['custom']

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.appearance.title')}</CardTitle>
        <CardDescription>
          {t('settings.appearance.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="colors" className="text-xs sm:text-sm py-2">
              <Sliders className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.appearance.general')}</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="text-xs sm:text-sm py-2">
              <Palette className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.appearance.themesTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs sm:text-sm py-2">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.appearance.style')}</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs sm:text-sm py-2">
              <LayoutGrid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('settings.appearance.layout')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6 mt-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                  <Label className="text-sm font-semibold">{t('settings.appearance.themeMode')}</Label>
              <p className="text-sm text-muted-foreground">
                    {t('settings.appearance.themeModeDescription')}
              </p>
            </div>
            <Badge variant="outline" className="self-start">
                  {theme === 'system' ? `${t('settings.appearance.system')} (${resolvedTheme})` : `${t(`settings.appearance.${theme}`)} ${t('settings.appearance.theme')}`}
            </Badge>
          </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {themeModeOptions.map((option) => (
                  <AppearanceOptionCard
                  key={option.value}
                    active={theme === option.value}
                    leading={<option.icon className="h-5 w-5" />}
                    label={t(`settings.appearance.${option.value}`)}
                    description={t(`settings.appearance.${option.value}Description`)}
                    onSelect={() => setTheme(option.value)}
                  />
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="live-preview" className="overflow-hidden rounded-lg border border-border/60 bg-muted/10 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 focus-within:outline-none">
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline focus-visible:outline-none">
                <div className="flex w-full flex-col gap-0.5 pr-6">
                  <span className="text-sm font-semibold">{t('settings.appearance.livePreviewTitle')}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {t('settings.appearance.livePreviewSubtitle')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div
              className="rounded-xl border border-border/70 bg-background/95 text-foreground shadow-lg ring-1 ring-border/30 backdrop-blur-sm"
              style={{
                background: previewBackground,
                padding: `${previewPadding}px`,
                boxShadow: previewShadow,
                fontSize: `${previewScale}rem`,
              }}
            >
              <div className="flex flex-col" style={{ gap: `${previewGap}px` }}>
                <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card/90 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        AE
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">{t('settings.appearance.aetherisCommunity')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.appearance.headerChromeAdapts', { accent: activeAccent?.label ?? t('settings.appearance.accent') })}
                        </p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Button size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t('settings.appearance.newPost')}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Bell className="h-4 w-4" />
                      </Button>
                  </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="px-2 py-0.5 text-[11px] uppercase tracking-wide">
                      {activeSurface?.label ?? t('settings.appearance.surface')} {t('settings.appearance.surface')}
                    </Badge>
                    <span className="inline-flex items-center gap-1">
                      <Rows className="h-3 w-3" />
                      {typographyLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <LayoutGrid className="h-3 w-3" />
                      {densityLabel}
                    </span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/95 p-5 shadow-sm">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.9]"
                    style={{
                      background:
                        'linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.08))',
                    }}
                  />
                  <div className="relative z-10 space-y-4">
                    <Badge className="w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                      {t('settings.appearance.heroSpotlight')}
                    </Badge>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-semibold leading-snug">
                        {t('settings.appearance.calmerSurfaces')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.appearance.heroMirrors')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs font-medium text-primary">
                          #product-design
                        </Badge>
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs font-medium text-primary">
                          #community
                        </Badge>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs font-medium text-primary">
                          #developer-tools
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-[11px] font-semibold">NR</span>
                        Nova Rivera
                      </div>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {t('article.minRead', { minutes: 6 })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Flame className="h-3.5 w-3.5" />
                        {t('trending.title')}
            </span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      {t('settings.appearance.continueReading')}
                      <CornerDownRight className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>

                <div className="rounded-lg border border-border/70 bg-card/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{t('settings.appearance.articleFeed')}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {t('settings.appearance.live')}
                    </Badge>
                  </div>
                  <ul className="mt-4 flex flex-col" style={{ gap: `${previewGap * 0.6}px` }}>
                    {feedPreviewItems.map((item, index) => (
                      <li key={item.title}>
                        <button
                          type="button"
                          className="group flex w-full items-start gap-3 rounded-lg border border-transparent bg-muted/20 p-3 text-left transition hover:border-primary/40 hover:bg-muted/30"
                        >
                          <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary transition group-hover:scale-110" />
                          <div className="flex-1">
                            <p className="text-sm font-medium transition group-hover:text-primary">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.meta}</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 px-2 py-0.5 text-[11px] uppercase tracking-wide text-primary">
                            {index === 0 ? t('settings.appearance.new') : item.status}
                          </Badge>
                </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t('settings.appearance.trendingPreview')}</CardTitle>
                  <CardDescription>{t('settings.appearance.leaderboardWidgets')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingPreviewItems.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      className="group flex w-full items-center justify-between rounded-lg border border-transparent bg-muted/20 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-muted/30"
                    >
                      <div>
                        <p className="text-sm font-medium transition group-hover:text-primary">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/12 px-3 py-0.5 text-xs font-semibold text-primary">
                        #{index + 1}
                      </Badge>
                    </button>
                  ))}
      </CardContent>
    </Card>

              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{t('settings.appearance.yourAdjustments')}</CardTitle>
                  <CardDescription className="text-xs">
                    {t('settings.appearance.snapshotOfSettings')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Palette className="h-4 w-4 text-primary" />
                    {activeAccent?.label ?? t('settings.appearance.accent')} {t('settings.appearance.accent')}
                  </div>
                  <p>{t('settings.appearance.surfacePaletteLabel')} {activeSurface?.label ?? '—'}</p>
                  <p>{t('settings.appearance.typographyScaleLabel')} {typographyLabel}</p>
                  <p>{t('settings.appearance.densityLabel')} {densityLabel}</p>
                  <p>{t('settings.appearance.motionLabel')} {previewMotionNote}</p>
                </CardContent>
              </Card>
            </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
            </section>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6 mt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('settings.appearance.articleLayout')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.articleLayoutDescription')}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {viewModeOptions(t).map((option) => {
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
                            <div className="space-y-1.5">
                              {[0, 1].map((row) => (
                                <div key={row} className="space-y-0.5">
                                  <span className="block h-1.5 w-full rounded-full bg-muted/70" />
                                  <span className="block h-1.5 w-11/12 rounded-full bg-muted/60" />
                                  <span className="block h-1.5 w-8/12 rounded-full bg-muted/50" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5">
                              {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="h-7 rounded-sm bg-muted/50" />
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
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">{t('settings.appearance.contentDensity.title')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.appearance.contentDensity.description')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDensity(1)}
                  disabled={densityIsDefault}
                  aria-label={t('settings.appearance.contentDensity.resetLabel')}
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
                  aria-label={t('settings.appearance.contentDensity.adjustLabel')}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-15%</span>
                  <span>{t('settings.appearance.contentDensity.baseline')}</span>
                  <span>+15%</span>
                </div>
                <p className="text-xs text-muted-foreground">{densityLabel}</p>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="style" className="space-y-6 mt-6">
            <Card className="border-2 border-dashed border-primary/20 bg-muted/5">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{t('settings.appearance.themeBuilder')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.appearance.themeBuilderDescription')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="gap-2 shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t('settings.appearance.resetToDefault')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
        <section className="space-y-4">
          <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.accentColor')}</Label>
            <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.accentColorDescription')}
            </p>
          </div>
              <div ref={accentDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccentDropdownOpen(!isAccentDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  style={{
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                    <div className="flex items-center gap-3">
                        <span
                      className="block size-6 rounded-full shadow-sm ring-1 ring-border/40 shrink-0"
                      style={{ background: `hsl(${activeAccent?.tone ?? '221.2 83.2% 53.3%'})` }}
                    />
                    <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{activeAccent?.label ?? t('settings.appearance.custom')}</span>
                          <span className="text-xs text-muted-foreground">{t('settings.appearance.clickToChangeAccent')}</span>
                      </div>
                    </div>
                  {isAccentDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform" />
                  )}
                </button>
                {isAccentDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 p-4 border border-border/60 bg-background shadow-lg z-50 max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div className="space-y-6">
                          {getAccentGroups(t).map((group) => {
                        const groupAccents = group.accents
                          .map((value) => accentOptionsByValue[value])
                          .filter((option): option is (typeof accentOptions)[number] => Boolean(option))

                        if (groupAccents.length === 0) return null

                        return (
                          <div key={group.id} className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{group.label}</p>
                              <p className="text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                              {groupAccents.map((option) => (
                                <AppearanceOptionCard
                                  key={option.value}
                                  active={accent === option.value}
                                  leading={
                                    <span
                                      className="block size-7 rounded-full shadow-sm ring-1 ring-border/40"
                                      style={{ background: `hsl(${option.tone})` }}
                                    />
                                  }
                                  label={option.label}
                                  description={option.description}
                                  onSelect={() => {
                                    setAccent(option.value)
                                    setIsAccentDropdownOpen(false)
                                  }}
                                  preview={<div className="h-2 w-full rounded-full" style={{ background: option.gradient }} />}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      {customAccentOption && (
                        <div className="space-y-3 pt-2 border-t border-border/60">
                          <div className="space-y-1">
                                <p className="text-sm font-semibold">{t('settings.appearance.custom')}</p>
                                <p className="text-xs text-muted-foreground">{t('settings.appearance.createYourOwnAccent')}</p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <AppearanceOptionCard
                              key={customAccentOption.value}
                              active={accent === customAccentOption.value}
                              leading={
                                <span
                                  className="block size-7 rounded-full shadow-sm ring-1 ring-border/40"
                                  style={{ background: `hsl(${customAccentOption.tone})` }}
                                />
                              }
                              label={customAccentOption.label}
                              description={customAccentOption.description}
                              onSelect={() => {
                                setAccent('custom')
                                setIsAccentDropdownOpen(false)
                              }}
                              preview={<div className="h-2 w-full rounded-full" style={{ background: customAccentOption.gradient }} />}
                              footer={
                                <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
                                  <div className="flex items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span className="uppercase tracking-wide">{t('settings.appearance.light')}</span>
                                      <input
                                        type="color"
                                        value={customAccent.light}
                                        onChange={(event) => {
                                          setAccent('custom')
                                          setCustomAccentColor('light', event.target.value)
                                        }}
                                        className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                                            aria-label={t('settings.appearance.pickAccentColorLight')}
                                      />
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span className="uppercase tracking-wide">{t('settings.appearance.dark')}</span>
                                      <input
                                        type="color"
                                        value={customAccent.dark}
                                        onChange={(event) => {
                                          setAccent('custom')
                                          setCustomAccentColor('dark', event.target.value)
                                        }}
                                        className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                                            aria-label={t('settings.appearance.pickAccentColorDark')}
                                      />
                                    </label>
                                  </div>
                                </div>
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
              <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.surfacePalette')}</Label>
                <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.surfacePaletteDescription')}
                </p>
              </div>
              <div ref={surfaceDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSurfaceDropdownOpen(!isSurfaceDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  style={{
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="block size-6 rounded-md shadow-sm ring-1 ring-border/40 shrink-0"
                      style={{ backgroundColor: activeSurface ? `hsl(${activeSurface.tone.background})` : 'hsl(var(--background))' }}
                    />
                    <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{activeSurface?.label ?? t('settings.appearance.custom')}</span>
                          <span className="text-xs text-muted-foreground">{t('settings.appearance.clickToChangeSurface')}</span>
                    </div>
                  </div>
                  {isSurfaceDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform" />
                  )}
                </button>
                {isSurfaceDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 p-4 border border-border/60 bg-background shadow-lg z-50 max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div className="space-y-6">
                          {getSurfaceGroups(t).map((group) => {
                        const palettes = group.palettes
                          .map((value) => surfaceOptionsByValue[value])
                          .filter((option): option is (typeof surfaceOptions)[number] => Boolean(option))

                        if (palettes.length === 0) return null

                        return (
                          <div key={group.id} className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{group.label}</p>
                              <p className="text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                              {palettes.map((option) => (
                                <AppearanceOptionCard
                                  key={option.value}
                                  active={surface === option.value}
                                  leading={
                                    <span
                                      className="block size-7 rounded-md shadow-sm ring-1 ring-border/40"
                                      style={{ backgroundColor: `hsl(${option.tone.background})` }}
                                    />
                                  }
                                  label={option.label}
                                  description={option.description}
                                  onSelect={() => {
                                    setSurface(option.value)
                                    setIsSurfaceDropdownOpen(false)
                                  }}
                                  preview={
                                    <div className="grid grid-cols-4 gap-1">
                                      <span className="h-3 rounded-sm" style={{ backgroundColor: `hsl(${option.tone.background})` }} />
                                      <span className="h-3 rounded-sm" style={{ backgroundColor: `hsl(${option.tone.card})` }} />
                                      <span className="h-3 rounded-sm" style={{ backgroundColor: `hsl(${option.tone.muted})` }} />
                                      <span className="h-3 rounded-sm" style={{ backgroundColor: `hsl(${option.tone.secondary})` }} />
                                    </div>
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
                      <Label className="text-sm font-semibold">{t('settings.appearance.interfaceShape')}</Label>
            <p className="text-sm text-muted-foreground">
                        {t('settings.appearance.interfaceShapeDescription')}
            </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRadius(DEFAULT_RADIUS)}
                  disabled={radiusIsDefault}
                      aria-label={t('settings.appearance.resetRadiusToDefault')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
          </div>
          <div className="space-y-3 rounded-lg border border-dashed p-4">
                <div className="flex flex-1 items-center justify-between text-xs text-muted-foreground sm:text-sm">
                      <span>{t('settings.appearance.sharper')}</span>
                      <span>{Math.round(radius * 16)}px {t('settings.appearance.radius')}</span>
                      <span>{t('settings.appearance.softer')}</span>
            </div>
            <Slider
              value={[radius]}
                  min={0}
                  max={2}
              step={0.05}
              onValueChange={(value) => setRadius(value[0] ?? radius)}
                      aria-label={t('settings.appearance.adjustGlobalBorderRadius')}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.typographyScale')}</Label>
            <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.typographyScaleDescription')}
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
                            <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('settings.appearance.sample')}</div>
                            <p className="text-sm font-medium">{t('settings.appearance.typographyAdaptsResponsively')}</p>
                      </div>
                    }
                  />
                ))}
              </div>
            </section>

                <Separator />

            <section className="space-y-4">
              <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.contrastTitle')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.contrastDescription')}
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
                </section>

                <Separator />

                <section className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.depthShadows')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.depthShadowsDescription')}
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
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">{t('settings.appearance.motionTitle')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.appearance.motionDescription')}
                    </p>
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
                    <Label className="text-sm font-semibold">{t('settings.appearance.themeBuilder')}</Label>
                <p className="text-xs text-muted-foreground">
                      {t('settings.appearance.themeBuilderDescription')}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">{t('settings.appearance.createTheme')}</CardTitle>
                    <CardDescription className="text-xs">
                          {t('settings.appearance.createThemeDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex-1 relative">
                          <Input
                            value={themeName}
                            onChange={(event) => setThemeName(event.target.value)}
                                placeholder={t('settings.appearance.myCustomTheme')}
                            maxLength={40}
                            className="sm:flex-1 pr-12"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            {themeName.length}/40
                          </div>
                        </div>
                        <Button onClick={handleCreateTheme} className="sm:w-auto">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('settings.appearance.create')}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-xs">
                          <p className="font-medium text-foreground mb-1">{t('settings.appearance.currentSettings')}:</p>
                      <div className="space-y-1 text-muted-foreground">
                            <p>{t('settings.appearance.accent')}: {activeAccent?.label ?? t('settings.appearance.custom')}</p>
                            <p>{t('settings.appearance.surface')}: {activeSurface?.label ?? t('settings.appearance.custom')}</p>
                            <p>{t('settings.appearance.radius')}: {Math.round(radius * 16)}px</p>
                            <p>{t('settings.appearance.typography')}: {typographyLabel}</p>
                            <p>{t('settings.appearance.contrastTitle')}: {contrastOptions.find(o => o.value === contrast)?.label ?? contrast}</p>
                            <p>{t('settings.appearance.density')}: {densityLabel}</p>
                            <p>{t('settings.appearance.depth')}: {depthOptions.find(o => o.value === depth)?.label ?? depth}</p>
                            <p>{t('settings.appearance.motionTitle')}: {motionOptions.find(o => o.value === motion)?.label ?? motion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">{t('settings.appearance.importExport')}</CardTitle>
                    <CardDescription className="text-xs">
                          {t('settings.appearance.importExportDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowImportDialog(true)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                            {t('settings.appearance.importJson')}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const themeConfig = {
                            accent,
                            surface,
                            radius,
                            typography,
                            contrast,
                            density,
                            depth,
                            motion,
                          }
                          const json = JSON.stringify(themeConfig, null, 2)
                          navigator.clipboard.writeText(json)
                          toast({
                                title: t('settings.appearance.themeExported'),
                                description: t('settings.appearance.themeExportedDescription'),
                          })
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                            {t('settings.appearance.exportJson')}
                      </Button>
                      </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const cssVars = `--radius: ${radius * 16}px;
--accent: ${activeAccent?.tone ?? 'hsl(221.2 83.2% 53.3%)'};
--surface: ${activeSurface?.tone.background ?? 'hsl(0 0% 100%)'};`
                        navigator.clipboard.writeText(cssVars)
                        toast({
                              title: t('settings.appearance.cssCopied'),
                              description: t('settings.appearance.cssCopiedDescription'),
                        })
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                          {t('settings.appearance.copyCssVariables')}
                    </Button>
                  </CardContent>
                </Card>
                    </div>
            </section>
              </CardContent>
            </Card>

            {customThemes.length > 0 && (
              <>
            <Separator />
            <section className="space-y-4">
                <div>
                    <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.yourThemes')}</Label>
                  <p className="text-xs text-muted-foreground">
                      {customThemes.length} {customThemes.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
                  </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {customThemes.map((theme) => {
                      const themeAccent = accentOptionsByValue[theme.accent]
                      const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                      const themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null
                      const themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null
                      const themeSurface = surfaceOptionsByValue[theme.surface]
                      // Собираем все акцентные цвета для отображения
                      const allAccents = [themeAccent, themeSecondaryAccent, themeTertiaryAccent].filter(Boolean) as NonNullable<typeof themeAccent>[]
                      const isActive =
                        accent === theme.accent &&
                        secondaryAccent === themeWithAccents.secondaryAccent &&
                        tertiaryAccent === themeWithAccents.tertiaryAccent &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return (
                        <Card
                          key={theme.id}
                          className={cn(
                            'relative border transition-all hover:border-primary/60 flex flex-col h-full',
                            isActive && 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          )}
                        >
                          <CardHeader className="pb-3 min-h-[3.5rem] shrink-0">
                            <div className="flex items-start justify-between gap-2 h-full">
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <CardTitle className="text-sm font-semibold">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{theme.name}</span>
              </div>
                                </CardTitle>
                              </div>
                              {isActive && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <div className="flex flex-col space-y-3 mt-auto">
                              <div 
                                className="border border-border/60 p-4 aspect-video relative overflow-hidden"
                                style={{ 
                                  borderRadius: `min(${theme.radius * 16}px, 24px)`,
                                  backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))'
                                }}
                              >
                                <div 
                                  className="absolute inset-0 opacity-5"
                                  style={{
                                    background: allAccents.length > 0
                                      ? allAccents.length > 1
                                        ? `linear-gradient(135deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')}, transparent 100%)`
                                        : `linear-gradient(135deg, hsl(${allAccents[0].tone}) 0%, transparent 100%)`
                                      : 'transparent'
                                  }}
                                />
                                
                                <div className="relative z-10 h-full flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {/* Показываем все акцентные цвета */}
                                      <div className="flex items-center gap-0.5">
                                        {allAccents.map((acc, index) => (
                                          <div
                                            key={index}
                                            className={`rounded-full shrink-0 border-2 border-background ${index === 0 ? 'size-6' : index === 1 ? 'size-4' : 'size-3'}`}
                                            style={{
                                              backgroundColor: `hsl(${acc.tone})`,
                                              marginLeft: index > 0 ? '-8px' : '0',
                                              zIndex: allAccents.length - index,
                                            }}
                                          />
                                        ))}
                                      </div>
                                      <div className="flex flex-col gap-0.5 min-w-0">
                                        <div 
                                          className="text-xs font-semibold truncate"
                                          style={{
                                            color: themeSurface 
                                              ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})`
                                              : 'hsl(var(--foreground))'
                                          }}
                                        >
                                          Theme Preview
                                        </div>
                                        <div 
                                          className="text-[10px] truncate opacity-70"
                                          style={{
                                            color: themeSurface 
                                              ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})`
                                              : 'hsl(var(--muted-foreground))'
                                          }}
                                        >
                                          {allAccents.map((acc) => acc.label).join(' + ') || theme.accent}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className="size-1.5 rounded-full shrink-0"
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div 
                                    className="flex-1 p-2.5 border"
                                    style={{
                                      backgroundColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.card})`
                                        : 'hsl(var(--card))',
                                      borderColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.border || '220 13% 91%'})`
                                        : 'hsl(var(--border))',
                                      borderRadius: `min(${theme.radius * 8}px, 8px)`,
                                    }}
                                  >
                                    <div className="flex flex-col gap-1.5 h-full">
                                      <div className="flex items-center gap-1.5">
                                        <div 
                                          className="h-1.5 rounded-sm flex-1"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : `hsl(${allAccents[0]?.tone})`,
                                            opacity: 0.3,
                                          }}
                                        />
                                        <div 
                                          className="h-1.5 w-4 rounded-sm"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : `hsl(${allAccents[0]?.tone})`,
                                            opacity: 0.5,
                                          }}
                                        />
                                      </div>
                                      <div className="flex gap-1.5 flex-1">
                                        <div 
                                          className="flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.muted})`
                                              : 'hsl(var(--muted))',
                                            opacity: 0.4,
                                          }}
                                        />
                                        <div className="flex flex-col gap-0.5 w-3">
                                          {allAccents.map((acc, index) => (
                                            <div
                                              key={index}
                                              className="h-1.5 rounded-sm flex-1"
                                              style={{
                                                backgroundColor: `hsl(${acc.tone})`,
                                                opacity: 0.2,
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        {allAccents.map((acc, index) => (
                                          <div
                                            key={index}
                                            className="h-1.5 flex-1 rounded-full"
                                            style={{
                                              backgroundColor: `hsl(${acc.tone})`,
                                              opacity: 0.6,
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 justify-between">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3].map((i) => (
                                        <div
                                          key={i}
                                          className="size-1.5 rounded-full"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.secondary || themeSurface.tone.muted})`
                                              : 'hsl(var(--secondary))',
                                            opacity: 0.3 + (i * 0.1),
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className="h-2 flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                            opacity: 0.4,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                               <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                 <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                   {Math.round(theme.radius * 16)}px
                                 </Badge>
                                 <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                   {TYPOGRAPHY_SCALES[theme.typography]?.label ?? theme.typography}
                                 </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {contrastOptions.find(o => o.value === theme.contrast)?.label ?? theme.contrast}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {depthOptions.find(o => o.value === theme.depth)?.label ?? theme.depth}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {motionOptions.find(o => o.value === theme.motion)?.label ?? theme.motion}
                                  </Badge>
                               </div>
                               <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                                 <Button
                                   variant={isActive ? 'default' : 'outline'}
                                   size="sm"
                                   className="flex-1"
                                   onClick={() => handleApplyTheme(theme)}
                                 >
                                   {isActive ? (
                                     <>
                                       <Check className="mr-2 h-3 w-3" />
                                       Active
                                     </>
                                   ) : (
                                     <>
                                       <Download className="mr-2 h-3 w-3" />
                                       Apply
                                     </>
                                   )}
                                 </Button>
                                 {!theme.official && (
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-8 w-8"
                                     onClick={() => handleDeleteTheme(theme.id)}
                                   >
                                     <Trash2 className="h-3 w-3" />
                                   </Button>
                                 )}
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       )
                     })}
                   </div>
                 </section>
                </>
              )}
          </TabsContent>

          <TabsContent value="themes" className="space-y-6 mt-6">
            <section className="space-y-6">
              {/* Basic Themes */}
              {officialThemesGroups.basic.length > 0 && (
                <div className="space-y-4">
                  <button
                    onClick={() => toggleGroup('basic')}
                    className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                  <div>
                    <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.basic')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {officialThemesGroups.basic.length} {officialThemesGroups.basic.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
                    </p>
                  </div>
                    {collapsedGroups['basic'] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {!collapsedGroups['basic'] && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {officialThemesGroups.basic.map((theme) => {
                  const themeAccent = accentOptionsByValue[theme.accent]
                  const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                  const themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null
                  const themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null
                  const themeSurface = surfaceOptionsByValue[theme.surface]
                  // Собираем все акцентные цвета для отображения
                  const allAccents = [themeAccent, themeSecondaryAccent, themeTertiaryAccent].filter(Boolean) as NonNullable<typeof themeAccent>[]
                  const isActive =
                    accent === theme.accent &&
                    secondaryAccent === themeWithAccents.secondaryAccent &&
                    tertiaryAccent === themeWithAccents.tertiaryAccent &&
                    surface === theme.surface &&
                    Math.abs(radius - theme.radius) < 0.01 &&
                    typography === theme.typography &&
                    contrast === theme.contrast &&
                    depth === theme.depth &&
                    motion === theme.motion

                  return (
                    <Card
                      key={theme.id}
                      className={cn(
                        'relative border transition-all hover:border-primary/60 flex flex-col h-full group',
                        isActive && 'border-primary bg-primary/5 ring-1 ring-primary/40'
                      )}
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        willChange: 'transform',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => handleCardMouseEnter(theme.id, e)}
                      onMouseMove={(e) => handleCardMouseMove(theme.id, e)}
                      onMouseLeave={(e) => handleCardMouseLeave(theme.id, e)}
                    >
                      <CardHeader className="pb-3 min-h-[3.5rem] shrink-0">
                        <div className="flex items-start justify-between gap-2 h-full">
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <CardTitle className="text-sm font-semibold">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{theme.name}</span>
                                {theme.official && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap">
                                    {t('settings.appearance.official')}
                                  </Badge>
                        )}
                      </div>
                            </CardTitle>
                        </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                          {isActive && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex flex-col space-y-3 mt-auto">
                        <div 
                          className="border border-border/60 p-4 aspect-video relative overflow-hidden transition-transform duration-300"
                          style={{ 
                            borderRadius: `min(${theme.radius * 16}px, 24px)`,
                            backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))',
                            transform: 'translateZ(20px)',
                          }}
                        >
                          {/* Background gradient overlay */}
                          <div 
                            className="absolute inset-0 opacity-5"
                            style={{
                              background: allAccents.length > 0
                                ? allAccents.length > 1
                                  ? `linear-gradient(135deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')}, transparent 100%)`
                                  : `linear-gradient(135deg, hsl(${allAccents[0].tone}) 0%, transparent 100%)`
                                : 'transparent'
                            }}
                          />
                          
                          <div className="relative z-10 h-full flex flex-col gap-2.5">
                            {/* Header section */}
                            <div className="flex items-center gap-2">
                              {/* Показываем все акцентные цвета */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                {allAccents.map((acc, index) => (
                                  <div
                                    key={index}
                                    className={`rounded-full shrink-0 border-2 border-background ${index === 0 ? 'size-6' : index === 1 ? 'size-4' : 'size-3'}`}
                                    style={{
                                      backgroundColor: `hsl(${acc.tone})`,
                                      marginLeft: index > 0 ? '-8px' : '0',
                                      zIndex: allAccents.length - index,
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div 
                                    className="text-xs font-semibold truncate"
                                    style={{
                                      color: themeSurface 
                                        ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})`
                                        : 'hsl(var(--foreground))'
                                    }}
                                  >
                                    Theme Preview
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    {allAccents.map((acc, index) => (
                                      <div
                                        key={index}
                                        className="size-1.5 rounded-full shrink-0"
                                        style={{
                                          backgroundColor: `hsl(${acc.tone})`,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div 
                                  className="text-[10px] truncate opacity-70"
                                  style={{
                                    color: themeSurface 
                                      ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})`
                                      : 'hsl(var(--muted-foreground))'
                                  }}
                                >
                                  {allAccents.map((acc) => acc.label).join(' + ') || theme.accent}
                                </div>
                              </div>
                            </div>

                            {/* Card preview */}
                            <div 
                              className="flex-1 p-2.5 border"
                              style={{
                                backgroundColor: themeSurface 
                                  ? `hsl(${themeSurface.tone.card})`
                                  : 'hsl(var(--card))',
                                borderColor: themeSurface 
                                  ? `hsl(${themeSurface.tone.border || '220 13% 91%'})`
                                  : 'hsl(var(--border))',
                                borderRadius: `min(${theme.radius * 8}px, 8px)`,
                              }}
                            >
                              <div className="flex flex-col gap-1.5 h-full">
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="h-1.5 rounded-sm flex-1"
                                    style={{
                                      background: allAccents.length > 1
                                        ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                        : `hsl(${allAccents[0]?.tone})`,
                                      opacity: 0.3,
                                    }}
                                  />
                                  <div 
                                    className="h-1.5 w-4 rounded-sm"
                                    style={{
                                      background: allAccents.length > 1
                                        ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                        : `hsl(${allAccents[0]?.tone})`,
                                      opacity: 0.5,
                                    }}
                                  />
                                </div>
                                <div className="flex gap-1.5 flex-1">
                                  <div 
                                    className="flex-1 rounded-sm"
                                    style={{
                                      backgroundColor: themeSurface
                                        ? `hsl(${themeSurface.tone.muted})`
                                        : 'hsl(var(--muted))',
                                      opacity: 0.4,
                                    }}
                                  />
                                  <div className="flex flex-col gap-0.5 w-3">
                                    {allAccents.map((acc, index) => (
                                      <div
                                        key={index}
                                        className="h-1.5 rounded-sm flex-1"
                                        style={{
                                          backgroundColor: `hsl(${acc.tone})`,
                                          opacity: 0.2,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {allAccents.map((acc, index) => (
                                    <div
                                      key={index}
                                      className="h-1.5 flex-1 rounded-full"
                                      style={{
                                        backgroundColor: `hsl(${acc.tone})`,
                                        opacity: 0.6,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Bottom accent indicators */}
                            <div className="flex items-center gap-1.5 justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="size-1.5 rounded-full"
                                    style={{
                                      backgroundColor: themeSurface
                                        ? `hsl(${themeSurface.tone.secondary || themeSurface.tone.muted})`
                                        : 'hsl(var(--secondary))',
                                      opacity: 0.3 + (i * 0.1),
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-0.5">
                                {allAccents.map((acc, index) => (
                                  <div
                                    key={index}
                                    className="h-2 flex-1 rounded-sm"
                                    style={{
                                      backgroundColor: `hsl(${acc.tone})`,
                                      opacity: 0.4,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {Math.round(theme.radius * 16)}px
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {TYPOGRAPHY_SCALES[theme.typography]?.label ?? theme.typography}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {contrastOptions.find(o => o.value === theme.contrast)?.label ?? theme.contrast}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {depthOptions.find(o => o.value === theme.depth)?.label ?? theme.depth}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {motionOptions.find(o => o.value === theme.motion)?.label ?? theme.motion}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                          {theme.description && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleShowDescription(undefined, { name: theme.name, description: theme.description })}
                            >
                              <Info className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleApplyTheme(theme)}
                          >
                            {isActive ? (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                {t('settings.appearance.active')}
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-3 w-3" />
                                {t('settings.appearance.apply')}
                              </>
                            )}
                          </Button>
                          {!theme.official && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteTheme(theme.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                      )}
                    </div>
                  </div>
                      </CardContent>
                    </Card>
              )
            })}
          </div>
                  )}
                </div>
              )}

              {/* Games Themes */}
              {officialThemesGroups.games.length > 0 && (
                <div className="space-y-4">
                  <button
                    onClick={() => toggleGroup('games')}
                    className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                  <div>
                      <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.games')}</Label>
                <p className="text-xs text-muted-foreground">
                        {officialThemesGroups.games.length} {officialThemesGroups.games.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
              </p>
            </div>
                    {collapsedGroups['games'] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {!collapsedGroups['games'] && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {officialThemesGroups.games.map((theme) => {
                      const themeAccent = accentOptionsByValue[theme.accent]
                      const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                      const themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null
                      const themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null
                      const themeSurface = surfaceOptionsByValue[theme.surface]
                      // Собираем все акцентные цвета для отображения
                      const allAccents = [themeAccent, themeSecondaryAccent, themeTertiaryAccent].filter(Boolean) as NonNullable<typeof themeAccent>[]
                      const isActive =
                        accent === theme.accent &&
                        secondaryAccent === themeWithAccents.secondaryAccent &&
                        tertiaryAccent === themeWithAccents.tertiaryAccent &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return (
                        <Card
                          key={theme.id}
                          className={cn(
                              'relative border transition-all hover:border-primary/60 flex flex-col h-full group',
                            isActive && 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          )}
                            style={{
                              transformStyle: 'preserve-3d',
                              perspective: '1000px',
                              willChange: 'transform',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => handleCardMouseEnter(theme.id, e)}
                            onMouseMove={(e) => handleCardMouseMove(theme.id, e)}
                            onMouseLeave={(e) => handleCardMouseLeave(theme.id, e)}
                    >
                      <CardHeader className="pb-3 min-h-[3.5rem] shrink-0">
                        <div className="flex items-start justify-between gap-2 h-full">
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <CardTitle className="text-sm font-semibold">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{theme.name}</span>
                                {theme.official && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap">
                                    Official
                                  </Badge>
                        )}
                      </div>
                            </CardTitle>
                        </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                              {isActive && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                              </div>
                            </div>
                </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <div className="flex flex-col space-y-3 mt-auto">
                              <div 
                                  className="border border-border/60 p-4 aspect-video relative overflow-hidden transition-transform duration-300"
                                style={{ 
                                  borderRadius: `min(${theme.radius * 16}px, 24px)`,
                                    backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))',
                                    transform: 'translateZ(20px)',
                                }}
                              >
                                {/* Background gradient overlay */}
                                <div 
                                  className="absolute inset-0 opacity-5"
                                  style={{
                                    background: allAccents.length > 0
                                      ? allAccents.length > 1
                                        ? `linear-gradient(135deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')}, transparent 100%)`
                                        : `linear-gradient(135deg, hsl(${allAccents[0].tone}) 0%, transparent 100%)`
                                      : 'transparent'
                                  }}
                                />
                                
                                <div className="relative z-10 h-full flex flex-col gap-2.5">
                                  {/* Header section */}
                                  <div className="flex items-center gap-2">
                                    {/* Показываем все акцентные цвета */}
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className={`rounded-full shrink-0 border-2 border-background ${index === 0 ? 'size-6' : index === 1 ? 'size-4' : 'size-3'}`}
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                            marginLeft: index > 0 ? '-8px' : '0',
                                            zIndex: allAccents.length - index,
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <div 
                                          className="text-xs font-semibold truncate"
                                          style={{
                                            color: themeSurface 
                                              ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})`
                                              : 'hsl(var(--foreground))'
                                          }}
                                        >
                                          Theme Preview
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          {allAccents.map((acc, index) => (
                                            <div
                                              key={index}
                                              className="size-1.5 rounded-full shrink-0"
                                              style={{
                                                backgroundColor: `hsl(${acc.tone})`,
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div 
                                        className="text-[10px] truncate opacity-70"
                                        style={{
                                          color: themeSurface 
                                            ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})`
                                            : 'hsl(var(--muted-foreground))'
                                        }}
                                      >
                                        {allAccents.map((acc) => acc.label).join(' + ') || theme.accent}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card preview */}
                                  <div 
                                    className="flex-1 p-2.5 border"
                                    style={{
                                      backgroundColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.card})`
                                        : 'hsl(var(--card))',
                                      borderColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.border || '220 13% 91%'})`
                                        : 'hsl(var(--border))',
                                      borderRadius: `min(${theme.radius * 8}px, 8px)`,
                                    }}
                                  >
                                    <div className="flex flex-col gap-1.5 h-full">
                                      <div className="flex items-center gap-1.5">
                                        <div 
                                          className="h-1.5 rounded-sm flex-1"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : `hsl(${allAccents[0]?.tone})`,
                                            opacity: 0.3,
                                          }}
                                        />
                                        <div 
                                          className="h-1.5 w-4 rounded-sm"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : `hsl(${allAccents[0]?.tone})`,
                                            opacity: 0.5,
                                          }}
                                        />
                                      </div>
                                      <div className="flex gap-1.5 flex-1">
                                        <div 
                                          className="flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.muted})`
                                              : 'hsl(var(--muted))',
                                            opacity: 0.4,
                                          }}
                                        />
                                        <div className="flex flex-col gap-0.5 w-3">
                                          {allAccents.map((acc, index) => (
                                            <div
                                              key={index}
                                              className="h-1.5 rounded-sm flex-1"
                                              style={{
                                                backgroundColor: `hsl(${acc.tone})`,
                                                opacity: 0.2,
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        {allAccents.map((acc, index) => (
                                          <div
                                            key={index}
                                            className="h-1.5 flex-1 rounded-full"
                                            style={{
                                              backgroundColor: `hsl(${acc.tone})`,
                                              opacity: 0.6,
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom accent indicators */}
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3].map((i) => (
                                        <div
                                          key={i}
                                          className="size-1.5 rounded-full"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.secondary || themeSurface.tone.muted})`
                                              : 'hsl(var(--secondary))',
                                            opacity: 0.3 + (i * 0.1),
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className="h-2 flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                            opacity: 0.4,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {Math.round(theme.radius * 16)}px
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {TYPOGRAPHY_SCALES[theme.typography]?.label ?? theme.typography}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {contrastOptions.find(o => o.value === theme.contrast)?.label ?? theme.contrast}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {depthOptions.find(o => o.value === theme.depth)?.label ?? theme.depth}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {motionOptions.find(o => o.value === theme.motion)?.label ?? theme.motion}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                                {theme.description && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleShowDescription(undefined, { name: theme.name, description: theme.description })}
                                  >
                                    <Info className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant={isActive ? 'default' : 'outline'}
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleApplyTheme(theme)}
                                >
                                  {isActive ? (
                                    <>
                                      <Check className="mr-2 h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-3 w-3" />
                                      Apply
                                    </>
                                  )}
                                </Button>
                                {!theme.official && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteTheme(theme.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  )}
                </div>
              )}

              {/* Extraordinary Themes */}
              {officialThemesGroups.extraordinary.length > 0 && (
                <div className="space-y-4">
                  <button
                    onClick={() => toggleGroup('extraordinary')}
                    className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                        >
                          <div>
                      <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.extraordinary')}</Label>
                            <p className="text-xs text-muted-foreground">
                        {officialThemesGroups.extraordinary.length} {officialThemesGroups.extraordinary.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
                            </p>
                          </div>
                    {collapsedGroups['extraordinary'] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {!collapsedGroups['extraordinary'] && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {officialThemesGroups.extraordinary.map((theme) => {
                      const themeAccent = accentOptionsByValue[theme.accent]
                      const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                      const themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null
                      const themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null
                      const themeSurface = surfaceOptionsByValue[theme.surface]
                      // Собираем все акцентные цвета для отображения
                      const allAccents = [themeAccent, themeSecondaryAccent, themeTertiaryAccent].filter(Boolean) as NonNullable<typeof themeAccent>[]
                      const isActive =
                        accent === theme.accent &&
                        secondaryAccent === themeWithAccents.secondaryAccent &&
                        tertiaryAccent === themeWithAccents.tertiaryAccent &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return (
                        <Card
                          key={theme.id}
                          className={cn(
                              'relative border transition-all hover:border-primary/60 flex flex-col h-full group',
                            isActive && 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          )}
                            style={{
                              transformStyle: 'preserve-3d',
                              perspective: '1000px',
                              willChange: 'transform',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => handleCardMouseEnter(theme.id, e)}
                            onMouseMove={(e) => handleCardMouseMove(theme.id, e)}
                            onMouseLeave={(e) => handleCardMouseLeave(theme.id, e)}
                        >
                          <CardHeader className="pb-3 min-h-[3.5rem] shrink-0">
                            <div className="flex items-start justify-between gap-2 h-full">
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <CardTitle className="text-sm font-semibold">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{theme.name}</span>
                                    {theme.official && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap">
                                        Official
                                      </Badge>
                                    )}
                                  </div>
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                              {isActive && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <div className="flex flex-col space-y-3 mt-auto">
                              <div 
                                className="border border-border/60 p-4 aspect-video relative overflow-hidden transition-transform duration-300"
                                style={{ 
                                  borderRadius: `min(${theme.radius * 16}px, 24px)`,
                                  backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))',
                                  transform: 'translateZ(20px)',
                                }}
                              >
                                {/* Background gradient overlay */}
                                <div 
                                  className="absolute inset-0 opacity-5"
                                  style={{
                                    background: allAccents.length > 0
                                      ? allAccents.length > 1
                                        ? `linear-gradient(135deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')}, transparent 100%)`
                                        : `linear-gradient(135deg, hsl(${allAccents[0].tone}) 0%, transparent 100%)`
                                      : 'transparent'
                                  }}
                                />
                                
                                <div className="relative z-10 h-full flex flex-col gap-2.5">
                                  {/* Header section */}
                                  <div className="flex items-center gap-2">
                                    {/* Показываем все акцентные цвета */}
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className={`rounded-full shrink-0 border-2 border-background ${index === 0 ? 'size-6' : index === 1 ? 'size-4' : 'size-3'}`}
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                            marginLeft: index > 0 ? '-8px' : '0',
                                            zIndex: allAccents.length - index,
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <div 
                                          className="text-xs font-semibold truncate"
                                          style={{
                                            color: themeSurface 
                                              ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})`
                                              : 'hsl(var(--foreground))'
                                          }}
                                        >
                                          Theme Preview
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          {allAccents.map((acc, index) => (
                                            <div
                                              key={index}
                                              className="size-1.5 rounded-full shrink-0"
                                              style={{
                                                backgroundColor: `hsl(${acc.tone})`,
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div 
                                        className="text-[10px] truncate opacity-70"
                                        style={{
                                          color: themeSurface 
                                            ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})`
                                            : 'hsl(var(--muted-foreground))'
                                        }}
                                      >
                                        {allAccents.map((acc) => acc.label).join(' + ') || theme.accent}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card preview */}
                                  <div 
                                    className="flex-1 p-2.5 border"
                                    style={{
                                      backgroundColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.card})`
                                        : 'hsl(var(--card))',
                                      borderColor: themeSurface 
                                        ? `hsl(${themeSurface.tone.border || '220 13% 91%'})`
                                        : 'hsl(var(--border))',
                                      borderRadius: `min(${theme.radius * 8}px, 8px)`,
                                    }}
                                  >
                                    <div className="flex flex-col gap-1.5 h-full">
                                      <div className="flex items-center gap-1.5">
                                        <div 
                                          className="h-1.5 rounded-sm flex-1"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : allAccents.length > 0
                                              ? `hsl(${allAccents[0].tone})`
                                              : 'hsl(var(--primary))',
                                            opacity: 0.3,
                                          }}
                                        />
                                        <div 
                                          className="h-1.5 w-4 rounded-sm"
                                          style={{
                                            background: allAccents.length > 1
                                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                              : allAccents.length > 0
                                              ? `hsl(${allAccents[0].tone})`
                                              : 'hsl(var(--primary))',
                                            opacity: 0.5,
                                          }}
                                        />
                                      </div>
                                      <div className="flex gap-1.5 flex-1">
                                        <div 
                                          className="flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.muted})`
                                              : 'hsl(var(--muted))',
                                            opacity: 0.4,
                                          }}
                                        />
                                        <div className="flex flex-col gap-0.5 w-3">
                                          {allAccents.map((acc, index) => (
                                            <div
                                              key={index}
                                              className="h-1.5 rounded-sm flex-1"
                                              style={{
                                                backgroundColor: `hsl(${acc.tone})`,
                                                opacity: 0.2 + (index * 0.1),
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div 
                                        className="h-1.5 rounded-full"
                                        style={{
                                          background: allAccents.length > 1
                                            ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                                            : allAccents.length > 0
                                            ? `hsl(${allAccents[0].tone})`
                                            : 'hsl(var(--primary))',
                                          opacity: 0.6,
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Bottom accent indicators */}
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3].map((i) => (
                                        <div
                                          key={i}
                                          className="size-1.5 rounded-full"
                                          style={{
                                            backgroundColor: themeSurface
                                              ? `hsl(${themeSurface.tone.secondary || themeSurface.tone.muted})`
                                              : 'hsl(var(--secondary))',
                                            opacity: 0.3 + (i * 0.1),
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      {allAccents.map((acc, index) => (
                                        <div
                                          key={index}
                                          className="h-2 flex-1 rounded-sm"
                                          style={{
                                            backgroundColor: `hsl(${acc.tone})`,
                                            opacity: 0.4,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {Math.round(theme.radius * 16)}px
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {TYPOGRAPHY_SCALES[theme.typography]?.label ?? theme.typography}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {contrastOptions.find(o => o.value === theme.contrast)?.label ?? theme.contrast}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {depthOptions.find(o => o.value === theme.depth)?.label ?? theme.depth}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {motionOptions.find(o => o.value === theme.motion)?.label ?? theme.motion}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                                {theme.description && (
                            <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleShowDescription(undefined, { name: theme.name, description: theme.description })}
                                  >
                                    <Info className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant={isActive ? 'default' : 'outline'}
                              size="sm"
                                  className="flex-1"
                                  onClick={() => handleApplyTheme(theme)}
                                >
                                  {isActive ? (
                                    <>
                                      <Check className="mr-2 h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-3 w-3" />
                              Apply
                                    </>
                                  )}
                </Button>
                                {!theme.official && (
                            <Button
                              variant="ghost"
                              size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteTheme(theme.id)}
                            >
                                    <Trash2 className="h-3 w-3" />
                </Button>
                                )}
              </div>
            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
            </div>
                  )}
                </div>
              )}

              {/* Your Themes */}
              {customThemes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.yourThemes')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {customThemes.length} {customThemes.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
              </p>
            </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {customThemes.map((theme) => {
                      const themeAccent = accentOptionsByValue[theme.accent]
                      const themeSurface = surfaceOptionsByValue[theme.surface]
                      const isActive =
                        accent === theme.accent &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return (
                        <Card
                          key={theme.id}
                          className={cn(
                            'relative border transition-all hover:border-primary/60 flex flex-col h-full',
                            isActive && 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          )}
                        >
                          <CardHeader className="pb-3 min-h-[3.5rem] shrink-0">
                            <div className="flex items-start justify-between gap-2 h-full">
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <CardTitle className="text-sm font-semibold">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{theme.name}</span>
                                  </div>
                                </CardTitle>
                              </div>
                          {isActive && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex flex-col space-y-3 mt-auto">
                        <div 
                          className="border border-border/60 p-4 aspect-video relative overflow-hidden"
                          style={{ 
                            borderRadius: `min(${theme.radius * 16}px, 24px)`,
                            backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))'
                          }}
                        >
                          {/* Background gradient overlay */}
                          <div 
                            className="absolute inset-0 opacity-5"
                            style={{
                              background: themeAccent 
                                ? `linear-gradient(135deg, hsl(${themeAccent.tone}) 0%, transparent 100%)`
                                : 'transparent'
                            }}
                          />
                          
                          <div className="relative z-10 h-full flex flex-col gap-2.5">
                            {/* Header section */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="size-6 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: themeAccent
                                      ? `hsl(${themeAccent.tone})`
                                      : 'hsl(var(--primary))',
                                  }}
                                />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div 
                                    className="text-xs font-semibold truncate"
                                    style={{
                                      color: themeSurface 
                                        ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})`
                                        : 'hsl(var(--foreground))'
                                    }}
                                  >
                                    Theme Preview
                                  </div>
                                  <div 
                                    className="text-[10px] truncate opacity-70"
                                    style={{
                                      color: themeSurface 
                                        ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})`
                                        : 'hsl(var(--muted-foreground))'
                                    }}
                                  >
                                    {themeAccent?.label ?? theme.accent}
                                  </div>
                                </div>
                              </div>
                              <div 
                                className="size-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: themeAccent
                                    ? `hsl(${themeAccent.tone})`
                                    : 'hsl(var(--primary))',
                                }}
                              />
                            </div>

                            {/* Card preview */}
                            <div 
                              className="flex-1 p-2.5 border"
                              style={{
                                backgroundColor: themeSurface 
                                  ? `hsl(${themeSurface.tone.card})`
                                  : 'hsl(var(--card))',
                                borderColor: themeSurface 
                                  ? `hsl(${themeSurface.tone.border || '220 13% 91%'})`
                                  : 'hsl(var(--border))',
                                borderRadius: `min(${theme.radius * 8}px, 8px)`,
                              }}
                            >
                              <div className="flex flex-col gap-1.5 h-full">
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="h-1.5 rounded-sm flex-1"
                                    style={{
                                      backgroundColor: themeAccent
                                        ? `hsl(${themeAccent.tone})`
                                        : 'hsl(var(--primary))',
                                      opacity: 0.3,
                                    }}
                                  />
                                  <div 
                                    className="h-1.5 w-4 rounded-sm"
                                    style={{
                                      backgroundColor: themeAccent
                                        ? `hsl(${themeAccent.tone})`
                                        : 'hsl(var(--primary))',
                                      opacity: 0.5,
                                    }}
                                  />
                                </div>
                                <div className="flex gap-1.5 flex-1">
                                  <div 
                                    className="flex-1 rounded-sm"
                                    style={{
                                      backgroundColor: themeSurface
                                        ? `hsl(${themeSurface.tone.muted})`
                                        : 'hsl(var(--muted))',
                                      opacity: 0.4,
                                    }}
                                  />
                                  <div 
                                    className="w-3 rounded-sm"
                                    style={{
                                      backgroundColor: themeAccent
                                        ? `hsl(${themeAccent.tone})`
                                        : 'hsl(var(--primary))',
                                      opacity: 0.2,
                                    }}
                                  />
                                </div>
                                <div 
                                  className="h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: themeAccent
                                      ? `hsl(${themeAccent.tone})`
                                      : 'hsl(var(--primary))',
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Bottom accent indicators */}
                            <div className="flex items-center gap-1.5 justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="size-1.5 rounded-full"
                                    style={{
                                      backgroundColor: themeSurface
                                        ? `hsl(${themeSurface.tone.secondary || themeSurface.tone.muted})`
                                        : 'hsl(var(--secondary))',
                                      opacity: 0.3 + (i * 0.1),
                                    }}
                                  />
                                ))}
                              </div>
                              <div 
                                className="h-2 w-8 rounded-sm"
                                style={{
                                  backgroundColor: themeAccent
                                    ? `hsl(${themeAccent.tone})`
                                    : 'hsl(var(--primary))',
                                  opacity: 0.4,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {Math.round(theme.radius * 16)}px
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {TYPOGRAPHY_SCALES[theme.typography]?.label ?? theme.typography}
                          </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {contrastOptions.find(o => o.value === theme.contrast)?.label ?? theme.contrast}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {depthOptions.find(o => o.value === theme.depth)?.label ?? theme.depth}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {motionOptions.find(o => o.value === theme.motion)?.label ?? theme.motion}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                          <Button
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleApplyTheme(theme)}
                          >
                            {isActive ? (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-3 w-3" />
                                Apply
                              </>
                            )}
                          </Button>
                          {!theme.official && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteTheme(theme.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                      )}
                    </div>
                  </div>
                      </CardContent>
                    </Card>
              )
            })}
          </div>
            </div>
              )}
        </section>

          </TabsContent>
        </Tabs>

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('settings.appearance.importTheme')}</DialogTitle>
              <DialogDescription>
                {t('settings.appearance.importThemeDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={importValue}
                onChange={(event) => setImportValue(event.target.value)}
                placeholder='{\n  "accent": "indigo",\n  "surface": "daylight",\n  "radius": 0.5,\n  "typography": "default",\n  "contrast": "standard",\n  "density": 1,\n  "depth": "soft",\n  "motion": "default"\n}'
                className="min-h-[200px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => {
                setImportValue('')
                setShowImportDialog(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleImportTheme}>
                <Download className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={themeDescriptionDialog.open} onOpenChange={(open) => setThemeDescriptionDialog({ open, theme: open ? themeDescriptionDialog.theme : null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{themeDescriptionDialog.theme?.name || t('settings.appearance.themeDescription')}</DialogTitle>
              <DialogDescription>
                {themeDescriptionDialog.theme?.description || t('settings.appearance.noDescriptionAvailable')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setThemeDescriptionDialog({ open: false, theme: null })}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  const { t } = useTranslation()
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
      title: t('settings.privacy.preferencesSaved'),
      description: t('settings.privacy.preferencesSavedDescription'),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.privacy.title')}</CardTitle>
        <CardDescription>
          {t('settings.privacy.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <ToggleRow
            label={t('settings.privacy.publicProfile')}
            description={t('settings.privacy.publicProfileDescription')}
            icon={Shield}
            value={privacy.profilePublic}
            onChange={handleToggle('profilePublic')}
          />
          <ToggleRow
            label={t('settings.privacy.showContactEmail')}
            description={t('settings.privacy.showContactEmailDescription')}
            icon={Mail}
            value={privacy.showEmail}
            onChange={handleToggle('showEmail')}
          />
          <ToggleRow
            label={t('settings.privacy.showLastSeen')}
            description={t('settings.privacy.showLastSeenDescription')}
            icon={CalendarClock}
            value={privacy.showLastSeen}
            onChange={handleToggle('showLastSeen')}
          />
          <ToggleRow
            label={t('settings.privacy.allowDirectMessages')}
            description={t('settings.privacy.allowDirectMessagesDescription')}
            icon={MessageCircle}
            value={privacy.allowMessages}
            onChange={handleToggle('allowMessages')}
          />
          <ToggleRow
            label={t('settings.privacy.allowSearchIndexing')}
            description={t('settings.privacy.allowSearchIndexingDescription')}
            icon={Search}
            value={privacy.allowSearch}
            onChange={handleToggle('allowSearch')}
            meta={
              privacy.allowSearch ? (
                <Badge variant="secondary" className="mt-1 w-fit">
                  {t('settings.privacy.recommended')}
                </Badge>
              ) : undefined
            }
          />
          <ToggleRow
            label={t('settings.privacy.showReadingActivity')}
            description={t('settings.privacy.showReadingActivityDescription')}
            icon={Eye}
            value={privacy.shareActivity}
            onChange={handleToggle('shareActivity')}
          />
          <ToggleRow
            label={t('settings.privacy.twoFactorAuthentication')}
            description={t('settings.privacy.twoFactorAuthenticationDescription')}
            icon={ShieldCheck}
            value={privacy.enableTwoFactor}
            onChange={handleToggle('enableTwoFactor')}
            meta={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t('settings.privacy.comingSoon')}
              </span>
            }
          />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">{t('settings.privacy.dataExportTitle')}</p>
              <p>
                {t('settings.privacy.dataExportDescription')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit gap-2"
                onClick={() =>
                  toast({
                    title: t('settings.privacy.requestSubmitted'),
                    description: t('settings.privacy.requestSubmittedDescription'),
                  })
                }
              >
                <Download className="h-4 w-4" />
                {t('settings.privacy.requestExport')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleReset} disabled={!hasChanges || saving}>
            {t('common.reset')}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('settings.profile.saving')}
              </>
            ) : (
              t('settings.privacy.saveSettings')
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
  const { t } = useTranslation()
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
      title: t('settings.notifications.preferencesSaved'),
      description: t('settings.notifications.preferencesSavedDescription'),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.notifications.title')}</CardTitle>
        <CardDescription>
          {t('settings.notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('settings.notifications.emailUpdates')}
          </h3>
          <ToggleRow
            label={t('settings.notifications.mentionsReplies')}
            description={t('settings.notifications.mentionsRepliesDescription')}
            icon={Mail}
            value={preferences.emailMentions}
            onChange={handleToggle('emailMentions')}
          />
          <ToggleRow
            label={t('settings.notifications.newFollowers')}
            description={t('settings.notifications.newFollowersDescription')}
            icon={BellRing}
            value={preferences.emailFollows}
            onChange={handleToggle('emailFollows')}
          />
          <ToggleRow
            label={t('settings.notifications.digestSummary')}
            description={t('settings.notifications.digestSummaryDescription')}
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
                      {t(`settings.notifications.frequency.${option}`)}
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
            {t('settings.notifications.pushNotifications')}
          </h3>
          <ToggleRow
            label={t('settings.notifications.commentsOnArticles')}
            description={t('settings.notifications.commentsOnArticlesDescription')}
            icon={MessageCircle}
            value={preferences.pushComments}
            onChange={handleToggle('pushComments')}
          />
          <ToggleRow
            label={t('settings.notifications.reactionsBookmarks')}
            description={t('settings.notifications.reactionsBookmarksDescription')}
            icon={BellRing}
            value={preferences.pushReactions}
            onChange={handleToggle('pushReactions')}
          />
          <ToggleRow
            label={t('settings.notifications.productAnnouncements')}
            description={t('settings.notifications.productAnnouncementsDescription')}
            icon={Laptop}
            value={preferences.productAnnouncements}
            onChange={handleToggle('productAnnouncements')}
          />
          <ToggleRow
            label={t('settings.notifications.securityAlerts')}
            description={t('settings.notifications.securityAlertsDescription')}
            icon={AlertTriangle}
            value={preferences.securityAlerts}
            onChange={handleToggle('securityAlerts')}
            meta={
              <Badge variant="destructive" className="mt-1 w-fit px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {t('settings.privacy.recommended')}
              </Badge>
            }
          />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{t('settings.notifications.quietHours')}</p>
          <p className="mt-1">
            {t('settings.notifications.quietHoursDescription')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-fit gap-2"
            onClick={() =>
              toast({
                title: t('settings.notifications.quietHoursUpdated'),
                description: t('settings.notifications.quietHoursUpdatedDescription'),
              })
            }
          >
            <Clock className="h-4 w-4" />
            {t('settings.notifications.adjustQuietHours')}
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleReset} disabled={!hasChanges || saving}>
            {t('common.reset')}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('settings.profile.saving')}
              </>
            ) : (
              t('settings.notifications.saveSettings')
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

const DEFAULT_SESSIONS: (t: (key: string, params?: Record<string, string | number>) => string) => SessionItem[] = (t) => [
  {
    id: 'session-1',
    device: 'MacBook Pro',
    platform: 'desktop',
    browser: 'Arc 1.38 · macOS 15.1',
    location: 'Valencia, Spain',
    ip: '193.42.12.18',
    lastActive: t('settings.sessions.activeNow'),
    current: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15 Pro',
    platform: 'mobile',
    browser: 'Aetheris iOS',
    location: 'Barcelona, Spain',
    ip: '82.19.44.21',
    lastActive: t('settings.sessions.hoursAgo', { hours: 2 }),
    current: false,
  },
  {
    id: 'session-3',
    device: 'Surface Laptop',
    platform: 'desktop',
    browser: 'Edge 130 · Windows 11',
    location: 'Berlin, Germany',
    ip: '91.202.17.55',
    lastActive: `${t('settings.sessions.yesterday')} ${t('settings.sessions.at')} 22:17`,
    current: false,
  },
]

function SessionsSettings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<SessionItem[]>(DEFAULT_SESSIONS(t))
  const [signingOutId, setSigningOutId] = useState<string | null>(null)

  const handleSignOut = async (sessionId: string) => {
    setSigningOutId(sessionId)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    setSigningOutId(null)
    toast({
      title: t('settings.sessions.sessionRevoked'),
      description: t('settings.sessions.sessionRevokedDescription'),
    })
  }

  const handleSignOutOthers = async () => {
    setSigningOutId('all')
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSessions((prev) => prev.filter((session) => session.current))
    setSigningOutId(null)
    toast({
      title: t('settings.sessions.otherSessionsSignedOut'),
      description: t('settings.sessions.otherSessionsSignedOutDescription'),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.sessions.title')}</CardTitle>
        <CardDescription>
          {t('settings.sessions.description')}
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
                        {t('settings.sessions.currentSession')}
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
                        {t('settings.sessions.signingOut')}
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        {t('accountSheet.signOut')}
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
            <p className="text-sm font-medium text-foreground">{t('settings.sessions.secureAccount')}</p>
            <p>
              {t('settings.sessions.secureAccountDescription')}
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
                {t('settings.sessions.signingOut')}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                {t('settings.sessions.signOutOtherSessions')}
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

function LanguageSettings() {
  const { toast } = useToast()
  const { t, language } = useTranslation()
  const { setLanguage } = useI18nStore()
  const [saving, setSaving] = useState(false)
  
  const languageOptions: Array<{ value: Language; label: string; description: string }> = [
    {
      value: 'en',
      label: t('settings.language.english'),
      description: 'English interface',
    },
    {
      value: 'ru',
      label: t('settings.language.russian'),
      description: 'Русский интерфейс',
    },
  ]
  
  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === language) return
    
    setSaving(true)
    setLanguage(newLanguage)
    
    // Небольшая задержка для UX
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    setSaving(false)
    toast({
      title: t('settings.language.languageSaved'),
      description: t('settings.language.languageDescription'),
    })
    
    // Обновляем страницу для применения изменений
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.language.title')}</CardTitle>
        <CardDescription>{t('settings.language.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {languageOptions.map((option) => {
              const isActive = language === option.value
              
              return (
                <AppearanceOptionCard
                  key={option.value}
                  active={isActive}
                  leading={<Languages className="h-5 w-5" />}
                  label={option.label}
                  description={option.description}
                  onSelect={() => handleLanguageChange(option.value)}
                  disabled={saving}
                />
              )
            })}
          </div>
        </section>
        
        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p>
                {t('settings.language.languageDescription')}
              </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BillingSettings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [processingAction, setProcessingAction] = useState<'manage' | 'payment' | null>(null)
  const invoices: Invoice[] = useMemo(
    () => {
      const monthMap: Record<string, string> = {
        'November': t('settings.billing.months.november'),
        'October': t('settings.billing.months.october'),
        'September': t('settings.billing.months.september'),
        'December': t('settings.billing.months.december'),
      }
      return [
      {
        id: 'INV-2025-003',
          period: `${monthMap['November']} 2025`,
        amount: '$18.00',
        status: 'Paid',
        downloadUrl: '#',
      },
      {
        id: 'INV-2025-002',
          period: `${monthMap['October']} 2025`,
        amount: '$18.00',
        status: 'Paid',
        downloadUrl: '#',
      },
      {
        id: 'INV-2025-001',
          period: `${monthMap['September']} 2025`,
        amount: '$12.00',
        status: 'Refunded',
        downloadUrl: '#',
      },
      ]
    },
    [t]
  )

  const handlePlanAction = async (type: 'manage' | 'payment') => {
    setProcessingAction(type)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setProcessingAction(null)
    toast({
      title: type === 'manage' ? t('settings.billing.subscriptionPortal') : t('settings.billing.paymentMethod'),
      description: t('settings.billing.actionDescription'),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.billing.title')}</CardTitle>
        <CardDescription>
          {t('settings.billing.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Crown className="h-4 w-4 text-primary" />
                {t('settings.billing.creatorPro')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.billing.creatorProDescription')}
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {t('settings.billing.active', { amount: '$18' })}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {t('settings.billing.nextInvoice', { date: `${t('settings.billing.months.december')} 10, 2025` })}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              {t('settings.billing.trialCreditsApplied')}
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
                  {t('settings.billing.openingPortal')}
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  {t('settings.billing.manageSubscription')}
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
                {t('settings.billing.paymentMethod')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.billing.paymentMethodDescription')}
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-[11px] uppercase tracking-wide">
              {t('settings.billing.primary')}
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
                  {t('settings.billing.updating')}
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  {t('settings.billing.updatePaymentMethod')}
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('settings.billing.invoices')}
            </h3>
            <Badge variant="secondary" className="px-3 py-1 text-[11px] uppercase tracking-wide">
              {t('settings.billing.latest12Months')}
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
                      {t(`settings.billing.status.${invoice.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                  <Download className="h-4 w-4" />
                  {t('settings.billing.downloadPDF')}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{t('settings.billing.needHelp')}</p>
          <p className="mt-1">
            {t('settings.billing.needHelpDescription')}
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
