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
  private _schema: ReturnType<typeof createSchema>
  private _commands: Record<string, (...args: any[]) => boolean> = {}
  private _isEditable: boolean = true
  private _isFocused: boolean = false

  constructor(options: FateEditorOptions) {
    try {
      this._extensions = options.extensions || []
      this._isEditable = options.editable !== false

      // Создаем схему из расширений
      this._schema = createSchema(this._extensions)

      // Создаем начальное состояние
      const initialContent = this._parseContent(options.content)
      this._state = createState(this._schema, initialContent, {
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
            try {
              options.onUpdate(state)
            } catch (error) {
              console.error('[FateEngine] Error in onUpdate callback:', error)
            }
          }
          // Вызываем onUpdate у расширений
          this._extensions.forEach((ext) => {
            if (ext.onUpdate) {
              try {
                ext.onUpdate(this)
              } catch (error) {
                console.error(`[FateEngine] Error in extension ${ext.name} onUpdate:`, error)
              }
            }
          })
        },
        onFocus: () => {
          this._isFocused = true
          if (options.onFocus) {
            try {
              options.onFocus()
            } catch (error) {
              console.error('[FateEngine] Error in onFocus callback:', error)
            }
          }
        },
        onBlur: () => {
          this._isFocused = false
          if (options.onBlur) {
            try {
              options.onBlur()
            } catch (error) {
              console.error('[FateEngine] Error in onBlur callback:', error)
            }
          }
        },
      })

      // Вызываем onCreate
      if (options.onCreate) {
        try {
          options.onCreate(this._state)
        } catch (error) {
          console.error('[FateEngine] Error in onCreate callback:', error)
        }
      }

      // Вызываем onCreate у расширений
      this._extensions.forEach((ext) => {
        if (ext.onCreate) {
          try {
            ext.onCreate(this)
          } catch (error) {
            console.error(`[FateEngine] Error in extension ${ext.name} onCreate:`, error)
          }
        }
      })

      // Автофокус
      if (options.autofocus) {
        setTimeout(() => {
          try {
            this.focus()
          } catch (error) {
            console.error('[FateEngine] Error in autofocus:', error)
          }
        }, 0)
      }

      if (import.meta.env.DEV) {
        logger.debug('[FateEngine] Editor created', {
          extensions: this._extensions.map((e) => e.name),
          editable: this._isEditable,
        })
      }
    } catch (error) {
      console.error('[FateEngine] Critical error creating editor:', error)
      // Создаем минимальное состояние для предотвращения краша
      this._extensions = []
      this._isEditable = false
      this._schema = createSchema([])
      this._state = createState(this._schema, { type: 'doc', content: [] }, {
        editable: false,
      })
      this._view = createEditorView(this._state, {
        editable: false,
      })
      throw error // Пробрасываем ошибку дальше
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
    try {
      const parsed = this._parseContent(content)
      this._state = createState(this._schema, parsed, {
        editable: this._isEditable,
      })
      this._view.update(this._state)
    } catch (error) {
      console.error('[FateEngine] Error setting content:', error)
      // Устанавливаем пустой документ в случае ошибки
      this._state = createState(this._schema, { type: 'doc', content: [] }, {
        editable: this._isEditable,
      })
      this._view.update(this._state)
    }
  }

  getContent(): FateDocument {
    return this._state.doc
  }

  getHTML(): string {
    // Конвертируем документ в HTML используя логику из EditorView
    try {
      return this._docToHTML(this._state.doc)
    } catch (error) {
      console.error('[FateEngine] Error converting to HTML:', error)
      return ''
    }
  }

  getJSON(): FateDocument {
    return this._state.doc
  }

  getText(): string {
    return this._docToText(this._state.doc)
  }

  focus(): void {
    try {
      if (this._view && this._view.dom && typeof this._view.dom.focus === 'function') {
        this._view.dom.focus()
      }
    } catch (error) {
      console.error('[FateEngine] Error focusing editor:', error)
    }
  }

  blur(): void {
    try {
      if (this._view && this._view.dom && typeof this._view.dom.blur === 'function') {
        this._view.dom.blur()
      }
    } catch (error) {
      console.error('[FateEngine] Error blurring editor:', error)
    }
  }

  destroy(): void {
    this._view.destroy()
  }

  private _docToHTML(doc: FateDocument): string {
    // Используем ту же логику, что и в EditorView
    if (!doc || !doc.content) {
      return ''
    }

    try {
      return doc.content
        .map((node: any) => {
          try {
            return this._nodeToHTML(node)
          } catch (error) {
            console.error('[FateEngine] Error converting node to HTML:', error, node)
            return ''
          }
        })
        .filter((html: string) => html)
        .join('')
    } catch (error) {
      console.error('[FateEngine] Error in _docToHTML:', error)
      return ''
    }
  }

  private _nodeToHTML(node: FateNode): string {
    if (!node || typeof node !== 'object') {
      return ''
    }

    if (node.type === 'text') {
      let text = String(node.text || '')
      // Экранируем HTML
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      
      if (node.marks && Array.isArray(node.marks)) {
        node.marks.forEach((mark: any) => {
          if (!mark || typeof mark !== 'object') return
          
          if (mark.type === 'bold') {
            text = `<strong>${text}</strong>`
          } else if (mark.type === 'italic') {
            text = `<em>${text}</em>`
          } else if (mark.type === 'underline') {
            text = `<u>${text}</u>`
          } else if (mark.type === 'strikethrough') {
            text = `<s>${text}</s>`
          } else if (mark.type === 'code') {
            text = `<code>${text}</code>`
          } else if (mark.type === 'link') {
            const href = mark.attrs?.href || '#'
            const target = mark.attrs?.target || ''
            const targetAttr = target ? ` target="${target}"` : ''
            text = `<a href="${href}"${targetAttr}>${text}</a>`
          } else if (mark.type === 'highlight') {
            const color = mark.attrs?.color || '#fef08a'
            text = `<mark style="background-color: ${color}">${text}</mark>`
          } else if (mark.type === 'color') {
            const color = mark.attrs?.color
            if (color) {
              text = `<span style="color: ${color}">${text}</span>`
            }
          }
        })
      }
      return text
    }

    // Специальная обработка для заголовков
    let tag = this._getNodeTag(node.type)
    if (node.type === 'heading' && node.attrs?.level) {
      const level = Math.min(Math.max(node.attrs.level, 1), 6)
      tag = `h${level}`
    }

    const attrs = this._getNodeAttrs(node)
    const content = node.content && Array.isArray(node.content)
      ? node.content.map((child: any) => this._nodeToHTML(child)).join('')
      : ''

    if (node.type === 'hardBreak') {
      return '<br>'
    }

    if (node.type === 'horizontalRule') {
      return '<hr>'
    }

    if (node.type === 'image') {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const width = node.attrs?.width
      const height = node.attrs?.height
      const align = node.attrs?.align || 'center'
      
      let style = 'max-width: 100%; height: auto;'
      if (width) style += ` width: ${width}px;`
      if (height) style += ` height: ${height}px;`
      if (align === 'left') style += ' float: left; margin-right: 1rem;'
      if (align === 'right') style += ' float: right; margin-left: 1rem;'
      if (align === 'center') style += ' display: block; margin: 0 auto;'
      
      return `<img src="${src}" alt="${alt}" style="${style}" class="max-w-full h-auto rounded-lg my-4" />`
    }

    if (node.type === 'codeBlock') {
      const language = node.attrs?.language || 'plaintext'
      const codeContent = node.content
        ? node.content.map((child: any) => {
            if (child.type === 'text') {
              return this._escapeHtml(child.text || '')
            }
            return ''
          }).join('')
        : ''
      return `<pre class="code-block-wrapper"><code class="language-${language}">${codeContent}</code></pre>`
    }

    if (node.type === 'callout') {
      const variant = node.attrs?.variant || 'info'
      return `<aside class="callout-block" data-variant="${variant}">${content}</aside>`
    }

    if (node.type === 'columns') {
      return `<div class="editor-columns" data-type="columns">${content}</div>`
    }

    if (node.type === 'column') {
      const width = node.attrs?.width || 50
      return `<div class="editor-column" data-type="column" data-width="${width}">${content}</div>`
    }

    return `<${tag}${attrs}>${content}</${tag}>`
  }

  private _escapeHtml(text: string): string {
    if (typeof document === 'undefined') {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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
    
    // Специальная обработка для заголовков
    if (node.type === 'heading' && node.attrs?.level) {
      // level уже использован для определения тега
      const otherAttrs: string[] = []
      if (node.attrs.blockId) {
        otherAttrs.push(`id="${String(node.attrs.blockId)}"`)
        otherAttrs.push(`data-block-id="${String(node.attrs.blockId)}"`)
      }
      if (node.attrs.textAlign) {
        otherAttrs.push(`style="text-align: ${String(node.attrs.textAlign)}"`)
      }
      return otherAttrs.length > 0 ? ' ' + otherAttrs.join(' ') : ''
    }

    if (node.attrs) {
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Пропускаем специальные атрибуты
          if (key === 'level' && node.type === 'heading') {
            return
          }
          if (key === 'blockId') {
            attrs.push(`id="${String(value)}"`)
            attrs.push(`data-block-id="${String(value)}"`)
          } else if (key === 'textAlign') {
            attrs.push(`style="text-align: ${String(value)}"`)
          } else if (key !== 'src' && key !== 'alt' && key !== 'width' && key !== 'height' && key !== 'align' && key !== 'language' && key !== 'variant') {
            // Для специальных узлов эти атрибуты обрабатываются отдельно
            attrs.push(`${key}="${String(value).replace(/"/g, '&quot;')}"`)
          }
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
