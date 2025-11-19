import type { ComponentType } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, StickyNote } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalloutVariant = 'info' | 'success' | 'warning' | 'idea' | 'note'

const CALLOUT_VARIANTS: Record<
  CalloutVariant,
  { label: string; icon: ComponentType<{ className?: string }>; borderColor: string; iconColor: string; labelColor: string }
> = {
  info: {
    label: 'Инфо',
    icon: Info,
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500 dark:text-blue-400',
    labelColor: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    label: 'Успех',
    icon: CheckCircle2,
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    label: 'Внимание',
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500 dark:text-amber-400',
    labelColor: 'text-amber-600 dark:text-amber-400',
  },
  idea: {
    label: 'Идея',
    icon: Lightbulb,
    borderColor: 'border-l-purple-500',
    iconColor: 'text-purple-500 dark:text-purple-400',
    labelColor: 'text-purple-600 dark:text-purple-400',
  },
  note: {
    label: 'Заметка',
    icon: StickyNote,
    borderColor: 'border-l-pink-500',
    iconColor: 'text-pink-500 dark:text-pink-400',
    labelColor: 'text-pink-600 dark:text-pink-400',
  },
}

const CalloutView = ({ node, updateAttributes, children, editor }: NodeViewProps) => {
  const variant: CalloutVariant = node.attrs.variant ?? 'info'
  const VariantIcon = CALLOUT_VARIANTS[variant].icon
  const variantConfig = CALLOUT_VARIANTS[variant]

  return (
    <NodeViewWrapper
      as="aside"
      className={cn(
        'callout-block group relative my-4 flex gap-3 rounded-lg border border-border/60 bg-muted/30',
        variantConfig.borderColor,
        'border-l-4 px-4 py-3 text-sm transition-all',
        editor.isEditable && 'ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2'
      )}
      data-variant={variant}
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center">
        <VariantIcon className={cn('h-5 w-5', variantConfig.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-xs font-semibold uppercase tracking-wider', variantConfig.labelColor)}>
            {variantConfig.label}
          </span>
          {editor.isEditable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground">
                  Изменить
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {Object.entries(CALLOUT_VARIANTS).map(([value, config]) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={(event) => {
                      event.preventDefault()
                      updateAttributes({ variant: value })
                    }}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      value === variant && 'bg-muted text-foreground'
                    )}
                  >
                    <config.icon className={cn('h-4 w-4', config.iconColor)} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <NodeViewContent className="prose prose-sm max-w-none text-foreground leading-relaxed" />
      </div>
    </NodeViewWrapper>
  )
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'aside[data-type="callout"]',
      },
    ]
  },

  toDOM({ node }) {
    const variant: CalloutVariant = (node.attrs?.variant || 'info') as CalloutVariant
    const variantConfig = CALLOUT_VARIANTS[variant]
    
    // SVG иконки из lucide-react (совпадают с редактором)
    const getCalloutIconSVG = (variant: CalloutVariant): string => {
      const icons: Record<CalloutVariant, string> = {
        // Info icon (lucide-react Info)
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        // CheckCircle2 icon (lucide-react CheckCircle2)
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>',
        // AlertTriangle icon (lucide-react AlertTriangle)
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
        // Lightbulb icon (lucide-react Lightbulb)
        idea: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 0 12c1.657 0 3-4.03 3-9s-1.343-9-3-9Z"></path><path d="M12 3c-1.657 0-3 4.03-3 9s1.343 9 3 9"></path><path d="M12 3v18"></path></svg>',
        // StickyNote icon (lucide-react StickyNote)
        note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sticky-note"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path><path d="M21 3v5h-5"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path></svg>',
      }
      return icons[variant] || icons.info
    }
    
    const iconSvg = getCalloutIconSVG(variant)
    
    // Создаем DOM структуру с иконками и метками, как в редакторе
    const aside = document.createElement('aside')
    aside.setAttribute('data-type', 'callout')
    aside.setAttribute('data-variant', variant)
    aside.className = `callout-block group relative my-4 flex gap-3 rounded-lg border border-border/60 bg-muted/30 ${variantConfig.borderColor} border-l-4 px-4 py-3 text-sm transition-all`
    
    // Контейнер для иконки
    const iconContainer = document.createElement('div')
    iconContainer.className = 'mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center'
    const iconSpan = document.createElement('span')
    iconSpan.className = `h-5 w-5 ${variantConfig.iconColor}`
    iconSpan.innerHTML = iconSvg
    iconContainer.appendChild(iconSpan)
    
    // Контейнер для контента
    const contentContainer = document.createElement('div')
    contentContainer.className = 'flex-1 min-w-0'
    
    // Заголовок с меткой
    const headerDiv = document.createElement('div')
    headerDiv.className = 'flex items-center justify-between mb-2'
    const labelSpan = document.createElement('span')
    labelSpan.className = `text-xs font-semibold uppercase tracking-wider ${variantConfig.labelColor}`
    labelSpan.textContent = variantConfig.label
    headerDiv.appendChild(labelSpan)
    
    // Контейнер для содержимого
    const proseDiv = document.createElement('div')
    proseDiv.className = 'prose prose-sm max-w-none text-foreground leading-relaxed'
    
    contentContainer.appendChild(headerDiv)
    contentContainer.appendChild(proseDiv)
    
    aside.appendChild(iconContainer)
    aside.appendChild(contentContainer)
    
    // toDOM возвращает [dom, contentDOM]
    // dom - основной элемент, contentDOM - элемент для контента
    return [aside, proseDiv]
  },

  renderHTML({ HTMLAttributes, node }) {
    const variant: CalloutVariant = (HTMLAttributes.variant || node?.attrs?.variant || 'info') as CalloutVariant
    const variantConfig = CALLOUT_VARIANTS[variant]
    
    // SVG иконки из lucide-react (совпадают с редактором)
    const getCalloutIconSVG = (variant: CalloutVariant): string => {
      const icons: Record<CalloutVariant, string> = {
        // Info icon (lucide-react Info)
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        // CheckCircle2 icon (lucide-react CheckCircle2)
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>',
        // AlertTriangle icon (lucide-react AlertTriangle)
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
        // Lightbulb icon (lucide-react Lightbulb)
        idea: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 0 12c1.657 0 3-4.03 3-9s-1.343-9-3-9Z"></path><path d="M12 3c-1.657 0-3 4.03-3 9s1.343 9 3 9"></path><path d="M12 3v18"></path></svg>',
        // StickyNote icon (lucide-react StickyNote)
        note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sticky-note"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path><path d="M21 3v5h-5"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path></svg>',
      }
      return icons[variant] || icons.info
    }
    
    const iconSvg = getCalloutIconSVG(variant)
    
    // Возвращаем полную структуру с иконками и метками для HTML экспорта
    // TipTap renderHTML поддерживает вложенные массивы с тегами
    // Используем правильный синтаксис: ['tag', attributes, ...children]
    // Для вставки HTML используем data-атрибут и затем вставляем через JavaScript на этапе review
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        'data-variant': variant,
        'data-icon-svg': iconSvg,
        'data-label': variantConfig.label,
        class: `callout-block group relative my-4 flex gap-3 rounded-lg border border-border/60 bg-muted/30 ${variantConfig.borderColor} border-l-4 px-4 py-3 text-sm transition-all`,
      }),
      [
        'div',
        { class: 'mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center callout-icon-container' },
        ['span', { class: `h-5 w-5 ${variantConfig.iconColor} callout-icon` }],
      ],
      [
        'div',
        { class: 'flex-1 min-w-0' },
        [
          'div',
          { class: 'flex items-center justify-between mb-2' },
          ['span', { class: `text-xs font-semibold uppercase tracking-wider ${variantConfig.labelColor} callout-label` }, variantConfig.label],
        ],
        ['div', { class: 'prose prose-sm max-w-none text-foreground leading-relaxed' }, 0],
      ],
    ]
  },

  addCommands() {
    return {
      insertCallout:
        (variant: CalloutVariant = 'info') =>
        ({ commands, chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { variant },
              content: [{ type: 'paragraph' }],
            })
            .focus()
            .run()
        },
      setCalloutVariant:
        (variant: CalloutVariant) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { variant }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView)
  },
})


