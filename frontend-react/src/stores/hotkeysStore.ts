/**
 * Hotkeys Store
 *
 * Хранит привязки действий платформы к клавиатурным сокращениям.
 * Поддерживается в браузере через keydown; данные персистятся в localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HotkeyActionId =
  | 'createPost'
  | 'goToForum'
  | 'goToNotifications'
  | 'goToReadingList'
  | 'goToSettings'
  | 'goToProfile'
  | 'toggleTheme'

const MOD = typeof navigator !== 'undefined' && /Mac|iP(?:hone|ad|od)/.test(navigator.platform)
  ? 'Meta+Shift+N'
  : 'Ctrl+Shift+N'

export const DEFAULT_KEYBINDS: Record<HotkeyActionId, string> = {
  createPost: MOD,
  goToForum: '',
  goToNotifications: '',
  goToReadingList: '',
  goToSettings: '',
  goToProfile: '',
  toggleTheme: '',
}

export function formatKeyCombo(combo: string): string {
  if (!combo) return ''
  return combo
    .split('+')
    .map((p) => {
      const lower = p.toLowerCase()
      if (lower === 'meta') return '⌘'
      if (lower === 'ctrl') return 'Ctrl'
      if (lower === 'alt') return '⌥'
      if (lower === 'shift') return '⇧'
      if (p.length === 1) return p.toUpperCase()
      return p
    })
    .join('+')
}

/** Собрать строку комбинации из KeyboardEvent */
export function keyEventToCombo(e: KeyboardEvent): string {
  const mods: string[] = []
  if (e.ctrlKey) mods.push('Ctrl')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')
  if (e.metaKey) mods.push('Meta')
  const key = e.key === ' ' ? 'Space' : e.key
  if (mods.length === 0 && !['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
    return key.length === 1 ? key.toUpperCase() : key
  }
  return [...mods, key.length === 1 ? key.toUpperCase() : key].join('+')
}

/** Проверить, совпадает ли событие с сохранённой комбинацией */
export function matchKeyCombo(combo: string, e: KeyboardEvent): boolean {
  if (!combo) return false
  const parts = combo.split('+')
  const key = parts[parts.length - 1]
  const mods = parts.slice(0, -1)
  const keyMatch =
    key.length === 1
      ? e.key.toLowerCase() === key.toLowerCase()
      : (e.key === key || (e.key === ' ' && key === 'Space'))
  if (!keyMatch) return false
  const hasCtrl = mods.includes('Ctrl')
  const hasAlt = mods.includes('Alt')
  const hasShift = mods.includes('Shift')
  const hasMeta = mods.includes('Meta')
  return (
    e.ctrlKey === hasCtrl &&
    e.altKey === hasAlt &&
    e.shiftKey === hasShift &&
    e.metaKey === hasMeta
  )
}

type HotkeysState = {
  keybinds: Record<HotkeyActionId, string>
  setKeybind: (action: HotkeyActionId, combo: string) => void
  getKeybind: (action: HotkeyActionId) => string
  resetToDefaults: () => void
}

export const useHotkeysStore = create<HotkeysState>()(
  persist(
    (set, get) => ({
      keybinds: { ...DEFAULT_KEYBINDS },

      setKeybind: (action, combo) => {
        set((s) => ({
          keybinds: { ...s.keybinds, [action]: combo },
        }))
      },

      getKeybind: (action) => get().keybinds[action] ?? '',

      resetToDefaults: () => set({ keybinds: { ...DEFAULT_KEYBINDS } }),
    }),
    { name: 'aetheris-hotkeys', version: 1 }
  )
)
