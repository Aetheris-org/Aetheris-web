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
  Star,
  X,
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
import { updateUserProfile } from '@/api/profile-graphql'
import apiClient from '@/lib/axios'
import { logger } from '@/lib/logger'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// settingsNav будет динамическим через useTranslation
const settingsNavItems = [
  { id: 'profile', icon: User },
  { id: 'appearance', icon: Palette },
  { id: 'language', icon: Languages },
  { id: 'privacy', icon: Shield, inDevelopment: true },
  { id: 'notifications', icon: Bell, inDevelopment: true },
  { id: 'sessions', icon: Monitor, inDevelopment: true },
  { id: 'billing', icon: CreditCard, inDevelopment: true },
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

const viewModeOptions = (t: (key: string) => string): Array<{
  value: 'default' | 'line' | 'square'
  label: string
  description: string
  icon: typeof Rows
}> => [
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
    accents: ['red', 'crimson', 'ruby', 'scarlet', 'cherry', 'burgundy', 'wine', 'maroon', 'vermillion', 'magenta', 'fuchsia', 'violet', 'indigo', 'cobalt', 'azure'],
  },
  {
    id: 'botanical',
    label: t('settings.appearance.accentGroups.botanical.label') || 'Fresh & botanical',
    description: t('settings.appearance.accentGroups.botanical.description') || 'Nature-inspired greens and blues suited to calm products.',
    accents: ['cyan', 'turquoise', 'seafoam', 'teal', 'emerald', 'mint', 'green', 'forest', 'sage', 'olive', 'chartreuse', 'jade', 'moss-green', 'aqua', 'cerulean', 'sapphire'],
  },
  {
    id: 'warm',
    label: t('settings.appearance.accentGroups.warm.label') || 'Warm & welcoming',
    description: t('settings.appearance.accentGroups.warm.description') || 'Sunset oranges and blush tones for storytelling moments.',
    accents: ['rose', 'peach', 'coral', 'sunset', 'brown', 'bronze', 'amber', 'saffron', 'gold', 'salmon', 'honey', 'butter', 'canary', 'lemon', 'tangerine', 'apricot', 'copper', 'rust', 'khaki', 'tan', 'beige', 'vanilla', 'champagne'],
  },
  {
    id: 'cool',
    label: t('settings.appearance.accentGroups.cool.label') || 'Cool & calm',
    description: t('settings.appearance.accentGroups.cool.description') || 'Serene blues and purples for peaceful interfaces.',
    accents: ['orchid', 'plum', 'lavender', 'purple', 'navy', 'blue', 'ocean', 'sky', 'cerulean', 'sapphire', 'royal', 'periwinkle', 'amethyst', 'mauve', 'lilac', 'wisteria', 'aqua'],
  },
  {
    id: 'muted',
    label: t('settings.appearance.accentGroups.muted.label') || 'Sophisticated neutrals',
    description: t('settings.appearance.accentGroups.muted.description') || 'Soft plums and greys that stay out of the way.',
    accents: ['pure', 'silver', 'mono', 'graphite', 'platinum', 'titanium', 'steel', 'iron', 'chrome', 'nickel', 'pewter', 'brass', 'aluminum'],
  },
  {
    id: 'playful',
    label: t('settings.appearance.accentGroups.playful.label') || 'Playful & vibrant',
    description: t('settings.appearance.accentGroups.playful.description') || 'Bright, fun colors for energetic and creative spaces.',
    accents: ['pink', 'lime', 'yellow', 'orange', 'neon-pink', 'neon-green', 'neon-blue', 'neon-yellow', 'neon-cyan', 'neon-orange', 'neon-purple', 'pastel-pink', 'pastel-blue', 'pastel-green', 'pastel-yellow', 'pastel-purple', 'pastel-orange'],
  },
]

const getSurfaceGroups = (t: (key: string) => string): Array<{ id: string; label: string; description: string; palettes: SurfaceStyle[] }> => [
  {
    id: 'luminous',
    label: t('settings.appearance.surfaceGroups.luminous.label') || 'Bright & airy',
    description: t('settings.appearance.surfaceGroups.luminous.description') || 'High-key canvases for daylight dashboards and editorial homes.',
    palettes: ['snow', 'ivory', 'cream', 'daylight', 'geometrydash', 'glacier', 'zenith', 'harbor', 'lumen', 'pearl', 'cloud', 'moonlight', 'luxury', 'tropical', 'marble', 'granite', 'quartz', 'crystal', 'diamond', 'opal', 'starlight', 'firelight', 'candlelight'],
  },
  {
    id: 'earthy',
    label: t('settings.appearance.surfaceGroups.earthy.label') || 'Warm & grounded',
    description: t('settings.appearance.surfaceGroups.earthy.description') || 'Organic neutrals that pair well with writing-led experiences.',
    palettes: ['canyon', 'terracotta', 'csgo', 'ember', 'terraria', 'sunset', 'sand', 'minecraft', 'moss', 'wood', 'oak', 'mahogany', 'cherrywood', 'maple', 'desert', 'valley', 'meadow', 'garden'],
  },
  {
    id: 'expressive',
    label: t('settings.appearance.surfaceGroups.expressive.label') || 'Soft & expressive',
    description: t('settings.appearance.surfaceGroups.expressive.description') || 'Gradient-ready palettes with gentle colour cast for calm products.',
    palettes: ['aurora', 'mist', 'fog', 'smoke', 'nebula', 'twilight', 'cyberpunk', 'solstice', 'neon', 'laser', 'plasma', 'hologram', 'matrix', 'cyber', 'retro', 'vintage'],
  },
  {
    id: 'neutral',
    label: t('settings.appearance.surfaceGroups.neutral.label') || 'Neutral greys',
    description: t('settings.appearance.surfaceGroups.neutral.description') || 'Versatile grey tones for balanced, professional interfaces.',
    palettes: ['default', 'ash', 'slate', 'charcoal', 'stone', 'city', 'urban', 'library', 'museum', 'gallery', 'studio'],
  },
  {
    id: 'deep',
    label: t('settings.appearance.surfaceGroups.deep.label') || 'Deep focus',
    description: t('settings.appearance.surfaceGroups.deep.description') || 'Immersive dark surfaces for reading in low light.',
    palettes: ['midnight', 'obsidian', 'noir', 'dota', 'onyx', 'shadow', 'storm', 'abyss', 'deep', 'pitch', 'coal', 'jet', 'carbon', 'void', 'nightfall', 'inkwell', 'eclipse', 'cosmos', 'fnaf-dark', 'outlast-horror', 'phasmophobia-eerie'],
  },
  {
    id: 'nature',
    label: t('settings.appearance.surfaceGroups.nature.label') || 'Nature & landscapes',
    description: t('settings.appearance.surfaceGroups.nature.description') || 'Natural environments and landscapes.',
    palettes: ['arctic', 'jungle', 'lake', 'river', 'beach', 'mountain', 'garden'],
  },
  {
    id: 'premium',
    label: t('settings.appearance.surfaceGroups.premium.label') || 'Premium & elegant',
    description: t('settings.appearance.surfaceGroups.premium.description') || 'Luxurious and sophisticated surfaces.',
    palettes: ['premium', 'royal', 'elegant', 'sophisticated', 'velvet', 'silk', 'leather'],
  },
  {
    id: 'gaming',
    label: t('settings.appearance.surfaceGroups.gaming.label') || 'Gaming & anime',
    description: t('settings.appearance.surfaceGroups.gaming.description') || 'Gaming and anime-inspired surfaces.',
    palettes: ['jujutsu-kaisen', 'one-piece-joy', '90s-muted', 'programming-terminal'],
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
        'group relative flex h-full cursor-pointer flex-col gap-2 sm:gap-3 border p-3 sm:p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0 focus-visible:ring-0',
        disabled && 'pointer-events-none opacity-60',
        active && 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
      )}
      style={{
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div 
            className="flex size-9 sm:size-11 shrink-0 items-center justify-center border border-border/60 bg-background shadow-sm"
            style={{
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {leading}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold break-words">{label}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{description}</p>
          </div>
        </div>
        {active && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />}
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
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">{t('settings.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
        <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-[180px_1fr] xl:grid-cols-[220px_1fr]">
          {/* Sidebar Navigation - All screens */}
          <aside className="space-y-0.5 sm:space-y-1">
            {/* Mobile: Dropdown menu */}
            <div className="lg:hidden mb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between h-9 text-xs",
                      settingsNav.find(item => item.id === currentSection)?.inDevelopment && "border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity"
                    )}
                    id="settings-dropdown-trigger"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      {(() => {
                        const Icon = settingsNav.find(item => item.id === currentSection)?.icon || Settings
                        return <Icon className="h-4 w-4 shrink-0" />
                      })()}
                      <span className="truncate min-w-0">
                        {settingsNav.find(item => item.id === currentSection)?.label || t('settings.title')}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {settingsNav.map((item) => {
                    const Icon = item.icon
                    const isActive = currentSection === item.id
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleSectionNavigate(item.id)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isActive && "bg-accent",
                          item.inDevelopment && "border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 min-w-0 truncate">{item.label}</span>
                        {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Desktop: Full sidebar */}
            <nav className="hidden lg:flex flex-col gap-0.5">
              {settingsNav.map((item) => {
                const Icon = item.icon
                const isActive = currentSection === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-2 h-9 sm:h-10 text-xs sm:text-sm relative ${
                      item.inDevelopment ? 'border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity' : ''
                    }`}
                    onClick={() => handleSectionNavigate(item.id)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 space-y-4 sm:space-y-6">
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
  const [contactEmail, setContactEmail] = useState(profileDetails.contactEmail || '') // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не используем user?.email (он хеширован)
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
  const initialContactEmail = profileDetails.contactEmail || '' // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не используем user?.email (он хеширован)
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

  // Функция для загрузки изображения на imgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('files', file, `profile-image-${Date.now()}.jpg`)

    // Retry логика для отказоустойчивости
    let lastError: any = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug('[SettingsPage] Uploading image, attempt:', attempt)
        const uploadResponse = await apiClient.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000, // 90 секунд таймаут
        })

        logger.debug('[SettingsPage] Upload response:', {
          status: uploadResponse.status,
          data: uploadResponse.data,
        })

        // Обрабатываем разные форматы ответа
        let uploadedFile: any = null
        if (Array.isArray(uploadResponse.data)) {
          uploadedFile = uploadResponse.data[0]
        } else if (uploadResponse.data && typeof uploadResponse.data === 'object') {
          uploadedFile = uploadResponse.data
        }

        if (!uploadedFile) {
          logger.error('[SettingsPage] Invalid upload response format:', uploadResponse.data)
          throw new Error('Invalid response format from upload service')
        }

        if (!uploadedFile.url) {
          logger.error('[SettingsPage] Upload response missing URL:', uploadedFile)
          throw new Error('Invalid response from upload service: missing URL')
        }

        const imageUrl = uploadedFile.url
        logger.debug('[SettingsPage] Image uploaded successfully:', { imageUrl })
        return imageUrl
      } catch (error: any) {
        lastError = error
        logger.error(`[SettingsPage] Upload attempt ${attempt} failed:`, {
          error: error.message,
          code: error.code,
          status: error.response?.status,
        })
        
        // Если это не сетевая ошибка или таймаут, не повторяем
        if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK' && error.response?.status !== 408) {
          logger.error('[SettingsPage] Non-retryable error, stopping retries')
          break
        }
        
        // Экспоненциальная задержка перед повтором
        if (attempt < maxRetries) {
          const delay = 1000 * attempt
          logger.debug(`[SettingsPage] Retrying after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    logger.error('[SettingsPage] All upload attempts failed')
    throw lastError || new Error('Failed to upload image after multiple attempts')
  }

  const handleSave = async () => {
    if (!user) return

    const trimmedNickname = nickname.trim()
    if (trimmedNickname.length < 3) {
      toast({
        title: t('settings.profile.nicknameTooShort'),
        description: t('settings.profile.nicknameTooShortDescription'),
        variant: 'destructive',
      })
      return
    }

    if (bioLength > BIO_LIMIT) {
      toast({
        title: t('settings.profile.bioTooLong'),
        description: t('settings.profile.bioTooLongDescription', { limit: BIO_LIMIT }),
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      let avatarUrl: string | null | undefined
      let coverImageUrl: string | null | undefined

      if (avatarFile) {
        avatarUrl = await uploadImageToImgBB(avatarFile)
      } else if (avatarRemoved) {
        avatarUrl = null
      }

      if (coverFile) {
        coverImageUrl = await uploadImageToImgBB(coverFile)
      } else if (coverRemoved) {
        coverImageUrl = null
      }

      const updatedUser = await updateUserProfile({
        username: trimmedNickname,
        bio: bio.trim() || '', // Используем пустую строку вместо null для bio
        avatar: avatarUrl,
        coverImage: coverImageUrl,
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
      logger.error('Failed to update profile', error)
      const errorMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
      const errorStatus = (error as { response?: { status?: number } })?.response?.status
      
      // Более детальное сообщение об ошибке
      let description = t('settings.profile.profileUpdateFailed')
      if (errorStatus === 400) {
        if (errorMessage) {
          description = errorMessage
        } else {
          description = t('settings.profile.uploadError') || 'Ошибка загрузки изображения. Проверьте формат файла (JPG, PNG, WEBP) и размер (максимум 8MB).'
        }
      } else if (errorStatus === 401) {
        description = t('settings.profile.authError') || 'Требуется авторизация. Пожалуйста, войдите снова.'
      } else if (errorMessage) {
        description = errorMessage
      }
      
      toast({
        title: t('settings.profile.profileUpdateFailed'),
        description,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.profile.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        <Tabs defaultValue="basics" className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="inline-flex h-auto items-center justify-start rounded-lg bg-transparent p-0 w-auto border-0 gap-2">
              <TabsTrigger 
                value="basics" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 max-w-[85px] sm:max-w-none"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.profile.basics')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 max-w-[85px] sm:max-w-none border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.profile.contact')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="professional" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 max-w-[85px] sm:max-w-none border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100"
              >
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.profile.professional')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="social" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 max-w-[85px] sm:max-w-none border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100"
              >
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.profile.social')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basics" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
        <section className="space-y-2 sm:space-y-3 w-full">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground">
              {t('settings.profile.cover')}
            </Label>
            <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{t('settings.profile.coverRecommended')}</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-dashed bg-card/50 w-full">
            <div className="aspect-[4/1] w-full min-h-[120px] sm:min-h-[160px]">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Profile cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 sm:gap-3 text-muted-foreground p-4 sm:p-6">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/60 shrink-0">
                    <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{t('settings.profile.noCover')}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                    {t('settings.profile.addCover')}
                  </p>
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-end gap-1 sm:gap-1.5 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-2 sm:p-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isSaving || isCoverProcessing}
                    >
                      <span className="flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{coverPreview ? t('settings.profile.changeCover') : t('settings.profile.uploadCover')}</span>
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{coverPreview ? t('settings.profile.changeCover') : t('settings.profile.uploadCover')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {coverPreview?.startsWith('blob:') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0"
                        onClick={handleAdjustCoverCrop}
                        disabled={isSaving || isCoverProcessing}
                      >
                        <span className="flex items-center gap-1.5">
                          <Crop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('settings.profile.adjustCrop')}</span>
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('settings.profile.adjustCrop')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {coverPreview && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0 text-destructive hover:text-destructive"
                        onClick={handleRemoveCover}
                        disabled={isSaving || isCoverProcessing}
                      >
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('settings.profile.remove')}</span>
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('settings.profile.remove')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground">
            {t('settings.profile.avatar')}
          </Label>
          <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted/60">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground">
                  {(nickname || initialNickname).charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 sm:h-9 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isSaving || isAvatarProcessing}
                    >
                      <span className="flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{avatarPreview ? t('settings.profile.changeAvatar') : t('settings.profile.uploadAvatar')}</span>
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{avatarPreview ? t('settings.profile.changeAvatar') : t('settings.profile.uploadAvatar')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {avatarPreview?.startsWith('blob:') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0"
                        onClick={handleAdjustAvatarCrop}
                        disabled={isSaving || isAvatarProcessing}
                      >
                        <span className="flex items-center gap-1.5">
                          <Crop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('settings.profile.adjustCrop')}</span>
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('settings.profile.adjustCrop')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {avatarPreview && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-auto sm:px-2.5 sm:gap-1.5 p-0 text-destructive hover:text-destructive"
                        onClick={handleRemoveAvatar}
                        disabled={isSaving || isAvatarProcessing}
                      >
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('settings.profile.remove')}</span>
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('settings.profile.remove')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="settings-nickname" className="text-xs sm:text-sm">{t('settings.profile.nickname')}</Label>
            <Input
              id="settings-nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="fluy1337"
              maxLength={60}
              disabled={isSaving}
              className="h-9 sm:h-10 text-sm"
            />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="settings-bio" className="text-xs sm:text-sm">{t('settings.profile.bio')}</Label>
              <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                {bioRemaining} {t('settings.profile.charactersLeft')}
              </span>
            </div>
            <textarea
              id="settings-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t('settings.profile.bioPlaceholder')}
              className="min-h-[100px] sm:min-h-[140px] w-full resize-none rounded-lg border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={BIO_LIMIT + 10}
              disabled={isSaving}
            />
          </div>
        </section>

        <div className="flex flex-col gap-2 border-t border-dashed pt-4 sm:pt-6 sm:flex-row sm:justify-end">
          <Button 
            variant="ghost" 
            onClick={handleCancel} 
            disabled={isSaving || !hasChanges}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                {t('settings.profile.saving')}
              </>
            ) : (
              t('settings.profile.saveChanges')
            )}
          </Button>
        </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-semibold">{t('settings.profile.contactDetails')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('settings.profile.contactDetailsDescription')}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-first-name" className="text-xs sm:text-sm">{t('settings.profile.firstName')}</Label>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Alex"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-last-name" className="text-xs sm:text-sm">{t('settings.profile.lastName')}</Label>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Rivera"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-contact-email" className="text-xs sm:text-sm">{t('settings.profile.contactEmail')}</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-contact-email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="hello@aetheris.dev"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('settings.profile.contactEmailDescription')}
              </p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-website" className="text-xs sm:text-sm">{t('settings.profile.website')}</Label>
              <div className="relative">
                <Globe className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://aetheris.dev"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-location" className="text-xs sm:text-sm">{t('settings.profile.location')}</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-location"
                  value={locationValue}
                  onChange={(event) => setLocationValue(event.target.value)}
                  placeholder="Valencia, Spain"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed pt-3 sm:pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContactReset}
              disabled={!contactHasChanges || contactSaving}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              {t('common.reset')}
            </Button>
            <Button
              size="sm"
              onClick={handleContactSave}
              disabled={!contactHasChanges || contactSaving}
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
            >
              {contactSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  {t('settings.profile.saving')}
                </>
              ) : (
                t('settings.profile.saveContactInfo')
              )}
            </Button>
          </div>
            </section>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-semibold">{t('settings.profile.socialProfiles')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('settings.profile.socialProfilesDescription')}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-twitter" className="text-xs sm:text-sm">{t('settings.profile.twitter')}</Label>
              <div className="relative">
                <Twitter className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-twitter"
                  value={twitterHandle}
                  onChange={(event) => setTwitterHandle(event.target.value)}
                  placeholder="@aetheris"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-github" className="text-xs sm:text-sm">{t('settings.profile.github')}</Label>
              <div className="relative">
                <Github className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-github"
                  value={githubHandle}
                  onChange={(event) => setGithubHandle(event.target.value)}
                  placeholder="github.com/aetheris"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-linkedin" className="text-xs sm:text-sm">{t('settings.profile.linkedin')}</Label>
              <div className="relative">
                <Linkedin className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-linkedin"
                  value={linkedinUrl}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                  placeholder="linkedin.com/in/aetheris"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-portfolio" className="text-xs sm:text-sm">{t('settings.profile.portfolio')}</Label>
              <div className="relative">
                <AtSign className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-portfolio"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="dribbble.com/aetheris"
                  className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed pt-3 sm:pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSocialReset}
              disabled={!socialHasChanges || socialSaving}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              {t('common.reset')}
            </Button>
            <Button
              size="sm"
              onClick={handleSocialSave}
              disabled={!socialHasChanges || socialSaving}
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
            >
              {socialSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  {t('settings.profile.saving')}
                </>
              ) : (
                t('settings.profile.saveSocialLinks')
              )}
            </Button>
          </div>
            </section>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-semibold">{t('settings.profile.professionalProfile')}</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('settings.profile.professionalProfileDescription')}
                </p>
              </div>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                  <Label htmlFor="settings-headline" className="text-xs sm:text-sm">{t('settings.profile.headline')}</Label>
                  <Input
                    id="settings-headline"
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                    placeholder={t('settings.profile.headlinePlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="settings-role" className="text-xs sm:text-sm">{t('settings.profile.currentRole')}</Label>
                  <Input
                    id="settings-role"
                    value={currentRole}
                    onChange={(event) => setCurrentRole(event.target.value)}
                    placeholder="Design Director"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="settings-company" className="text-xs sm:text-sm">{t('settings.profile.currentCompany')}</Label>
                  <Input
                    id="settings-company"
                    value={currentCompany}
                    onChange={(event) => setCurrentCompany(event.target.value)}
                    placeholder="Aetheris Studio"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="settings-experience" className="text-xs sm:text-sm">{t('settings.profile.experience')}</Label>
                  <Input
                    id="settings-experience"
                    value={experienceLevel}
                    onChange={(event) => setExperienceLevel(event.target.value)}
                    placeholder="8+ years in product design"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="settings-timezone" className="text-xs sm:text-sm">{t('settings.profile.timezone')}</Label>
                  <Input
                    id="settings-timezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    placeholder="UTC+1 · CET"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="settings-pronouns" className="text-xs sm:text-sm">{t('settings.profile.pronouns')}</Label>
                  <Input
                    id="settings-pronouns"
                    value={pronouns}
                    onChange={(event) => setPronouns(event.target.value)}
                    placeholder="she/they"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                  <Label htmlFor="settings-availability" className="text-xs sm:text-sm">{t('settings.profile.availabilityNote')}</Label>
                  <textarea
                    id="settings-availability"
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                    placeholder={t('settings.profile.availabilityPlaceholder')}
                    className="min-h-[80px] sm:min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-dashed pt-3 sm:pt-4 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfessionalReset}
                  disabled={!professionalHasChanges || professionalSaving}
                  className="shrink-0 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {t('common.reset')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleProfessionalSave}
                  disabled={!professionalHasChanges || professionalSaving}
                  className="gap-1.5 sm:gap-2 shrink-0 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {professionalSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
                      <span>{t('settings.profile.saving')}</span>
                    </>
                  ) : (
                    <span>{t('settings.profile.saveProfessionalInfo')}</span>
                  )}
                </Button>
              </div>
            </section>

            <Separator />

            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-semibold">{t('settings.profile.focusVisibility')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('settings.profile.focusVisibilityDescription')}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <Label htmlFor="settings-languages" className="text-xs sm:text-sm">{t('settings.profile.languages')}</Label>
              <Input
                id="settings-languages"
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder="English, Spanish (ES), Catalan"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <Label htmlFor="settings-focus" className="text-xs sm:text-sm">{t('settings.profile.focusAreas')}</Label>
          <textarea
                id="settings-focus"
                value={focusAreas}
                onChange={(event) => setFocusAreas(event.target.value)}
                placeholder="Calm product strategy, accessibility systems, editorial tooling, long-form craft."
                className="min-h-[100px] sm:min-h-[120px] w-full resize-none rounded-lg border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={320}
          />
        </div>
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <Label htmlFor="settings-learning" className="text-xs sm:text-sm">{t('settings.profile.currentlyLearning')}</Label>
              <textarea
                id="settings-learning"
                value={currentlyLearning}
                onChange={(event) => setCurrentlyLearning(event.target.value)}
                placeholder="Studying tactile motion systems and authoring workflows for multi-sensory mediums."
                className="min-h-[80px] sm:min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={280}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="settings-office-hours" className="text-xs sm:text-sm">{t('settings.profile.officeHours')}</Label>
              <Input
                id="settings-office-hours"
                value={officeHours}
                onChange={(event) => setOfficeHours(event.target.value)}
                placeholder="Replies within 48h · Best between 10:00 and 16:00 CET"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <Label htmlFor="settings-collaboration" className="text-xs sm:text-sm">{t('settings.profile.collaborationNotes')}</Label>
              <textarea
                id="settings-collaboration"
                value={collaborationNotes}
                onChange={(event) => setCollaborationNotes(event.target.value)}
                placeholder="Open to paired writing, guest lectures, and design audits for creator platforms."
                className="min-h-[80px] sm:min-h-[90px] w-full resize-none rounded-lg border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={240}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 rounded-lg border border-dashed bg-muted/20 p-3 sm:p-4">
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('settings.profile.availability')}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant={openToMentoring ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  onClick={() => setOpenToMentoring((value) => !value)}
                  aria-pressed={openToMentoring}
                >
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('settings.profile.openToMentoring')}</span>
                  <span className="sm:hidden">{t('settings.profile.mentoring')}</span>
                </Button>
                <Button
                  type="button"
                  variant={openToConsulting ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  onClick={() => setOpenToConsulting((value) => !value)}
                  aria-pressed={openToConsulting}
                >
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('settings.profile.openToConsulting')}</span>
                  <span className="sm:hidden">{t('settings.profile.consulting')}</span>
                </Button>
                <Button
                  type="button"
                  variant={openToSpeaking ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  onClick={() => setOpenToSpeaking((value) => !value)}
                  aria-pressed={openToSpeaking}
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('settings.profile.openToSpeaking')}</span>
                  <span className="sm:hidden">{t('settings.profile.speaking')}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('settings.profile.preferredContactMethod')}</p>
              <div className="grid gap-2 sm:gap-2 sm:grid-cols-2">
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
                              'h-full justify-start gap-1 py-2 sm:py-3 px-2 sm:px-3 text-left min-w-0 w-full',
                              isSelected && 'border-primary'
                    )}
                    onClick={() => setPreferredContactMethod(option.value)}
                            aria-pressed={isSelected}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
                              <span className={cn(
                                'text-xs sm:text-sm font-semibold truncate',
                                isSelected ? 'text-primary-foreground' : 'text-foreground'
                              )}>
                                {option.label}
                              </span>
                              <span className={cn(
                                'text-[10px] sm:text-xs truncate',
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
    setSecondaryAccent: _setSecondaryAccent,
    tertiaryAccent,
    setTertiaryAccent: _setTertiaryAccent,
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
    applyTheme,
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
    applyTheme: state.applyTheme,
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
  const [_collapsedGroups, _setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('aetheris-theme-groups-collapsed')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // const _toggleGroup = (groupKey: string) => { // Unused, but may be needed in future
  //   const newState = { ..._collapsedGroups, [groupKey]: !_collapsedGroups[groupKey] }
  //   _setCollapsedGroups(newState)
  //   localStorage.setItem('aetheris-theme-groups-collapsed', JSON.stringify(newState))
  // }

  // Theme search and expanded groups state
  const [themeSearchQuery, setThemeSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    basic: false,
    games: false,
    extraordinary: false,
    nature: false,
    corporate: false,
    retro: false,
  })

  // Theme filters state
  const [themeFilters, setThemeFilters] = useState<{
    typography: TypographyScale | null
    contrast: ContrastMode | null
    depth: DepthStyle | null
    motion: MotionPreference | null
    radius: number | null
    group: string | null
  }>({
    typography: null,
    contrast: null,
    depth: null,
    motion: null,
    radius: null,
    group: null,
  })
  const [radiusInput, setRadiusInput] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

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
          id: 'abstract-art',
        name: t('settings.appearance.themes.abstractArt.name'),
        description: t('settings.appearance.themes.abstractArt.description'),
        accent: 'royal' as AccentColor,
        secondaryAccent: 'periwinkle' as AccentColor,
        surface: 'abstract-art' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'alien',
          name: t('settings.appearance.themes.alien.name'),
          description: t('settings.appearance.themes.alien.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'amethyst-mystic',
        name: t('settings.appearance.themes.amethystMystic.name'),
        description: t('settings.appearance.themes.amethystMystic.description'),
        accent: 'amethyst' as AccentColor,
        surface: 'twilight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'among-us',
        name: t('settings.appearance.themes.amongUs.name'),
          description: t('settings.appearance.themes.amongUs.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'aqua' as AccentColor,
        tertiaryAccent: 'lime' as AccentColor,
          surface: 'daylight' as SurfaceStyle,
          radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'animal-crossing',
          name: t('settings.appearance.themes.animalCrossing.name'),
          description: t('settings.appearance.themes.animalCrossing.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'sky' as AccentColor,
          surface: 'daylight' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'apex-legends',
          name: t('settings.appearance.themes.apexLegends.name'),
          description: t('settings.appearance.themes.apexLegends.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'red' as AccentColor,
          surface: 'noir' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'aqua-fresh',
        name: t('settings.appearance.themes.aquaFresh.name'),
        description: t('settings.appearance.themes.aquaFresh.description'),
        accent: 'aqua' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor,
        surface: 'tropical' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'arasaka',
          name: t('settings.appearance.themes.arasaka.name'),
          description: t('settings.appearance.themes.arasaka.description'),
          accent: 'wine' as AccentColor,
          secondaryAccent: 'maroon' as AccentColor,
          tertiaryAccent: 'crimson' as AccentColor,
          surface: 'abyss' as SurfaceStyle,
          radius: 0.5,
          typography: 'compact' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 0.95,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
          id: 'autumn-warmth',
          name: t('settings.appearance.themes.autumnWarmth.name'),
          description: t('settings.appearance.themes.autumnWarmth.description'),
          accent: 'vermillion' as AccentColor,
          secondaryAccent: 'rust' as AccentColor,
          tertiaryAccent: 'copper' as AccentColor,
          surface: 'valley' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'backrooms',
          name: t('settings.appearance.themes.backrooms.name'),
          description: t('settings.appearance.themes.backrooms.description'),
          accent: 'vanilla' as AccentColor,
          secondaryAccent: 'beige' as AccentColor,
          tertiaryAccent: 'tan' as AccentColor,
          surface: 'ivory' as SurfaceStyle,
          radius: 0.25,
          typography: 'compact' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
          id: 'balatro',
          name: t('settings.appearance.themes.balatro.name'),
          description: t('settings.appearance.themes.balatro.description'),
          accent: 'butter' as AccentColor,
          secondaryAccent: 'canary' as AccentColor,
          tertiaryAccent: 'honey' as AccentColor,
          surface: 'noir' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'banana',
          name: t('settings.appearance.themes.banana.name'),
          description: t('settings.appearance.themes.banana.description'),
          accent: 'lemon' as AccentColor,
          secondaryAccent: 'canary' as AccentColor,
          tertiaryAccent: 'butter' as AccentColor,
          surface: 'meadow' as SurfaceStyle,
          radius: 1.5,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1.1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'beige-minimal',
        name: t('settings.appearance.themes.beigeMinimal.name'),
        description: t('settings.appearance.themes.beigeMinimal.description'),
        accent: 'beige' as AccentColor,
        surface: 'cream' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'bioshock',
          name: t('settings.appearance.themes.bioshock.name'),
          description: t('settings.appearance.themes.bioshock.description'),
          accent: 'honey' as AccentColor,
          secondaryAccent: 'butter' as AccentColor,
          tertiaryAccent: 'champagne' as AccentColor,
          surface: 'vintage' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'block-strike',
          name: t('settings.appearance.themes.blockStrike.name'),
          description: t('settings.appearance.themes.blockStrike.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'red' as AccentColor,
          surface: 'minecraft' as SurfaceStyle,
          radius: 0.25,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'bloodborne',
          name: t('settings.appearance.themes.bloodborne.name'),
          description: t('settings.appearance.themes.bloodborne.description'),
          accent: 'burgundy' as AccentColor,
          secondaryAccent: 'crimson' as AccentColor,
          surface: 'noir' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'borderlands',
          name: t('settings.appearance.themes.borderlands.name'),
          description: t('settings.appearance.themes.borderlands.description'),
          accent: 'tangerine' as AccentColor,
          secondaryAccent: 'vermillion' as AccentColor,
          tertiaryAccent: 'rust' as AccentColor,
          surface: 'desert' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'bronze-vintage',
        name: t('settings.appearance.themes.bronzeVintage.name'),
        description: t('settings.appearance.themes.bronzeVintage.description'),
        accent: 'bronze' as AccentColor,
        surface: 'stone' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'burgundy-wine',
        name: t('settings.appearance.themes.burgundyWine.name'),
        description: t('settings.appearance.themes.burgundyWine.description'),
        accent: 'burgundy' as AccentColor,
        surface: 'noir' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'butter-sunshine',
        name: t('settings.appearance.themes.butterSunshine.name'),
        description: t('settings.appearance.themes.butterSunshine.description'),
        accent: 'butter' as AccentColor,
        surface: 'zenith' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'call-of-duty',
          name: t('settings.appearance.themes.callOfDuty.name'),
          description: t('settings.appearance.themes.callOfDuty.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'graphite' as AccentColor,
          surface: 'charcoal' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'canary-bright',
        name: t('settings.appearance.themes.canaryBright.name'),
        description: t('settings.appearance.themes.canaryBright.description'),
        accent: 'canary' as AccentColor,
        surface: 'daylight' as SurfaceStyle,
        radius: 1,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'celeste',
        name: t('settings.appearance.themes.celeste.name'),
        description: t('settings.appearance.themes.celeste.description'),
        accent: 'pink' as AccentColor,
        secondaryAccent: 'purple' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'cerulean-sky',
        name: t('settings.appearance.themes.ceruleanSky.name'),
        description: t('settings.appearance.themes.ceruleanSky.description'),
        accent: 'cerulean' as AccentColor,
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
        id: 'champagne-celebration',
        name: t('settings.appearance.themes.champagneCelebration.name'),
        description: t('settings.appearance.themes.champagneCelebration.description'),
        accent: 'champagne' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'chartreuse-energy',
        name: t('settings.appearance.themes.chartreuseEnergy.name'),
        description: t('settings.appearance.themes.chartreuseEnergy.description'),
        accent: 'chartreuse' as AccentColor,
        surface: 'moss' as SurfaceStyle,
        radius: 1,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'cherry-blossom',
        name: t('settings.appearance.themes.cherryBlossom.name'),
        description: t('settings.appearance.themes.cherryBlossom.description'),
        accent: 'cherry' as AccentColor,
        secondaryAccent: 'pink' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'china',
          name: t('settings.appearance.themes.china.name'),
          description: t('settings.appearance.themes.china.description'),
          accent: 'wine' as AccentColor,
          secondaryAccent: 'honey' as AccentColor,
          tertiaryAccent: 'champagne' as AccentColor,
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
          id: 'clash-royale',
          name: t('settings.appearance.themes.clashRoyale.name'),
          description: t('settings.appearance.themes.clashRoyale.description'),
          accent: 'magenta' as AccentColor,
          secondaryAccent: 'gold' as AccentColor,
          surface: 'twilight' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'coca-cola',
        name: t('settings.appearance.themes.cocaCola.name'),
        description: t('settings.appearance.themes.cocaCola.description'),
        accent: 'red' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'copper-industrial',
        name: t('settings.appearance.themes.copperIndustrial.name'),
        description: t('settings.appearance.themes.copperIndustrial.description'),
        accent: 'copper' as AccentColor,
        surface: 'wood' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'coral-peach',
        name: t('settings.appearance.themes.coralPeach.name'),
        description: t('settings.appearance.themes.coralPeach.description'),
        accent: 'coral' as AccentColor,
        secondaryAccent: 'peach' as AccentColor,
        surface: 'sunset' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'coral-reef',
        name: t('settings.appearance.themes.coralReef.name'),
        description: t('settings.appearance.themes.coralReef.description'),
        accent: 'coral' as AccentColor,
        surface: 'sunset' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'cosmic-dark',
          name: t('settings.appearance.themes.cosmicDark.name'),
          description: t('settings.appearance.themes.cosmicDark.description'),
        accent: 'amethyst' as AccentColor,
          secondaryAccent: 'wisteria' as AccentColor,
          tertiaryAccent: 'lilac' as AccentColor,
        surface: 'starlight' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'crimson-amber',
        name: t('settings.appearance.themes.crimsonAmber.name'),
        description: t('settings.appearance.themes.crimsonAmber.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'amber' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    ],
    games: [
      {
        id: 'csgo',
        name: t('settings.appearance.themes.csgo.name'),
        description: t('settings.appearance.themes.csgo.description'),
        accent: 'tangerine' as AccentColor,
        secondaryAccent: 'vermillion' as AccentColor,
        surface: 'csgo' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'cuphead',
          name: t('settings.appearance.themes.cuphead.name'),
          description: t('settings.appearance.themes.cuphead.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'yellow' as AccentColor,
          surface: 'cream' as SurfaceStyle,
          radius: 0,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
          id: 'dark-souls',
          name: t('settings.appearance.themes.darkSouls.name'),
          description: t('settings.appearance.themes.darkSouls.description'),
          accent: 'crimson' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'dead-space',
          name: t('settings.appearance.themes.deadSpace.name'),
          description: t('settings.appearance.themes.deadSpace.description'),
          accent: 'crimson' as AccentColor,
          surface: 'pitch' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
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
          secondaryAccent: 'plum' as AccentColor,
          surface: 'midnight' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'default-theme',
          name: t('settings.appearance.themes.defaultTheme.name'),
          description: t('settings.appearance.themes.defaultTheme.description'),
        accent: 'pure' as AccentColor,
        surface: 'default' as SurfaceStyle,
        radius: 15 / 16, // 15px
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'destiny',
          name: t('settings.appearance.themes.destiny.name'),
          description: t('settings.appearance.themes.destiny.description'),
          accent: 'purple' as AccentColor,
          surface: 'cosmos' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'doom-eternal',
          name: t('settings.appearance.themes.doomEternal.name'),
          description: t('settings.appearance.themes.doomEternal.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'wine' as AccentColor,
          tertiaryAccent: 'maroon' as AccentColor,
          surface: 'abyss' as SurfaceStyle,
          radius: 0.5,
          typography: 'compact' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 0.95,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
          id: 'dota',
        name: t('settings.appearance.themes.dota.name'),
        description: t('settings.appearance.themes.dota.description'),
        accent: 'sapphire' as AccentColor,
        secondaryAccent: 'crimson' as AccentColor,
        tertiaryAccent: 'royal' as AccentColor,
        surface: 'dota' as SurfaceStyle,
        radius: 1,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'elden-ring',
          name: t('settings.appearance.themes.eldenRing.name'),
          description: t('settings.appearance.themes.eldenRing.description'),
          accent: 'gold' as AccentColor,
          secondaryAccent: 'amber' as AccentColor,
          surface: 'ember' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'fallout',
          name: t('settings.appearance.themes.fallout.name'),
          description: t('settings.appearance.themes.fallout.description'),
          accent: 'lime' as AccentColor,
          surface: 'storm' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'forest-green',
          name: t('settings.appearance.themes.forestGreen.name'),
          description: t('settings.appearance.themes.forestGreen.description'),
        accent: 'jade' as AccentColor,
          secondaryAccent: 'moss-green' as AccentColor,
          tertiaryAccent: 'chartreuse' as AccentColor,
        surface: 'jungle' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'fortnite',
        name: t('settings.appearance.themes.fortnite.name'),
        description: t('settings.appearance.themes.fortnite.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-cyan' as AccentColor,
        tertiaryAccent: 'periwinkle' as AccentColor,
        surface: 'laser' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'geometry-dash',
        name: t('settings.appearance.themes.geometryDash.name'),
        description: t('settings.appearance.themes.geometryDash.description'),
        accent: 'neon-green' as AccentColor,
        secondaryAccent: 'neon-cyan' as AccentColor,
        tertiaryAccent: 'chartreuse' as AccentColor,
        surface: 'geometrydash' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
        id: 'graphite-minimal',
        name: t('settings.appearance.themes.graphiteMinimal.name'),
        description: t('settings.appearance.themes.graphiteMinimal.description'),
        accent: 'graphite' as AccentColor,
        surface: 'charcoal' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'half-life',
          name: t('settings.appearance.themes.halfLife.name'),
          description: t('settings.appearance.themes.halfLife.description'),
          accent: 'orange' as AccentColor,
          surface: 'charcoal' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'hollow-knight',
          name: t('settings.appearance.themes.hollowKnight.name'),
          description: t('settings.appearance.themes.hollowKnight.description'),
          accent: 'violet' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'honey-gold',
        name: t('settings.appearance.themes.honeyGold.name'),
        description: t('settings.appearance.themes.honeyGold.description'),
        accent: 'honey' as AccentColor,
        surface: 'sunset' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'iron-strong',
        name: t('settings.appearance.themes.ironStrong.name'),
        description: t('settings.appearance.themes.ironStrong.description'),
        accent: 'iron' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'jade-luxury',
        name: t('settings.appearance.themes.jadeLuxury.name'),
        description: t('settings.appearance.themes.jadeLuxury.description'),
        accent: 'jade' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'khaki-outdoor',
        name: t('settings.appearance.themes.khakiOutdoor.name'),
        description: t('settings.appearance.themes.khakiOutdoor.description'),
        accent: 'khaki' as AccentColor,
        surface: 'moss' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lavender-dreams',
        name: t('settings.appearance.themes.lavenderDreams.name'),
        description: t('settings.appearance.themes.lavenderDreams.description'),
        accent: 'lavender' as AccentColor,
        surface: 'mist' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lavender-plum',
        name: t('settings.appearance.themes.lavenderPlum.name'),
        description: t('settings.appearance.themes.lavenderPlum.description'),
        accent: 'lavender' as AccentColor,
        secondaryAccent: 'plum' as AccentColor,
        surface: 'mist' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'league-of-legends',
          name: t('settings.appearance.themes.leagueOfLegends.name'),
          description: t('settings.appearance.themes.leagueOfLegends.description'),
          accent: 'blue' as AccentColor,
          secondaryAccent: 'gold' as AccentColor,
          surface: 'noir' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'left-4-dead',
          name: t('settings.appearance.themes.left4Dead.name'),
          description: t('settings.appearance.themes.left4Dead.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'orange' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'mass-effect',
          name: t('settings.appearance.themes.massEffect.name'),
          description: t('settings.appearance.themes.massEffect.description'),
          accent: 'royal' as AccentColor,
          secondaryAccent: 'periwinkle' as AccentColor,
          tertiaryAccent: 'amethyst' as AccentColor,
          surface: 'starlight' as SurfaceStyle,
          radius: 1,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1.05,
          depth: 'elevated' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'metro-exodus',
          name: t('settings.appearance.themes.metroExodus.name'),
          description: t('settings.appearance.themes.metroExodus.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'orange' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'metro-last-light',
          name: t('settings.appearance.themes.metroLastLight.name'),
          description: t('settings.appearance.themes.metroLastLight.description'),
          accent: 'vermillion' as AccentColor,
          secondaryAccent: 'rust' as AccentColor,
          surface: 'eclipse' as SurfaceStyle,
          radius: 0.5,
          typography: 'compact' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 0.95,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
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
          id: 'minecraft-classic',
          name: t('settings.appearance.themes.minecraftClassic.name'),
          description: t('settings.appearance.themes.minecraftClassic.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'brown' as AccentColor,
          surface: 'minecraft' as SurfaceStyle,
          radius: 0,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
          id: 'overwatch',
        name: t('settings.appearance.themes.overwatch.name'),
        description: t('settings.appearance.themes.overwatch.description'),
        accent: 'cerulean' as AccentColor,
        secondaryAccent: 'tangerine' as AccentColor,
        tertiaryAccent: 'aqua' as AccentColor,
        surface: 'nightfall' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        },
      {
          id: 'overwatch-2',
          name: t('settings.appearance.themes.overwatch2.name'),
          description: t('settings.appearance.themes.overwatch2.description'),
          accent: 'azure' as AccentColor,
          secondaryAccent: 'orange' as AccentColor,
          surface: 'nightfall' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'portal',
          name: t('settings.appearance.themes.portal.name'),
          description: t('settings.appearance.themes.portal.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'rainbow-six',
          name: t('settings.appearance.themes.rainbowSix.name'),
          description: t('settings.appearance.themes.rainbowSix.description'),
          accent: 'blue' as AccentColor,
          secondaryAccent: 'amber' as AccentColor,
          surface: 'slate' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'rust-natural',
        name: t('settings.appearance.themes.rustNatural.name'),
        description: t('settings.appearance.themes.rustNatural.description'),
        accent: 'rust' as AccentColor,
        surface: 'canyon' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'stardew-valley',
          name: t('settings.appearance.themes.stardewValley.name'),
          description: t('settings.appearance.themes.stardewValley.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'brown' as AccentColor,
          surface: 'moss' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'terraria',
        name: t('settings.appearance.themes.terraria.name'),
        description: t('settings.appearance.themes.terraria.description'),
        accent: 'copper' as AccentColor,
        secondaryAccent: 'honey' as AccentColor,
        tertiaryAccent: 'rust' as AccentColor,
        surface: 'terraria' as SurfaceStyle,
        radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.05,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
        }
    
    
    ],
    extraordinary: [
      {
        id: 'luxury-gold',
        name: t('settings.appearance.themes.luxuryGold.name'),
        description: t('settings.appearance.themes.luxuryGold.description'),
        accent: 'gold' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'mauve-elegance',
        name: t('settings.appearance.themes.mauveElegance.name'),
        description: t('settings.appearance.themes.mauveElegance.description'),
        accent: 'mauve' as AccentColor,
        secondaryAccent: 'pink' as AccentColor,
        surface: 'solstice' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'mirrors-edge',
          name: t('settings.appearance.themes.mirrorsEdge.name'),
          description: t('settings.appearance.themes.mirrorsEdge.description'),
          accent: 'red' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 0,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'flat' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'olive-nature',
        name: t('settings.appearance.themes.oliveNature.name'),
        description: t('settings.appearance.themes.oliveNature.description'),
        accent: 'olive' as AccentColor,
        surface: 'terracotta' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'orchid-elegance',
        name: t('settings.appearance.themes.orchidElegance.name'),
        description: t('settings.appearance.themes.orchidElegance.description'),
        accent: 'wisteria' as AccentColor,
        secondaryAccent: 'lilac' as AccentColor,
        tertiaryAccent: 'mauve' as AccentColor,
        surface: 'velvet' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'orchid-violet',
        name: t('settings.appearance.themes.orchidViolet.name'),
        description: t('settings.appearance.themes.orchidViolet.description'),
        accent: 'orchid' as AccentColor,
        secondaryAccent: 'violet' as AccentColor,
        surface: 'aurora' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'ori',
          name: t('settings.appearance.themes.ori.name'),
          description: t('settings.appearance.themes.ori.description'),
          accent: 'emerald' as AccentColor,
          secondaryAccent: 'cyan' as AccentColor,
          surface: 'moss' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'peach-blossom',
        name: t('settings.appearance.themes.peachBlossom.name'),
        description: t('settings.appearance.themes.peachBlossom.description'),
        accent: 'peach' as AccentColor,
        surface: 'cream' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'periwinkle-dream',
        name: t('settings.appearance.themes.periwinkleDream.name'),
        description: t('settings.appearance.themes.periwinkleDream.description'),
        accent: 'periwinkle' as AccentColor,
        surface: 'nebula' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'pokemon',
        name: t('settings.appearance.themes.pokemon.name'),
        description: t('settings.appearance.themes.pokemon.description'),
        accent: 'canary' as AccentColor,
        secondaryAccent: 'sapphire' as AccentColor,
        tertiaryAccent: 'lemon' as AccentColor,
        surface: 'meadow' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'predator',
          name: t('settings.appearance.themes.predator.name'),
          description: t('settings.appearance.themes.predator.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'emerald' as AccentColor,
          surface: 'moss' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'rose-garden',
        name: t('settings.appearance.themes.roseGarden.name'),
        description: t('settings.appearance.themes.roseGarden.description'),
        accent: 'rose' as AccentColor,
        surface: 'pearl' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'rose-gold',
        name: t('settings.appearance.themes.roseGold.name'),
        description: t('settings.appearance.themes.roseGold.description'),
        accent: 'rose' as AccentColor,
        secondaryAccent: 'gold' as AccentColor,
        surface: 'pearl' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'royal-elegance',
        name: t('settings.appearance.themes.royalElegance.name'),
        description: t('settings.appearance.themes.royalElegance.description'),
        accent: 'royal' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'ruby-dawn',
        name: t('settings.appearance.themes.rubyDawn.name'),
        description: t('settings.appearance.themes.rubyDawn.description'),
        accent: 'ruby' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'saffron-gold',
        name: t('settings.appearance.themes.saffronGold.name'),
        description: t('settings.appearance.themes.saffronGold.description'),
        accent: 'honey' as AccentColor,
        secondaryAccent: 'butter' as AccentColor,
        tertiaryAccent: 'canary' as AccentColor,
        surface: 'candlelight' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'sage-wisdom',
        name: t('settings.appearance.themes.sageWisdom.name'),
        description: t('settings.appearance.themes.sageWisdom.description'),
        accent: 'sage' as AccentColor,
        surface: 'moss' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'scarlet-fire',
        name: t('settings.appearance.themes.scarletFire.name'),
        description: t('settings.appearance.themes.scarletFire.description'),
        accent: 'scarlet' as AccentColor,
        surface: 'ember' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'scp',
          name: t('settings.appearance.themes.scp.name'),
          description: t('settings.appearance.themes.scp.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'wine' as AccentColor,
          tertiaryAccent: 'maroon' as AccentColor,
          surface: 'abyss' as SurfaceStyle,
          radius: 0.5,
          typography: 'compact' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 0.95,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
        id: 'seafoam-emerald',
        name: t('settings.appearance.themes.seafoamEmerald.name'),
        description: t('settings.appearance.themes.seafoamEmerald.description'),
        accent: 'seafoam' as AccentColor,
        secondaryAccent: 'emerald' as AccentColor,
        surface: 'zenith' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'seafoam-serene',
        name: t('settings.appearance.themes.seafoamSerene.name'),
        description: t('settings.appearance.themes.seafoamSerene.description'),
        accent: 'aqua' as AccentColor,
        secondaryAccent: 'turquoise' as AccentColor,
        surface: 'river' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.05,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
          id: 'sekiro',
          name: t('settings.appearance.themes.sekiro.name'),
          description: t('settings.appearance.themes.sekiro.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'gold' as AccentColor,
          surface: 'obsidian' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'sky-open',
        name: t('settings.appearance.themes.skyOpen.name'),
        description: t('settings.appearance.themes.skyOpen.description'),
        accent: 'sky' as AccentColor,
        surface: 'cloud' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
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
        id: 'star-wars',
        name: t('settings.appearance.themes.starWars.name'),
        description: t('settings.appearance.themes.starWars.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'red' as AccentColor,
        surface: 'cosmos' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'starbucks',
        name: t('settings.appearance.themes.starbucks.name'),
        description: t('settings.appearance.themes.starbucks.description'),
        accent: 'emerald' as AccentColor,
        surface: 'cream' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'tan-comfort',
        name: t('settings.appearance.themes.tanComfort.name'),
        description: t('settings.appearance.themes.tanComfort.description'),
        accent: 'tan' as AccentColor,
        surface: 'sand' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'team-fortress',
          name: t('settings.appearance.themes.teamFortress.name'),
          description: t('settings.appearance.themes.teamFortress.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'blue' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 0.5,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'titanfall',
          name: t('settings.appearance.themes.titanfall.name'),
          description: t('settings.appearance.themes.titanfall.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'blue' as AccentColor,
          surface: 'void' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
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
          secondaryAccent: 'amber' as AccentColor,
          surface: 'sand' as SurfaceStyle,
          radius: 1,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'turquoise-azure',
        name: t('settings.appearance.themes.turquoiseAzure.name'),
        description: t('settings.appearance.themes.turquoiseAzure.description'),
        accent: 'turquoise' as AccentColor,
        secondaryAccent: 'azure' as AccentColor,
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
        id: 'turquoise-waves',
        name: t('settings.appearance.themes.turquoiseWaves.name'),
        description: t('settings.appearance.themes.turquoiseWaves.description'),
        accent: 'turquoise' as AccentColor,
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
          id: 'undertale',
          name: t('settings.appearance.themes.undertale.name'),
          description: t('settings.appearance.themes.undertale.description'),
          accent: 'yellow' as AccentColor,
          secondaryAccent: 'blue' as AccentColor,
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
          id: 'ussr',
          name: t('settings.appearance.themes.ussr.name'),
          description: t('settings.appearance.themes.ussr.description'),
          accent: 'crimson' as AccentColor,
          secondaryAccent: 'honey' as AccentColor,
          tertiaryAccent: 'butter' as AccentColor,
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
        id: 'vanilla-sweet',
        name: t('settings.appearance.themes.vanillaSweet.name'),
        description: t('settings.appearance.themes.vanillaSweet.description'),
        accent: 'vanilla' as AccentColor,
        surface: 'ivory' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'visa',
        name: t('settings.appearance.themes.visa.name'),
        description: t('settings.appearance.themes.visa.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'gold' as AccentColor,
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
          id: 'war-thunder',
          name: t('settings.appearance.themes.warThunder.name'),
          description: t('settings.appearance.themes.warThunder.description'),
          accent: 'blue' as AccentColor,
          secondaryAccent: 'cobalt' as AccentColor,
          surface: 'slate' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
          id: 'warhammer',
          name: t('settings.appearance.themes.warhammer.name'),
          description: t('settings.appearance.themes.warhammer.description'),
          accent: 'red' as AccentColor,
          secondaryAccent: 'gold' as AccentColor,
          surface: 'obsidian' as SurfaceStyle,
          radius: 0.75,
          typography: 'default' as TypographyScale,
          contrast: 'bold' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        }
    
    
    ],
        nature: [
      {
        id: 'forest-dawn',
        name: t('settings.appearance.themes.forestDawn.name'),
        description: t('settings.appearance.themes.forestDawn.description'),
        accent: 'jade' as AccentColor,
        secondaryAccent: 'moss-green' as AccentColor,
        tertiaryAccent: 'chartreuse' as AccentColor,
        surface: 'jungle' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'ocean-depths',
        name: t('settings.appearance.themes.oceanDepths.name'),
        description: t('settings.appearance.themes.oceanDepths.description'),
        accent: 'sapphire' as AccentColor,
        secondaryAccent: 'cerulean' as AccentColor,
        tertiaryAccent: 'aqua' as AccentColor,
        surface: 'lake' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'sunset-beach',
        name: t('settings.appearance.themes.sunsetBeach.name'),
        description: t('settings.appearance.themes.sunsetBeach.description'),
        accent: 'tangerine' as AccentColor,
        secondaryAccent: 'apricot' as AccentColor,
        tertiaryAccent: 'honey' as AccentColor,
        surface: 'beach' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'mountain-peak',
        name: t('settings.appearance.themes.mountainPeak.name'),
        description: t('settings.appearance.themes.mountainPeak.description'),
        accent: 'cerulean' as AccentColor,
        secondaryAccent: 'aqua' as AccentColor,
        tertiaryAccent: 'periwinkle' as AccentColor,
        surface: 'mountain' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'autumn-leaves',
        name: t('settings.appearance.themes.autumnLeaves.name'),
        description: t('settings.appearance.themes.autumnLeaves.description'),
        accent: 'vermillion' as AccentColor,
        secondaryAccent: 'rust' as AccentColor,
        tertiaryAccent: 'copper' as AccentColor,
        surface: 'valley' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'spring-bloom',
        name: t('settings.appearance.themes.springBloom.name'),
        description: t('settings.appearance.themes.springBloom.description'),
        accent: 'emerald' as AccentColor,
        secondaryAccent: 'pink' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'winter-frost',
        name: t('settings.appearance.themes.winterFrost.name'),
        description: t('settings.appearance.themes.winterFrost.description'),
        accent: 'azure' as AccentColor,
        secondaryAccent: 'silver' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'tropical-paradise',
        name: t('settings.appearance.themes.tropicalParadise.name'),
        description: t('settings.appearance.themes.tropicalParadise.description'),
        accent: 'turquoise' as AccentColor,
        secondaryAccent: 'coral' as AccentColor,
        surface: 'tropical' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'wood-natural',
        name: t('settings.appearance.themes.woodNatural.name'),
        description: t('settings.appearance.themes.woodNatural.description'),
        accent: 'brown' as AccentColor,
        surface: 'wood' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lemon-fresh',
        name: t('settings.appearance.themes.lemonFresh.name'),
        description: t('settings.appearance.themes.lemonFresh.description'),
        accent: 'lemon' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lilac-spring',
        name: t('settings.appearance.themes.lilacSpring.name'),
        description: t('settings.appearance.themes.lilacSpring.description'),
        accent: 'lilac' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lime-cyan',
        name: t('settings.appearance.themes.limeCyan.name'),
        description: t('settings.appearance.themes.limeCyan.description'),
        accent: 'lime' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor,
        surface: 'glacier' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'lime-fresh',
        name: t('settings.appearance.themes.limeFresh.name'),
        description: t('settings.appearance.themes.limeFresh.description'),
        accent: 'lime' as AccentColor,
        surface: 'glacier' as SurfaceStyle,
        radius: 1,
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
        accent: 'sapphire' as AccentColor,
        secondaryAccent: 'cerulean' as AccentColor,
        tertiaryAccent: 'periwinkle' as AccentColor,
        surface: 'nightfall' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'mint-breeze',
        name: t('settings.appearance.themes.mintBreeze.name'),
        description: t('settings.appearance.themes.mintBreeze.description'),
        accent: 'mint' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'mint-teal',
        name: t('settings.appearance.themes.mintTeal.name'),
        description: t('settings.appearance.themes.mintTeal.description'),
        accent: 'mint' as AccentColor,
        secondaryAccent: 'teal' as AccentColor,
        surface: 'lumen' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'ocean-breeze',
          name: t('settings.appearance.themes.oceanBreeze.name'),
          description: t('settings.appearance.themes.oceanBreeze.description'),
          accent: 'aqua' as AccentColor,
          secondaryAccent: 'cerulean' as AccentColor,
          tertiaryAccent: 'turquoise' as AccentColor,
          surface: 'lake' as SurfaceStyle,
          radius: 1.25,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1.05,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'ocean-deep',
        name: t('settings.appearance.themes.oceanDeep.name'),
        description: t('settings.appearance.themes.oceanDeep.description'),
        accent: 'ocean' as AccentColor,
        surface: 'abyss' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
            {
        id: 'sage-forest',
        name: t('settings.appearance.themes.sageForest.name'),
        description: t('settings.appearance.themes.sageForest.description'),
        accent: 'sage' as AccentColor,
        secondaryAccent: 'forest' as AccentColor,
        surface: 'moss' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'salmon-sunset',
        name: t('settings.appearance.themes.salmonSunset.name'),
        description: t('settings.appearance.themes.salmonSunset.description'),
        accent: 'salmon' as AccentColor,
        surface: 'canyon' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'sunset-warm',
          name: t('settings.appearance.themes.sunsetWarm.name'),
          description: t('settings.appearance.themes.sunsetWarm.description'),
        accent: 'tangerine' as AccentColor,
          secondaryAccent: 'apricot' as AccentColor,
          tertiaryAccent: 'honey' as AccentColor,
        surface: 'firelight' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'wisteria-calm',
        name: t('settings.appearance.themes.wisteriaCalm.name'),
        description: t('settings.appearance.themes.wisteriaCalm.description'),
        accent: 'wisteria' as AccentColor,
        surface: 'aurora' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    corporate: [
      {
        id: 'ibm',
        name: t('settings.appearance.themes.ibm.name'),
        description: t('settings.appearance.themes.ibm.description'),
        accent: 'sapphire' as AccentColor,
        secondaryAccent: 'cerulean' as AccentColor,
        tertiaryAccent: 'steel' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'oracle',
        name: t('settings.appearance.themes.oracle.name'),
        description: t('settings.appearance.themes.oracle.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'wine' as AccentColor,
        tertiaryAccent: 'platinum' as AccentColor,
        surface: 'cloud' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'adobe',
        name: t('settings.appearance.themes.adobe.name'),
        description: t('settings.appearance.themes.adobe.description'),
        accent: 'vermillion' as AccentColor,
        secondaryAccent: 'rust' as AccentColor,
        tertiaryAccent: 'titanium' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'salesforce',
        name: t('settings.appearance.themes.salesforce.name'),
        description: t('settings.appearance.themes.salesforce.description'),
        accent: 'blue' as AccentColor,
        surface: 'cloud' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'paypal',
        name: t('settings.appearance.themes.paypal.name'),
        description: t('settings.appearance.themes.paypal.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'indigo' as AccentColor,
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
        id: 'microsoft',
        name: t('settings.appearance.themes.microsoft.name'),
        description: t('settings.appearance.themes.microsoft.description'),
        accent: 'blue' as AccentColor,
        surface: 'cloud' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'google',
        name: t('settings.appearance.themes.google.name'),
        description: t('settings.appearance.themes.google.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'red' as AccentColor,
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
          id: 'apple-inc',
          name: t('settings.appearance.themes.appleInc.name'),
          description: t('settings.appearance.themes.appleInc.description'),
          accent: 'platinum' as AccentColor,
          secondaryAccent: 'titanium' as AccentColor,
          tertiaryAccent: 'steel' as AccentColor,
          surface: 'snow' as SurfaceStyle,
          radius: 1.25,
          typography: 'default' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 0.95,
          depth: 'flat' as DepthStyle,
          motion: 'reduced' as MotionPreference,
          official: true,
        },
      {
        id: 'tesla',
        name: t('settings.appearance.themes.tesla.name'),
        description: t('settings.appearance.themes.tesla.description'),
        accent: 'red' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'nasa',
        name: t('settings.appearance.themes.nasa.name'),
        description: t('settings.appearance.themes.nasa.description'),
        accent: 'blue' as AccentColor,
        surface: 'cosmos' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'amazon',
        name: t('settings.appearance.themes.amazon.name'),
        description: t('settings.appearance.themes.amazon.description'),
        accent: 'orange' as AccentColor,
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
        id: 'twitter',
        name: t('settings.appearance.themes.twitter.name'),
        description: t('settings.appearance.themes.twitter.description'),
        accent: 'sky' as AccentColor,
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
        id: 'instagram',
        name: t('settings.appearance.themes.instagram.name'),
        description: t('settings.appearance.themes.instagram.description'),
        accent: 'purple' as AccentColor,
        secondaryAccent: 'pink' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'youtube',
        name: t('settings.appearance.themes.youtube.name'),
        description: t('settings.appearance.themes.youtube.description'),
        accent: 'red' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'github',
        name: t('settings.appearance.themes.github.name'),
        description: t('settings.appearance.themes.github.description'),
        accent: 'emerald' as AccentColor,
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
        id: 'discord',
        name: t('settings.appearance.themes.discord.name'),
        description: t('settings.appearance.themes.discord.description'),
        accent: 'indigo' as AccentColor,
        surface: 'void' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
          id: 'aliexpress',
          name: t('settings.appearance.themes.aliexpress.name'),
          description: t('settings.appearance.themes.aliexpress.description'),
          accent: 'orange' as AccentColor,
          secondaryAccent: 'red' as AccentColor,
          surface: 'daylight' as SurfaceStyle,
          radius: 0.75,
          typography: 'comfortable' as TypographyScale,
          contrast: 'standard' as ContrastMode,
          density: 1,
          depth: 'soft' as DepthStyle,
          motion: 'default' as MotionPreference,
          official: true,
        },
      {
        id: 'mastercard',
        name: t('settings.appearance.themes.mastercard.name'),
        description: t('settings.appearance.themes.mastercard.description'),
        accent: 'red' as AccentColor,
        secondaryAccent: 'orange' as AccentColor,
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
        id: 'mcdonalds',
        name: t('settings.appearance.themes.mcdonalds.name'),
        description: t('settings.appearance.themes.mcdonalds.description'),
        accent: 'gold' as AccentColor,
        secondaryAccent: 'red' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.75,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'netflix',
        name: t('settings.appearance.themes.netflix.name'),
        description: t('settings.appearance.themes.netflix.description'),
        accent: 'red' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'sapphire-prestige',
        name: t('settings.appearance.themes.sapphirePrestige.name'),
        description: t('settings.appearance.themes.sapphirePrestige.description'),
        accent: 'sapphire' as AccentColor,
        surface: 'midnight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'spotify',
        name: t('settings.appearance.themes.spotify.name'),
        description: t('settings.appearance.themes.spotify.description'),
        accent: 'lime' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    retro: [
      {
        id: '80s-neon',
        name: t('settings.appearance.themes.eightiesNeon.name'),
        description: t('settings.appearance.themes.eightiesNeon.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-cyan' as AccentColor,
        tertiaryAccent: 'neon-blue' as AccentColor,
        surface: 'matrix' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'vaporwave',
        name: t('settings.appearance.themes.vaporwave.name'),
        description: t('settings.appearance.themes.vaporwave.description'),
        accent: 'pastel-pink' as AccentColor,
        secondaryAccent: 'aqua' as AccentColor,
        tertiaryAccent: 'periwinkle' as AccentColor,
        surface: 'laser' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'synthwave',
        name: t('settings.appearance.themes.synthwave.name'),
        description: t('settings.appearance.themes.synthwave.description'),
        accent: 'tangerine' as AccentColor,
        secondaryAccent: 'amethyst' as AccentColor,
        tertiaryAccent: 'wisteria' as AccentColor,
        surface: 'plasma' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'retro-gaming',
        name: t('settings.appearance.themes.retroGaming.name'),
        description: t('settings.appearance.themes.retroGaming.description'),
        accent: 'neon-green' as AccentColor,
        secondaryAccent: 'neon-pink' as AccentColor,
        tertiaryAccent: 'neon-cyan' as AccentColor,
        surface: 'matrix' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'marble-elegance',
        name: t('settings.appearance.themes.marbleElegance.name'),
        description: t('settings.appearance.themes.marbleElegance.description'),
        accent: 'graphite' as AccentColor,
        surface: 'marble' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
    ],
    creative: [
      {
        id: 'artistic-vision',
        name: t('settings.appearance.themes.artisticVision.name'),
        description: t('settings.appearance.themes.artisticVision.description'),
        accent: 'amethyst' as AccentColor,
        secondaryAccent: 'orchid' as AccentColor,
        tertiaryAccent: 'lavender' as AccentColor,
        surface: 'gallery' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'colorful-canvas',
        name: t('settings.appearance.themes.colorfulCanvas.name'),
        description: t('settings.appearance.themes.colorfulCanvas.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-cyan' as AccentColor,
        tertiaryAccent: 'neon-yellow' as AccentColor,
        surface: 'artistic-creative' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'design-studio',
        name: t('settings.appearance.themes.designStudio.name'),
        description: t('settings.appearance.themes.designStudio.description'),
        accent: 'cerulean' as AccentColor,
        secondaryAccent: 'aqua' as AccentColor,
        surface: 'studio' as SurfaceStyle,
        radius: 1,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'creative-spark',
        name: t('settings.appearance.themes.creativeSpark.name'),
        description: t('settings.appearance.themes.creativeSpark.description'),
        accent: 'fuchsia' as AccentColor,
        secondaryAccent: 'magenta' as AccentColor,
        tertiaryAccent: 'violet' as AccentColor,
        surface: 'aurora' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'pastel-dreams',
        name: t('settings.appearance.themes.pastelDreams.name'),
        description: t('settings.appearance.themes.pastelDreams.description'),
        accent: 'pastel-pink' as AccentColor,
        secondaryAccent: 'pastel-blue' as AccentColor,
        tertiaryAccent: 'pastel-purple' as AccentColor,
        surface: 'cloud' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.1,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      }
    
    ],
    professional: [
      {
        id: 'executive-suite',
        name: t('settings.appearance.themes.executiveSuite.name'),
        description: t('settings.appearance.themes.executiveSuite.description'),
        accent: 'navy' as AccentColor,
        secondaryAccent: 'sapphire' as AccentColor,
        surface: 'premium' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.95,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'corporate-power',
        name: t('settings.appearance.themes.corporatePower.name'),
        description: t('settings.appearance.themes.corporatePower.description'),
        accent: 'graphite' as AccentColor,
        secondaryAccent: 'steel' as AccentColor,
        tertiaryAccent: 'iron' as AccentColor,
        surface: 'professional-corporate' as SurfaceStyle,
        radius: 0.5,
        typography: 'compact' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.9,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'business-class',
        name: t('settings.appearance.themes.businessClass.name'),
        description: t('settings.appearance.themes.businessClass.description'),
        accent: 'royal' as AccentColor,
        secondaryAccent: 'platinum' as AccentColor,
        surface: 'elegant' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'boardroom',
        name: t('settings.appearance.themes.boardroom.name'),
        description: t('settings.appearance.themes.boardroom.description'),
        accent: 'charcoal' as AccentColor,
        secondaryAccent: 'slate' as AccentColor,
        surface: 'sophisticated' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'prestige',
        name: t('settings.appearance.themes.prestige.name'),
        description: t('settings.appearance.themes.prestige.description'),
        accent: 'gold' as AccentColor,
        secondaryAccent: 'champagne' as AccentColor,
        surface: 'luxury' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'enterprise',
        name: t('settings.appearance.themes.enterprise.name'),
        description: t('settings.appearance.themes.enterprise.description'),
        accent: 'cobalt' as AccentColor,
        secondaryAccent: 'azure' as AccentColor,
        surface: 'city' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
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
        id: 'navy-professional',
        name: t('settings.appearance.themes.navyProfessional.name'),
        description: t('settings.appearance.themes.navyProfessional.description'),
        accent: 'navy' as AccentColor,
        surface: 'slate' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'platinum-modern',
        name: t('settings.appearance.themes.platinumModern.name'),
        description: t('settings.appearance.themes.platinumModern.description'),
        accent: 'platinum' as AccentColor,
        surface: 'moonlight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'silver-modern',
        name: t('settings.appearance.themes.silverModern.name'),
        description: t('settings.appearance.themes.silverModern.description'),
        accent: 'silver' as AccentColor,
        surface: 'ash' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'steel-professional',
        name: t('settings.appearance.themes.steelProfessional.name'),
        description: t('settings.appearance.themes.steelProfessional.description'),
        accent: 'steel' as AccentColor,
        surface: 'mist' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'titanium-tech',
        name: t('settings.appearance.themes.titaniumTech.name'),
        description: t('settings.appearance.themes.titaniumTech.description'),
        accent: 'titanium' as AccentColor,
        surface: 'noir' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    minimalist: [
      {
        id: 'pure-minimal',
        name: t('settings.appearance.themes.pureMinimal.name'),
        description: t('settings.appearance.themes.pureMinimal.description'),
        accent: 'pure' as AccentColor,
        surface: 'snow' as SurfaceStyle,
        radius: 0.5,
        typography: 'compact' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.9,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'clean-slate',
        name: t('settings.appearance.themes.cleanSlate.name'),
        description: t('settings.appearance.themes.cleanSlate.description'),
        accent: 'graphite' as AccentColor,
        surface: 'ivory' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'essence',
        name: t('settings.appearance.themes.essence.name'),
        description: t('settings.appearance.themes.essence.description'),
        accent: 'mono' as AccentColor,
        surface: 'minimal-clean' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.85,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'breath',
        name: t('settings.appearance.themes.breath.name'),
        description: t('settings.appearance.themes.breath.description'),
        accent: 'silver' as AccentColor,
        surface: 'pearl' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.05,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'void-minimal',
        name: t('settings.appearance.themes.voidMinimal.name'),
        description: t('settings.appearance.themes.voidMinimal.description'),
        accent: 'pure' as AccentColor,
        surface: 'void' as SurfaceStyle,
        radius: 0.5,
        typography: 'compact' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 0.9,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      }
    
    
    ],
    vibrant: [
      {
        id: 'neon-explosion',
        name: t('settings.appearance.themes.neonExplosion.name'),
        description: t('settings.appearance.themes.neonExplosion.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-green' as AccentColor,
        tertiaryAccent: 'neon-blue' as AccentColor,
        surface: 'neon' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.15,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'electric-vibe',
        name: t('settings.appearance.themes.electricVibe.name'),
        description: t('settings.appearance.themes.electricVibe.description'),
        accent: 'neon-cyan' as AccentColor,
        secondaryAccent: 'neon-yellow' as AccentColor,
        surface: 'laser' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'rainbow-burst',
        name: t('settings.appearance.themes.rainbowBurst.name'),
        description: t('settings.appearance.themes.rainbowBurst.description'),
        accent: 'fuchsia' as AccentColor,
        secondaryAccent: 'lime' as AccentColor,
        tertiaryAccent: 'cyan' as AccentColor,
        surface: 'colorful-rainbow' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.15,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'sunset-fury',
        name: t('settings.appearance.themes.sunsetFury.name'),
        description: t('settings.appearance.themes.sunsetFury.description'),
        accent: 'vermillion' as AccentColor,
        secondaryAccent: 'tangerine' as AccentColor,
        tertiaryAccent: 'canary' as AccentColor,
        surface: 'firelight' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'plasma-core',
        name: t('settings.appearance.themes.plasmaCore.name'),
        description: t('settings.appearance.themes.plasmaCore.description'),
        accent: 'neon-purple' as AccentColor,
        secondaryAccent: 'neon-orange' as AccentColor,
        surface: 'plasma' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'energy-rush',
        name: t('settings.appearance.themes.energyRush.name'),
        description: t('settings.appearance.themes.energyRush.description'),
        accent: 'chartreuse' as AccentColor,
        secondaryAccent: 'lime' as AccentColor,
        tertiaryAccent: 'neon-green' as AccentColor,
        surface: 'energetic-vibrant' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.15,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    aesthetic: [
      {
        id: 'muted-90s',
        name: t('settings.appearance.themes.muted90s.name'),
        description: t('settings.appearance.themes.muted90s.description'),
        accent: 'rust' as AccentColor,
        secondaryAccent: 'khaki' as AccentColor,
        surface: '90s-muted' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'dispatch',
        name: t('settings.appearance.themes.dispatch.name'),
        description: t('settings.appearance.themes.dispatch.description'),
        accent: 'dispatch-blue' as AccentColor,
        secondaryAccent: 'azure' as AccentColor,
        tertiaryAccent: 'cyan' as AccentColor,
        surface: 'dispatch-modern' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'teardown',
        name: t('settings.appearance.themes.teardown.name'),
        description: t('settings.appearance.themes.teardown.description'),
        accent: 'copper' as AccentColor,
        secondaryAccent: 'rust' as AccentColor,
        surface: 'retro' as SurfaceStyle,
        radius: 0,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'towel',
        name: t('settings.appearance.themes.towel.name'),
        description: t('settings.appearance.themes.towel.description'),
        accent: 'beige' as AccentColor,
        secondaryAccent: 'vanilla' as AccentColor,
        surface: 'silk' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'shit',
        name: t('settings.appearance.themes.shit.name'),
        description: t('settings.appearance.themes.shit.description'),
        accent: 'rust' as AccentColor,
        secondaryAccent: 'copper' as AccentColor,
        surface: 'mahogany' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'luck',
        name: t('settings.appearance.themes.luck.name'),
        description: t('settings.appearance.themes.luck.description'),
        accent: 'chartreuse' as AccentColor,
        secondaryAccent: 'gold' as AccentColor,
        surface: 'starlight' as SurfaceStyle,
        radius: 1.25,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    anime: [
      {
        id: 'anime',
        name: t('settings.appearance.themes.anime.name'),
        description: t('settings.appearance.themes.anime.description'),
        accent: 'magenta' as AccentColor,
        secondaryAccent: 'fuchsia' as AccentColor,
        surface: 'twilight' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'berserk',
        name: t('settings.appearance.themes.berserk.name'),
        description: t('settings.appearance.themes.berserk.description'),
        accent: 'red' as AccentColor,
        secondaryAccent: 'crimson' as AccentColor,
        surface: 'obsidian' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'calamity',
        name: t('settings.appearance.themes.calamity.name'),
        description: t('settings.appearance.themes.calamity.description'),
        accent: 'violet' as AccentColor,
        secondaryAccent: 'magenta' as AccentColor,
        surface: 'cosmos' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
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
        secondaryAccent: 'yellow' as AccentColor,
        surface: 'void' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'demon-slayer',
        name: t('settings.appearance.themes.demonSlayer.name'),
        description: t('settings.appearance.themes.demonSlayer.description'),
        accent: 'azure' as AccentColor,
        secondaryAccent: 'crimson' as AccentColor,
        surface: 'nightfall' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'drums-of-liberation',
        name: t('settings.appearance.themes.drumsOfLiberation.name'),
        description: t('settings.appearance.themes.drumsOfLiberation.description'),
        accent: 'gold' as AccentColor,
        secondaryAccent: 'snow' as AccentColor,
        tertiaryAccent: 'cream' as AccentColor,
        surface: 'one-piece-white' as SurfaceStyle,
        radius: 1.5,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'enhanced' as MotionPreference,
        official: true,
      },
      {
        id: 'gear-5',
        name: t('settings.appearance.themes.gear5.name'),
        description: t('settings.appearance.themes.gear5.description'),
        accent: 'honey' as AccentColor,
        secondaryAccent: 'butter' as AccentColor,
        tertiaryAccent: 'canary' as AccentColor,
        surface: 'one-piece-joy' as SurfaceStyle,
        radius: 1,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'hunter-x-hunter',
        name: t('settings.appearance.themes.hunterXHunter.name'),
        description: t('settings.appearance.themes.hunterXHunter.description'),
        accent: 'azure' as AccentColor,
        secondaryAccent: 'emerald' as AccentColor,
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
        id: 'jujutsu-kaisen',
        name: t('settings.appearance.themes.jujutsuKaisen.name'),
        description: t('settings.appearance.themes.jujutsuKaisen.description'),
        accent: 'royal' as AccentColor,
        secondaryAccent: 'amethyst' as AccentColor,
        surface: 'jujutsu-kaisen' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
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
        id: 'one-piece',
        name: t('settings.appearance.themes.onePiece.name'),
        description: t('settings.appearance.themes.onePiece.description'),
        accent: 'blue' as AccentColor,
        secondaryAccent: 'red' as AccentColor,
        surface: 'harbor' as SurfaceStyle,
        radius: 1,
        typography: 'comfortable' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    ],
    horror: [
      {
        id: 'outlast',
        name: t('settings.appearance.themes.outlast.name'),
        description: t('settings.appearance.themes.outlast.description'),
        accent: 'crimson' as AccentColor,
        surface: 'outlast-horror' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'phasmophobia',
        name: t('settings.appearance.themes.phasmophobia.name'),
        description: t('settings.appearance.themes.phasmophobia.description'),
        accent: 'periwinkle' as AccentColor,
        secondaryAccent: 'amethyst' as AccentColor,
        surface: 'phasmophobia-eerie' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'standard' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'reduced' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-1',
        name: t('settings.appearance.themes.fnaf1.name'),
        description: t('settings.appearance.themes.fnaf1.description'),
        accent: 'vermillion' as AccentColor,
        secondaryAccent: 'tangerine' as AccentColor,
        tertiaryAccent: 'rust' as AccentColor,
        surface: 'midnight' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-2',
        name: t('settings.appearance.themes.fnaf2.name'),
        description: t('settings.appearance.themes.fnaf2.description'),
        accent: 'tangerine' as AccentColor,
        secondaryAccent: 'canary' as AccentColor,
        tertiaryAccent: 'amber' as AccentColor,
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
        id: 'fnaf-3',
        name: t('settings.appearance.themes.fnaf3.name'),
        description: t('settings.appearance.themes.fnaf3.description'),
        accent: 'jade' as AccentColor,
        secondaryAccent: 'chartreuse' as AccentColor,
        tertiaryAccent: 'emerald' as AccentColor,
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
        id: 'fnaf-4',
        name: t('settings.appearance.themes.fnaf4.name'),
        description: t('settings.appearance.themes.fnaf4.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'wine' as AccentColor,
        tertiaryAccent: 'rose' as AccentColor,
        surface: 'void' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-sister-location',
        name: t('settings.appearance.themes.fnafSisterLocation.name'),
        description: t('settings.appearance.themes.fnafSisterLocation.description'),
        accent: 'azure' as AccentColor,
        secondaryAccent: 'cerulean' as AccentColor,
        tertiaryAccent: 'sky' as AccentColor,
        surface: 'abyss' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-pizzeria-simulator',
        name: t('settings.appearance.themes.fnafPizzeriaSimulator.name'),
        description: t('settings.appearance.themes.fnafPizzeriaSimulator.description'),
        accent: 'amber' as AccentColor,
        secondaryAccent: 'honey' as AccentColor,
        tertiaryAccent: 'gold' as AccentColor,
        surface: 'pitch' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-ultimate-custom-night',
        name: t('settings.appearance.themes.fnafUltimateCustomNight.name'),
        description: t('settings.appearance.themes.fnafUltimateCustomNight.description'),
        accent: 'magenta' as AccentColor,
        secondaryAccent: 'fuchsia' as AccentColor,
        tertiaryAccent: 'rose' as AccentColor,
        surface: 'coal' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-help-wanted',
        name: t('settings.appearance.themes.fnafHelpWanted.name'),
        description: t('settings.appearance.themes.fnafHelpWanted.description'),
        accent: 'violet' as AccentColor,
        secondaryAccent: 'purple' as AccentColor,
        tertiaryAccent: 'lavender' as AccentColor,
        surface: 'jet' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-security-breach',
        name: t('settings.appearance.themes.fnafSecurityBreach.name'),
        description: t('settings.appearance.themes.fnafSecurityBreach.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-purple' as AccentColor,
        tertiaryAccent: 'neon-cyan' as AccentColor,
        surface: 'carbon' as SurfaceStyle,
        radius: 0.75,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'fnaf-ruin',
        name: t('settings.appearance.themes.fnafRuin.name'),
        description: t('settings.appearance.themes.fnafRuin.description'),
        accent: 'crimson' as AccentColor,
        secondaryAccent: 'rust' as AccentColor,
        tertiaryAccent: 'copper' as AccentColor,
        surface: 'nightfall' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    ],
    cyberpunk: [
      {
        id: 'cyberpunk',
        name: t('settings.appearance.themes.cyberpunk.name'),
        description: t('settings.appearance.themes.cyberpunk.description'),
        accent: 'neon-pink' as AccentColor,
        secondaryAccent: 'neon-blue' as AccentColor,
        tertiaryAccent: 'neon-cyan' as AccentColor,
        surface: 'cyber' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1.05,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'cyberpunk-2077',
        name: t('settings.appearance.themes.cyberpunk2077.name'),
        description: t('settings.appearance.themes.cyberpunk2077.description'),
        accent: 'fuchsia' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor,
        surface: 'cyberpunk' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'neon-cyberpunk',
        name: t('settings.appearance.themes.neonCyberpunk.name'),
        description: t('settings.appearance.themes.neonCyberpunk.description'),
        accent: 'fuchsia' as AccentColor,
        secondaryAccent: 'cyan' as AccentColor,
        tertiaryAccent: 'neon-purple' as AccentColor,
        surface: 'cyber' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'elevated' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'blade-runner',
        name: t('settings.appearance.themes.bladeRunner.name'),
        description: t('settings.appearance.themes.bladeRunner.description'),
        accent: 'crimson' as AccentColor,
        surface: 'void' as SurfaceStyle,
        radius: 0.5,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'soft' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'matrix',
        name: t('settings.appearance.themes.matrix.name'),
        description: t('settings.appearance.themes.matrix.description'),
        accent: 'lime' as AccentColor,
        surface: 'noir' as SurfaceStyle,
        radius: 0,
        typography: 'default' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 1,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    ],
    programming: [
      {
        id: 'pip-boy',
        name: t('settings.appearance.themes.pipBoy.name'),
        description: t('settings.appearance.themes.pipBoy.description'),
        accent: 'chartreuse' as AccentColor,
        surface: 'programming-terminal' as SurfaceStyle,
        radius: 0,
        typography: 'compact' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.9,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      },
      {
        id: 'programming',
        name: t('settings.appearance.themes.programming.name'),
        description: t('settings.appearance.themes.programming.description'),
        accent: 'cyan' as AccentColor,
        secondaryAccent: 'azure' as AccentColor,
        surface: 'noir' as SurfaceStyle,
        radius: 0.5,
        typography: 'compact' as TypographyScale,
        contrast: 'bold' as ContrastMode,
        density: 0.95,
        depth: 'flat' as DepthStyle,
        motion: 'default' as MotionPreference,
        official: true,
      }
    
    
    ],
    }),
    [t]
  )

  // Flatten official themes for compatibility
  const officialThemes = useMemo(
    () => [
      ...officialThemesGroups.basic,
      ...officialThemesGroups.games,
      ...officialThemesGroups.extraordinary,
      ...(officialThemesGroups.nature || []),
      ...(officialThemesGroups.corporate || []),
      ...(officialThemesGroups.retro || []),
      ...(officialThemesGroups.creative || []),
      ...(officialThemesGroups.professional || []),
      ...(officialThemesGroups.minimalist || []),
      ...(officialThemesGroups.vibrant || []),
      ...(officialThemesGroups.aesthetic || []),
      ...(officialThemesGroups.anime || []),
      ...(officialThemesGroups.horror || []),
      ...(officialThemesGroups.cyberpunk || []),
      ...(officialThemesGroups.programming || []),
    ].filter((theme): theme is NonNullable<typeof theme> => theme != null && theme.id != null),
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

  // Favorite themes (stored in localStorage)
  const [favoriteThemeIds, setFavoriteThemeIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('aetheris-favorite-themes')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggleFavoriteTheme = (themeId: string) => {
    const newFavorites = new Set(favoriteThemeIds)
    const isFavorite = newFavorites.has(themeId)
    
    if (isFavorite) {
      newFavorites.delete(themeId)
      toast({
        title: t('settings.appearance.themeRemovedFromFavorites'),
        description: t('settings.appearance.themeRemovedFromFavoritesDescription'),
      })
    } else {
      newFavorites.add(themeId)
      toast({
        title: t('settings.appearance.themeAddedToFavorites'),
        description: t('settings.appearance.themeAddedToFavoritesDescription'),
      })
    }
    
    setFavoriteThemeIds(newFavorites)
    localStorage.setItem('aetheris-favorite-themes', JSON.stringify(Array.from(newFavorites)))
  }

  const allThemes = useMemo(
    () => [...officialThemes, ...customThemes].filter((theme): theme is NonNullable<typeof theme> => theme != null && theme.id != null).sort((a, b) => {
      if (a.official && !b.official) return -1
      if (!a.official && b.official) return 1
      // Для кастомных тем сортируем по дате создания, для официальных - по id
      const aDate = !a.official && 'createdAt' in a ? ((a as any).createdAt || 0) : 0
      const bDate = !b.official && 'createdAt' in b ? ((b as any).createdAt || 0) : 0
      return bDate - aDate
    }),
    [officialThemes, customThemes]
  )

  // Featured themes (recommended) - randomly selected on each page load, but default-theme is always first
  const featuredThemes = useMemo(() => {
    // Always include default-theme first
    const defaultTheme = allThemes.find((theme) => theme.id === 'default-theme')
    if (!defaultTheme) return []

    // Get all other themes (excluding default-theme)
    const otherThemes = allThemes.filter((theme) => theme.id !== 'default-theme')

    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...otherThemes]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Take first 7 random themes and combine with default-theme
    const randomThemes = shuffled.slice(0, 7)
    return [defaultTheme, ...randomThemes]
  }, [allThemes])

  // Filter themes by search query
  const filterThemes = (themes: typeof officialThemesGroups.basic, query: string) => {
    if (!query.trim()) return themes
    const lowerQuery = query.toLowerCase()
    return themes.filter(
      (theme) =>
        theme.name.toLowerCase().includes(lowerQuery) ||
        (theme.description && theme.description.toLowerCase().includes(lowerQuery))
    )
  }

  // Apply all filters to themes
  const applyThemeFilters = (themes: typeof allThemes) => {
    return themes.filter((theme) => {
      // Typography filter
      if (themeFilters.typography && theme.typography !== themeFilters.typography) return false

      // Contrast filter
      if (themeFilters.contrast && theme.contrast !== themeFilters.contrast) return false

      // Depth filter
      if (themeFilters.depth && theme.depth !== themeFilters.depth) return false

      // Motion filter
      if (themeFilters.motion && theme.motion !== themeFilters.motion) return false

      // Radius filter (exact match)
      if (themeFilters.radius !== null) {
        const themeRadiusPx = Math.round(theme.radius * 16)
        const filterRadiusPx = themeFilters.radius
        // Exact match only
        if (themeRadiusPx !== filterRadiusPx) return false
      }

      // Group filter (check which group the theme belongs to)
      if (themeFilters.group) {
        const inGroup =
          (themeFilters.group === 'basic' && officialThemesGroups.basic.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'games' && officialThemesGroups.games.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'extraordinary' && officialThemesGroups.extraordinary.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'nature' && officialThemesGroups.nature?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'corporate' && officialThemesGroups.corporate?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'retro' && officialThemesGroups.retro?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'creative' && (officialThemesGroups.creative || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'professional' && (officialThemesGroups.professional || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'minimalist' && (officialThemesGroups.minimalist || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'vibrant' && (officialThemesGroups.vibrant || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'aesthetic' && (officialThemesGroups.aesthetic || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'anime' && (officialThemesGroups.anime || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'horror' && (officialThemesGroups.horror || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'cyberpunk' && (officialThemesGroups.cyberpunk || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'programming' && (officialThemesGroups.programming || [])?.some((t) => t.id === theme.id)) ||
          (themeFilters.group === 'custom' && customThemes.some((t) => t.id === theme.id))
        if (!inGroup) return false
      }

      return true
    })
  }

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
    hard: '0 0 0 2px rgba(15, 23, 42, 0.5)',
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
      title: t('settings.appearance.themeCreated'),
      description: t('settings.appearance.themeCreatedDescription', { name: newTheme.name }),
    })
  }

  const handleApplyTheme = (theme: typeof allThemes[number]) => {
    // Применяем все параметры темы через метод applyTheme для атомарного обновления
    const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
    
    // Всегда используем applyTheme для атомарного обновления всех параметров
    applyTheme({
      accent: theme.accent,
      secondaryAccent: themeWithAccents.secondaryAccent,
      tertiaryAccent: themeWithAccents.tertiaryAccent,
      surface: theme.surface,
      radius: theme.radius,
      typography: theme.typography,
      contrast: theme.contrast,
      depth: theme.depth,
      motion: theme.motion,
    })
    // Don't change density - keep user's current setting
    
    toast({
      title: t('settings.appearance.themeApplied'),
      description: t('settings.appearance.themeAppliedDescription', { name: theme.name }),
    })
  }

  const handleDeleteTheme = (themeId: string) => {
    const updated = customThemes.filter((t) => t.id !== themeId)
    setCustomThemes(updated)
    localStorage.setItem('aetheris-custom-themes', JSON.stringify(updated))
    toast({
      title: t('settings.appearance.themeDeleted'),
      description: t('settings.appearance.themeDeletedDescription'),
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

  // Render theme card component
  const renderThemeCard = (
    theme: typeof allThemes[number],
    isActive: boolean,
    onApply: () => void,
    onShowDescription?: (e: React.MouseEvent) => void
  ) => {
    const isFavorite = favoriteThemeIds.has(theme.id)
    const themeAccent = accentOptionsByValue[theme.accent]
    const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
    const themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null
    const themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null
    const themeSurface = surfaceOptionsByValue[theme.surface]
    const allAccents = [themeAccent, themeSecondaryAccent, themeTertiaryAccent].filter(Boolean) as NonNullable<typeof themeAccent>[]

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
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 min-h-[3rem] sm:min-h-[3.5rem] shrink-0">
          <div className="flex items-start justify-between gap-2 h-full">
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <CardTitle className="text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {theme.name}
                  </span>
                  {theme.official && (
                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 shrink-0 whitespace-nowrap">
                      {t('settings.appearance.official')}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isActive && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0 mt-0.5" />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-3 sm:p-4 pt-0">
          <div className="flex flex-col space-y-2 sm:space-y-3 mt-auto">
            <div
              className="border border-border/60 p-2.5 sm:p-4 aspect-video relative overflow-hidden transition-transform duration-300 cursor-pointer"
              onClick={onShowDescription}
              style={{
                borderRadius: `min(${theme.radius * 16}px, 24px)`,
                backgroundColor: themeSurface ? `hsl(${themeSurface.tone.background})` : 'hsl(var(--background))',
                transform: 'translateZ(20px)',
              }}
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background:
                    allAccents.length > 0
                      ? allAccents.length > 1
                        ? `linear-gradient(135deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')}, transparent 100%)`
                        : `linear-gradient(135deg, hsl(${allAccents[0].tone}) 0%, transparent 100%)`
                      : 'transparent',
                }}
              />
              <div className="relative z-10 h-full flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
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
                          color: themeSurface ? `hsl(${themeSurface.tone.foreground || '220 13% 18%'})` : 'hsl(var(--foreground))',
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
                        color: themeSurface ? `hsl(${themeSurface.tone.muted || '220 9% 46%'})` : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {allAccents.map((acc) => acc.label).join(' + ') || theme.accent}
                    </div>
                  </div>
                </div>
                <div
                  className="flex-1 p-2.5 border"
                  style={{
                    backgroundColor: themeSurface ? `hsl(${themeSurface.tone.card})` : 'hsl(var(--card))',
                    borderColor: themeSurface ? `hsl(${themeSurface.tone.border || '220 13% 91%'})` : 'hsl(var(--border))',
                    borderRadius: `min(${theme.radius * 8}px, 8px)`,
                  }}
                >
                  <div className="flex flex-col gap-1.5 h-full">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-1.5 rounded-sm flex-1"
                        style={{
                          background:
                            allAccents.length > 1
                              ? `linear-gradient(90deg, ${allAccents.map((acc, i) => `hsl(${acc.tone}) ${(i / (allAccents.length - 1)) * 100}%`).join(', ')})`
                              : `hsl(${allAccents[0]?.tone})`,
                          opacity: 0.3,
                        }}
                      />
                      <div
                        className="h-1.5 w-4 rounded-sm"
                        style={{
                          background:
                            allAccents.length > 1
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
                          backgroundColor: themeSurface ? `hsl(${themeSurface.tone.muted})` : 'hsl(var(--muted))',
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
                          opacity: 0.5,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {allAccents.map((acc, index) => (
                      <div
                        key={index}
                        className="size-1 rounded-full"
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
                {contrastOptions.find((o) => o.value === theme.contrast)?.label ?? theme.contrast}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {depthOptions.find((o) => o.value === theme.depth)?.label ?? theme.depth}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {motionOptions.find((o) => o.value === theme.motion)?.label ?? theme.motion}
              </Badge>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onShowDescription}
                title={t('settings.appearance.themeDescription')}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0",
                  isFavorite && "text-primary hover:text-primary/80"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavoriteTheme(theme.id)
                }}
                title={isFavorite ? t('settings.appearance.removeFromFavorites') : t('settings.appearance.addToFavorites')}
              >
                <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={onApply}
              >
                {isActive ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    <span className="truncate">{t('settings.appearance.active')}</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3 w-3" />
                    <span className="truncate">{t('settings.appearance.apply')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render theme group with limit
  const renderThemeGroup = (
    groupKey: string,
    groupName: string,
    themes: typeof officialThemesGroups.basic,
    limit: number = 6
  ) => {
    const filteredThemes = filterThemes(themes, themeSearchQuery)
    const isExpanded = expandedGroups[groupKey] || false
    const displayedThemes = isExpanded || filteredThemes.length <= limit ? filteredThemes : filteredThemes.slice(0, limit)
    const hasMore = filteredThemes.length > limit && !isExpanded

    if (filteredThemes.length === 0 && themeSearchQuery) return null

    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs sm:text-sm font-semibold">{groupName}</Label>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {filteredThemes.length} {filteredThemes.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayedThemes.map((theme) => {
            const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
            const isActive =
              accent === theme.accent &&
              (secondaryAccent ?? undefined) === (themeWithAccents.secondaryAccent ?? undefined) &&
              (tertiaryAccent ?? undefined) === (themeWithAccents.tertiaryAccent ?? undefined) &&
              surface === theme.surface &&
              Math.abs(radius - theme.radius) < 0.01 &&
              typography === theme.typography &&
              contrast === theme.contrast &&
              depth === theme.depth &&
              motion === theme.motion

            return renderThemeCard(
              theme,
              isActive,
              () => handleApplyTheme(theme),
              (e) => handleShowDescription(e, { name: theme.name, description: theme.description || '' })
            )
          })}
        </div>
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedGroups((prev) => ({ ...prev, [groupKey]: true }))}
            className="w-full"
          >
            {t('settings.appearance.showMore')} ({filteredThemes.length - limit} {t('settings.appearance.more')})
          </Button>
        )}
      </div>
    )
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
      title: t('settings.appearance.themeReset'),
      description: t('settings.appearance.themeResetDescription'),
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.appearance.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.appearance.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        <Tabs defaultValue="colors" className="w-full">
          <div className="w-full min-w-0">
            <TabsList className="flex h-auto items-center justify-start rounded-lg bg-transparent p-0 w-full border-0 gap-1.5 sm:gap-2">
              <TabsTrigger 
                value="colors" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial max-w-[110px] sm:max-w-none"
              >
                <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.appearance.general')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="themes" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial max-w-[110px] sm:max-w-none"
              >
                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.appearance.themesTab')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="style" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial max-w-[110px] sm:max-w-none"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.appearance.style')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="layout" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial max-w-[110px] sm:max-w-none"
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate min-w-0">{t('settings.appearance.layout')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="colors" className="space-y-3 sm:space-y-4 mt-3 sm:mt-6">
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.themeMode')}</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('settings.appearance.themeModeDescription')}
              </p>
            </div>
            <Badge variant="outline" className="self-start text-[10px] sm:text-xs">
                  {theme === 'system' ? `${t('settings.appearance.system')} (${resolvedTheme})` : `${t(`settings.appearance.${theme}`)} ${t('settings.appearance.theme')}`}
            </Badge>
          </div>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
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

            <section className="space-y-3 sm:space-y-4">
              <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="live-preview" className="overflow-hidden rounded-lg border border-border/60 bg-muted/10 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 focus-within:outline-none">
              <AccordionTrigger className="px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:no-underline focus-visible:outline-none">
                <div className="flex w-full flex-col gap-0.5 pr-4 sm:pr-6">
                  <span className="text-xs sm:text-sm font-semibold">{t('settings.appearance.livePreviewTitle')}</span>
                  <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">
                    {t('settings.appearance.livePreviewSubtitle')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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

          <TabsContent value="layout" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.articleLayout')}</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('settings.appearance.articleLayoutDescription')}
                </p>
              </div>
              <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
                {viewModeOptions(t).map((option: { value: 'default' | 'line' | 'square'; label: string; description: string; icon: LucideIcon }) => {
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

          <TabsContent value="style" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <Card className="border-2 border-dashed border-primary/20 bg-muted/5">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-semibold">{t('settings.appearance.themeBuilder')}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      {t('settings.appearance.themeBuilderDescription')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="gap-1.5 sm:gap-2 shrink-0 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm self-start sm:self-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t('settings.appearance.resetToDefault')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        <section className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.accentColor')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.accentColorDescription')}
            </p>
          </div>
              <div ref={accentDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccentDropdownOpen(!isAccentDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  style={{
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span
                      className="block size-5 sm:size-6 rounded-full shadow-sm ring-1 ring-border/40 shrink-0"
                      style={{ background: `hsl(${activeAccent?.tone ?? '221.2 83.2% 53.3%'})` }}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-semibold truncate">{activeAccent?.label ?? t('settings.appearance.custom')}</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('settings.appearance.clickToChangeAccent')}</span>
                      </div>
                    </div>
                  {isAccentDropdownOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 transition-transform" />
                  )}
                </button>
                {isAccentDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 p-3 sm:p-4 border border-border/60 bg-background shadow-lg z-50 max-h-[70vh] sm:max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div className="space-y-4 sm:space-y-6">
                          {getAccentGroups(t).map((group) => {
                        const groupAccents = group.accents
                          .map((value) => accentOptionsByValue[value])
                          .filter((option): option is (typeof accentOptions)[number] => Boolean(option))

                        if (groupAccents.length === 0) return null

                        return (
                          <div key={group.id} className="space-y-2 sm:space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm font-semibold">{group.label}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        <div className="space-y-2 sm:space-y-3 pt-2 border-t border-border/60">
                          <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-semibold">{t('settings.appearance.custom')}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.appearance.createYourOwnAccent')}</p>
                          </div>
                          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                                <div className="space-y-2 sm:space-y-3" onClick={(event) => event.stopPropagation()}>
                                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                                    <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                          <span className="uppercase tracking-wide">{t('settings.appearance.light')}</span>
                                      <input
                                        type="color"
                                        value={customAccent.light}
                                        onChange={(event) => {
                                          setAccent('custom')
                                          setCustomAccentColor('light', event.target.value)
                                        }}
                                        className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer rounded border border-border bg-transparent"
                                            aria-label={t('settings.appearance.pickAccentColorLight')}
                                      />
                                    </label>
                                    <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                          <span className="uppercase tracking-wide">{t('settings.appearance.dark')}</span>
                                      <input
                                        type="color"
                                        value={customAccent.dark}
                                        onChange={(event) => {
                                          setAccent('custom')
                                          setCustomAccentColor('dark', event.target.value)
                                        }}
                                        className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer rounded border border-border bg-transparent"
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

        <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.surfacePalette')}</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.surfacePaletteDescription')}
                </p>
              </div>
              <div ref={surfaceDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSurfaceDropdownOpen(!isSurfaceDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  style={{
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span
                      className="block size-5 sm:size-6 rounded-md shadow-sm ring-1 ring-border/40 shrink-0"
                      style={{ backgroundColor: activeSurface ? `hsl(${activeSurface.tone.background})` : 'hsl(var(--background))' }}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-semibold truncate">{activeSurface?.label ?? t('settings.appearance.custom')}</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('settings.appearance.clickToChangeSurface')}</span>
                    </div>
                  </div>
                  {isSurfaceDropdownOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 transition-transform" />
                  )}
                </button>
                {isSurfaceDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 p-3 sm:p-4 border border-border/60 bg-background shadow-lg z-50 max-h-[70vh] sm:max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div className="space-y-4 sm:space-y-6">
                          {getSurfaceGroups(t).map((group) => {
                        const palettes = group.palettes
                          .map((value) => surfaceOptionsByValue[value])
                          .filter((option): option is (typeof surfaceOptions)[number] => Boolean(option))

                        if (palettes.length === 0) return null

                        return (
                          <div key={group.id} className="space-y-2 sm:space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm font-semibold">{group.label}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
                      <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.interfaceShape')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('settings.appearance.interfaceShapeDescription')}
            </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                  onClick={() => setRadius(DEFAULT_RADIUS)}
                  disabled={radiusIsDefault}
                      aria-label={t('settings.appearance.resetRadiusToDefault')}
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
          </div>
          <div className="space-y-2 sm:space-y-3 rounded-lg border border-dashed p-3 sm:p-4">
                <div className="flex flex-1 items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span className="truncate">{t('settings.appearance.sharper')}</span>
                      <span className="shrink-0 px-2">{Math.round(radius * 16)}px {t('settings.appearance.radius')}</span>
                      <span className="truncate">{t('settings.appearance.softer')}</span>
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

        <section className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.typographyScale')}</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.typographyScaleDescription')}
            </p>
          </div>
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 md:grid-cols-3">
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

            <section className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.contrastTitle')}</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.contrastDescription')}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
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

                <section className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.depthShadows')}</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.depthShadowsDescription')}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 md:grid-cols-3">
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

                <section className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.motionTitle')}</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('settings.appearance.motionDescription')}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
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

                <section className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.themeBuilder')}</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {t('settings.appearance.themeBuilderDescription')}
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-base font-semibold">{t('settings.appearance.createTheme')}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                          {t('settings.appearance.createThemeDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex-1 relative">
                          <Input
                            value={themeName}
                            onChange={(event) => setThemeName(event.target.value)}
                                placeholder={t('settings.appearance.myCustomTheme')}
                            maxLength={40}
                            className="h-9 sm:h-10 text-sm sm:flex-1 pr-10 sm:pr-12"
                          />
                          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground pointer-events-none">
                            {themeName.length}/40
                          </div>
                        </div>
                        <Button onClick={handleCreateTheme} className="h-9 sm:h-10 text-xs sm:text-sm sm:w-auto">
                          <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {t('settings.appearance.create')}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/10 p-2.5 sm:p-3 text-[10px] sm:text-xs">
                          <p className="font-medium text-foreground mb-1">{t('settings.appearance.currentSettings')}:</p>
                      <div className="space-y-0.5 sm:space-y-1 text-muted-foreground">
                            <p className="break-words">{t('settings.appearance.accent')}: {activeAccent?.label ?? t('settings.appearance.custom')}</p>
                            <p className="break-words">{t('settings.appearance.surface')}: {activeSurface?.label ?? t('settings.appearance.custom')}</p>
                            <p>{t('settings.appearance.radius')}: {Math.round(radius * 16)}px</p>
                            <p className="break-words">{t('settings.appearance.typography')}: {typographyLabel}</p>
                            <p className="break-words">{t('settings.appearance.contrastTitle')}: {contrastOptions.find(o => o.value === contrast)?.label ?? contrast}</p>
                            <p className="break-words">{t('settings.appearance.density')}: {densityLabel}</p>
                            <p className="break-words">{t('settings.appearance.depth')}: {depthOptions.find(o => o.value === depth)?.label ?? depth}</p>
                            <p className="break-words">{t('settings.appearance.motionTitle')}: {motionOptions.find(o => o.value === motion)?.label ?? motion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-base font-semibold">{t('settings.appearance.importExport')}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                          {t('settings.appearance.importExportDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 pt-0">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                        onClick={() => setShowImportDialog(true)}
                      >
                        <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t('settings.appearance.importJson')}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
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
                        <Copy className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t('settings.appearance.exportJson')}
                      </Button>
                      </div>
                    <Button
                      variant="outline"
                      className="w-full h-9 sm:h-10 text-xs sm:text-sm"
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
            <section className="space-y-3 sm:space-y-4">
                <div>
                    <Label className="text-xs sm:text-sm font-semibold">{t('settings.appearance.themeGroups.yourThemes')}</Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {customThemes.length} {customThemes.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
                  </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                        (secondaryAccent ?? undefined) === (themeWithAccents.secondaryAccent ?? undefined) &&
                        (tertiaryAccent ?? undefined) === (themeWithAccents.tertiaryAccent ?? undefined) &&
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
                               <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-border/60">
                                 <Button
                                   variant={isActive ? 'default' : 'outline'}
                                   size="sm"
                                   className="flex-1 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm min-w-0"
                                   onClick={() => handleApplyTheme(theme)}
                                 >
                                   {isActive ? (
                                     <>
                                       <Check className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                       <span className="truncate">{t('settings.appearance.active')}</span>
                                     </>
                                   ) : (
                                     <>
                                       <Download className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                       <span className="truncate">{t('settings.appearance.apply')}</span>
                                     </>
                                   )}
                                 </Button>
                                 {!theme.official && (
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                                     onClick={() => handleDeleteTheme(theme.id)}
                                   >
                                     <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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

          <TabsContent value="themes" className="space-y-4 sm:space-y-6 mt-3 sm:mt-6">
            <section className="space-y-4 sm:space-y-6">
              {/* Search and Filters Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('settings.appearance.searchThemes')}
                    value={themeSearchQuery}
                    onChange={(e) => setThemeSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {themeSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setThemeSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Button
                  variant={filtersOpen ? 'default' : 'outline'}
                  size="icon"
                  className="h-10 w-10 shrink-0 relative"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <Sliders className="h-4 w-4" />
                  {(themeFilters.typography || themeFilters.contrast || themeFilters.depth || themeFilters.motion || themeFilters.radius || themeFilters.group) && (
                    <Badge variant={filtersOpen ? 'secondary' : 'default'} className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] pointer-events-none">
                      {[
                        themeFilters.typography ? 1 : 0,
                        themeFilters.contrast ? 1 : 0,
                        themeFilters.depth ? 1 : 0,
                        themeFilters.motion ? 1 : 0,
                        themeFilters.radius ? 1 : 0,
                        themeFilters.group ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filters Panel */}
              {filtersOpen && (
                <div className="space-y-4 pt-2 border-t border-border/40">
                  {(themeFilters.typography || themeFilters.contrast || themeFilters.depth || themeFilters.motion || themeFilters.radius || themeFilters.group) && (
                    <div className="flex justify-end pb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setRadiusInput('')
                          setThemeFilters({ typography: null, contrast: null, depth: null, motion: null, radius: null, group: null })
                        }}
                      >
                        {t('settings.appearance.clearFilters')}
                      </Button>
                    </div>
                  )}

                    {/* Typography */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('settings.appearance.typography')}</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {typographyOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={themeFilters.typography === option.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={() => setThemeFilters((prev) => ({ ...prev, typography: prev.typography === option.value ? null : option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('settings.appearance.contrastLabel')}</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {contrastOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={themeFilters.contrast === option.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={() => setThemeFilters((prev) => ({ ...prev, contrast: prev.contrast === option.value ? null : option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Depth */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('settings.appearance.depth')}</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {depthOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={themeFilters.depth === option.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={() => setThemeFilters((prev) => ({ ...prev, depth: prev.depth === option.value ? null : option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Motion */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('settings.appearance.motionLabel')}</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {motionOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={themeFilters.motion === option.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={() => setThemeFilters((prev) => ({ ...prev, motion: prev.motion === option.value ? null : option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Radius */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('settings.appearance.radius')}</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input
                          type="number"
                          placeholder={t('settings.appearance.radius') + ' (px)'}
                          value={radiusInput}
                          onChange={(e) => {
                            const value = e.target.value.trim()
                            setRadiusInput(value)
                            if (value === '') {
                              setThemeFilters((prev) => ({ ...prev, radius: null }))
                            } else {
                              const numValue = parseInt(value, 10)
                              if (!isNaN(numValue) && numValue >= 0 && numValue <= 32) {
                                setThemeFilters((prev) => ({ ...prev, radius: numValue }))
                              } else {
                                setThemeFilters((prev) => ({ ...prev, radius: null }))
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value.trim()
                            if (value !== '') {
                              const numValue = parseInt(value, 10)
                              if (isNaN(numValue) || numValue < 0 || numValue > 32) {
                                setRadiusInput('')
                                setThemeFilters((prev) => ({ ...prev, radius: null }))
                              }
                            }
                          }}
                          className="h-8 w-32 text-sm"
                          min={0}
                          max={32}
                        />
                        {themeFilters.radius !== null && (
                          <Badge variant="secondary" className="h-8 px-3 text-xs">
                            {themeFilters.radius}px
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Group filter */}
                    {themeFilters.group && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('settings.appearance.group')}</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1.5 h-8 px-3 text-xs">
                            <span>
                              {themeFilters.group === 'custom'
                                ? t('settings.appearance.themeGroups.yourThemes')
                                : t(`settings.appearance.themeGroups.${themeFilters.group}`)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-transparent -mr-1"
                              onClick={() => setThemeFilters((prev) => ({ ...prev, group: null }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Favorite Themes */}
              {!themeSearchQuery && !themeFilters.typography && !themeFilters.contrast && !themeFilters.depth && !themeFilters.motion && !themeFilters.radius && !themeFilters.group && favoriteThemeIds.size > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <Label className="text-sm font-semibold">{t('settings.appearance.favoriteThemes')}</Label>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {allThemes
                      .filter((theme) => favoriteThemeIds.has(theme.id))
                      .map((theme) => {
                        const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
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

                        return renderThemeCard(
                          theme,
                          isActive,
                          () => handleApplyTheme(theme),
                          (e) => handleShowDescription(e, { name: theme.name, description: theme.description || '' })
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Featured Themes */}
              {!themeSearchQuery && !themeFilters.typography && !themeFilters.contrast && !themeFilters.depth && !themeFilters.motion && !themeFilters.radius && !themeFilters.group && featuredThemes.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary fill-primary" />
                    <Label className="text-sm font-semibold">{t('settings.appearance.featuredThemes')}</Label>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredThemes.map((theme) => {
                      const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                      const isActive =
                        accent === theme.accent &&
                        (secondaryAccent ?? undefined) === (themeWithAccents.secondaryAccent ?? undefined) &&
                        (tertiaryAccent ?? undefined) === (themeWithAccents.tertiaryAccent ?? undefined) &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return renderThemeCard(
                        theme,
                        isActive,
                        () => handleApplyTheme(theme),
                        (e) => handleShowDescription(e, { name: theme.name, description: theme.description || '' })
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Main Groups */}
              {!themeSearchQuery && !themeFilters.group && (
                <>
                  {officialThemesGroups.basic.length > 0 && renderThemeGroup('basic', t('settings.appearance.themeGroups.basic'), officialThemesGroups.basic)}
                  {officialThemesGroups.games.length > 0 && renderThemeGroup('games', t('settings.appearance.themeGroups.games'), officialThemesGroups.games)}
                  {officialThemesGroups.anime && officialThemesGroups.anime.length > 0 && renderThemeGroup('anime', t('settings.appearance.themeGroups.anime'), officialThemesGroups.anime)}
                  {officialThemesGroups.horror && officialThemesGroups.horror.length > 0 && renderThemeGroup('horror', t('settings.appearance.themeGroups.horror'), officialThemesGroups.horror)}
                  {officialThemesGroups.cyberpunk && officialThemesGroups.cyberpunk.length > 0 && renderThemeGroup('cyberpunk', t('settings.appearance.themeGroups.cyberpunk'), officialThemesGroups.cyberpunk)}
                  {officialThemesGroups.programming && officialThemesGroups.programming.length > 0 && renderThemeGroup('programming', t('settings.appearance.themeGroups.programming'), officialThemesGroups.programming)}
                  {officialThemesGroups.extraordinary.length > 0 && renderThemeGroup('extraordinary', t('settings.appearance.themeGroups.extraordinary'), officialThemesGroups.extraordinary)}
                  {officialThemesGroups.nature && officialThemesGroups.nature.length > 0 && renderThemeGroup('nature', t('settings.appearance.themeGroups.nature'), officialThemesGroups.nature)}
                  {officialThemesGroups.corporate && officialThemesGroups.corporate.length > 0 && renderThemeGroup('corporate', t('settings.appearance.themeGroups.corporate'), officialThemesGroups.corporate)}
                  {officialThemesGroups.retro && officialThemesGroups.retro.length > 0 && renderThemeGroup('retro', t('settings.appearance.themeGroups.retro'), officialThemesGroups.retro)}
                  {officialThemesGroups.creative && officialThemesGroups.creative.length > 0 && renderThemeGroup('creative', t('settings.appearance.themeGroups.creative'), officialThemesGroups.creative)}
                  {officialThemesGroups.professional && officialThemesGroups.professional.length > 0 && renderThemeGroup('professional', t('settings.appearance.themeGroups.professional'), officialThemesGroups.professional)}
                  {officialThemesGroups.minimalist && officialThemesGroups.minimalist.length > 0 && renderThemeGroup('minimalist', t('settings.appearance.themeGroups.minimalist'), officialThemesGroups.minimalist)}
                  {officialThemesGroups.vibrant && officialThemesGroups.vibrant.length > 0 && renderThemeGroup('vibrant', t('settings.appearance.themeGroups.vibrant'), officialThemesGroups.vibrant)}
                  {officialThemesGroups.aesthetic && officialThemesGroups.aesthetic.length > 0 && renderThemeGroup('aesthetic', t('settings.appearance.themeGroups.aesthetic'), officialThemesGroups.aesthetic)}
                </>
              )}

              {/* Search Results */}
              {(themeSearchQuery || themeFilters.typography || themeFilters.contrast || themeFilters.depth || themeFilters.motion || themeFilters.radius || themeFilters.group) && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      {t('settings.appearance.searchResults')} ({(() => {
                        let filtered = allThemes
                        if (themeSearchQuery) {
                          const query = themeSearchQuery.toLowerCase()
                          filtered = filtered.filter(
                            (t) =>
                              t.name.toLowerCase().includes(query) ||
                              (t.description && t.description.toLowerCase().includes(query))
                          )
                        }
                        filtered = applyThemeFilters(filtered)
                        return filtered.length
                      })()})
                    </Label>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(() => {
                      let filtered = allThemes
                      if (themeSearchQuery) {
                        const query = themeSearchQuery.toLowerCase()
                        filtered = filtered.filter(
                          (theme) =>
                            theme.name.toLowerCase().includes(query) ||
                            (theme.description && theme.description.toLowerCase().includes(query))
                        )
                      }
                      filtered = applyThemeFilters(filtered)
                      return filtered
                    })().map((theme) => {
                        const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
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

                        return renderThemeCard(
                          theme,
                          isActive,
                          () => handleApplyTheme(theme),
                          (e) => handleShowDescription(e, { name: theme.name, description: theme.description || '' })
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Your Themes */}
              {customThemes.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-semibold">{t('settings.appearance.themeGroups.yourThemes')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {customThemes.length} {customThemes.length === 1 ? t('settings.appearance.themeGroups.theme') : t('settings.appearance.themeGroups.themes')}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {customThemes.map((theme) => {
                      // const _themeAccent = accentOptionsByValue[theme.accent] // Unused, but may be needed in future
                      const themeWithAccents = theme as typeof theme & { secondaryAccent?: AccentColor; tertiaryAccent?: AccentColor }
                      // const _themeSecondaryAccent = themeWithAccents.secondaryAccent ? accentOptionsByValue[themeWithAccents.secondaryAccent] : null // Unused, but may be needed in future
                      // const _themeTertiaryAccent = themeWithAccents.tertiaryAccent ? accentOptionsByValue[themeWithAccents.tertiaryAccent] : null // Unused, but may be needed in future
                      const isActive =
                        accent === theme.accent &&
                        (secondaryAccent ?? undefined) === (themeWithAccents.secondaryAccent ?? undefined) &&
                        (tertiaryAccent ?? undefined) === (themeWithAccents.tertiaryAccent ?? undefined) &&
                        surface === theme.surface &&
                        Math.abs(radius - theme.radius) < 0.01 &&
                        typography === theme.typography &&
                        contrast === theme.contrast &&
                        depth === theme.depth &&
                        motion === theme.motion

                      return renderThemeCard(
                        theme,
                        isActive,
                        () => handleApplyTheme(theme),
                        (e) => handleShowDescription(e, { name: theme.name, description: theme.description || '' })
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.privacy.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.privacy.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
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
          <Button 
            variant="ghost" 
            onClick={handleReset} 
            disabled={!hasChanges || saving}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            {t('common.reset')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving} 
            className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.notifications.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {(['daily', 'weekly', 'monthly'] as NotificationState['digestFrequency'][]).map(
                  (option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={preferences.digestFrequency === option ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs capitalize"
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

        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
          <Button 
            variant="ghost" 
            onClick={handleReset} 
            disabled={!hasChanges || saving}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            {t('common.reset')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving} 
            className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.sessions.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.sessions.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          {sessions.map((session) => {
            const Icon = session.platform === 'mobile' ? Smartphone : Laptop
            return (
              <div
                key={session.id}
                className="flex flex-col gap-2 sm:gap-3 rounded-lg border border-border/70 bg-muted/10 p-3 sm:p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold flex-wrap">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{session.device}</span>
                    {session.current ? (
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        {t('settings.sessions.currentSession')}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
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
                    className="w-full gap-1.5 sm:gap-2 md:w-auto h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => handleSignOut(session.id)}
                    disabled={signingOutId === session.id || signingOutId === 'all'}
                  >
                    {signingOutId === session.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        {t('settings.sessions.signingOut')}
                      </>
                    ) : (
                      <>
                        <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <div className="space-y-1 text-[10px] sm:text-xs text-muted-foreground min-w-0">
            <p className="text-xs sm:text-sm font-medium text-foreground">{t('settings.sessions.secureAccount')}</p>
            <p className="break-words">
              {t('settings.sessions.secureAccountDescription')}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm shrink-0"
            onClick={handleSignOutOthers}
            disabled={signingOutId === 'all' || sessions.length <= 1}
          >
            {signingOutId === 'all' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                {t('settings.sessions.signingOut')}
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('settings.sessions.signOutOtherSessions')}</span>
                <span className="sm:hidden">{t('settings.sessions.signOutOthers')}</span>
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.language.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{t('settings.language.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{t('settings.billing.title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('settings.billing.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <section className="space-y-2 sm:space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="break-words">{t('settings.billing.creatorPro')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground break-words">
                {t('settings.billing.creatorProDescription')}
              </p>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] sm:text-xs shrink-0">
              {t('settings.billing.active', { amount: '$18' })}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3 shrink-0" />
              {t('settings.billing.nextInvoice', { date: `${t('settings.billing.months.december')} 10, 2025` })}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
              {t('settings.billing.trialCreditsApplied')}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => handlePlanAction('manage')}
              disabled={processingAction !== null}
            >
              {processingAction === 'manage' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  {t('settings.billing.openingPortal')}
                </>
              ) : (
                <>
                  <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('settings.billing.manageSubscription')}
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-2 sm:space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <span className="break-words">{t('settings.billing.paymentMethod')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground break-words">
                {t('settings.billing.paymentMethodDescription')}
              </p>
            </div>
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-wide shrink-0">
              {t('settings.billing.primary')}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => handlePlanAction('payment')}
              disabled={processingAction !== null}
            >
              {processingAction === 'payment' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  {t('settings.billing.updating')}
                </>
              ) : (
                <>
                  <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('settings.billing.updatePaymentMethod')}
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('settings.billing.invoices')}
            </h3>
            <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-wide shrink-0">
              {t('settings.billing.latest12Months')}
            </Badge>
          </div>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 text-xs sm:text-sm min-w-0 flex-1">
                  <div className="font-medium text-foreground break-words">{invoice.period}</div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="break-words">{invoice.id}</span>
                    <span className="font-medium text-foreground">{invoice.amount}</span>
                    <Badge
                      variant={invoice.status === 'Paid' ? 'secondary' : 'outline'}
                      className={cn(
                        'px-2 py-0.5 text-[10px] uppercase tracking-wide shrink-0',
                        invoice.status === 'Refunded' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {t(`settings.billing.status.${invoice.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-1.5 sm:gap-2 sm:w-auto h-9 sm:h-10 text-xs sm:text-sm shrink-0">
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('settings.billing.downloadPDF')}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-lg border border-dashed bg-muted/20 p-3 sm:p-4 text-[10px] sm:text-xs text-muted-foreground">
          <p className="font-medium text-foreground break-words">{t('settings.billing.needHelp')}</p>
          <p className="mt-1 break-words">
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
    <div className="flex items-start justify-between gap-3 sm:gap-4 rounded-lg border border-border/60 bg-background p-3 sm:p-4 shadow-sm">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
          {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />}
          <span className="break-words">{label}</span>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{description}</p>
        {meta && <div className="pt-1 text-[10px] sm:text-xs text-muted-foreground/90">{meta}</div>}
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
