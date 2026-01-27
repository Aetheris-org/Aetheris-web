/**
 * Fate Engine - Ссылка
 * Метка для ссылок
 */

import type { FateMarkDefinition } from '../types'

export const Link: FateMarkDefinition = {
  name: 'link',
  attrs: {
    href: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('href')
      },
      toDOM: (href: string) => {
        return { href }
      },
    },
    target: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.getAttribute('target')
      },
      toDOM: (target: string) => {
        return target ? { target } : {}
      },
    },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: (dom: HTMLElement) => {
        return {
          href: dom.getAttribute('href'),
          target: dom.getAttribute('target'),
        }
      },
    },
  ],
  toDOM: (mark) => {
    const attrs: Record<string, string> = {
      href: mark.attrs?.href || '#',
    }
    if (mark.attrs?.target) {
      attrs.target = mark.attrs.target
    }
    return ['a', attrs, 0]
  },
  addCommands: () => ({
    setLink: (attrs: { href: string; target?: string }) => ({ state, dispatch }: any) => {
      // Команда для установки ссылки
      return true
    },
    unsetLink: () => ({ state, dispatch }: any) => {
      // Команда для снятия ссылки
      return true
    },
    toggleLink: (attrs: { href: string; target?: string }) => ({ state, dispatch }: any) => {
      // Команда для переключения ссылки
      return true
    },
  }),
}
