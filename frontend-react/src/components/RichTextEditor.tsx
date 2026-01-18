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
  Video,
  Music,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
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
import { useTranslation } from '@/hooks/useTranslation'
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

// Для размещения slash-меню сбоку (вместо Tippy)
const _slashPanelRef: { current: HTMLDivElement | null } = { current: null }
let _setSlashActive: (v: boolean) => void = () => {}
let _pendingSlashComponent: ReactRenderer<typeof SlashCommandList> | null = null

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

          return {
            onStart: (props) => {
              // @ts-expect-error - TipTap types incompatibility
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })
              _pendingSlashComponent = component
              _setSlashActive(true)
            },
            onUpdate: (props) => {
              component?.updateProps(props)
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                return true
              }
              const handler = (component?.ref as unknown as { onKeyDown?: (props: SlashCommandProps) => boolean })?.onKeyDown
              if (handler) {
                // @ts-expect-error - TipTap types incompatibility
                return handler(props)
              }
              return false
            },
            onExit: () => {
              _pendingSlashComponent = null
              component?.destroy()
              component = null
              if (_slashPanelRef.current) _slashPanelRef.current.innerHTML = ''
              _setSlashActive(false)
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
  onUploadMedia?: (file: File, type: 'image' | 'video' | 'audio') => Promise<string> // Функция для загрузки медиа в R2
  articleId?: string | number // ID статьи для загрузки медиа
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
  onUploadMedia,
  articleId: _articleId,
}, ref) => {
  const { t } = useTranslation()
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

  // Состояние для контекстного меню
  const [contextMenu, setContextMenu] = useState<{
    open: boolean
    x: number
    y: number
    type: 'empty' | 'text'
  }>({
    open: false,
    x: 0,
    y: 0,
    type: 'empty',
  })
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isFormatPanelOpen, setFormatPanelOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slashActive, setSlashActive] = useState(false)
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    _setSlashActive = setSlashActive
    return () => { _setSlashActive = () => {} }
  }, [])

  useEffect(() => {
    if (slashActive && _pendingSlashComponent && _slashPanelRef.current) {
      _slashPanelRef.current.innerHTML = ''
      _slashPanelRef.current.appendChild(_pendingSlashComponent.element)
      _pendingSlashComponent = null
    }
  }, [slashActive])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === editorWrapperRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!editorWrapperRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      editorWrapperRef.current.requestFullscreen()
    }
  }, [])

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

    // Приоритет: используем JSON, если он доступен (сохраняет атрибуты узлов, например language для code blocks)
    if (jsonValue && jsonValue.type === 'doc') {
      const currentJson = editor.getJSON()
      // Не вызываем setContent, если контент совпадает с текущим документом редактора
      // (обновление пришло от нашего же onChange -> setContentJSON в родителе — setContent сбросит курсор в конец)
      if (JSON.stringify(currentJson) === JSON.stringify(jsonValue)) {
        lastJsonValueRef.current = jsonValue
        return
      }
      const jsonValueChanged = JSON.stringify(lastJsonValueRef.current) !== JSON.stringify(jsonValue)
      if (!contentRestoredRef.current || jsonValueChanged) {
        if (import.meta.env.DEV) {
          logger.debug('[RichTextEditor] Restore/update from JSON:', {
            isInitial: !contentRestoredRef.current,
            isUpdate: jsonValueChanged,
            codeBlocksCount: jsonValue.content?.filter((node: any) => node.type === 'codeBlock').length || 0
          })
        }
        editor.commands.setContent(jsonValue, { emitUpdate: false })
        contentRestoredRef.current = true
        lastJsonValueRef.current = jsonValue
        return
      }
    }

    // Fallback: используем HTML, если JSON недоступен
    if (value && value.trim()) {
      // Не вызываем setContent, если HTML совпадает (обновление от нашего onChange)
      if (editor.getHTML() === value) {
        lastValueRef.current = value
        return
      }
      const valueChanged = lastValueRef.current !== value
      if (!contentRestoredRef.current || valueChanged) {
        if (import.meta.env.DEV) {
          logger.debug('[RichTextEditor] Restore/update from HTML:', {
            isInitial: !contentRestoredRef.current,
            isUpdate: valueChanged
          })
        }
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

  // Обработчик контекстного меню
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (!editor || disabled) return

    event.preventDefault()
    event.stopPropagation()

    const view = editor.view
    
    // Получаем позицию курсора из координат мыши
    const posAtCoords = view.posAtCoords({ 
      left: event.clientX, 
      top: event.clientY 
    })

    if (!posAtCoords) {
      // Если не удалось получить позицию, используем координаты мыши напрямую
      const menuType: 'empty' | 'text' = 'empty'
      const menuWidth = 180
      const menuHeight = 120
      const x = event.clientX + menuWidth > window.innerWidth 
        ? window.innerWidth - menuWidth - 10 
        : event.clientX
      const y = event.clientY + menuHeight > window.innerHeight 
        ? window.innerHeight - menuHeight - 10 
        : event.clientY

      setContextMenu({
        open: true,
        x,
        y,
        type: menuType,
      })
      return
    }

    // Обновляем позицию курсора в редакторе
    const { pos } = posAtCoords
    editor.commands.setTextSelection(pos)

    // Определяем, есть ли выделенный текст
    const { selection } = editor.state
    const hasSelection = !selection.empty && selection.from !== selection.to

    // Определяем, есть ли текст под курсором
    const $from = editor.state.doc.resolve(pos)
    const node = $from.node()
    const hasText = node && node.textContent && node.textContent.trim().length > 0

    // Если есть выделение или текст под курсором - показываем меню форматирования
    // Иначе - меню добавления медиа
    const menuType: 'empty' | 'text' = (hasSelection || hasText) ? 'text' : 'empty'

    // Получаем координаты курсора для позиционирования меню
    const coords = view.coordsAtPos(pos)
    
    // Позиционируем меню с учетом границ экрана
    const menuWidth = 180
    const menuHeight = menuType === 'empty' ? 120 : 200
    const x = coords.left + menuWidth > window.innerWidth 
      ? window.innerWidth - menuWidth - 10 
      : coords.left
    const y = coords.top + menuHeight > window.innerHeight 
      ? window.innerHeight - menuHeight - 10 
      : coords.top

    setContextMenu({
      open: true,
      x,
      y,
      type: menuType,
    })
  }, [editor, disabled])

  // Закрытие контекстного меню при клике вне его или нажатии Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, open: false }))
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, open: false }))
      }
    }

    if (contextMenu.open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [contextMenu.open])

  // Обработка загрузки файлов
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor || !onUploadMedia) return

    // Определяем тип файла
    const fileType = file.type
    let mediaType: 'image' | 'video' | 'audio' = 'image'
    
    if (fileType.startsWith('video/')) {
      mediaType = 'video'
    } else if (fileType.startsWith('audio/')) {
      mediaType = 'audio'
    } else if (fileType.startsWith('image/')) {
      mediaType = 'image'
    } else {
      logger.warn('[RichTextEditor] Unsupported file type:', fileType)
      return
    }

    try {
      // Загружаем файл через onUploadMedia
      const url = await onUploadMedia(file, mediaType)
      
      // Вставляем медиа в редактор
      if (mediaType === 'image') {
        editor.chain().focus().setImage({ src: url }).run()
        
        // Проверяем, что изображение добавлено в JSON
        if (import.meta.env.DEV) {
          setTimeout(() => {
            const json = editor.getJSON()
            const hasImage = JSON.stringify(json).includes(url)
            if (hasImage) {
              logger.debug('[RichTextEditor] Image added to editor JSON:', { url: url.substring(0, 100) })
            } else {
              logger.warn('[RichTextEditor] Image URL not found in editor JSON after insertion!', { url: url.substring(0, 100) })
            }
          }, 100)
        }
      } else if (mediaType === 'video') {
        // Для видео вставляем через HTML
        const videoHTML = `<div class="editor-video-wrapper"><video controls src="${url}" class="max-w-full h-auto rounded-lg"></video></div>`
        editor.chain().focus().insertContent(videoHTML).run()
      } else if (mediaType === 'audio') {
        // Для аудио вставляем через HTML
        const audioHTML = `<div class="editor-audio-wrapper"><audio controls src="${url}" class="w-full"></audio></div>`
        editor.chain().focus().insertContent(audioHTML).run()
      }
      
      setContextMenu(prev => ({ ...prev, open: false }))
    } catch (error) {
      logger.error('[RichTextEditor] Failed to upload media:', error)
    } finally {
      // Сбрасываем input для возможности загрузки того же файла снова
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [editor, onUploadMedia])

  // Функция для открытия диалога выбора файла
  const handleInsertMedia = useCallback((type: 'image' | 'video' | 'audio') => {
    if (!fileInputRef.current) return
    
    // Устанавливаем accept атрибут в зависимости от типа
    const acceptMap = {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*',
    }
    
    fileInputRef.current.accept = acceptMap[type]
    fileInputRef.current.click()
  }, [])

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

  const formatButtons = editor ? [
    { label: 'Bold', aria: 'Bold', icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), disabled: !editor.can().chain().focus().toggleBold().run() },
    { label: 'Italic', aria: 'Italic', icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), disabled: !editor.can().chain().focus().toggleItalic().run() },
    { label: 'Strikethrough', aria: 'Strikethrough', icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), disabled: !editor.can().chain().focus().toggleStrike().run() },
    { label: 'Inline code', aria: 'Code', icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), disabled: !editor.can().chain().focus().toggleCode().run() },
  ] : []

  return (
    <>
      <div className={cn('flex flex-row items-stretch gap-0', className)}>
        {/* Панель форматирования — СЛЕВА от редактора, только desktop, скрыта в fullscreen */}
        {!isFullscreen && editor && (
          <div
            className={cn(
              'hidden md:flex shrink-0 flex-col items-center overflow-hidden border-r border-border/40 bg-muted/10 transition-all duration-200',
              isFormatPanelOpen ? 'w-14' : 'w-10'
            )}
          >
            {isFormatPanelOpen ? (
              <>
                <div className="flex flex-col gap-0.5 p-2">
                  {formatButtons.map(({ icon: Icon, label, aria, action, isActive, disabled }) => (
                    <button key={label} type="button" aria-label={aria} className={cn('flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', isActive && 'bg-primary/10 text-primary')} disabled={disabled} onClick={(e) => { e.preventDefault(); action() }} title={label}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label="Text color" className={cn('flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').color && 'bg-primary/10 text-primary')} title="Text color">
                        <Type className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48 p-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {[{ name: 'Default', value: null }, { name: 'Black', value: '#000000' }, { name: 'Dark Gray', value: '#404040' }, { name: 'Gray', value: '#808080' }, { name: 'Light Gray', value: '#C0C0C0' }, { name: 'White', value: '#FFFFFF' }, { name: 'Red', value: '#EF4444' }, { name: 'Orange', value: '#F97316' }, { name: 'Amber', value: '#F59E0B' }, { name: 'Yellow', value: '#EAB308' }, { name: 'Lime', value: '#84CC16' }, { name: 'Green', value: '#22C55E' }, { name: 'Emerald', value: '#10B981' }, { name: 'Teal', value: '#14B8A6' }, { name: 'Cyan', value: '#06B6D4' }, { name: 'Sky', value: '#0EA5E9' }, { name: 'Blue', value: '#3B82F6' }, { name: 'Indigo', value: '#6366F1' }, { name: 'Violet', value: '#8B5CF6' }, { name: 'Purple', value: '#A855F7' }, { name: 'Fuchsia', value: '#D946EF' }, { name: 'Pink', value: '#EC4899' }, { name: 'Rose', value: '#F43F5E' }].map((c) => (
                          <button key={c.name} type="button" onClick={() => (c.value === null ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(c.value).run())} className={cn('h-6 w-6 rounded border-2 transition-all hover:scale-110', c.value === null ? 'border-border bg-muted flex items-center justify-center' : 'border-transparent', editor.getAttributes('textStyle').color === c.value && 'ring-2 ring-primary ring-offset-1')} style={c.value ? { backgroundColor: c.value } : undefined} title={c.name}>
                            {c.value === null && <span className="text-[10px] text-muted-foreground">A</span>}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label="Highlight" className={cn('flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('highlight') && 'bg-primary/10 text-primary')} title="Highlight color">
                        <Highlighter className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48 p-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {[{ name: 'None', value: null }, { name: 'Yellow', value: '#FEF08A' }, { name: 'Green', value: '#BBF7D0' }, { name: 'Blue', value: '#BFDBFE' }, { name: 'Pink', value: '#FBCFE8' }, { name: 'Purple', value: '#E9D5FF' }, { name: 'Orange', value: '#FED7AA' }, { name: 'Red', value: '#FECACA' }, { name: 'Gray', value: '#E5E7EB' }, { name: 'Cyan', value: '#A5F3FC' }, { name: 'Lime', value: '#D9F99D' }, { name: 'Amber', value: '#FDE68A' }].map((c) => (
                          <button key={c.name} type="button" onClick={() => (c.value === null ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c.value }).run())} className={cn('h-6 w-6 rounded border-2 transition-all hover:scale-110', c.value === null ? 'border-border bg-muted flex items-center justify-center' : 'border-transparent', editor.getAttributes('highlight')?.color === c.value && 'ring-2 ring-primary ring-offset-1')} style={c.value ? { backgroundColor: c.value } : undefined} title={c.name}>
                            {c.value === null && <span className="text-[10px] text-muted-foreground">×</span>}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button type="button" aria-label={editor.isActive('link') ? 'Edit link' : 'Add link'} className={cn('flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('link') && 'bg-primary/10 text-primary')} title={editor.isActive('link') ? 'Edit link' : 'Add link'} onClick={(e) => { e.preventDefault(); handleOpenLinkDialog() }}>
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Clear formatting" className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Clear formatting" onClick={(e) => { e.preventDefault(); handleRemoveFormatting() }}>
                    <RemoveFormatting className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" aria-label="Collapse" className="mt-auto mb-2 flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Collapse" onClick={() => setFormatPanelOpen(false)}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button type="button" aria-label="Expand" className="mt-4 flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Expand" onClick={() => setFormatPanelOpen(true)}>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Мобильная панель форматирования — внизу экрана, скрывается вниз */}
        {!isFullscreen && editor && (
          <div className={cn('fixed bottom-0 left-0 right-0 z-40 flex flex-col border-t border-border/40 bg-muted/20 shadow-lg transition-all duration-200 md:hidden', isFormatPanelOpen ? 'max-h-[200px]' : 'max-h-14')}>
            {isFormatPanelOpen ? (
              <>
                <div className="flex flex-row gap-1 overflow-x-auto p-2">
                  {formatButtons.map(({ icon: Icon, label, aria, action, isActive, disabled }) => (
                    <button key={label} type="button" aria-label={aria} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', isActive && 'bg-primary/10 text-primary')} disabled={disabled} onClick={(e) => { e.preventDefault(); action() }} title={label}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label="Text color" className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').color && 'bg-primary/10 text-primary')} title="Text color">
                        <Type className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="center" className="w-48 p-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {[{ name: 'Default', value: null }, { name: 'Black', value: '#000000' }, { name: 'Red', value: '#EF4444' }, { name: 'Green', value: '#22C55E' }, { name: 'Blue', value: '#3B82F6' }, { name: 'Yellow', value: '#EAB308' }, { name: 'Orange', value: '#F97316' }, { name: 'Purple', value: '#A855F7' }, { name: 'Pink', value: '#EC4899' }, { name: 'Gray', value: '#808080' }].map((c) => (
                          <button key={c.name} type="button" onClick={() => (c.value === null ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(c.value).run())} className={cn('h-6 w-6 rounded border-2 transition-all', c.value === null ? 'border-border bg-muted flex items-center justify-center' : 'border-transparent', editor.getAttributes('textStyle').color === c.value && 'ring-2 ring-primary ring-offset-1')} style={c.value ? { backgroundColor: c.value } : undefined} title={c.name}>
                            {c.value === null && <span className="text-[10px] text-muted-foreground">A</span>}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label="Highlight" className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('highlight') && 'bg-primary/10 text-primary')} title="Highlight">
                        <Highlighter className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="center" className="w-48 p-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {[{ name: 'None', value: null }, { name: 'Yellow', value: '#FEF08A' }, { name: 'Green', value: '#BBF7D0' }, { name: 'Blue', value: '#BFDBFE' }, { name: 'Pink', value: '#FBCFE8' }, { name: 'Orange', value: '#FED7AA' }].map((c) => (
                          <button key={c.name} type="button" onClick={() => (c.value === null ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c.value }).run())} className={cn('h-6 w-6 rounded border-2 transition-all', c.value === null ? 'border-border bg-muted flex items-center justify-center' : 'border-transparent', editor.getAttributes('highlight')?.color === c.value && 'ring-2 ring-primary ring-offset-1')} style={c.value ? { backgroundColor: c.value } : undefined} title={c.name}>
                            {c.value === null && <span className="text-[10px] text-muted-foreground">×</span>}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button type="button" aria-label={editor.isActive('link') ? 'Edit link' : 'Add link'} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('link') && 'bg-primary/10 text-primary')} onClick={(e) => { e.preventDefault(); handleOpenLinkDialog() }}>
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Clear formatting" className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={(e) => { e.preventDefault(); handleRemoveFormatting() }}>
                    <RemoveFormatting className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" aria-label="Collapse" className="flex h-9 items-center justify-center border-t border-border/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setFormatPanelOpen(false)}>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button type="button" aria-label="Expand" className="flex h-14 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setFormatPanelOpen(true)}>
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Карточка редактора */}
        <div
          ref={editorWrapperRef}
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-hidden border border-border/50 bg-background transition-all',
            disabled && 'opacity-80'
          )}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          {/* Верхняя панель: Undo Redo Columns | Полноэкранный режим */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" aria-label="Undo" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!editor?.can().chain().focus().undo().run()} onClick={() => editor?.chain().focus().undo().run()} title="Undo">
                <Undo className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Redo" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!editor?.can().chain().focus().redo().run()} onClick={() => editor?.chain().focus().redo().run()} title="Redo">
                <Redo className="h-3.5 w-3.5" />
              </Button>
              {editor && activeColumnsLayout && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Column layout" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                      <Columns3 className="h-3.5 w-3.5" />
                      {activeColumnsPreset ? COLUMN_LAYOUTS[activeColumnsPreset].label : 'Columns'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {(Object.entries(COLUMN_LAYOUTS) as [ColumnPresetKey, typeof COLUMN_LAYOUTS[keyof typeof COLUMN_LAYOUTS]][]).map(([key, config]) => (
                      <DropdownMenuItem key={key} className={cn('flex flex-col items-start gap-1', activeColumnsPreset === key && 'bg-muted text-foreground')} onSelect={(e) => {
                      e.preventDefault()
                      // @ts-expect-error - Custom command not in TipTap types
                      editor.chain().focus().setColumnsLayout(key).run()
                    }}>
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="h-7 w-7 text-muted-foreground hover:text-foreground" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Область контента: редактор + панель slash или outline справа */}
          <div className="relative flex flex-1">
            <div className="flex min-w-0 flex-1 items-start gap-4 px-4 pt-6 pb-24 md:px-6 md:py-8">
              <div className="group/editor relative min-w-0 flex-1">
                <EditorContent editor={editor} id={id} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none" onContextMenu={handleContextMenu} />
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              </div>
              {/* Справа: slash-меню при / или Outline */}
              {slashActive ? (
                <div ref={(el) => { _slashPanelRef.current = el }} className="w-80 shrink-0 overflow-y-auto overflow-x-hidden" />
              ) : (
                <EditorOutline editor={editor} />
              )}
            </div>
          </div>

          {/* Нижняя панель — счётчики */}
          <div className="flex items-center justify-end gap-4 border-t border-border/40 bg-muted/10 px-4 py-2 text-[11px] text-muted-foreground">
            <span>{wordCount} words</span>
            {characterLimit ? (
              <span className={cn(characterCount > characterLimit * 0.9 && 'text-amber-600 dark:text-amber-400', characterCount >= characterLimit && 'text-destructive font-medium')}>
                {characterCount}/{characterLimit}
              </span>
            ) : (
              <span>{characterCount} chars</span>
            )}
          </div>
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
                placeholder={t('editor.imageDescription')}
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
                    placeholder={t('editor.tocPlaceholder')}
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

      {/* Контекстное меню */}
      {contextMenu.open && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[180px] rounded-lg border border-border/60 bg-popover p-1 shadow-lg"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'empty' ? (
            // Меню для пустого поля - добавление медиа
            <>
              <button
                type="button"
                onClick={() => {
                  handleInsertMedia('image')
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Add image</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInsertMedia('video')
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Add video</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInsertMedia('audio')
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Music className="h-4 w-4" />
                <span>Add audio</span>
              </button>
            </>
          ) : (
            // Меню для текста - форматирование
            <>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleBold().run()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Bold className="h-4 w-4" />
                <span>Bold</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleItalic().run()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Italic className="h-4 w-4" />
                <span>Italic</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleStrike().run()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Strikethrough className="h-4 w-4" />
                <span>Strikethrough</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().toggleCode().run()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </button>
              <div className="my-1 h-px bg-muted" />
              <button
                type="button"
                onClick={() => {
                  handleOpenLinkDialog()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Insert link</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveFormatting()
                  setContextMenu(prev => ({ ...prev, open: false }))
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <RemoveFormatting className="h-4 w-4" />
                <span>Clear formatting</span>
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
