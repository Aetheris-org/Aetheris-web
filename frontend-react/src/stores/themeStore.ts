import { create } from 'zustand'

type TypographyScale = 'default' | 'comfortable' | 'compact'
type ContrastMode = 'standard' | 'bold'
type DepthStyle = 'flat' | 'soft' | 'elevated' | 'hard'
type MotionPreference = 'default' | 'reduced' | 'enhanced'

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
  | 'snow'
  | 'cream'
  | 'pearl'
  | 'ivory'
  | 'sand'
  | 'stone'
  | 'slate'
  | 'charcoal'
  | 'ash'
  | 'smoke'
  | 'fog'
  | 'cloud'
  | 'storm'
  | 'shadow'
  | 'abyss'
  | 'deep'
  | 'pitch'
  | 'coal'
  | 'jet'
  | 'carbon'
  | 'cyberpunk'
  | 'minecraft'
  | 'csgo'
  | 'dota'
  | 'terraria'
  | 'geometrydash'
  | 'marble'
  | 'granite'
  | 'quartz'
  | 'crystal'
  | 'diamond'
  | 'opal'
  | 'moonlight'
  | 'starlight'
  | 'firelight'
  | 'candlelight'
  | 'neon'
  | 'laser'
  | 'plasma'
  | 'hologram'
  | 'matrix'
  | 'cyber'
  | 'retro'
  | 'vintage'
  | 'tropical'
  | 'arctic'
  | 'desert'
  | 'jungle'
  | 'lake'
  | 'river'
  | 'beach'
  | 'mountain'
  | 'valley'
  | 'meadow'
  | 'garden'
  | 'city'
  | 'urban'
  | 'library'
  | 'museum'
  | 'gallery'
  | 'studio'
  | 'luxury'
  | 'premium'
  | 'royal'
  | 'elegant'
  | 'sophisticated'
  | 'velvet'
  | 'silk'
  | 'leather'
  | 'wood'
  | 'oak'
  | 'mahogany'
  | 'cherrywood'
  | 'maple'
  | 'fnaf-dark'
  | 'fnaf-bright'
  | 'fnaf-springtrap'
  | 'fnaf-nightmare'
  | 'fnaf-sister-location'
  | 'fnaf-pizzeria'
  | 'fnaf-ucn'
  | 'fnaf-help-wanted'
  | 'fnaf-security-breach'
  | 'fnaf-ruin'
  | 'fnaf-help-wanted-2'
  | 'outlast-horror'
  | 'phasmophobia-eerie'
  | 'jujutsu-kaisen'
  | 'one-piece-joy'
  | '90s-muted'
  | 'programming-terminal'
  | 'balloons-festive'
  | 'teardown-voxel'
  | 'dispatch-modern'
  | 'horror-dark'
  | 'terminal-green'
  | 'neon-cyber'
  | 'pastel-dream'
  | 'metallic-shine'
  | 'nature-forest'
  | 'ocean-deep'
  | 'sunset-warm'
  | 'moonlight-cool'
  | 'fire-passion'
  | 'ice-frozen'
  | 'storm-dramatic'
  | 'calm-serene'
  | 'energetic-vibrant'
  | 'minimal-clean'
  | 'luxury-gold'
  | 'tech-futuristic'
  | 'retro-vintage'
  | 'artistic-creative'
  | 'professional-corporate'
  | 'gaming-arcade'
  | 'anime-colorful'
  | 'horror-eerie'
  | 'festive-celebration'
  | 'mystical-magic'
  | 'industrial-raw'
  | 'organic-natural'
  | 'digital-pixel'
  | 'abstract-art'
  | 'classic-elegant'
  | 'modern-sleek'
  | 'rustic-wooden'
  | 'crystal-clear'
  | 'smoky-mysterious'
  | 'bright-sunny'
  | 'dark-moody'
  | 'colorful-rainbow'
  | 'monochrome-minimal'
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
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'brown'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'turquoise'
  | 'lavender'
  | 'fuchsia'
  | 'salmon'
  | 'olive'
  | 'navy'
  | 'sky'
  | 'forest'
  | 'ocean'
  | 'ruby'
  | 'scarlet'
  | 'cherry'
  | 'burgundy'
  | 'maroon'
  | 'carmine'
  | 'vermillion'
  | 'tangerine'
  | 'apricot'
  | 'honey'
  | 'butter'
  | 'canary'
  | 'lemon'
  | 'chartreuse'
  | 'jade'
  | 'aqua'
  | 'cerulean'
  | 'sapphire'
  | 'royal'
  | 'periwinkle'
  | 'amethyst'
  | 'mauve'
  | 'lilac'
  | 'wisteria'
  | 'wine'
  | 'copper'
  | 'rust'
  | 'khaki'
  | 'tan'
  | 'beige'
  | 'vanilla'
  | 'champagne'
  | 'platinum'
  | 'titanium'
  | 'steel'
  | 'iron'
  | 'neon-pink'
  | 'neon-green'
  | 'neon-blue'
  | 'neon-yellow'
  | 'neon-cyan'
  | 'neon-orange'
  | 'neon-purple'
  | 'moss-green'
  | 'earth-brown'
  | 'forest-deep'
  | 'river-blue'
  | 'chrome'
  | 'nickel'
  | 'pewter'
  | 'brass'
  | 'aluminum'
  | 'pastel-pink'
  | 'pastel-blue'
  | 'pastel-green'
  | 'pastel-yellow'
  | 'pastel-purple'
  | 'pastel-orange'
  | 'terminal-green'
  | 'horror-red'
  | 'fnaf-yellow'
  | 'outlast-dark'
  | 'jujutsu-purple'
  | 'one-piece-white'
  | 'balloon-red'
  | 'balloon-blue'
  | 'balloon-yellow'
  | 'luck-green'
  | 'towel-beige'
  | 'shit-brown'
  | 'programming-green'
  | 'phasmophobia-blue'
  | 'teardown-orange'
  | 'dispatch-blue'
  | '90s-muted'
  | 'electric-blue'
  | 'fire-orange'
  | 'ice-blue'
  | 'lava-red'
  | 'storm-gray'
  | 'sunshine-yellow'
  | 'moonlight-silver'
  | 'custom'

type ResolvedTheme = 'light' | 'dark'

interface AccentTone {
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  ring: string
  destructive?: string
  destructiveForeground?: string
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
  secondaryAccent?: AccentColor // Дополнительный акцентный цвет для тем с несколькими цветами
  tertiaryAccent?: AccentColor // Третий акцентный цвет (если нужен)
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
  setSecondaryAccent: (accent: AccentColor | undefined) => void
  setTertiaryAccent: (accent: AccentColor | undefined) => void
  setSurface: (surface: SurfaceStyle) => void
  setRadius: (radius: number) => void
  setCustomAccentColor: (mode: ResolvedTheme, color: string) => void
  setTypography: (value: TypographyScale) => void
  setContrast: (value: ContrastMode) => void
  setDensity: (value: number) => void
  setDepth: (value: DepthStyle) => void
  setMotion: (value: MotionPreference) => void
  applyTheme: (params: {
    accent: AccentColor
    secondaryAccent?: AccentColor
    tertiaryAccent?: AccentColor
    surface: SurfaceStyle
    radius: number
    typography: TypographyScale
    contrast: ContrastMode
    depth: DepthStyle
    motion: MotionPreference
  }) => void
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
  'snow',
  'cream',
  'pearl',
  'ivory',
  'sand',
  'stone',
  'slate',
  'charcoal',
  'ash',
  'smoke',
  'fog',
  'cloud',
  'storm',
  'shadow',
  'abyss',
  'deep',
  'pitch',
  'coal',
  'jet',
  'carbon',
  'cyberpunk',
  'minecraft',
  'csgo',
  'dota',
  'terraria',
  'geometrydash',
  'marble',
  'granite',
  'quartz',
  'crystal',
  'diamond',
  'opal',
  'moonlight',
  'starlight',
  'firelight',
  'candlelight',
  'neon',
  'laser',
  'plasma',
  'hologram',
  'matrix',
  'cyber',
  'retro',
  'vintage',
  'tropical',
  'arctic',
  'desert',
  'jungle',
  'lake',
  'river',
  'beach',
  'mountain',
  'valley',
  'meadow',
  'garden',
  'city',
  'urban',
  'library',
  'museum',
  'gallery',
  'studio',
  'luxury',
  'premium',
  'royal',
  'elegant',
  'sophisticated',
  'velvet',
  'silk',
  'leather',
  'wood',
  'oak',
  'mahogany',
  'cherrywood',
  'maple',
  'fnaf-dark',
  'fnaf-bright',
  'fnaf-springtrap',
  'fnaf-nightmare',
  'fnaf-sister-location',
  'fnaf-pizzeria',
  'fnaf-ucn',
  'fnaf-help-wanted',
  'fnaf-security-breach',
  'fnaf-ruin',
  'fnaf-help-wanted-2',
  'outlast-horror',
  'phasmophobia-eerie',
  'jujutsu-kaisen',
  'one-piece-joy',
  '90s-muted',
  'programming-terminal',
  'balloons-festive',
  'teardown-voxel',
  'dispatch-modern',
  'horror-dark',
  'terminal-green',
  'neon-cyber',
  'pastel-dream',
  'metallic-shine',
  'nature-forest',
  'ocean-deep',
  'sunset-warm',
  'moonlight-cool',
  'fire-passion',
  'ice-frozen',
  'storm-dramatic',
  'calm-serene',
  'energetic-vibrant',
  'minimal-clean',
  'luxury-gold',
  'tech-futuristic',
  'retro-vintage',
  'artistic-creative',
  'professional-corporate',
  'gaming-arcade',
  'anime-colorful',
  'horror-eerie',
  'festive-celebration',
  'mystical-magic',
  'industrial-raw',
  'organic-natural',
  'digital-pixel',
  'abstract-art',
  'classic-elegant',
  'modern-sleek',
  'rustic-wooden',
  'crystal-clear',
  'smoky-mysterious',
  'bright-sunny',
  'dark-moody',
  'colorful-rainbow',
  'monochrome-minimal',
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
  orange: {
    label: 'Orange',
    description: 'Vibrant orange for energetic interfaces',
    preview: '25 95% 53%',
    values: {
      light: {
        primary: '25 95% 53%',
        primaryForeground: '20 100% 10%',
        accent: '25 100% 95%',
        accentForeground: '25 90% 35%',
        ring: '25 95% 53%',
      },
      dark: {
        primary: '25 95% 65%',
        primaryForeground: '20 100% 12%',
        accent: '25 50% 26%',
        accentForeground: '25 100% 92%',
        ring: '25 95% 65%',
      },
    },
  },
  yellow: {
    label: 'Yellow',
    description: 'Bright yellow for optimistic highlights',
    preview: '48 96% 53%',
    values: {
      light: {
        primary: '48 96% 53%',
        primaryForeground: '26 100% 12%',
        accent: '48 100% 95%',
        accentForeground: '35 85% 36%',
        ring: '48 96% 53%',
      },
      dark: {
        primary: '48 96% 68%',
        primaryForeground: '30 100% 14%',
        accent: '34 48% 28%',
        accentForeground: '40 100% 92%',
        ring: '48 96% 68%',
      },
    },
  },
  green: {
    label: 'Green',
    description: 'Classic green for natural, balanced feel',
    preview: '142 76% 36%',
    values: {
      light: {
        primary: '142 76% 36%',
        primaryForeground: '142 82% 96%',
        accent: '140 100% 95%',
        accentForeground: '154 86% 25%',
        ring: '142 76% 36%',
      },
      dark: {
        primary: '142 76% 52%',
        primaryForeground: '149 80% 8%',
        accent: '155 40% 23%',
        accentForeground: '152 80% 88%',
        ring: '142 76% 52%',
      },
    },
  },
  blue: {
    label: 'Blue',
    description: 'Trustworthy blue for professional interfaces',
    preview: '217 91% 60%',
    values: {
      light: {
        primary: '217 91% 60%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '217 100% 96%',
        accentForeground: '217 88% 40%',
        ring: '217 91% 60%',
      },
      dark: {
        primary: '217 91% 70%',
        primaryForeground: '222 68% 18%',
        accent: '222 60% 30%',
        accentForeground: '216 100% 92%',
        ring: '217 91% 70%',
      },
    },
  },
  purple: {
    label: 'Purple',
    description: 'Royal purple for creative and premium feel',
    preview: '262 83% 58%',
    values: {
      light: {
        primary: '262 83% 58%',
        primaryForeground: '260 100% 97%',
        accent: '262 100% 96%',
        accentForeground: '262 75% 40%',
        ring: '262 83% 58%',
      },
      dark: {
        primary: '262 83% 72%',
        primaryForeground: '261 83% 18%',
        accent: '263 57% 28%',
        accentForeground: '258 100% 93%',
        ring: '262 83% 72%',
      },
    },
  },
  pink: {
    label: 'Pink',
    description: 'Soft pink for friendly, approachable designs',
    preview: '330 81% 60%',
    values: {
      light: {
        primary: '330 81% 60%',
        primaryForeground: '333 82% 97%',
        accent: '330 100% 96%',
        accentForeground: '330 75% 42%',
        ring: '330 81% 60%',
      },
      dark: {
        primary: '330 81% 72%',
        primaryForeground: '343 88% 15%',
        accent: '339 49% 24%',
        accentForeground: '343 90% 92%',
        ring: '330 81% 72%',
      },
    },
  },
  red: {
    label: 'Red',
    description: 'Bold red for attention-grabbing actions',
    preview: '0 84% 60%',
    values: {
      light: {
        primary: '0 84% 60%',
        primaryForeground: '355 100% 96%',
        accent: '0 100% 95%',
        accentForeground: '0 78% 40%',
        ring: '0 84% 60%',
      },
      dark: {
        primary: '0 84% 70%',
        primaryForeground: '354 82% 15%',
        accent: '0 56% 28%',
        accentForeground: '0 92% 92%',
        ring: '0 84% 70%',
      },
    },
  },
  brown: {
    label: 'Brown',
    description: 'Earthy brown for warm, grounded aesthetics',
    preview: '25 50% 40%',
    values: {
      light: {
        primary: '25 50% 40%',
        primaryForeground: '20 100% 96%',
        accent: '25 60% 92%',
        accentForeground: '25 45% 30%',
        ring: '25 50% 40%',
      },
      dark: {
        primary: '25 50% 60%',
        primaryForeground: '24 98% 14%',
        accent: '22 52% 26%',
        accentForeground: '24 96% 92%',
        ring: '25 50% 60%',
      },
    },
  },
  gold: {
    label: 'Gold',
    description: 'Luxurious gold for premium experiences',
    preview: '43 96% 56%',
    values: {
      light: {
        primary: '43 96% 56%',
        primaryForeground: '26 100% 12%',
        accent: '43 100% 95%',
        accentForeground: '35 85% 38%',
        ring: '43 96% 56%',
      },
      dark: {
        primary: '43 96% 70%',
        primaryForeground: '30 100% 14%',
        accent: '34 48% 30%',
        accentForeground: '40 100% 92%',
        ring: '43 96% 70%',
      },
    },
  },
  silver: {
    label: 'Silver',
    description: 'Metallic silver for modern, sleek designs',
    preview: '210 16% 50%',
    values: {
      light: {
        primary: '210 16% 50%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 20% 92%',
        accentForeground: '210 14% 40%',
        ring: '210 16% 50%',
      },
      dark: {
        primary: '210 16% 70%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 18% 24%',
        accentForeground: '210 14% 84%',
        ring: '210 16% 70%',
      },
    },
  },
  bronze: {
    label: 'Bronze',
    description: 'Warm bronze for vintage, classic feel',
    preview: '30 45% 45%',
    values: {
      light: {
        primary: '30 45% 45%',
        primaryForeground: '20 100% 96%',
        accent: '30 55% 92%',
        accentForeground: '30 40% 35%',
        ring: '30 45% 45%',
      },
      dark: {
        primary: '30 45% 65%',
        primaryForeground: '24 98% 14%',
        accent: '22 52% 28%',
        accentForeground: '24 96% 92%',
        ring: '30 45% 65%',
      },
    },
  },
  turquoise: {
    label: 'Turquoise',
    description: 'Vibrant turquoise for tropical, fresh vibes',
    preview: '174 72% 47%',
    values: {
      light: {
        primary: '174 72% 47%',
        primaryForeground: '175 82% 96%',
        accent: '174 100% 95%',
        accentForeground: '174 68% 35%',
        ring: '174 72% 47%',
      },
      dark: {
        primary: '174 72% 63%',
        primaryForeground: '172 62% 12%',
        accent: '172 44% 26%',
        accentForeground: '170 92% 88%',
        ring: '174 72% 63%',
      },
    },
  },
  lavender: {
    label: 'Lavender',
    description: 'Gentle lavender for calm, peaceful interfaces',
    preview: '270 68% 65%',
    values: {
      light: {
        primary: '270 68% 65%',
        primaryForeground: '288 100% 97%',
        accent: '270 100% 96%',
        accentForeground: '270 62% 45%',
        ring: '270 68% 65%',
      },
      dark: {
        primary: '270 68% 75%',
        primaryForeground: '286 70% 18%',
        accent: '286 48% 32%',
        accentForeground: '286 84% 92%',
        ring: '270 68% 75%',
      },
    },
  },
  fuchsia: {
    label: 'Fuchsia',
    description: 'Electric fuchsia for bold, energetic designs',
    preview: '300 90% 60%',
    values: {
      light: {
        primary: '300 90% 60%',
        primaryForeground: '312 100% 97%',
        accent: '300 100% 96%',
        accentForeground: '300 80% 42%',
        ring: '300 90% 60%',
      },
      dark: {
        primary: '300 90% 72%',
        primaryForeground: '304 86% 16%',
        accent: '303 58% 32%',
        accentForeground: '302 100% 92%',
        ring: '300 90% 72%',
      },
    },
  },
  salmon: {
    label: 'Salmon',
    description: 'Soft salmon for warm, inviting tones',
    preview: '6 78% 68%',
    values: {
      light: {
        primary: '6 78% 68%',
        primaryForeground: '355 100% 96%',
        accent: '6 100% 95%',
        accentForeground: '6 70% 48%',
        ring: '6 78% 68%',
      },
      dark: {
        primary: '6 78% 78%',
        primaryForeground: '354 82% 15%',
        accent: '350 56% 30%',
        accentForeground: '350 92% 92%',
        ring: '6 78% 78%',
      },
    },
  },
  olive: {
    label: 'Olive',
    description: 'Muted olive for natural, earthy aesthetics',
    preview: '60 30% 45%',
    values: {
      light: {
        primary: '60 30% 45%',
        primaryForeground: '60 100% 98%',
        accent: '60 40% 92%',
        accentForeground: '60 28% 35%',
        ring: '60 30% 45%',
      },
      dark: {
        primary: '60 30% 65%',
        primaryForeground: '60 100% 12%',
        accent: '60 20% 26%',
        accentForeground: '60 36% 84%',
        ring: '60 30% 65%',
      },
    },
  },
  navy: {
    label: 'Navy',
    description: 'Deep navy for professional, trustworthy feel',
    preview: '220 70% 35%',
    values: {
      light: {
        primary: '220 70% 35%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 80% 92%',
        accentForeground: '220 65% 28%',
        ring: '220 70% 35%',
      },
      dark: {
        primary: '220 70% 60%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 50% 24%',
        accentForeground: '220 16% 84%',
        ring: '220 70% 60%',
      },
    },
  },
  sky: {
    label: 'Sky',
    description: 'Bright sky blue for open, airy interfaces',
    preview: '199 89% 48%',
    values: {
      light: {
        primary: '199 89% 48%',
        primaryForeground: '192 100% 96%',
        accent: '199 100% 95%',
        accentForeground: '199 85% 36%',
        ring: '199 89% 48%',
      },
      dark: {
        primary: '199 89% 64%',
        primaryForeground: '192 66% 16%',
        accent: '192 68% 24%',
        accentForeground: '189 96% 92%',
        ring: '199 89% 64%',
      },
    },
  },
  forest: {
    label: 'Forest',
    description: 'Deep forest green for natural, grounded feel',
    preview: '142 50% 30%',
    values: {
      light: {
        primary: '142 50% 30%',
        primaryForeground: '142 82% 96%',
        accent: '140 60% 92%',
        accentForeground: '154 60% 22%',
        ring: '142 50% 30%',
      },
      dark: {
        primary: '142 50% 55%',
        primaryForeground: '149 80% 8%',
        accent: '155 35% 22%',
        accentForeground: '152 75% 85%',
        ring: '142 50% 55%',
      },
    },
  },
  ocean: {
    label: 'Ocean',
    description: 'Deep ocean blue for calm, immersive experiences',
    preview: '200 80% 40%',
    values: {
      light: {
        primary: '200 80% 40%',
        primaryForeground: '192 100% 96%',
        accent: '200 90% 93%',
        accentForeground: '200 75% 30%',
        ring: '200 80% 40%',
      },
      dark: {
        primary: '200 80% 58%',
        primaryForeground: '192 66% 16%',
        accent: '192 65% 24%',
        accentForeground: '189 95% 90%',
        ring: '200 80% 58%',
      },
    },
  },
  ruby: {
    label: 'Ruby',
    description: 'Deep red gemstone for passionate, bold designs',
    preview: '350 75% 50%',
    values: {
      light: {
        primary: '350 75% 50%',
        primaryForeground: '355 100% 96%',
        accent: '350 85% 94%',
        accentForeground: '350 70% 40%',
        ring: '350 75% 50%',
      },
      dark: {
        primary: '350 75% 65%',
        primaryForeground: '354 82% 15%',
        accent: '350 60% 28%',
        accentForeground: '350 92% 92%',
        ring: '350 75% 65%',
      },
    },
  },
  scarlet: {
    label: 'Scarlet',
    description: 'Bright red for energetic, attention-grabbing interfaces',
    preview: '0 100% 50%',
    values: {
      light: {
        primary: '0 100% 50%',
        primaryForeground: '355 100% 96%',
        accent: '0 100% 95%',
        accentForeground: '0 90% 40%',
        ring: '0 100% 50%',
      },
      dark: {
        primary: '0 100% 65%',
        primaryForeground: '354 82% 15%',
        accent: '0 70% 30%',
        accentForeground: '0 100% 92%',
        ring: '0 100% 65%',
      },
    },
  },
  cherry: {
    label: 'Cherry',
    description: 'Sweet cherry red for friendly, approachable designs',
    preview: '340 75% 55%',
    values: {
      light: {
        primary: '340 75% 55%',
        primaryForeground: '355 100% 96%',
        accent: '340 85% 94%',
        accentForeground: '340 70% 45%',
        ring: '340 75% 55%',
      },
      dark: {
        primary: '340 75% 70%',
        primaryForeground: '354 82% 15%',
        accent: '340 60% 30%',
        accentForeground: '340 92% 92%',
        ring: '340 75% 70%',
      },
    },
  },
  burgundy: {
    label: 'Burgundy',
    description: 'Rich wine red for sophisticated, elegant themes',
    preview: '345 65% 40%',
    values: {
      light: {
        primary: '345 65% 40%',
        primaryForeground: '355 100% 96%',
        accent: '345 75% 92%',
        accentForeground: '345 60% 32%',
        ring: '345 65% 40%',
      },
      dark: {
        primary: '345 65% 60%',
        primaryForeground: '354 82% 15%',
        accent: '345 55% 26%',
        accentForeground: '345 90% 92%',
        ring: '345 65% 60%',
      },
    },
  },
  maroon: {
    label: 'Maroon',
    description: 'Deep brown-red for warm, grounded aesthetics',
    preview: '0 60% 35%',
    values: {
      light: {
        primary: '0 60% 35%',
        primaryForeground: '355 100% 96%',
        accent: '0 70% 90%',
        accentForeground: '0 55% 28%',
        ring: '0 60% 35%',
      },
      dark: {
        primary: '0 60% 55%',
        primaryForeground: '354 82% 15%',
        accent: '0 50% 24%',
        accentForeground: '0 90% 92%',
        ring: '0 60% 55%',
      },
    },
  },
  carmine: {
    label: 'Carmine',
    description: 'Vibrant crimson for bold, dramatic statements',
    preview: '350 85% 52%',
    values: {
      light: {
        primary: '350 85% 52%',
        primaryForeground: '355 100% 96%',
        accent: '350 95% 94%',
        accentForeground: '350 80% 42%',
        ring: '350 85% 52%',
      },
      dark: {
        primary: '350 85% 67%',
        primaryForeground: '354 82% 15%',
        accent: '350 65% 29%',
        accentForeground: '350 95% 92%',
        ring: '350 85% 67%',
      },
    },
  },
  vermillion: {
    label: 'Vermillion',
    description: 'Bright orange-red for energetic, fiery designs',
    preview: '15 100% 55%',
    values: {
      light: {
        primary: '15 100% 55%',
        primaryForeground: '20 100% 96%',
        accent: '15 100% 95%',
        accentForeground: '15 90% 45%',
        ring: '15 100% 55%',
      },
      dark: {
        primary: '15 100% 70%',
        primaryForeground: '24 98% 14%',
        accent: '15 80% 32%',
        accentForeground: '15 100% 92%',
        ring: '15 100% 70%',
      },
    },
  },
  tangerine: {
    label: 'Tangerine',
    description: 'Vibrant orange for fresh, citrus-inspired themes',
    preview: '30 100% 60%',
    values: {
      light: {
        primary: '30 100% 60%',
        primaryForeground: '20 100% 96%',
        accent: '30 100% 95%',
        accentForeground: '30 90% 50%',
        ring: '30 100% 60%',
      },
      dark: {
        primary: '30 100% 75%',
        primaryForeground: '24 98% 14%',
        accent: '30 80% 35%',
        accentForeground: '30 100% 92%',
        ring: '30 100% 75%',
      },
    },
  },
  apricot: {
    label: 'Apricot',
    description: 'Soft orange for warm, gentle interfaces',
    preview: '25 75% 65%',
    values: {
      light: {
        primary: '25 75% 65%',
        primaryForeground: '20 100% 96%',
        accent: '25 85% 94%',
        accentForeground: '25 70% 55%',
        ring: '25 75% 65%',
      },
      dark: {
        primary: '25 75% 80%',
        primaryForeground: '24 98% 14%',
        accent: '25 65% 38%',
        accentForeground: '25 95% 92%',
        ring: '25 75% 80%',
      },
    },
  },
  honey: {
    label: 'Honey',
    description: 'Golden amber for sweet, inviting designs',
    preview: '40 90% 60%',
    values: {
      light: {
        primary: '40 90% 60%',
        primaryForeground: '26 100% 12%',
        accent: '40 100% 95%',
        accentForeground: '40 85% 50%',
        ring: '40 90% 60%',
      },
      dark: {
        primary: '40 90% 75%',
        primaryForeground: '30 100% 14%',
        accent: '40 70% 36%',
        accentForeground: '40 100% 92%',
        ring: '40 90% 75%',
      },
    },
  },
  butter: {
    label: 'Butter',
    description: 'Soft yellow for cheerful, sunny themes',
    preview: '50 95% 70%',
    values: {
      light: {
        primary: '50 95% 70%',
        primaryForeground: '26 100% 12%',
        accent: '50 100% 96%',
        accentForeground: '50 90% 60%',
        ring: '50 95% 70%',
      },
      dark: {
        primary: '50 95% 85%',
        primaryForeground: '30 100% 14%',
        accent: '50 75% 40%',
        accentForeground: '50 100% 92%',
        ring: '50 95% 85%',
      },
    },
  },
  canary: {
    label: 'Canary',
    description: 'Bright yellow for optimistic, energetic designs',
    preview: '55 100% 65%',
    values: {
      light: {
        primary: '55 100% 65%',
        primaryForeground: '26 100% 12%',
        accent: '55 100% 96%',
        accentForeground: '55 90% 55%',
        ring: '55 100% 65%',
      },
      dark: {
        primary: '55 100% 80%',
        primaryForeground: '30 100% 14%',
        accent: '55 80% 42%',
        accentForeground: '55 100% 92%',
        ring: '55 100% 80%',
      },
    },
  },
  lemon: {
    label: 'Lemon',
    description: 'Fresh yellow-green for zesty, vibrant themes',
    preview: '60 100% 60%',
    values: {
      light: {
        primary: '60 100% 60%',
        primaryForeground: '60 100% 12%',
        accent: '60 100% 96%',
        accentForeground: '60 90% 50%',
        ring: '60 100% 60%',
      },
      dark: {
        primary: '60 100% 75%',
        primaryForeground: '60 100% 12%',
        accent: '60 80% 38%',
        accentForeground: '60 100% 92%',
        ring: '60 100% 75%',
      },
    },
  },
  chartreuse: {
    label: 'Chartreuse',
    description: 'Vibrant yellow-green for bold, energetic interfaces',
    preview: '75 100% 55%',
    values: {
      light: {
        primary: '75 100% 55%',
        primaryForeground: '75 100% 12%',
        accent: '75 100% 95%',
        accentForeground: '75 90% 45%',
        ring: '75 100% 55%',
      },
      dark: {
        primary: '75 100% 70%',
        primaryForeground: '75 100% 12%',
        accent: '75 80% 32%',
        accentForeground: '75 100% 92%',
        ring: '75 100% 70%',
      },
    },
  },
  jade: {
    label: 'Jade',
    description: 'Rich green gemstone for luxurious, natural themes',
    preview: '150 50% 45%',
    values: {
      light: {
        primary: '150 50% 45%',
        primaryForeground: '142 82% 96%',
        accent: '150 60% 92%',
        accentForeground: '150 45% 35%',
        ring: '150 50% 45%',
      },
      dark: {
        primary: '150 50% 65%',
        primaryForeground: '149 80% 8%',
        accent: '150 40% 24%',
        accentForeground: '152 75% 85%',
        ring: '150 50% 65%',
      },
    },
  },
  aqua: {
    label: 'Aqua',
    description: 'Bright cyan-blue for fresh, aquatic themes',
    preview: '180 100% 50%',
    values: {
      light: {
        primary: '180 100% 50%',
        primaryForeground: '192 100% 96%',
        accent: '180 100% 95%',
        accentForeground: '180 90% 40%',
        ring: '180 100% 50%',
      },
      dark: {
        primary: '180 100% 65%',
        primaryForeground: '192 66% 16%',
        accent: '180 70% 28%',
        accentForeground: '189 95% 90%',
        ring: '180 100% 65%',
      },
    },
  },
  cerulean: {
    label: 'Cerulean',
    description: 'Sky blue for calm, serene interfaces',
    preview: '195 100% 55%',
    values: {
      light: {
        primary: '195 100% 55%',
        primaryForeground: '192 100% 96%',
        accent: '195 100% 95%',
        accentForeground: '195 90% 45%',
        ring: '195 100% 55%',
      },
      dark: {
        primary: '195 100% 70%',
        primaryForeground: '192 66% 16%',
        accent: '195 80% 32%',
        accentForeground: '189 95% 90%',
        ring: '195 100% 70%',
      },
    },
  },
  sapphire: {
    label: 'Sapphire',
    description: 'Deep blue gemstone for premium, trustworthy themes',
    preview: '210 80% 45%',
    values: {
      light: {
        primary: '210 80% 45%',
        primaryForeground: '192 100% 96%',
        accent: '210 90% 93%',
        accentForeground: '210 75% 35%',
        ring: '210 80% 45%',
      },
      dark: {
        primary: '210 80% 63%',
        primaryForeground: '192 66% 16%',
        accent: '210 65% 26%',
        accentForeground: '189 95% 90%',
        ring: '210 80% 63%',
      },
    },
  },
  royal: {
    label: 'Royal',
    description: 'Regal blue for elegant, sophisticated designs',
    preview: '225 70% 50%',
    values: {
      light: {
        primary: '225 70% 50%',
        primaryForeground: '192 100% 96%',
        accent: '225 80% 93%',
        accentForeground: '225 65% 40%',
        ring: '225 70% 50%',
      },
      dark: {
        primary: '225 70% 68%',
        primaryForeground: '192 66% 16%',
        accent: '225 60% 28%',
        accentForeground: '189 95% 90%',
        ring: '225 70% 68%',
      },
    },
  },
  periwinkle: {
    label: 'Periwinkle',
    description: 'Soft blue-purple for gentle, dreamy themes',
    preview: '240 60% 65%',
    values: {
      light: {
        primary: '240 60% 65%',
        primaryForeground: '240 100% 96%',
        accent: '240 70% 94%',
        accentForeground: '240 55% 55%',
        ring: '240 60% 65%',
      },
      dark: {
        primary: '240 60% 80%',
        primaryForeground: '240 66% 16%',
        accent: '240 50% 30%',
        accentForeground: '240 90% 92%',
        ring: '240 60% 80%',
      },
    },
  },
  amethyst: {
    label: 'Amethyst',
    description: 'Rich purple gemstone for mystical, creative themes',
    preview: '270 60% 55%',
    values: {
      light: {
        primary: '270 60% 55%',
        primaryForeground: '240 100% 96%',
        accent: '270 70% 94%',
        accentForeground: '270 55% 45%',
        ring: '270 60% 55%',
      },
      dark: {
        primary: '270 60% 72%',
        primaryForeground: '240 66% 16%',
        accent: '270 50% 30%',
        accentForeground: '270 90% 92%',
        ring: '270 60% 72%',
      },
    },
  },
  mauve: {
    label: 'Mauve',
    description: 'Soft purple-pink for elegant, refined designs',
    preview: '280 50% 65%',
    values: {
      light: {
        primary: '280 50% 65%',
        primaryForeground: '240 100% 96%',
        accent: '280 60% 94%',
        accentForeground: '280 45% 55%',
        ring: '280 50% 65%',
      },
      dark: {
        primary: '280 50% 80%',
        primaryForeground: '240 66% 16%',
        accent: '280 40% 32%',
        accentForeground: '280 88% 92%',
        ring: '280 50% 80%',
      },
    },
  },
  lilac: {
    label: 'Lilac',
    description: 'Light purple for fresh, spring-inspired themes',
    preview: '270 45% 70%',
    values: {
      light: {
        primary: '270 45% 70%',
        primaryForeground: '240 100% 96%',
        accent: '270 55% 95%',
        accentForeground: '270 40% 60%',
        ring: '270 45% 70%',
      },
      dark: {
        primary: '270 45% 85%',
        primaryForeground: '240 66% 16%',
        accent: '270 35% 36%',
        accentForeground: '270 85% 92%',
        ring: '270 45% 85%',
      },
    },
  },
  wisteria: {
    label: 'Wisteria',
    description: 'Soft lavender-purple for calm, peaceful interfaces',
    preview: '275 40% 68%',
    values: {
      light: {
        primary: '275 40% 68%',
        primaryForeground: '240 100% 96%',
        accent: '275 50% 94%',
        accentForeground: '275 35% 58%',
        ring: '275 40% 68%',
      },
      dark: {
        primary: '275 40% 83%',
        primaryForeground: '240 66% 16%',
        accent: '275 30% 34%',
        accentForeground: '275 83% 92%',
        ring: '275 40% 83%',
      },
    },
  },
  wine: {
    label: 'Wine',
    description: 'Deep red-purple for sophisticated, mature themes',
    preview: '330 55% 42%',
    values: {
      light: {
        primary: '330 55% 42%',
        primaryForeground: '355 100% 96%',
        accent: '330 65% 91%',
        accentForeground: '330 50% 34%',
        ring: '330 55% 42%',
      },
      dark: {
        primary: '330 55% 62%',
        primaryForeground: '354 82% 15%',
        accent: '330 45% 26%',
        accentForeground: '330 88% 92%',
        ring: '330 55% 62%',
      },
    },
  },
  copper: {
    label: 'Copper',
    description: 'Warm metallic for industrial, vintage themes',
    preview: '20 65% 50%',
    values: {
      light: {
        primary: '20 65% 50%',
        primaryForeground: '20 100% 96%',
        accent: '20 75% 92%',
        accentForeground: '20 60% 40%',
        ring: '20 65% 50%',
      },
      dark: {
        primary: '20 65% 70%',
        primaryForeground: '24 98% 14%',
        accent: '20 55% 30%',
        accentForeground: '20 95% 92%',
        ring: '20 65% 70%',
      },
    },
  },
  rust: {
    label: 'Rust',
    description: 'Earthy orange-brown for weathered, natural themes',
    preview: '15 50% 45%',
    values: {
      light: {
        primary: '15 50% 45%',
        primaryForeground: '20 100% 96%',
        accent: '15 60% 90%',
        accentForeground: '15 45% 35%',
        ring: '15 50% 45%',
      },
      dark: {
        primary: '15 50% 65%',
        primaryForeground: '24 98% 14%',
        accent: '15 40% 26%',
        accentForeground: '15 90% 92%',
        ring: '15 50% 65%',
      },
    },
  },
  khaki: {
    label: 'Khaki',
    description: 'Muted green-brown for military, outdoor themes',
    preview: '45 30% 55%',
    values: {
      light: {
        primary: '45 30% 55%',
        primaryForeground: '60 100% 98%',
        accent: '45 40% 92%',
        accentForeground: '45 25% 45%',
        ring: '45 30% 55%',
      },
      dark: {
        primary: '45 30% 75%',
        primaryForeground: '60 100% 12%',
        accent: '45 20% 32%',
        accentForeground: '45 85% 92%',
        ring: '45 30% 75%',
      },
    },
  },
  tan: {
    label: 'Tan',
    description: 'Warm beige for neutral, comfortable themes',
    preview: '30 25% 65%',
    values: {
      light: {
        primary: '30 25% 65%',
        primaryForeground: '20 100% 96%',
        accent: '30 35% 93%',
        accentForeground: '30 20% 55%',
        ring: '30 25% 65%',
      },
      dark: {
        primary: '30 25% 80%',
        primaryForeground: '24 98% 14%',
        accent: '30 15% 38%',
        accentForeground: '30 90% 92%',
        ring: '30 25% 80%',
      },
    },
  },
  beige: {
    label: 'Beige',
    description: 'Neutral tan for calm, minimalist themes',
    preview: '35 20% 75%',
    values: {
      light: {
        primary: '35 20% 75%',
        primaryForeground: '20 100% 96%',
        accent: '35 30% 94%',
        accentForeground: '35 15% 65%',
        ring: '35 20% 75%',
      },
      dark: {
        primary: '35 20% 85%',
        primaryForeground: '24 98% 14%',
        accent: '35 10% 42%',
        accentForeground: '35 88% 92%',
        ring: '35 20% 85%',
      },
    },
  },
  vanilla: {
    label: 'Vanilla',
    description: 'Soft cream for sweet, gentle themes',
    preview: '45 30% 85%',
    values: {
      light: {
        primary: '45 30% 85%',
        primaryForeground: '26 100% 12%',
        accent: '45 40% 96%',
        accentForeground: '45 25% 75%',
        ring: '45 30% 85%',
      },
      dark: {
        primary: '45 30% 90%',
        primaryForeground: '30 100% 14%',
        accent: '45 20% 48%',
        accentForeground: '45 95% 92%',
        ring: '45 30% 90%',
      },
    },
  },
  champagne: {
    label: 'Champagne',
    description: 'Elegant gold-white for luxurious, celebratory themes',
    preview: '40 25% 80%',
    values: {
      light: {
        primary: '40 25% 80%',
        primaryForeground: '26 100% 12%',
        accent: '40 35% 96%',
        accentForeground: '40 20% 70%',
        ring: '40 25% 80%',
      },
      dark: {
        primary: '40 25% 88%',
        primaryForeground: '30 100% 14%',
        accent: '40 15% 50%',
        accentForeground: '40 98% 92%',
        ring: '40 25% 88%',
      },
    },
  },
  platinum: {
    label: 'Platinum',
    description: 'Cool metallic for modern, premium themes',
    preview: '210 12% 70%',
    values: {
      light: {
        primary: '210 12% 70%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 18% 93%',
        accentForeground: '210 10% 60%',
        ring: '210 12% 70%',
      },
      dark: {
        primary: '210 12% 80%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 8% 32%',
        accentForeground: '210 14% 88%',
        ring: '210 12% 80%',
      },
    },
  },
  titanium: {
    label: 'Titanium',
    description: 'Strong metallic for industrial, tech themes',
    preview: '200 10% 60%',
    values: {
      light: {
        primary: '200 10% 60%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '200 15% 92%',
        accentForeground: '200 8% 50%',
        ring: '200 10% 60%',
      },
      dark: {
        primary: '200 10% 75%',
        primaryForeground: FOREGROUND_DARK,
        accent: '200 6% 28%',
        accentForeground: '200 12% 86%',
        ring: '200 10% 75%',
      },
    },
  },
  steel: {
    label: 'Steel',
    description: 'Cool grey-blue for professional, industrial themes',
    preview: '210 15% 55%',
    values: {
      light: {
        primary: '210 15% 55%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 20% 91%',
        accentForeground: '210 12% 45%',
        ring: '210 15% 55%',
      },
      dark: {
        primary: '210 15% 70%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 10% 26%',
        accentForeground: '210 16% 84%',
        ring: '210 15% 70%',
      },
    },
  },
  iron: {
    label: 'Iron',
    description: 'Dark metallic for strong, durable themes',
    preview: '210 8% 40%',
    values: {
      light: {
        primary: '210 8% 40%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 12% 88%',
        accentForeground: '210 6% 32%',
        ring: '210 8% 40%',
      },
      dark: {
        primary: '210 8% 60%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 5% 22%',
        accentForeground: '210 10% 80%',
        ring: '210 8% 60%',
      },
    },
  },
  'neon-pink': {
    label: 'Neon Pink',
    description: 'Electric pink for vibrant, energetic themes',
    preview: '320 100% 60%',
    values: {
      light: {
        primary: '320 100% 60%',
        primaryForeground: '320 100% 98%',
        accent: '320 100% 96%',
        accentForeground: '320 90% 45%',
        ring: '320 100% 60%',
      },
      dark: {
        primary: '320 100% 75%',
        primaryForeground: '320 90% 15%',
        accent: '320 80% 30%',
        accentForeground: '320 100% 92%',
        ring: '320 100% 75%',
      },
    },
  },
  'neon-green': {
    label: 'Neon Green',
    description: 'Bright green for cyberpunk and tech themes',
    preview: '120 100% 50%',
    values: {
      light: {
        primary: '120 100% 50%',
        primaryForeground: '120 100% 98%',
        accent: '120 100% 95%',
        accentForeground: '120 90% 35%',
        ring: '120 100% 50%',
      },
      dark: {
        primary: '120 100% 65%',
        primaryForeground: '120 90% 12%',
        accent: '120 80% 28%',
        accentForeground: '120 100% 92%',
        ring: '120 100% 65%',
      },
    },
  },
  'neon-blue': {
    label: 'Neon Blue',
    description: 'Electric blue for futuristic, digital themes',
    preview: '200 100% 55%',
    values: {
      light: {
        primary: '200 100% 55%',
        primaryForeground: '200 100% 98%',
        accent: '200 100% 96%',
        accentForeground: '200 90% 40%',
        ring: '200 100% 55%',
      },
      dark: {
        primary: '200 100% 70%',
        primaryForeground: '200 90% 14%',
        accent: '200 80% 32%',
        accentForeground: '200 100% 92%',
        ring: '200 100% 70%',
      },
    },
  },
  'neon-yellow': {
    label: 'Neon Yellow',
    description: 'Vibrant yellow for attention-grabbing themes',
    preview: '60 100% 55%',
    values: {
      light: {
        primary: '60 100% 55%',
        primaryForeground: '60 100% 10%',
        accent: '60 100% 95%',
        accentForeground: '60 90% 40%',
        ring: '60 100% 55%',
      },
      dark: {
        primary: '60 100% 70%',
        primaryForeground: '60 100% 12%',
        accent: '60 80% 30%',
        accentForeground: '60 100% 92%',
        ring: '60 100% 70%',
      },
    },
  },
  'neon-cyan': {
    label: 'Neon Cyan',
    description: 'Bright cyan for modern, tech-forward themes',
    preview: '180 100% 50%',
    values: {
      light: {
        primary: '180 100% 50%',
        primaryForeground: '180 100% 98%',
        accent: '180 100% 96%',
        accentForeground: '180 90% 35%',
        ring: '180 100% 50%',
      },
      dark: {
        primary: '180 100% 65%',
        primaryForeground: '180 90% 12%',
        accent: '180 80% 28%',
        accentForeground: '180 100% 92%',
        ring: '180 100% 65%',
      },
    },
  },
  'neon-orange': {
    label: 'Neon Orange',
    description: 'Electric orange for energetic, bold themes',
    preview: '25 100% 55%',
    values: {
      light: {
        primary: '25 100% 55%',
        primaryForeground: '25 100% 98%',
        accent: '25 100% 96%',
        accentForeground: '25 90% 40%',
        ring: '25 100% 55%',
      },
      dark: {
        primary: '25 100% 70%',
        primaryForeground: '25 90% 14%',
        accent: '25 80% 32%',
        accentForeground: '25 100% 92%',
        ring: '25 100% 70%',
      },
    },
  },
  'neon-purple': {
    label: 'Neon Purple',
    description: 'Vibrant purple for creative, artistic themes',
    preview: '280 100% 60%',
    values: {
      light: {
        primary: '280 100% 60%',
        primaryForeground: '280 100% 98%',
        accent: '280 100% 96%',
        accentForeground: '280 90% 45%',
        ring: '280 100% 60%',
      },
      dark: {
        primary: '280 100% 75%',
        primaryForeground: '280 90% 15%',
        accent: '280 80% 30%',
        accentForeground: '280 100% 92%',
        ring: '280 100% 75%',
      },
    },
  },
  'moss-green': {
    label: 'Moss Green',
    description: 'Natural green for earthy, organic themes',
    preview: '120 25% 35%',
    values: {
      light: {
        primary: '120 25% 35%',
        primaryForeground: '120 30% 96%',
        accent: '120 35% 93%',
        accentForeground: '120 22% 28%',
        ring: '120 25% 35%',
      },
      dark: {
        primary: '120 25% 55%',
        primaryForeground: '120 30% 12%',
        accent: '120 20% 24%',
        accentForeground: '120 30% 82%',
        ring: '120 25% 55%',
      },
    },
  },
  'earth-brown': {
    label: 'Earth Brown',
    description: 'Rich brown for grounded, natural themes',
    preview: '30 40% 35%',
    values: {
      light: {
        primary: '30 40% 35%',
        primaryForeground: '30 45% 96%',
        accent: '30 50% 92%',
        accentForeground: '30 35% 28%',
        ring: '30 40% 35%',
      },
      dark: {
        primary: '30 40% 58%',
        primaryForeground: '30 45% 12%',
        accent: '30 30% 26%',
        accentForeground: '30 45% 84%',
        ring: '30 40% 58%',
      },
    },
  },
  'forest-deep': {
    label: 'Deep Forest',
    description: 'Dark green for mysterious, woodland themes',
    preview: '140 50% 25%',
    values: {
      light: {
        primary: '140 50% 25%',
        primaryForeground: '140 55% 96%',
        accent: '140 60% 90%',
        accentForeground: '140 45% 20%',
        ring: '140 50% 25%',
      },
      dark: {
        primary: '140 50% 45%',
        primaryForeground: '140 55% 10%',
        accent: '140 40% 22%',
        accentForeground: '140 55% 80%',
        ring: '140 50% 45%',
      },
    },
  },
  'river-blue': {
    label: 'River Blue',
    description: 'Calm blue for peaceful, flowing themes',
    preview: '200 60% 45%',
    values: {
      light: {
        primary: '200 60% 45%',
        primaryForeground: '200 65% 96%',
        accent: '200 70% 93%',
        accentForeground: '200 55% 35%',
        ring: '200 60% 45%',
      },
      dark: {
        primary: '200 60% 65%',
        primaryForeground: '200 65% 12%',
        accent: '200 50% 28%',
        accentForeground: '200 65% 86%',
        ring: '200 60% 65%',
      },
    },
  },
  chrome: {
    label: 'Chrome',
    description: 'Shiny metallic for sleek, modern themes',
    preview: '220 15% 75%',
    values: {
      light: {
        primary: '220 15% 75%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 20% 94%',
        accentForeground: '220 12% 65%',
        ring: '220 15% 75%',
      },
      dark: {
        primary: '220 15% 85%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 10% 40%',
        accentForeground: '220 18% 88%',
        ring: '220 15% 85%',
      },
    },
  },
  nickel: {
    label: 'Nickel',
    description: 'Cool silver for industrial, tech themes',
    preview: '210 10% 65%',
    values: {
      light: {
        primary: '210 10% 65%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 15% 92%',
        accentForeground: '210 8% 55%',
        ring: '210 10% 65%',
      },
      dark: {
        primary: '210 10% 78%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 6% 36%',
        accentForeground: '210 14% 86%',
        ring: '210 10% 78%',
      },
    },
  },
  pewter: {
    label: 'Pewter',
    description: 'Muted gray-blue for sophisticated themes',
    preview: '210 12% 55%',
    values: {
      light: {
        primary: '210 12% 55%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '210 18% 91%',
        accentForeground: '210 10% 45%',
        ring: '210 12% 55%',
      },
      dark: {
        primary: '210 12% 70%',
        primaryForeground: FOREGROUND_DARK,
        accent: '210 8% 30%',
        accentForeground: '210 16% 84%',
        ring: '210 12% 70%',
      },
    },
  },
  brass: {
    label: 'Brass',
    description: 'Warm golden metal for vintage, classic themes',
    preview: '38 50% 55%',
    values: {
      light: {
        primary: '38 50% 55%',
        primaryForeground: '38 55% 96%',
        accent: '38 60% 92%',
        accentForeground: '38 45% 45%',
        ring: '38 50% 55%',
      },
      dark: {
        primary: '38 50% 70%',
        primaryForeground: '38 55% 12%',
        accent: '38 40% 30%',
        accentForeground: '38 55% 88%',
        ring: '38 50% 70%',
      },
    },
  },
  aluminum: {
    label: 'Aluminum',
    description: 'Light metallic for clean, minimal themes',
    preview: '220 8% 80%',
    values: {
      light: {
        primary: '220 8% 80%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 12% 95%',
        accentForeground: '220 6% 70%',
        ring: '220 8% 80%',
      },
      dark: {
        primary: '220 8% 88%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 5% 44%',
        accentForeground: '220 12% 90%',
        ring: '220 8% 88%',
      },
    },
  },
  'pastel-pink': {
    label: 'Pastel Pink',
    description: 'Soft pink for gentle, feminine themes',
    preview: '340 60% 75%',
    values: {
      light: {
        primary: '340 60% 75%',
        primaryForeground: '340 65% 96%',
        accent: '340 70% 94%',
        accentForeground: '340 55% 65%',
        ring: '340 60% 75%',
      },
      dark: {
        primary: '340 60% 82%',
        primaryForeground: '340 65% 12%',
        accent: '340 50% 38%',
        accentForeground: '340 65% 90%',
        ring: '340 60% 82%',
      },
    },
  },
  'pastel-blue': {
    label: 'Pastel Blue',
    description: 'Light blue for calm, peaceful themes',
    preview: '200 60% 80%',
    values: {
      light: {
        primary: '200 60% 80%',
        primaryForeground: '200 65% 96%',
        accent: '200 70% 94%',
        accentForeground: '200 55% 70%',
        ring: '200 60% 80%',
      },
      dark: {
        primary: '200 60% 85%',
        primaryForeground: '200 65% 12%',
        accent: '200 50% 40%',
        accentForeground: '200 65% 92%',
        ring: '200 60% 85%',
      },
    },
  },
  'pastel-green': {
    label: 'Pastel Green',
    description: 'Soft green for fresh, natural themes',
    preview: '150 50% 75%',
    values: {
      light: {
        primary: '150 50% 75%',
        primaryForeground: '150 55% 96%',
        accent: '150 60% 94%',
        accentForeground: '150 45% 65%',
        ring: '150 50% 75%',
      },
      dark: {
        primary: '150 50% 82%',
        primaryForeground: '150 55% 12%',
        accent: '150 40% 38%',
        accentForeground: '150 55% 90%',
        ring: '150 50% 82%',
      },
    },
  },
  'pastel-yellow': {
    label: 'Pastel Yellow',
    description: 'Light yellow for cheerful, sunny themes',
    preview: '55 70% 80%',
    values: {
      light: {
        primary: '55 70% 80%',
        primaryForeground: '55 75% 96%',
        accent: '55 80% 94%',
        accentForeground: '55 65% 70%',
        ring: '55 70% 80%',
      },
      dark: {
        primary: '55 70% 85%',
        primaryForeground: '55 75% 12%',
        accent: '55 60% 40%',
        accentForeground: '55 75% 92%',
        ring: '55 70% 85%',
      },
    },
  },
  'pastel-purple': {
    label: 'Pastel Purple',
    description: 'Soft purple for dreamy, creative themes',
    preview: '280 50% 75%',
    values: {
      light: {
        primary: '280 50% 75%',
        primaryForeground: '280 55% 96%',
        accent: '280 60% 94%',
        accentForeground: '280 45% 65%',
        ring: '280 50% 75%',
      },
      dark: {
        primary: '280 50% 82%',
        primaryForeground: '280 55% 12%',
        accent: '280 40% 38%',
        accentForeground: '280 55% 90%',
        ring: '280 50% 82%',
      },
    },
  },
  'pastel-orange': {
    label: 'Pastel Orange',
    description: 'Warm orange for cozy, inviting themes',
    preview: '25 70% 75%',
    values: {
      light: {
        primary: '25 70% 75%',
        primaryForeground: '25 75% 96%',
        accent: '25 80% 94%',
        accentForeground: '25 65% 65%',
        ring: '25 70% 75%',
      },
      dark: {
        primary: '25 70% 82%',
        primaryForeground: '25 75% 12%',
        accent: '25 60% 38%',
        accentForeground: '25 75% 92%',
        ring: '25 70% 82%',
      },
    },
  },
  'terminal-green': {
    label: 'Terminal Green',
    description: 'Classic green-on-black for programming themes',
    preview: '120 100% 40%',
    values: {
      light: {
        primary: '120 100% 40%',
        primaryForeground: '120 100% 98%',
        accent: '120 100% 95%',
        accentForeground: '120 90% 30%',
        ring: '120 100% 40%',
      },
      dark: {
        primary: '120 100% 55%',
        primaryForeground: '120 90% 8%',
        accent: '120 80% 20%',
        accentForeground: '120 100% 90%',
        ring: '120 100% 55%',
      },
    },
  },
  'horror-red': {
    label: 'Horror Red',
    description: 'Dark red for horror and thriller themes',
    preview: '0 80% 35%',
    values: {
      light: {
        primary: '0 80% 35%',
        primaryForeground: '0 85% 96%',
        accent: '0 90% 90%',
        accentForeground: '0 75% 28%',
        ring: '0 80% 35%',
      },
      dark: {
        primary: '0 80% 50%',
        primaryForeground: '0 85% 10%',
        accent: '0 70% 22%',
        accentForeground: '0 85% 88%',
        ring: '0 80% 50%',
      },
    },
  },
  'fnaf-yellow': {
    label: 'FNAF Yellow',
    description: 'Unsettling yellow for Five Nights at Freddy\'s themes',
    preview: '50 90% 55%',
    values: {
      light: {
        primary: '50 90% 55%',
        primaryForeground: '50 95% 96%',
        accent: '50 100% 94%',
        accentForeground: '50 85% 45%',
        ring: '50 90% 55%',
      },
      dark: {
        primary: '50 90% 68%',
        primaryForeground: '50 95% 12%',
        accent: '50 80% 30%',
        accentForeground: '50 95% 92%',
        ring: '50 90% 68%',
      },
    },
  },
  'outlast-dark': {
    label: 'Outlast Dark',
    description: 'Deep dark for Outlast horror atmosphere',
    preview: '0 0% 15%',
    values: {
      light: {
        primary: '0 0% 15%',
        primaryForeground: '0 0% 98%',
        accent: '0 0% 88%',
        accentForeground: '0 0% 12%',
        ring: '0 0% 15%',
      },
      dark: {
        primary: '0 0% 25%',
        primaryForeground: '0 0% 95%',
        accent: '0 0% 18%',
        accentForeground: '0 0% 85%',
        ring: '0 0% 25%',
      },
    },
  },
  'jujutsu-purple': {
    label: 'Jujutsu Purple',
    description: 'Mystical purple for Jujutsu Kaisen themes',
    preview: '270 60% 50%',
    values: {
      light: {
        primary: '270 60% 50%',
        primaryForeground: '270 65% 96%',
        accent: '270 70% 93%',
        accentForeground: '270 55% 40%',
        ring: '270 60% 50%',
      },
      dark: {
        primary: '270 60% 65%',
        primaryForeground: '270 65% 12%',
        accent: '270 50% 28%',
        accentForeground: '270 65% 88%',
        ring: '270 60% 65%',
      },
    },
  },
  'one-piece-white': {
    label: 'One Piece White',
    description: 'Pure white for Gear 5 liberation theme',
    preview: '0 0% 100%',
    values: {
      light: {
        primary: '0 0% 100%',
        primaryForeground: '0 0% 10%',
        accent: '0 0% 96%',
        accentForeground: '0 0% 20%',
        ring: '0 0% 100%',
      },
      dark: {
        primary: '0 0% 98%',
        primaryForeground: '0 0% 8%',
        accent: '0 0% 20%',
        accentForeground: '0 0% 95%',
        ring: '0 0% 98%',
      },
    },
  },
  'balloon-red': {
    label: 'Balloon Red',
    description: 'Bright red for festive balloon themes',
    preview: '0 100% 60%',
    values: {
      light: {
        primary: '0 100% 60%',
        primaryForeground: '0 100% 98%',
        accent: '0 100% 96%',
        accentForeground: '0 90% 45%',
        ring: '0 100% 60%',
      },
      dark: {
        primary: '0 100% 75%',
        primaryForeground: '0 90% 15%',
        accent: '0 80% 30%',
        accentForeground: '0 100% 92%',
        ring: '0 100% 75%',
      },
    },
  },
  'balloon-blue': {
    label: 'Balloon Blue',
    description: 'Vibrant blue for celebratory themes',
    preview: '210 100% 60%',
    values: {
      light: {
        primary: '210 100% 60%',
        primaryForeground: '210 100% 98%',
        accent: '210 100% 96%',
        accentForeground: '210 90% 45%',
        ring: '210 100% 60%',
      },
      dark: {
        primary: '210 100% 75%',
        primaryForeground: '210 90% 15%',
        accent: '210 80% 30%',
        accentForeground: '210 100% 92%',
        ring: '210 100% 75%',
      },
    },
  },
  'balloon-yellow': {
    label: 'Balloon Yellow',
    description: 'Cheerful yellow for party themes',
    preview: '55 100% 60%',
    values: {
      light: {
        primary: '55 100% 60%',
        primaryForeground: '55 100% 10%',
        accent: '55 100% 96%',
        accentForeground: '55 90% 45%',
        ring: '55 100% 60%',
      },
      dark: {
        primary: '55 100% 75%',
        primaryForeground: '55 100% 12%',
        accent: '55 80% 30%',
        accentForeground: '55 100% 92%',
        ring: '55 100% 75%',
      },
    },
  },
  'luck-green': {
    label: 'Luck Green',
    description: 'Fortune green for lucky themes',
    preview: '120 60% 50%',
    values: {
      light: {
        primary: '120 60% 50%',
        primaryForeground: '120 65% 96%',
        accent: '120 70% 93%',
        accentForeground: '120 55% 40%',
        ring: '120 60% 50%',
      },
      dark: {
        primary: '120 60% 65%',
        primaryForeground: '120 65% 12%',
        accent: '120 50% 28%',
        accentForeground: '120 65% 88%',
        ring: '120 60% 65%',
      },
    },
  },
  'towel-beige': {
    label: 'Towel Beige',
    description: 'Soft beige for textile, comfort themes',
    preview: '35 25% 80%',
    values: {
      light: {
        primary: '35 25% 80%',
        primaryForeground: '35 30% 96%',
        accent: '35 35% 94%',
        accentForeground: '35 20% 70%',
        ring: '35 25% 80%',
      },
      dark: {
        primary: '35 25% 85%',
        primaryForeground: '35 30% 12%',
        accent: '35 20% 42%',
        accentForeground: '35 30% 90%',
        ring: '35 25% 85%',
      },
    },
  },
  'shit-brown': {
    label: 'Shit Brown',
    description: 'Earthy brown for humorous, down-to-earth themes',
    preview: '30 50% 30%',
    values: {
      light: {
        primary: '30 50% 30%',
        primaryForeground: '30 55% 96%',
        accent: '30 60% 90%',
        accentForeground: '30 45% 24%',
        ring: '30 50% 30%',
      },
      dark: {
        primary: '30 50% 50%',
        primaryForeground: '30 55% 10%',
        accent: '30 40% 22%',
        accentForeground: '30 55% 80%',
        ring: '30 50% 50%',
      },
    },
  },
  'programming-green': {
    label: 'Programming Green',
    description: 'Classic terminal green for coding themes',
    preview: '120 100% 35%',
    values: {
      light: {
        primary: '120 100% 35%',
        primaryForeground: '120 100% 98%',
        accent: '120 100% 95%',
        accentForeground: '120 90% 28%',
        ring: '120 100% 35%',
      },
      dark: {
        primary: '120 100% 50%',
        primaryForeground: '120 90% 8%',
        accent: '120 80% 18%',
        accentForeground: '120 100% 88%',
        ring: '120 100% 50%',
      },
    },
  },
  'phasmophobia-blue': {
    label: 'Phasmophobia Blue',
    description: 'Eerie blue for ghost hunting themes',
    preview: '220 40% 40%',
    values: {
      light: {
        primary: '220 40% 40%',
        primaryForeground: '220 45% 96%',
        accent: '220 50% 90%',
        accentForeground: '220 35% 32%',
        ring: '220 40% 40%',
      },
      dark: {
        primary: '220 40% 55%',
        primaryForeground: '220 45% 10%',
        accent: '220 30% 24%',
        accentForeground: '220 45% 84%',
        ring: '220 40% 55%',
      },
    },
  },
  'teardown-orange': {
    label: 'Teardown Orange',
    description: 'Voxel orange for destruction themes',
    preview: '20 90% 55%',
    values: {
      light: {
        primary: '20 90% 55%',
        primaryForeground: '20 95% 96%',
        accent: '20 100% 94%',
        accentForeground: '20 85% 45%',
        ring: '20 90% 55%',
      },
      dark: {
        primary: '20 90% 68%',
        primaryForeground: '20 95% 12%',
        accent: '20 80% 30%',
        accentForeground: '20 95% 92%',
        ring: '20 90% 68%',
      },
    },
  },
  'dispatch-blue': {
    label: 'Dispatch Blue',
    description: 'Modern blue for Dispatch game themes',
    preview: '210 85% 50%',
    values: {
      light: {
        primary: '210 85% 50%',
        primaryForeground: '210 90% 96%',
        accent: '210 95% 93%',
        accentForeground: '210 80% 40%',
        ring: '210 85% 50%',
      },
      dark: {
        primary: '210 85% 65%',
        primaryForeground: '210 90% 12%',
        accent: '210 75% 28%',
        accentForeground: '210 90% 88%',
        ring: '210 85% 65%',
      },
    },
  },
  '90s-muted': {
    label: '90s Muted',
    description: 'Muted colors for 90s retro aesthetic',
    preview: '200 20% 50%',
    values: {
      light: {
        primary: '200 20% 50%',
        primaryForeground: '200 25% 96%',
        accent: '200 30% 91%',
        accentForeground: '200 18% 40%',
        ring: '200 20% 50%',
      },
      dark: {
        primary: '200 20% 65%',
        primaryForeground: '200 25% 12%',
        accent: '200 15% 28%',
        accentForeground: '200 25% 84%',
        ring: '200 20% 65%',
      },
    },
  },
  'electric-blue': {
    label: 'Electric Blue',
    description: 'Vibrant blue for energetic, dynamic themes',
    preview: '210 100% 55%',
    values: {
      light: {
        primary: '210 100% 55%',
        primaryForeground: '210 100% 98%',
        accent: '210 100% 96%',
        accentForeground: '210 90% 40%',
        ring: '210 100% 55%',
      },
      dark: {
        primary: '210 100% 70%',
        primaryForeground: '210 90% 14%',
        accent: '210 80% 30%',
        accentForeground: '210 100% 92%',
        ring: '210 100% 70%',
      },
    },
  },
  'fire-orange': {
    label: 'Fire Orange',
    description: 'Intense orange for passionate, fiery themes',
    preview: '15 100% 55%',
    values: {
      light: {
        primary: '15 100% 55%',
        primaryForeground: '15 100% 98%',
        accent: '15 100% 96%',
        accentForeground: '15 90% 40%',
        ring: '15 100% 55%',
      },
      dark: {
        primary: '15 100% 70%',
        primaryForeground: '15 90% 14%',
        accent: '15 80% 30%',
        accentForeground: '15 100% 92%',
        ring: '15 100% 70%',
      },
    },
  },
  'ice-blue': {
    label: 'Ice Blue',
    description: 'Cool blue for frozen, crisp themes',
    preview: '200 60% 70%',
    values: {
      light: {
        primary: '200 60% 70%',
        primaryForeground: '200 65% 96%',
        accent: '200 70% 94%',
        accentForeground: '200 55% 60%',
        ring: '200 60% 70%',
      },
      dark: {
        primary: '200 60% 80%',
        primaryForeground: '200 65% 12%',
        accent: '200 50% 36%',
        accentForeground: '200 65% 90%',
        ring: '200 60% 80%',
      },
    },
  },
  'lava-red': {
    label: 'Lava Red',
    description: 'Molten red for intense, powerful themes',
    preview: '5 90% 50%',
    values: {
      light: {
        primary: '5 90% 50%',
        primaryForeground: '5 95% 96%',
        accent: '5 100% 94%',
        accentForeground: '5 85% 40%',
        ring: '5 90% 50%',
      },
      dark: {
        primary: '5 90% 65%',
        primaryForeground: '5 95% 12%',
        accent: '5 80% 28%',
        accentForeground: '5 95% 92%',
        ring: '5 90% 65%',
      },
    },
  },
  'storm-gray': {
    label: 'Storm Gray',
    description: 'Dark gray for dramatic, moody themes',
    preview: '220 15% 40%',
    values: {
      light: {
        primary: '220 15% 40%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 20% 88%',
        accentForeground: '220 12% 32%',
        ring: '220 15% 40%',
      },
      dark: {
        primary: '220 15% 60%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 10% 24%',
        accentForeground: '220 18% 80%',
        ring: '220 15% 60%',
      },
    },
  },
  'sunshine-yellow': {
    label: 'Sunshine Yellow',
    description: 'Bright yellow for cheerful, optimistic themes',
    preview: '50 100% 60%',
    values: {
      light: {
        primary: '50 100% 60%',
        primaryForeground: '50 100% 10%',
        accent: '50 100% 96%',
        accentForeground: '50 90% 45%',
        ring: '50 100% 60%',
      },
      dark: {
        primary: '50 100% 75%',
        primaryForeground: '50 100% 12%',
        accent: '50 80% 30%',
        accentForeground: '50 100% 92%',
        ring: '50 100% 75%',
      },
    },
  },
  'moonlight-silver': {
    label: 'Moonlight Silver',
    description: 'Soft silver for nocturnal, elegant themes',
    preview: '220 10% 70%',
    values: {
      light: {
        primary: '220 10% 70%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '220 15% 93%',
        accentForeground: '220 8% 60%',
        ring: '220 10% 70%',
      },
      dark: {
        primary: '220 10% 80%',
        primaryForeground: FOREGROUND_DARK,
        accent: '220 6% 38%',
        accentForeground: '220 14% 88%',
        ring: '220 10% 80%',
      },
    },
  },
  charcoal: {
    label: 'Charcoal',
    description: 'Deep dark gray like charcoal',
    preview: '0 0% 25%',
    values: {
      light: {
        primary: '0 0% 25%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '0 0% 90%',
        accentForeground: '0 0% 20%',
        ring: '0 0% 25%',
      },
      dark: {
        primary: '0 0% 65%',
        primaryForeground: FOREGROUND_DARK,
        accent: '0 0% 18%',
        accentForeground: '0 0% 85%',
        ring: '0 0% 65%',
      },
    },
  },
  slate: {
    label: 'Slate',
    description: 'Cool blue-gray like slate stone',
    preview: '215 16% 47%',
    values: {
      light: {
        primary: '215 16% 47%',
        primaryForeground: FOREGROUND_LIGHT,
        accent: '215 20% 92%',
        accentForeground: '215 16% 35%',
        ring: '215 16% 47%',
      },
      dark: {
        primary: '215 16% 65%',
        primaryForeground: FOREGROUND_DARK,
        accent: '215 12% 22%',
        accentForeground: '215 20% 88%',
        ring: '215 16% 65%',
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
  snow: {
    label: 'Snow',
    description: 'Pure white with crisp clarity',
    values: {
      light: {
        background: '0 0% 100%',
        foreground: '222 35% 12%',
        card: '0 0% 100%',
        cardForeground: '222 35% 12%',
        popover: '0 0% 100%',
        popoverForeground: '222 35% 12%',
        muted: '210 20% 96%',
        mutedForeground: '215.4 16.3% 46.9%',
        secondary: '210 20% 96%',
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
  cream: {
    label: 'Cream',
    description: 'Warm off-white with subtle yellow undertones',
    values: {
      light: {
        background: '50 100% 98%',
        foreground: '222 35% 12%',
        card: '50 80% 96%',
        cardForeground: '222 35% 12%',
        popover: '50 80% 96%',
        popoverForeground: '222 35% 12%',
        muted: '48 60% 92%',
        mutedForeground: '222 20% 38%',
        secondary: '48 50% 88%',
        secondaryForeground: '222 35% 12%',
        border: '48 40% 86%',
        input: '48 40% 86%',
      },
      dark: {
        background: '222 35% 12%',
        foreground: '50 90% 95%',
        card: '222 30% 16%',
        cardForeground: '50 90% 95%',
        popover: '222 30% 16%',
        popoverForeground: '50 90% 95%',
        muted: '222 20% 24%',
        mutedForeground: '50 70% 80%',
        secondary: '222 20% 24%',
        secondaryForeground: '50 90% 95%',
        border: '222 20% 24%',
        input: '222 20% 24%',
      },
    },
  },
  pearl: {
    label: 'Pearl',
    description: 'Iridescent white with soft blue-grey hints',
    values: {
      light: {
        background: '220 30% 98%',
        foreground: '222 35% 12%',
        card: '220 25% 96%',
        cardForeground: '222 35% 12%',
        popover: '220 25% 96%',
        popoverForeground: '222 35% 12%',
        muted: '220 20% 92%',
        mutedForeground: '222 20% 38%',
        secondary: '220 18% 88%',
        secondaryForeground: '222 35% 12%',
        border: '220 16% 86%',
        input: '220 16% 86%',
      },
      dark: {
        background: '220 30% 12%',
        foreground: '220 30% 96%',
        card: '220 28% 16%',
        cardForeground: '220 30% 96%',
        popover: '220 28% 16%',
        popoverForeground: '220 30% 96%',
        muted: '220 20% 24%',
        mutedForeground: '220 18% 72%',
        secondary: '220 20% 24%',
        secondaryForeground: '220 30% 96%',
        border: '220 20% 24%',
        input: '220 20% 24%',
      },
    },
  },
  ivory: {
    label: 'Ivory',
    description: 'Soft white with warm beige undertones',
    values: {
      light: {
        background: '45 40% 98%',
        foreground: '222 35% 12%',
        card: '45 30% 96%',
        cardForeground: '222 35% 12%',
        popover: '45 30% 96%',
        popoverForeground: '222 35% 12%',
        muted: '45 25% 92%',
        mutedForeground: '222 20% 38%',
        secondary: '45 20% 88%',
        secondaryForeground: '222 35% 12%',
        border: '45 18% 86%',
        input: '45 18% 86%',
      },
      dark: {
        background: '222 35% 12%',
        foreground: '45 80% 95%',
        card: '222 30% 16%',
        cardForeground: '45 80% 95%',
        popover: '222 30% 16%',
        popoverForeground: '45 80% 95%',
        muted: '222 20% 24%',
        mutedForeground: '45 60% 80%',
        secondary: '222 20% 24%',
        secondaryForeground: '45 80% 95%',
        border: '222 20% 24%',
        input: '222 20% 24%',
      },
    },
  },
  sand: {
    label: 'Sand',
    description: 'Warm beige with desert-inspired tones',
    values: {
      light: {
        background: '35 30% 97%',
        foreground: '222 35% 12%',
        card: '35 25% 95%',
        cardForeground: '222 35% 12%',
        popover: '35 25% 95%',
        popoverForeground: '222 35% 12%',
        muted: '35 20% 90%',
        mutedForeground: '222 20% 38%',
        secondary: '35 18% 86%',
        secondaryForeground: '222 35% 12%',
        border: '35 16% 84%',
        input: '35 16% 84%',
      },
      dark: {
        background: '35 40% 11%',
        foreground: '35 70% 94%',
        card: '35 36% 15%',
        cardForeground: '35 70% 94%',
        popover: '35 36% 15%',
        popoverForeground: '35 70% 94%',
        muted: '35 28% 22%',
        mutedForeground: '35 50% 78%',
        secondary: '35 28% 22%',
        secondaryForeground: '35 70% 94%',
        border: '35 28% 22%',
        input: '35 28% 22%',
      },
    },
  },
  stone: {
    label: 'Stone',
    description: 'Neutral grey with natural stone texture feel',
    values: {
      light: {
        background: '220 15% 96%',
        foreground: '222 35% 12%',
        card: '220 12% 94%',
        cardForeground: '222 35% 12%',
        popover: '220 12% 94%',
        popoverForeground: '222 35% 12%',
        muted: '220 10% 90%',
        mutedForeground: '222 20% 38%',
        secondary: '220 8% 86%',
        secondaryForeground: '222 35% 12%',
        border: '220 10% 88%',
        input: '220 10% 88%',
      },
      dark: {
        background: '220 20% 13%',
        foreground: '220 30% 96%',
        card: '220 18% 17%',
        cardForeground: '220 30% 96%',
        popover: '220 18% 17%',
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
  slate: {
    label: 'Slate',
    description: 'Cool blue-grey with slate stone character',
    values: {
      light: {
        background: '214 20% 95%',
        foreground: '222 35% 12%',
        card: '214 18% 93%',
        cardForeground: '222 35% 12%',
        popover: '214 18% 93%',
        popoverForeground: '222 35% 12%',
        muted: '214 15% 88%',
        mutedForeground: '222 20% 38%',
        secondary: '214 12% 84%',
        secondaryForeground: '222 35% 12%',
        border: '214 14% 86%',
        input: '214 14% 86%',
      },
      dark: {
        background: '214 28% 12%',
        foreground: '214 40% 96%',
        card: '214 26% 16%',
        cardForeground: '214 40% 96%',
        popover: '214 26% 16%',
        popoverForeground: '214 40% 96%',
        muted: '214 20% 24%',
        mutedForeground: '214 25% 72%',
        secondary: '214 20% 24%',
        secondaryForeground: '214 40% 96%',
        border: '214 20% 24%',
        input: '214 20% 24%',
      },
    },
  },
  charcoal: {
    label: 'Charcoal',
    description: 'Deep grey with warm undertones',
    values: {
      light: {
        background: '220 12% 94%',
        foreground: '222 35% 12%',
        card: '220 10% 92%',
        cardForeground: '222 35% 12%',
        popover: '220 10% 92%',
        popoverForeground: '222 35% 12%',
        muted: '220 8% 88%',
        mutedForeground: '222 20% 38%',
        secondary: '220 6% 84%',
        secondaryForeground: '222 35% 12%',
        border: '220 8% 86%',
        input: '220 8% 86%',
      },
      dark: {
        background: '220 18% 10%',
        foreground: '220 30% 96%',
        card: '220 16% 14%',
        cardForeground: '220 30% 96%',
        popover: '220 16% 14%',
        popoverForeground: '220 30% 96%',
        muted: '220 12% 22%',
        mutedForeground: '220 18% 72%',
        secondary: '220 12% 22%',
        secondaryForeground: '220 30% 96%',
        border: '220 12% 22%',
        input: '220 12% 22%',
      },
    },
  },
  ash: {
    label: 'Ash',
    description: 'Cool grey with ashy, muted tones',
    values: {
      light: {
        background: '210 15% 95%',
        foreground: '222 35% 12%',
        card: '210 12% 93%',
        cardForeground: '222 35% 12%',
        popover: '210 12% 93%',
        popoverForeground: '222 35% 12%',
        muted: '210 10% 88%',
        mutedForeground: '222 20% 38%',
        secondary: '210 8% 84%',
        secondaryForeground: '222 35% 12%',
        border: '210 10% 86%',
        input: '210 10% 86%',
      },
      dark: {
        background: '210 20% 11%',
        foreground: '210 35% 96%',
        card: '210 18% 15%',
        cardForeground: '210 35% 96%',
        popover: '210 18% 15%',
        popoverForeground: '210 35% 96%',
        muted: '210 14% 23%',
        mutedForeground: '210 20% 72%',
        secondary: '210 14% 23%',
        secondaryForeground: '210 35% 96%',
        border: '210 14% 23%',
        input: '210 14% 23%',
      },
    },
  },
  smoke: {
    label: 'Smoke',
    description: 'Light grey with smoky, diffused feel',
    values: {
      light: {
        background: '220 10% 97%',
        foreground: '222 35% 12%',
        card: '220 8% 95%',
        cardForeground: '222 35% 12%',
        popover: '220 8% 95%',
        popoverForeground: '222 35% 12%',
        muted: '220 6% 91%',
        mutedForeground: '222 20% 38%',
        secondary: '220 5% 87%',
        secondaryForeground: '222 35% 12%',
        border: '220 6% 89%',
        input: '220 6% 89%',
      },
      dark: {
        background: '220 15% 9%',
        foreground: '220 30% 96%',
        card: '220 13% 13%',
        cardForeground: '220 30% 96%',
        popover: '220 13% 13%',
        popoverForeground: '220 30% 96%',
        muted: '220 10% 21%',
        mutedForeground: '220 18% 72%',
        secondary: '220 10% 21%',
        secondaryForeground: '220 30% 96%',
        border: '220 10% 21%',
        input: '220 10% 21%',
      },
    },
  },
  fog: {
    label: 'Fog',
    description: 'Misty grey with soft, blurred edges',
    values: {
      light: {
        background: '220 18% 96%',
        foreground: '222 35% 12%',
        card: '220 15% 94%',
        cardForeground: '222 35% 12%',
        popover: '220 15% 94%',
        popoverForeground: '222 35% 12%',
        muted: '220 12% 90%',
        mutedForeground: '222 20% 38%',
        secondary: '220 10% 86%',
        secondaryForeground: '222 35% 12%',
        border: '220 12% 88%',
        input: '220 12% 88%',
      },
      dark: {
        background: '220 22% 10%',
        foreground: '220 30% 96%',
        card: '220 20% 14%',
        cardForeground: '220 30% 96%',
        popover: '220 20% 14%',
        popoverForeground: '220 30% 96%',
        muted: '220 16% 22%',
        mutedForeground: '220 18% 72%',
        secondary: '220 16% 22%',
        secondaryForeground: '220 30% 96%',
        border: '220 16% 22%',
        input: '220 16% 22%',
      },
    },
  },
  cloud: {
    label: 'Cloud',
    description: 'Soft white-grey with cloud-like lightness',
    values: {
      light: {
        background: '220 25% 98%',
        foreground: '222 35% 12%',
        card: '220 22% 96%',
        cardForeground: '222 35% 12%',
        popover: '220 22% 96%',
        popoverForeground: '222 35% 12%',
        muted: '220 18% 92%',
        mutedForeground: '222 20% 38%',
        secondary: '220 16% 88%',
        secondaryForeground: '222 35% 12%',
        border: '220 18% 90%',
        input: '220 18% 90%',
      },
      dark: {
        background: '220 25% 11%',
        foreground: '220 35% 96%',
        card: '220 23% 15%',
        cardForeground: '220 35% 96%',
        popover: '220 23% 15%',
        popoverForeground: '220 35% 96%',
        muted: '220 19% 23%',
        mutedForeground: '220 20% 72%',
        secondary: '220 19% 23%',
        secondaryForeground: '220 35% 96%',
        border: '220 19% 23%',
        input: '220 19% 23%',
      },
    },
  },
  storm: {
    label: 'Storm',
    description: 'Dark grey with stormy, dramatic atmosphere',
    values: {
      light: {
        background: '220 8% 93%',
        foreground: '222 35% 12%',
        card: '220 6% 91%',
        cardForeground: '222 35% 12%',
        popover: '220 6% 91%',
        popoverForeground: '222 35% 12%',
        muted: '220 5% 87%',
        mutedForeground: '222 20% 38%',
        secondary: '220 4% 83%',
        secondaryForeground: '222 35% 12%',
        border: '220 5% 85%',
        input: '220 5% 85%',
      },
      dark: {
        background: '220 12% 8%',
        foreground: '220 30% 96%',
        card: '220 10% 12%',
        cardForeground: '220 30% 96%',
        popover: '220 10% 12%',
        popoverForeground: '220 30% 96%',
        muted: '220 8% 20%',
        mutedForeground: '220 18% 72%',
        secondary: '220 8% 20%',
        secondaryForeground: '220 30% 96%',
        border: '220 8% 20%',
        input: '220 8% 20%',
      },
    },
  },
  shadow: {
    label: 'Shadow',
    description: 'Deep grey with shadowy, mysterious depth',
    values: {
      light: {
        background: '220 6% 92%',
        foreground: '222 35% 12%',
        card: '220 5% 90%',
        cardForeground: '222 35% 12%',
        popover: '220 5% 90%',
        popoverForeground: '222 35% 12%',
        muted: '220 4% 86%',
        mutedForeground: '222 20% 38%',
        secondary: '220 3% 82%',
        secondaryForeground: '222 35% 12%',
        border: '220 4% 84%',
        input: '220 4% 84%',
      },
      dark: {
        background: '220 10% 7%',
        foreground: '220 30% 96%',
        card: '220 8% 11%',
        cardForeground: '220 30% 96%',
        popover: '220 8% 11%',
        popoverForeground: '220 30% 96%',
        muted: '220 6% 19%',
        mutedForeground: '220 18% 72%',
        secondary: '220 6% 19%',
        secondaryForeground: '220 30% 96%',
        border: '220 6% 19%',
        input: '220 6% 19%',
      },
    },
  },
  abyss: {
    label: 'Abyss',
    description: 'Ultra-dark with abyssal depth',
    values: {
      light: {
        background: '220 5% 91%',
        foreground: '222 35% 12%',
        card: '220 4% 89%',
        cardForeground: '222 35% 12%',
        popover: '220 4% 89%',
        popoverForeground: '222 35% 12%',
        muted: '220 3% 85%',
        mutedForeground: '222 20% 38%',
        secondary: '220 2% 81%',
        secondaryForeground: '222 35% 12%',
        border: '220 3% 83%',
        input: '220 3% 83%',
      },
      dark: {
        background: '230 40% 3%',
        foreground: '210 40% 97%',
        card: '230 35% 5%',
        cardForeground: '210 40% 97%',
        popover: '230 35% 5%',
        popoverForeground: '210 40% 97%',
        muted: '230 25% 15%',
        mutedForeground: '210 16% 72%',
        secondary: '230 25% 15%',
        secondaryForeground: '210 40% 97%',
        border: '230 25% 15%',
        input: '230 25% 15%',
      },
    },
  },
  deep: {
    label: 'Deep',
    description: 'Profound darkness with deep ocean feel',
    values: {
      light: {
        background: '220 4% 90%',
        foreground: '222 35% 12%',
        card: '220 3% 88%',
        cardForeground: '222 35% 12%',
        popover: '220 3% 88%',
        popoverForeground: '222 35% 12%',
        muted: '220 2% 84%',
        mutedForeground: '222 20% 38%',
        secondary: '220 1% 80%',
        secondaryForeground: '222 35% 12%',
        border: '220 2% 82%',
        input: '220 2% 82%',
      },
      dark: {
        background: '220 35% 4%',
        foreground: '210 40% 97%',
        card: '220 32% 6%',
        cardForeground: '210 40% 97%',
        popover: '220 32% 6%',
        popoverForeground: '210 40% 97%',
        muted: '220 22% 16%',
        mutedForeground: '210 16% 72%',
        secondary: '220 22% 16%',
        secondaryForeground: '210 40% 97%',
        border: '220 22% 16%',
        input: '220 22% 16%',
      },
    },
  },
  pitch: {
    label: 'Pitch',
    description: 'Pitch black with maximum contrast',
    values: {
      light: {
        background: '220 3% 89%',
        foreground: '222 35% 12%',
        card: '220 2% 87%',
        cardForeground: '222 35% 12%',
        popover: '220 2% 87%',
        popoverForeground: '222 35% 12%',
        muted: '220 1% 83%',
        mutedForeground: '222 20% 38%',
        secondary: '220 0% 79%',
        secondaryForeground: '222 35% 12%',
        border: '220 1% 81%',
        input: '220 1% 81%',
      },
      dark: {
        background: '0 0% 0%',
        foreground: '210 40% 98%',
        card: '0 0% 2%',
        cardForeground: '210 40% 98%',
        popover: '0 0% 2%',
        popoverForeground: '210 40% 98%',
        muted: '0 0% 15%',
        mutedForeground: '210 16% 72%',
        secondary: '0 0% 15%',
        secondaryForeground: '210 40% 98%',
        border: '0 0% 15%',
        input: '0 0% 15%',
      },
    },
  },
  coal: {
    label: 'Coal',
    description: 'Rich black with coal-like texture',
    values: {
      light: {
        background: '220 2% 88%',
        foreground: '222 35% 12%',
        card: '220 1% 86%',
        cardForeground: '222 35% 12%',
        popover: '220 1% 86%',
        popoverForeground: '222 35% 12%',
        muted: '220 0% 82%',
        mutedForeground: '222 20% 38%',
        secondary: '220 0% 78%',
        secondaryForeground: '222 35% 12%',
        border: '220 0% 80%',
        input: '220 0% 80%',
      },
      dark: {
        background: '0 0% 2%',
        foreground: '210 40% 98%',
        card: '0 0% 4%',
        cardForeground: '210 40% 98%',
        popover: '0 0% 4%',
        popoverForeground: '210 40% 98%',
        muted: '0 0% 16%',
        mutedForeground: '210 16% 72%',
        secondary: '0 0% 16%',
        secondaryForeground: '210 40% 98%',
        border: '0 0% 16%',
        input: '0 0% 16%',
      },
    },
  },
  jet: {
    label: 'Jet',
    description: 'Deep black with jet stone intensity',
    values: {
      light: {
        background: '220 1% 87%',
        foreground: '222 35% 12%',
        card: '220 0% 85%',
        cardForeground: '222 35% 12%',
        popover: '220 0% 85%',
        popoverForeground: '222 35% 12%',
        muted: '220 0% 81%',
        mutedForeground: '222 20% 38%',
        secondary: '220 0% 77%',
        secondaryForeground: '222 35% 12%',
        border: '220 0% 79%',
        input: '220 0% 79%',
      },
      dark: {
        background: '0 0% 1%',
        foreground: '210 40% 98%',
        card: '0 0% 3%',
        cardForeground: '210 40% 98%',
        popover: '0 0% 3%',
        popoverForeground: '210 40% 98%',
        muted: '0 0% 17%',
        mutedForeground: '210 16% 72%',
        secondary: '0 0% 17%',
        secondaryForeground: '210 40% 98%',
        border: '0 0% 17%',
        input: '0 0% 17%',
      },
    },
  },
  carbon: {
    label: 'Carbon',
    description: 'Pure carbon black with matte finish',
    values: {
      light: {
        background: '220 0% 86%',
        foreground: '222 35% 12%',
        card: '220 0% 84%',
        cardForeground: '222 35% 12%',
        popover: '220 0% 84%',
        popoverForeground: '222 35% 12%',
        muted: '220 0% 80%',
        mutedForeground: '222 20% 38%',
        secondary: '220 0% 76%',
        secondaryForeground: '222 35% 12%',
        border: '220 0% 78%',
        input: '220 0% 78%',
      },
      dark: {
        background: '0 0% 0%',
        foreground: '210 40% 98%',
        card: '0 0% 2%',
        cardForeground: '210 40% 98%',
        popover: '0 0% 2%',
        popoverForeground: '210 40% 98%',
        muted: '0 0% 18%',
        mutedForeground: '210 16% 72%',
        secondary: '0 0% 18%',
        secondaryForeground: '210 40% 98%',
        border: '0 0% 18%',
        input: '0 0% 18%',
      },
    },
  },
  cyberpunk: {
    label: 'Cyberpunk',
    description: 'Neon-lit dark surfaces with electric purple-pink glow',
    values: {
      light: {
        background: '280 20% 95%',
        foreground: '280 30% 15%',
        card: '280 15% 98%',
        cardForeground: '280 30% 15%',
        popover: '280 15% 98%',
        popoverForeground: '280 30% 15%',
        muted: '280 18% 90%',
        mutedForeground: '280 25% 40%',
        secondary: '280 16% 85%',
        secondaryForeground: '280 30% 15%',
        border: '280 20% 88%',
        input: '280 20% 88%',
      },
      dark: {
        background: '280 45% 8%',
        foreground: '300 85% 95%',
        card: '280 40% 12%',
        cardForeground: '300 85% 95%',
        popover: '280 40% 12%',
        popoverForeground: '300 85% 95%',
        muted: '280 35% 20%',
        mutedForeground: '300 60% 80%',
        secondary: '280 35% 20%',
        secondaryForeground: '300 85% 95%',
        border: '280 35% 20%',
        input: '280 35% 20%',
      },
    },
  },
  minecraft: {
    label: 'Minecraft',
    description: 'Blocky earth tones with natural green-brown palette',
    values: {
      light: {
        background: '85 35% 92%',
        foreground: '85 40% 12%',
        card: '85 30% 96%',
        cardForeground: '85 40% 12%',
        popover: '85 30% 96%',
        popoverForeground: '85 40% 12%',
        muted: '85 28% 88%',
        mutedForeground: '85 35% 38%',
        secondary: '85 25% 84%',
        secondaryForeground: '85 40% 12%',
        border: '85 30% 86%',
        input: '85 30% 86%',
      },
      dark: {
        background: '85 30% 10%',
        foreground: '85 50% 92%',
        card: '85 28% 14%',
        cardForeground: '85 50% 92%',
        popover: '85 28% 14%',
        popoverForeground: '85 50% 92%',
        muted: '85 22% 22%',
        mutedForeground: '85 40% 75%',
        secondary: '85 22% 22%',
        secondaryForeground: '85 50% 92%',
        border: '85 22% 22%',
        input: '85 22% 22%',
      },
    },
  },
  csgo: {
    label: 'CS:GO',
    description: 'Competitive orange-dark theme inspired by Counter-Strike',
    values: {
      light: {
        background: '25 25% 94%',
        foreground: '25 35% 14%',
        card: '25 20% 97%',
        cardForeground: '25 35% 14%',
        popover: '25 20% 97%',
        popoverForeground: '25 35% 14%',
        muted: '25 18% 90%',
        mutedForeground: '25 30% 40%',
        secondary: '25 16% 86%',
        secondaryForeground: '25 35% 14%',
        border: '25 20% 88%',
        input: '25 20% 88%',
      },
      dark: {
        background: '25 40% 9%',
        foreground: '25 70% 94%',
        card: '25 35% 13%',
        cardForeground: '25 70% 94%',
        popover: '25 35% 13%',
        popoverForeground: '25 70% 94%',
        muted: '25 30% 20%',
        mutedForeground: '25 55% 78%',
        secondary: '25 30% 20%',
        secondaryForeground: '25 70% 94%',
        border: '25 30% 20%',
        input: '25 30% 20%',
      },
    },
  },
  dota: {
    label: 'Dota 2',
    description: 'Mystical blue-red palette from the world of Dota',
    values: {
      light: {
        background: '220 30% 93%',
        foreground: '220 40% 14%',
        card: '220 25% 96%',
        cardForeground: '220 40% 14%',
        popover: '220 25% 96%',
        popoverForeground: '220 40% 14%',
        muted: '220 22% 89%',
        mutedForeground: '220 35% 40%',
        secondary: '220 20% 85%',
        secondaryForeground: '220 40% 14%',
        border: '220 25% 87%',
        input: '220 25% 87%',
      },
      dark: {
        background: '220 50% 8%',
        foreground: '220 70% 95%',
        card: '220 45% 12%',
        cardForeground: '220 70% 95%',
        popover: '220 45% 12%',
        popoverForeground: '220 70% 95%',
        muted: '220 40% 20%',
        mutedForeground: '220 60% 80%',
        secondary: '220 40% 20%',
        secondaryForeground: '220 70% 95%',
        border: '220 40% 20%',
        input: '220 40% 20%',
      },
    },
  },
  terraria: {
    label: 'Terraria',
    description: 'Adventure-ready earth tones with warm brown-orange base',
    values: {
      light: {
        background: '30 40% 93%',
        foreground: '30 45% 14%',
        card: '30 35% 96%',
        cardForeground: '30 45% 14%',
        popover: '30 35% 96%',
        popoverForeground: '30 45% 14%',
        muted: '30 32% 89%',
        mutedForeground: '30 40% 40%',
        secondary: '30 28% 85%',
        secondaryForeground: '30 45% 14%',
        border: '30 35% 87%',
        input: '30 35% 87%',
      },
      dark: {
        background: '30 45% 9%',
        foreground: '30 70% 94%',
        card: '30 40% 13%',
        cardForeground: '30 70% 94%',
        popover: '30 40% 13%',
        popoverForeground: '30 70% 94%',
        muted: '30 35% 20%',
        mutedForeground: '30 60% 78%',
        secondary: '30 35% 20%',
        secondaryForeground: '30 70% 94%',
        border: '30 35% 20%',
        input: '30 35% 20%',
      },
    },
  },
  geometrydash: {
    label: 'Geometry Dash',
    description: 'Vibrant neon colors with high-energy bright surfaces',
    values: {
      light: {
        background: '75 80% 98%',
        foreground: '75 50% 12%',
        card: '75 70% 100%',
        cardForeground: '75 50% 12%',
        popover: '75 70% 100%',
        popoverForeground: '75 50% 12%',
        muted: '75 60% 94%',
        mutedForeground: '75 45% 38%',
        secondary: '75 55% 90%',
        secondaryForeground: '75 50% 12%',
        border: '75 65% 88%',
        input: '75 65% 88%',
      },
      dark: {
        background: '75 50% 8%',
        foreground: '75 90% 95%',
        card: '75 45% 12%',
        cardForeground: '75 90% 95%',
        popover: '75 45% 12%',
        popoverForeground: '75 90% 95%',
        muted: '75 40% 20%',
        mutedForeground: '75 75% 80%',
        secondary: '75 40% 20%',
        secondaryForeground: '75 90% 95%',
        border: '75 40% 20%',
        input: '75 40% 20%',
      },
    },
  },
  marble: {
    label: 'Marble',
    description: 'Elegant white stone with subtle grey veins',
    values: {
      light: {
        background: '0 0% 98%',
        foreground: '0 0% 15%',
        card: '0 0% 100%',
        cardForeground: '0 0% 15%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 15%',
        muted: '0 0% 94%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 90%',
        secondaryForeground: '0 0% 15%',
        border: '0 0% 88%',
        input: '0 0% 88%',
      },
      dark: {
        background: '0 0% 8%',
        foreground: '0 0% 95%',
        card: '0 0% 12%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 20%',
        mutedForeground: '0 0% 75%',
        secondary: '0 0% 20%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 20%',
        input: '0 0% 20%',
      },
    },
  },
  moonlight: {
    label: 'Moonlight',
    description: 'Soft silver-blue for peaceful night themes',
    values: {
      light: {
        background: '220 30% 96%',
        foreground: '220 50% 15%',
        card: '220 25% 98%',
        cardForeground: '220 50% 15%',
        popover: '220 25% 98%',
        popoverForeground: '220 50% 15%',
        muted: '220 20% 92%',
        mutedForeground: '220 40% 40%',
        secondary: '220 18% 88%',
        secondaryForeground: '220 50% 15%',
        border: '220 25% 86%',
        input: '220 25% 86%',
      },
      dark: {
        background: '220 30% 10%',
        foreground: '220 30% 94%',
        card: '220 25% 14%',
        cardForeground: '220 30% 94%',
        popover: '220 25% 14%',
        popoverForeground: '220 30% 94%',
        muted: '220 20% 22%',
        mutedForeground: '220 25% 78%',
        secondary: '220 20% 22%',
        secondaryForeground: '220 30% 94%',
        border: '220 20% 22%',
        input: '220 20% 22%',
      },
    },
  },
  neon: {
    label: 'Neon',
    description: 'Vibrant electric colors for cyberpunk themes',
    values: {
      light: {
        background: '280 80% 5%',
        foreground: '280 100% 95%',
        card: '280 75% 8%',
        cardForeground: '280 100% 95%',
        popover: '280 75% 8%',
        popoverForeground: '280 100% 95%',
        muted: '280 70% 15%',
        mutedForeground: '280 90% 85%',
        secondary: '280 70% 15%',
        secondaryForeground: '280 100% 95%',
        border: '280 70% 20%',
        input: '280 70% 20%',
      },
      dark: {
        background: '280 85% 3%',
        foreground: '280 100% 97%',
        card: '280 80% 6%',
        cardForeground: '280 100% 97%',
        popover: '280 80% 6%',
        popoverForeground: '280 100% 97%',
        muted: '280 75% 12%',
        mutedForeground: '280 95% 88%',
        secondary: '280 75% 12%',
        secondaryForeground: '280 100% 97%',
        border: '280 75% 18%',
        input: '280 75% 18%',
      },
    },
  },
  tropical: {
    label: 'Tropical',
    description: 'Warm ocean blues and greens for vacation vibes',
    values: {
      light: {
        background: '180 40% 96%',
        foreground: '180 60% 15%',
        card: '180 35% 98%',
        cardForeground: '180 60% 15%',
        popover: '180 35% 98%',
        popoverForeground: '180 60% 15%',
        muted: '180 30% 92%',
        mutedForeground: '180 50% 40%',
        secondary: '180 25% 88%',
        secondaryForeground: '180 60% 15%',
        border: '180 35% 86%',
        input: '180 35% 86%',
      },
      dark: {
        background: '180 40% 10%',
        foreground: '180 40% 94%',
        card: '180 35% 14%',
        cardForeground: '180 40% 94%',
        popover: '180 35% 14%',
        popoverForeground: '180 40% 94%',
        muted: '180 30% 22%',
        mutedForeground: '180 35% 78%',
        secondary: '180 30% 22%',
        secondaryForeground: '180 40% 94%',
        border: '180 30% 22%',
        input: '180 30% 22%',
      },
    },
  },
  luxury: {
    label: 'Luxury',
    description: 'Rich gold and deep blacks for premium experiences',
    values: {
      light: {
        background: '45 20% 98%',
        foreground: '45 50% 12%',
        card: '45 15% 100%',
        cardForeground: '45 50% 12%',
        popover: '45 15% 100%',
        popoverForeground: '45 50% 12%',
        muted: '45 18% 94%',
        mutedForeground: '45 40% 38%',
        secondary: '45 15% 90%',
        secondaryForeground: '45 50% 12%',
        border: '45 20% 88%',
        input: '45 20% 88%',
      },
      dark: {
        background: '45 30% 8%',
        foreground: '45 60% 95%',
        card: '45 25% 12%',
        cardForeground: '45 60% 95%',
        popover: '45 25% 12%',
        popoverForeground: '45 60% 95%',
        muted: '45 20% 20%',
        mutedForeground: '45 50% 80%',
        secondary: '45 20% 20%',
        secondaryForeground: '45 60% 95%',
        border: '45 20% 20%',
        input: '45 20% 20%',
      },
    },
  },
  wood: {
    label: 'Wood',
    description: 'Warm brown tones for natural, rustic themes',
    values: {
      light: {
        background: '30 25% 94%',
        foreground: '30 50% 12%',
        card: '30 20% 96%',
        cardForeground: '30 50% 12%',
        popover: '30 20% 96%',
        popoverForeground: '30 50% 12%',
        muted: '30 22% 90%',
        mutedForeground: '30 40% 38%',
        secondary: '30 18% 86%',
        secondaryForeground: '30 50% 12%',
        border: '30 25% 84%',
        input: '30 25% 84%',
      },
      dark: {
        background: '30 30% 8%',
        foreground: '30 50% 94%',
        card: '30 25% 12%',
        cardForeground: '30 50% 94%',
        popover: '30 25% 12%',
        popoverForeground: '30 50% 94%',
        muted: '30 22% 20%',
        mutedForeground: '30 40% 78%',
        secondary: '30 22% 20%',
        secondaryForeground: '30 50% 94%',
        border: '30 22% 20%',
        input: '30 22% 20%',
      },
    },
  },
  'fnaf-dark': {
    label: 'FNAF Dark',
    description: 'Dark pizzeria atmosphere for Five Nights at Freddy\'s',
    values: {
      light: {
        background: '0 0% 15%',
        foreground: '0 0% 95%',
        card: '0 0% 18%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 18%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 22%',
        mutedForeground: '0 0% 80%',
        secondary: '0 0% 22%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 22%',
        input: '0 0% 22%',
      },
      dark: {
        background: '0 0% 8%',
        foreground: '0 0% 98%',
        card: '0 0% 12%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 18%',
        mutedForeground: '0 0% 75%',
        secondary: '0 0% 18%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 18%',
        input: '0 0% 18%',
      },
    },
  },
  'fnaf-bright': {
    label: 'FNAF Bright',
    description: 'Brighter but still unsettling FNAF atmosphere',
    values: {
      light: {
        background: '50 30% 85%',
        foreground: '50 50% 15%',
        card: '50 25% 90%',
        cardForeground: '50 50% 15%',
        popover: '50 25% 90%',
        popoverForeground: '50 50% 15%',
        muted: '50 28% 82%',
        mutedForeground: '50 40% 40%',
        secondary: '50 24% 78%',
        secondaryForeground: '50 50% 15%',
        border: '50 30% 76%',
        input: '50 30% 76%',
      },
      dark: {
        background: '50 25% 12%',
        foreground: '50 60% 92%',
        card: '50 22% 16%',
        cardForeground: '50 60% 92%',
        popover: '50 22% 16%',
        popoverForeground: '50 60% 92%',
        muted: '50 20% 24%',
        mutedForeground: '50 50% 75%',
        secondary: '50 20% 24%',
        secondaryForeground: '50 60% 92%',
        border: '50 20% 24%',
        input: '50 20% 24%',
      },
    },
  },
  'fnaf-springtrap': {
    label: 'FNAF Springtrap',
    description: 'Green-tinted horror for Springtrap theme',
    values: {
      light: {
        background: '120 30% 20%',
        foreground: '120 40% 90%',
        card: '120 28% 24%',
        cardForeground: '120 40% 90%',
        popover: '120 28% 24%',
        popoverForeground: '120 40% 90%',
        muted: '120 25% 28%',
        mutedForeground: '120 35% 75%',
        secondary: '120 25% 28%',
        secondaryForeground: '120 40% 90%',
        border: '120 25% 28%',
        input: '120 25% 28%',
      },
      dark: {
        background: '120 35% 10%',
        foreground: '120 50% 88%',
        card: '120 32% 14%',
        cardForeground: '120 50% 88%',
        popover: '120 32% 14%',
        popoverForeground: '120 50% 88%',
        muted: '120 28% 20%',
        mutedForeground: '120 45% 70%',
        secondary: '120 28% 20%',
        secondaryForeground: '120 50% 88%',
        border: '120 28% 20%',
        input: '120 28% 20%',
      },
    },
  },
  'fnaf-nightmare': {
    label: 'FNAF Nightmare',
    description: 'Dark nightmare atmosphere for FNAF 4',
    values: {
      light: {
        background: '0 0% 8%',
        foreground: '0 0% 95%',
        card: '0 0% 10%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 10%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 14%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 14%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 14%',
        input: '0 0% 14%',
      },
      dark: {
        background: '0 0% 4%',
        foreground: '0 0% 98%',
        card: '0 0% 6%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 6%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 10%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 10%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 10%',
        input: '0 0% 10%',
      },
    },
  },
  'fnaf-sister-location': {
    label: 'FNAF Sister Location',
    description: 'Futuristic blue tones for Sister Location',
    values: {
      light: {
        background: '210 40% 20%',
        foreground: '210 50% 92%',
        card: '210 38% 24%',
        cardForeground: '210 50% 92%',
        popover: '210 38% 24%',
        popoverForeground: '210 50% 92%',
        muted: '210 35% 28%',
        mutedForeground: '210 45% 78%',
        secondary: '210 35% 28%',
        secondaryForeground: '210 50% 92%',
        border: '210 35% 28%',
        input: '210 35% 28%',
      },
      dark: {
        background: '210 45% 12%',
        foreground: '210 55% 90%',
        card: '210 42% 16%',
        cardForeground: '210 55% 90%',
        popover: '210 42% 16%',
        popoverForeground: '210 55% 90%',
        muted: '210 38% 22%',
        mutedForeground: '210 50% 73%',
        secondary: '210 38% 22%',
        secondaryForeground: '210 55% 90%',
        border: '210 38% 22%',
        input: '210 38% 22%',
      },
    },
  },
  'fnaf-pizzeria': {
    label: 'FNAF Pizzeria Simulator',
    description: 'Mixed aesthetic for Pizzeria Simulator',
    values: {
      light: {
        background: '30 25% 25%',
        foreground: '30 40% 90%',
        card: '30 23% 28%',
        cardForeground: '30 40% 90%',
        popover: '30 23% 28%',
        popoverForeground: '30 40% 90%',
        muted: '30 20% 32%',
        mutedForeground: '30 35% 75%',
        secondary: '30 20% 32%',
        secondaryForeground: '30 40% 90%',
        border: '30 20% 32%',
        input: '30 20% 32%',
      },
      dark: {
        background: '30 30% 10%',
        foreground: '30 45% 88%',
        card: '30 28% 14%',
        cardForeground: '30 45% 88%',
        popover: '30 28% 14%',
        popoverForeground: '30 45% 88%',
        muted: '30 25% 20%',
        mutedForeground: '30 40% 70%',
        secondary: '30 25% 20%',
        secondaryForeground: '30 45% 88%',
        border: '30 25% 20%',
        input: '30 25% 20%',
      },
    },
  },
  'fnaf-ucn': {
    label: 'FNAF Ultimate Custom Night',
    description: 'Chaotic mixed colors for UCN',
    values: {
      light: {
        background: '280 30% 25%',
        foreground: '280 40% 90%',
        card: '280 28% 28%',
        cardForeground: '280 40% 90%',
        popover: '280 28% 28%',
        popoverForeground: '280 40% 90%',
        muted: '280 25% 32%',
        mutedForeground: '280 35% 75%',
        secondary: '280 25% 32%',
        secondaryForeground: '280 40% 90%',
        border: '280 25% 32%',
        input: '280 25% 32%',
      },
      dark: {
        background: '280 35% 12%',
        foreground: '280 45% 88%',
        card: '280 32% 16%',
        cardForeground: '280 45% 88%',
        popover: '280 32% 16%',
        popoverForeground: '280 45% 88%',
        muted: '280 30% 22%',
        mutedForeground: '280 40% 70%',
        secondary: '280 30% 22%',
        secondaryForeground: '280 45% 88%',
        border: '280 30% 22%',
        input: '280 30% 22%',
      },
    },
  },
  'fnaf-help-wanted': {
    label: 'FNAF Help Wanted',
    description: 'VR aesthetic for Help Wanted',
    values: {
      light: {
        background: '240 30% 20%',
        foreground: '240 40% 92%',
        card: '240 28% 24%',
        cardForeground: '240 40% 92%',
        popover: '240 28% 24%',
        popoverForeground: '240 40% 92%',
        muted: '240 25% 28%',
        mutedForeground: '240 35% 78%',
        secondary: '240 25% 28%',
        secondaryForeground: '240 40% 92%',
        border: '240 25% 28%',
        input: '240 25% 28%',
      },
      dark: {
        background: '240 35% 10%',
        foreground: '240 45% 90%',
        card: '240 32% 14%',
        cardForeground: '240 45% 90%',
        popover: '240 32% 14%',
        popoverForeground: '240 45% 90%',
        muted: '240 30% 20%',
        mutedForeground: '240 40% 73%',
        secondary: '240 30% 20%',
        secondaryForeground: '240 45% 90%',
        border: '240 30% 20%',
        input: '240 30% 20%',
      },
    },
  },
  'fnaf-security-breach': {
    label: 'FNAF Security Breach',
    description: 'Bright mall colors for Security Breach',
    values: {
      light: {
        background: '300 40% 85%',
        foreground: '300 50% 15%',
        card: '300 35% 90%',
        cardForeground: '300 50% 15%',
        popover: '300 35% 90%',
        popoverForeground: '300 50% 15%',
        muted: '300 38% 80%',
        mutedForeground: '300 45% 40%',
        secondary: '300 33% 75%',
        secondaryForeground: '300 50% 15%',
        border: '300 40% 73%',
        input: '300 40% 73%',
      },
      dark: {
        background: '300 35% 15%',
        foreground: '300 50% 90%',
        card: '300 32% 20%',
        cardForeground: '300 50% 90%',
        popover: '300 32% 20%',
        popoverForeground: '300 50% 90%',
        muted: '300 30% 26%',
        mutedForeground: '300 45% 75%',
        secondary: '300 30% 26%',
        secondaryForeground: '300 50% 90%',
        border: '300 30% 26%',
        input: '300 30% 26%',
      },
    },
  },
  'fnaf-ruin': {
    label: 'FNAF Ruin',
    description: 'Destroyed dark version for Ruin DLC',
    values: {
      light: {
        background: '0 0% 5%',
        foreground: '0 0% 95%',
        card: '0 0% 7%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 7%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 10%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 10%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 10%',
        input: '0 0% 10%',
      },
      dark: {
        background: '0 0% 2%',
        foreground: '0 0% 98%',
        card: '0 0% 4%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 4%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 6%',
        mutedForeground: '0 0% 60%',
        secondary: '0 0% 6%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 6%',
        input: '0 0% 6%',
      },
    },
  },
  'fnaf-help-wanted-2': {
    label: 'FNAF Help Wanted 2',
    description: 'Enhanced VR aesthetic for Help Wanted 2',
    values: {
      light: {
        background: '250 35% 18%',
        foreground: '250 45% 91%',
        card: '250 33% 22%',
        cardForeground: '250 45% 91%',
        popover: '250 33% 22%',
        popoverForeground: '250 45% 91%',
        muted: '250 30% 26%',
        mutedForeground: '250 40% 77%',
        secondary: '250 30% 26%',
        secondaryForeground: '250 45% 91%',
        border: '250 30% 26%',
        input: '250 30% 26%',
      },
      dark: {
        background: '250 40% 10%',
        foreground: '250 50% 89%',
        card: '250 37% 14%',
        cardForeground: '250 50% 89%',
        popover: '250 37% 14%',
        popoverForeground: '250 50% 89%',
        muted: '250 35% 20%',
        mutedForeground: '250 45% 72%',
        secondary: '250 35% 20%',
        secondaryForeground: '250 50% 89%',
        border: '250 35% 20%',
        input: '250 35% 20%',
      },
    },
  },
  'outlast-horror': {
    label: 'Outlast Horror',
    description: 'Dark horror atmosphere for Outlast',
    values: {
      light: {
        background: '0 0% 6%',
        foreground: '0 0% 96%',
        card: '0 0% 8%',
        cardForeground: '0 0% 96%',
        popover: '0 0% 8%',
        popoverForeground: '0 0% 96%',
        muted: '0 0% 12%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 12%',
        secondaryForeground: '0 0% 96%',
        border: '0 0% 12%',
        input: '0 0% 12%',
      },
      dark: {
        background: '0 0% 3%',
        foreground: '0 0% 98%',
        card: '0 0% 5%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 5%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 8%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 8%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 8%',
        input: '0 0% 8%',
      },
    },
  },
  'phasmophobia-eerie': {
    label: 'Phasmophobia Eerie',
    description: 'Eerie blue atmosphere for ghost hunting',
    values: {
      light: {
        background: '220 35% 18%',
        foreground: '220 45% 92%',
        card: '220 33% 22%',
        cardForeground: '220 45% 92%',
        popover: '220 33% 22%',
        popoverForeground: '220 45% 92%',
        muted: '220 30% 26%',
        mutedForeground: '220 40% 78%',
        secondary: '220 30% 26%',
        secondaryForeground: '220 45% 92%',
        border: '220 30% 26%',
        input: '220 30% 26%',
      },
      dark: {
        background: '220 40% 10%',
        foreground: '220 50% 90%',
        card: '220 37% 14%',
        cardForeground: '220 50% 90%',
        popover: '220 37% 14%',
        popoverForeground: '220 50% 90%',
        muted: '220 35% 20%',
        mutedForeground: '220 45% 73%',
        secondary: '220 35% 20%',
        secondaryForeground: '220 50% 90%',
        border: '220 35% 20%',
        input: '220 35% 20%',
      },
    },
  },
  'jujutsu-kaisen': {
    label: 'Jujutsu Kaisen',
    description: 'Mystical dark purple for Jujutsu Kaisen',
    values: {
      light: {
        background: '270 40% 20%',
        foreground: '270 50% 92%',
        card: '270 38% 24%',
        cardForeground: '270 50% 92%',
        popover: '270 38% 24%',
        popoverForeground: '270 50% 92%',
        muted: '270 35% 28%',
        mutedForeground: '270 45% 78%',
        secondary: '270 35% 28%',
        secondaryForeground: '270 50% 92%',
        border: '270 35% 28%',
        input: '270 35% 28%',
      },
      dark: {
        background: '270 45% 12%',
        foreground: '270 55% 90%',
        card: '270 42% 16%',
        cardForeground: '270 55% 90%',
        popover: '270 42% 16%',
        popoverForeground: '270 55% 90%',
        muted: '270 40% 22%',
        mutedForeground: '270 50% 73%',
        secondary: '270 40% 22%',
        secondaryForeground: '270 55% 90%',
        border: '270 40% 22%',
        input: '270 40% 22%',
      },
    },
  },
  'one-piece-joy': {
    label: 'One Piece Joy',
    description: 'Bright joyful colors for Gear 5 liberation',
    values: {
      light: {
        background: '0 0% 100%',
        foreground: '0 0% 10%',
        card: '0 0% 98%',
        cardForeground: '0 0% 10%',
        popover: '0 0% 98%',
        popoverForeground: '0 0% 10%',
        muted: '0 0% 95%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 92%',
        secondaryForeground: '0 0% 10%',
        border: '0 0% 90%',
        input: '0 0% 90%',
      },
      dark: {
        background: '0 0% 98%',
        foreground: '0 0% 8%',
        card: '0 0% 96%',
        cardForeground: '0 0% 8%',
        popover: '0 0% 96%',
        popoverForeground: '0 0% 8%',
        muted: '0 0% 93%',
        mutedForeground: '0 0% 40%',
        secondary: '0 0% 90%',
        secondaryForeground: '0 0% 8%',
        border: '0 0% 88%',
        input: '0 0% 88%',
      },
    },
  },
  '90s-muted': {
    label: '90s Muted',
    description: 'Muted retro colors of the 90s',
    values: {
      light: {
        background: '200 15% 92%',
        foreground: '200 30% 18%',
        card: '200 12% 95%',
        cardForeground: '200 30% 18%',
        popover: '200 12% 95%',
        popoverForeground: '200 30% 18%',
        muted: '200 18% 88%',
        mutedForeground: '200 25% 42%',
        secondary: '200 16% 85%',
        secondaryForeground: '200 30% 18%',
        border: '200 20% 82%',
        input: '200 20% 82%',
      },
      dark: {
        background: '200 25% 15%',
        foreground: '200 35% 88%',
        card: '200 22% 18%',
        cardForeground: '200 35% 88%',
        popover: '200 22% 18%',
        popoverForeground: '200 35% 88%',
        muted: '200 28% 24%',
        mutedForeground: '200 30% 70%',
        secondary: '200 28% 24%',
        secondaryForeground: '200 35% 88%',
        border: '200 28% 24%',
        input: '200 28% 24%',
      },
    },
  },
  'programming-terminal': {
    label: 'Programming Terminal',
    description: 'Classic terminal green-on-black aesthetic',
    values: {
      light: {
        background: '120 100% 8%',
        foreground: '120 100% 55%',
        card: '120 100% 10%',
        cardForeground: '120 100% 55%',
        popover: '120 100% 10%',
        popoverForeground: '120 100% 55%',
        muted: '120 100% 12%',
        mutedForeground: '120 100% 50%',
        secondary: '120 100% 12%',
        secondaryForeground: '120 100% 55%',
        border: '120 100% 12%',
        input: '120 100% 12%',
      },
      dark: {
        background: '120 100% 5%',
        foreground: '120 100% 60%',
        card: '120 100% 7%',
        cardForeground: '120 100% 60%',
        popover: '120 100% 7%',
        popoverForeground: '120 100% 60%',
        muted: '120 100% 9%',
        mutedForeground: '120 100% 55%',
        secondary: '120 100% 9%',
        secondaryForeground: '120 100% 60%',
        border: '120 100% 9%',
        input: '120 100% 9%',
      },
    },
  },
  'balloons-festive': {
    label: 'Balloons Festive',
    description: 'Bright festive colors for celebration',
    values: {
      light: {
        background: '0 100% 98%',
        foreground: '0 100% 15%',
        card: '210 100% 100%',
        cardForeground: '0 100% 15%',
        popover: '210 100% 100%',
        popoverForeground: '0 100% 15%',
        muted: '55 100% 94%',
        mutedForeground: '0 80% 40%',
        secondary: '320 100% 92%',
        secondaryForeground: '0 100% 15%',
        border: '210 100% 88%',
        input: '210 100% 88%',
      },
      dark: {
        background: '0 100% 12%',
        foreground: '0 100% 95%',
        card: '210 100% 15%',
        cardForeground: '0 100% 95%',
        popover: '210 100% 15%',
        popoverForeground: '0 100% 95%',
        muted: '55 100% 20%',
        mutedForeground: '0 80% 75%',
        secondary: '320 100% 24%',
        secondaryForeground: '0 100% 95%',
        border: '210 100% 22%',
        input: '210 100% 22%',
      },
    },
  },
  'teardown-voxel': {
    label: 'Teardown Voxel',
    description: 'Voxel destruction aesthetic for Teardown',
    values: {
      light: {
        background: '20 40% 88%',
        foreground: '20 50% 18%',
        card: '20 35% 92%',
        cardForeground: '20 50% 18%',
        popover: '20 35% 92%',
        popoverForeground: '20 50% 18%',
        muted: '20 38% 85%',
        mutedForeground: '20 45% 40%',
        secondary: '20 33% 82%',
        secondaryForeground: '20 50% 18%',
        border: '20 40% 80%',
        input: '20 40% 80%',
      },
      dark: {
        background: '20 45% 12%',
        foreground: '20 55% 88%',
        card: '20 42% 16%',
        cardForeground: '20 55% 88%',
        popover: '20 42% 16%',
        popoverForeground: '20 55% 88%',
        muted: '20 40% 22%',
        mutedForeground: '20 50% 70%',
        secondary: '20 40% 22%',
        secondaryForeground: '20 55% 88%',
        border: '20 40% 22%',
        input: '20 40% 22%',
      },
    },
  },
  'dispatch-modern': {
    label: 'Dispatch Modern',
    description: 'Modern blue aesthetic for Dispatch game',
    values: {
      light: {
        background: '210 50% 92%',
        foreground: '210 60% 16%',
        card: '210 45% 95%',
        cardForeground: '210 60% 16%',
        popover: '210 45% 95%',
        popoverForeground: '210 60% 16%',
        muted: '210 48% 89%',
        mutedForeground: '210 55% 38%',
        secondary: '210 43% 86%',
        secondaryForeground: '210 60% 16%',
        border: '210 50% 84%',
        input: '210 50% 84%',
      },
      dark: {
        background: '210 55% 14%',
        foreground: '210 65% 90%',
        card: '210 52% 18%',
        cardForeground: '210 65% 90%',
        popover: '210 52% 18%',
        popoverForeground: '210 65% 90%',
        muted: '210 50% 24%',
        mutedForeground: '210 60% 73%',
        secondary: '210 50% 24%',
        secondaryForeground: '210 65% 90%',
        border: '210 50% 24%',
        input: '210 50% 24%',
      },
    },
  },
  'horror-dark': {
    label: 'Horror Dark',
    description: 'Deep dark for horror themes',
    values: {
      light: {
        background: '0 0% 4%',
        foreground: '0 0% 96%',
        card: '0 0% 6%',
        cardForeground: '0 0% 96%',
        popover: '0 0% 6%',
        popoverForeground: '0 0% 96%',
        muted: '0 0% 9%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 9%',
        secondaryForeground: '0 0% 96%',
        border: '0 0% 9%',
        input: '0 0% 9%',
      },
      dark: {
        background: '0 0% 2%',
        foreground: '0 0% 98%',
        card: '0 0% 4%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 4%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 6%',
        mutedForeground: '0 0% 60%',
        secondary: '0 0% 6%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 6%',
        input: '0 0% 6%',
      },
    },
  },
  'terminal-green': {
    label: 'Terminal Green',
    description: 'Classic green terminal aesthetic',
    values: {
      light: {
        background: '120 100% 5%',
        foreground: '120 100% 60%',
        card: '120 100% 7%',
        cardForeground: '120 100% 60%',
        popover: '120 100% 7%',
        popoverForeground: '120 100% 60%',
        muted: '120 100% 9%',
        mutedForeground: '120 100% 55%',
        secondary: '120 100% 9%',
        secondaryForeground: '120 100% 60%',
        border: '120 100% 9%',
        input: '120 100% 9%',
      },
      dark: {
        background: '120 100% 3%',
        foreground: '120 100% 65%',
        card: '120 100% 5%',
        cardForeground: '120 100% 65%',
        popover: '120 100% 5%',
        popoverForeground: '120 100% 65%',
        muted: '120 100% 7%',
        mutedForeground: '120 100% 60%',
        secondary: '120 100% 7%',
        secondaryForeground: '120 100% 65%',
        border: '120 100% 7%',
        input: '120 100% 7%',
      },
    },
  },
  'neon-cyber': {
    label: 'Neon Cyber',
    description: 'Cyberpunk neon aesthetic',
    values: {
      light: {
        background: '280 50% 10%',
        foreground: '280 100% 85%',
        card: '280 48% 14%',
        cardForeground: '280 100% 85%',
        popover: '280 48% 14%',
        popoverForeground: '280 100% 85%',
        muted: '280 45% 18%',
        mutedForeground: '280 90% 75%',
        secondary: '280 45% 18%',
        secondaryForeground: '280 100% 85%',
        border: '280 45% 18%',
        input: '280 45% 18%',
      },
      dark: {
        background: '280 55% 6%',
        foreground: '280 100% 90%',
        card: '280 52% 10%',
        cardForeground: '280 100% 90%',
        popover: '280 52% 10%',
        popoverForeground: '280 100% 90%',
        muted: '280 50% 16%',
        mutedForeground: '280 95% 80%',
        secondary: '280 50% 16%',
        secondaryForeground: '280 100% 90%',
        border: '280 50% 16%',
        input: '280 50% 16%',
      },
    },
  },
  'pastel-dream': {
    label: 'Pastel Dream',
    description: 'Soft pastel colors for dreamy themes',
    values: {
      light: {
        background: '300 30% 98%',
        foreground: '300 40% 15%',
        card: '300 25% 100%',
        cardForeground: '300 40% 15%',
        popover: '300 25% 100%',
        popoverForeground: '300 40% 15%',
        muted: '300 28% 95%',
        mutedForeground: '300 35% 42%',
        secondary: '300 24% 92%',
        secondaryForeground: '300 40% 15%',
        border: '300 30% 90%',
        input: '300 30% 90%',
      },
      dark: {
        background: '300 35% 12%',
        foreground: '300 45% 88%',
        card: '300 32% 16%',
        cardForeground: '300 45% 88%',
        popover: '300 32% 16%',
        popoverForeground: '300 45% 88%',
        muted: '300 30% 22%',
        mutedForeground: '300 40% 70%',
        secondary: '300 30% 22%',
        secondaryForeground: '300 45% 88%',
        border: '300 30% 22%',
        input: '300 30% 22%',
      },
    },
  },
  'metallic-shine': {
    label: 'Metallic Shine',
    description: 'Shiny metallic surfaces',
    values: {
      light: {
        background: '220 10% 95%',
        foreground: '220 20% 15%',
        card: '220 8% 98%',
        cardForeground: '220 20% 15%',
        popover: '220 8% 98%',
        popoverForeground: '220 20% 15%',
        muted: '220 12% 92%',
        mutedForeground: '220 18% 42%',
        secondary: '220 10% 89%',
        secondaryForeground: '220 20% 15%',
        border: '220 15% 87%',
        input: '220 15% 87%',
      },
      dark: {
        background: '220 15% 10%',
        foreground: '220 25% 88%',
        card: '220 12% 14%',
        cardForeground: '220 25% 88%',
        popover: '220 12% 14%',
        popoverForeground: '220 25% 88%',
        muted: '220 18% 20%',
        mutedForeground: '220 22% 70%',
        secondary: '220 18% 20%',
        secondaryForeground: '220 25% 88%',
        border: '220 18% 20%',
        input: '220 18% 20%',
      },
    },
  },
  'nature-forest': {
    label: 'Nature Forest',
    description: 'Deep forest green atmosphere',
    values: {
      light: {
        background: '140 40% 92%',
        foreground: '140 50% 16%',
        card: '140 35% 95%',
        cardForeground: '140 50% 16%',
        popover: '140 35% 95%',
        popoverForeground: '140 50% 16%',
        muted: '140 38% 89%',
        mutedForeground: '140 45% 38%',
        secondary: '140 33% 86%',
        secondaryForeground: '140 50% 16%',
        border: '140 40% 84%',
        input: '140 40% 84%',
      },
      dark: {
        background: '140 45% 12%',
        foreground: '140 55% 88%',
        card: '140 42% 16%',
        cardForeground: '140 55% 88%',
        popover: '140 42% 16%',
        popoverForeground: '140 55% 88%',
        muted: '140 40% 22%',
        mutedForeground: '140 50% 70%',
        secondary: '140 40% 22%',
        secondaryForeground: '140 55% 88%',
        border: '140 40% 22%',
        input: '140 40% 22%',
      },
    },
  },
  'ocean-deep': {
    label: 'Ocean Deep',
    description: 'Deep ocean blue atmosphere',
    values: {
      light: {
        background: '200 50% 20%',
        foreground: '200 60% 92%',
        card: '200 48% 24%',
        cardForeground: '200 60% 92%',
        popover: '200 48% 24%',
        popoverForeground: '200 60% 92%',
        muted: '200 45% 28%',
        mutedForeground: '200 55% 78%',
        secondary: '200 45% 28%',
        secondaryForeground: '200 60% 92%',
        border: '200 45% 28%',
        input: '200 45% 28%',
      },
      dark: {
        background: '200 55% 10%',
        foreground: '200 65% 90%',
        card: '200 52% 14%',
        cardForeground: '200 65% 90%',
        popover: '200 52% 14%',
        popoverForeground: '200 65% 90%',
        muted: '200 50% 22%',
        mutedForeground: '200 60% 73%',
        secondary: '200 50% 22%',
        secondaryForeground: '200 65% 90%',
        border: '200 50% 22%',
        input: '200 50% 22%',
      },
    },
  },
  'sunset-warm': {
    label: 'Sunset Warm',
    description: 'Warm sunset orange tones',
    values: {
      light: {
        background: '25 60% 95%',
        foreground: '25 70% 16%',
        card: '25 55% 98%',
        cardForeground: '25 70% 16%',
        popover: '25 55% 98%',
        popoverForeground: '25 70% 16%',
        muted: '25 58% 92%',
        mutedForeground: '25 65% 40%',
        secondary: '25 53% 89%',
        secondaryForeground: '25 70% 16%',
        border: '25 60% 87%',
        input: '25 60% 87%',
      },
      dark: {
        background: '25 65% 12%',
        foreground: '25 75% 88%',
        card: '25 62% 16%',
        cardForeground: '25 75% 88%',
        popover: '25 62% 16%',
        popoverForeground: '25 75% 88%',
        muted: '25 60% 22%',
        mutedForeground: '25 70% 70%',
        secondary: '25 60% 22%',
        secondaryForeground: '25 75% 88%',
        border: '25 60% 22%',
        input: '25 60% 22%',
      },
    },
  },
  'moonlight-cool': {
    label: 'Moonlight Cool',
    description: 'Cool moonlight silver tones',
    values: {
      light: {
        background: '220 15% 96%',
        foreground: '220 25% 15%',
        card: '220 12% 98%',
        cardForeground: '220 25% 15%',
        popover: '220 12% 98%',
        popoverForeground: '220 25% 15%',
        muted: '220 18% 93%',
        mutedForeground: '220 22% 42%',
        secondary: '220 15% 90%',
        secondaryForeground: '220 25% 15%',
        border: '220 20% 88%',
        input: '220 20% 88%',
      },
      dark: {
        background: '220 20% 10%',
        foreground: '220 30% 88%',
        card: '220 17% 14%',
        cardForeground: '220 30% 88%',
        popover: '220 17% 14%',
        popoverForeground: '220 30% 88%',
        muted: '220 22% 20%',
        mutedForeground: '220 27% 70%',
        secondary: '220 22% 20%',
        secondaryForeground: '220 30% 88%',
        border: '220 22% 20%',
        input: '220 22% 20%',
      },
    },
  },
  'fire-passion': {
    label: 'Fire Passion',
    description: 'Intense fire red-orange',
    values: {
      light: {
        background: '10 80% 95%',
        foreground: '10 90% 16%',
        card: '10 75% 98%',
        cardForeground: '10 90% 16%',
        popover: '10 75% 98%',
        popoverForeground: '10 90% 16%',
        muted: '10 78% 92%',
        mutedForeground: '10 85% 40%',
        secondary: '10 73% 89%',
        secondaryForeground: '10 90% 16%',
        border: '10 80% 87%',
        input: '10 80% 87%',
      },
      dark: {
        background: '10 85% 12%',
        foreground: '10 95% 88%',
        card: '10 82% 16%',
        cardForeground: '10 95% 88%',
        popover: '10 82% 16%',
        popoverForeground: '10 95% 88%',
        muted: '10 80% 22%',
        mutedForeground: '10 90% 70%',
        secondary: '10 80% 22%',
        secondaryForeground: '10 95% 88%',
        border: '10 80% 22%',
        input: '10 80% 22%',
      },
    },
  },
  'ice-frozen': {
    label: 'Ice Frozen',
    description: 'Frozen ice blue-white',
    values: {
      light: {
        background: '200 40% 98%',
        foreground: '200 50% 15%',
        card: '200 35% 100%',
        cardForeground: '200 50% 15%',
        popover: '200 35% 100%',
        popoverForeground: '200 50% 15%',
        muted: '200 38% 95%',
        mutedForeground: '200 45% 40%',
        secondary: '200 33% 92%',
        secondaryForeground: '200 50% 15%',
        border: '200 40% 90%',
        input: '200 40% 90%',
      },
      dark: {
        background: '200 45% 10%',
        foreground: '200 55% 88%',
        card: '200 42% 14%',
        cardForeground: '200 55% 88%',
        popover: '200 42% 14%',
        popoverForeground: '200 55% 88%',
        muted: '200 40% 20%',
        mutedForeground: '200 50% 70%',
        secondary: '200 40% 20%',
        secondaryForeground: '200 55% 88%',
        border: '200 40% 20%',
        input: '200 40% 20%',
      },
    },
  },
  'storm-dramatic': {
    label: 'Storm Dramatic',
    description: 'Dramatic storm gray atmosphere',
    values: {
      light: {
        background: '220 20% 25%',
        foreground: '220 30% 90%',
        card: '220 18% 28%',
        cardForeground: '220 30% 90%',
        popover: '220 18% 28%',
        popoverForeground: '220 30% 90%',
        muted: '220 22% 32%',
        mutedForeground: '220 28% 75%',
        secondary: '220 22% 32%',
        secondaryForeground: '220 30% 90%',
        border: '220 22% 32%',
        input: '220 22% 32%',
      },
      dark: {
        background: '220 25% 10%',
        foreground: '220 35% 88%',
        card: '220 22% 14%',
        cardForeground: '220 35% 88%',
        popover: '220 22% 14%',
        popoverForeground: '220 35% 88%',
        muted: '220 24% 20%',
        mutedForeground: '220 32% 70%',
        secondary: '220 24% 20%',
        secondaryForeground: '220 35% 88%',
        border: '220 24% 20%',
        input: '220 24% 20%',
      },
    },
  },
  'calm-serene': {
    label: 'Calm Serene',
    description: 'Calm and serene atmosphere',
    values: {
      light: {
        background: '180 30% 96%',
        foreground: '180 40% 16%',
        card: '180 28% 98%',
        cardForeground: '180 40% 16%',
        popover: '180 28% 98%',
        popoverForeground: '180 40% 16%',
        muted: '180 32% 94%',
        mutedForeground: '180 38% 40%',
        secondary: '180 30% 92%',
        secondaryForeground: '180 40% 16%',
        border: '180 35% 90%',
        input: '180 35% 90%',
      },
      dark: {
        background: '180 35% 12%',
        foreground: '180 45% 88%',
        card: '180 32% 16%',
        cardForeground: '180 45% 88%',
        popover: '180 32% 16%',
        popoverForeground: '180 45% 88%',
        muted: '180 34% 22%',
        mutedForeground: '180 42% 70%',
        secondary: '180 34% 22%',
        secondaryForeground: '180 45% 88%',
        border: '180 34% 22%',
        input: '180 34% 22%',
      },
    },
  },
  'energetic-vibrant': {
    label: 'Energetic Vibrant',
    description: 'High energy vibrant colors',
    values: {
      light: {
        background: '320 80% 95%',
        foreground: '320 90% 16%',
        card: '320 75% 98%',
        cardForeground: '320 90% 16%',
        popover: '320 75% 98%',
        popoverForeground: '320 90% 16%',
        muted: '320 78% 92%',
        mutedForeground: '320 85% 40%',
        secondary: '320 73% 89%',
        secondaryForeground: '320 90% 16%',
        border: '320 80% 87%',
        input: '320 80% 87%',
      },
      dark: {
        background: '320 85% 12%',
        foreground: '320 95% 88%',
        card: '320 82% 16%',
        cardForeground: '320 95% 88%',
        popover: '320 82% 16%',
        popoverForeground: '320 95% 88%',
        muted: '320 80% 22%',
        mutedForeground: '320 90% 70%',
        secondary: '320 80% 22%',
        secondaryForeground: '320 95% 88%',
        border: '320 80% 22%',
        input: '320 80% 22%',
      },
    },
  },
  'minimal-clean': {
    label: 'Minimal Clean',
    description: 'Ultra clean minimal aesthetic',
    values: {
      light: {
        background: '0 0% 100%',
        foreground: '0 0% 10%',
        card: '0 0% 98%',
        cardForeground: '0 0% 10%',
        popover: '0 0% 98%',
        popoverForeground: '0 0% 10%',
        muted: '0 0% 96%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 94%',
        secondaryForeground: '0 0% 10%',
        border: '0 0% 92%',
        input: '0 0% 92%',
      },
      dark: {
        background: '0 0% 8%',
        foreground: '0 0% 95%',
        card: '0 0% 10%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 10%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 14%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 14%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 14%',
        input: '0 0% 14%',
      },
    },
  },
  'luxury-gold': {
    label: 'Luxury Gold',
    description: 'Luxurious gold tones',
    values: {
      light: {
        background: '45 40% 96%',
        foreground: '45 50% 14%',
        card: '45 35% 98%',
        cardForeground: '45 50% 14%',
        popover: '45 35% 98%',
        popoverForeground: '45 50% 14%',
        muted: '45 38% 94%',
        mutedForeground: '45 45% 38%',
        secondary: '45 33% 92%',
        secondaryForeground: '45 50% 14%',
        border: '45 40% 90%',
        input: '45 40% 90%',
      },
      dark: {
        background: '45 45% 10%',
        foreground: '45 55% 88%',
        card: '45 42% 14%',
        cardForeground: '45 55% 88%',
        popover: '45 42% 14%',
        popoverForeground: '45 55% 88%',
        muted: '45 40% 20%',
        mutedForeground: '45 50% 70%',
        secondary: '45 40% 20%',
        secondaryForeground: '45 55% 88%',
        border: '45 40% 20%',
        input: '45 40% 20%',
      },
    },
  },
  'tech-futuristic': {
    label: 'Tech Futuristic',
    description: 'Futuristic tech aesthetic',
    values: {
      light: {
        background: '240 30% 18%',
        foreground: '240 40% 92%',
        card: '240 28% 22%',
        cardForeground: '240 40% 92%',
        popover: '240 28% 22%',
        popoverForeground: '240 40% 92%',
        muted: '240 32% 26%',
        mutedForeground: '240 38% 78%',
        secondary: '240 32% 26%',
        secondaryForeground: '240 40% 92%',
        border: '240 32% 26%',
        input: '240 32% 26%',
      },
      dark: {
        background: '240 35% 10%',
        foreground: '240 45% 90%',
        card: '240 32% 14%',
        cardForeground: '240 45% 90%',
        popover: '240 32% 14%',
        popoverForeground: '240 45% 90%',
        muted: '240 34% 20%',
        mutedForeground: '240 42% 73%',
        secondary: '240 34% 20%',
        secondaryForeground: '240 45% 90%',
        border: '240 34% 20%',
        input: '240 34% 20%',
      },
    },
  },
  'retro-vintage': {
    label: 'Retro Vintage',
    description: 'Vintage retro aesthetic',
    values: {
      light: {
        background: '30 25% 90%',
        foreground: '30 35% 16%',
        card: '30 23% 93%',
        cardForeground: '30 35% 16%',
        popover: '30 23% 93%',
        popoverForeground: '30 35% 16%',
        muted: '30 26% 87%',
        mutedForeground: '30 32% 40%',
        secondary: '30 24% 84%',
        secondaryForeground: '30 35% 16%',
        border: '30 27% 82%',
        input: '30 27% 82%',
      },
      dark: {
        background: '30 30% 10%',
        foreground: '30 40% 88%',
        card: '30 28% 14%',
        cardForeground: '30 40% 88%',
        popover: '30 28% 14%',
        popoverForeground: '30 40% 88%',
        muted: '30 29% 20%',
        mutedForeground: '30 37% 70%',
        secondary: '30 29% 20%',
        secondaryForeground: '30 40% 88%',
        border: '30 29% 20%',
        input: '30 29% 20%',
      },
    },
  },
  'artistic-creative': {
    label: 'Artistic Creative',
    description: 'Creative artistic atmosphere',
    values: {
      light: {
        background: '300 40% 94%',
        foreground: '300 50% 16%',
        card: '300 38% 96%',
        cardForeground: '300 50% 16%',
        popover: '300 38% 96%',
        popoverForeground: '300 50% 16%',
        muted: '300 42% 91%',
        mutedForeground: '300 48% 40%',
        secondary: '300 36% 88%',
        secondaryForeground: '300 50% 16%',
        border: '300 40% 86%',
        input: '300 40% 86%',
      },
      dark: {
        background: '300 45% 12%',
        foreground: '300 55% 88%',
        card: '300 42% 16%',
        cardForeground: '300 55% 88%',
        popover: '300 42% 16%',
        popoverForeground: '300 55% 88%',
        muted: '300 44% 22%',
        mutedForeground: '300 52% 70%',
        secondary: '300 44% 22%',
        secondaryForeground: '300 55% 88%',
        border: '300 44% 22%',
        input: '300 44% 22%',
      },
    },
  },
  'professional-corporate': {
    label: 'Professional Corporate',
    description: 'Professional corporate aesthetic',
    values: {
      light: {
        background: '220 15% 98%',
        foreground: '220 25% 14%',
        card: '220 12% 100%',
        cardForeground: '220 25% 14%',
        popover: '220 12% 100%',
        popoverForeground: '220 25% 14%',
        muted: '220 18% 95%',
        mutedForeground: '220 22% 42%',
        secondary: '220 15% 92%',
        secondaryForeground: '220 25% 14%',
        border: '220 20% 90%',
        input: '220 20% 90%',
      },
      dark: {
        background: '220 20% 8%',
        foreground: '220 30% 88%',
        card: '220 17% 12%',
        cardForeground: '220 30% 88%',
        popover: '220 17% 12%',
        popoverForeground: '220 30% 88%',
        muted: '220 22% 18%',
        mutedForeground: '220 27% 70%',
        secondary: '220 22% 18%',
        secondaryForeground: '220 30% 88%',
        border: '220 22% 18%',
        input: '220 22% 18%',
      },
    },
  },
  'gaming-arcade': {
    label: 'Gaming Arcade',
    description: 'Bright arcade gaming aesthetic',
    values: {
      light: {
        background: '320 70% 92%',
        foreground: '320 80% 16%',
        card: '320 68% 95%',
        cardForeground: '320 80% 16%',
        popover: '320 68% 95%',
        popoverForeground: '320 80% 16%',
        muted: '320 72% 89%',
        mutedForeground: '320 75% 40%',
        secondary: '320 66% 86%',
        secondaryForeground: '320 80% 16%',
        border: '320 70% 84%',
        input: '320 70% 84%',
      },
      dark: {
        background: '320 75% 12%',
        foreground: '320 85% 88%',
        card: '320 72% 16%',
        cardForeground: '320 85% 88%',
        popover: '320 72% 16%',
        popoverForeground: '320 85% 88%',
        muted: '320 74% 22%',
        mutedForeground: '320 80% 70%',
        secondary: '320 74% 22%',
        secondaryForeground: '320 85% 88%',
        border: '320 74% 22%',
        input: '320 74% 22%',
      },
    },
  },
  'anime-colorful': {
    label: 'Anime Colorful',
    description: 'Bright colorful anime aesthetic',
    values: {
      light: {
        background: '280 50% 96%',
        foreground: '280 60% 16%',
        card: '280 48% 98%',
        cardForeground: '280 60% 16%',
        popover: '280 48% 98%',
        popoverForeground: '280 60% 16%',
        muted: '280 52% 94%',
        mutedForeground: '280 58% 40%',
        secondary: '280 46% 92%',
        secondaryForeground: '280 60% 16%',
        border: '280 50% 90%',
        input: '280 50% 90%',
      },
      dark: {
        background: '280 55% 12%',
        foreground: '280 65% 88%',
        card: '280 52% 16%',
        cardForeground: '280 65% 88%',
        popover: '280 52% 16%',
        popoverForeground: '280 65% 88%',
        muted: '280 54% 22%',
        mutedForeground: '280 62% 70%',
        secondary: '280 54% 22%',
        secondaryForeground: '280 65% 88%',
        border: '280 54% 22%',
        input: '280 54% 22%',
      },
    },
  },
  'horror-eerie': {
    label: 'Horror Eerie',
    description: 'Eerie horror atmosphere',
    values: {
      light: {
        background: '0 0% 5%',
        foreground: '0 0% 94%',
        card: '0 0% 7%',
        cardForeground: '0 0% 94%',
        popover: '0 0% 7%',
        popoverForeground: '0 0% 94%',
        muted: '0 0% 10%',
        mutedForeground: '0 0% 68%',
        secondary: '0 0% 10%',
        secondaryForeground: '0 0% 94%',
        border: '0 0% 10%',
        input: '0 0% 10%',
      },
      dark: {
        background: '0 0% 2%',
        foreground: '0 0% 97%',
        card: '0 0% 4%',
        cardForeground: '0 0% 97%',
        popover: '0 0% 4%',
        popoverForeground: '0 0% 97%',
        muted: '0 0% 6%',
        mutedForeground: '0 0% 63%',
        secondary: '0 0% 6%',
        secondaryForeground: '0 0% 97%',
        border: '0 0% 6%',
        input: '0 0% 6%',
      },
    },
  },
  'festive-celebration': {
    label: 'Festive Celebration',
    description: 'Bright festive celebration colors',
    values: {
      light: {
        background: '0 100% 97%',
        foreground: '0 100% 15%',
        card: '55 100% 100%',
        cardForeground: '0 100% 15%',
        popover: '55 100% 100%',
        popoverForeground: '0 100% 15%',
        muted: '210 100% 94%',
        mutedForeground: '0 80% 40%',
        secondary: '320 100% 92%',
        secondaryForeground: '0 100% 15%',
        border: '55 100% 88%',
        input: '55 100% 88%',
      },
      dark: {
        background: '0 100% 10%',
        foreground: '0 100% 95%',
        card: '55 100% 13%',
        cardForeground: '0 100% 95%',
        popover: '55 100% 13%',
        popoverForeground: '0 100% 95%',
        muted: '210 100% 18%',
        mutedForeground: '0 80% 75%',
        secondary: '320 100% 22%',
        secondaryForeground: '0 100% 95%',
        border: '55 100% 20%',
        input: '55 100% 20%',
      },
    },
  },
  'mystical-magic': {
    label: 'Mystical Magic',
    description: 'Mystical magical atmosphere',
    values: {
      light: {
        background: '270 35% 22%',
        foreground: '270 45% 91%',
        card: '270 33% 26%',
        cardForeground: '270 45% 91%',
        popover: '270 33% 26%',
        popoverForeground: '270 45% 91%',
        muted: '270 37% 30%',
        mutedForeground: '270 42% 77%',
        secondary: '270 37% 30%',
        secondaryForeground: '270 45% 91%',
        border: '270 37% 30%',
        input: '270 37% 30%',
      },
      dark: {
        background: '270 40% 12%',
        foreground: '270 50% 89%',
        card: '270 37% 16%',
        cardForeground: '270 50% 89%',
        popover: '270 37% 16%',
        popoverForeground: '270 50% 89%',
        muted: '270 39% 22%',
        mutedForeground: '270 47% 72%',
        secondary: '270 39% 22%',
        secondaryForeground: '270 50% 89%',
        border: '270 39% 22%',
        input: '270 39% 22%',
      },
    },
  },
  'industrial-raw': {
    label: 'Industrial Raw',
    description: 'Raw industrial aesthetic',
    values: {
      light: {
        background: '0 0% 20%',
        foreground: '0 0% 92%',
        card: '0 0% 22%',
        cardForeground: '0 0% 92%',
        popover: '0 0% 22%',
        popoverForeground: '0 0% 92%',
        muted: '0 0% 25%',
        mutedForeground: '0 0% 75%',
        secondary: '0 0% 25%',
        secondaryForeground: '0 0% 92%',
        border: '0 0% 25%',
        input: '0 0% 25%',
      },
      dark: {
        background: '0 0% 12%',
        foreground: '0 0% 95%',
        card: '0 0% 14%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 14%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 17%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 17%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 17%',
        input: '0 0% 17%',
      },
    },
  },
  'organic-natural': {
    label: 'Organic Natural',
    description: 'Natural organic tones',
    values: {
      light: {
        background: '80 30% 94%',
        foreground: '80 40% 16%',
        card: '80 28% 96%',
        cardForeground: '80 40% 16%',
        popover: '80 28% 96%',
        popoverForeground: '80 40% 16%',
        muted: '80 32% 91%',
        mutedForeground: '80 38% 40%',
        secondary: '80 30% 88%',
        secondaryForeground: '80 40% 16%',
        border: '80 35% 86%',
        input: '80 35% 86%',
      },
      dark: {
        background: '80 35% 10%',
        foreground: '80 45% 88%',
        card: '80 33% 14%',
        cardForeground: '80 45% 88%',
        popover: '80 33% 14%',
        popoverForeground: '80 45% 88%',
        muted: '80 34% 20%',
        mutedForeground: '80 42% 70%',
        secondary: '80 34% 20%',
        secondaryForeground: '80 45% 88%',
        border: '80 34% 20%',
        input: '80 34% 20%',
      },
    },
  },
  'digital-pixel': {
    label: 'Digital Pixel',
    description: 'Pixel art digital aesthetic',
    values: {
      light: {
        background: '160 50% 18%',
        foreground: '160 60% 90%',
        card: '160 48% 22%',
        cardForeground: '160 60% 90%',
        popover: '160 48% 22%',
        popoverForeground: '160 60% 90%',
        muted: '160 52% 26%',
        mutedForeground: '160 58% 76%',
        secondary: '160 52% 26%',
        secondaryForeground: '160 60% 90%',
        border: '160 52% 26%',
        input: '160 52% 26%',
      },
      dark: {
        background: '160 55% 10%',
        foreground: '160 65% 88%',
        card: '160 52% 14%',
        cardForeground: '160 65% 88%',
        popover: '160 52% 14%',
        popoverForeground: '160 65% 88%',
        muted: '160 54% 20%',
        mutedForeground: '160 62% 71%',
        secondary: '160 54% 20%',
        secondaryForeground: '160 65% 88%',
        border: '160 54% 20%',
        input: '160 54% 20%',
      },
    },
  },
  'abstract-art': {
    label: 'Abstract Art',
    description: 'Abstract artistic atmosphere',
    values: {
      light: {
        background: '330 40% 94%',
        foreground: '330 50% 16%',
        card: '330 38% 96%',
        cardForeground: '330 50% 16%',
        popover: '330 38% 96%',
        popoverForeground: '330 50% 16%',
        muted: '330 42% 91%',
        mutedForeground: '330 48% 40%',
        secondary: '330 36% 88%',
        secondaryForeground: '330 50% 16%',
        border: '330 40% 86%',
        input: '330 40% 86%',
      },
      dark: {
        background: '330 45% 12%',
        foreground: '330 55% 88%',
        card: '330 42% 16%',
        cardForeground: '330 55% 88%',
        popover: '330 42% 16%',
        popoverForeground: '330 55% 88%',
        muted: '330 44% 22%',
        mutedForeground: '330 52% 70%',
        secondary: '330 44% 22%',
        secondaryForeground: '330 55% 88%',
        border: '330 44% 22%',
        input: '330 44% 22%',
      },
    },
  },
  'classic-elegant': {
    label: 'Classic Elegant',
    description: 'Classic elegant aesthetic',
    values: {
      light: {
        background: '0 0% 98%',
        foreground: '0 0% 12%',
        card: '0 0% 100%',
        cardForeground: '0 0% 12%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 12%',
        muted: '0 0% 96%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 94%',
        secondaryForeground: '0 0% 12%',
        border: '0 0% 92%',
        input: '0 0% 92%',
      },
      dark: {
        background: '0 0% 10%',
        foreground: '0 0% 90%',
        card: '0 0% 12%',
        cardForeground: '0 0% 90%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 90%',
        muted: '0 0% 16%',
        mutedForeground: '0 0% 68%',
        secondary: '0 0% 16%',
        secondaryForeground: '0 0% 90%',
        border: '0 0% 16%',
        input: '0 0% 16%',
      },
    },
  },
  'modern-sleek': {
    label: 'Modern Sleek',
    description: 'Sleek modern aesthetic',
    values: {
      light: {
        background: '220 12% 97%',
        foreground: '220 22% 14%',
        card: '220 10% 99%',
        cardForeground: '220 22% 14%',
        popover: '220 10% 99%',
        popoverForeground: '220 22% 14%',
        muted: '220 14% 94%',
        mutedForeground: '220 20% 42%',
        secondary: '220 12% 91%',
        secondaryForeground: '220 22% 14%',
        border: '220 16% 89%',
        input: '220 16% 89%',
      },
      dark: {
        background: '220 17% 9%',
        foreground: '220 27% 88%',
        card: '220 15% 13%',
        cardForeground: '220 27% 88%',
        popover: '220 15% 13%',
        popoverForeground: '220 27% 88%',
        muted: '220 19% 19%',
        mutedForeground: '220 25% 70%',
        secondary: '220 19% 19%',
        secondaryForeground: '220 27% 88%',
        border: '220 19% 19%',
        input: '220 19% 19%',
      },
    },
  },
  'rustic-wooden': {
    label: 'Rustic Wooden',
    description: 'Rustic wooden texture',
    values: {
      light: {
        background: '30 30% 88%',
        foreground: '30 40% 16%',
        card: '30 28% 91%',
        cardForeground: '30 40% 16%',
        popover: '30 28% 91%',
        popoverForeground: '30 40% 16%',
        muted: '30 32% 85%',
        mutedForeground: '30 38% 40%',
        secondary: '30 30% 82%',
        secondaryForeground: '30 40% 16%',
        border: '30 35% 80%',
        input: '30 35% 80%',
      },
      dark: {
        background: '30 35% 10%',
        foreground: '30 45% 88%',
        card: '30 33% 14%',
        cardForeground: '30 45% 88%',
        popover: '30 33% 14%',
        popoverForeground: '30 45% 88%',
        muted: '30 34% 20%',
        mutedForeground: '30 42% 70%',
        secondary: '30 34% 20%',
        secondaryForeground: '30 45% 88%',
        border: '30 34% 20%',
        input: '30 34% 20%',
      },
    },
  },
  'crystal-clear': {
    label: 'Crystal Clear',
    description: 'Crystal clear transparent aesthetic',
    values: {
      light: {
        background: '200 20% 98%',
        foreground: '200 30% 15%',
        card: '200 18% 100%',
        cardForeground: '200 30% 15%',
        popover: '200 18% 100%',
        popoverForeground: '200 30% 15%',
        muted: '200 22% 95%',
        mutedForeground: '200 28% 42%',
        secondary: '200 20% 92%',
        secondaryForeground: '200 30% 15%',
        border: '200 25% 90%',
        input: '200 25% 90%',
      },
      dark: {
        background: '200 25% 10%',
        foreground: '200 35% 88%',
        card: '200 23% 14%',
        cardForeground: '200 35% 88%',
        popover: '200 23% 14%',
        popoverForeground: '200 35% 88%',
        muted: '200 27% 20%',
        mutedForeground: '200 33% 70%',
        secondary: '200 27% 20%',
        secondaryForeground: '200 35% 88%',
        border: '200 27% 20%',
        input: '200 27% 20%',
      },
    },
  },
  'smoky-mysterious': {
    label: 'Smoky Mysterious',
    description: 'Mysterious smoky atmosphere',
    values: {
      light: {
        background: '0 0% 25%',
        foreground: '0 0% 90%',
        card: '0 0% 27%',
        cardForeground: '0 0% 90%',
        popover: '0 0% 27%',
        popoverForeground: '0 0% 90%',
        muted: '0 0% 30%',
        mutedForeground: '0 0% 73%',
        secondary: '0 0% 30%',
        secondaryForeground: '0 0% 90%',
        border: '0 0% 30%',
        input: '0 0% 30%',
      },
      dark: {
        background: '0 0% 15%',
        foreground: '0 0% 93%',
        card: '0 0% 17%',
        cardForeground: '0 0% 93%',
        popover: '0 0% 17%',
        popoverForeground: '0 0% 93%',
        muted: '0 0% 20%',
        mutedForeground: '0 0% 68%',
        secondary: '0 0% 20%',
        secondaryForeground: '0 0% 93%',
        border: '0 0% 20%',
        input: '0 0% 20%',
      },
    },
  },
  'bright-sunny': {
    label: 'Bright Sunny',
    description: 'Bright sunny atmosphere',
    values: {
      light: {
        background: '50 100% 98%',
        foreground: '50 100% 12%',
        card: '50 95% 100%',
        cardForeground: '50 100% 12%',
        popover: '50 95% 100%',
        popoverForeground: '50 100% 12%',
        muted: '50 98% 95%',
        mutedForeground: '50 90% 38%',
        secondary: '50 96% 92%',
        secondaryForeground: '50 100% 12%',
        border: '50 100% 90%',
        input: '50 100% 90%',
      },
      dark: {
        background: '50 100% 10%',
        foreground: '50 100% 90%',
        card: '50 95% 12%',
        cardForeground: '50 100% 90%',
        popover: '50 95% 12%',
        popoverForeground: '50 100% 90%',
        muted: '50 98% 18%',
        mutedForeground: '50 90% 73%',
        secondary: '50 96% 20%',
        secondaryForeground: '50 100% 90%',
        border: '50 100% 22%',
        input: '50 100% 22%',
      },
    },
  },
  'dark-moody': {
    label: 'Dark Moody',
    description: 'Dark moody atmosphere',
    values: {
      light: {
        background: '0 0% 12%',
        foreground: '0 0% 90%',
        card: '0 0% 14%',
        cardForeground: '0 0% 90%',
        popover: '0 0% 14%',
        popoverForeground: '0 0% 90%',
        muted: '0 0% 17%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 17%',
        secondaryForeground: '0 0% 90%',
        border: '0 0% 17%',
        input: '0 0% 17%',
      },
      dark: {
        background: '0 0% 6%',
        foreground: '0 0% 94%',
        card: '0 0% 8%',
        cardForeground: '0 0% 94%',
        popover: '0 0% 8%',
        popoverForeground: '0 0% 94%',
        muted: '0 0% 11%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 11%',
        secondaryForeground: '0 0% 94%',
        border: '0 0% 11%',
        input: '0 0% 11%',
      },
    },
  },
  'colorful-rainbow': {
    label: 'Colorful Rainbow',
    description: 'Rainbow colorful aesthetic',
    values: {
      light: {
        background: '300 60% 96%',
        foreground: '300 70% 16%',
        card: '300 58% 98%',
        cardForeground: '300 70% 16%',
        popover: '300 58% 98%',
        popoverForeground: '300 70% 16%',
        muted: '300 62% 93%',
        mutedForeground: '300 68% 40%',
        secondary: '300 56% 90%',
        secondaryForeground: '300 70% 16%',
        border: '300 60% 88%',
        input: '300 60% 88%',
      },
      dark: {
        background: '300 65% 12%',
        foreground: '300 75% 88%',
        card: '300 63% 16%',
        cardForeground: '300 75% 88%',
        popover: '300 63% 16%',
        popoverForeground: '300 75% 88%',
        muted: '300 64% 22%',
        mutedForeground: '300 72% 70%',
        secondary: '300 64% 22%',
        secondaryForeground: '300 75% 88%',
        border: '300 64% 22%',
        input: '300 64% 22%',
      },
    },
  },
  'monochrome-minimal': {
    label: 'Monochrome Minimal',
    description: 'Pure monochrome minimal',
    values: {
      light: {
        background: '0 0% 100%',
        foreground: '0 0% 0%',
        card: '0 0% 98%',
        cardForeground: '0 0% 0%',
        popover: '0 0% 98%',
        popoverForeground: '0 0% 0%',
        muted: '0 0% 96%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 94%',
        secondaryForeground: '0 0% 0%',
        border: '0 0% 92%',
        input: '0 0% 92%',
      },
      dark: {
        background: '0 0% 0%',
        foreground: '0 0% 100%',
        card: '0 0% 2%',
        cardForeground: '0 0% 100%',
        popover: '0 0% 2%',
        popoverForeground: '0 0% 100%',
        muted: '0 0% 4%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 4%',
        secondaryForeground: '0 0% 100%',
        border: '0 0% 4%',
        input: '0 0% 4%',
      },
    },
  },
  beach: {
    label: 'Beach',
    description: 'Warm sandy tones with ocean blues for a relaxing beach atmosphere',
    values: {
      light: {
        background: '45 35% 96%',
        foreground: '200 50% 15%',
        card: '45 30% 98%',
        cardForeground: '200 50% 15%',
        popover: '45 30% 98%',
        popoverForeground: '200 50% 15%',
        muted: '45 28% 92%',
        mutedForeground: '200 40% 40%',
        secondary: '45 25% 88%',
        secondaryForeground: '200 50% 15%',
        border: '45 30% 86%',
        input: '45 30% 86%',
      },
      dark: {
        background: '200 40% 10%',
        foreground: '45 60% 94%',
        card: '200 35% 14%',
        cardForeground: '45 60% 94%',
        popover: '200 35% 14%',
        popoverForeground: '45 60% 94%',
        muted: '200 30% 22%',
        mutedForeground: '45 50% 78%',
        secondary: '200 30% 22%',
        secondaryForeground: '45 60% 94%',
        border: '200 30% 22%',
        input: '200 30% 22%',
      },
    },
  },
  firelight: {
    label: 'Firelight',
    description: 'Warm orange and red tones like a cozy fire',
    values: {
      light: {
        background: '20 50% 96%',
        foreground: '20 60% 15%',
        card: '20 45% 98%',
        cardForeground: '20 60% 15%',
        popover: '20 45% 98%',
        popoverForeground: '20 60% 15%',
        muted: '20 40% 92%',
        mutedForeground: '20 50% 40%',
        secondary: '20 35% 88%',
        secondaryForeground: '20 60% 15%',
        border: '20 45% 86%',
        input: '20 45% 86%',
      },
      dark: {
        background: '20 40% 10%',
        foreground: '20 60% 94%',
        card: '20 35% 14%',
        cardForeground: '20 60% 94%',
        popover: '20 35% 14%',
        popoverForeground: '20 60% 94%',
        muted: '20 30% 22%',
        mutedForeground: '20 50% 78%',
        secondary: '20 30% 22%',
        secondaryForeground: '20 60% 94%',
        border: '20 30% 22%',
        input: '20 30% 22%',
      },
    },
  },
  jungle: {
    label: 'Jungle',
    description: 'Deep green tropical jungle atmosphere',
    values: {
      light: {
        background: '140 45% 92%',
        foreground: '140 60% 15%',
        card: '140 40% 95%',
        cardForeground: '140 60% 15%',
        popover: '140 40% 95%',
        popoverForeground: '140 60% 15%',
        muted: '140 38% 89%',
        mutedForeground: '140 50% 40%',
        secondary: '140 35% 86%',
        secondaryForeground: '140 60% 15%',
        border: '140 40% 84%',
        input: '140 40% 84%',
      },
      dark: {
        background: '140 50% 10%',
        foreground: '140 60% 94%',
        card: '140 45% 14%',
        cardForeground: '140 60% 94%',
        popover: '140 45% 14%',
        popoverForeground: '140 60% 94%',
        muted: '140 40% 22%',
        mutedForeground: '140 50% 78%',
        secondary: '140 40% 22%',
        secondaryForeground: '140 60% 94%',
        border: '140 40% 22%',
        input: '140 40% 22%',
      },
    },
  },
  starlight: {
    label: 'Starlight',
    description: 'Deep dark blue with subtle star-like highlights',
    values: {
      light: {
        background: '220 40% 95%',
        foreground: '220 50% 15%',
        card: '220 35% 97%',
        cardForeground: '220 50% 15%',
        popover: '220 35% 97%',
        popoverForeground: '220 50% 15%',
        muted: '220 30% 92%',
        mutedForeground: '220 40% 40%',
        secondary: '220 25% 88%',
        secondaryForeground: '220 50% 15%',
        border: '220 30% 86%',
        input: '220 30% 86%',
      },
      dark: {
        background: '220 50% 8%',
        foreground: '220 60% 94%',
        card: '220 45% 12%',
        cardForeground: '220 60% 94%',
        popover: '220 45% 12%',
        popoverForeground: '220 60% 94%',
        muted: '220 40% 20%',
        mutedForeground: '220 50% 75%',
        secondary: '220 40% 20%',
        secondaryForeground: '220 60% 94%',
        border: '220 40% 20%',
        input: '220 40% 20%',
      },
    },
  },
  lake: {
    label: 'Lake',
    description: 'Calm blue-green like a serene lake',
    values: {
      light: {
        background: '190 40% 94%',
        foreground: '190 60% 15%',
        card: '190 35% 96%',
        cardForeground: '190 60% 15%',
        popover: '190 35% 96%',
        popoverForeground: '190 60% 15%',
        muted: '190 30% 90%',
        mutedForeground: '190 50% 40%',
        secondary: '190 25% 86%',
        secondaryForeground: '190 60% 15%',
        border: '190 30% 84%',
        input: '190 30% 84%',
      },
      dark: {
        background: '190 45% 10%',
        foreground: '190 60% 94%',
        card: '190 40% 14%',
        cardForeground: '190 60% 94%',
        popover: '190 40% 14%',
        popoverForeground: '190 60% 94%',
        muted: '190 35% 22%',
        mutedForeground: '190 50% 78%',
        secondary: '190 35% 22%',
        secondaryForeground: '190 60% 94%',
        border: '190 35% 22%',
        input: '190 35% 22%',
      },
    },
  },
  valley: {
    label: 'Valley',
    description: 'Warm earth tones like an autumn valley',
    values: {
      light: {
        background: '30 30% 94%',
        foreground: '30 50% 15%',
        card: '30 25% 96%',
        cardForeground: '30 50% 15%',
        popover: '30 25% 96%',
        popoverForeground: '30 50% 15%',
        muted: '30 28% 90%',
        mutedForeground: '30 40% 40%',
        secondary: '30 22% 86%',
        secondaryForeground: '30 50% 15%',
        border: '30 30% 84%',
        input: '30 30% 84%',
      },
      dark: {
        background: '30 35% 10%',
        foreground: '30 50% 94%',
        card: '30 30% 14%',
        cardForeground: '30 50% 94%',
        popover: '30 30% 14%',
        popoverForeground: '30 50% 94%',
        muted: '30 25% 22%',
        mutedForeground: '30 40% 78%',
        secondary: '30 25% 22%',
        secondaryForeground: '30 50% 94%',
        border: '30 25% 22%',
        input: '30 25% 22%',
      },
    },
  },
  velvet: {
    label: 'Velvet',
    description: 'Rich deep purple like luxurious velvet',
    values: {
      light: {
        background: '280 30% 94%',
        foreground: '280 50% 15%',
        card: '280 25% 96%',
        cardForeground: '280 50% 15%',
        popover: '280 25% 96%',
        popoverForeground: '280 50% 15%',
        muted: '280 28% 90%',
        mutedForeground: '280 40% 40%',
        secondary: '280 22% 86%',
        secondaryForeground: '280 50% 15%',
        border: '280 30% 84%',
        input: '280 30% 84%',
      },
      dark: {
        background: '280 40% 10%',
        foreground: '280 60% 94%',
        card: '280 35% 14%',
        cardForeground: '280 60% 94%',
        popover: '280 35% 14%',
        popoverForeground: '280 60% 94%',
        muted: '280 30% 22%',
        mutedForeground: '280 50% 78%',
        secondary: '280 30% 22%',
        secondaryForeground: '280 60% 94%',
        border: '280 30% 22%',
        input: '280 30% 22%',
      },
    },
  },
  river: {
    label: 'River',
    description: 'Flowing blue-green like a clear river',
    values: {
      light: {
        background: '180 35% 94%',
        foreground: '180 55% 15%',
        card: '180 30% 96%',
        cardForeground: '180 55% 15%',
        popover: '180 30% 96%',
        popoverForeground: '180 55% 15%',
        muted: '180 28% 90%',
        mutedForeground: '180 45% 40%',
        secondary: '180 25% 86%',
        secondaryForeground: '180 55% 15%',
        border: '180 30% 84%',
        input: '180 30% 84%',
      },
      dark: {
        background: '180 40% 10%',
        foreground: '180 55% 94%',
        card: '180 35% 14%',
        cardForeground: '180 55% 94%',
        popover: '180 35% 14%',
        popoverForeground: '180 55% 94%',
        muted: '180 30% 22%',
        mutedForeground: '180 45% 78%',
        secondary: '180 30% 22%',
        secondaryForeground: '180 55% 94%',
        border: '180 30% 22%',
        input: '180 30% 22%',
      },
    },
  },
  candlelight: {
    label: 'Candlelight',
    description: 'Warm golden glow like candlelight',
    values: {
      light: {
        background: '45 50% 96%',
        foreground: '45 60% 15%',
        card: '45 45% 98%',
        cardForeground: '45 60% 15%',
        popover: '45 45% 98%',
        popoverForeground: '45 60% 15%',
        muted: '45 40% 92%',
        mutedForeground: '45 50% 40%',
        secondary: '45 35% 88%',
        secondaryForeground: '45 60% 15%',
        border: '45 45% 86%',
        input: '45 45% 86%',
      },
      dark: {
        background: '45 45% 10%',
        foreground: '45 60% 94%',
        card: '45 40% 14%',
        cardForeground: '45 60% 94%',
        popover: '45 40% 14%',
        popoverForeground: '45 60% 94%',
        muted: '45 35% 22%',
        mutedForeground: '45 50% 78%',
        secondary: '45 35% 22%',
        secondaryForeground: '45 60% 94%',
        border: '45 35% 22%',
        input: '45 35% 22%',
      },
    },
  },
  cyber: {
    label: 'Cyber',
    description: 'Futuristic cyberpunk aesthetic with neon accents',
    values: {
      light: {
        background: '260 30% 15%',
        foreground: '260 60% 92%',
        card: '260 28% 18%',
        cardForeground: '260 60% 92%',
        popover: '260 28% 18%',
        popoverForeground: '260 60% 92%',
        muted: '260 25% 24%',
        mutedForeground: '260 50% 75%',
        secondary: '260 25% 24%',
        secondaryForeground: '260 60% 92%',
        border: '260 25% 24%',
        input: '260 25% 24%',
      },
      dark: {
        background: '260 35% 8%',
        foreground: '260 70% 94%',
        card: '260 32% 12%',
        cardForeground: '260 70% 94%',
        popover: '260 32% 12%',
        popoverForeground: '260 70% 94%',
        muted: '260 28% 20%',
        mutedForeground: '260 55% 80%',
        secondary: '260 28% 20%',
        secondaryForeground: '260 70% 94%',
        border: '260 28% 20%',
        input: '260 28% 20%',
      },
    },
  },
  laser: {
    label: 'Laser',
    description: 'Bright neon colors with high contrast',
    values: {
      light: {
        background: '300 40% 20%',
        foreground: '300 70% 92%',
        card: '300 38% 24%',
        cardForeground: '300 70% 92%',
        popover: '300 38% 24%',
        popoverForeground: '300 70% 92%',
        muted: '300 35% 28%',
        mutedForeground: '300 60% 78%',
        secondary: '300 35% 28%',
        secondaryForeground: '300 70% 92%',
        border: '300 35% 28%',
        input: '300 35% 28%',
      },
      dark: {
        background: '300 45% 10%',
        foreground: '300 80% 94%',
        card: '300 42% 14%',
        cardForeground: '300 80% 94%',
        popover: '300 42% 14%',
        popoverForeground: '300 80% 94%',
        muted: '300 38% 22%',
        mutedForeground: '300 65% 82%',
        secondary: '300 38% 22%',
        secondaryForeground: '300 80% 94%',
        border: '300 38% 22%',
        input: '300 38% 22%',
      },
    },
  },
  meadow: {
    label: 'Meadow',
    description: 'Fresh green like a sunny meadow',
    values: {
      light: {
        background: '120 40% 94%',
        foreground: '120 60% 15%',
        card: '120 35% 96%',
        cardForeground: '120 60% 15%',
        popover: '120 35% 96%',
        popoverForeground: '120 60% 15%',
        muted: '120 30% 90%',
        mutedForeground: '120 50% 40%',
        secondary: '120 25% 86%',
        secondaryForeground: '120 60% 15%',
        border: '120 30% 84%',
        input: '120 30% 84%',
      },
      dark: {
        background: '120 45% 10%',
        foreground: '120 60% 94%',
        card: '120 40% 14%',
        cardForeground: '120 60% 94%',
        popover: '120 40% 14%',
        popoverForeground: '120 60% 94%',
        muted: '120 35% 22%',
        mutedForeground: '120 50% 78%',
        secondary: '120 35% 22%',
        secondaryForeground: '120 60% 94%',
        border: '120 35% 22%',
        input: '120 35% 22%',
      },
    },
  },
  matrix: {
    label: 'Matrix',
    description: 'Dark green on black like The Matrix',
    values: {
      light: {
        background: '120 30% 12%',
        foreground: '120 60% 88%',
        card: '120 28% 16%',
        cardForeground: '120 60% 88%',
        popover: '120 28% 16%',
        popoverForeground: '120 60% 88%',
        muted: '120 25% 20%',
        mutedForeground: '120 50% 72%',
        secondary: '120 25% 20%',
        secondaryForeground: '120 60% 88%',
        border: '120 25% 20%',
        input: '120 25% 20%',
      },
      dark: {
        background: '120 35% 6%',
        foreground: '120 70% 90%',
        card: '120 32% 10%',
        cardForeground: '120 70% 90%',
        popover: '120 32% 10%',
        popoverForeground: '120 70% 90%',
        muted: '120 28% 18%',
        mutedForeground: '120 55% 75%',
        secondary: '120 28% 18%',
        secondaryForeground: '120 70% 90%',
        border: '120 28% 18%',
        input: '120 28% 18%',
      },
    },
  },
  desert: {
    label: 'Desert',
    description: 'Warm sandy beige like a desert',
    values: {
      light: {
        background: '40 30% 94%',
        foreground: '40 50% 15%',
        card: '40 25% 96%',
        cardForeground: '40 50% 15%',
        popover: '40 25% 96%',
        popoverForeground: '40 50% 15%',
        muted: '40 28% 90%',
        mutedForeground: '40 40% 40%',
        secondary: '40 22% 86%',
        secondaryForeground: '40 50% 15%',
        border: '40 30% 84%',
        input: '40 30% 84%',
      },
      dark: {
        background: '40 35% 10%',
        foreground: '40 50% 94%',
        card: '40 30% 14%',
        cardForeground: '40 50% 94%',
        popover: '40 30% 14%',
        popoverForeground: '40 50% 94%',
        muted: '40 25% 22%',
        mutedForeground: '40 40% 78%',
        secondary: '40 25% 22%',
        secondaryForeground: '40 50% 94%',
        border: '40 25% 22%',
        input: '40 25% 22%',
      },
    },
  },
  vintage: {
    label: 'Vintage',
    description: 'Warm sepia tones like old photographs',
    values: {
      light: {
        background: '35 25% 92%',
        foreground: '35 50% 15%',
        card: '35 20% 94%',
        cardForeground: '35 50% 15%',
        popover: '35 20% 94%',
        popoverForeground: '35 50% 15%',
        muted: '35 22% 88%',
        mutedForeground: '35 40% 40%',
        secondary: '35 18% 84%',
        secondaryForeground: '35 50% 15%',
        border: '35 25% 82%',
        input: '35 25% 82%',
      },
      dark: {
        background: '35 30% 10%',
        foreground: '35 50% 94%',
        card: '35 25% 14%',
        cardForeground: '35 50% 94%',
        popover: '35 25% 14%',
        popoverForeground: '35 50% 94%',
        muted: '35 20% 22%',
        mutedForeground: '35 40% 78%',
        secondary: '35 20% 22%',
        secondaryForeground: '35 50% 94%',
        border: '35 20% 22%',
        input: '35 20% 22%',
      },
    },
  },
  mountain: {
    label: 'Mountain',
    description: 'Cool gray-blue like mountain peaks',
    values: {
      light: {
        background: '210 25% 94%',
        foreground: '210 50% 15%',
        card: '210 20% 96%',
        cardForeground: '210 50% 15%',
        popover: '210 20% 96%',
        popoverForeground: '210 50% 15%',
        muted: '210 22% 90%',
        mutedForeground: '210 40% 40%',
        secondary: '210 18% 86%',
        secondaryForeground: '210 50% 15%',
        border: '210 25% 84%',
        input: '210 25% 84%',
      },
      dark: {
        background: '210 30% 10%',
        foreground: '210 50% 94%',
        card: '210 25% 14%',
        cardForeground: '210 50% 94%',
        popover: '210 25% 14%',
        popoverForeground: '210 50% 94%',
        muted: '210 20% 22%',
        mutedForeground: '210 40% 78%',
        secondary: '210 20% 22%',
        secondaryForeground: '210 50% 94%',
        border: '210 20% 22%',
        input: '210 20% 22%',
      },
    },
  },
  plasma: {
    label: 'Plasma',
    description: 'Electric purple-pink like plasma energy',
    values: {
      light: {
        background: '290 40% 18%',
        foreground: '290 70% 92%',
        card: '290 38% 22%',
        cardForeground: '290 70% 92%',
        popover: '290 38% 22%',
        popoverForeground: '290 70% 92%',
        muted: '290 35% 26%',
        mutedForeground: '290 60% 78%',
        secondary: '290 35% 26%',
        secondaryForeground: '290 70% 92%',
        border: '290 35% 26%',
        input: '290 35% 26%',
      },
      dark: {
        background: '290 45% 10%',
        foreground: '290 80% 94%',
        card: '290 42% 14%',
        cardForeground: '290 80% 94%',
        popover: '290 42% 14%',
        popoverForeground: '290 80% 94%',
        muted: '290 38% 22%',
        mutedForeground: '290 65% 82%',
        secondary: '290 38% 22%',
        secondaryForeground: '290 80% 94%',
        border: '290 38% 22%',
        input: '290 38% 22%',
      },
    },
  },
  gallery: {
    label: 'Gallery',
    description: 'Neutral white like an art gallery',
    values: {
      light: {
        background: '0 0% 98%',
        foreground: '0 0% 12%',
        card: '0 0% 100%',
        cardForeground: '0 0% 12%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 12%',
        muted: '0 0% 94%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 92%',
        secondaryForeground: '0 0% 12%',
        border: '0 0% 90%',
        input: '0 0% 90%',
      },
      dark: {
        background: '0 0% 8%',
        foreground: '0 0% 98%',
        card: '0 0% 12%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 18%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 18%',
        secondaryForeground: '0 0% 98%',
        border: '0 0% 18%',
        input: '0 0% 18%',
      },
    },
  },
  studio: {
    label: 'Studio',
    description: 'Professional neutral gray for creative work',
    values: {
      light: {
        background: '0 0% 96%',
        foreground: '0 0% 15%',
        card: '0 0% 98%',
        cardForeground: '0 0% 15%',
        popover: '0 0% 98%',
        popoverForeground: '0 0% 15%',
        muted: '0 0% 92%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 90%',
        secondaryForeground: '0 0% 15%',
        border: '0 0% 88%',
        input: '0 0% 88%',
      },
      dark: {
        background: '0 0% 10%',
        foreground: '0 0% 95%',
        card: '0 0% 14%',
        cardForeground: '0 0% 95%',
        popover: '0 0% 14%',
        popoverForeground: '0 0% 95%',
        muted: '0 0% 20%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 20%',
        secondaryForeground: '0 0% 95%',
        border: '0 0% 20%',
        input: '0 0% 20%',
      },
    },
  },
  premium: {
    label: 'Premium',
    description: 'Luxurious dark with gold accents',
    values: {
      light: {
        background: '45 20% 12%',
        foreground: '45 60% 92%',
        card: '45 18% 16%',
        cardForeground: '45 60% 92%',
        popover: '45 18% 16%',
        popoverForeground: '45 60% 92%',
        muted: '45 15% 22%',
        mutedForeground: '45 50% 78%',
        secondary: '45 15% 22%',
        secondaryForeground: '45 60% 92%',
        border: '45 15% 22%',
        input: '45 15% 22%',
      },
      dark: {
        background: '45 25% 8%',
        foreground: '45 70% 94%',
        card: '45 22% 12%',
        cardForeground: '45 70% 94%',
        popover: '45 22% 12%',
        popoverForeground: '45 70% 94%',
        muted: '45 20% 20%',
        mutedForeground: '45 55% 80%',
        secondary: '45 20% 20%',
        secondaryForeground: '45 70% 94%',
        border: '45 20% 20%',
        input: '45 20% 20%',
      },
    },
  },
  elegant: {
    label: 'Elegant',
    description: 'Sophisticated neutral with subtle warmth',
    values: {
      light: {
        background: '30 10% 96%',
        foreground: '30 30% 15%',
        card: '30 8% 98%',
        cardForeground: '30 30% 15%',
        popover: '30 8% 98%',
        popoverForeground: '30 30% 15%',
        muted: '30 12% 92%',
        mutedForeground: '30 20% 40%',
        secondary: '30 10% 88%',
        secondaryForeground: '30 30% 15%',
        border: '30 15% 86%',
        input: '30 15% 86%',
      },
      dark: {
        background: '30 15% 10%',
        foreground: '30 40% 94%',
        card: '30 12% 14%',
        cardForeground: '30 40% 94%',
        popover: '30 12% 14%',
        popoverForeground: '30 40% 94%',
        muted: '30 10% 22%',
        mutedForeground: '30 30% 78%',
        secondary: '30 10% 22%',
        secondaryForeground: '30 40% 94%',
        border: '30 10% 22%',
        input: '30 10% 22%',
      },
    },
  },
  sophisticated: {
    label: 'Sophisticated',
    description: 'Refined dark gray for professional settings',
    values: {
      light: {
        background: '0 0% 14%',
        foreground: '0 0% 92%',
        card: '0 0% 18%',
        cardForeground: '0 0% 92%',
        popover: '0 0% 18%',
        popoverForeground: '0 0% 92%',
        muted: '0 0% 24%',
        mutedForeground: '0 0% 75%',
        secondary: '0 0% 24%',
        secondaryForeground: '0 0% 92%',
        border: '0 0% 24%',
        input: '0 0% 24%',
      },
      dark: {
        background: '0 0% 8%',
        foreground: '0 0% 96%',
        card: '0 0% 12%',
        cardForeground: '0 0% 96%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 96%',
        muted: '0 0% 18%',
        mutedForeground: '0 0% 70%',
        secondary: '0 0% 18%',
        secondaryForeground: '0 0% 96%',
        border: '0 0% 18%',
        input: '0 0% 18%',
      },
    },
  },
  '90s-muted': {
    label: '90s Muted',
    description: 'Soft muted colors from the 90s aesthetic',
    values: {
      light: {
        background: '280 15% 94%',
        foreground: '280 30% 15%',
        card: '280 12% 96%',
        cardForeground: '280 30% 15%',
        popover: '280 12% 96%',
        popoverForeground: '280 30% 15%',
        muted: '280 18% 90%',
        mutedForeground: '280 25% 40%',
        secondary: '280 10% 86%',
        secondaryForeground: '280 30% 15%',
        border: '280 15% 84%',
        input: '280 15% 84%',
      },
      dark: {
        background: '280 20% 10%',
        foreground: '280 40% 94%',
        card: '280 18% 14%',
        cardForeground: '280 40% 94%',
        popover: '280 18% 14%',
        popoverForeground: '280 40% 94%',
        muted: '280 15% 22%',
        mutedForeground: '280 30% 78%',
        secondary: '280 15% 22%',
        secondaryForeground: '280 40% 94%',
        border: '280 15% 22%',
        input: '280 15% 22%',
      },
    },
  },
  city: {
    label: 'City',
    description: 'Urban gray like a modern city',
    values: {
      light: {
        background: '0 0% 95%',
        foreground: '0 0% 15%',
        card: '0 0% 97%',
        cardForeground: '0 0% 15%',
        popover: '0 0% 97%',
        popoverForeground: '0 0% 15%',
        muted: '0 0% 91%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 89%',
        secondaryForeground: '0 0% 15%',
        border: '0 0% 87%',
        input: '0 0% 87%',
      },
      dark: {
        background: '0 0% 12%',
        foreground: '0 0% 93%',
        card: '0 0% 16%',
        cardForeground: '0 0% 93%',
        popover: '0 0% 16%',
        popoverForeground: '0 0% 93%',
        muted: '0 0% 22%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 22%',
        secondaryForeground: '0 0% 93%',
        border: '0 0% 22%',
        input: '0 0% 22%',
      },
    },
  },
  retro: {
    label: 'Retro',
    description: 'Warm retro colors from the past',
    values: {
      light: {
        background: '25 30% 93%',
        foreground: '25 50% 15%',
        card: '25 25% 95%',
        cardForeground: '25 50% 15%',
        popover: '25 25% 95%',
        popoverForeground: '25 50% 15%',
        muted: '25 28% 89%',
        mutedForeground: '25 40% 40%',
        secondary: '25 22% 85%',
        secondaryForeground: '25 50% 15%',
        border: '25 30% 83%',
        input: '25 30% 83%',
      },
      dark: {
        background: '25 35% 10%',
        foreground: '25 50% 94%',
        card: '25 30% 14%',
        cardForeground: '25 50% 94%',
        popover: '25 30% 14%',
        popoverForeground: '25 50% 94%',
        muted: '25 25% 22%',
        mutedForeground: '25 40% 78%',
        secondary: '25 25% 22%',
        secondaryForeground: '25 50% 94%',
        border: '25 25% 22%',
        input: '25 25% 22%',
      },
    },
  },
  silk: {
    label: 'Silk',
    description: 'Smooth luxurious silk-like surface',
    values: {
      light: {
        background: '0 0% 97%',
        foreground: '0 0% 13%',
        card: '0 0% 99%',
        cardForeground: '0 0% 13%',
        popover: '0 0% 99%',
        popoverForeground: '0 0% 13%',
        muted: '0 0% 93%',
        mutedForeground: '0 0% 45%',
        secondary: '0 0% 91%',
        secondaryForeground: '0 0% 13%',
        border: '0 0% 89%',
        input: '0 0% 89%',
      },
      dark: {
        background: '0 0% 9%',
        foreground: '0 0% 97%',
        card: '0 0% 13%',
        cardForeground: '0 0% 97%',
        popover: '0 0% 13%',
        popoverForeground: '0 0% 97%',
        muted: '0 0% 19%',
        mutedForeground: '0 0% 65%',
        secondary: '0 0% 19%',
        secondaryForeground: '0 0% 97%',
        border: '0 0% 19%',
        input: '0 0% 19%',
      },
    },
  },
  mahogany: {
    label: 'Mahogany',
    description: 'Rich dark wood like mahogany',
    values: {
      light: {
        background: '15 30% 92%',
        foreground: '15 50% 15%',
        card: '15 25% 94%',
        cardForeground: '15 50% 15%',
        popover: '15 25% 94%',
        popoverForeground: '15 50% 15%',
        muted: '15 28% 88%',
        mutedForeground: '15 40% 40%',
        secondary: '15 22% 84%',
        secondaryForeground: '15 50% 15%',
        border: '15 30% 82%',
        input: '15 30% 82%',
      },
      dark: {
        background: '15 35% 10%',
        foreground: '15 50% 94%',
        card: '15 30% 14%',
        cardForeground: '15 50% 94%',
        popover: '15 30% 14%',
        popoverForeground: '15 50% 94%',
        muted: '15 25% 22%',
        mutedForeground: '15 40% 78%',
        secondary: '15 25% 22%',
        secondaryForeground: '15 50% 94%',
        border: '15 25% 22%',
        input: '15 25% 22%',
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

// Generate destructive color based on accent color
function generateDestructiveColor(accentTone: AccentTone, mode: ResolvedTheme): { destructive: string; destructiveForeground: string } {
  // If destructive color is already defined, use it
  if (accentTone.destructive && accentTone.destructiveForeground) {
    return {
      destructive: accentTone.destructive,
      destructiveForeground: accentTone.destructiveForeground,
    }
  }
  
  // Generate red-based destructive color with appropriate lightness for the theme
  const destructiveHue = 0 // Red
  const destructiveLightness = mode === 'light' ? 60.2 : 30.6
  const destructiveSaturation = mode === 'light' ? 84.2 : 62.8
  return {
    destructive: `${destructiveHue} ${destructiveSaturation}% ${destructiveLightness}%`,
    destructiveForeground: FOREGROUND_LIGHT,
  }
}

function buildAccentToneFromHex(color: string, mode: ResolvedTheme): AccentTone {
  const base = hexToHsl(color)
  const primary = hslToString(base)
  const accent = hslToString(adjustLightness(base, mode === 'light' ? 0.12 : -0.12))
  // Generate destructive color: red hue with lightness adapted to accent
  const destructiveHue = 0 // Red
  const destructiveLightness = mode === 'light' ? 60.2 : 30.6
  const destructiveSaturation = mode === 'light' ? 84.2 : 62.8
  const destructive = `${destructiveHue} ${destructiveSaturation}% ${destructiveLightness}%`
  return {
    primary,
    primaryForeground: getForegroundForLightness(base.l),
    accent,
    accentForeground: getForegroundForLightness(base.l),
    ring: primary,
    destructive,
    destructiveForeground: FOREGROUND_LIGHT,
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

function validateAccent(accent: unknown): accent is AccentColor {
  return (
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
    accent === 'orange' ||
    accent === 'yellow' ||
    accent === 'green' ||
    accent === 'blue' ||
    accent === 'purple' ||
    accent === 'pink' ||
    accent === 'red' ||
    accent === 'brown' ||
    accent === 'gold' ||
    accent === 'silver' ||
    accent === 'bronze' ||
    accent === 'turquoise' ||
    accent === 'lavender' ||
    accent === 'fuchsia' ||
    accent === 'salmon' ||
    accent === 'olive' ||
    accent === 'navy' ||
    accent === 'sky' ||
    accent === 'forest' ||
    accent === 'ocean' ||
    accent === 'custom'
  )
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
      const isAccentValid = validateAccent(accent)
      
      // Валидируем дополнительные акцентные цвета
      const secondaryAccent = validateAccent(parsed.secondaryAccent) ? parsed.secondaryAccent : undefined
      const tertiaryAccent = validateAccent(parsed.tertiaryAccent) ? parsed.tertiaryAccent : undefined
      
      return {
        theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : DEFAULT_PREFERENCES.theme,
        accent: isAccentValid ? (accent as AccentColor) : DEFAULT_PREFERENCES.accent,
        secondaryAccent,
        tertiaryAccent,
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
                presetAccent === 'orange' ||
                presetAccent === 'yellow' ||
                presetAccent === 'green' ||
                presetAccent === 'blue' ||
                presetAccent === 'purple' ||
                presetAccent === 'pink' ||
                presetAccent === 'red' ||
                presetAccent === 'brown' ||
                presetAccent === 'gold' ||
                presetAccent === 'silver' ||
                presetAccent === 'bronze' ||
                presetAccent === 'turquoise' ||
                presetAccent === 'lavender' ||
                presetAccent === 'fuchsia' ||
                presetAccent === 'salmon' ||
                presetAccent === 'olive' ||
                presetAccent === 'navy' ||
                presetAccent === 'sky' ||
                presetAccent === 'forest' ||
                presetAccent === 'ocean' ||
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
    secondaryAccent: state.secondaryAccent,
    tertiaryAccent: state.tertiaryAccent,
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

// Helper function to apply bold contrast transformations to HSL color values
function applyBoldContrast(
  colors: {
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
  },
  resolved: ResolvedTheme
): typeof colors {
  // Parse HSL string (format: "H S% L%") and adjust for bold contrast
  const adjustHSL = (hsl: string, isBackground: boolean, isLight: boolean): string => {
    const parts = hsl.trim().split(/\s+/)
    if (parts.length !== 3) return hsl

    const h = parseFloat(parts[0])
    const s = parseFloat(parts[1].replace('%', ''))
    const l = parseFloat(parts[2].replace('%', ''))

    if (isNaN(h) || isNaN(s) || isNaN(l)) return hsl

    // Increase saturation by 18% for more vibrant, expressive colors
    const newS = Math.min(100, s * 1.18)

    // Adjust lightness based on context - more aggressive changes for stronger contrast
    let newL = l
    if (isLight) {
      // Light theme adjustments
      if (isBackground) {
        // Backgrounds: make them noticeably lighter for more contrast
        newL = Math.min(100, l * 1.06)
      } else {
        // Foregrounds/text: make them significantly darker for better readability
        if (l > 50) {
          newL = Math.max(0, l * 0.92)
        } else {
          newL = Math.max(0, l * 0.88)
        }
      }
    } else {
      // Dark theme adjustments
      if (isBackground) {
        // Backgrounds: make them noticeably darker for more depth and drama
        newL = Math.max(0, l * 0.90)
      } else {
        // Foregrounds/text: make them significantly lighter for better contrast
        newL = Math.min(100, l * 1.08)
      }
    }

    return `${h} ${newS.toFixed(1)}% ${newL.toFixed(1)}%`
  }

  const isLight = resolved === 'light'

  return {
    background: adjustHSL(colors.background, true, isLight),
    foreground: adjustHSL(colors.foreground, false, isLight),
    card: adjustHSL(colors.card, true, isLight),
    cardForeground: adjustHSL(colors.cardForeground, false, isLight),
    popover: adjustHSL(colors.popover, true, isLight),
    popoverForeground: adjustHSL(colors.popoverForeground, false, isLight),
    muted: adjustHSL(colors.muted, true, isLight),
    mutedForeground: adjustHSL(colors.mutedForeground, false, isLight),
    secondary: adjustHSL(colors.secondary, true, isLight),
    secondaryForeground: adjustHSL(colors.secondaryForeground, false, isLight),
    border: adjustHSL(colors.border, true, isLight),
    input: adjustHSL(colors.input, true, isLight),
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
  root.style.setProperty('--ring', accentValues.ring)
  
  // Устанавливаем основной accent (всегда из основного цвета)
  root.style.setProperty('--accent', accentValues.accent)
  root.style.setProperty('--accent-foreground', accentValues.accentForeground)
  
  // Применяем дополнительные акцентные цвета, если они есть
  if (state.secondaryAccent) {
    const secondaryAccentValues =
      state.secondaryAccent === 'custom'
        ? getCustomAccentTones(state.customAccent)[resolved]
        : ACCENT_COLORS[state.secondaryAccent].values[resolved]
    root.style.setProperty('--primary-secondary', secondaryAccentValues.primary)
    root.style.setProperty('--primary-secondary-foreground', secondaryAccentValues.primaryForeground)
    root.style.setProperty('--accent-secondary', secondaryAccentValues.accent)
    root.style.setProperty('--accent-secondary-foreground', secondaryAccentValues.accentForeground)
    root.style.setProperty('--ring-secondary', secondaryAccentValues.ring)
  } else {
    root.style.removeProperty('--primary-secondary')
    root.style.removeProperty('--primary-secondary-foreground')
    root.style.removeProperty('--accent-secondary')
    root.style.removeProperty('--accent-secondary-foreground')
    root.style.removeProperty('--ring-secondary')
  }
  
  if (state.tertiaryAccent) {
    const tertiaryAccentValues =
      state.tertiaryAccent === 'custom'
        ? getCustomAccentTones(state.customAccent)[resolved]
        : ACCENT_COLORS[state.tertiaryAccent].values[resolved]
    root.style.setProperty('--primary-tertiary', tertiaryAccentValues.primary)
    root.style.setProperty('--primary-tertiary-foreground', tertiaryAccentValues.primaryForeground)
    root.style.setProperty('--accent-tertiary', tertiaryAccentValues.accent)
    root.style.setProperty('--accent-tertiary-foreground', tertiaryAccentValues.accentForeground)
    root.style.setProperty('--ring-tertiary', tertiaryAccentValues.ring)
  } else {
    root.style.removeProperty('--primary-tertiary')
    root.style.removeProperty('--primary-tertiary-foreground')
    root.style.removeProperty('--accent-tertiary')
    root.style.removeProperty('--accent-tertiary-foreground')
    root.style.removeProperty('--ring-tertiary')
  }
  
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

  let surfaceValues = SURFACE_PRESETS[state.surface].values[resolved]

  // Apply bold contrast transformations if enabled
  // This modifies colors via CSS variables instead of CSS filter to avoid layout issues
  if (state.contrast === 'bold') {
    surfaceValues = applyBoldContrast(surfaceValues, resolved)
  }

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
  
  // Apply destructive color from accent if available, otherwise generate it
  const destructiveColors = generateDestructiveColor(accentValues, resolved)
  root.style.setProperty('--destructive', destructiveColors.destructive)
  root.style.setProperty('--destructive-foreground', destructiveColors.destructiveForeground)
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
  setSecondaryAccent: (accent) => {
    set((state) => {
      const nextState = {
        ...state,
        secondaryAccent: accent,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { secondaryAccent: accent }
    })
  },
  setTertiaryAccent: (accent) => {
    set((state) => {
      const nextState = {
        ...state,
        tertiaryAccent: accent,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return { tertiaryAccent: accent }
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
  applyTheme: (params) => {
    set((state) => {
      const nextState = {
        ...state,
        accent: params.accent,
        secondaryAccent: params.secondaryAccent,
        tertiaryAccent: params.tertiaryAccent,
        surface: params.surface,
        radius: clampRadius(params.radius),
        typography: params.typography,
        contrast: params.contrast,
        depth: params.depth,
        motion: params.motion,
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      // Возвращаем только измененные поля для правильного мерджа в Zustand
      return {
        accent: params.accent,
        secondaryAccent: params.secondaryAccent,
        tertiaryAccent: params.tertiaryAccent,
        surface: params.surface,
        radius: clampRadius(params.radius),
        typography: params.typography,
        contrast: params.contrast,
        depth: params.depth,
        motion: params.motion,
      }
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
