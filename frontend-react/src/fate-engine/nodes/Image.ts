/**
 * Fate Engine - Изображение
 */

import type { FateNodeDefinition } from '../types'

export const Image: FateNodeDefinition = {
  name: 'image',
  group: 'block',
  inline: false,
  atom: true,
  attrs: {
    src: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('src')
      },
      toDOM: (src: string) => {
        return { src }
      },
    },
    alt: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('alt')
      },
      toDOM: (alt: string) => {
        return alt ? { alt } : {}
      },
    },
    title: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('title')
      },
      toDOM: (title: string) => {
        return title ? { title } : {}
      },
    },
    width: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        const width = dom.getAttribute('width')
        return width ? parseInt(width, 10) : null
      },
      toDOM: (width: number) => {
        return width ? { width: String(width) } : {}
      },
    },
    height: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        const height = dom.getAttribute('height')
        return height ? parseInt(height, 10) : null
      },
      toDOM: (height: number) => {
        return height ? { height: String(height) } : {}
      },
    },
    align: {
      default: 'center',
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('data-align') || 'center'
      },
      toDOM: (align: string) => {
        return align !== 'center' ? { 'data-align': align } : {}
      },
    },
  },
  parseDOM: [
    {
      tag: 'img[src]',
      getAttrs: (dom: HTMLElement) => {
        return {
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          title: dom.getAttribute('title'),
          width: dom.getAttribute('width')
            ? parseInt(dom.getAttribute('width')!, 10)
            : null,
          height: dom.getAttribute('height')
            ? parseInt(dom.getAttribute('height')!, 10)
            : null,
          align: dom.getAttribute('data-align') || 'center',
        }
      },
    },
  ],
  toDOM: (node) => {
    const attrs: Record<string, string> = {
      src: node.attrs?.src || '',
      class: 'editor-image',
    }

    if (node.attrs?.alt) {
      attrs.alt = node.attrs.alt
    }

    if (node.attrs?.title) {
      attrs.title = node.attrs.title
    }

    if (node.attrs?.width) {
      attrs.width = String(node.attrs.width)
    }

    if (node.attrs?.height) {
      attrs.height = String(node.attrs.height)
    }

    if (node.attrs?.align && node.attrs.align !== 'center') {
      attrs['data-align'] = node.attrs.align
    }

    return ['img', attrs]
  },
  addCommands: () => ({
    setImage: (attrs: { src: string; alt?: string; title?: string }) => ({ state, dispatch }: any) => {
      // Команда для вставки изображения
      return true
    },
  }),
}
