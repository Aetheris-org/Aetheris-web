import { create } from 'zustand'

type TypographyScale = 'default' | 'comfortable' | 'compact'
type ContrastMode = 'standard' | 'bold'
type DepthStyle = 'flat' | 'soft' | 'elevated'
type MotionPreference = 'default' | 'reduced'

type ThemeMode = 'light' | 'dark' | 'system'
export type SurfaceStyle =
  | 'daylight'
  | 'lumen'
  | 'glacier'
  | 'harbor'
  | 'zenith'
  | 'sunset'
  | 'moss'
  | 'canyon'
  | 'terracotta'
  | 'mist'
  | 'nebula'
  | 'twilight'
  | 'aurora'
  | 'solstice'
  | 'midnight'
  | 'noir'
  | 'obsidian'
  | 'ember'
  | 'eclipse'
  | 'void'
  | 'inkwell'
  | 'cosmos'
  | 'nightfall'
  | 'onyx'
export type AccentColor =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'mono'
  | 'peach'
  | 'azure'
  | 'cobalt'
  | 'magenta'
  | 'crimson'
  | 'plum'
  | 'orchid'
  | 'teal'
  | 'seafoam'
  | 'sage'
  | 'coral'
  | 'saffron'
  | 'sunset'
  | 'graphite'
  | 'pure'
  | 'lime'
  | 'mint'
  | 'custom'

type ResolvedTheme = 'light' | 'dark'

interface AccentTone {
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  ring: string
}

interface AccentConfig {
  label: string
  description: string
  preview: string
  values: Record<ResolvedTheme, AccentTone>
}

export interface CustomAccentColors {
  light: string
  dark: string
}

interface AppearancePresetSettings {
  theme: ThemeMode
  accent: AccentColor
  surface: SurfaceStyle
  customAccent: CustomAccentColors
  radius: number
  typography: TypographyScale
  contrast: ContrastMode
  density: number
  depth: DepthStyle
  motion: MotionPreference
}

export interface AppearancePreset {
  id: string
  name: string
  createdAt: number
  settings: AppearancePresetSettings
}

interface StoredPreferences {
  theme: ThemeMode
  accent: AccentColor
  surface: SurfaceStyle
  radius: number
  customAccent: CustomAccentColors
  typography: TypographyScale
  contrast: ContrastMode
  density: number
  depth: DepthStyle
  motion: MotionPreference
  presets: AppearancePreset[]
}

interface ThemeState extends StoredPreferences {
  resolvedTheme: ResolvedTheme
  initialize: () => void
  setTheme: (mode: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setSurface: (surface: SurfaceStyle) => void
  setRadius: (radius: number) => void
  setCustomAccentColor: (mode: ResolvedTheme, color: string) => void
  setTypography: (value: TypographyScale) => void
  setContrast: (value: ContrastMode) => void
  setDensity: (value: number) => void
  setDepth: (value: DepthStyle) => void
  setMotion: (value: MotionPreference) => void
  savePreset: (name: string) => AppearancePreset | null
  deletePreset: (id: string) => void
  applyPreset: (id: string) => void
}

const STORAGE_KEY = 'aetheris:appearance'
const FOREGROUND_LIGHT = '210 40% 98%'
const FOREGROUND_DARK = '222 47.4% 11.2%'

const DEFAULT_CUSTOM_ACCENT: CustomAccentColors = {
  light: '#6366f1',
  dark: '#8b5cf6',
}

const SURFACE_STYLE_VALUES: SurfaceStyle[] = [
  'daylight',
  'lumen',
  'glacier',
  'harbor',
  'zenith',
  'sunset',
  'moss',
  'canyon',
  'terracotta',
  'mist',
  'nebula',
  'twilight',
  'aurora',
  'solstice',
  'midnight',
  'nightfall',
  'noir',
  'obsidian',
  'ember',
  'eclipse',
  'void',
  'inkwell',
  'cosmos',
  'onyx',
]

const DEFAULT_PREFERENCES: StoredPreferences = {
  theme: 'system',
  accent: 'pure',
  surface: 'obsidian',
  radius: 0.5,
  customAccent: DEFAULT_CUSTOM_ACCENT,
  typography: 'default',
  contrast: 'standard',
  density: 1,
  depth: 'soft',
  motion: 'default',
  presets: [],
}

export const DEFAULT_RADIUS = DEFAULT_PREFERENCES.radius
export const DEFAULT_CUSTOM_ACCENT_COLORS = DEFAULT_CUSTOM_ACCENT


export const TYPOGRAPHY_SCALES: Record<TypographyScale, { label: string; description: string; scale: number }> = {
  default: { label: 'Default', description: 'Balanced reading size', scale: 1 },
  comfortable: { label: 'Comfortable', description: 'Slightly larger type for relaxing reading', scale: 1.06 },
  compact: { label: 'Compact', description: 'A tighter, more data-dense layout', scale: 0.94 },
}

export const ACCENT_COLORS: Record<Exclude<AccentColor, 'custom'>, AccentConfig> = {
  indigo: {
    label: 'Indigo',
    description: 'Balanced contrast for focus work',
    preview: '226 70% 55%',
    values: {
      light: {
        primary: '226 70% 55%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '226 100% 96%',
        accentForeground: '226 75% 40%',
        ring: '226 70% 55%',
      },
      dark: {
        primary: '225 95% 78%',
        primaryForeground: '226 63% 20%',
        accent: '228 41% 23%',
        accentForeground: '228 100% 92%',
        ring: '225 95% 78%',
      },
    },
  },
  violet: {
    label: 'Violet',
    description: 'Creative vibe with soft gradients',
    preview: '258 90% 66%',
    values: {
      light: {
        primary: '258 90% 66%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '258 100% 96%',
        accentForeground: '258 90% 45%',
        ring: '258 90% 66%',
      },
      dark: {
        primary: '258 95% 78%',
        primaryForeground: '261 83% 18%',
        accent: '263 57% 28%',
        accentForeground: '258 100% 93%',
        ring: '258 95% 78%',
      },
    },
  },
  emerald: {
    label: 'Emerald',
    description: 'Calm and grounded feeling',
    preview: '152 76% 36%',
    values: {
      light: {
        primary: '152 76% 36%',
        primaryForeground: '152 82% 96%',
        accent: '150 100% 95%',
        accentForeground: '154 86% 25%',
        ring: '152 76% 36%',
      },
      dark: {
        primary: '152 76% 52%',
        primaryForeground: '149 80% 8%',
        accent: '155 40% 23%',
        accentForeground: '152 80% 88%',
        ring: '152 76% 52%',
      },
    },
  },
  amber: {
    label: 'Amber',
    description: 'Warm accent for optimistic tone',
    preview: '38 92% 50%',
    values: {
      light: {
        primary: '38 92% 50%',
        primaryForeground: '24 100% 10%',
        accent: '48 100% 94%',
        accentForeground: '31 100% 35%',
        ring: '38 92% 50%',
      },
      dark: {
        primary: '38 92% 65%',
        primaryForeground: '26 100% 12%',
        accent: '33 45% 26%',
        accentForeground: '48 100% 92%',
        ring: '38 92% 65%',
      },
    },
  },
  rose: {
    label: 'Rose',
    description: 'Vibrant highlight for storytelling',
    preview: '343 82% 55%',
    values: {
      light: {
        primary: '343 82% 55%',
        primaryForeground: '333 82% 97%',
        accent: '340 100% 95%',
        accentForeground: '343 82% 40%',
        ring: '343 82% 55%',
      },
      dark: {
        primary: '345 89% 68%',
        primaryForeground: '343 88% 15%',
        accent: '339 49% 24%',
        accentForeground: '343 90% 92%',
        ring: '345 89% 68%',
      },
    },
  },
  cyan: {
    label: 'Cyan',
    description: 'Clean and modern appearance',
    preview: '188 92% 42%',
    values: {
      light: {
        primary: '188 92% 42%',
        primaryForeground: '188 100% 96%',
        accent: '187 100% 95%',
        accentForeground: '188 90% 32%',
        ring: '188 92% 42%',
      },
      dark: {
        primary: '188 94% 68%',
        primaryForeground: '192 66% 16%',
        accent: '192 68% 22%',
        accentForeground: '189 96% 92%',
        ring: '188 94% 68%',
      },
    },
  },
  mono: {
    label: 'Monochrome',
    description: 'Minimal grayscale focus',
    preview: '220 10% 30%',
    values: {
      light: {
        primary: '220 10% 30%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 15% 92%',
        accentForeground: '220 12% 28%',
        ring: '220 10% 30%',
      },
      dark: {
        primary: '220 12% 82%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 18% 20%',
        accentForeground: '220 14% 84%',
        ring: '220 12% 82%',
      },
    },
  },
  peach: {
    label: 'Peach',
    description: 'Warm accent inspired by sunset hues',
    preview: '18 92% 62%',
    values: {
      light: {
        primary: '18 92% 62%',
        primaryForeground: '20 100% 10%',
        accent: '18 100% 94%',
        accentForeground: '18 90% 38%',
        ring: '18 92% 62%',
      },
      dark: {
        primary: '18 100% 72%',
        primaryForeground: '18 100% 12%',
        accent: '18 56% 26%',
        accentForeground: '18 98% 92%',
        ring: '18 100% 72%',
      },
    },
  },
  azure: {
    label: 'Azure',
    description: 'Sky blue for energetic navigation',
    preview: '204 88% 52%',
    values: {
      light: {
        primary: '204 88% 52%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '204 100% 96%',
        accentForeground: '205 92% 35%',
        ring: '204 88% 52%',
      },
      dark: {
        primary: '204 88% 68%',
        primaryForeground: '210 65% 18%',
        accent: '209 56% 30%',
        accentForeground: '204 100% 92%',
        ring: '204 88% 68%',
      },
    },
  },
  cobalt: {
    label: 'Cobalt',
    description: 'Deep blue for confident actions',
    preview: '217 92% 52%',
    values: {
      light: {
        primary: '217 92% 52%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '217 100% 96%',
        accentForeground: '217 88% 32%',
        ring: '217 92% 52%',
      },
      dark: {
        primary: '217 88% 70%',
        primaryForeground: '222 68% 18%',
        accent: '222 60% 30%',
        accentForeground: '216 100% 92%',
        ring: '217 88% 70%',
      },
    },
  },
  magenta: {
    label: 'Magenta',
    description: 'Electric magenta for standout CTAs',
    preview: '304 82% 54%',
    values: {
      light: {
        primary: '304 82% 54%',
        primaryForeground: '312 100% 97%',
        accent: '304 100% 96%',
        accentForeground: '304 72% 40%',
        ring: '304 82% 54%',
      },
      dark: {
        primary: '304 84% 70%',
        primaryForeground: '304 86% 16%',
        accent: '303 58% 32%',
        accentForeground: '302 100% 92%',
        ring: '304 84% 70%',
      },
    },
  },
  crimson: {
    label: 'Crimson',
    description: 'Rich red for editorial highlights',
    preview: '350 82% 52%',
    values: {
      light: {
        primary: '350 82% 52%',
        primaryForeground: '355 100% 96%',
        accent: '350 100% 95%',
        accentForeground: '350 78% 38%',
        ring: '350 82% 52%',
      },
      dark: {
        primary: '350 86% 68%',
        primaryForeground: '354 82% 15%',
        accent: '350 56% 28%',
        accentForeground: '350 92% 92%',
        ring: '350 86% 68%',
      },
    },
  },
  plum: {
    label: 'Plum',
    description: 'Sophisticated purple with depth',
    preview: '281 63% 48%',
    values: {
      light: {
        primary: '281 63% 48%',
        primaryForeground: '280 100% 96%',
        accent: '280 82% 95%',
        accentForeground: '281 52% 36%',
        ring: '281 63% 48%',
      },
      dark: {
        primary: '281 70% 66%',
        primaryForeground: '281 60% 16%',
        accent: '282 48% 30%',
        accentForeground: '282 86% 90%',
        ring: '281 70% 66%',
      },
    },
  },
  orchid: {
    label: 'Orchid',
    description: 'Soft lavender for calm interfaces',
    preview: '286 68% 60%',
    values: {
      light: {
        primary: '286 68% 60%',
        primaryForeground: '288 100% 97%',
        accent: '286 100% 96%',
        accentForeground: '286 62% 40%',
        ring: '286 68% 60%',
      },
      dark: {
        primary: '286 72% 72%',
        primaryForeground: '286 70% 18%',
        accent: '286 48% 32%',
        accentForeground: '286 84% 92%',
        ring: '286 72% 72%',
      },
    },
  },
  teal: {
    label: 'Teal',
    description: 'Balanced green-blue for product UIs',
    preview: '170 76% 40%',
    values: {
      light: {
        primary: '170 76% 40%',
        primaryForeground: '170 72% 96%',
        accent: '170 100% 95%',
        accentForeground: '169 68% 30%',
        ring: '170 76% 40%',
      },
      dark: {
        primary: '170 80% 56%',
        primaryForeground: '172 62% 12%',
        accent: '172 44% 26%',
        accentForeground: '170 92% 88%',
        ring: '170 80% 56%',
      },
    },
  },
  seafoam: {
    label: 'Seafoam',
    description: 'Pastel mint for relaxing experiences',
    preview: '160 58% 42%',
    values: {
      light: {
        primary: '160 58% 42%',
        primaryForeground: '155 82% 96%',
        accent: '158 100% 95%',
        accentForeground: '160 50% 30%',
        ring: '160 58% 42%',
      },
      dark: {
        primary: '160 62% 58%',
        primaryForeground: '154 60% 12%',
        accent: '158 36% 24%',
        accentForeground: '160 80% 88%',
        ring: '160 62% 58%',
      },
    },
  },
  sage: {
    label: 'Sage',
    description: 'Muted botanical green for quiet UI',
    preview: '140 30% 38%',
    values: {
      light: {
        primary: '140 30% 38%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '140 40% 92%',
        accentForeground: '140 28% 30%',
        ring: '140 30% 38%',
      },
      dark: {
        primary: '140 32% 62%',
        primaryForeground: '140 26% 14%',
        accent: '140 20% 24%',
        accentForeground: '140 36% 82%',
        ring: '140 32% 62%',
      },
    },
  },
  coral: {
    label: 'Coral',
    description: 'Friendly coral for community spaces',
    preview: '16 88% 58%',
    values: {
      light: {
        primary: '16 88% 58%',
        primaryForeground: '16 100% 96%',
        accent: '16 100% 95%',
        accentForeground: '15 80% 40%',
        ring: '16 88% 58%',
      },
      dark: {
        primary: '16 92% 70%',
        primaryForeground: '16 90% 14%',
        accent: '16 60% 28%',
        accentForeground: '16 92% 92%',
        ring: '16 92% 70%',
      },
    },
  },
  saffron: {
    label: 'Saffron',
    description: 'Golden saffron for celebratory moments',
    preview: '42 92% 55%',
    values: {
      light: {
        primary: '42 92% 55%',
        primaryForeground: '26 100% 12%',
        accent: '42 100% 95%',
        accentForeground: '35 85% 36%',
        ring: '42 92% 55%',
      },
      dark: {
        primary: '42 94% 68%',
        primaryForeground: '30 100% 14%',
        accent: '34 48% 28%',
        accentForeground: '40 100% 92%',
        ring: '42 94% 68%',
      },
    },
  },
  sunset: {
    label: 'Sunset',
    description: 'Burnished orange with blush undertones',
    preview: '24 88% 56%',
    values: {
      light: {
        primary: '24 88% 56%',
        primaryForeground: '20 100% 10%',
        accent: '24 100% 95%',
        accentForeground: '22 78% 36%',
        ring: '24 88% 56%',
      },
      dark: {
        primary: '24 92% 68%',
        primaryForeground: '24 98% 14%',
        accent: '22 52% 26%',
        accentForeground: '24 96% 92%',
        ring: '24 92% 68%',
      },
    },
  },
  graphite: {
    label: 'Graphite',
    description: 'Modern graphite neutral',
    preview: '220 18% 34%',
    values: {
      light: {
        primary: '220 18% 34%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 16% 90%',
        accentForeground: '220 14% 32%',
        ring: '220 18% 34%',
      },
      dark: {
        primary: '220 20% 72%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 18% 24%',
        accentForeground: '220 16% 84%',
        ring: '220 20% 72%',
      },
    },
  },
  pure: {
    label: 'Pure',
    description: 'Black on light theme, white on dark theme',
    preview: '0 0% 0%',
    values: {
      light: {
        primary: '0 0% 0%',
        primaryForeground: '210 40% 98%',
        accent: '0 0% 10%',
        accentForeground: '210 40% 98%',
        ring: '0 0% 0%',
      },
      dark: {
        primary: '0 0% 100%',
        primaryForeground: '222 47.4% 11.2%',
        accent: '0 0% 20%',
        accentForeground: '0 0% 100%',
        ring: '0 0% 100%',
      },
    },
  },
  lime: {
    label: 'Lime',
    description: 'Vibrant lime for energetic interfaces',
    preview: '75 94% 50%',
    values: {
      light: {
        primary: '75 94% 38%',
        primaryForeground: '75 100% 98%',
        accent: '75 100% 95%',
        accentForeground: '75 94% 28%',
        ring: '75 94% 38%',
      },
      dark: {
        primary: '75 94% 65%',
        primaryForeground: '75 100% 12%',
        accent: '75 48% 28%',
        accentForeground: '75 100% 92%',
        ring: '75 94% 65%',
      },
    },
  },
  mint: {
    label: 'Mint',
    description: 'Fresh mint for calm, refreshing vibes',
    preview: '150 70% 50%',
    values: {
      light: {
        primary: '150 70% 50%',
        primaryForeground: '150 82% 96%',
        accent: '150 100% 95%',
        accentForeground: '150 80% 30%',
        ring: '150 70% 50%',
      },
      dark: {
        primary: '150 70% 60%',
        primaryForeground: '150 80% 10%',
        accent: '150 40% 24%',
        accentForeground: '150 80% 88%',
        ring: '150 70% 60%',
      },
    },
  },
}

export const ACCENT_COLOR_PRESETS = Object.entries(ACCENT_COLORS).map(([value, config]) => ({
  value: value as Exclude<AccentColor, 'custom'>,
  ...config,
}))

interface SurfacePresetConfigLegacy {
  label: string
  description: string
  values: Record<ResolvedTheme, {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    muted: string
    mutedForeground: string
    secondary: string
    secondaryForeground: string
    border: string
    input: string
  }>
}

export const SURFACE_PRESETS: Record<SurfaceStyle, SurfacePresetConfigLegacy> = {
  daylight: {
    label: 'Daylight',
    description: 'Bright, editorial-friendly canvas',
    values: {
      light: {
        background: '48 100% 99%',
        foreground: '222 35% 12%',
        card: '0 0% 100%',
        cardForeground: '222 35% 12%',
        popover: '0 0% 100%',
        popoverForeground: '222 35% 12%',
        muted: '46 79% 94%',
        mutedForeground: '222 20% 38%',
        secondary: '48 92% 92%',
        secondaryForeground: '222 35% 12%',
        border: '44 68% 88%',
        input: '44 68% 88%',
      },
      dark: {
        background: '222 35% 12%',
        foreground: '46 92% 95%',
        card: '222 30% 16%',
        cardForeground: '46 92% 95%',
        popover: '222 30% 16%',
        popoverForeground: '46 92% 95%',
        muted: '222 20% 24%',
        mutedForeground: '46 72% 80%',
        secondary: '222 20% 24%',
        secondaryForeground: '46 92% 95%',
        border: '222 20% 24%',
        input: '222 20% 24%',
      },
    },
  },
  lumen: {
    label: 'Lumen frost',
    description: 'Ultralight silvers with frosted glass depth',
    values: {
      light: {
        background: '216 36% 98%',
        foreground: '222 40% 14%',
        card: '0 0% 100%',
        cardForeground: '222 40% 14%',
        popover: '0 0% 100%',
        popoverForeground: '222 40% 14%',
        muted: '214 32% 94%',
        mutedForeground: '222 25% 42%',
        secondary: '214 28% 92%',
        secondaryForeground: '222 40% 14%',
        border: '214 24% 90%',
        input: '214 24% 90%',
      },
      dark: {
        background: '220 30% 15%',
        foreground: '210 45% 96%',
        card: '220 28% 20%',
        cardForeground: '210 45% 96%',
        popover: '220 28% 20%',
        popoverForeground: '210 45% 96%',
        muted: '220 20% 26%',
        mutedForeground: '200 30% 78%',
        secondary: '220 20% 26%',
        secondaryForeground: '210 45% 96%',
        border: '220 20% 26%',
        input: '220 20% 26%',
      },
    },
  },
  glacier: {
    label: 'Glacier blue',
    description: 'Cool teal whites for focused calm',
    values: {
      light: {
        background: '196 58% 97%',
        foreground: '201 35% 18%',
        card: '0 0% 100%',
        cardForeground: '201 35% 18%',
        popover: '0 0% 100%',
        popoverForeground: '201 35% 18%',
        muted: '195 45% 93%',
        mutedForeground: '200 26% 42%',
        secondary: '194 40% 90%',
        secondaryForeground: '201 35% 18%',
        border: '195 36% 88%',
        input: '195 36% 88%',
      },
      dark: {
        background: '201 32% 13%',
        foreground: '193 72% 94%',
        card: '201 30% 18%',
        cardForeground: '193 72% 94%',
        popover: '201 30% 18%',
        popoverForeground: '193 72% 94%',
        muted: '201 24% 24%',
        mutedForeground: '190 35% 76%',
        secondary: '201 24% 24%',
        secondaryForeground: '193 72% 94%',
        border: '201 24% 24%',
        input: '201 24% 24%',
      },
    },
  },
  harbor: {
    label: 'Harbor dawn',
    description: 'Soft coastal blues for calm workspaces',
    values: {
      light: {
        background: '205 65% 98%',
        foreground: '215 40% 16%',
        card: '0 0% 100%',
        cardForeground: '215 40% 16%',
        popover: '0 0% 100%',
        popoverForeground: '215 40% 16%',
        muted: '204 52% 94%',
        mutedForeground: '215 28% 38%',
        secondary: '203 50% 90%',
        secondaryForeground: '215 40% 16%',
        border: '205 32% 88%',
        input: '205 32% 88%',
      },
      dark: {
        background: '215 42% 14%',
        foreground: '205 72% 96%',
        card: '215 40% 19%',
        cardForeground: '205 72% 96%',
        popover: '215 40% 19%',
        popoverForeground: '205 72% 96%',
        muted: '215 32% 25%',
        mutedForeground: '200 42% 78%',
        secondary: '215 32% 25%',
        secondaryForeground: '205 72% 96%',
        border: '215 32% 25%',
        input: '215 32% 25%',
      },
    },
  },
  zenith: {
    label: 'Zenith glow',
    description: 'Crisp daylight whites with airy contrast',
    values: {
      light: {
        background: '192 82% 97%',
        foreground: '216 34% 16%',
        card: '0 0% 100%',
        cardForeground: '216 34% 16%',
        popover: '0 0% 100%',
        popoverForeground: '216 34% 16%',
        muted: '195 48% 93%',
        mutedForeground: '214 30% 38%',
        secondary: '194 42% 90%',
        secondaryForeground: '216 34% 16%',
        border: '195 30% 88%',
        input: '195 30% 88%',
      },
      dark: {
        background: '213 48% 18%',
        foreground: '192 80% 96%',
        card: '213 44% 23%',
        cardForeground: '192 80% 96%',
        popover: '213 44% 23%',
        popoverForeground: '192 80% 96%',
        muted: '213 32% 28%',
        mutedForeground: '192 46% 78%',
        secondary: '213 32% 28%',
        secondaryForeground: '192 80% 96%',
        border: '213 32% 28%',
        input: '213 32% 28%',
      },
    },
  },
  sunset: {
    label: 'Sunset ember',
    description: 'Warm neutrals with golden undertones',
    values: {
      light: {
        background: '30 60% 99%',
        foreground: '22 35% 16%',
        card: '0 0% 100%',
        cardForeground: '22 35% 16%',
        popover: '0 0% 100%',
        popoverForeground: '22 35% 16%',
        muted: '30 40% 95%',
        mutedForeground: '20 25% 40%',
        secondary: '28 52% 92%',
        secondaryForeground: '20 35% 18%',
        border: '30 36% 90%',
        input: '30 36% 90%',
      },
      dark: {
        background: '23 38% 10%',
        foreground: '30 90% 95%',
        card: '23 32% 14%',
        cardForeground: '30 90% 95%',
        popover: '23 32% 14%',
        popoverForeground: '30 90% 95%',
        muted: '23 24% 22%',
        mutedForeground: '30 70% 82%',
        secondary: '23 24% 22%',
        secondaryForeground: '30 90% 95%',
        border: '23 24% 22%',
        input: '23 24% 22%',
      },
    },
  },
  moss: {
    label: 'Moss canopy',
    description: 'Earthy greens with publishing warmth',
    values: {
      light: {
        background: '138 44% 97%',
        foreground: '132 32% 16%',
        card: '0 0% 100%',
        cardForeground: '132 32% 16%',
        popover: '0 0% 100%',
        popoverForeground: '132 32% 16%',
        muted: '136 34% 92%',
        mutedForeground: '132 22% 40%',
        secondary: '134 38% 88%',
        secondaryForeground: '132 32% 16%',
        border: '136 28% 88%',
        input: '136 28% 88%',
      },
      dark: {
        background: '134 28% 11%',
        foreground: '140 52% 92%',
        card: '134 26% 16%',
        cardForeground: '140 52% 92%',
        popover: '134 26% 16%',
        popoverForeground: '140 52% 92%',
        muted: '134 20% 24%',
        mutedForeground: '140 32% 75%',
        secondary: '134 20% 24%',
        secondaryForeground: '140 52% 92%',
        border: '134 20% 24%',
        input: '134 20% 24%',
      },
    },
  },
  canyon: {
    label: 'Canyon clay',
    description: 'Rust orange base for storytelling hubs',
    values: {
      light: {
        background: '18 52% 98%',
        foreground: '16 42% 18%',
        card: '0 0% 100%',
        cardForeground: '16 42% 18%',
        popover: '0 0% 100%',
        popoverForeground: '16 42% 18%',
        muted: '20 44% 92%',
        mutedForeground: '18 32% 42%',
        secondary: '18 38% 88%',
        secondaryForeground: '16 42% 18%',
        border: '18 28% 86%',
        input: '18 28% 86%',
      },
      dark: {
        background: '18 50% 11%',
        foreground: '26 70% 92%',
        card: '18 46% 16%',
        cardForeground: '26 70% 92%',
        popover: '18 46% 16%',
        popoverForeground: '26 70% 92%',
        muted: '18 32% 22%',
        mutedForeground: '24 46% 78%',
        secondary: '18 32% 22%',
        secondaryForeground: '26 70% 92%',
        border: '18 32% 22%',
        input: '18 32% 22%',
      },
    },
  },
  terracotta: {
    label: 'Terracotta',
    description: 'Clay neutrals with editorial warmth',
    values: {
      light: {
        background: '24 60% 97%',
        foreground: '20 38% 18%',
        card: '0 0% 100%',
        cardForeground: '20 38% 18%',
        popover: '0 0% 100%',
        popoverForeground: '20 38% 18%',
        muted: '24 46% 92%',
        mutedForeground: '18 28% 42%',
        secondary: '22 40% 88%',
        secondaryForeground: '20 38% 18%',
        border: '24 30% 86%',
        input: '24 30% 86%',
      },
      dark: {
        background: '22 46% 12%',
        foreground: '32 72% 94%',
        card: '22 42% 17%',
        cardForeground: '32 72% 94%',
        popover: '22 42% 17%',
        popoverForeground: '32 72% 94%',
        muted: '22 30% 24%',
        mutedForeground: '32 48% 80%',
        secondary: '22 30% 24%',
        secondaryForeground: '32 72% 94%',
        border: '22 30% 24%',
        input: '22 30% 24%',
      },
    },
  },
  mist: {
    label: 'Studio mist',
    description: 'Balanced greys for versatile layouts',
    values: {
      light: {
        background: '220 22% 98%',
        foreground: '222 20% 20%',
        card: '0 0% 100%',
        cardForeground: '222 20% 20%',
        popover: '0 0% 100%',
        popoverForeground: '222 20% 20%',
        muted: '220 16% 93%',
        mutedForeground: '222 12% 44%',
        secondary: '220 14% 90%',
        secondaryForeground: '222 20% 20%',
        border: '220 16% 90%',
        input: '220 16% 90%',
      },
      dark: {
        background: '220 18% 13%',
        foreground: '220 30% 96%',
        card: '220 18% 18%',
        cardForeground: '220 30% 96%',
        popover: '220 18% 18%',
        popoverForeground: '220 30% 96%',
        muted: '220 14% 24%',
        mutedForeground: '220 18% 72%',
        secondary: '220 14% 24%',
        secondaryForeground: '220 30% 96%',
        border: '220 14% 24%',
        input: '220 14% 24%',
      },
    },
  },
  nebula: {
    label: 'Nebula haze',
    description: 'Softer violet gradients for relaxed reading',
    values: {
      light: {
        background: '250 46% 97%',
        foreground: '241 47% 15%',
        card: '0 0% 100%',
        cardForeground: '241 47% 15%',
        popover: '0 0% 100%',
        popoverForeground: '241 47% 15%',
        muted: '248 55% 93%',
        mutedForeground: '241 31% 40%',
        secondary: '242 35% 92%',
        secondaryForeground: '241 47% 20%',
        border: '245 36% 88%',
        input: '245 36% 88%',
      },
      dark: {
        background: '244 45% 10%',
        foreground: '222 73% 95%',
        card: '245 42% 14%',
        cardForeground: '222 73% 95%',
        popover: '245 42% 14%',
        popoverForeground: '222 73% 95%',
        muted: '247 32% 20%',
        mutedForeground: '220 32% 75%',
        secondary: '247 32% 20%',
        secondaryForeground: '222 73% 95%',
        border: '247 32% 20%',
        input: '247 32% 20%',
      },
    },
  },
  twilight: {
    label: 'Twilight bloom',
    description: 'Dusk purples with editorial softness',
    values: {
      light: {
        background: '268 64% 97%',
        foreground: '256 34% 20%',
        card: '0 0% 100%',
        cardForeground: '256 34% 20%',
        popover: '0 0% 100%',
        popoverForeground: '256 34% 20%',
        muted: '268 48% 93%',
        mutedForeground: '256 26% 45%',
        secondary: '266 40% 90%',
        secondaryForeground: '256 34% 20%',
        border: '268 36% 88%',
        input: '268 36% 88%',
      },
      dark: {
        background: '262 46% 13%',
        foreground: '258 78% 94%',
        card: '262 40% 18%',
        cardForeground: '258 78% 94%',
        popover: '262 40% 18%',
        popoverForeground: '258 78% 94%',
        muted: '262 32% 24%',
        mutedForeground: '258 38% 78%',
        secondary: '262 32% 24%',
        secondaryForeground: '258 78% 94%',
        border: '262 32% 24%',
        input: '262 32% 24%',
      },
    },
  },
  aurora: {
    label: 'Aurora drift',
    description: 'Teal-meets-violet gradient inspired palette',
    values: {
      light: {
        background: '186 54% 97%',
        foreground: '200 40% 16%',
        card: '0 0% 100%',
        cardForeground: '200 40% 16%',
        popover: '0 0% 100%',
        popoverForeground: '200 40% 16%',
        muted: '188 42% 92%',
        mutedForeground: '200 28% 40%',
        secondary: '208 50% 94%',
        secondaryForeground: '198 40% 20%',
        border: '188 30% 88%',
        input: '188 30% 88%',
      },
      dark: {
        background: '202 58% 12%',
        foreground: '184 72% 92%',
        card: '202 52% 18%',
        cardForeground: '184 72% 92%',
        popover: '202 52% 18%',
        popoverForeground: '184 72% 92%',
        muted: '202 36% 24%',
        mutedForeground: '188 48% 78%',
        secondary: '240 42% 22%',
        secondaryForeground: '186 72% 92%',
        border: '202 36% 24%',
        input: '202 36% 24%',
      },
    },
  },
  solstice: {
    label: 'Solstice bloom',
    description: 'Warm dusk gradients with optimistic accents',
    values: {
      light: {
        background: '318 58% 97%',
        foreground: '316 32% 20%',
        card: '0 0% 100%',
        cardForeground: '316 32% 20%',
        popover: '0 0% 100%',
        popoverForeground: '316 32% 20%',
        muted: '320 44% 93%',
        mutedForeground: '316 28% 44%',
        secondary: '12 80% 94%',
        secondaryForeground: '316 32% 20%',
        border: '320 30% 88%',
        input: '320 30% 88%',
      },
      dark: {
        background: '314 52% 12%',
        foreground: '332 72% 94%',
        card: '314 46% 18%',
        cardForeground: '332 72% 94%',
        popover: '314 46% 18%',
        popoverForeground: '332 72% 94%',
        muted: '314 36% 24%',
        mutedForeground: '332 48% 82%',
        secondary: '18 68% 40%',
        secondaryForeground: '332 72% 94%',
        border: '314 36% 24%',
        input: '314 36% 24%',
      },
    },
  },
  midnight: {
    label: 'Midnight navy',
    description: 'Balanced dark blues for focused reading',
    values: {
      light: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        secondary: '210 40% 96.1%',
        secondaryForeground: '222.2 47.4% 11.2%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 6%',
        cardForeground: '210 40% 98%',
        popover: '222.2 84% 6%',
        popoverForeground: '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        secondary: '217.2 32.6% 17.5%',
        secondaryForeground: '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
      },
    },
  },
  nightfall: {
    label: 'Nightfall',
    description: 'Moody blue hour for focused sessions',
    values: {
      light: {
        background: '226 38% 96%',
        foreground: '224 36% 20%',
        card: '226 30% 92%',
        cardForeground: '224 36% 20%',
        popover: '226 30% 92%',
        popoverForeground: '224 36% 20%',
        muted: '226 26% 88%',
        mutedForeground: '224 26% 44%',
        secondary: '226 22% 84%',
        secondaryForeground: '224 36% 20%',
        border: '226 24% 86%',
        input: '226 24% 86%',
      },
      dark: {
        background: '226 64% 6%',
        foreground: '210 50% 96%',
        card: '226 58% 10%',
        cardForeground: '210 50% 96%',
        popover: '226 58% 10%',
        popoverForeground: '210 50% 96%',
        muted: '226 40% 18%',
        mutedForeground: '210 38% 80%',
        secondary: '226 40% 18%',
        secondaryForeground: '210 50% 96%',
        border: '226 40% 18%',
        input: '226 40% 18%',
      },
    },
  },
  noir: {
    label: 'Graphite noir',
    description: 'Neutral grayscale with subtle blue undertone',
    values: {
      light: {
        background: '210 17% 98%',
        foreground: '220 19% 18%',
        card: '0 0% 100%',
        cardForeground: '220 19% 18%',
        popover: '0 0% 100%',
        popoverForeground: '220 19% 18%',
        muted: '213 16% 90%',
        mutedForeground: '220 10% 38%',
        secondary: '210 14% 88%',
        secondaryForeground: '220 19% 18%',
        border: '213 16% 90%',
        input: '213 16% 90%',
      },
      dark: {
        background: '216 25% 9%',
        foreground: '215 20% 98%',
        card: '216 23% 12%',
        cardForeground: '215 20% 98%',
        popover: '216 23% 12%',
        popoverForeground: '215 20% 98%',
        muted: '216 16% 20%',
        mutedForeground: '220 13% 72%',
        secondary: '216 16% 20%',
        secondaryForeground: '215 20% 98%',
        border: '216 16% 20%',
        input: '216 16% 20%',
      },
    },
  },
  obsidian: {
    label: 'Obsidian black',
    description: 'Ultra-dark surfaces with crisp contrast',
    values: {
      light: {
        background: '20 10% 98%',
        foreground: '230 21% 15%',
        card: '0 0% 100%',
        cardForeground: '230 21% 15%',
        popover: '0 0% 100%',
        popoverForeground: '230 21% 15%',
        muted: '220 11% 92%',
        mutedForeground: '220 15% 40%',
        secondary: '220 9% 85%',
        secondaryForeground: '230 21% 15%',
        border: '220 11% 90%',
        input: '220 11% 90%',
      },
      dark: {
        background: '230 35% 4%',
        foreground: '210 40% 97%',
        card: '231 38% 6%',
        cardForeground: '210 40% 97%',
        popover: '231 38% 6%',
        popoverForeground: '210 40% 97%',
        muted: '231 28% 14%',
        mutedForeground: '210 16% 70%',
        secondary: '231 28% 14%',
        secondaryForeground: '210 40% 97%',
        border: '231 28% 14%',
        input: '231 28% 14%',
      },
    },
  },
  ember: {
    label: 'Ember glow',
    description: 'Dramatic warm darks for storytelling',
    values: {
      light: {
        background: '24 58% 98%',
        foreground: '18 45% 18%',
        card: '0 0% 100%',
        cardForeground: '18 45% 18%',
        popover: '0 0% 100%',
        popoverForeground: '18 45% 18%',
        muted: '24 40% 93%',
        mutedForeground: '20 28% 44%',
        secondary: '22 45% 90%',
        secondaryForeground: '18 45% 18%',
        border: '24 36% 88%',
        input: '24 36% 88%',
      },
      dark: {
        background: '18 62% 9%',
        foreground: '28 88% 94%',
        card: '20 50% 14%',
        cardForeground: '28 88% 94%',
        popover: '20 50% 14%',
        popoverForeground: '28 88% 94%',
        muted: '18 36% 22%',
        mutedForeground: '26 48% 78%',
        secondary: '18 36% 22%',
        secondaryForeground: '28 88% 94%',
        border: '18 36% 22%',
        input: '18 36% 22%',
      },
    },
  },
  eclipse: {
    label: 'Eclipse',
    description: 'Deep space blacks for ultimate focus',
    values: {
      light: {
        background: '220 13% 97%',
        foreground: '220 23% 18%',
        card: '0 0% 100%',
        cardForeground: '220 23% 18%',
        popover: '0 0% 100%',
        popoverForeground: '220 23% 18%',
        muted: '220 15% 92%',
        mutedForeground: '220 18% 42%',
        secondary: '220 13% 88%',
        secondaryForeground: '220 23% 18%',
        border: '220 13% 90%',
        input: '220 13% 90%',
      },
      dark: {
        background: '230 36% 3%',
        foreground: '210 40% 97%',
        card: '230 30% 6%',
        cardForeground: '210 40% 97%',
        popover: '230 30% 6%',
        popoverForeground: '210 40% 97%',
        muted: '230 22% 16%',
        mutedForeground: '210 16% 72%',
        secondary: '230 22% 16%',
        secondaryForeground: '210 40% 97%',
        border: '230 22% 16%',
        input: '230 22% 16%',
      },
    },
  },
  void: {
    label: 'Void mono',
    description: 'Nearly-black interface for cinematic reading sessions',
    values: {
      light: {
        background: '222 16% 96%',
        foreground: '222 24% 14%',
        card: '222 18% 92%',
        cardForeground: '222 24% 14%',
        popover: '222 18% 92%',
        popoverForeground: '222 24% 14%',
        muted: '222 12% 88%',
        mutedForeground: '222 16% 44%',
        secondary: '222 10% 84%',
        secondaryForeground: '222 24% 14%',
        border: '222 12% 86%',
        input: '222 12% 86%',
      },
      dark: {
        background: '234 52% 4%',
        foreground: '210 32% 96%',
        card: '234 48% 8%',
        cardForeground: '210 32% 96%',
        popover: '234 48% 8%',
        popoverForeground: '210 32% 96%',
        muted: '234 32% 16%',
        mutedForeground: '210 26% 78%',
        secondary: '234 32% 16%',
        secondaryForeground: '210 32% 96%',
        border: '234 32% 16%',
        input: '234 32% 16%',
      },
    },
  },
  inkwell: {
    label: 'Inkwell',
    description: 'Indigo-tinted dark theme with subtle chroma',
    values: {
      light: {
        background: '226 28% 97%',
        foreground: '228 24% 16%',
        card: '226 25% 94%',
        cardForeground: '228 24% 16%',
        popover: '226 25% 94%',
        popoverForeground: '228 24% 16%',
        muted: '226 18% 88%',
        mutedForeground: '228 22% 46%',
        secondary: '226 16% 86%',
        secondaryForeground: '228 24% 16%',
        border: '226 18% 86%',
        input: '226 18% 86%',
      },
      dark: {
        background: '228 56% 6%',
        foreground: '216 46% 94%',
        card: '228 50% 10%',
        cardForeground: '216 46% 94%',
        popover: '228 50% 10%',
        popoverForeground: '216 46% 94%',
        muted: '228 34% 18%',
        mutedForeground: '216 35% 80%',
        secondary: '228 34% 18%',
        secondaryForeground: '216 46% 94%',
        border: '228 34% 18%',
        input: '228 34% 18%',
      },
    },
  },
  cosmos: {
    label: 'Cosmos night',
    description: 'Midnight violets with star-lit accents',
    values: {
      light: {
        background: '250 32% 96%',
        foreground: '248 32% 18%',
        card: '250 30% 93%',
        cardForeground: '248 32% 18%',
        popover: '250 30% 93%',
        popoverForeground: '248 32% 18%',
        muted: '250 22% 88%',
        mutedForeground: '248 26% 44%',
        secondary: '248 24% 86%',
        secondaryForeground: '248 32% 18%',
        border: '250 22% 86%',
        input: '250 22% 86%',
      },
      dark: {
        background: '258 60% 7%',
        foreground: '250 55% 95%',
        card: '258 52% 11%',
        cardForeground: '250 55% 95%',
        popover: '258 52% 11%',
        popoverForeground: '250 55% 95%',
        muted: '258 36% 20%',
        mutedForeground: '250 38% 82%',
        secondary: '258 36% 20%',
        secondaryForeground: '250 55% 95%',
        border: '258 36% 20%',
        input: '258 36% 20%',
      },
    },
  },
  onyx: {
    label: 'Onyx',
    description: 'Pure graphite blacks with editorial contrast',
    values: {
      light: {
        background: '220 14% 96%',
        foreground: '230 18% 16%',
        card: '220 12% 92%',
        cardForeground: '230 18% 16%',
        popover: '220 12% 92%',
        popoverForeground: '230 18% 16%',
        muted: '220 12% 88%',
        mutedForeground: '228 18% 42%',
        secondary: '220 10% 84%',
        secondaryForeground: '230 18% 16%',
        border: '220 12% 86%',
        input: '220 12% 86%',
      },
      dark: {
        background: '228 32% 5%',
        foreground: '210 34% 96%',
        card: '228 30% 9%',
        cardForeground: '210 34% 96%',
        popover: '228 30% 9%',
        popoverForeground: '210 34% 96%',
        muted: '228 24% 16%',
        mutedForeground: '210 28% 78%',
        secondary: '228 24% 16%',
        secondaryForeground: '210 34% 96%',
        border: '228 24% 16%',
        input: '228 24% 16%',
      },
    },
  },
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system' && typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return mode === 'dark' ? 'dark' : 'light'
}

function clampRadius(value: number) {
  const min = 0
  const max = 2
  if (Number.isNaN(value)) return DEFAULT_PREFERENCES.radius
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(color: string | undefined, fallback: string): string {
  if (!color) return fallback
  let value = color.trim()
  if (!value.startsWith('#')) {
    value = `#${value}`
  }
  if (/^#([0-9a-f]{3})$/i.test(value)) {
    const [, c] = /^#([0-9a-f]{3})$/i.exec(value) ?? []
    if (c) {
      value = `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`
    }
  }
  return /^#([0-9a-f]{6})$/i.test(value) ? value.toLowerCase() : fallback
}

function normalizeCustomAccent(customAccent: CustomAccentColors | undefined): CustomAccentColors {
  return {
    light: normalizeHex(customAccent?.light, DEFAULT_CUSTOM_ACCENT.light),
    dark: normalizeHex(customAccent?.dark, DEFAULT_CUSTOM_ACCENT.dark),
  }
}

interface HslValue {
  h: number
  s: number
  l: number
}

function hexToHsl(hex: string): HslValue {
  const value = normalizeHex(hex, DEFAULT_CUSTOM_ACCENT.light).replace('#', '')
  const r = parseInt(value.substring(0, 2), 16) / 255
  const g = parseInt(value.substring(2, 4), 16) / 255
  const b = parseInt(value.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToString(hsl: HslValue): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`
}

function adjustLightness(hsl: HslValue, delta: number): HslValue {
  return {
    ...hsl,
    l: Math.max(0, Math.min(100, hsl.l + Math.round(delta * 100))),
  }
}

function getForegroundForLightness(lightness: number): string {
  return lightness > 60 ? FOREGROUND_DARK : FOREGROUND_LIGHT
}

function buildAccentToneFromHex(color: string, mode: ResolvedTheme): AccentTone {
  const base = hexToHsl(color)
  const primary = hslToString(base)
  const accent = hslToString(adjustLightness(base, mode === 'light' ? 0.12 : -0.12))
  return {
    primary,
    primaryForeground: getForegroundForLightness(base.l),
    accent,
    accentForeground: getForegroundForLightness(base.l),
    ring: primary,
  }
}

function getCustomAccentTones(customAccent: CustomAccentColors): Record<ResolvedTheme, AccentTone> {
  return {
    light: buildAccentToneFromHex(customAccent.light, 'light'),
    dark: buildAccentToneFromHex(customAccent.dark, 'dark'),
  }
}

export function buildCustomAccentOption(customAccent: CustomAccentColors) {
  const tones = getCustomAccentTones(customAccent)
  return {
    value: 'custom' as const,
    label: 'Custom',
    description: 'Define your own accent colors',
    preview: tones.light.primary,
    values: tones,
  }
}

function loadPreferences(): StoredPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES }
  }

  const storedRaw = window.localStorage.getItem(STORAGE_KEY)
  if (storedRaw) {
    try {
      const parsed = JSON.parse(storedRaw) as Partial<StoredPreferences>
      const accent = parsed.accent
      const isAccentValid =
        accent === 'indigo' ||
        accent === 'violet' ||
        accent === 'emerald' ||
        accent === 'amber' ||
        accent === 'rose' ||
        accent === 'cyan' ||
        accent === 'mono' ||
        accent === 'peach' ||
        accent === 'azure' ||
        accent === 'cobalt' ||
        accent === 'magenta' ||
        accent === 'crimson' ||
        accent === 'plum' ||
        accent === 'orchid' ||
        accent === 'teal' ||
        accent === 'seafoam' ||
        accent === 'sage' ||
        accent === 'coral' ||
        accent === 'saffron' ||
        accent === 'sunset' ||
        accent === 'graphite' ||
        accent === 'pure' ||
        accent === 'lime' ||
        accent === 'mint' ||
        accent === 'custom'
      return {
        theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : DEFAULT_PREFERENCES.theme,
        accent: isAccentValid ? (accent as AccentColor) : DEFAULT_PREFERENCES.accent,
        surface:
          typeof parsed.surface === 'string' && SURFACE_STYLE_VALUES.includes(parsed.surface as SurfaceStyle)
            ? (parsed.surface as SurfaceStyle)
            : DEFAULT_PREFERENCES.surface,
        radius: clampRadius(parsed.radius ?? DEFAULT_PREFERENCES.radius),
        customAccent: normalizeCustomAccent(parsed.customAccent),
        typography: (parsed.typography as TypographyScale) ?? DEFAULT_PREFERENCES.typography,
        contrast: (parsed.contrast as ContrastMode) ?? DEFAULT_PREFERENCES.contrast,
        density: typeof parsed.density === 'number' ? parsed.density : DEFAULT_PREFERENCES.density,
        depth: (parsed.depth as DepthStyle) ?? DEFAULT_PREFERENCES.depth,
        motion: (parsed.motion as MotionPreference) ?? DEFAULT_PREFERENCES.motion,
        presets: Array.isArray(parsed.presets)
          ? (parsed.presets as AppearancePreset[]).map((preset) => {
              const settings = preset.settings ?? ({} as Partial<AppearancePresetSettings>)
              const presetAccent = settings.accent
              const presetAccentValid =
                presetAccent === 'indigo' ||
                presetAccent === 'violet' ||
                presetAccent === 'emerald' ||
                presetAccent === 'amber' ||
                presetAccent === 'rose' ||
                presetAccent === 'cyan' ||
                presetAccent === 'mono' ||
                presetAccent === 'peach' ||
                presetAccent === 'azure' ||
                presetAccent === 'cobalt' ||
                presetAccent === 'magenta' ||
                presetAccent === 'crimson' ||
                presetAccent === 'plum' ||
                presetAccent === 'orchid' ||
                presetAccent === 'teal' ||
                presetAccent === 'seafoam' ||
                presetAccent === 'sage' ||
                presetAccent === 'coral' ||
                presetAccent === 'saffron' ||
                presetAccent === 'sunset' ||
                presetAccent === 'graphite' ||
                presetAccent === 'pure' ||
                presetAccent === 'lime' ||
                presetAccent === 'mint' ||
                presetAccent === 'custom'
              return {
                ...preset,
                settings: {
                  theme:
                    settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'system'
                      ? settings.theme
                      : DEFAULT_PREFERENCES.theme,
                  accent: presetAccentValid ? (presetAccent as AccentColor) : DEFAULT_PREFERENCES.accent,
                  surface:
                    typeof settings.surface === 'string' &&
                    SURFACE_STYLE_VALUES.includes(settings.surface as SurfaceStyle)
                      ? (settings.surface as SurfaceStyle)
                      : DEFAULT_PREFERENCES.surface,
                  customAccent: normalizeCustomAccent(settings.customAccent),
                  radius: clampRadius(settings.radius ?? DEFAULT_PREFERENCES.radius),
                  typography: (settings.typography as TypographyScale) ?? DEFAULT_PREFERENCES.typography,
                  contrast: (settings.contrast as ContrastMode) ?? DEFAULT_PREFERENCES.contrast,
                  density: typeof settings.density === 'number' ? settings.density : DEFAULT_PREFERENCES.density,
                  depth: (settings.depth as DepthStyle) ?? DEFAULT_PREFERENCES.depth,
                  motion: (settings.motion as MotionPreference) ?? DEFAULT_PREFERENCES.motion,
                },
              }
            })
          : DEFAULT_PREFERENCES.presets,
      }
    } catch {
      // ignore corrupted storage
    }
  }

  const legacyTheme = window.localStorage.getItem('theme')
  if (legacyTheme === 'dark' || legacyTheme === 'light') {
    return {
      ...DEFAULT_PREFERENCES,
      theme: legacyTheme,
    }
  }

  return { ...DEFAULT_PREFERENCES }
}

function savePreferences(preferences: StoredPreferences) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  window.localStorage.setItem('theme', preferences.theme)
}

function extractPreferences(state: ThemeState): StoredPreferences {
  return {
    theme: state.theme,
    accent: state.accent,
    surface: state.surface,
    radius: state.radius,
    customAccent: state.customAccent,
    typography: state.typography,
    contrast: state.contrast,
    density: state.density,
    depth: state.depth,
    motion: state.motion,
    presets: state.presets,
  }
}

function applyThemePreferences(state: ThemeState) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolved = state.resolvedTheme
  root.classList.toggle('dark', resolved === 'dark')
  root.dataset.theme = state.theme
  root.dataset.surface = state.surface
  root.dataset.contrast = state.contrast
  root.dataset.depth = state.depth
  root.dataset.motion = state.motion
  root.dataset.typography = state.typography

  const accentValues =
    state.accent === 'custom'
      ? getCustomAccentTones(state.customAccent)[resolved]
      : ACCENT_COLORS[state.accent].values[resolved]

  root.style.setProperty('--primary', accentValues.primary)
  root.style.setProperty('--primary-foreground', accentValues.primaryForeground)
  root.style.setProperty('--accent', accentValues.accent)
  root.style.setProperty('--accent-foreground', accentValues.accentForeground)
  root.style.setProperty('--ring', accentValues.ring)
  root.style.setProperty('--radius', `${state.radius}rem`)
  // Update adaptive radius variables
  root.style.setProperty('--radius-xs', `min(${state.radius}rem, 0.375rem)`)
  root.style.setProperty('--radius-sm', `min(${state.radius}rem, 0.5rem)`)
  root.style.setProperty('--radius-md', `min(${state.radius}rem, 0.75rem)`)
  root.style.setProperty('--radius-lg', `${state.radius}rem`)
  const typographyScale = TYPOGRAPHY_SCALES[state.typography]?.scale ?? 1
  root.style.setProperty('--aetheris-font-scale', typographyScale.toString())
  root.style.setProperty('--aetheris-density', state.density.toString())

  root.style.removeProperty('--aetheris-surface')
  root.style.removeProperty('--aetheris-surface-flat')
  root.style.removeProperty('--aetheris-surface-gradient')

  const surfaceValues = SURFACE_PRESETS[state.surface].values[resolved]
  root.style.setProperty('--background', surfaceValues.background)
  root.style.setProperty('--foreground', surfaceValues.foreground)
  root.style.setProperty('--card', surfaceValues.card)
  root.style.setProperty('--card-foreground', surfaceValues.cardForeground)
  root.style.setProperty('--popover', surfaceValues.popover)
  root.style.setProperty('--popover-foreground', surfaceValues.popoverForeground)
  root.style.setProperty('--muted', surfaceValues.muted)
  root.style.setProperty('--muted-foreground', surfaceValues.mutedForeground)
  root.style.setProperty('--secondary', surfaceValues.secondary)
  root.style.setProperty('--secondary-foreground', surfaceValues.secondaryForeground)
  root.style.setProperty('--border', surfaceValues.border)
  root.style.setProperty('--input', surfaceValues.input)
}

let isInitialized = false

export const useThemeStore = create<ThemeState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  resolvedTheme: 'light' as ResolvedTheme,
  initialize: () => {
    if (isInitialized || typeof window === 'undefined') return
    isInitialized = true

    const preferences = loadPreferences()
    const resolvedTheme: ResolvedTheme = resolveTheme(preferences.theme)

    set((state) => {
      const nextState = {
        ...state,
        ...preferences,
        resolvedTheme,
      }
      applyThemePreferences(nextState)
      return {
        ...preferences,
        resolvedTheme,
      }
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (get().theme === 'system') {
        const newResolved: ResolvedTheme = event.matches ? 'dark' : 'light'
        set((state) => {
          const nextState = {
            ...state,
            resolvedTheme: newResolved,
          }
          applyThemePreferences(nextState)
          return { resolvedTheme: newResolved }
        })
      }
    }
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange)
    }
  },
  setTheme: (mode) => {
    set((state) => {
      const resolvedTheme: ResolvedTheme = resolveTheme(mode)
      const nextState = {
        ...state,
        theme: mode,
        resolvedTheme,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return {
        theme: mode,
        resolvedTheme,
      }
    })
  },
  setAccent: (accent) => {
    set((state) => {
      const nextState = {
        ...state,
        accent,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { accent }
    })
  },
  setSurface: (surface) => {
    set((state) => {
      const nextState = {
        ...state,
        surface,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { surface }
    })
  },
  setRadius: (radius) => {
    const nextRadius = clampRadius(radius)
    set((state) => {
      const nextState = {
        ...state,
        radius: nextRadius,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { radius: nextRadius }
    })
  },
  setCustomAccentColor: (mode, color) => {
    set((state) => {
      const normalized = normalizeHex(color, state.customAccent[mode])
      const customAccent = {
        ...state.customAccent,
        [mode]: normalized,
      }
      const nextState = {
        ...state,
        customAccent,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { customAccent }
    })
  },
  setTypography: (value) => {
    set((state) => {
      const nextState = {
        ...state,
        typography: value,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { typography: value }
    })
  },
  setContrast: (value) => {
    set((state) => {
      const nextState = {
        ...state,
        contrast: value,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { contrast: value }
    })
  },
  setDensity: (value) => {
    const nextDensity = Math.min(1.15, Math.max(0.85, value))
    set((state) => {
      const nextState = {
        ...state,
        density: nextDensity,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { density: nextDensity }
    })
  },
  setDepth: (value) => {
    set((state) => {
      const nextState = {
        ...state,
        depth: value,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { depth: value }
    })
  },
  setMotion: (value) => {
    set((state) => {
      const nextState = {
        ...state,
        motion: value,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { motion: value }
    })
  },
  savePreset: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    let createdPreset: AppearancePreset | null = null
    set((state) => {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `preset-${Date.now()}-${Math.floor(Math.random()*1e4)}`;
      const preset: AppearancePreset = {
        id: id,
        name: trimmed,
        createdAt: Date.now(),
        settings: {
          theme: state.theme,
          accent: state.accent,
          surface: state.surface,
          customAccent: state.customAccent,
          radius: state.radius,
          typography: state.typography,
          contrast: state.contrast,
          density: state.density,
          depth: state.depth,
          motion: state.motion,
        },
      }
      createdPreset = preset
      const presets = [...state.presets, preset]
      const nextState = {
        ...state,
        presets,
      }
      savePreferences(extractPreferences(nextState))
      return { presets }
    })
    return createdPreset
  },
  deletePreset: (id) => {
    set((state) => {
      const presets = state.presets.filter((preset) => preset.id !== id)
      const nextState = {
        ...state,
        presets,
      }
      savePreferences(extractPreferences(nextState))
      return { presets }
    })
  },
  applyPreset: (id) => {
    set((state) => {
      const preset = state.presets.find((item) => item.id === id)
      if (!preset) {
        return {}
      }
      const resolvedTheme: ResolvedTheme = resolveTheme(preset.settings.theme)
      const nextState = {
        ...state,
        ...preset.settings,
        surface: preset.settings.surface,
        customAccent: normalizeCustomAccent(preset.settings.customAccent),
        resolvedTheme,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return {
        ...preset.settings,
        resolvedTheme,
        customAccent: nextState.customAccent,
        surface: nextState.surface,
      }
    })
  },
}))

export type {
  ThemeMode,
  ThemeState,
  ResolvedTheme,
  TypographyScale,
  ContrastMode,
  DepthStyle,
  MotionPreference,
}
