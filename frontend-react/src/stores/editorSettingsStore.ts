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
}

interface EditorSettingsStore extends EditorSettings {
  setToolbarPosition: (position: ToolbarPosition) => void
  setToolbarButton: (id: ToolbarButtonId, visible: boolean) => void
  setToolbarFloating: (floating: Partial<EditorSettings['toolbarFloating']>) => void
  setEnableSnapToEdge: (enable: boolean) => void
  resetSettings: () => void
}

export const useEditorSettingsStore = create<EditorSettingsStore>()(
  persist(
    (set) => ({
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
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'editor-settings',
    }
  )
)
