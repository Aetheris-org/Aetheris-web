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
import { createPortal } from 'react-dom'
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
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '@tiptap/extension-text-style'
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  CaseSensitive,
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
  const { t } = useTranslation()
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
          {t('editor.noMatchesFor', { query: props.query })}
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
                      ({t('editor.inDevelopment')})
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
          <span>{t('editor.slashHintKeys')}</span>
          <span>{t('editor.slashHintLabel')}</span>
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
  const { t } = useTranslation()
  const [items, setItems] = useState<OutlineItem[]>([])
  const [activePos, setActivePos] = useState<number | null>(null)

  useEffect(() => {
    if (!editor) return

    const collectHeadings = () => {
      const headings: OutlineItem[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level ?? 1
          const text = node.textContent.trim() || t('editor.outlineHeadingDefault', { n: headings.length + 1 })
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
  }, [editor, t])

  if (!editor || items.length === 0) {
    return null
  }

  return (
    <aside className="sticky top-[5.5rem] hidden max-h-[420px] w-56 shrink-0 overflow-y-auto text-sm lg:block">
      <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {t('editor.outline')}
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
  const [isDraggingOver, setIsDraggingOver] = useState(false)
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
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
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
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) {
      const { $from } = editor.state.selection
      const fromPos = $from.before($from.depth) + 1
      const toPos = $from.after($from.depth) - 1
      if (fromPos < toPos) {
        editor.chain().focus().setTextSelection({ from: fromPos, to: toPos }).unsetAllMarks().unsetColor().unsetHighlight().run()
        return
      }
    }
    editor.chain().focus().unsetAllMarks().unsetColor().unsetHighlight().run()
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
      const menuType: 'empty' | 'text' = 'empty'
      const menuWidth = 180
      const menuHeight = 120
      let x = event.clientX
      let y = event.clientY
      if (x + menuWidth > window.innerWidth - 10) x = window.innerWidth - menuWidth - 10
      if (y + menuHeight > window.innerHeight - 10) y = window.innerHeight - menuHeight - 10
      if (x < 10) x = 10
      if (y < 10) y = 10
      setContextMenu({ open: true, x, y, type: menuType })
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

    // Позиция у курсора (место клика правой кнопкой)
    const menuWidth = 180
    const menuHeight = menuType === 'empty' ? 120 : 200
    let x = event.clientX
    let y = event.clientY
    if (x + menuWidth > window.innerWidth - 10) x = window.innerWidth - menuWidth - 10
    if (y + menuHeight > window.innerHeight - 10) y = window.innerHeight - menuHeight - 10
    if (x < 10) x = 10
    if (y < 10) y = 10

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

  // Вставка медиа из файла (общая логика для input и drag-and-drop)
  const insertMediaFromFile = useCallback(
    async (file: File, atPosition?: number) => {
      if (!editor || !onUploadMedia) return

      const fileType = file.type
      let mediaType: 'image' | 'video' | 'audio' = 'image'
      if (fileType.startsWith('video/')) mediaType = 'video'
      else if (fileType.startsWith('audio/')) mediaType = 'audio'
      else if (fileType.startsWith('image/')) mediaType = 'image'
      else {
        logger.warn('[RichTextEditor] Unsupported file type:', fileType)
        return
      }

      const url = await onUploadMedia(file, mediaType)
      const chain = editor.chain().focus()

      if (mediaType === 'image') {
        if (atPosition != null) {
          chain.insertContentAt(atPosition, { type: 'image', attrs: { src: url } }).run()
        } else {
          chain.setImage({ src: url }).run()
        }
        if (import.meta.env.DEV) {
          setTimeout(() => {
            const json = editor.getJSON()
            const hasImage = JSON.stringify(json).includes(url)
            if (hasImage) logger.debug('[RichTextEditor] Image added to editor JSON:', { url: url.substring(0, 100) })
            else logger.warn('[RichTextEditor] Image URL not found in editor JSON after insertion!', { url: url.substring(0, 100) })
          }, 100)
        }
      } else if (mediaType === 'video') {
        const html = `<div class="editor-video-wrapper"><video controls src="${url}" class="max-w-full h-auto rounded-lg"></video></div>`
        if (atPosition != null) chain.insertContentAt(atPosition, html).run()
        else chain.insertContent(html).run()
      } else {
        const html = `<div class="editor-audio-wrapper"><audio controls src="${url}" class="w-full"></audio></div>`
        if (atPosition != null) chain.insertContentAt(atPosition, html).run()
        else chain.insertContent(html).run()
      }
      setContextMenu((prev) => (prev.open ? { ...prev, open: false } : prev))
    },
    [editor, onUploadMedia]
  )

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        await insertMediaFromFile(file)
      } catch (error) {
        logger.error('[RichTextEditor] Failed to upload media:', error)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [insertMediaFromFile]
  )

  // Drag-and-drop: вставка фото, видео, аудио из проводника
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (e.dataTransfer?.types.includes('Files') && onUploadMedia && !disabled) setIsDraggingOver(true)
    },
    [onUploadMedia, disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDraggingOver(false)
      if (disabled || !editor || !onUploadMedia) return
      const files = e.dataTransfer?.files
      if (!files?.length) return

      const file = files[0]
      const t = file.type
      if (!t.startsWith('image/') && !t.startsWith('video/') && !t.startsWith('audio/')) return

      try {
        const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY })?.pos
        await insertMediaFromFile(file, pos)
      } catch (err) {
        logger.error('[RichTextEditor] Failed to insert media from drop:', err)
      }
    },
    [disabled, editor, onUploadMedia, insertMediaFromFile]
  )

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
      { id: 'text', title: t('editor.slashParagraph'), description: t('editor.slashParagraphDesc'), icon: <Text className="h-4 w-4" />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setParagraph().run() } },
      { id: 'heading-1', title: t('editor.slashH1'), description: t('editor.slashH1Desc'), icon: <Heading1 className="h-4 w-4" />, keywords: ['title', 'h1'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run() } },
      { id: 'heading-2', title: t('editor.slashH2'), description: t('editor.slashH2Desc'), icon: <Heading2 className="h-4 w-4" />, keywords: ['h2'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run() } },
      { id: 'heading-3', title: t('editor.slashH3'), description: t('editor.slashH3Desc'), icon: <Heading3 className="h-4 w-4" />, keywords: ['h3'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run() } },
      { id: 'bullet-list', title: t('editor.slashBulletList'), description: t('editor.slashBulletListDesc'), icon: <List className="h-4 w-4" />, keywords: ['list'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleBulletList().run() } },
      { id: 'ordered-list', title: t('editor.slashOrderedList'), description: t('editor.slashOrderedListDesc'), icon: <ListOrdered className="h-4 w-4" />, keywords: ['list', 'numbers'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleOrderedList().run() } },
      { id: 'quote', title: t('editor.slashQuote'), description: t('editor.slashQuoteDesc'), icon: <Quote className="h-4 w-4" />, keywords: ['blockquote'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleBlockquote().run() } },
      { id: 'code-block', title: t('editor.slashCodeBlock'), description: t('editor.slashCodeBlockDesc'), hint: t('editor.inDevelopment'), disabled: true, icon: <Braces className="h-4 w-4" />, keywords: ['code', 'snippet'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleCodeBlock().run() } },
      { id: 'divider', title: t('editor.slashDivider'), description: t('editor.slashDividerDesc'), icon: <Minus className="h-4 w-4" />, keywords: ['line', 'hr'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setHorizontalRule().run() } },
      { id: 'callout', title: t('editor.slashCallout'), description: t('editor.slashCalloutDesc'), icon: <StickyNote className="h-4 w-4" />, keywords: ['note', 'info'], command: ({ editor, range }) => {
        // @ts-expect-error — insertCallout from Callout extension, не в типах ChainedCommands
        editor.chain().focus().deleteRange(range).insertCallout('info').run()
      } },
      { id: 'columns-two', title: t('editor.slashColumns2'), description: t('editor.slashColumns2Desc'), icon: <Columns3 className="h-4 w-4" />, keywords: ['layout', 'grid'], command: ({ editor, range }) => {
        // @ts-expect-error — insertColumns из расширения Columns, не в типах ChainedCommands
        editor.chain().focus().deleteRange(range).insertColumns('twoEqual').run()
      } },
      { id: 'columns-three', title: t('editor.slashColumns3'), description: t('editor.slashColumns3Desc'), icon: <Columns3 className="h-4 w-4" />, keywords: ['layout', 'grid', 'three'], command: ({ editor, range }) => {
        // @ts-expect-error — insertColumns из расширения Columns, не в типах ChainedCommands
        editor.chain().focus().deleteRange(range).insertColumns('threeEqual').run()
      } },
      { id: 'anchor', title: t('editor.slashAnchor'), description: t('editor.slashAnchorDesc'), hint: t('editor.inDevelopment'), disabled: true, icon: <Hash className="h-4 w-4" />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); openAnchorDialog('create') } },
      { id: 'anchor-link', title: t('editor.slashAnchorLink'), description: t('editor.slashAnchorLinkDesc'), hint: t('editor.inDevelopment'), disabled: true, icon: <Link2 className="h-4 w-4" />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); openAnchorDialog('link') } },
      { id: 'image', title: t('editor.slashImage'), description: t('editor.slashImageDesc'), icon: <ImageIcon className="h-4 w-4" />, keywords: ['picture', 'media'], command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); openImageDialog() } },
    ])
  }, [editor, openAnchorDialog, openImageDialog, t])

  const activeColumnsLayout = editor ? getActiveColumnsLayout(editor) : null
  const activeColumnsPreset = findPresetByLayout(activeColumnsLayout)

  const formatButtons = editor ? [
    { label: t('editor.ctxBold'), aria: t('editor.ctxBold'), icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), disabled: !editor.can().chain().focus().toggleBold().run() },
    { label: t('editor.ctxItalic'), aria: t('editor.ctxItalic'), icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), disabled: !editor.can().chain().focus().toggleItalic().run() },
    { label: t('editor.ctxStrikethrough'), aria: t('editor.ctxStrikethrough'), icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), disabled: !editor.can().chain().focus().toggleStrike().run() },
    { label: t('editor.underline'), aria: t('editor.underline'), icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), disabled: !editor.can().chain().focus().toggleUnderline().run() },
    { label: t('editor.ctxCode'), aria: t('editor.ctxCode'), icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), disabled: !editor.can().chain().focus().toggleCode().run() },
  ] : []

  const fontSizeOptions = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'] as const
  const alignOptions = [
    { id: 'left', icon: AlignLeft, cmd: 'left' as const },
    { id: 'center', icon: AlignCenter, cmd: 'center' as const },
    { id: 'right', icon: AlignRight, cmd: 'right' as const },
    { id: 'justify', icon: AlignJustify, cmd: 'justify' as const },
  ]

  // Панель и кнопка возврата — через портал в body, чтобы fixed работал относительно viewport
  // (родитель с transform ломает fixed, панель не уезжала за экран)
  const formatPanelPortal =
    typeof document !== 'undefined' &&
    createPortal(
      !isFullscreen && editor ? (
        <>
          {/* Кнопка-блочек у самого края экрана — только когда панель скрыта */}
          {!isFormatPanelOpen && (
            <button
              type="button"
              aria-label={t('editor.showFormatPanel')}
              className="fixed left-0 top-1/2 z-[100] hidden h-12 w-10 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-border/50 bg-muted/90 shadow-md backdrop-blur-sm transition-opacity duration-200 hover:bg-muted md:flex"
              title={t('editor.showFormatPanel')}
              onClick={() => setFormatPanelOpen(true)}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          {/* Панель: при закрытии уезжает полностью за левый край (calc(100%+1rem)) */}
          <div
            className={cn(
              'fixed left-0 top-1/2 z-[99] hidden w-14 flex-col items-center rounded-2xl border border-border/50 bg-card/95 py-2 shadow-md md:flex transition-transform duration-200 ease-out',
              isFormatPanelOpen ? 'translate-x-0 -translate-y-1/2' : '-translate-x-[calc(100%+1rem)] -translate-y-1/2'
            )}
          >
            <div className="flex max-h-[min(70vh,520px)] flex-col gap-0.5 overflow-y-auto px-2">
              {formatButtons.map(({ icon: Icon, label, aria, action, isActive, disabled }) => (
                <button key={label} type="button" aria-label={aria} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', isActive && 'bg-primary/10 text-primary')} disabled={disabled} onClick={(e) => { e.preventDefault(); action() }} title={label}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={t('editor.textColor')} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').color && 'bg-primary/10 text-primary')} title={t('editor.textColor')}>
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
                  <button type="button" aria-label={t('editor.highlight')} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('highlight') && 'bg-primary/10 text-primary')} title={t('editor.highlight')}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={t('editor.fontSize')} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').fontSize && 'bg-primary/10 text-primary')} title={t('editor.fontSize')}>
                    <CaseSensitive className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-36 p-2">
                  <div className="grid grid-cols-2 gap-1">
                    <button type="button" onClick={() => editor.chain().focus().unsetFontSize().run()} className={cn('rounded px-2 py-1.5 text-left text-sm hover:bg-muted', !editor.getAttributes('textStyle').fontSize && 'bg-primary/10 text-primary')}>{t('editor.fontSizeDefault')}</button>
                    {fontSizeOptions.map((sz) => (
                      <button key={sz} type="button" onClick={() => editor.chain().focus().setFontSize(sz).run()} className={cn('rounded px-2 py-1.5 text-left text-sm hover:bg-muted', editor.getAttributes('textStyle').fontSize === sz && 'bg-primary/10 text-primary')} style={{ fontSize: sz }}>{sz}</button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={t('editor.textAlignment')} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground')} title={t('editor.textAlignment')}>
                    <AlignLeft className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-36 p-2">
                  {alignOptions.map((a) => {
                    const Icon = a.icon
                    const alignLabel = a.id === 'left' ? t('editor.alignLeft') : a.id === 'center' ? t('editor.alignCenter') : a.id === 'right' ? t('editor.alignRight') : t('editor.alignJustify')
                    return (
                      <button key={a.id} type="button" onClick={() => editor.chain().focus().setTextAlign(a.cmd).run()} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted', editor.isActive({ textAlign: a.cmd }) && 'bg-primary/10 text-primary')}>
                        <Icon className="h-4 w-4" />
                        {alignLabel}
                      </button>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" aria-label={editor.isActive('link') ? t('editor.editLink') : t('editor.addLink')} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('link') && 'bg-primary/10 text-primary')} title={editor.isActive('link') ? t('editor.editLink') : t('editor.addLink')} onClick={(e) => { e.preventDefault(); handleOpenLinkDialog() }}>
                <LinkIcon className="h-4 w-4" />
              </button>
              <button type="button" aria-label={t('editor.insertImage')} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertImage')} onClick={(e) => { e.preventDefault(); openImageDialog() }}>
                <ImageIcon className="h-4 w-4" />
              </button>
              <button type="button" aria-label={t('editor.insertVideo')} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertVideo')} onClick={(e) => { e.preventDefault(); handleInsertMedia('video') }}>
                <Video className="h-4 w-4" />
              </button>
              <button type="button" aria-label={t('editor.insertAudio')} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertAudio')} onClick={(e) => { e.preventDefault(); handleInsertMedia('audio') }}>
                <Music className="h-4 w-4" />
              </button>
              <button type="button" aria-label={t('editor.clearFormat')} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.clearFormat')} onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); handleRemoveFormatting() }}>
                <RemoveFormatting className="h-4 w-4" />
              </button>
            </div>
            <button type="button" aria-label={t('editor.collapse')} className="mt-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.collapse')} onClick={() => setFormatPanelOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : null,
      document.body
    )

  return (
    <>
      {formatPanelPortal}

      <div
        className={cn(
          'relative flex flex-row items-stretch transition-[margin-left] duration-200 ease-out',
          !isFullscreen && editor && isFormatPanelOpen && 'md:ml-[4.5rem]',
          className
        )}
      >
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
                      <button type="button" aria-label={t('editor.textColor')} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').color && 'bg-primary/10 text-primary')} title={t('editor.textColor')}>
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
                      <button type="button" aria-label={t('editor.highlight')} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('highlight') && 'bg-primary/10 text-primary')} title={t('editor.highlight')}>
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
                  <button type="button" aria-label={editor.isActive('link') ? t('editor.editLink') : t('editor.addLink')} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.isActive('link') && 'bg-primary/10 text-primary')} onClick={(e) => { e.preventDefault(); handleOpenLinkDialog() }}>
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label={t('editor.fontSize')} className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', editor.getAttributes('textStyle').fontSize && 'bg-primary/10 text-primary')} title={t('editor.fontSize')}>
                        <CaseSensitive className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="center" className="w-36 p-2">
                      <button type="button" onClick={() => editor.chain().focus().unsetFontSize().run()} className={cn('rounded px-2 py-1.5 text-left text-sm hover:bg-muted', !editor.getAttributes('textStyle').fontSize && 'bg-primary/10 text-primary')}>{t('editor.fontSizeDefault')}</button>
                      {fontSizeOptions.map((sz) => (
                        <button key={sz} type="button" onClick={() => editor.chain().focus().setFontSize(sz).run()} className={cn('rounded px-2 py-1.5 text-left text-sm hover:bg-muted', editor.getAttributes('textStyle').fontSize === sz && 'bg-primary/10 text-primary')} style={{ fontSize: sz }}>{sz}</button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label={t('editor.textAlignment')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.textAlignment')}>
                        <AlignLeft className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="center" className="w-36 p-2">
                      {alignOptions.map((a) => {
                        const Icon = a.icon
                        const alignLabel = a.id === 'left' ? t('editor.alignLeft') : a.id === 'center' ? t('editor.alignCenter') : a.id === 'right' ? t('editor.alignRight') : t('editor.alignJustify')
                        return (
                          <button key={a.id} type="button" onClick={() => editor.chain().focus().setTextAlign(a.cmd).run()} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted', editor.isActive({ textAlign: a.cmd }) && 'bg-primary/10 text-primary')}>
                            <Icon className="h-4 w-4" />
                            {alignLabel}
                          </button>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button type="button" aria-label={t('editor.insertImage')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertImage')} onClick={(e) => { e.preventDefault(); openImageDialog() }}>
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={t('editor.insertVideo')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertVideo')} onClick={(e) => { e.preventDefault(); handleInsertMedia('video') }}>
                    <Video className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={t('editor.insertAudio')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title={t('editor.insertAudio')} onClick={(e) => { e.preventDefault(); handleInsertMedia('audio') }}>
                    <Music className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={t('editor.clearFormat')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); handleRemoveFormatting() }}>
                    <RemoveFormatting className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" aria-label={t('editor.collapse')} className="flex h-9 items-center justify-center border-t border-border/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setFormatPanelOpen(false)}>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button type="button" aria-label={t('editor.expand')} className="flex h-14 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setFormatPanelOpen(true)}>
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Карточка редактора — отступ создаётся margin у корня, тулбар не привязан к ней */}
        <div
          ref={editorWrapperRef}
          className={cn('flex min-w-0 flex-1 flex-col overflow-hidden border border-border/50 bg-background transition-all', disabled && 'opacity-80')}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          {/* Верхняя панель: Undo Redo Columns | Полноэкранный режим */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" aria-label={t('editor.undo')} className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!editor?.can().chain().focus().undo().run()} onClick={() => editor?.chain().focus().undo().run()} title={t('editor.undo')}>
                <Undo className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={t('editor.redo')} className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!editor?.can().chain().focus().redo().run()} onClick={() => editor?.chain().focus().redo().run()} title={t('editor.redo')}>
                <Redo className="h-3.5 w-3.5" />
              </Button>
              {editor && activeColumnsLayout && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label={t('editor.columnLayout')} className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                      <Columns3 className="h-3.5 w-3.5" />
                      {activeColumnsPreset ? COLUMN_LAYOUTS[activeColumnsPreset].label : t('editor.columnLayout')}
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
            <Button type="button" variant="ghost" size="icon" aria-label={isFullscreen ? t('editor.exitFullscreen') : t('editor.fullscreen')} className="h-7 w-7 text-muted-foreground hover:text-foreground" title={isFullscreen ? t('editor.exitFullscreen') : t('editor.fullscreen')} onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Область контента: редактор + панель slash или outline справа */}
          <div className="relative flex flex-1">
            <div className="flex min-w-0 flex-1 items-start gap-4 px-4 pt-6 pb-24 md:px-6 md:py-8">
              <div
                className={cn('group/editor relative min-w-0 flex-1 rounded-lg transition-[box-shadow]', isDraggingOver && 'ring-2 ring-primary/60 ring-dashed')}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
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
            <span>{wordCount} {t('editor.words')}</span>
            {characterLimit ? (
              <span className={cn(characterCount > characterLimit * 0.9 && 'text-amber-600 dark:text-amber-400', characterCount >= characterLimit && 'text-destructive font-medium')}>
                {characterCount}/{characterLimit}
              </span>
            ) : (
              <span>{characterCount} {t('editor.chars')}</span>
            )}
          </div>
        </div>
      </div>

    <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editor?.isActive('link') ? t('editor.linkEdit') : t('editor.linkAdd')}</DialogTitle>
          <DialogDescription>{t('editor.linkDescription')}</DialogDescription>
        </DialogHeader>
        <Input
          value={linkValue}
          onChange={(event) => setLinkValue(event.target.value)}
          placeholder={t('editor.linkPlaceholder')}
          autoFocus
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleApplyLink} disabled={!editor}>
            {t('common.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.imageInsertTitle')}</DialogTitle>
            <DialogDescription>{t('editor.imageDescriptionDialog')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="image-url">{t('editor.imageUrl')}</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder={t('editor.imageUrlPlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">{t('editor.imageAlt')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleInsertImage} disabled={!editor}>
              {t('editor.imageInsertBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnchorDialogOpen} onOpenChange={setIsAnchorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{anchorMode === 'create' ? t('editor.anchorAdd') : t('editor.anchorLink')}</DialogTitle>
            <DialogDescription>
              {anchorMode === 'create' ? t('editor.anchorAddDescription') : t('editor.anchorLinkDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {anchorMode === 'create' ? (
              <div className="space-y-2">
                <Label htmlFor="anchor-id">{t('editor.anchorIdLabel')}</Label>
                <Input
                  id="anchor-id"
                  value={anchorId}
                  onChange={(event) => setAnchorId(event.target.value)}
                  placeholder={t('editor.anchorIdPlaceholder')}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t('editor.anchorChoose')}</Label>
                  <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border/60 p-2">
                    {anchorOptions.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        {t('editor.anchorNoAnchors')}
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
                  <Label htmlFor="anchor-text">{t('editor.anchorTextLabel')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleApplyAnchor} disabled={!editor}>
              {t('common.save')}
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
                <span>{t('editor.ctxAddImage')}</span>
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
                <span>{t('editor.ctxAddVideo')}</span>
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
                <span>{t('editor.ctxAddAudio')}</span>
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
                <span>{t('editor.ctxBold')}</span>
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
                <span>{t('editor.ctxItalic')}</span>
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
                <span>{t('editor.ctxStrikethrough')}</span>
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
                <span>{t('editor.ctxCode')}</span>
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
                <span>{t('editor.ctxInsertLink')}</span>
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
                <span>{t('editor.ctxClearFormat')}</span>
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
