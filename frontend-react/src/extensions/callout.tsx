import type { ComponentType } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, StickyNote } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalloutVariant = 'info' | 'success' | 'warning' | 'idea' | 'note'

const CALLOUT_VARIANTS: Record<
  CalloutVariant,
  { label: string; icon: ComponentType<{ className?: string }>; tone: string }
> = {
  info: {
    label: 'Инфо',
    icon: Info,
    tone: 'border-blue-500/40 bg-blue-500/10 text-blue-100',
  },
  success: {
    label: 'Успех',
    icon: CheckCircle2,
    tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  },
  warning: {
    label: 'Внимание',
    icon: AlertTriangle,
    tone: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  },
  idea: {
    label: 'Идея',
    icon: Lightbulb,
    tone: 'border-purple-500/40 bg-purple-500/10 text-purple-100',
  },
  note: {
    label: 'Заметка',
    icon: StickyNote,
    tone: 'border-pink-500/40 bg-pink-500/10 text-pink-100',
  },
}

const CalloutView = ({ node, updateAttributes, children, editor }: NodeViewProps) => {
  const variant: CalloutVariant = node.attrs.variant ?? 'info'
  const VariantIcon = CALLOUT_VARIANTS[variant].icon

  return (
    <NodeViewWrapper
      as="aside"
      className={cn(
        'callout-block group relative my-4 flex gap-3 rounded-lg border px-4 py-3 text-sm transition-all',
        CALLOUT_VARIANTS[variant].tone,
        editor.isEditable && 'ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2'
      )}
      data-variant={variant}
    >
      <div className="mt-1 flex h-5 w-5 shrink-0 items-start justify-center">
        <VariantIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
            {CALLOUT_VARIANTS[variant].label}
          </span>
          {editor.isEditable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-white/70 hover:text-white">
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
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/90">{children}</div>
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
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [{ type: 'paragraph' }],
          }),
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


