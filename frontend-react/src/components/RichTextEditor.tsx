import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
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
import { logger } from '@/lib/logger'
import Suggestion, { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion'
// Используем CodeBlockWithCopy, который уже настроен с lowlight и всеми языками
import { CodeBlockWithCopy } from '@/extensions/code-block-with-copy'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
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
  Columns3,
  Link2,
  Hash,
  Type,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Callout } from '@/extensions/callout'
import { Column, Columns, COLUMN_LAYOUTS, type ColumnPresetKey } from '@/extensions/columns'
import { SmartInput } from '@/extensions/smart-input'
import { BlockAnchor, getBlockAnchors, type AnchorData } from '@/extensions/block-anchor'
// import DragHandle from '@tiptap/extension-drag-handle' // Требует дополнительные зависимости
import { DragHandle } from '@/extensions/drag-handle' // Используем кастомную реализацию

type SlashCommandItem = {
  id: string
  title: string
  description: string
  icon: ReactNode
  keywords?: string[]
  hint?: string
  disabled?: boolean
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
      if (!item || item.disabled) return
      command(item)
    },
    [items, command]
  )

  useEffect(() => {
    // Находим первый не-disabled элемент
    const firstEnabledIndex = items.findIndex(item => !item.disabled)
    setSelectedIndex(firstEnabledIndex >= 0 ? firstEnabledIndex : 0)
  }, [items])

  // @ts-expect-error - useImperativeHandle type mismatch (returns object, not HTMLDivElement)
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        // Пропускаем disabled элементы при навигации
        let newIndex = (selectedIndex + items.length - 1) % items.length
        let attempts = 0
        while (items[newIndex]?.disabled && attempts < items.length) {
          newIndex = (newIndex + items.length - 1) % items.length
          attempts++
        }
        setSelectedIndex(newIndex)
        return true
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        // Пропускаем disabled элементы при навигации
        let newIndex = (selectedIndex + 1) % items.length
        let attempts = 0
        while (items[newIndex]?.disabled && attempts < items.length) {
          newIndex = (newIndex + 1) % items.length
          attempts++
        }
        setSelectedIndex(newIndex)
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
          const isActive = index === selectedIndex && !item.disabled
          const isDisabled = item.disabled
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !isDisabled && selectItem(index)}
              disabled={isDisabled}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                isDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : isActive
                    ? 'bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                  isDisabled
                    ? 'border-border/40 bg-muted/40'
                    : isActive
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
                    isDisabled ? 'text-muted-foreground/60' : isActive ? 'text-foreground' : 'text-foreground'
                  )}
                >
                  {item.title}
                  {isDisabled && item.hint && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                      ({item.hint})
                    </span>
                  )}
                  {isDisabled && !item.hint && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                      (в разработке)
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isDisabled
                      ? 'text-muted-foreground/50'
                      : isActive
                        ? 'text-muted-foreground/80'
                        : 'text-muted-foreground'
                  )}
                >
                  {item.description}
                </span>
              </span>
              {item.hint && !isDisabled && (
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
              // @ts-expect-error - TipTap types incompatibility
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              // @ts-expect-error - TipTap types incompatibility
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                // @ts-expect-error - component.element may be null
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
                // @ts-expect-error - TipTap types incompatibility (null not allowed)
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
                // @ts-expect-error - TipTap types incompatibility (SuggestionKeyDownProps vs SlashCommandProps)
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
        // @ts-expect-error - editor is specified in options.suggestion, causing duplicate
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
    <aside className="sticky top-[5.5rem] hidden max-h-[420px] w-56 shrink-0 overflow-y-auto text-sm lg:block">
      <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        Outline
      </div>
      <nav className="space-y-0.5">
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
                'flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors',
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              )}
              style={{ paddingLeft: `${(item.level - 1) * 10 + 8}px` }}
            >
              <span className="truncate">{item.text}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export type RichTextEditorRef = {
  getJSON: () => any
  getHTML: () => string
  getText: () => string
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
  jsonValue?: any // JSON для восстановления состояния (приоритетнее чем value)
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
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
  jsonValue,
}, ref) => {
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
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            target: {
              default: null,
              parseHTML: (element) => {
                const href = element.getAttribute('href')
                // Внутренние ссылки (href="#...") не должны иметь target="_blank"
                if (href?.startsWith('#')) {
                  return null
                }
                return element.getAttribute('target') || '_blank'
              },
              renderHTML: (attributes) => {
                // Внутренние ссылки не должны иметь target
                if (attributes.href?.startsWith('#')) {
                  return {}
                }
                return {
                  target: attributes.target || '_blank',
                }
              },
            },
          }
        },
      }).configure({
        openOnClick: false, // Отключаем стандартное поведение, обрабатываем через useEffect
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'font-medium text-primary underline underline-offset-4 cursor-pointer',
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
      DragHandle, // Кастомная реализация уже содержит всю необходимую логику
      CodeBlockWithCopy,
      TextStyle,
      Color,
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
    // При инициализации используем JSON, если он доступен (сохраняет атрибуты узлов)
    content: jsonValue && jsonValue.type === 'doc' ? jsonValue : (value || ''),
    editable: !disabled,
    autofocus: false,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap focus:outline-none',
          'min-h-[400px] whitespace-pre-wrap break-words text-[15px] leading-[1.7] text-foreground'
        ),
      },
    },
    // Убеждаемся, что addNodeView вызывается при восстановлении
    onCreate: ({ editor }) => {
      // При создании редактора убеждаемся, что все узлы правильно инициализированы
      if (import.meta.env.DEV) {
        logger.debug('[RichTextEditor] Editor created, content type:', jsonValue && jsonValue.type === 'doc' ? 'JSON' : 'HTML')
        // Проверяем наличие code blocks после создания
        const json = editor.getJSON()
        const codeBlocks = json.content?.filter((node: any) => node.type === 'codeBlock') || []
        if (codeBlocks.length > 0) {
          logger.debug('[RichTextEditor] Code blocks found after creation:', codeBlocks.length)
          codeBlocks.forEach((cb: any, idx: number) => {
            logger.debug(`[RichTextEditor] Code block ${idx}:`, {
              language: cb.attrs?.language || 'plaintext',
              hasContent: !!cb.content && cb.content.length > 0,
            })
          })
        }
      }
    },
    // При обновлении редактора также проверяем code blocks
    onUpdate: ({ editor, transaction }) => {
      // Обновляем только если документ действительно изменился
      if (transaction.docChanged) {
        const html = editor.getHTML()
        onChange(html)
        // Также сохраняем JSON при каждом обновлении для правильного восстановления
        // Это гарантирует, что jsonValue всегда актуален
        if (import.meta.env.DEV) {
          const json = editor.getJSON()
          const codeBlocks = json.content?.filter((node: any) => node.type === 'codeBlock') || []
          if (codeBlocks.length > 0) {
            logger.debug('[RichTextEditor] Code blocks after update:', codeBlocks.length)
          }
        }
      }
    },
  })

  // Экспортируем методы через ref
  useImperativeHandle(ref, () => ({
    getJSON: () => {
      if (!editor) {
        logger.warn('[RichTextEditor] getJSON called but editor is not initialized')
        return null
      }
      try {
        const json = editor.getJSON()
        // Проверяем, что это валидный ProseMirror документ
        if (!json || typeof json !== 'object' || json.type !== 'doc') {
          logger.warn('[RichTextEditor] getJSON returned invalid document:', json)
          return null
        }
        return json
      } catch (error) {
        logger.error('[RichTextEditor] Error getting JSON:', error)
        return null
      }
    },
    getHTML: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
  }), [editor])

  const characterCount = editor?.storage.characterCount.characters() ?? value.length
  const wordCount =
    editor?.storage.characterCount.words?.() ??
    (value.trim() ? value.trim().split(/\s+/).length : 0)

  // Флаг для отслеживания, был ли контент уже восстановлен
  const contentRestoredRef = useRef(false)
  const lastJsonValueRef = useRef<any>(null)
  const lastValueRef = useRef<string>('')
  
  useEffect(() => {
    if (!editor) return
    
    // Восстанавливаем контент только при первой инициализации
    // После этого редактор управляет своим состоянием сам
    if (!contentRestoredRef.current) {
      // Приоритет: используем JSON, если он доступен (сохраняет атрибуты узлов, например language для code blocks)
      if (jsonValue && jsonValue.type === 'doc') {
        if (import.meta.env.DEV) {
          logger.debug('[RichTextEditor] Initial restore from JSON, code blocks count:', 
            jsonValue.content?.filter((node: any) => node.type === 'codeBlock').length || 0)
        }
        // Восстанавливаем контент из JSON только при первой инициализации
        editor.commands.setContent(jsonValue, { emitUpdate: false })
        contentRestoredRef.current = true
        lastJsonValueRef.current = jsonValue
        return
      }
      
      // Fallback: используем HTML, если JSON недоступен
      if (value && value.trim()) {
        if (import.meta.env.DEV) {
          logger.debug('[RichTextEditor] Initial restore from HTML')
        }
        // Восстанавливаем контент из HTML только при первой инициализации
        editor.commands.setContent(value, { emitUpdate: false })
        contentRestoredRef.current = true
        lastValueRef.current = value
      }
    }
  }, [editor, jsonValue, value])
  
  // Сбрасываем флаг при размонтировании редактора
  useEffect(() => {
    if (!editor) {
      contentRestoredRef.current = false
      lastJsonValueRef.current = null
      lastValueRef.current = ''
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const isEditable = !disabled
    editor.setEditable(isEditable)
    if (import.meta.env.DEV) {
      logger.debug('[RichTextEditor] setEditable called:', { isEditable, disabled })
      // Проверяем, что редактор действительно редактируемый
      const editorElement = editor.view.dom as HTMLElement
      const contentEditable = editorElement.getAttribute('contenteditable')
      logger.debug('[RichTextEditor] Editor element contenteditable:', contentEditable)
    }
  }, [editor, disabled])

  // В редакторе не добавляем постоянные индикаторы, чтобы не конфликтовать с TipTap
  // Индикаторы будут только в опубликованных статьях

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
    editor?.chain().focus().unsetAllMarks().unsetColor().unsetHighlight().clearNodes().run()
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
    editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run()
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
      // @ts-expect-error - Custom command not in TipTap types
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
        hint: 'В разработке',
        disabled: true,
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
          // @ts-expect-error - Custom command not in TipTap types
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
          // @ts-expect-error - Custom command not in TipTap types
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
          // @ts-expect-error - Custom command not in TipTap types
          editor.chain().focus().deleteRange(range).insertColumns('threeEqual').run()
        },
      },
      {
        id: 'anchor',
        title: 'Anchor',
        description: 'Добавить якорь к блоку',
        hint: 'В разработке',
        disabled: true,
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
        hint: 'В разработке',
        disabled: true,
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
      <div
        className={cn(
          'relative flex flex-col overflow-hidden border border-border/50 bg-background transition-all',
          disabled && 'opacity-80',
          className
        )}
        style={{
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Minimal top bar - only essential controls */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              disabled={!editor?.can().chain().focus().undo().run()}
              onClick={() => editor?.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              disabled={!editor?.can().chain().focus().redo().run()}
              onClick={() => editor?.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
            {editor && activeColumnsLayout && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <Columns3 className="h-3.5 w-3.5" />
                    {activeColumnsPreset ? COLUMN_LAYOUTS[activeColumnsPreset].label : 'Columns'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
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
                          // @ts-expect-error - Custom command not in TipTap types
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
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Type "/" for commands
            </span>
          </div>
        </div>

        {/* Main editor area - clean and focused */}
        <div className="relative flex-1">
          {editor && (
            <BubbleMenu
              editor={editor}
              shouldShow={({ state }) => {
                const { selection } = state
                
                if (selection.empty) {
                  return false
                }
                
                const isNodeSelection = selection.constructor.name === 'NodeSelection' || 
                                        ('node' in selection && selection.node !== undefined)
                if (isNodeSelection) {
                  return false
                }
                
                const { from, to } = selection
                if (from === to) {
                  return false
                }
                
                const text = state.doc.textBetween(from, to, ' ')
                return text.trim().length > 0
              }}
              // @ts-expect-error - TipTap BubbleMenu doesn't expose tippyOptions in types, but it works
              tippyOptions={{
                duration: 100,
                placement: 'top',
                appendTo: () => document.body,
              }}
            >
              <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/95 px-1.5 py-1 shadow-lg backdrop-blur-sm ring-1 ring-border/20">
              {[
                {
                  label: 'Bold',
                  icon: Bold,
                  action: () => editor.chain().focus().toggleBold().run(),
                  isActive: editor.isActive('bold'),
                  disabled: !editor.can().chain().focus().toggleBold().run(),
                },
                {
                  label: 'Italic',
                  icon: Italic,
                  action: () => editor.chain().focus().toggleItalic().run(),
                  isActive: editor.isActive('italic'),
                  disabled: !editor.can().chain().focus().toggleItalic().run(),
                },
                {
                  label: 'Strikethrough',
                  icon: Strikethrough,
                  action: () => editor.chain().focus().toggleStrike().run(),
                  isActive: editor.isActive('strike'),
                  disabled: !editor.can().chain().focus().toggleStrike().run(),
                },
                {
                  label: 'Inline code',
                  icon: Code,
                  action: () => editor.chain().focus().toggleCode().run(),
                  isActive: editor.isActive('code'),
                  disabled: !editor.can().chain().focus().toggleCode().run(),
                },
              ].map(({ icon: Icon, label, action, isActive, disabled }) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-primary/10 text-primary'
                  )}
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault()
                    action()
                  }}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              
              {/* Text Color Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      editor.getAttributes('textStyle').color && 'bg-primary/10 text-primary'
                    )}
                    title="Text color"
                  >
                    <Type className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2">
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { name: 'Default', value: null },
                      { name: 'Black', value: '#000000' },
                      { name: 'Dark Gray', value: '#404040' },
                      { name: 'Gray', value: '#808080' },
                      { name: 'Light Gray', value: '#C0C0C0' },
                      { name: 'White', value: '#FFFFFF' },
                      { name: 'Red', value: '#EF4444' },
                      { name: 'Orange', value: '#F97316' },
                      { name: 'Amber', value: '#F59E0B' },
                      { name: 'Yellow', value: '#EAB308' },
                      { name: 'Lime', value: '#84CC16' },
                      { name: 'Green', value: '#22C55E' },
                      { name: 'Emerald', value: '#10B981' },
                      { name: 'Teal', value: '#14B8A6' },
                      { name: 'Cyan', value: '#06B6D4' },
                      { name: 'Sky', value: '#0EA5E9' },
                      { name: 'Blue', value: '#3B82F6' },
                      { name: 'Indigo', value: '#6366F1' },
                      { name: 'Violet', value: '#8B5CF6' },
                      { name: 'Purple', value: '#A855F7' },
                      { name: 'Fuchsia', value: '#D946EF' },
                      { name: 'Pink', value: '#EC4899' },
                      { name: 'Rose', value: '#F43F5E' },
                    ].map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          if (color.value === null) {
                            editor.chain().focus().unsetColor().run()
                          } else {
                            editor.chain().focus().setColor(color.value).run()
                          }
                        }}
                        className={cn(
                          'h-6 w-6 rounded border-2 transition-all hover:scale-110',
                          color.value === null
                            ? 'border-border bg-muted flex items-center justify-center'
                            : 'border-transparent',
                          editor.getAttributes('textStyle').color === color.value && 'ring-2 ring-primary ring-offset-1'
                        )}
                        style={color.value ? { backgroundColor: color.value } : undefined}
                        title={color.name}
                      >
                        {color.value === null && (
                          <span className="text-[10px] text-muted-foreground">A</span>
                        )}
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Highlight Color Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      editor.isActive('highlight') && 'bg-primary/10 text-primary'
                    )}
                    title="Highlight color"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2">
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { name: 'None', value: null },
                      { name: 'Yellow', value: '#FEF08A' },
                      { name: 'Green', value: '#BBF7D0' },
                      { name: 'Blue', value: '#BFDBFE' },
                      { name: 'Pink', value: '#FBCFE8' },
                      { name: 'Purple', value: '#E9D5FF' },
                      { name: 'Orange', value: '#FED7AA' },
                      { name: 'Red', value: '#FECACA' },
                      { name: 'Gray', value: '#E5E7EB' },
                      { name: 'Cyan', value: '#A5F3FC' },
                      { name: 'Lime', value: '#D9F99D' },
                      { name: 'Amber', value: '#FDE68A' },
                    ].map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          if (color.value === null) {
                            editor.chain().focus().unsetHighlight().run()
                          } else {
                            editor.chain().focus().setHighlight({ color: color.value }).run()
                          }
                        }}
                        className={cn(
                          'h-6 w-6 rounded border-2 transition-all hover:scale-110',
                          color.value === null
                            ? 'border-border bg-muted flex items-center justify-center'
                            : 'border-transparent',
                          editor.getAttributes('highlight')?.color === color.value && 'ring-2 ring-primary ring-offset-1'
                        )}
                        style={color.value ? { backgroundColor: color.value } : undefined}
                        title={color.name}
                      >
                        {color.value === null && (
                          <span className="text-[10px] text-muted-foreground">×</span>
                        )}
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {[
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
                    'flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-primary/10 text-primary'
                  )}
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault()
                    action()
                  }}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              </div>
            </BubbleMenu>
          )}

          <div className="flex items-start gap-6 px-6 py-8">
            <div className="group/editor relative flex-1 min-w-0">
              <EditorContent
                editor={editor}
                id={id}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none"
              />
            </div>
            <EditorOutline editor={editor} />
          </div>
        </div>

        {/* Minimal bottom bar - only stats */}
        <div className="flex items-center justify-end gap-4 border-t border-border/40 bg-muted/10 px-4 py-2 text-[11px] text-muted-foreground">
          <span>{wordCount} words</span>
          {characterLimit ? (
            <span className={cn(
              characterCount > characterLimit * 0.9 && 'text-amber-600 dark:text-amber-400',
              characterCount >= characterLimit && 'text-destructive font-medium'
            )}>
              {characterCount}/{characterLimit}
            </span>
          ) : (
            <span>{characterCount} chars</span>
          )}
        </div>
      </div>

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
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
