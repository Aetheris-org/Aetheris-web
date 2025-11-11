import { create } from 'zustand'

type TypographyScale = 'default' | 'comfortable' | 'compact'
type ContrastMode = 'standard' | 'bold'
type DepthStyle = 'flat' | 'soft' | 'elevated'
type MotionPreference = 'default' | 'reduced'

type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'mono'
  | 'peach'
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

const DEFAULT_PREFERENCES: StoredPreferences = {
  theme: 'light',
  accent: 'indigo',
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
}

export const ACCENT_COLOR_PRESETS = Object.entries(ACCENT_COLORS).map(([value, config]) => ({
  value: value as Exclude<AccentColor, 'custom'>,
  ...config,
}))

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system' && typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return mode === 'dark' ? 'dark' : 'light'
}

function clampRadius(value: number) {
  const min = 0.25
  const max = 1
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
        accent === 'custom'
      return {
        theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : DEFAULT_PREFERENCES.theme,
        accent: isAccentValid ? (accent as AccentColor) : DEFAULT_PREFERENCES.accent,
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
                presetAccent === 'custom'
              return {
                ...preset,
                settings: {
                  theme:
                    settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'system'
                      ? settings.theme
                      : DEFAULT_PREFERENCES.theme,
                  accent: presetAccentValid ? (presetAccent as AccentColor) : DEFAULT_PREFERENCES.accent,
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
  const typographyScale = TYPOGRAPHY_SCALES[state.typography]?.scale ?? 1
  root.style.setProperty('--aetheris-font-scale', typographyScale.toString())
  root.style.setProperty('--aetheris-density', state.density.toString())

  root.style.removeProperty('--aetheris-surface')
  root.style.removeProperty('--aetheris-surface-flat')
  root.style.removeProperty('--aetheris-surface-gradient')
}

let isInitialized = false

export const useThemeStore = create<ThemeState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  resolvedTheme: 'light',
  initialize: () => {
    if (isInitialized || typeof window === 'undefined') return
    isInitialized = true

    const preferences = loadPreferences()
    const resolvedTheme = resolveTheme(preferences.theme)

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
        const newResolved = event.matches ? 'dark' : 'light'
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
      const resolvedTheme = resolveTheme(mode)
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
      const nextState = {
        ...state,
        ...preset.settings,
        customAccent: normalizeCustomAccent(preset.settings.customAccent),
        resolvedTheme: resolveTheme(preset.settings.theme),
      }
      applyThemePreferences(nextState)
      savePreferences(extractPreferences(nextState))
      return {
        ...preset.settings,
        resolvedTheme: nextState.resolvedTheme,
        customAccent: nextState.customAccent,
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
  AppearancePreset,
}
