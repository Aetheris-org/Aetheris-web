import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ToolbarPosition = 'left' | 'right' | 'top' | 'bottom' | 'floating'

export type ToolbarButtonId = 
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'underline'
  | 'code'
  | 'textColor'
  | 'highlight'
  | 'fontSize'
  | 'textAlignment'
  | 'link'
  | 'image'
  | 'video'
  | 'audio'
  | 'clearFormat'

export type EditorHotkeyActionId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'undo'
  | 'redo'
  | 'link'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'

export interface EditorSettings {
  toolbarPosition: ToolbarPosition
  toolbarButtons: Record<ToolbarButtonId, boolean>
  toolbarFloating: {
    x: number
    y: number
    width: number
    height: number
  }
  enableSnapToEdge: boolean
  hotkeys: Record<EditorHotkeyActionId, string>
}

const defaultToolbarButtons: Record<ToolbarButtonId, boolean> = {
  bold: true,
  italic: true,
  strikethrough: true,
  underline: true,
  code: true,
  textColor: true,
  highlight: true,
  fontSize: true,
  textAlignment: true,
  link: true,
  image: true,
  video: true,
  audio: true,
  clearFormat: true,
}

const isMac = typeof navigator !== 'undefined' && /Mac|iP(?:hone|ad|od)/.test(navigator.platform)
const Mod = isMac ? 'Meta' : 'Ctrl'

const defaultHotkeys: Record<EditorHotkeyActionId, string> = {
  bold: `${Mod}+B`,
  italic: `${Mod}+I`,
  underline: `${Mod}+U`,
  strikethrough: `${Mod}+Shift+X`,
  code: `${Mod}+E`,
  undo: `${Mod}+Z`,
  redo: isMac ? `${Mod}+Shift+Z` : `${Mod}+Y`,
  link: `${Mod}+K`,
  heading1: `${Mod}+Alt+1`,
  heading2: `${Mod}+Alt+2`,
  heading3: `${Mod}+Alt+3`,
  bulletList: `${Mod}+Shift+7`,
  orderedList: `${Mod}+Shift+8`,
  blockquote: `${Mod}+Shift+B`,
}

const defaultSettings: EditorSettings = {
  toolbarPosition: 'left',
  toolbarButtons: defaultToolbarButtons,
  toolbarFloating: {
    x: 0,
    y: 0,
    width: 56,
    height: 400,
  },
  enableSnapToEdge: true,
  hotkeys: defaultHotkeys,
}

interface EditorSettingsStore extends EditorSettings {
  setToolbarPosition: (position: ToolbarPosition) => void
  setToolbarButton: (id: ToolbarButtonId, visible: boolean) => void
  setToolbarFloating: (floating: Partial<EditorSettings['toolbarFloating']>) => void
  setEnableSnapToEdge: (enable: boolean) => void
  setHotkey: (action: EditorHotkeyActionId, combo: string) => void
  getHotkey: (action: EditorHotkeyActionId) => string
  resetSettings: () => void
}

export const useEditorSettingsStore = create<EditorSettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setToolbarPosition: (position) => set({ toolbarPosition: position }),
      setToolbarButton: (id, visible) =>
        set((state) => ({
          toolbarButtons: {
            ...state.toolbarButtons,
            [id]: visible,
          },
        })),
      setToolbarFloating: (floating) =>
        set((state) => ({
          toolbarFloating: {
            ...state.toolbarFloating,
            ...floating,
          },
        })),
      setEnableSnapToEdge: (enable) => set({ enableSnapToEdge: enable }),
      setHotkey: (action, combo) =>
        set((state) => ({
          hotkeys: {
            ...state.hotkeys,
            [action]: combo,
          },
        })),
      getHotkey: (action: EditorHotkeyActionId): string => {
        const state = get()
        return state.hotkeys[action] ?? defaultHotkeys[action]
      },
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'editor-settings',
    }
  )
)
