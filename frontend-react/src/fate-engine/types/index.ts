/**
 * Fate Engine - Типы данных
 * Базовые типы для работы движка редактора
 */

export interface FateNode {
  type: string
  attrs?: Record<string, any>
  content?: FateNode[]
  marks?: FateMark[]
  text?: string
}

export interface FateMark {
  type: string
  attrs?: Record<string, any>
}

export interface FateDocument {
  type: 'doc'
  content: FateNode[]
}

export interface FateEditorState {
  doc: FateDocument
  selection?: {
    anchor: number
    head: number
  }
}

export interface FateEditorOptions {
  editable?: boolean
  autofocus?: boolean
  placeholder?: string
  content?: FateDocument | string
  extensions?: FateExtension[]
  onUpdate?: (state: FateEditorState) => void
  onCreate?: (state: FateEditorState) => void
  onFocus?: () => void
  onBlur?: () => void
}

export interface FateExtension {
  name: string
  priority?: number
  addNodes?: () => FateNodeDefinition[]
  addMarks?: () => FateMarkDefinition[]
  addCommands?: () => Record<string, (...args: any[]) => any>
  addKeyboardShortcuts?: () => Record<string, () => boolean>
  addPlugins?: () => FatePlugin[]
  onCreate?: (editor: FateEditor) => void
  onUpdate?: (editor: FateEditor) => void
}

export interface FateNodeDefinition {
  name: string
  group?: string
  content?: string
  marks?: string
  atom?: boolean
  inline?: boolean
  block?: boolean
  draggable?: boolean
  isolating?: boolean
  defining?: boolean
  attrs?: Record<string, FateAttributeSpec>
  parseDOM?: FateParseRule[]
  toDOM?: (node: FateNode) => any
  addCommands?: () => Record<string, (...args: any[]) => any>
}

export interface FateMarkDefinition {
  name: string
  inclusive?: boolean
  excludes?: string
  attrs?: Record<string, FateAttributeSpec>
  parseDOM?: FateParseRule[]
  toDOM?: (mark: FateMark) => any
  addCommands?: () => Record<string, (...args: any[]) => any>
}

export interface FateAttributeSpec {
  default?: any
  parseDOM?: (dom: HTMLElement) => any
  toDOM?: (value: any) => any
}

export interface FateParseRule {
  tag?: string
  style?: string
  getAttrs?: (dom: HTMLElement) => Record<string, any> | false | null
  priority?: number
  skip?: boolean
}

export interface FatePlugin {
  key: string
  props?: Record<string, any>
  state?: {
    init: () => any
    apply: (tr: any, value: any) => any
  }
  appendTransaction?: (transactions: any[], oldState: any, newState: any) => any
}

export interface FateEditor {
  state: FateEditorState
  view: FateEditorView
  commands: Record<string, (...args: any[]) => boolean>
  chain: () => FateCommandChain
  setContent: (content: FateDocument | string) => void
  getContent: () => FateDocument
  getHTML: () => string
  getJSON: () => FateDocument
  getText: () => string
  focus: () => void
  blur: () => void
  destroy: () => void
  isEditable: boolean
  isFocused: boolean
}

export interface FateEditorView {
  dom: HTMLElement
  update: (state: FateEditorState) => void
  destroy: () => void
}

export interface FateCommandChain {
  [key: string]: (...args: any[]) => FateCommandChain
  run: () => boolean
}

export interface FateTransaction {
  steps: any[]
  doc: FateDocument
  selection?: {
    anchor: number
    head: number
  }
}
