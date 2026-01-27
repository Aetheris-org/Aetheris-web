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
  // Проверяем, что мы в браузере
  if (typeof document === 'undefined') {
    // SSR fallback - создаем фиктивный элемент
    // В реальности это не должно вызываться в SSR, но на всякий случай
    return {
      dom: {} as HTMLElement,
      update: () => {},
      destroy: () => {},
    }
  }

  const dom = document.createElement('div')
  dom.className = 'fate-editor'
  dom.contentEditable = options.editable !== false ? 'true' : 'false'
  dom.setAttribute('data-placeholder', options.editable !== false ? '' : '')

  // Рендерим начальное состояние с обработкой ошибок
  try {
    updateDOM(dom, state)
  } catch (error) {
    console.error('[FateEngine] Error updating DOM:', error)
    dom.innerHTML = '<p>Ошибка при отображении контента</p>'
  }

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
  try {
    if (!state || !state.doc) {
      dom.innerHTML = ''
      return
    }
    const html = docToHTML(state.doc)
    dom.innerHTML = html || ''
  } catch (error) {
    console.error('[FateEngine] Error in updateDOM:', error)
    dom.innerHTML = '<p>Ошибка при отображении контента</p>'
  }
}

function parseDOM(_dom: HTMLElement, currentState: FateEditorState): FateEditorState {
  // Парсим DOM обратно в состояние
  // В упрощенной версии возвращаем текущее состояние
  return currentState
}

function docToHTML(doc: any): string {
  // Простая конвертация документа в HTML
  if (!doc || !doc.content) {
    return ''
  }

  try {
    return doc.content
      .map((node: any) => {
        try {
          return nodeToHTML(node)
        } catch (error) {
          console.error('[FateEngine] Error converting node to HTML:', error, node)
          return ''
        }
      })
      .filter((html: string) => html)
      .join('')
  } catch (error) {
    console.error('[FateEngine] Error in docToHTML:', error)
    return ''
  }
}

function nodeToHTML(node: any): string {
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

  // Специальная обработка для заголовков - используем правильный тег
  let tag = getNodeTag(node.type)
  if (node.type === 'heading' && node.attrs?.level) {
    const level = Math.min(Math.max(node.attrs.level, 1), 6)
    tag = `h${level}`
  }

  const attrs = getNodeAttrs(node)
  const content = node.content && Array.isArray(node.content)
    ? node.content.map((child: any) => nodeToHTML(child)).join('')
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
            return escapeHtml(child.text || '')
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

function escapeHtml(text: string): string {
  if (typeof document === 'undefined') {
    // SSR fallback - простое экранирование
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

function getNodeTag(type: string): string {
  const mapping: Record<string, string> = {
    paragraph: 'p',
    heading: 'h1', // Будет переопределено в getNodeAttrs для правильного уровня
    bulletList: 'ul',
    orderedList: 'ol',
    listItem: 'li',
    blockquote: 'blockquote',
    codeBlock: 'pre',
    horizontalRule: 'hr',
    hardBreak: 'br',
    callout: 'aside',
    columns: 'div',
    column: 'div',
  }
  return mapping[type] || 'div'
}

function getNodeAttrs(node: any): string {
  const attrs: string[] = []
  
  // Специальная обработка для заголовков
  if (node.type === 'heading' && node.attrs?.level) {
    const level = Math.min(Math.max(node.attrs.level, 1), 6)
    // Обновляем тег для заголовка
    const headingTag = `h${level}`
    // Возвращаем атрибуты без level, так как он уже использован для тега
    const otherAttrs: string[] = []
    if (node.attrs.blockId) {
      otherAttrs.push(`id="${node.attrs.blockId}"`)
      otherAttrs.push(`data-block-id="${node.attrs.blockId}"`)
    }
    if (node.attrs.textAlign) {
      otherAttrs.push(`style="text-align: ${node.attrs.textAlign}"`)
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
        } else if (key !== 'src' && key !== 'alt' && key !== 'width' && key !== 'height' && key !== 'align') {
          // Для изображений эти атрибуты обрабатываются отдельно
          attrs.push(`${key}="${String(value).replace(/"/g, '&quot;')}"`)
        }
      }
    })
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
}
