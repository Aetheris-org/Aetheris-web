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
  { label: string; icon: ComponentType<{ className?: string }>; tone: string; iconColor: string }
> = {
  info: {
    label: 'Инфо',
    icon: Info,
    tone: 'border-border/60 bg-muted/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  success: {
    label: 'Успех',
    icon: CheckCircle2,
    tone: 'border-border/60 bg-muted/30',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  warning: {
    label: 'Внимание',
    icon: AlertTriangle,
    tone: 'border-border/60 bg-muted/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  idea: {
    label: 'Идея',
    icon: Lightbulb,
    tone: 'border-border/60 bg-muted/30',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
  note: {
    label: 'Заметка',
    icon: StickyNote,
    tone: 'border-border/60 bg-muted/30',
    iconColor: 'text-pink-500 dark:text-pink-400',
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
        'callout-block group relative my-4 flex gap-3 rounded-lg border px-4 py-3 text-sm transition-all',
        variantConfig.tone,
        editor.isEditable && 'ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2'
      )}
      data-variant={variant}
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center">
        <VariantIcon className={cn('h-5 w-5', variantConfig.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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

  renderHTML({ HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        'data-variant': HTMLAttributes.variant ?? 'info',
        class: 'callout-block',
      }),
      0,
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


