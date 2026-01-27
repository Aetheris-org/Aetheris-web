/**
 * Fate Engine - Представление редактора
 * Управление DOM и взаимодействием с пользователем
 */

import type {
  FateEditorState,
  FateEditorView,
} from '../types'

export interface ViewOptions {
  editable?: boolean
  onUpdate?: (state: FateEditorState) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function createEditorView(
  state: FateEditorState,
  options: ViewOptions = {}
): FateEditorView {
  const dom = document.createElement('div')
  dom.className = 'fate-editor'
  dom.contentEditable = options.editable !== false ? 'true' : 'false'
  dom.setAttribute('data-placeholder', options.editable !== false ? '' : '')

  // Рендерим начальное состояние
  updateDOM(dom, state)

  // Обработчики событий
  if (options.editable !== false) {
    dom.addEventListener('input', () => {
      // Обновляем состояние из DOM
      const newState = parseDOM(dom, state)
      if (options.onUpdate) {
        options.onUpdate(newState)
      }
    })

    dom.addEventListener('focus', () => {
      if (options.onFocus) {
        options.onFocus()
      }
    })

    dom.addEventListener('blur', () => {
      if (options.onBlur) {
        options.onBlur()
      }
    })
  }

  return {
    dom,
    update: (newState: FateEditorState) => {
      updateDOM(dom, newState)
    },
    destroy: () => {
      // Очистка
    },
  }
}

function updateDOM(dom: HTMLElement, state: FateEditorState): void {
  // Обновляем DOM на основе состояния
  // В упрощенной версии просто обновляем innerHTML
  dom.innerHTML = docToHTML(state.doc)
}

function parseDOM(dom: HTMLElement, currentState: FateEditorState): FateEditorState {
  // Парсим DOM обратно в состояние
  // В упрощенной версии возвращаем текущее состояние
  return currentState
}

function docToHTML(doc: any): string {
  // Простая конвертация документа в HTML
  if (!doc || !doc.content) {
    return ''
  }

  return doc.content
    .map((node: any) => nodeToHTML(node))
    .join('')
}

function nodeToHTML(node: any): string {
  if (node.type === 'text') {
    let text = node.text || ''
    if (node.marks) {
      node.marks.forEach((mark: any) => {
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

  const tag = getNodeTag(node.type)
  const attrs = getNodeAttrs(node)
  const content = node.content
    ? node.content.map((child: any) => nodeToHTML(child)).join('')
    : ''

  if (node.type === 'hardBreak') {
    return '<br>'
  }

  if (node.type === 'horizontalRule') {
    return '<hr>'
  }

  return `<${tag}${attrs}>${content}</${tag}>`
}

function getNodeTag(type: string): string {
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

function getNodeAttrs(node: any): string {
  const attrs: string[] = []
  if (node.attrs) {
    Object.entries(node.attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'level' && node.type === 'heading') {
          // Для заголовков level определяет тег
          return
        }
        attrs.push(`${key}="${String(value)}"`)
      }
    })
  }

  // Специальная обработка для заголовков
  if (node.type === 'heading' && node.attrs?.level) {
    const level = Math.min(Math.max(node.attrs.level, 1), 6)
    return ` class="heading-${level}"`
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
}
