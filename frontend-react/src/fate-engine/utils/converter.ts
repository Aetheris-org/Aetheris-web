/**
 * Fate Engine - Утилиты для конвертации
 * Конвертация между различными форматами (Slate, ProseMirror, HTML)
 */

import type { FateDocument } from '../types'
import { slateToProseMirror } from '@/lib/slate-to-prosemirror'

/**
 * Конвертирует ProseMirror JSON в Fate Engine формат
 */
export function prosemirrorToFate(prosemirror: any): FateDocument {
  if (!prosemirror || prosemirror.type !== 'doc') {
    return { type: 'doc', content: [] }
  }

  // ProseMirror и Fate Engine используют одинаковый формат
  // Просто возвращаем как есть
  return prosemirror
}

/**
 * Конвертирует Fate Engine формат в ProseMirror JSON
 */
export function fateToProsemirror(fate: FateDocument): any {
  // Fate Engine и ProseMirror используют одинаковый формат
  return fate
}

/**
 * Конвертирует Slate JSON в Fate Engine формат
 * Использует существующую утилиту slate-to-prosemirror
 */
export function slateToFate(slate: any): FateDocument {
  // Используем существующую функцию конвертации
  const prosemirror = slateToProseMirror(slate)
  return prosemirrorToFate(prosemirror)
}

/**
 * Конвертирует HTML в Fate Engine формат
 */
export function htmlToFate(html: string): FateDocument {
  // Базовая конвертация HTML в Fate формат
  // В реальной реализации нужно парсить HTML и конвертировать в узлы
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Простая конвертация основных элементов
  const content: any[] = []
  
  Array.from(doc.body.children).forEach((element) => {
    const node = htmlElementToFateNode(element as HTMLElement)
    if (node) {
      content.push(node)
    }
  })
  
  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  }
}

/**
 * Конвертирует HTML элемент в Fate узел
 */
function htmlElementToFateNode(element: HTMLElement): any | null {
  const tagName = element.tagName.toLowerCase()
  
  switch (tagName) {
    case 'p':
      return {
        type: 'paragraph',
        content: htmlContentToFateNodes(element),
      }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      const level = parseInt(tagName.charAt(1), 10)
      return {
        type: 'heading',
        attrs: { level },
        content: htmlContentToFateNodes(element),
      }
    case 'ul':
      return {
        type: 'bulletList',
        content: Array.from(element.children)
          .map((child) => htmlElementToFateNode(child as HTMLElement))
          .filter((node) => node !== null),
      }
    case 'ol':
      return {
        type: 'orderedList',
        attrs: {
          start: element.getAttribute('start') ? parseInt(element.getAttribute('start')!, 10) : 1,
        },
        content: Array.from(element.children)
          .map((child) => htmlElementToFateNode(child as HTMLElement))
          .filter((node) => node !== null),
      }
    case 'li':
      return {
        type: 'listItem',
        content: htmlContentToFateNodes(element),
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        content: htmlContentToFateNodes(element),
      }
    case 'img':
      return {
        type: 'image',
        attrs: {
          src: element.getAttribute('src') || '',
          alt: element.getAttribute('alt') || '',
        },
      }
    case 'hr':
      return {
        type: 'horizontalRule',
      }
    case 'br':
      return {
        type: 'hardBreak',
      }
    default:
      return null
  }
}

/**
 * Конвертирует содержимое HTML элемента в массив Fate узлов
 */
function htmlContentToFateNodes(element: HTMLElement): any[] {
  const nodes: any[] = []
  
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        nodes.push({
          type: 'text',
          text,
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const htmlNode = htmlElementToFateNode(node as HTMLElement)
      if (htmlNode) {
        nodes.push(htmlNode)
      }
    }
  })
  
  return nodes.length > 0 ? nodes : []
}
