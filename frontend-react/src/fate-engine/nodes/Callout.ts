/**
 * Fate Engine - Callout
 * Узел для информационных блоков с вариантами
 */

import type { FateNodeDefinition } from '../types'

export type CalloutVariant = 'info' | 'success' | 'warning' | 'idea' | 'note'

const CALLOUT_VARIANTS: Record<
  CalloutVariant,
  { label: string; borderColor: string; iconColor: string; labelColor: string; iconSvg: string }
> = {
  info: {
    label: 'Инфо',
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500 dark:text-blue-400',
    labelColor: 'text-blue-600 dark:text-blue-400',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  },
  success: {
    label: 'Успех',
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>',
  },
  warning: {
    label: 'Внимание',
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500 dark:text-amber-400',
    labelColor: 'text-amber-600 dark:text-amber-400',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
  },
  idea: {
    label: 'Идея',
    borderColor: 'border-l-purple-500',
    iconColor: 'text-purple-500 dark:text-purple-400',
    labelColor: 'text-purple-600 dark:text-purple-400',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 0 12c1.657 0 3-4.03 3-9s-1.343-9-3-9Z"></path><path d="M12 3c-1.657 0-3 4.03-3 9s1.343 9 3 9"></path><path d="M12 3v18"></path></svg>',
  },
  note: {
    label: 'Заметка',
    borderColor: 'border-l-pink-500',
    iconColor: 'text-pink-500 dark:text-pink-400',
    labelColor: 'text-pink-600 dark:text-pink-400',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path><path d="M21 3v5h-5"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path></svg>',
  },
}

export const Callout: FateNodeDefinition = {
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,
  attrs: {
    variant: {
      default: 'info',
      parseDOM: (dom: HTMLElement) => {
        return (dom.getAttribute('data-variant') || 'info') as CalloutVariant
      },
      toDOM: (variant: CalloutVariant) => {
        return { 'data-variant': variant }
      },
    },
  },
  parseDOM: [
    {
      tag: 'aside[data-type="callout"]',
      getAttrs: (dom: HTMLElement) => {
        return {
          variant: (dom.getAttribute('data-variant') || 'info') as CalloutVariant,
        }
      },
    },
  ],
  toDOM: (node) => {
    const variant: CalloutVariant = (node.attrs?.variant || 'info') as CalloutVariant
    const variantConfig = CALLOUT_VARIANTS[variant]
    
    const aside = document.createElement('aside')
    aside.setAttribute('data-type', 'callout')
    aside.setAttribute('data-variant', variant)
    aside.className = `callout-block group relative my-4 flex gap-3 rounded-lg border border-border/60 bg-muted/30 ${variantConfig.borderColor} border-l-4 px-4 py-3 text-sm transition-all`
    
    const iconContainer = document.createElement('div')
    iconContainer.className = 'mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center'
    const iconSpan = document.createElement('span')
    iconSpan.className = `h-5 w-5 ${variantConfig.iconColor}`
    iconSpan.innerHTML = variantConfig.iconSvg
    iconContainer.appendChild(iconSpan)
    
    const contentContainer = document.createElement('div')
    contentContainer.className = 'flex-1 min-w-0'
    
    const headerDiv = document.createElement('div')
    headerDiv.className = 'flex items-center justify-between mb-2'
    const labelSpan = document.createElement('span')
    labelSpan.className = `text-xs font-semibold uppercase tracking-wider ${variantConfig.labelColor}`
    labelSpan.textContent = variantConfig.label
    headerDiv.appendChild(labelSpan)
    
    const proseDiv = document.createElement('div')
    proseDiv.className = 'prose prose-sm max-w-none text-foreground leading-relaxed'
    
    contentContainer.appendChild(headerDiv)
    contentContainer.appendChild(proseDiv)
    
    aside.appendChild(iconContainer)
    aside.appendChild(contentContainer)
    
    return [aside, proseDiv]
  },
  addCommands: () => ({
    insertCallout: (_variant: CalloutVariant = 'info') => () => {
      // Команда для вставки callout
      return true
    },
    setCalloutVariant: (_variant: CalloutVariant) => () => {
      // Команда для изменения варианта callout
      return true
    },
  }),
}
