/**
 * Fate Engine - Ядро редактора
 * Основной класс редактора
 */

import type {
  FateEditor as IFateEditor,
  FateEditorOptions,
  FateEditorState,
  FateDocument,
  FateExtension,
  FateNode,
} from '../types'

// Экспортируем типы для использования в других модулях
export type { FateEditor, FateEditorOptions, FateEditorState } from '../types'
import { createEditorView } from './EditorView'
import { createSchema } from './Schema'
import { createState } from './State'
import { logger } from '@/lib/logger'

export class FateEditorImpl implements IFateEditor {
  private _state: FateEditorState
  private _view: any
  private _extensions: FateExtension[]
  private _options: FateEditorOptions
  private _commands: Record<string, (...args: any[]) => boolean> = {}
  private _isEditable: boolean = true
  private _isFocused: boolean = false

  constructor(options: FateEditorOptions) {
    this._options = options
    this._extensions = options.extensions || []
    this._isEditable = options.editable !== false

    // Создаем схему из расширений
    const schema = createSchema(this._extensions)

    // Создаем начальное состояние
    const initialContent = this._parseContent(options.content)
    this._state = createState(schema, initialContent, {
      editable: this._isEditable,
    })

    // Создаем команды из расширений
    this._buildCommands()

    // Создаем представление
    this._view = createEditorView(this._state, {
      editable: this._isEditable,
      onUpdate: (state: FateEditorState) => {
        this._state = state
        if (options.onUpdate) {
          options.onUpdate(state)
        }
        // Вызываем onUpdate у расширений
        this._extensions.forEach((ext) => {
          if (ext.onUpdate) {
            ext.onUpdate(this)
          }
        })
      },
      onFocus: () => {
        this._isFocused = true
        if (options.onFocus) {
          options.onFocus()
        }
      },
      onBlur: () => {
        this._isFocused = false
        if (options.onBlur) {
          options.onBlur()
        }
      },
    })

    // Вызываем onCreate
    if (options.onCreate) {
      options.onCreate(this._state)
    }

    // Вызываем onCreate у расширений
    this._extensions.forEach((ext) => {
      if (ext.onCreate) {
        ext.onCreate(this)
      }
    })

    // Автофокус
    if (options.autofocus) {
      setTimeout(() => this.focus(), 0)
    }

    if (import.meta.env.DEV) {
      logger.debug('[FateEngine] Editor created', {
        extensions: this._extensions.map((e) => e.name),
        editable: this._isEditable,
      })
    }
  }

  private _parseContent(content?: FateDocument | string): FateDocument {
    if (!content) {
      return { type: 'doc', content: [] }
    }

    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content)
        return this._parseContent(parsed)
      } catch {
        // Если это HTML, нужно парсить
        return { type: 'doc', content: [] }
      }
    }

    if (content.type === 'doc') {
      return content
    }

    return { type: 'doc', content: [] }
  }

  private _buildCommands() {
    this._commands = {}

    // Собираем команды из всех расширений
    this._extensions.forEach((ext) => {
      if (ext.addCommands) {
        const commands = ext.addCommands()
        Object.entries(commands).forEach(([name, command]) => {
          this._commands[name] = command
        })
      }
    })
  }

  get state(): FateEditorState {
    return this._state
  }

  get view(): any {
    return this._view
  }

  get commands(): Record<string, (...args: any[]) => boolean> {
    return this._commands
  }

  get isEditable(): boolean {
    return this._isEditable
  }

  get isFocused(): boolean {
    return this._isFocused
  }

  chain(): any {
    // Простая реализация chain для совместимости с TipTap API
    const chain: any = {}
    let shouldRun = true

    Object.keys(this._commands).forEach((name) => {
      chain[name] = (...args: any[]) => {
        if (!shouldRun) return chain
        const result = this._commands[name](...args)
        if (result === false) {
          shouldRun = false
        }
        return chain
      }
    })

    chain.run = () => {
      const result = shouldRun
      shouldRun = true
      return result
    }

    return chain
  }

  setContent(content: FateDocument | string): void {
    const parsed = this._parseContent(content)
    this._state = createState(this._state.doc, parsed, {
      editable: this._isEditable,
    })
    this._view.update(this._state)
  }

  getContent(): FateDocument {
    return this._state.doc
  }

  getHTML(): string {
    // Конвертируем документ в HTML
    return this._docToHTML(this._state.doc)
  }

  getJSON(): FateDocument {
    return this._state.doc
  }

  getText(): string {
    return this._docToText(this._state.doc)
  }

  focus(): void {
    this._view.focus()
  }

  blur(): void {
    this._view.blur()
  }

  destroy(): void {
    this._view.destroy()
  }

  private _docToHTML(doc: FateDocument): string {
    // Простая конвертация в HTML
    // В реальной реализации нужно использовать toDOM из определений узлов
    return doc.content.map((node) => this._nodeToHTML(node)).join('')
  }

  private _nodeToHTML(node: FateNode): string {
    // Базовая конвертация узла в HTML
    // В реальной реализации нужно использовать toDOM из определений узлов
    if (node.type === 'text') {
      let text = node.text || ''
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type === 'bold') {
            text = `<strong>${text}</strong>`
          } else if (mark.type === 'italic') {
            text = `<em>${text}</em>`
          } else if (mark.type === 'link') {
            const href = mark.attrs?.href || '#'
            text = `<a href="${href}">${text}</a>`
          }
        })
      }
      return text
    }

    const tag = this._getNodeTag(node.type)
    const attrs = this._getNodeAttrs(node)
    const content = node.content
      ? node.content.map((child) => this._nodeToHTML(child)).join('')
      : ''

    return `<${tag}${attrs}>${content}</${tag}>`
  }

  private _getNodeTag(type: string): string {
    const mapping: Record<string, string> = {
      paragraph: 'p',
      heading: 'h1',
      bulletList: 'ul',
      orderedList: 'ol',
      listItem: 'li',
      blockquote: 'blockquote',
      codeBlock: 'pre',
      horizontalRule: 'hr',
      hardBreak: 'br',
    }
    return mapping[type] || 'div'
  }

  private _getNodeAttrs(node: FateNode): string {
    const attrs: string[] = []
    if (node.attrs) {
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          attrs.push(`${key}="${String(value)}"`)
        }
      })
    }
    return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  }

  private _docToText(doc: FateDocument): string {
    return doc.content.map((node) => this._nodeToText(node)).join('\n')
  }

  private _nodeToText(node: FateNode): string {
    if (node.type === 'text') {
      return node.text || ''
    }
    if (node.content) {
      return node.content.map((child) => this._nodeToText(child)).join('')
    }
    return ''
  }
}

export function createEditor(options: FateEditorOptions): IFateEditor {
  return new FateEditorImpl(options) as IFateEditor
}
