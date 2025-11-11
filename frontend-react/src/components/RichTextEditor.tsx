import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { EditorContent, ReactRenderer, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import { Extension, type Range } from '@tiptap/core'
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
} from '@tiptap/suggestion'
import { createLowlight, common } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Text,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  RemoveFormatting,
  Highlighter,
  Braces,
  Minus,
} from 'lucide-react'

import type { Editor } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const lowlight = createLowlight(common)

type SlashCommandItem = {
  id: string
  title: string
  description: string
  icon: ReactNode
  keywords?: string[]
  hint?: string
  command: (props: { editor: Editor; range: Range }) => void
}

type SlashCommandProps = SuggestionProps<SlashCommandItem>

const slashCommandItems: SlashCommandItem[] = [
  {
    id: 'text',
    title: 'Paragraph',
    description: 'Start with plain text',
    icon: <Text className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    id: 'heading-1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className="h-4 w-4" />,
    keywords: ['title', 'h1'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
    },
  },
  {
    id: 'heading-2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 className="h-4 w-4" />,
    keywords: ['h2'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
    },
  },
  {
    id: 'heading-3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading3 className="h-4 w-4" />,
    keywords: ['h3'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run()
    },
  },
  {
    id: 'bullet-list',
    title: 'Bullet list',
    description: 'Create a bulleted list',
    icon: <List className="h-4 w-4" />,
    keywords: ['list'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    id: 'ordered-list',
    title: 'Numbered list',
    description: 'Create a numbered list',
    icon: <ListOrdered className="h-4 w-4" />,
    keywords: ['list', 'numbers'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quotation',
    icon: <Quote className="h-4 w-4" />,
    keywords: ['blockquote'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    id: 'code-block',
    title: 'Code block',
    description: 'Display code with syntax highlight',
    icon: <Braces className="h-4 w-4" />,
    keywords: ['code', 'snippet'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Add a subtle divider',
    icon: <Minus className="h-4 w-4" />,
    keywords: ['line', 'hr'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Embed an image from URL',
    icon: <ImageIcon className="h-4 w-4" />,
    keywords: ['picture', 'media'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
]

const SlashCommandList = forwardRef<HTMLDivElement, SlashCommandProps>((props, ref) => {
  const { items, command } = props
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index]
      if (!item) return
      command(item)
    },
    [items, command]
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((index) => (index + items.length - 1) % items.length)
        return true
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((index) => (index + 1) % items.length)
        return true
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  if (!items.length) {
    return (
      <Card
        ref={ref}
        className="w-80 border border-border/70 bg-popover/95 shadow-lg backdrop-blur"
      >
        <CardContent className="p-4 text-sm text-muted-foreground">
          No matches for “{props.query}”.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={ref}
      className="w-80 border border-border/70 bg-popover/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-1 p-1.5">
        {items.map((item, index) => {
          const isActive = index === selectedIndex
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(index)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                isActive
                  ? 'bg-accent text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border border-border/80',
                  isActive ? 'border-primary/50 bg-primary/10 text-primary' : 'bg-background/80'
                )}
              >
                {item.icon}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </span>
              {item.hint && (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
                  {item.hint}
                </span>
              )}
            </button>
          )
        })}
        <div className="flex items-center justify-between rounded-md border border-dashed border-border/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <span>Use ↑ ↓ ↵</span>
          <span>Slash commands</span>
        </div>
      </CardContent>
    </Card>
  )
})

SlashCommandList.displayName = 'SlashCommandList'

const SlashCommandExtension = Extension.create<{
  suggestion: Partial<SuggestionOptions<SlashCommandItem>>
}>({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: true,
        allow: ({ editor, state, range }) => {
          const $from = state.doc.resolve(range.from)
          const isRootDepth = $from.depth === 1 || $from.depth === 0
          return editor.isEditable && isRootDepth
        },
        items: ({ query }) =>
          slashCommandItems.filter((item) => {
            const search = query.toLowerCase()
            return (
              !search ||
              item.title.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search) ||
              item.keywords?.some((keyword) => keyword.toLowerCase().includes(search))
            )
          }),
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        render: () => {
          let component: ReactRenderer<typeof SlashCommandList> | null = null
          let popup: TippyInstance | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                animation: 'shift-away',
                duration: [120, 80],
                theme: 'light-border',
                arrow: false,
              })[0]
            },
            onUpdate: (props) => {
              component?.updateProps(props)
              if (!props.clientRect || !popup) {
                return
              }

              popup.setProps({
                getReferenceClientRect: props.clientRect,
              })
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.hide()
                return true
              }

              const handler = (component?.ref as unknown as { onKeyDown?: (props: SlashCommandProps) => boolean })?.onKeyDown

              if (handler) {
                return handler(props)
              }

              return false
            },
            onExit: () => {
              component?.destroy()
              component = null

              if (popup) {
                popup.destroy()
                popup = null
              }
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...(this.options.suggestion as SuggestionOptions<SlashCommandItem>),
      }),
    ]
  },
})

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  characterLimit?: number
  disabled?: boolean
  className?: string
  id?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your story...',
  characterLimit,
  disabled = false,
  className,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'font-medium text-primary underline underline-offset-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount.configure({
        limit: characterLimit ?? 20000,
      }),
      SlashCommandExtension,
    ],
    [placeholder, characterLimit]
  )

  const editor = useEditor({
    extensions,
    content: value || '',
    editable: !disabled,
    autofocus: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'tiptap focus:outline-none',
          'min-h-[320px] whitespace-pre-wrap break-words text-base leading-relaxed text-foreground'
        ),
      },
    },
  })

  const characterCount = editor?.storage.characterCount.characters() ?? value.length
  const wordCount =
    editor?.storage.characterCount.words?.() ??
    (value.trim() ? value.trim().split(/\s+/).length : 0)

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) {
      editor.commands.setContent(value, false)
    }
    if (!value && current !== '<p></p>') {
      editor.commands.clearContent()
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  const handleOpenLinkDialog = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href ?? ''
    setLinkValue(previousUrl)
    setIsLinkDialogOpen(true)
  }, [editor])

  const handleApplyLink = useCallback(() => {
    if (!editor) return
    if (!linkValue) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsLinkDialogOpen(false)
      return
    }
    const sanitized = linkValue.startsWith('http') ? linkValue : `https://${linkValue}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: sanitized }).run()
    setIsLinkDialogOpen(false)
  }, [editor, linkValue])

  const handleRemoveFormatting = useCallback(() => {
    editor?.chain().focus().unsetAllMarks().clearNodes().run()
  }, [editor])

  return (
    <>
    <Card
      className={cn(
        'overflow-hidden border border-border/70 bg-card/95 shadow-lg backdrop-blur-sm transition-all',
        disabled && 'opacity-80',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Draft
          </Badge>
          <Separator orientation="vertical" className="h-4 bg-border/60" />
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Use “/” for quick commands
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={!editor?.can().chain().focus().undo().run()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={!editor?.can().chain().focus().redo().run()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="px-0 pb-0">
        <div className="relative border-b border-border/70 bg-background/70 px-4 pb-8 pt-6">
          {editor && (
            <BubbleMenu
              editor={editor}
              className="flex items-center gap-1 rounded-full border border-border/70 bg-card/95 px-2 py-1 shadow-xl backdrop-blur"
              tippyOptions={{
                duration: 120,
                placement: 'top',
                appendTo: () => document.body,
              }}
            >
              {[
                {
                  label: 'Bold',
                  icon: Bold,
                  action: () => editor.chain().focus().toggleBold().run(),
                  isActive: editor.isActive('bold'),
                  disabled: !editor.can().chain().focus().toggleBold().run(),
                },
                {
                  label: 'Strikethrough',
                  icon: Strikethrough,
                  action: () => editor.chain().focus().toggleStrike().run(),
                  isActive: editor.isActive('strike'),
                  disabled: !editor.can().chain().focus().toggleStrike().run(),
                },
                {
                  label: 'Italic',
                  icon: Italic,
                  action: () => editor.chain().focus().toggleItalic().run(),
                  isActive: editor.isActive('italic'),
                  disabled: !editor.can().chain().focus().toggleItalic().run(),
                },
                {
                  label: 'Inline code',
                  icon: Code,
                  action: () => editor.chain().focus().toggleCode().run(),
                  isActive: editor.isActive('code'),
                  disabled: !editor.can().chain().focus().toggleCode().run(),
                },
                {
                  label: 'Highlight',
                  icon: Highlighter,
                  action: () => editor.chain().focus().toggleHighlight().run(),
                  isActive: editor.isActive('highlight'),
                  disabled: !editor.can().chain().focus().toggleHighlight().run(),
                },
                {
                  label: editor.isActive('link') ? 'Edit link' : 'Add link',
                  icon: LinkIcon,
                  action: handleOpenLinkDialog,
                  isActive: editor.isActive('link'),
                  disabled: false,
                },
                {
                  label: 'Clear formatting',
                  icon: RemoveFormatting,
                  action: handleRemoveFormatting,
                  isActive: false,
                  disabled: false,
                },
              ].map(({ icon: Icon, label, action, isActive, disabled }) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-primary/90 text-primary-foreground shadow-sm'
                  )}
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault()
                    action()
                  }}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </BubbleMenu>
          )}

          <div className="group/editor overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]">
            <EditorContent
              editor={editor}
              id={id}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              className="text-base"
            />
            <div className="pointer-events-none hidden px-4 pb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/50 group-focus-within/editor:flex">
              Writing mode
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="font-medium text-foreground">Markdown ready</span>
            <Separator orientation="vertical" className="h-3.5 bg-border/60" />
            <span>⌘/Ctrl + B for bold</span>
          </span>
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <Separator orientation="vertical" className="h-3.5 bg-border/60" />
            {characterLimit ? (
              <span>
                {characterCount}/{characterLimit} characters
              </span>
            ) : (
              <span>{characterCount} characters</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editor?.isActive('link') ? 'Edit link' : 'Add link'}</DialogTitle>
          <DialogDescription>Paste a valid URL. Leave blank to remove the link.</DialogDescription>
        </DialogHeader>
        <Input
          value={linkValue}
          onChange={(event) => setLinkValue(event.target.value)}
          placeholder="https://example.com"
          autoFocus
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyLink} disabled={!editor}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default RichTextEditor

