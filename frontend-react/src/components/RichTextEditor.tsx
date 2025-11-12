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
import Typography from '@tiptap/extension-typography'
import Image from '@tiptap/extension-image'
// import Details from '@tiptap/extension-details' // Временно отключено из-за проблем с detailsSummary/detailsContent
import { Extension, type Range, type Editor } from '@tiptap/core'
import Suggestion, { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion'
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
  StickyNote,
  ListTodo,
  Columns3,
  Link2,
  Hash,
} from 'lucide-react'

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Callout, type CalloutVariant } from '@/extensions/callout'
import { Column, Columns, COLUMN_LAYOUTS, type ColumnPresetKey } from '@/extensions/columns'
import { SmartInput } from '@/extensions/smart-input'
import { BlockAnchor, getBlockAnchors, type AnchorData } from '@/extensions/block-anchor'
import DragHandle from '@tiptap/extension-drag-handle'
import { offset } from '@floating-ui/dom'

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

let slashCommandItemsResolver: () => SlashCommandItem[] = () => []

export const setSlashCommandItemsResolver = (resolver: () => SlashCommandItem[]) => {
  slashCommandItemsResolver = resolver
}

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
                  ? 'bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                  isActive
                    ? 'border-primary/60 bg-primary/20 text-primary shadow-sm'
                    : 'border-border/80 bg-background/80'
                )}
              >
                {item.icon}
              </span>
              <span className="flex flex-1 flex-col">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-foreground'
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive ? 'text-muted-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {item.description}
                </span>
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
        items: ({ query }) => {
          const allItems = slashCommandItemsResolver()
          return allItems.filter((item) => {
            const search = query.toLowerCase()
            return (
              !search ||
              item.title.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search) ||
              item.keywords?.some((keyword) => keyword.toLowerCase().includes(search))
            )
          })
        },
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
                theme: 'slash-command',
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

const normalizeAnchorId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')

const getActiveColumnsLayout = (editor: Editor) => {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === 'columns') {
      return (node.attrs.layout as number[]) ?? null
    }
  }
  return null
}

const areLayoutsEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => Math.round(value) === Math.round(b[index]))

const findPresetByLayout = (layout: number[] | null): ColumnPresetKey | null => {
  if (!layout) return null
  const found = (Object.entries(COLUMN_LAYOUTS) as [ColumnPresetKey, { widths: number[] }][]).find(
    ([, cfg]) => areLayoutsEqual(cfg.widths, layout)
  )
  return found ? found[0] : null
}

type OutlineItem = {
  id: string
  pos: number
  level: number
  text: string
}

const EditorOutline = ({ editor }: { editor: Editor | null }) => {
  const [items, setItems] = useState<OutlineItem[]>([])
  const [activePos, setActivePos] = useState<number | null>(null)

  useEffect(() => {
    if (!editor) return

    const collectHeadings = () => {
      const headings: OutlineItem[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level ?? 1
          const text = node.textContent.trim() || `Заголовок ${headings.length + 1}`
          headings.push({
            id: node.attrs.blockId ?? `heading-${pos}`,
            pos,
            level,
            text,
          })
        }
      })
      setItems(headings)
    }

    const updateActive = () => {
      const { $from } = editor.state.selection
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth)
        if (node.type.name === 'heading') {
          setActivePos($from.before(depth))
          return
        }
      }
      setActivePos(null)
    }

    collectHeadings()
    updateActive()

    editor.on('transaction', collectHeadings)
    editor.on('selectionUpdate', updateActive)

    return () => {
      editor.off('transaction', collectHeadings)
      editor.off('selectionUpdate', updateActive)
    }
  }, [editor])

  if (!editor || items.length === 0) {
    return null
  }

  return (
    <aside className="sticky top-[5.5rem] hidden max-h-[420px] w-64 shrink-0 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-3 text-sm lg:block">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Оглавление
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = activePos === item.pos
          return (
            <button
              key={`${item.id}-${item.pos}`}
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setTextSelection({ from: item.pos + 1, to: item.pos + 1 })
                  .scrollIntoView()
                  .run()
              }}
              className={cn(
                'flex w-full items-center rounded-md px-2 py-1.5 text-left transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
              )}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
            >
              <span className="truncate">{item.text}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

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
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  const [isAnchorDialogOpen, setIsAnchorDialogOpen] = useState(false)
  const [anchorMode, setAnchorMode] = useState<'create' | 'link'>('create')
  const [anchorId, setAnchorId] = useState('')
  const [anchorText, setAnchorText] = useState('')
  const [anchorOptions, setAnchorOptions] = useState<AnchorData[]>([])

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // Отключаем Link из StarterKit, используем свой
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
      Typography,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      // Details временно отключен
      // Details.configure({
      //   HTMLAttributes: {
      //     class: 'editor-toggle',
      //   },
      // }),
      Callout,
      Column,
      Columns,
      SmartInput,
      BlockAnchor.configure({
        types: [
          'paragraph',
          'heading',
          'callout',
          'columns',
          'column',
          'blockquote',
          'codeBlock',
          // 'details', // Временно отключено
        ],
      }),
      DragHandle.configure({
        render: () => {
          const element = document.createElement('div')
          element.className = 'editor-drag-handle'
          element.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="2" r="1" fill="currentColor"/>
              <circle cx="6" cy="2" r="1" fill="currentColor"/>
              <circle cx="10" cy="2" r="1" fill="currentColor"/>
              <circle cx="2" cy="6" r="1" fill="currentColor"/>
              <circle cx="6" cy="6" r="1" fill="currentColor"/>
              <circle cx="10" cy="6" r="1" fill="currentColor"/>
              <circle cx="2" cy="10" r="1" fill="currentColor"/>
              <circle cx="6" cy="10" r="1" fill="currentColor"/>
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
            </svg>
          `
          return element
        },
        computePositionConfig: {
          placement: 'left-start', // Как в Notion - слева, на уровне начала блока
          strategy: 'fixed',
          middleware: [
            offset({ mainAxis: -40, crossAxis: 0 }), // Смещение влево на 40px, без вертикального смещения
          ],
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

  const openImageDialog = useCallback(() => {
    setImageUrl('')
    setImageAlt('')
    setIsImageDialogOpen(true)
  }, [])

  const handleInsertImage = useCallback(() => {
    if (!editor) return
    const url = imageUrl.trim()
    if (!url) {
      setIsImageDialogOpen(false)
      return
    }
    const alt = imageAlt.trim()
    editor.chain().focus().setImage({ src: url, alt: alt || null }).run()
    setIsImageDialogOpen(false)
    setImageUrl('')
    setImageAlt('')
  }, [editor, imageAlt, imageUrl])

  const openAnchorDialog = useCallback(
    (mode: 'create' | 'link') => {
      if (!editor) return
      setAnchorMode(mode)
      setAnchorId('')
      setAnchorText('')
      if (mode === 'link') {
        setAnchorOptions(getBlockAnchors(editor))
      } else {
        setAnchorOptions([])
      }
      setIsAnchorDialogOpen(true)
    },
    [editor]
  )

  const handleApplyAnchor = useCallback(() => {
    if (!editor) return
    if (anchorMode === 'create') {
      const customId = normalizeAnchorId(anchorId)
      editor.chain().focus().setBlockAnchor(customId || undefined).run()
      setIsAnchorDialogOpen(false)
      return
    }

    const targetId = normalizeAnchorId(anchorId)
    if (!targetId) {
      return
    }
    const label = anchorText.trim() || targetId
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: label,
        marks: [{ type: 'link', attrs: { href: `#${targetId}` } }],
      })
      .run()
    setIsAnchorDialogOpen(false)
  }, [anchorId, anchorMode, anchorText, editor])

  useEffect(() => {
    if (!editor) return
    setSlashCommandItemsResolver(() => [
      {
        id: 'text',
        title: 'Paragraph',
        description: 'Стандартный текстовый блок',
        icon: <Text className="h-4 w-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setParagraph().run()
        },
      },
      {
        id: 'heading-1',
        title: 'Heading 1',
        description: 'Крупный заголовок секции',
        icon: <Heading1 className="h-4 w-4" />,
        keywords: ['title', 'h1'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
        },
      },
      {
        id: 'heading-2',
        title: 'Heading 2',
        description: 'Средний заголовок',
        icon: <Heading2 className="h-4 w-4" />,
        keywords: ['h2'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
        },
      },
      {
        id: 'heading-3',
        title: 'Heading 3',
        description: 'Младший заголовок',
        icon: <Heading3 className="h-4 w-4" />,
        keywords: ['h3'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run()
        },
      },
      {
        id: 'bullet-list',
        title: 'Bullet list',
        description: 'Маркированный список',
        icon: <List className="h-4 w-4" />,
        keywords: ['list'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
      },
      {
        id: 'ordered-list',
        title: 'Numbered list',
        description: 'Нумерованный список',
        icon: <ListOrdered className="h-4 w-4" />,
        keywords: ['list', 'numbers'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
      },
      {
        id: 'quote',
        title: 'Quote',
        description: 'Цитата с выделением',
        icon: <Quote className="h-4 w-4" />,
        keywords: ['blockquote'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run()
        },
      },
      {
        id: 'code-block',
        title: 'Code block',
        description: 'Блок кода с подсветкой',
        icon: <Braces className="h-4 w-4" />,
        keywords: ['code', 'snippet'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
      },
      {
        id: 'divider',
        title: 'Divider',
        description: 'Горизонтальная линия',
        icon: <Minus className="h-4 w-4" />,
        keywords: ['line', 'hr'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        },
      },
      {
        id: 'callout',
        title: 'Callout',
        description: 'Заметка или выделенный блок',
        icon: <StickyNote className="h-4 w-4" />,
        keywords: ['note', 'info'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertCallout('info').run()
        },
      },
      // Toggle временно отключен
      // {
      //   id: 'toggle',
      //   title: 'Toggle block',
      //   description: 'Сворачиваемая секция',
      //   icon: <ListTodo className="h-4 w-4" />,
      //   keywords: ['details', 'collapse'],
      //   command: ({ editor, range }) => {
      //     editor
      //       .chain()
      //       .focus()
      //       .deleteRange(range)
      //       .toggleDetails()
      //       .run()
      //   },
      // },
      {
        id: 'columns-two',
        title: 'Two columns',
        description: 'Секция с двумя колонками',
        icon: <Columns3 className="h-4 w-4" />,
        keywords: ['layout', 'grid'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertColumns('twoEqual').run()
        },
      },
      {
        id: 'columns-three',
        title: 'Three columns',
        description: 'Три колонки для контента',
        icon: <Columns3 className="h-4 w-4" />,
        keywords: ['layout', 'grid', 'three'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertColumns('threeEqual').run()
        },
      },
      {
        id: 'anchor',
        title: 'Anchor',
        description: 'Добавить якорь к блоку',
        icon: <Hash className="h-4 w-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run()
          openAnchorDialog('create')
        },
      },
      {
        id: 'anchor-link',
        title: 'Link to anchor',
        description: 'Ссылка на существующий блок',
        icon: <Link2 className="h-4 w-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run()
          openAnchorDialog('link')
        },
      },
      {
        id: 'image',
        title: 'Image',
        description: 'Вставить изображение по URL',
        icon: <ImageIcon className="h-4 w-4" />,
        keywords: ['picture', 'media'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run()
          openImageDialog()
        },
      },
    ])
  }, [editor, openAnchorDialog, openImageDialog])

  const activeColumnsLayout = editor ? getActiveColumnsLayout(editor) : null
  const activeColumnsPreset = findPresetByLayout(activeColumnsLayout)

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
          <div className="flex items-center gap-2">
            {editor && activeColumnsLayout && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 px-3">
                    <Columns3 className="h-4 w-4" />
                    {activeColumnsPreset ? COLUMN_LAYOUTS[activeColumnsPreset].label : 'Колонки'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(Object.entries(COLUMN_LAYOUTS) as [ColumnPresetKey, typeof COLUMN_LAYOUTS[keyof typeof COLUMN_LAYOUTS]][]).map(
                    ([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        className={cn(
                          'flex flex-col items-start gap-1',
                          activeColumnsPreset === key && 'bg-muted text-foreground'
                        )}
                        onSelect={(event) => {
                          event.preventDefault()
                          editor.chain().focus().setColumnsLayout(key).run()
                        }}
                      >
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
          <div className="relative border-b border-border/70 bg-background/70">
            {editor && (
              <BubbleMenu
                editor={editor}
                shouldShow={({ editor, view, state }) => {
                  const { selection } = state
                  
                  // Не показываем если нет выделения
                  if (selection.empty) {
                    return false
                  }
                  
                  // Не показываем если это NodeSelection (выбран весь блок через drag-handle)
                  const isNodeSelection = selection.constructor.name === 'NodeSelection' || 
                                          ('node' in selection && selection.node !== undefined)
                  if (isNodeSelection) {
                    return false
                  }
                  
                  // Показываем только если выделен текст (TextSelection)
                  // Проверяем что есть выделенный текст между from и to
                  const { from, to } = selection
                  if (from === to) {
                    return false
                  }
                  
                  // Проверяем что выделен именно текст, а не пустые блоки
                  const text = state.doc.textBetween(from, to, ' ')
                  return text.trim().length > 0
                }}
                tippyOptions={{
                  duration: 120,
                  placement: 'top',
                  appendTo: () => document.body,
                }}
              >
                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/95 px-2 py-1 shadow-xl backdrop-blur">
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
                </div>
              </BubbleMenu>
            )}

            <div className="px-4 pb-8 pt-6 lg:flex lg:items-start lg:gap-10">
              <div className="group/editor relative flex-1 transition-[box-shadow] focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.04)]">
                <EditorContent
                  editor={editor}
                  id={id}
                  aria-label={ariaLabel}
                  aria-labelledby={ariaLabelledBy}
                  aria-describedby={ariaDescribedBy}
                  className="text-base"
                />
                <span className="pointer-events-none absolute bottom-2 left-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/40 opacity-0 transition-opacity duration-200 group-focus-within/editor:opacity-100">
                  Writing mode
                </span>
              </div>
              <EditorOutline editor={editor} />
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

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить изображение</DialogTitle>
            <DialogDescription>Укажите ссылку на изображение и альтернативный текст.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt text</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Описание изображения"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsImageDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleInsertImage} disabled={!editor}>
              Вставить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnchorDialogOpen} onOpenChange={setIsAnchorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{anchorMode === 'create' ? 'Добавить якорь' : 'Ссылка на якорь'}</DialogTitle>
            <DialogDescription>
              {anchorMode === 'create'
                ? 'Присвойте блоку удобный идентификатор. Если оставить поле пустым — он сгенерируется автоматически.'
                : 'Выберите существующий якорь и задайте текст ссылки.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {anchorMode === 'create' ? (
              <div className="space-y-2">
                <Label htmlFor="anchor-id">Идентификатор блока</Label>
                <Input
                  id="anchor-id"
                  value={anchorId}
                  onChange={(event) => setAnchorId(event.target.value)}
                  placeholder="section-overview"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Выберите якорь</Label>
                  <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border/60 p-2">
                    {anchorOptions.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        Пока нет блоков с якорями. Сначала пометьте нужный блок.
                      </span>
                    )}
                    {anchorOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAnchorId(option.id)}
                        className={cn(
                          'rounded-md border border-transparent px-3 py-2 text-left text-sm transition-colors',
                          anchorId === option.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <span className="block font-medium">#{option.id}</span>
                        <span className="block text-xs text-muted-foreground">{option.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anchor-text">Текст ссылки</Label>
                  <Input
                    id="anchor-text"
                    value={anchorText}
                    onChange={(event) => setAnchorText(event.target.value)}
                    placeholder="Перейти к разделу"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAnchorDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleApplyAnchor} disabled={!editor}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RichTextEditor
